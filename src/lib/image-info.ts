// Works out what an uploaded file really is by reading its first bytes.
// The file name and the Content-Type header come from the uploader and
// can say anything, so they are never trusted.
//
// Only JPEG, PNG and WebP are accepted. SVG is left out on purpose: it is
// a text format that can carry scripts.

export type ImageInfo = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
  width: number;
  height: number;
};

const MAX_DIMENSION = 12000;

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function readPng(bytes: Uint8Array, view: DataView) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24) return null;
  if (!signature.every((byte, i) => bytes[i] === byte)) return null;
  // the first chunk is always IHDR and starts with width and height
  if (ascii(bytes, 12, 4) !== "IHDR") return null;
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function readJpeg(bytes: Uint8Array, view: DataView) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  // A JPEG is a list of segments: FF, a marker byte, then a 2 byte length.
  // The size lives in the "start of frame" segment, so walk until we find it.
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1; // padding byte
      continue;
    }
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }
    // image data starts here, no frame header was found
    if (marker === 0xda || marker === 0xd9) return null;
    offset += 2 + view.getUint16(offset + 2);
  }
  return null;
}

function readWebp(bytes: Uint8Array, view: DataView) {
  if (bytes.length < 30) return null;
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") return null;

  // WebP has three variants, each stores the size differently
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8 ") {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f) return null;
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { width, height };
  }
  return null;
}

export function readImageInfo(bytes: Uint8Array): ImageInfo | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const formats = [
    { mime: "image/png", ext: "png", read: readPng },
    { mime: "image/jpeg", ext: "jpg", read: readJpeg },
    { mime: "image/webp", ext: "webp", read: readWebp },
  ] as const;

  for (const format of formats) {
    const size = format.read(bytes, view);
    if (!size) continue;
    const valid =
      size.width >= 1 &&
      size.height >= 1 &&
      size.width <= MAX_DIMENSION &&
      size.height <= MAX_DIMENSION;
    return valid ? { mime: format.mime, ext: format.ext, ...size } : null;
  }
  return null;
}
