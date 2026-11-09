"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { signup } from "../actions";

export function SignupForm() {
  const [state, action] = useActionState(signup, {});

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state.values?.name}
        errors={state.errors?.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email}
        errors={state.errors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        errors={state.errors?.password}
      />
      <FormMessage message={state.message} />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
