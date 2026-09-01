#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[1]
CONFIG = REPO / "automation" / "courses.json"
STATE = REPO / ".automation-state.json"
AUDIO_EXTENSIONS = {".m4a", ".aac", ".mp3"}
DIGIT_MAP = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


class PublishError(RuntimeError):
    pass


def run(command: list[str], *, check: bool = True, show: bool = False):
    result = subprocess.run(
        command,
        cwd=REPO,
        text=True,
        capture_output=not show,
    )
    if check and result.returncode:
        output = "\n".join(x for x in (result.stdout, result.stderr) if x)
        raise PublishError(f"Command failed: {' '.join(command)}\n{output}")
    return result


def read_json(path: Path, default=None):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize(value: str) -> str:
    return unicodedata.normalize("NFKC", value).translate(DIGIT_MAP)


def parse_audio_name(name: str) -> dict[str, Any] | None:
    suffix = Path(name).suffix.lower()
    if suffix not in AUDIO_EXTENSIONS:
        return None

    stem = normalize(Path(name).stem).strip()

    # Preferred format:
    # GLOBAL_NUMBER__LESSON_IN_SECTION__SECTION
    # Example: 151__01__كتاب الصلح.m4a
    match = re.fullmatch(r"(\d+)__(\d+)__(.+)", stem)
    if match:
        return {
            "number": int(match.group(1)),
            "section_lesson": int(match.group(2)),
            "section": match.group(3).strip(),
            "extension": suffix,
        }

    # Also keep support for the older order:
    # GLOBAL_NUMBER__SECTION__LESSON_IN_SECTION
    match = re.fullmatch(r"(\d+)__(.+?)__(\d+)", stem)
    if match:
        return {
            "number": int(match.group(1)),
            "section": match.group(2).strip(),
            "section_lesson": int(match.group(3)),
            "extension": suffix,
        }

    match = re.fullmatch(r"(\d+)__(.+)", stem)
    if match:
        return {
            "number": int(match.group(1)),
            "title": match.group(2).strip(),
            "extension": suffix,
        }

    match = re.match(r"^(\d+)", stem)
    if match:
        return {"number": int(match.group(1)), "extension": suffix}

    numbers = [int(number) for number in re.findall(r"\d+", stem)]
    if numbers and len(set(numbers)) == 1:
        return {"number": numbers[0], "extension": suffix}

    return None


def list_drive_files(path: str) -> list[dict[str, Any]]:
    result = run(["rclone", "lsjson", path, "--files-only"])
    return json.loads(result.stdout or "[]")


def remote_stat(path: str) -> dict[str, Any] | None:
    """
    Return the exact R2 object metadata, or None when it does not exist.

    Listing the parent directory is more reliable than using
    `lsjson --stat` on an S3/R2 object path, which may represent a missing
    object as an empty directory.
    """
    if "/" not in path:
        raise PublishError(f"Invalid R2 object path: {path}")

    parent, filename = path.rsplit("/", 1)

    result = run(
        [
            "rclone",
            "lsjson",
            parent,
            "--files-only",
            "--s3-no-check-bucket",
        ],
        check=False,
    )

    if result.returncode != 0:
        return None

    try:
        objects = json.loads(result.stdout or "[]")
    except json.JSONDecodeError as error:
        raise PublishError(
            f"Invalid R2 listing response for {parent}: {error}"
        ) from error

    if not isinstance(objects, list):
        return None

    for item in objects:
        object_name = item.get("Name") or item.get("Path")
        if object_name == filename:
            return item

    return None


def find_audio(files, lesson_number: int):
    matches = []
    for item in files:
        name = item.get("Name") or item.get("Path") or ""
        parsed = parse_audio_name(name)
        if parsed and parsed["number"] == lesson_number:
            matches.append((item, parsed))

    if not matches:
        raise PublishError(f"No audio file found for lesson {lesson_number}")
    if len(matches) > 1:
        names = ", ".join(item.get("Name", "") for item, _ in matches)
        raise PublishError(f"Multiple audio files match lesson {lesson_number}: {names}")
    return matches[0]


def find_poster(files, lesson_number: int):
    for item in files:
        name = item.get("Name") or item.get("Path") or ""
        if Path(name).suffix.lower() != ".png":
            continue
        match = re.match(r"^(\d+)", normalize(Path(name).stem))
        if match and int(match.group(1)) == lesson_number:
            return item
    return None


def bukhari_count(path: Path) -> int:
    match = re.search(r"const\s+LESSON_COUNT\s*=\s*(\d+)\s*;", path.read_text(encoding="utf-8"))
    if not match:
        raise PublishError("LESSON_COUNT was not found")
    return int(match.group(1))


