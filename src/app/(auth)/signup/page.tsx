import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <>
      <h1 className="text-2xl font-semibold">Create your artist account</h1>
      <SignupForm />
      <p className="text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </>
  );
}
