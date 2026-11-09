import { describe, expect, it } from "vitest";
import { handleSchema } from "@/lib/validation/artist";

describe("handle validation", () => {
  it.each(["ink", "ink-draws", "artist99", "a-b-c"])("accepts %s", (handle) => {
    expect(handleSchema.safeParse(handle).success).toBe(true);
  });

  it("lowercases and trims", () => {
    expect(handleSchema.parse("  InkDraws ")).toBe("inkdraws");
  });

  it.each([
    "ab", // too short
    "a".repeat(31), // too long
    "ink_draws", // underscore
    "ink draws", // space
    "-ink", // leading hyphen
    "ink-", // trailing hyphen
    "ink--draws", // double hyphen
    "ink/draws", // path separator
    "ink.draws",
  ])("rejects %s", (handle) => {
    expect(handleSchema.safeParse(handle).success).toBe(false);
  });

  it.each(["dashboard", "login", "api", "Signup"])("rejects reserved word %s", (handle) => {
    expect(handleSchema.safeParse(handle).success).toBe(false);
  });
});