def update_bukhari_count(path: Path, number: int, extension: str) -> None:
    text = path.read_text(encoding="utf-8")
    current = bukhari_count(path)
    if number != current + 1:
        raise PublishError(f"Expected lesson {current + 1}, received {number}")

    text = re.sub(
        r"const\s+LESSON_COUNT\s*=\s*\d+\s*;",
        f"const LESSON_COUNT = {number};",
        text,
        count=1,
    )

    if extension == ".aac":
        match = re.search(r"const AAC_LESSONS = new Set\(\[([^\]]*)\]\);", text)
        if not match:
            raise PublishError("AAC_LESSONS was not found")
        values = {int(value) for value in re.findall(r"\d+", match.group(1))}
        values.add(number)
        replacement = "const AAC_LESSONS = new Set([" + ", ".join(map(str, sorted(values))) + "]);"
        text = text[:match.start()] + replacement + text[match.end():]

    if extension == ".mp3":
        raise PublishError("Bukhari currently supports new M4A/AAC lessons, not MP3")

    path.write_text(text, encoding="utf-8")


def section_plan(sections, number: int, title: str) -> str:
    if any(section["start"] <= number <= section["end"] for section in sections):
        raise PublishError(f"Lesson {number} is already mapped to a section")
    previous = max(sections, key=lambda section: section["end"])
    if number != previous["end"] + 1:
        raise PublishError(f"Section mapping ends at {previous['end']}; cannot add {number}")
    if previous["titles"] == [title]:
        return f'extend "{title}" from {previous["start"]}-{previous["end"]} to {previous["start"]}-{number}'
    return f'add "{title}" starting at {number}'


def update_sections(path: Path, number: int, title: str) -> None:
    sections = read_json(path, [])
    section_plan(sections, number, title)
    previous = max(sections, key=lambda section: section["end"])
    if previous["titles"] == [title]:
        previous["end"] = number
    else:
        sections.append({"start": number, "end": number, "titles": [title]})
    write_json(path, sections)


def update_library(course, lesson_number: int | None, public_url: str | None, poster_url: str | None):
    payload = {
        "slug": course["course_slug"],
        "slugReference": course.get("library_slug_reference"),
        "libraryFile": course.get("library_file", "data/library.ts"),
        "updatedAt": dt.date.today().isoformat(),
    }
    if lesson_number is not None:
        payload["lesson"] = {
            "id": f'{course["lesson_id_prefix"]}-{lesson_number}',
            "number": lesson_number,
            "title": f"الدرس {lesson_number}",
            "audioUrl": public_url,
            "image": poster_url,
        }

    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False)
        payload_path = Path(handle.name)
    try:
        run(["node", "automation/update-library.mjs", str(payload_path)])
    finally:
        payload_path.unlink(missing_ok=True)


