import { BRAND, storyInfo, type StoryId } from "./catalog";
import { illustrationPath } from "./illustrations";
import type { SampleBook } from "./story";

export interface TextPlacement {
  left: number;
  width: number;
  center: number;
  maxSize: number;
}

export const storyPlacement: TextPlacement = { left: 29, width: 61, center: 30.5, maxSize: 24 };
export const endpaperPlacement: TextPlacement = { left: 21, width: 68, center: 30.5, maxSize: 24 };

// A few scenes have a foreground object that extends into the usual type area.
const storyPlacements: Partial<Record<StoryId, Record<number, Partial<TextPlacement>>>> = {
  "sock-dragon": {
    1: { left: 36, width: 56 },
    2: { left: 36, width: 56 },
    4: { left: 49, width: 45, center: 28, maxSize: 20 },
    5: { left: 51, width: 43, center: 26, maxSize: 20 },
    8: { left: 42, width: 51, center: 28, maxSize: 22 },
  },
  "moonlight-delivery": {
    1: { left: 35, width: 57 },
    2: { left: 47, width: 47, center: 27, maxSize: 21 },
    4: { left: 39, width: 55, center: 27, maxSize: 22 },
    6: { left: 47, width: 46, center: 27, maxSize: 21 },
  },
  "little-wonders": {
    6: { left: 42, width: 51, center: 28, maxSize: 22 },
  },
};

export type SamplePage =
  | { kind: "cover" | "art"; image: string }
  | { kind: "dedication" | "story" | "back"; image: string; text: string; heading?: string; placement: TextPlacement };

export function sampleEdition(book: SampleBook): SamplePage[][] {
  const art = `/books-art/${book.story}`;
  const endpaper = `${art}/folio-9.jpg`;

  return [
    [{ kind: "cover", image: illustrationPath(book.story, 0) }],
    [
      { kind: "dedication", image: endpaper, text: book.dedication, placement: book.story === "small-parade"
        ? { left: 31, width: 36, center: 20, maxSize: 20 } : endpaperPlacement },
      { kind: "art", image: `${art}/frontispiece.jpg` },
    ],
    ...book.spreads.map((spread, index): SamplePage[] => {
      const beat = index + 1;
      return [
        { kind: "art", image: illustrationPath(book.story, beat) },
        { kind: "story", image: `${art}/folio-${beat}.jpg`, text: spread.text,
          placement: { ...storyPlacement, ...storyPlacements[book.story]?.[beat] } },
      ];
    }),
    [{
      kind: "back",
      image: book.story === "small-parade" ? `${art}/folio-3.jpg` : endpaper,
      heading: BRAND,
      placement: { ...(book.story === "small-parade" ? storyPlacement : endpaperPlacement), maxSize: 21 },
      text: `${storyInfo(book.story)!.hook}\n\nSample edition · featuring a fictional child`,
    }],
  ];
}
