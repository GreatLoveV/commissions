"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/form";
import { inputClass } from "@/components/styles";
import type { FormState } from "@/lib/form";

type Props = {
  // sendRequest with the handle and type id already bound
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

const usageOptions = [
  {
    value: "PERSONAL",
    label: "Personal",
    hint: "For yourself or as a gift. Not used to make money.",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    hint: "Used in something sold or promoted: an album, a product, a channel.",
  },
];

export function RequestForm({ action }: Props) {
  const [state, formAction] = useActionState(action, {});
  const values = state.values ?? {};
  const usageErrors = state.errors?.usage;
  const deadlineErrors = state.errors?.deadline;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field
        label="Your name"
        name="clientName"
        autoComplete="name"
        defaultValue={values.clientName}
        errors={state.errors?.clientName}
      />
      <Field
        label="Email"
        name="clientEmail"
        type="email"
        autoComplete="email"
        hint="Only the artist sees it. Updates about your request are sent here."
        defaultValue={values.clientEmail}
        errors={state.errors?.clientEmail}
      />
      <TextArea
        label="What would you like?"
        name="description"
        hint="Subject, mood, colours, pose, size. You can add reference images in the next step."
        defaultValue={values.description}
        errors={state.errors?.description}
      />

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={usageErrors?.length ? "usage-error" : undefined}
      >
        <legend className="text-sm font-medium">How will the artwork be used?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {usageOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-control border-2 border-line-strong bg-sheet p-4 transition-colors duration-150 hover:border-ink has-checked:border-ink has-checked:bg-blueline-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="usage"
                value={option.value}
                defaultChecked={values.usage === option.value}
                className="mt-1 size-4 accent-ink focus-visible:outline-none"
              />
              <span>
                <span className="font-semibold">{option.label}</span>
                <span className="block text-sm text-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {usageErrors?.length ? (
          <p id="usage-error" className="text-sm text-danger">
            {usageErrors.join(". ")}
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="deadline" className="text-sm font-medium">
          Deadline (optional)
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          defaultValue={values.deadline}
          aria-invalid={deadlineErrors?.length ? true : undefined}
          aria-describedby="deadline-hint deadline-error"
          className={`${inputClass} max-w-52`}
        />
        <p id="deadline-hint" className="text-sm text-muted">
          Leave empty if you are not in a hurry.
        </p>
        <p id="deadline-error" className="text-sm text-danger">
          {deadlineErrors?.join(". ")}
        </p>
      </div>

      {/* Honeypot. Hidden from people and screen readers and skipped by
          the keyboard. A bot that fills in every field gives itself away. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <FormMessage ok={state.ok} message={state.message} />
      <div>
        <SubmitButton>Send request</SubmitButton>
      </div>
    </form>
  );
}
