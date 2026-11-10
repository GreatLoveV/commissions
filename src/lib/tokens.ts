import { createHash, createHmac } from "node:crypto";

// The private link a client gets for their request contains a token.
// Whoever has the link can see the request, so the token must be
// impossible to guess.
//
// The token is not random and not stored. It is computed from the request
// id and a secret that only the server knows (an HMAC). That gives us:
// - links can be rebuilt later, which emails about status changes need
// - the database only holds a hash of the token, used to look a request
//   up. Someone who steals the database but not the secret cannot build
//   a single working link.
//
// The cost: changing the secret breaks every existing link.

function secret() {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  return value;
}

// 32 bytes written as base64url is always 43 characters
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function trackingTokenFor(requestId: string) {
  return createHmac("sha256", secret())
    .update(`tracking-link:${requestId}`)
    .digest("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function looksLikeToken(token: string) {
  return TOKEN_PATTERN.test(token);
}

// Full url of the client's private page, for emails.
export function trackingUrl(requestId: string) {
  const base = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/r/${trackingTokenFor(requestId)}`;
}
