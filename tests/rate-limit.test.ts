import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitAll } from "@/lib/rate-limit";
import { resetDb } from "./helpers";

beforeEach(resetDb);

const rule = { name: "test", subject: "1.2.3.4", limit: 3, windowSeconds: 60 };

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", async () => {
    expect(await rateLimit(rule)).toBe(true);
    expect(await rateLimit(rule)).toBe(true);
    expect(await rateLimit(rule)).toBe(true);
    expect(await rateLimit(rule)).toBe(false);
    expect(await rateLimit(rule)).toBe(false);
  });

  it("counts each subject on its own", async () => {
    for (let i = 0; i < 3; i++) await rateLimit(rule);
    expect(await rateLimit(rule)).toBe(false);
    expect(await rateLimit({ ...rule, subject: "5.6.7.8" })).toBe(true);
  });

  it("counts each rule name on its own", async () => {
    for (let i = 0; i < 3; i++) await rateLimit(rule);
    expect(await rateLimit({ ...rule, name: "other" })).toBe(true);
  });

  it("allows again once the window has passed", async () => {
    const short = { ...rule, limit: 1, windowSeconds: 1 };
    expect(await rateLimit(short)).toBe(true);
    expect(await rateLimit(short)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(await rateLimit(short)).toBe(true);
  });

  it("does not store the ip address or email itself", async () => {
    await rateLimit({ ...rule, subject: "secret@example.com" });
    const rows = await prisma.rateLimitHit.findMany();
    expect(JSON.stringify(rows)).not.toContain("secret@example.com");
  });
});

describe("rateLimitAll", () => {
  it("blocks when any rule is over its limit", async () => {
    const perIp = { ...rule, name: "ip", limit: 10 };
    const perEmail = { ...rule, name: "email", limit: 1 };
    expect(await rateLimitAll([perIp, perEmail])).toBe(true);
    expect(await rateLimitAll([perIp, perEmail])).toBe(false);
  });
});
