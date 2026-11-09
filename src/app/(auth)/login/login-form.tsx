"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { login } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(login, {});

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
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
        autoComplete="current-password"
        errors={state.errors?.password}
      />
      <FormMessage message={state.message} />
      <SubmitButton>Log in</SubmitButton>
    </form>
  );
}
