/**
 * Real customer feedback for Little Plot Books.
 *
 * Leave this empty until there is approved feedback. While it is empty the
 * live page shows the "Little details that make it theirs" cards instead.
 * Add only real quotes, with the display name the person approved. Mark
 * feedback on a free sample copy with `gifted: true` so it is labelled.
 */
export type Review = { quote: string; name: string; gifted?: boolean };

export const REVIEWS: Review[] = [];
