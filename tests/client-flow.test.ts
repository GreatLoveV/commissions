import { beforeEach, describe, expect, it } from "vitest";
import { sendQuote } from "@/lib/artist-requests";
import { prisma } from "@/lib/db";
import { escapeHtml, outbox, toHtml } from "@/lib/email";
import { notifyArtist, notifyClient } from "@/lib/notifications";
import { answerQuote, createClientRequest, getRequestByToken } from "@/lib/requests";
import { hashToken, trackingTokenFor, trackingUrl } from "@/lib/tokens";
import { makeArtist, makeType, resetDb } from "./helpers";

const input = {
  clientName: "Sam Client",
  clientEmail: "sam@example.com",
  description: "A portrait of my cat wearing a tiny crown.",
  usage: "PERSONAL" as const,
  deadline: null,
};

// An open artist with one request, optionally already quoted.
async function setup(handle = "alice") {
  const artist = await makeArtist(handle);
  await prisma.artist.update({ where: { id: artist.id }, data: { slotsOpen: true } });
  const type = await makeType(artist.id, "Portrait");
  const created = await createClientRequest(handle, type.id, input);
  if (!created.ok) throw new Error("setup failed");
  return { artist, id: created.id, token: created.token };
}

async function quoted(price = 12000) {
  const data = await setup();
  await sendQuote(data.artist.id, data.id, { price, message: "Two rounds of changes." });
  return data;
}

const reload = (id: string) => prisma.request.findUniqueOrThrow({ where: { id } });

beforeEach(async () => {
  await resetDb();
  outbox.length = 0;
});

describe("private link tokens", () => {
  it("can be rebuilt from the request id", async () => {
    const { id, token } = await setup();
    expect(trackingTokenFor(id)).toBe(token);
    expect((await reload(id)).trackingTokenHash).toBe(hashToken(token));
  });

  it("are different for every request", () => {
    expect(trackingTokenFor("request-a")).not.toBe(trackingTokenFor("request-b"));
  });

  it("build a url that opens the request", async () => {
    const { id } = await setup();
    const token = trackingUrl(id).split("/r/")[1];
    expect((await getRequestByToken(token))?.id).toBe(id);
  });
});

describe("client answers a quote", () => {
  it("approving moves the request to Awaiting payment", async () => {
    const { id, token } = await quoted();

    expect(await answerQuote(token, true, 12000)).toEqual({ ok: true, requestId: id });

    const request = await reload(id);
    expect(request.status).toBe("AWAITING_PAYMENT");
    expect(request.quoteApprovedAt).not.toBeNull();
    const last = await prisma.requestEvent.findFirstOrThrow({ orderBy: { createdAt: "desc" } });
    expect(last).toMatchObject({ type: "QUOTE_APPROVED", actor: "CLIENT" });
  });

  it("declining cancels the request", async () => {
    const { id, token } = await quoted();
    await answerQuote(token, false, 12000);

    const request = await reload(id);
    expect(request.status).toBe("CANCELLED");
    expect(request.quoteApprovedAt).toBeNull();
  });

  it("is refused when the artist changed the price in the meantime", async () => {
    const { artist, id, token } = await quoted(12000);
    // the client still has the page with 120.00 open
    await sendQuote(artist.id, id, { price: 30000, message: "" });

    const result = await answerQuote(token, true, 12000);

    expect(result.ok).toBe(false);
    expect((await reload(id)).status).toBe("QUOTED");
  });

  it("is refused before a quote exists", async () => {
    const { id, token } = await setup();
    expect((await answerQuote(token, true, 0)).ok).toBe(false);
    expect((await reload(id)).status).toBe("REQUESTED");
  });

  it("cannot be done twice", async () => {
    const { id, token } = await quoted();
    await answerQuote(token, true, 12000);
    expect((await answerQuote(token, false, 12000)).ok).toBe(false);
    expect((await reload(id)).status).toBe("AWAITING_PAYMENT");
  });

  it("is refused with a wrong token", async () => {
    const { id } = await quoted();
    expect((await answerQuote("x".repeat(43), true, 12000)).ok).toBe(false);
    expect((await reload(id)).status).toBe("QUOTED");
  });
});

describe("emails", () => {
  it("send the client their private link when the request is made", async () => {
    const { id, token } = await setup();
    await notifyClient(id);

    expect(outbox).toHaveLength(1);
    expect(outbox[0].to).toBe("sam@example.com");
    expect(outbox[0].link?.url.endsWith(`/r/${token}`)).toBe(true);
  });

  it("tell the client the price and the artist's message", async () => {
    const { id } = await quoted(12000);
    await notifyClient(id);

    const text = outbox[0].lines.join("\n");
    expect(outbox[0].subject).toContain("quote");
    expect(text).toContain("$120");
    expect(text).toContain("Two rounds of changes.");
  });

  it("tell the artist about a new request, without the client's link", async () => {
    const { id, token } = await setup();
    await notifyArtist(id, "new_request");

    expect(outbox[0].to).toBe("alice@example.com");
    expect(outbox[0].link?.url).toContain(`/dashboard/requests/${id}`);
    expect(JSON.stringify(outbox[0])).not.toContain(token);
  });

  it("go to the right people when two artists have requests", async () => {
    const alice = await setup("alice");
    const bob = await setup("bob");
    await notifyArtist(alice.id, "new_request");
    await notifyArtist(bob.id, "new_request");

    expect(outbox.map((email) => email.to)).toEqual(["alice@example.com", "bob@example.com"]);
  });

  it("send nothing for an unknown request", async () => {
    await notifyClient("does-not-exist");
    await notifyArtist("does-not-exist", "new_request");
    expect(outbox).toHaveLength(0);
  });

  it("escape names and messages in the html version", () => {
    const html = toHtml({
      to: "x@example.com",
      subject: "s",
      lines: ['Hi <script>alert("x")</script>,'],
      link: { label: "Open", url: 'https://example.com/?a="><b>' },
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('"><b>');
    expect(escapeHtml(`<a href='x'>&`)).toBe("&lt;a href=&#39;x&#39;&gt;&amp;");
  });
});
