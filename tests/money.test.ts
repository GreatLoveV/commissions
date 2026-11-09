import { describe, expect, it } from "vitest";
import { formatMoney, minorToInput, parseMoney } from "@/lib/money";

describe("parseMoney", () => {
  it.each([
    ["50", 5000],
    ["49.99", 4999],
    ["49,5", 4950],
    [" 0.05 ", 5],
    ["0", 0],
  ])("parses %s", (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
  });

  it.each(["", "abc", "-5", "1.234", "1e3", "12345678", "5 0", "$50"])(
    "rejects %s",
    (input) => {
      expect(parseMoney(input)).toBeNull();
    },
  );
});

describe("formatMoney", () => {
  it("drops the decimals on round amounts", () => {
    expect(formatMoney(5000, "USD")).toBe("$50");
  });

  it("keeps the decimals otherwise", () => {
    expect(formatMoney(4999, "USD")).toBe("$49.99");
  });

  it("works for dirhams", () => {
    expect(formatMoney(50000, "MAD")).toContain("500");
  });
});

describe("minorToInput", () => {
  it("round trips through parseMoney", () => {
    for (const minor of [0, 5, 4950, 4999, 5000]) {
      expect(parseMoney(minorToInput(minor))).toBe(minor);
    }
  });
});
