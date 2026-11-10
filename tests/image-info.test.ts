import { describe, expect, it } from "vitest";
import { readImageInfo } from "@/lib/image-info";
import { checkImageUpload, MAX_IMAGE_BYTES } from "@/lib/uploads";
import { pngBytes } from "./helpers";

// Smallest possible headers for each format, built by hand so the tests
// do not need image files in the repo.

function jpegBytes(width: number, height: number) {
  const bytes = new Uint8Array(40);
  const view = new DataView(bytes.buffer);
  bytes.set([0xff, 0xd8]); // start of image
  bytes.set([0xff, 0xe0], 2); // an APP0 segment that has to be skipped
  view.setUint16(4, 16);
  bytes.set([0xff, 0xc0], 20); // start of frame
  view.setUint16(22, 17);
  bytes[24] = 8;
  view.setUint16(25, height);
  view.setUint16(27, width);
  return bytes;
}

function webpBytes(width: number, height: number) {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46]); // "RIFF"
  bytes.set([0x57, 0x45, 0x42, 0x50], 8); // "WEBP"
  bytes.set([0x56, 0x50, 0x38, 0x58], 12); // "VP8X"
  const w = width - 1;
  const h = height - 1;
  bytes.set([w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff], 24);
  bytes.set([h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff], 27);
  return bytes;
}

const text = (value: string) => new TextEncoder().encode(value);

describe("readImageInfo", () => {
  it("reads a png", () => {
    expect(readImageInfo(pngBytes(800, 600))).toEqual({
      mime: "image/png",
      ext: "png",
      width: 800,
      height: 600,
    });
  });

  it("reads a jpeg", () => {
    expect(readImageInfo(jpegBytes(1024, 768))).toMatchObject({
      mime: "image/jpeg",
      width: 1024,
      height: 768,
    });
  });

  it("reads a webp", () => {
    expect(readImageInfo(webpBytes(640, 480))).toMatchObject({
      mime: "image/webp",
      width: 640,
      height: 480,
    });
  });

  it.each([
    ["an empty file", new Uint8Array(0)],
    ["plain text", text("hello, this is definitely not an image at all")],
    ["an svg with a script", text('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')],
    ["html", text("<!doctype html><html><body><script>alert(1)</script></body></html>")],
    ["a gif", text("GIF89a" + "\u0001".repeat(40))],
    ["a png signature with nothing after it", pngBytes(10, 10).slice(0, 8)],
    ["a png with zero width", pngBytes(0, 10)],
    ["a png with a huge size", pngBytes(50000, 50000)],
    ["a jpeg start with no frame", new Uint8Array([0xff, 0xd8, 0xff, 0xd9, 0, 0, 0, 0, 0, 0, 0, 0])],
  ])("rejects %s", (_name, bytes) => {
    expect(readImageInfo(bytes)).toBeNull();
  });
});

describe("checkImageUpload", () => {
  it("accepts a real image whatever its name says", async () => {
    const file = new File([pngBytes(100, 100)], "photo.txt", { type: "text/plain" });
    const result = await checkImageUpload(file);
    expect(result.ok).toBe(true);
  });

  it("rejects a script renamed to .png", async () => {
    const file = new File([text("<script>alert(1)</script>".repeat(4))], "cute.png", {
      type: "image/png",
    });
    expect(await checkImageUpload(file)).toEqual({
      ok: false,
      error: "Use a JPEG, PNG or WebP image.",
    });
  });

  it("rejects a file over the size limit", async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(pngBytes(100, 100));
    const result = await checkImageUpload(new File([big], "big.png"));
    expect(result).toEqual({ ok: false, error: "The image is larger than 4 MB." });
  });

  it("rejects a missing or empty file", async () => {
    expect((await checkImageUpload(null)).ok).toBe(false);
    expect((await checkImageUpload("not a file")).ok).toBe(false);
    expect((await checkImageUpload(new File([], "empty.png"))).ok).toBe(false);
  });
});
