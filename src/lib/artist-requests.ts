import type { RequestStatus } from "@/generated/prisma/enums";
import { canArtistMove } from "@/lib/status";
import { tenantDb } from "@/lib/tenant";
import type { PaymentInput, QuoteInput } from "@/lib/validation/dashboard-request";

// Everything the artist can do with their requests.
// Every function takes the artist id from the session and works through
// tenantDb, so a request id that belongs to someone else is "not found".

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_FOUND: ActionResult = { ok: false, error: "This request no longer exists." };
// Shown when the status changed between loading the page and clicking.
const STALE: ActionResult = {
  ok: false,
  error: "This request has changed since you opened it. Reload the page and try again.",
};

// Prisma throws this code when an update matches no row.
function isNoRowError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

export function listRequests(artistId: string) {
  return tenantDb(artistId).request.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      clientName: true,
      typeNameSnapshot: true,
      deadline: true,
      quotedPriceMinor: true,
      currency: true,
      createdAt: true,
    },
  });
}

export function getRequest(artistId: string, id: string) {
  return tenantDb(artistId).request.findUnique({
    where: { id },
    include: {
      files: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function moveRequest(
  artistId: string,
  id: string,
  to: RequestStatus,
): Promise<ActionResult> {
  const db = tenantDb(artistId);
  const request = await db.request.findUnique({ where: { id }, select: { status: true } });
  if (!request) return NOT_FOUND;

  const from = request.status;
  // a quote needs a price, so it goes through sendQuote instead
  if (to === "QUOTED" || !canArtistMove(from, to)) {
    return { ok: false, error: "That move is not possible from the current status." };
  }

  // The artist can record that the client said yes outside the app.
  const approvingQuote = from === "QUOTED" && to === "AWAITING_PAYMENT";

  try {
    // One query does three things or none of them: it only matches while
    // the status is still `from`, it sets the new status, and it writes
    // the history entry.
    await db.request.update({
      where: { id, status: from },
      data: {
        status: to,
        ...(approvingQuote && { quoteApprovedAt: new Date() }),
        events: {
          create: [
            {
              type: approvingQuote ? "QUOTE_APPROVED" : "STATUS_CHANGED",
              actor: "ARTIST",
              fromStatus: from,
              toStatus: to,
            },
          ],
        },
      },
    });
  } catch (error) {
    if (isNoRowError(error)) return STALE;
    throw error;
  }
  return { ok: true };
}

// Sends the first quote, or replaces it while the client has not answered.
export async function sendQuote(
  artistId: string,
  id: string,
  input: QuoteInput,
): Promise<ActionResult> {
  const db = tenantDb(artistId);
  const request = await db.request.findUnique({ where: { id }, select: { status: true } });
  if (!request) return NOT_FOUND;

  const from = request.status;
  if (from !== "REQUESTED" && from !== "QUOTED") {
    return { ok: false, error: "The quote can no longer be changed for this request." };
  }

  try {
    await db.request.update({
      where: { id, status: from },
      data: {
        status: "QUOTED",
        quotedPriceMinor: input.price,
        quoteSentAt: new Date(),
        quoteApprovedAt: null,
        events: {
          create: [
            {
              type: "QUOTE_SENT",
              actor: "ARTIST",
              fromStatus: from,
              toStatus: "QUOTED",
              note: input.message || null,
            },
          ],
        },
      },
    });
  } catch (error) {
    if (isNoRowError(error)) return STALE;
    throw error;
  }
  return { ok: true };
}

// Payments are tracked by hand in v1: the artist writes down what the
// client paid through whatever they use (bank transfer, PayPal, cash).
export async function addPayment(
  artistId: string,
  requestId: string,
  input: PaymentInput,
): Promise<ActionResult> {
  const db = tenantDb(artistId);
  const request = await db.request.findUnique({
    where: { id: requestId },
    select: { status: true, currency: true },
  });
  if (!request) return NOT_FOUND;
  if (request.status === "REQUESTED" || request.status === "DECLINED") {
    return { ok: false, error: "Send a quote before recording payments." };
  }

  // Created through the request, so the payment and its history entry
  // are saved together and inherit the request's artist id.
  await db.request.update({
    where: { id: requestId },
    data: {
      payments: {
        create: [
          {
            kind: input.kind,
            amountMinor: input.amount,
            currency: request.currency,
            status: input.paid ? "PAID" : "PENDING",
            paidAt: input.paid ? new Date() : null,
            note: input.note || null,
          },
        ],
      },
      events: {
        create: [{ type: "PAYMENT_RECORDED", actor: "ARTIST" }],
      },
    },
  });
  return { ok: true };
}

export async function setPaymentPaid(
  artistId: string,
  paymentId: string,
  paid: boolean,
): Promise<ActionResult> {
  const result = await tenantDb(artistId).payment.updateMany({
    where: { id: paymentId },
    data: { status: paid ? "PAID" : "PENDING", paidAt: paid ? new Date() : null },
  });
  return result.count === 0 ? NOT_FOUND : { ok: true };
}

export async function deletePayment(artistId: string, paymentId: string): Promise<ActionResult> {
  await tenantDb(artistId).payment.deleteMany({ where: { id: paymentId } });
  return { ok: true };
}
