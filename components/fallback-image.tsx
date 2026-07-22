"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type FallbackImageProps = Omit<ImageProps, "src" | "onError"> & {
  sources: string[];
};

export function FallbackImage({
  sources,
  alt,
  ...props
}: FallbackImageProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const source = sources.find((candidate) => !failedSources.includes(candidate));

  if (!source) return null;

  return (
    <Image
      {...props}
      key={source}
      src={source}
      alt={alt}
      onError={() =>
        setFailedSources((current) =>
          current.includes(source) ? current : [...current, source]
        )
      }
    />
  );
}
