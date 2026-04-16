export type Sheikh = {
  slug: string;
  name: string;
  bio: string;
};

export type Series = {
  slug: string;
  sheikhSlug: string;
  title: string;
  description: string;
  playlistUrl: string;
  sourceLabel?: string;
};
