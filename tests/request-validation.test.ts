import { describe, expect, it } from "vitest";
import { requestSchema } from "@/lib/validation/request";

const valid = {
  clientName: "Sam",
  clientEmail: "Sam@Example.com ",
  description: "A portrait of my cat wearing a tiny crown.",
  usage: "PERSONAL",
  deadline: "",
};

// a date string some days from today, in the same format the browser sends
function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function errorsFor(overrides: Record<string, unknown>) {
  const result = requestSchema.safeParse({ ...valid, ...overrides });
  return result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
}

describe("request form validation", () => {
  it("accepts a normal request and tidies the email", () => {
    const parsed = requestSchema.parse(valid);
    expect(parsed.clientEmail).toBe("sam@example.com");
    expect(parsed.deadline).toBeNull();
  });

  it("turns the deadline into a date", () => {
    const parsed = requestSchema.parse({ ...valid, deadline: daysFromNow(30) });
    expect(parsed.deadline).toBeInstanceOf(Date);
  });

  it.each([
    ["an empty name", { clientName: "  " }, "clientName"],
    ["a bad email", { clientEmail: "sam@" }, "clientEmail"],
    ["a too short description", { description: "a cat" }, "description"],
    ["a too long description", { description: "a".repeat(4001) }, "description"],
    ["a missing usage", { usage: "" }, "usage"],
    ["an unknown usage", { usage: "RESALE" }, "usage"],
    ["a deadline today", { deadline: daysFromNow(0) }, "deadline"],
    ["a deadline in the past", { deadline: "2020-01-01" }, "deadline"],
    ["a deadline too far away", { deadline: daysFromNow(900) }, "deadline"],
    ["a date that does not exist", { deadline: "2027-02-31" }, "deadline"],
    ["a deadline that is not a date", { deadline: "soon" }, "deadline"],
  ])("rejects %s", (_name, overrides, field) => {
    expect(errorsFor(overrides)).toEqual([field]);
  });
});
