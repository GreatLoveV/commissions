import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // A new artist gets a link to confirm their address. Logging in does not
  // depend on it yet, the account just stays unverified until they click.
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your email address",
        lines: [`Hi ${user.name},`, "Confirm this email address for your artist account."],
        link: { label: "Confirm email", url },
      });
    },
  },
  // nextCookies lets server actions set the session cookie.
  // It has to stay last in the list.
  plugins: [nextCookies()],
});