def publish(config, course_key: str, lesson_number: int, dry_run: bool) -> None:
    course = config["courses"].get(course_key)
    if not course or not course.get("enabled"):
        raise PublishError(f"Unknown or disabled course: {course_key}")

    drive_path = f'{config["drive_root"]}/{course["drive_folder"]}'
    files = list_drive_files(drive_path)
    source, parsed = find_audio(files, lesson_number)
    source_name = source.get("Name") or source.get("Path")
    extension = parsed["extension"]
    file_number = str(lesson_number).zfill(3)
    source_path = f"{drive_path}/{source_name}"
    r2_audio_key = f'{course["r2_prefix"]}/{file_number}{extension}'
    r2_audio_path = (
        f'{config["r2_remote"]}:{config["r2_bucket"]}/{r2_audio_key}'
    )
    audio_public_url = (
        f'{config["public_media_base_url"]}/{r2_audio_key}'
    )

    r2_mp4_key = f'{course["r2_prefix"]}/{file_number}.mp4'
    r2_mp4_path = (
        f'{config["r2_remote"]}:{config["r2_bucket"]}/{r2_mp4_key}'
    )
    mp4_public_url = (
        f'{config["public_media_base_url"]}/{r2_mp4_key}'
    )

    poster_path = REPO / course["poster_dir"] / f"{file_number}.png"

    existing_r2 = remote_stat(r2_audio_path)
    reuse_existing_r2 = existing_r2 is not None

    if reuse_existing_r2:
        source_size = source.get("Size")
        r2_size = existing_r2.get("Size")

        if (
            source_size is None
            or r2_size is None
            or int(source_size) != int(r2_size)
        ):
            raise PublishError(
                "R2 object already exists but its size does not match "
                f"the Drive source: Drive={source_size}, "
                f"R2={r2_size}, path={r2_audio_path}"
            )

    section = None
    plan = None
    current_count = None
    drive_poster = None
    poster_url = None

    if course["kind"] == "generated-sections":
        current_count = bukhari_count(REPO / course["data_file"])
        if lesson_number != current_count + 1:
            raise PublishError(f"Expected Bukhari lesson {current_count + 1}")
        section = parsed.get("section") or course.get("section_overrides", {}).get(str(lesson_number))
        if not section:
            raise PublishError("The Bukhari section is missing from the filename and registry")
        plan = section_plan(read_json(REPO / course["sections_file"], []), lesson_number, section)
    else:
        drive_poster = find_poster(files, lesson_number)
        if not drive_poster and not poster_path.exists():
            raise PublishError(
                f"Poster {file_number}.png is missing. Add it to the Buyu Drive folder or {poster_path.relative_to(REPO)}"
            )
        poster_url = f'{course["poster_url_prefix"]}/{file_number}.png'

    print("\n=== SABEEL PUBLISHER PLAN ===")
    print(f"Mode:              {'DRY RUN' if dry_run else 'PUBLISH'}")
    print(f"Course:            {course_key}")
    print(f"Drive source:      {source_path}")
    print(f"Drive file ID:     {source.get('ID', 'not returned')}")
    print(f"Lesson:            {lesson_number}")
    if parsed.get("section_lesson") is not None:
        print(f"Section lesson:    {parsed['section_lesson']}")
    if section:
        print(f"Section:           {section}")
        print(f"Section change:    {plan}")
    if current_count is not None:
        print(f"Lesson count:      {current_count} -> {lesson_number}")
    print(f"Temporary audio:   {r2_audio_path}")
    print(f"Final MP4:         {r2_mp4_path}")
    print(f"Public URL:        {mp4_public_url}")
    print(f"Poster:            {poster_path.relative_to(REPO)}")
    print(
        "R2 status:         "
        + (
            "already uploaded; size matches Drive"
            if reuse_existing_r2
            else "ready to upload"
        )
    )
    print("Local audio copy:  no")

    if dry_run:
        print("\nDry run complete. Nothing was uploaded or modified.")
        return

    if reuse_existing_r2:
        print(
            "\nR2 object already matches the Drive source; "
            "skipping audio upload."
        )
    else:
        run([
            "rclone", "copyto", source_path, r2_audio_path,
            "--s3-no-check-bucket", "--progress",
        ], show=True)

    if not remote_stat(r2_audio_path):
        raise PublishError(
            "Temporary R2 audio verification failed after upload"
        )

    if course["kind"] == "generated-sections":
        update_sections(REPO / course["sections_file"], lesson_number, section)
        update_bukhari_count(REPO / course["data_file"], lesson_number, extension)
        run(["npm", "run", "generate:sahih-posters"], show=True)
        update_library(course, None, None, None)
    else:
        if drive_poster:
            poster_path.parent.mkdir(parents=True, exist_ok=True)
            run([
                "rclone", "copyto",
                f"{drive_path}/{drive_poster.get('Name')}",
                str(poster_path), "--progress",
            ], show=True)
        update_library(course, lesson_number, mp4_public_url, poster_url)

    # Build the iPhone-native fullscreen video for every new audio lesson.
    run(
        [
            sys.executable,
            "automation/fullscreen_videos.py",
            "--publish",
            "--course",
            course_key,
            "--lesson",
            str(lesson_number),
        ],
        show=True,
    )

    # The MP4 is now the permanent production media object.
    if not remote_stat(r2_mp4_path):
        raise PublishError(
            f"MP4 verification failed after conversion: {r2_mp4_path}"
        )

    response = run(
        ["curl", "-fsSI", mp4_public_url],
        check=False,
    )
    if response.returncode:
        raise PublishError(
            f"Public MP4 URL failed: {mp4_public_url}"
        )

    # Once the MP4 is safely present and publicly reachable,
    # remove the temporary duplicate audio from R2.
    run(
        [
            "rclone",
            "deletefile",
            r2_audio_path,
            "--s3-no-check-bucket",
        ],
        show=True,
    )

    if remote_stat(r2_audio_path):
        raise PublishError(
            f"Temporary R2 audio still exists after deletion: "
            f"{r2_audio_path}"
        )

    run(["npm", "run", "typecheck"], show=True)
    run(["npm", "run", "build"], show=True)

    state = read_json(STATE, {"published": []})
    state.setdefault("published", []).append({
        "driveFileId": source.get("ID"),
        "course": course_key,
        "lessonNumber": lesson_number,
        "sourceFilename": source_name,
        "r2ObjectKey": r2_mp4_key,
        "publishedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "status": "published",
    })
    write_json(STATE, state)

    print("\n=== LOCAL CHANGES ===")
    run(["git", "status", "--short"], show=True)
    run(["git", "diff", "--stat"], show=True)
    print("\nPublished and validated. Nothing was committed or pushed.")


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--publish", action="store_true")
    parser.add_argument("--course", required=True)
    parser.add_argument("--lesson", required=True, type=int)
    args = parser.parse_args()

    try:
        publish(read_json(CONFIG), args.course, args.lesson, args.dry_run)
        return 0
    except (PublishError, FileNotFoundError, json.JSONDecodeError) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
