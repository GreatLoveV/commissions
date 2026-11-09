// Tells next/image how to ask for an image at a given width.
// Cloudinary resizes and picks the best format when the options are put
// in the url, so Next.js does not have to do that work itself.

type LoaderArgs = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality }: LoaderArgs) {
  const marker = "/image/upload/";
  if (src.startsWith("https://res.cloudinary.com/") && src.includes(marker)) {
    const options = `f_auto,q_${quality ?? "auto"},w_${width}`;
    return src.replace(marker, `${marker}${options}/`);
  }
  // local development files are served at their original size
  return `${src}?w=${width}`;
}
