// Sends email through Resend (https://resend.com) with a plain HTTP call,
// so no extra package is needed.
//
// Without RESEND_API_KEY nothing is sent. The message is kept in `outbox`
// and, in development, printed to the terminal so links can be clicked.

export type Email = {
  to: string;
  subject: string;
  // plain text lines. The html version is built from the same lines.
  lines: string[];
  // optional button under the text
  link?: { label: string; url: string };
};

// Messages that were not sent because email is not configured.
// Tests read this to check what would have gone out.
export const outbox: Email[] = [];

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toText(email: Email) {
  const link = email.link ? `\n\n${email.link.label}: ${email.link.url}` : "";
  return email.lines.join("\n\n") + link;
}

// Names and messages typed by artists and clients end up in these emails,
// so every piece is escaped before it goes into html.
export function toHtml(email: Email) {
  const paragraphs = email.lines
    .map((line) => `<p>${escapeHtml(line).replaceAll("\n", "<br>")}</p>`)
    .join("");
  const link = email.link
    ? `<p><a href="${escapeHtml(email.link.url)}">${escapeHtml(email.link.label)}</a></p>`
    : "";
  return `<div style="font-family:sans-serif;font-size:16px;line-height:1.5;color:#15171c">${paragraphs}${link}</div>`;
}

// Never throws: a failed email must not undo or block the action that
// caused it. Failures are logged instead.
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    outbox.push(email);
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[email not sent, no RESEND_API_KEY]\nTo: ${email.to}\nSubject: ${email.subject}\n\n${toText(email)}\n`);
    }
    if (process.env.NODE_ENV === "production") {
      console.warn("Email is not configured, a message was dropped.");
    }
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email.to,
        subject: email.subject,
        text: toText(email),
        html: toHtml(email),
      }),
    });
    if (!response.ok) {
      console.error(`Email failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Email failed", error);
  }
}
