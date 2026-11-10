import type { Metadata } from "next";
import Link from "next/link";
import { linkClass } from "@/components/styles";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="text-muted">Log in to see your requests.</p>
      </div>
      <LoginForm />
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className={linkClass}>
          Create an account
        </Link>
      </p>
    </>
  );
}
