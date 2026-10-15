export interface GalleryPhoto {
  src: string
  ratio: number
}

export const DEFAULT_GALLERY: GalleryPhoto[] = [
  { src: "/gallery/1.png", ratio: 795 / 463 },
  { src: "/gallery/2.png", ratio: 782 / 459 },
  { src: "/gallery/3.png", ratio: 756 / 461 },
  { src: "/gallery/4.png", ratio: 757 / 461 },
  { src: "/gallery/5.png", ratio: 862 / 1252 },
]

export function defaultPhotoRatio(src: string): number | undefined {
  return DEFAULT_GALLERY.find((photo) => photo.src === src)?.ratio
}
