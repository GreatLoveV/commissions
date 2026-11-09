import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <>
      <h1 className="text-2xl font-semibold">Log in</h1>
      <LoginForm />
      <p className="text-sm text-neutral-600">
        New here?{" "}
        <Link href="/signup" className="underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
