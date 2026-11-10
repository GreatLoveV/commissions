import type { RequestStatus } from "@/generated/prisma/enums";

// The life of a request, in one place. Pages, actions and tests all read
// these tables instead of repeating the rules.

export const STATUS_LABELS: Record<RequestStatus, string> = {
  REQUESTED: "Requested",
  QUOTED: "Quoted",
  AWAITING_PAYMENT: "Awaiting payment",
  IN_PROGRESS: "In progress",
  SKETCH_REVIEW: "Sketch review",
  DELIVERED: "Delivered",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

// columns of the board, left to right
export const BOARD_STATUSES: RequestStatus[] = [
  "REQUESTED",
  "QUOTED",
  "AWAITING_PAYMENT",
  "IN_PROGRESS",
  "SKETCH_REVIEW",
  "DELIVERED",
];

// finished one way or another, kept out of the board
export const CLOSED_STATUSES: RequestStatus[] = ["DECLINED", "CANCELLED"];

// Where the artist may move a request from each status.
// Anything not listed is refused on the server.
//
// REQUESTED -> QUOTED is here, but it only happens through "send quote",
// because a quote needs a price.
export const ARTIST_MOVES: Record<RequestStatus, RequestStatus[]> = {
  REQUESTED: ["QUOTED", "DECLINED"],
  QUOTED: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["SKETCH_REVIEW", "DELIVERED", "CANCELLED"],
  SKETCH_REVIEW: ["IN_PROGRESS", "DELIVERED", "CANCELLED"],
  DELIVERED: [],
  DECLINED: [],
  CANCELLED: [],
};

export function canArtistMove(from: RequestStatus, to: RequestStatus) {
  return ARTIST_MOVES[from].includes(to);
}

// Moves the artist can make with a plain button (everything except
// sending a quote).
export function simpleMoves(from: RequestStatus) {
  return ARTIST_MOVES[from].filter((to) => to !== "QUOTED");
}

// Button text for a move, written as what the artist is doing.
const MOVE_LABELS: Partial<Record<`${RequestStatus}>${RequestStatus}`, string>> = {
  "REQUESTED>DECLINED": "Decline request",
  "QUOTED>AWAITING_PAYMENT": "Client approved the quote",
  "AWAITING_PAYMENT>IN_PROGRESS": "Start work",
  "IN_PROGRESS>SKETCH_REVIEW": "Send sketch for review",
  "IN_PROGRESS>DELIVERED": "Mark as delivered",
  "SKETCH_REVIEW>IN_PROGRESS": "Back to work",
  "SKETCH_REVIEW>DELIVERED": "Mark as delivered",
};

export function moveLabel(from: RequestStatus, to: RequestStatus) {
  if (to === "CANCELLED") return "Cancel request";
  return MOVE_LABELS[`${from}>${to}`] ?? `Move to ${STATUS_LABELS[to]}`;
}

export function isRequestStatus(value: string): value is RequestStatus {
  return value in STATUS_LABELS;
}

// One line of a request's history, in words.
export function describeEvent(event: {
  type: string;
  toStatus: RequestStatus | null;
}) {
  switch (event.type) {
    case "CREATED":
      return "Request received";
    case "QUOTE_SENT":
      return "Quote sent";
    case "QUOTE_APPROVED":
      return "Quote approved";
    case "PAYMENT_RECORDED":
      return "Payment recorded";
    case "STATUS_CHANGED":
      return event.toStatus ? `Moved to ${STATUS_LABELS[event.toStatus]}` : "Status changed";
    default:
      return "Note";
  }
}
