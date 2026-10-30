import { type CollectionEntry } from "astro:content";

type AlbumEntry = CollectionEntry<"albums">;
export type Album = AlbumEntry["data"] & {
  slug: string;
  description: string;
  title: string;
  cover: {
    formats: {
      thumbnail: { url: string; }
    }
  }
};
