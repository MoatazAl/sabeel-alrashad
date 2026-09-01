#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[1]
CONFIG = REPO / "automation" / "fullscreen-video-courses.json"
WORK_ROOT = REPO / ".automation-work" / "fullscreen-videos"
AUDIO_EXTENSIONS = (".m4a", ".aac", ".mp3")


class FullscreenVideoError(RuntimeError):
    pass


def run(
    command: list[str],
    *,
    check: bool = True,
    show: bool = False,
) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        cwd=REPO,
        text=True,
        capture_output=not show,
    )

    if check and result.returncode:
        output = "\n".join(
            value
            for value in (result.stdout, result.stderr)
            if value
        )
        raise FullscreenVideoError(
            f"Command failed: {' '.join(command)}\n{output}"
        )

    return result


def read_config() -> dict[str, Any]:
    return json.loads(CONFIG.read_text(encoding="utf-8"))


def r2_directory(config: dict[str, Any], course: dict[str, Any]) -> str:
    return (
        f'{config["r2_remote"]}:{config["r2_bucket"]}/'
        f'{course["r2_prefix"]}'
    )


def list_r2_names(
    config: dict[str, Any],
    course: dict[str, Any],
) -> set[str]:
    result = run(
        [
            "rclone",
            "lsjson",
            r2_directory(config, course),
            "--files-only",
            "--s3-no-check-bucket",
        ]
    )

    objects = json.loads(result.stdout or "[]")
    names: set[str] = set()

    for item in objects:
        name = item.get("Name") or item.get("Path")
        if name:
            names.add(Path(name).name)

    return names


def find_audio_name(names: set[str], lesson_number: int) -> str:
    file_number = str(lesson_number).zfill(3)

    matches = [
        f"{file_number}{extension}"
        for extension in AUDIO_EXTENSIONS
        if f"{file_number}{extension}" in names
    ]

    if not matches:
        raise FullscreenVideoError(
            f"No R2 audio found for lesson {lesson_number}"
        )

    if len(matches) > 1:
        raise FullscreenVideoError(
            f"Multiple R2 audio files found for lesson "
            f"{lesson_number}: {', '.join(matches)}"
        )

    return matches[0]


def remote_file_exists(path: str) -> bool:
    result = run(
        [
            "rclone",
            "size",
            path,
            "--json",
            "--s3-no-check-bucket",
        ],
        check=False,
    )

    if result.returncode:
        return False

    try:
        payload = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        return False

    return (
        int(payload.get("count", 0)) == 1
        and int(payload.get("bytes", 0)) > 0
    )


def audio_codec(path: Path) -> str:
    result = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=codec_name",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ]
    )

    codec = result.stdout.strip()

    if not codec:
        raise FullscreenVideoError(
            f"Could not determine audio codec for {path.name}"
        )

    return codec


def build_video(
    poster: Path,
    audio: Path,
    output: Path,
) -> None:
    codec = audio_codec(audio)

    # M4A/AAC can usually be copied directly.
    # Raw AAC and MP3 are normalized to AAC for maximum iPhone compatibility.
    if codec == "aac" and audio.suffix.lower() == ".m4a":
        audio_args = ["-c:a", "copy"]
    else:
        audio_args = [
            "-c:a",
            "aac",
            "-b:a",
            "128k",
        ]

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-loop",
        "1",
        "-framerate",
        "1",
        "-i",
        str(poster),
        "-i",
        str(audio),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-vf",
        (
            "scale=1280:720:force_original_aspect_ratio=decrease,"
            "pad=1280:720:(ow-iw)/2:(oh-ih)/2:black"
        ),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-tune",
        "stillimage",
        "-crf",
        "32",
        "-profile:v",
        "main",
        "-level",
        "3.1",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "1",
        *audio_args,
        "-shortest",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        str(output),
    ]

    run(command)


