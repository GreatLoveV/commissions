import { createHash, randomBytes } from "node:crypto";

// The private link a client gets for their request contains a random
// token. Whoever has the link can see the request, so:
// - the token is 32 random bytes, far too many to guess
// - only its sha256 hash is stored. If the database leaks, the links
//   still cannot be rebuilt from it.

// 32 bytes written as base64url is always 43 characters
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createTrackingToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function looksLikeToken(token: string) {
  return TOKEN_PATTERN.test(token);
}
