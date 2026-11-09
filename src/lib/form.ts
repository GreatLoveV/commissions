// Shape returned by server actions that back a form.
export type FormState = {
  ok?: boolean;
  message?: string;
  // one list of messages per field name
  errors?: Record<string, string[] | undefined>;
  // what the user typed, so the form can refill after an error
  values?: Record<string, string>;
};

// FormData values can be a File or null. Forms here only expect text.
export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
