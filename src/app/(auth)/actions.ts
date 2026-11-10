"use server";

import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { text, type FormState } from "@/lib/form";
import { clientIp, limits, rateLimitAll } from "@/lib/rate-limit";
import { loginSchema, signupSchema } from "@/lib/validation/auth";

const TOO_MANY = "Too many attempts. Wait a few minutes and try again.";

export async function signup(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // the password is never sent back to the form
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
  };
  const parsed = signupSchema.safeParse({
    ...values,
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  if (!(await rateLimitAll(limits.signup(await clientIp())))) {
    return { message: TOO_MANY, values };
  }

  try {
    await auth.api.signUpEmail({ body: parsed.data });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        message:
          "Could not create the account. If you already have one, log in instead.",
        values,
      };
    }
    throw error;
  }

  // redirect() works by throwing, so it has to stay outside the try block
  redirect("/onboarding");
}

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const parsed = loginSchema.safeParse({
    ...values,
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  // Limited per address and per email, so one address cannot try many
  // accounts and many addresses cannot hammer one account.
  const rules = limits.login(await clientIp(), parsed.data.email);
  if (!(await rateLimitAll(rules))) {
    return { message: TOO_MANY, values };
  }

  try {
    await auth.api.signInEmail({ body: parsed.data });
  } catch (error) {
    if (error instanceof APIError) {
      // same message for a wrong email and a wrong password, so the form
      // does not reveal which emails have an account
      return { message: "Wrong email or password.", values };
    }
    throw error;
  }

  redirect("/dashboard");
}
