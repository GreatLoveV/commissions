"use client";

import { useFormStatus } from "react-dom";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  hint?: string;
  errors?: string[];
};

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/20 aria-invalid:border-red-600";

// Builds the ids that link an input to its hint and error text,
// so screen readers announce them with the field.
function describedBy(name: string, hint?: string, errors?: string[]) {
  const ids = [];
  if (hint) ids.push(`${name}-hint`);
  if (errors?.length) ids.push(`${name}-error`);
  return ids.length ? ids.join(" ") : undefined;
}

function FieldMessages({
  name,
  hint,
  errors,
}: Pick<FieldProps, "name" | "hint" | "errors">) {
  return (
    <>
      {hint && (
        <p id={`${name}-hint`} className="text-sm text-neutral-600">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-red-700">
          {errors.join(". ")}
        </p>
      ) : null}
    </>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  autoComplete,
  hint,
  errors,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        className={inputClass}
      />
      <FieldMessages name={name} hint={hint} errors={errors} />
    </div>
  );
}

export function TextArea({ label, name, defaultValue, hint, errors }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        defaultValue={defaultValue}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        className={inputClass}
      />
      <FieldMessages name={name} hint={hint} errors={errors} />
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={ok ? "text-sm text-green-800" : "text-sm text-red-700"}
    >
      {message}
    </p>
  );
}
