export interface LifestylePhoto {
  placement: "shared-reading" | "reading-with-dog";
  src: string;
  alt: string;
  width: number;
  height: number;
  source: string;
  assetId: string;
  licence: string;
  modelRelease: "verified" | "not needed" | "unverified";
  approved: boolean;
}

export const LIFESTYLE_PHOTOS: LifestylePhoto[] = [
  {
    placement: "shared-reading",
    src: "/books-art/shared-reading.webp",
    alt: "A child and an adult sharing a picture book on the sofa",
    width: 880,
    height: 495,
    source: "https://www.pexels.com/photo/child-sitting-beside-mom-holding-book-7295860/",
    assetId: "7295860",
    licence: "Pexels License",
    modelRelease: "not needed",
    approved: true,
  },
  {
    placement: "reading-with-dog",
    src: "/books-art/reading-with-dog.webp",
    alt: "A child holding an open book with a fluffy white dog curled up on their lap",
    width: 888,
    height: 716,
    source: "https://www.pexels.com/photo/photo-of-a-kid-reading-a-book-with-his-dog-9428892/",
    assetId: "9428892",
    licence: "Pexels License",
    modelRelease: "not needed",
    approved: true,
  },
];
