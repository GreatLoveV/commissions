"use client";

import { useFormStatus } from "react-dom";
import { buttonPrimary, inputClass } from "@/components/styles";
import { Spinner } from "@/components/ui/states";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  // brings up the number keyboard on phones for prices and days
  inputMode?: "decimal" | "numeric";
  hint?: string;
  errors?: string[];
};

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
        <p id={`${name}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-danger">
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
  inputMode,
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
        inputMode={inputMode}
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

type SelectProps = Omit<FieldProps, "type" | "autoComplete"> & {
  options: { value: string; label: string }[];
};

export function Select({ label, name, defaultValue, hint, errors, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, errors)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
      aria-busy={pending || undefined}
      className={buttonPrimary}
    >
      {pending && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={ok ? "text-sm text-open" : "text-sm text-danger"}
    >
      {message}
    </p>
  );
}
