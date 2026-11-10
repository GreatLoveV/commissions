import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  addPayment,
  deletePayment,
  getRequest,
  listRequests,
  moveRequest,
  sendQuote,
  setPaymentPaid,
} from "@/lib/artist-requests";
import { makeArtist, makeRequest, makeType, resetDb } from "./helpers";

// Two artists with one request each.
async function setup() {
  const alice = await makeArtist("alice");
  const bob = await makeArtist("bob");
  const aliceType = await makeType(alice.id, "Alice portrait");
  const bobType = await makeType(bob.id, "Bob portrait");
  const aliceRequest = await makeRequest(alice.id, aliceType.id);
  const bobRequest = await makeRequest(bob.id, bobType.id);
  return { alice, bob, aliceRequest, bobRequest };
}

const quote = { price: 12000, message: "Includes two rounds of changes." };
const deposit = { kind: "DEPOSIT" as const, amount: 6000, paid: true, note: "PayPal" };

const reload = (id: string) => prisma.request.findUniqueOrThrow({ where: { id } });
const eventsOf = (requestId: string) =>
  prisma.requestEvent.findMany({ where: { requestId }, orderBy: { createdAt: "asc" } });

beforeEach(resetDb);

describe("reading requests", () => {
  it("lists only the artist's own requests", async () => {
    const { alice, aliceRequest } = await setup();
    const requests = await listRequests(alice.id);
    expect(requests.map((r) => r.id)).toEqual([aliceRequest.id]);
  });

  it("cannot open another artist's request", async () => {
    const { alice, bobRequest } = await setup();
    expect(await getRequest(alice.id, bobRequest.id)).toBeNull();
  });
});

describe("sending a quote", () => {
  it("sets the price, moves to Quoted and writes history", async () => {
    const { alice, aliceRequest } = await setup();

    expect(await sendQuote(alice.id, aliceRequest.id, quote)).toEqual({ ok: true });

    const request = await reload(aliceRequest.id);
    expect(request.status).toBe("QUOTED");
    expect(request.quotedPriceMinor).toBe(12000);
    expect(request.quoteSentAt).not.toBeNull();

    const events = await eventsOf(aliceRequest.id);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      artistId: alice.id,
      type: "QUOTE_SENT",
      actor: "ARTIST",
      fromStatus: "REQUESTED",
      toStatus: "QUOTED",
      note: "Includes two rounds of changes.",
    });
  });

  it("can be replaced while the client has not answered", async () => {
    const { alice, aliceRequest } = await setup();
    await sendQuote(alice.id, aliceRequest.id, quote);
    await sendQuote(alice.id, aliceRequest.id, { price: 9000, message: "" });

    const request = await reload(aliceRequest.id);
    expect(request.status).toBe("QUOTED");
    expect(request.quotedPriceMinor).toBe(9000);
    expect(await eventsOf(aliceRequest.id)).toHaveLength(2);
  });

  it("is locked once the quote is approved", async () => {
    const { alice, aliceRequest } = await setup();
    await sendQuote(alice.id, aliceRequest.id, quote);
    await moveRequest(alice.id, aliceRequest.id, "AWAITING_PAYMENT");

    const result = await sendQuote(alice.id, aliceRequest.id, { price: 99900, message: "" });
    expect(result.ok).toBe(false);
    expect((await reload(aliceRequest.id)).quotedPriceMinor).toBe(12000);
  });

  it("does nothing to another artist's request", async () => {
    const { alice, bobRequest } = await setup();
    const result = await sendQuote(alice.id, bobRequest.id, quote);
    expect(result.ok).toBe(false);

    const request = await reload(bobRequest.id);
    expect(request.status).toBe("REQUESTED");
    expect(request.quotedPriceMinor).toBeNull();
  });
});

