"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/form";
import { fileInputClass } from "@/components/styles";
import { uploadReference } from "./actions";

export function ReferenceForm({ token }: { token: string }) {
  const [state, action] = useActionState(uploadReference.bind(null, token), {});
  const errors = state.errors?.image;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-medium">
          Reference image
        </label>
        <input
          id="image"
          name="image"
          type="file"
          // only a hint for the file picker, the server checks the real content
          accept="image/jpeg,image/png,image/webp"
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby="image-hint image-error"
          className={fileInputClass}
        />
        <p id="image-hint" className="text-sm text-muted">
          One image at a time. JPEG, PNG or WebP, up to 4 MB.
        </p>
        <p id="image-error" className="text-sm text-danger">
          {errors?.join(". ")}
        </p>
      </div>
      <FormMessage ok={state.ok} message={state.message} />
      <div>
        <SubmitButton>Add image</SubmitButton>
      </div>
    </form>
  );
}
