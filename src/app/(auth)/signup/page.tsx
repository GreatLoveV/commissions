import type { Metadata } from "next";
import Link from "next/link";
import { linkClass } from "@/components/styles";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl">Make your commission page</h1>
        <p className="text-muted">It is free. Next you pick the address of your page.</p>
      </div>
      <SignupForm />
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
      </p>
    </>
  );
}
