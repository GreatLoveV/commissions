import { describe, expect, it } from "vitest";
import { RequestStatus } from "@/generated/prisma/enums";
import {
  ARTIST_MOVES,
  BOARD_STATUSES,
  canArtistMove,
  CLOSED_STATUSES,
  moveLabel,
  simpleMoves,
  stageIndex,
  STAGES,
  STATUS_LABELS,
} from "@/lib/status";

const all = Object.values(RequestStatus);

describe("status tables", () => {
  it("cover every status in the database", () => {
    expect(Object.keys(ARTIST_MOVES).sort()).toEqual([...all].sort());
    expect(Object.keys(STATUS_LABELS).sort()).toEqual([...all].sort());
  });

  it("put every status either on the board or in the closed list", () => {
    expect([...BOARD_STATUSES, ...CLOSED_STATUSES].sort()).toEqual([...all].sort());
  });
});

describe("artist moves", () => {
  it.each([
    ["REQUESTED", "QUOTED"],
    ["REQUESTED", "DECLINED"],
    ["QUOTED", "AWAITING_PAYMENT"],
    ["AWAITING_PAYMENT", "IN_PROGRESS"],
    ["IN_PROGRESS", "SKETCH_REVIEW"],
    ["SKETCH_REVIEW", "IN_PROGRESS"],
    ["SKETCH_REVIEW", "DELIVERED"],
    ["IN_PROGRESS", "CANCELLED"],
  ] as const)("allows %s to %s", (from, to) => {
    expect(canArtistMove(from, to)).toBe(true);
  });

  it.each([
    ["REQUESTED", "IN_PROGRESS"], // no work before a quote
    ["REQUESTED", "DELIVERED"],
    ["REQUESTED", "AWAITING_PAYMENT"], // no payment before a quote
    ["QUOTED", "IN_PROGRESS"], // the client has not approved yet
    ["QUOTED", "DECLINED"],
    ["AWAITING_PAYMENT", "DELIVERED"],
    ["IN_PROGRESS", "QUOTED"], // the price is fixed once work starts
    ["IN_PROGRESS", "IN_PROGRESS"],
  ] as const)("refuses %s to %s", (from, to) => {
    expect(canArtistMove(from, to)).toBe(false);
  });

  it("never moves a finished request", () => {
    for (const from of ["DELIVERED", "DECLINED", "CANCELLED"] as const) {
      for (const to of all) {
        expect(canArtistMove(from, to)).toBe(false);
      }
    }
  });

  it("never moves a request back to Requested", () => {
    for (const from of all) {
      expect(canArtistMove(from, "REQUESTED")).toBe(false);
    }
  });

  it("leaves quoting out of the plain buttons", () => {
    expect(simpleMoves("REQUESTED")).toEqual(["DECLINED"]);
  });

  it("has a label for every possible move", () => {
    for (const from of all) {
      for (const to of ARTIST_MOVES[from]) {
        expect(moveLabel(from, to).length).toBeGreaterThan(3);
      }
    }
  });
});

describe("stageIndex", () => {
  it("puts board statuses on the line in order", () => {
    expect(stageIndex("REQUESTED")).toBe(0);
    expect(stageIndex("SKETCH_REVIEW")).toBe(4);
  });

  it("marks every stage done once delivered", () => {
    expect(stageIndex("DELIVERED")).toBe(STAGES.length);
  });

  it("leaves declined and cancelled requests off the line", () => {
    expect(stageIndex("DECLINED")).toBeNull();
    expect(stageIndex("CANCELLED")).toBeNull();
  });
});
