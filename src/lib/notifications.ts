import type { RequestStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { sendEmail, type Email } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { trackingUrl } from "@/lib/tokens";

// Emails about a request. Server actions call these after a change has
// been saved. Each function loads what it needs by request id, so the
// caller cannot pass in the wrong recipient by mistake.

function baseUrl() {
  return (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function loadRequest(requestId: string) {
  return prisma.request.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      clientName: true,
      clientEmail: true,
      typeNameSnapshot: true,
      quotedPriceMinor: true,
      currency: true,
      artist: {
        select: { displayName: true, user: { select: { email: true } } },
      },
      // the artist's message on the latest quote
      events: {
        where: { type: "QUOTE_SENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { note: true },
      },
    },
  });
}

type Loaded = NonNullable<Awaited<ReturnType<typeof loadRequest>>>;

// What the client is told for each status. A status that is missing here
// sends no email.
function clientMessage(request: Loaded): { subject: string; lines: string[] } | null {
  const artist = request.artist.displayName;
  const type = request.typeNameSnapshot;
  const messages: Partial<Record<RequestStatus, { subject: string; lines: string[] }>> = {
    REQUESTED: {
      subject: `Your request to ${artist} was sent`,
      lines: [
        `${artist} has received your ${type} request and will reply with a price.`,
        "Keep this email. The link below is your private page for this request, so only share it with people who should see it.",
      ],
    },
    QUOTED: {
      subject: `${artist} sent you a quote`,
      lines: [
        request.quotedPriceMinor === null
          ? `${artist} sent a price for your ${type}.`
          : `${artist} quoted ${formatMoney(request.quotedPriceMinor, request.currency)} for your ${type}.`,
        ...(request.events[0]?.note ? [`Message from ${artist}:\n${request.events[0].note}`] : []),
        "Open your request page to approve or decline it. Work starts only after you approve.",
      ],
    },
    AWAITING_PAYMENT: {
      subject: `Quote approved for your ${type}`,
      lines: [
        `The quote for your ${type} is approved. ${artist} will contact you about payment.`,
      ],
    },
    IN_PROGRESS: {
      subject: `${artist} is working on your ${type}`,
      lines: [`${artist} has started work on your ${type}.`],
    },
    SKETCH_REVIEW: {
      subject: `A sketch of your ${type} is ready`,
      lines: [
        `${artist} has a sketch ready for your feedback and will send it to you directly.`,
      ],
    },
    DELIVERED: {
      subject: `Your ${type} is delivered`,
      lines: [`${artist} has marked your ${type} as delivered. Thank you for commissioning.`],
    },
    DECLINED: {
      subject: `${artist} cannot take your request`,
      lines: [`${artist} declined your ${type} request. No payment is due.`],
    },
    CANCELLED: {
      subject: `Your ${type} request was cancelled`,
      lines: [`Your ${type} request to ${artist} was cancelled.`],
    },
  };
  return messages[request.status] ?? null;
}

// Tells the client about the status the request is in right now.
export async function notifyClient(requestId: string) {
  const request = await loadRequest(requestId);
  if (!request) return;
  const message = clientMessage(request);
  if (!message) return;

  await sendEmail({
    to: request.clientEmail,
    subject: message.subject,
    lines: [`Hi ${request.clientName},`, ...message.lines],
    link: { label: "Open your request", url: trackingUrl(request.id) },
  });
}

// Tells the artist about something a client did.
export async function notifyArtist(
  requestId: string,
  what: "new_request" | "quote_approved" | "quote_declined",
) {
  const request = await loadRequest(requestId);
  if (!request) return;

  const client = request.clientName;
  const type = request.typeNameSnapshot;
  const messages: Record<typeof what, Pick<Email, "subject" | "lines">> = {
    new_request: {
      subject: `New ${type} request from ${client}`,
      lines: [`${client} sent you a ${type} request. Reply with a quote when you are ready.`],
    },
    quote_approved: {
      subject: `${client} approved your quote`,
      lines: [`${client} approved the quote for their ${type}. Arrange payment with them, then start work.`],
    },
    quote_declined: {
      subject: `${client} declined your quote`,
      lines: [`${client} declined the quote for their ${type}. The request is now cancelled.`],
    },
  };

  await sendEmail({
    to: request.artist.user.email,
    ...messages[what],
    link: { label: "Open the request", url: `${baseUrl()}/dashboard/requests/${request.id}` },
  });
}
