import { v2 as cloudinary } from "cloudinary";
import type { ImageStorage } from "./index";

function client() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export const cloudinaryStorage: ImageStorage = {
  save(folder, bytes) {
    // The SDK takes a stream and a callback, so wrap it in a promise.
    return new Promise((resolve, reject) => {
      const upload = client().uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Cloudinary decodes the file too and rejects anything else
          allowed_formats: ["jpg", "png", "webp"],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Upload failed"));
            return;
          }
          resolve({
            key: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      );
      upload.end(bytes);
    });
  },

  async delete(key) {
    await client().uploader.destroy(key, { resource_type: "image" });
  },

  url(key) {
    // src/lib/image-loader.ts adds the size and format to this url
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${key}`;
  },
};
