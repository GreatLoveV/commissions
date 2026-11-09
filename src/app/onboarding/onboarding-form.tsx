"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { createProfile } from "./actions";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, action] = useActionState(createProfile, {});

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field
        label="Display name"
        name="displayName"
        defaultValue={state.values?.displayName ?? defaultName}
        errors={state.errors?.displayName}
      />
      <Field
        label="Handle"
        name="handle"
        autoComplete="off"
        hint="Your public page will be at /your-handle. Lowercase letters, numbers and hyphens."
        defaultValue={state.values?.handle}
        errors={state.errors?.handle}
      />
      <FormMessage message={state.message} />
      <SubmitButton>Create profile</SubmitButton>
    </form>
  );
}
