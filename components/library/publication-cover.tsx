import Image from "next/image";

const publicationCoverThemes = [
  {
    background: "#2a2119",
    foreground: "#fff7e8",
    muted: "#d8c6a7",
    accent: "#c6922e",
  },
  {
    background: "#063f32",
    foreground: "#f6f0df",
    muted: "#c9d7c7",
    accent: "#d2a44a",
  },
  {
    background: "#123f43",
    foreground: "#f7f3e7",
    muted: "#c8d8d5",
    accent: "#c7a35a",
  },
  {
    background: "#242424",
    foreground: "#faf4e6",
    muted: "#d4c8b7",
    accent: "#b99a5b",
  },
  {
    background: "#3b412c",
    foreground: "#fff8e7",
    muted: "#d9d5bd",
    accent: "#d0a046",
  },
] as const;

export type PublicationCoverVariant = number;

type PublicationCoverProps = {
  title: string;
  authorName: string;
  coverImage?: string;
  compact?: boolean;
  variant?: PublicationCoverVariant;
  className?: string;
};

function getSeedValue(seed: string) {
  return Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );
}

export function getPublicationCoverVariant(seed: string): PublicationCoverVariant {
  return getSeedValue(seed) % publicationCoverThemes.length;
}

export function PublicationCover({
  title,
  authorName,
  coverImage,
  compact = false,
  variant = 0,
  className = "",
}: PublicationCoverProps) {
  const theme =
    publicationCoverThemes[Math.abs(variant) % publicationCoverThemes.length] ??
    publicationCoverThemes[0];

  if (coverImage) {
    return (
      <div
        className={[
          "relative overflow-hidden rounded-md border border-[#d8c59d] bg-stone-950",
          compact ? "aspect-[4/3] min-h-40" : "aspect-[3/4] min-h-72",
          className,
        ].join(" ")}
      >
        <Image src={coverImage} alt={title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={[
        "relative flex overflow-hidden rounded-md border p-5 text-center shadow-inner",
        compact ? "aspect-[4/3] min-h-40" : "aspect-[3/4] min-h-72",
        className,
      ].join(" ")}
      style={{
        backgroundColor: theme.background,
        borderColor: "rgba(255, 248, 231, 0.18)",
        color: theme.foreground,
      }}
    >
      <div className="flex min-h-full w-full flex-col items-center justify-between">
        <div className="w-full">
          <div
            className="mx-auto h-px w-3/4"
            style={{ backgroundColor: theme.accent }}
          />
          <div
            className="mx-auto mt-2 h-px w-1/2"
            style={{ backgroundColor: "rgba(255, 248, 231, 0.32)" }}
          />
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center py-8">
          <h3
            className={[
              "mx-auto max-w-[15rem] font-bold leading-[1.8]",
              compact ? "text-xl" : "text-2xl",
            ].join(" ")}
          >
            {title}
          </h3>
          <p
            className="mx-auto mt-6 max-w-[13rem] text-sm font-semibold leading-7"
            style={{ color: theme.muted }}
          >
            {authorName}
          </p>
        </div>

        <div className="w-full">
          <div
            className="mx-auto h-px w-1/2"
            style={{ backgroundColor: "rgba(255, 248, 231, 0.32)" }}
          />
          <div
            className="mx-auto mt-2 h-px w-3/4"
            style={{ backgroundColor: theme.accent }}
          />
        </div>
      </div>
    </div>
  );
}
