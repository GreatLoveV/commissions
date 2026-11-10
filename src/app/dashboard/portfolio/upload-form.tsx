"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { fileInputClass } from "@/components/styles";
import { uploadPortfolioImage } from "./actions";

export function UploadForm() {
  const [state, action] = useActionState(uploadPortfolioImage, {});
  const imageErrors = state.errors?.image;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-medium">
          Image
        </label>
        <input
          id="image"
          name="image"
          type="file"
          // only a hint for the file picker, the server checks the real content
          accept="image/jpeg,image/png,image/webp"
          aria-invalid={imageErrors?.length ? true : undefined}
          aria-describedby="image-hint image-error"
          className={fileInputClass}
        />
        <p id="image-hint" className="text-sm text-muted">
          JPEG, PNG or WebP, up to 4 MB.
        </p>
        <p id="image-error" className="text-sm text-danger">
          {imageErrors?.join(". ")}
        </p>
      </div>
      <Field
        label="Description of the image"
        name="alt"
        hint="Read aloud by screen readers. For example: Portrait of a red-haired elf."
        defaultValue={state.values?.alt}
        errors={state.errors?.alt}
      />
      <FormMessage ok={state.ok} message={state.message} />
      <div>
        <SubmitButton>Add to portfolio</SubmitButton>
      </div>
    </form>
  );
}
