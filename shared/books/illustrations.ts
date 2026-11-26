import type { StoryId } from "./catalog";

export function illustrationPath(story: StoryId, page: number) {
  return `/books-art/${story}/${page === 0 ? "cover" : `spread-${page}`}.jpg`;
}

const darkCovers = new Set<StoryId>(["snow-globe", "moonlight-delivery"]);

export function coverUsesLightTitle(story: StoryId) {
  return darkCovers.has(story);
}
