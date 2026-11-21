/**
 * Layout placeholders for the review cards. Local development only:
 * BooksPage loads this file inside an `import.meta.env.DEV` branch, so it is
 * never part of the production build. Never move these into reviews.ts.
 */
import type { Review } from "./reviews";

export const PLACEHOLDER_REVIEWS: Review[] = [
  { quote: "DESIGN PLACEHOLDER: short quote about reading it at bedtime.", name: "Placeholder name" },
  { quote: "DESIGN PLACEHOLDER: short quote about the dedication page.", name: "Placeholder name" },
  { quote: "DESIGN PLACEHOLDER: short quote from a gifted sample copy.", name: "Placeholder name", gifted: true },
];