describe("moving a request", () => {
  it("walks the whole way to Delivered", async () => {
    const { alice, aliceRequest } = await setup();
    const id = aliceRequest.id;
    await sendQuote(alice.id, id, quote);

    for (const to of ["AWAITING_PAYMENT", "IN_PROGRESS", "SKETCH_REVIEW", "DELIVERED"] as const) {
      expect(await moveRequest(alice.id, id, to)).toEqual({ ok: true });
      expect((await reload(id)).status).toBe(to);
    }

    const events = await eventsOf(id);
    expect(events.map((e) => e.toStatus)).toEqual([
      "QUOTED",
      "AWAITING_PAYMENT",
      "IN_PROGRESS",
      "SKETCH_REVIEW",
      "DELIVERED",
    ]);
  });

  it("records when the artist marks the quote as approved", async () => {
    const { alice, aliceRequest } = await setup();
    await sendQuote(alice.id, aliceRequest.id, quote);
    await moveRequest(alice.id, aliceRequest.id, "AWAITING_PAYMENT");

    expect((await reload(aliceRequest.id)).quoteApprovedAt).not.toBeNull();
    const events = await eventsOf(aliceRequest.id);
    expect(events.at(-1)?.type).toBe("QUOTE_APPROVED");
  });

  it("refuses a move the rules do not allow", async () => {
    const { alice, aliceRequest } = await setup();
    const result = await moveRequest(alice.id, aliceRequest.id, "DELIVERED");

    expect(result.ok).toBe(false);
    expect((await reload(aliceRequest.id)).status).toBe("REQUESTED");
    expect(await eventsOf(aliceRequest.id)).toHaveLength(0);
  });

  it("refuses to move to Quoted without a price", async () => {
    const { alice, aliceRequest } = await setup();
    const result = await moveRequest(alice.id, aliceRequest.id, "QUOTED");
    expect(result.ok).toBe(false);
    expect((await reload(aliceRequest.id)).status).toBe("REQUESTED");
  });

  it("does nothing to another artist's request", async () => {
    const { alice, bobRequest } = await setup();
    const result = await moveRequest(alice.id, bobRequest.id, "DECLINED");

    expect(result.ok).toBe(false);
    expect((await reload(bobRequest.id)).status).toBe("REQUESTED");
    expect(await eventsOf(bobRequest.id)).toHaveLength(0);
  });

  it("keeps a declined request closed", async () => {
    const { alice, aliceRequest } = await setup();
    await moveRequest(alice.id, aliceRequest.id, "DECLINED");

    expect((await sendQuote(alice.id, aliceRequest.id, quote)).ok).toBe(false);
    expect((await moveRequest(alice.id, aliceRequest.id, "IN_PROGRESS")).ok).toBe(false);
    expect((await reload(aliceRequest.id)).status).toBe("DECLINED");
  });

  it("lets only one of two clicks at the same moment win", async () => {
    const { alice, aliceRequest } = await setup();
    await sendQuote(alice.id, aliceRequest.id, quote);

    const results = await Promise.all([
      moveRequest(alice.id, aliceRequest.id, "AWAITING_PAYMENT"),
      moveRequest(alice.id, aliceRequest.id, "CANCELLED"),
    ]);

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    // one history entry for the quote, one for the move that won
    expect(await eventsOf(aliceRequest.id)).toHaveLength(2);
  });
});

describe("payments", () => {
  async function quoted() {
    const data = await setup();
    await sendQuote(data.alice.id, data.aliceRequest.id, quote);
    return data;
  }

  it("records a paid deposit in the request's currency", async () => {
    const { alice, aliceRequest } = await quoted();

    expect(await addPayment(alice.id, aliceRequest.id, deposit)).toEqual({ ok: true });

    const payment = await prisma.payment.findFirstOrThrow();
    expect(payment).toMatchObject({
      artistId: alice.id,
      requestId: aliceRequest.id,
      kind: "DEPOSIT",
      amountMinor: 6000,
      currency: "USD",
      status: "PAID",
      method: "MANUAL",
      note: "PayPal",
    });
    expect(payment.paidAt).not.toBeNull();
    expect((await eventsOf(aliceRequest.id)).at(-1)?.type).toBe("PAYMENT_RECORDED");
  });

  it("records an unpaid payment without a paid date", async () => {
    const { alice, aliceRequest } = await quoted();
    await addPayment(alice.id, aliceRequest.id, { ...deposit, paid: false });

    const payment = await prisma.payment.findFirstOrThrow();
    expect(payment.status).toBe("PENDING");
    expect(payment.paidAt).toBeNull();
  });

  it("is refused before a quote exists", async () => {
    const { alice, aliceRequest } = await setup();
    expect((await addPayment(alice.id, aliceRequest.id, deposit)).ok).toBe(false);
    expect(await prisma.payment.count()).toBe(0);
  });

  it("can be switched between paid and unpaid", async () => {
    const { alice, aliceRequest } = await quoted();
    await addPayment(alice.id, aliceRequest.id, { ...deposit, paid: false });
    const payment = await prisma.payment.findFirstOrThrow();

    await setPaymentPaid(alice.id, payment.id, true);
    expect((await prisma.payment.findFirstOrThrow()).status).toBe("PAID");

    await setPaymentPaid(alice.id, payment.id, false);
    const after = await prisma.payment.findFirstOrThrow();
    expect(after.status).toBe("PENDING");
    expect(after.paidAt).toBeNull();
  });

  it("cannot be added to another artist's request", async () => {
    const { alice, bob, bobRequest } = await quoted();
    await sendQuote(bob.id, bobRequest.id, quote);

    expect((await addPayment(alice.id, bobRequest.id, deposit)).ok).toBe(false);
    expect(await prisma.payment.count()).toBe(0);
  });

  it("cannot be changed or deleted by another artist", async () => {
    const { alice, bob, aliceRequest } = await quoted();
    await addPayment(alice.id, aliceRequest.id, deposit);
    const payment = await prisma.payment.findFirstOrThrow();

    expect((await setPaymentPaid(bob.id, payment.id, false)).ok).toBe(false);
    await deletePayment(bob.id, payment.id);

    const after = await prisma.payment.findFirstOrThrow();
    expect(after.status).toBe("PAID");
  });

  it("can be deleted by its own artist", async () => {
    const { alice, aliceRequest } = await quoted();
    await addPayment(alice.id, aliceRequest.id, deposit);
    const payment = await prisma.payment.findFirstOrThrow();

    await deletePayment(alice.id, payment.id);
    expect(await prisma.payment.count()).toBe(0);
  });
});
