"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/form";
import type { FormState } from "@/lib/form";

type Props = {
  // createType, or updateType with the id already bound
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  currency: string;
  submitLabel: string;
  initial?: Record<string, string>;
};

export function TypeForm({ action, currency, submitLabel, initial }: Props) {
  const [state, formAction] = useActionState(action, {});
  const values = state.values ?? initial ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field
        label="Name"
        name="name"
        hint="For example: Portrait, Album cover, Character design."
        defaultValue={values.name}
        errors={state.errors?.name}
      />
      <TextArea
        label="Description"
        name="description"
        hint="What the client gets. Up to 500 characters."
        defaultValue={values.description}
        errors={state.errors?.description}
      />
      <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label={`Base price (${currency})`}
        name="basePrice"
        hint="Shown as a starting price. You set the final price per request."
        defaultValue={values.basePrice}
        errors={state.errors?.basePrice}
      />
      <Field
        label="Turnaround in days"
        name="turnaroundDays"
        defaultValue={values.turnaroundDays}
        errors={state.errors?.turnaroundDays}
      />
      </div>
      <FormMessage message={state.message} />
      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
