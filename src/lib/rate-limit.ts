import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

// A small rate limiter that uses the database, so it works on serverless
// hosts where memory is not shared between requests.
//
// Each attempt adds a row. An attempt is allowed while there are fewer
// than `limit` rows for the same key inside the time window.
// Two requests at the exact same moment can both slip through at the
// limit. That is fine here: the goal is to stop floods, not to count
// exactly.

type Rule = {
  // what is being limited, e.g. "login:ip"
  name: string;
  // who is being limited (an ip, an email, an artist handle)
  subject: string;
  limit: number;
  windowSeconds: number;
};

// The subject is hashed so raw ip addresses and emails are not stored.
function keyFor(rule: Rule) {
  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  const hash = createHash("sha256")
    .update(`${secret}:${rule.subject}`)
    .digest("hex")
    .slice(0, 32);
  return `${rule.name}:${hash}`;
}

// Returns true when the attempt is allowed.
export async function rateLimit(rule: Rule): Promise<boolean> {
  const key = keyFor(rule);
  const windowStart = new Date(Date.now() - rule.windowSeconds * 1000);

  const recent = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });
  if (recent >= rule.limit) return false;

  await prisma.rateLimitHit.create({ data: { key } });
  // rows older than the window are useless, clear them as we go
  await prisma.rateLimitHit.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });
  return true;
}

// Checks several rules and stops at the first one that is over its limit.
export async function rateLimitAll(rules: Rule[]): Promise<boolean> {
  for (const rule of rules) {
    if (!(await rateLimit(rule))) return false;
  }
  return true;
}

// The visitor's ip address as reported by the host's proxy.
// On Vercel this header is set by the platform. Behind a different proxy
// it must be checked again, because a client can send its own value.
export async function clientIp() {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const limits = {
  login: (ip: string, email: string): Rule[] => [
    { name: "login:ip", subject: ip, limit: 20, windowSeconds: 15 * MINUTE },
    { name: "login:email", subject: email, limit: 8, windowSeconds: 15 * MINUTE },
  ],
  signup: (ip: string): Rule[] => [
    { name: "signup:ip", subject: ip, limit: 10, windowSeconds: HOUR },
  ],
  sendRequest: (ip: string, handle: string): Rule[] => [
    { name: "request:ip", subject: ip, limit: 5, windowSeconds: HOUR },
    // protects one artist from a flood coming from many addresses
    { name: "request:artist", subject: handle, limit: 40, windowSeconds: HOUR },
  ],
  referenceUpload: (ip: string): Rule[] => [
    { name: "reference:ip", subject: ip, limit: 40, windowSeconds: HOUR },
  ],
};