def build_one(
    config: dict[str, Any],
    course_key: str,
    course: dict[str, Any],
    lesson_number: int,
    *,
    dry_run: bool,
    force: bool,
    known_names: set[str] | None = None,
) -> str:
    if lesson_number < int(course["start"]):
        raise FullscreenVideoError(
            f"{course_key}: lesson {lesson_number} is below "
            f'the configured start {course["start"]}'
        )

    names = (
        known_names
        if known_names is not None
        else list_r2_names(config, course)
    )

    audio_name = find_audio_name(names, lesson_number)
    file_number = str(lesson_number).zfill(3)
    mp4_name = f"{file_number}.mp4"

    poster = REPO / course["poster_dir"] / f"{file_number}.png"

    if not poster.exists():
        raise FullscreenVideoError(
            f"Missing poster: {poster.relative_to(REPO)}"
        )

    remote_dir = r2_directory(config, course)
    audio_remote = f"{remote_dir}/{audio_name}"
    mp4_remote = f"{remote_dir}/{mp4_name}"

    if mp4_name in names and not force:
        print(
            f"[SKIP] {course_key} {lesson_number}: "
            f"{mp4_name} already exists"
        )
        return "skipped"

    if dry_run:
        action = "REBUILD" if mp4_name in names else "CREATE"
        print(
            f"[{action}] {course_key} {lesson_number}: "
            f"{audio_name} + {poster.relative_to(REPO)} -> {mp4_name}"
        )
        return "ready"

    WORK_ROOT.mkdir(parents=True, exist_ok=True)

    print(
        f"[BUILD] {course_key} {lesson_number}: "
        f"{audio_name} -> {mp4_name}"
    )

    with tempfile.TemporaryDirectory(
        prefix=f"{course_key}-{file_number}-",
        dir=WORK_ROOT,
    ) as temporary_directory:
        temporary = Path(temporary_directory)
        local_audio = temporary / audio_name
        local_video = temporary / mp4_name

        run(
            [
                "rclone",
                "copyto",
                audio_remote,
                str(local_audio),
                "--s3-no-check-bucket",
            ]
        )

        build_video(
            poster=poster,
            audio=local_audio,
            output=local_video,
        )

        if not local_video.exists() or local_video.stat().st_size <= 0:
            raise FullscreenVideoError(
                f"FFmpeg produced an invalid file for "
                f"{course_key} lesson {lesson_number}"
            )

        run(
            [
                "rclone",
                "copyto",
                str(local_video),
                mp4_remote,
                "--s3-no-check-bucket",
            ]
        )

    if not remote_file_exists(mp4_remote):
        raise FullscreenVideoError(
            f"R2 verification failed: {mp4_remote}"
        )

    names.add(mp4_name)

    print(
        f"[DONE] {course_key} {lesson_number}: {mp4_remote}"
    )

    return "created"


def process_course(
    config: dict[str, Any],
    course_key: str,
    course: dict[str, Any],
    numbers: list[int],
    *,
    dry_run: bool,
    force: bool,
) -> tuple[int, int]:
    names = list_r2_names(config, course)

    created_or_ready = 0
    skipped = 0

    for lesson_number in numbers:
        result = build_one(
            config,
            course_key,
            course,
            lesson_number,
            dry_run=dry_run,
            force=force,
            known_names=names,
        )

        if result == "skipped":
            skipped += 1
        else:
            created_or_ready += 1

    return created_or_ready, skipped


def main() -> int:
    parser = argparse.ArgumentParser()

    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--publish", action="store_true")

    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--all", action="store_true")
    target.add_argument("--course")

    parser.add_argument("--lesson", type=int)
    parser.add_argument("--force", action="store_true")

    args = parser.parse_args()

    config = read_config()
    courses = config["courses"]

    if args.lesson is not None and not args.course:
        parser.error("--lesson requires --course")

    try:
        total = 0
        skipped = 0

        if args.all:
            for course_key, course in courses.items():
                start = int(course["start"])
                end = int(course["backfill_end"])

                ready, existing = process_course(
                    config,
                    course_key,
                    course,
                    list(range(start, end + 1)),
                    dry_run=args.dry_run,
                    force=args.force,
                )

                total += ready
                skipped += existing
        else:
            course_key = args.course

            if course_key not in courses:
                raise FullscreenVideoError(
                    f"Unknown fullscreen-video course: {course_key}"
                )

            course = courses[course_key]

            if args.lesson is not None:
                numbers = [args.lesson]
            else:
                numbers = list(
                    range(
                        int(course["start"]),
                        int(course["backfill_end"]) + 1,
                    )
                )

            ready, existing = process_course(
                config,
                course_key,
                course,
                numbers,
                dry_run=args.dry_run,
                force=args.force,
            )

            total += ready
            skipped += existing

        print("\n=== FULLSCREEN VIDEO SUMMARY ===")
        print(
            f"{'Ready' if args.dry_run else 'Created'}: {total}"
        )
        print(f"Already existed: {skipped}")

        return 0

    except (
        FullscreenVideoError,
        FileNotFoundError,
        json.JSONDecodeError,
    ) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
