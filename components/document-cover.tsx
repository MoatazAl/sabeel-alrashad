import type { LibraryItem } from "@/data/library-items";
import {
  PublicationCover,
  getPublicationCoverVariant,
} from "@/components/library/publication-cover";

type DocumentCoverProps = {
  item: LibraryItem;
  compact?: boolean;
};

export function DocumentCover({ item, compact = false }: DocumentCoverProps) {
  return (
    <PublicationCover
      title={item.title}
      authorName={item.authorName}
      coverImage={item.coverImage}
      compact={compact}
      variant={getPublicationCoverVariant(item.slug)}
    />
  );
}
