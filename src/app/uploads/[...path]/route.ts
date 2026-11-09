import { usesCloudinary } from "@/lib/storage";
import { readLocalFile } from "@/lib/storage/local";

// Serves images saved by the local development storage.
// With Cloudinary configured, images come from Cloudinary and this
// route answers 404.

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: RouteContext<"/uploads/[...path]">,
) {
  if (usesCloudinary() || process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const { path } = await params;
  const key = path.join("/");
  const file = await readLocalFile(key);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const ext = key.split(".").pop() ?? "";
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext],
      // the browser must not guess a different type than the one we send
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
