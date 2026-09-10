interface SendEmailArgs {
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email via the Resend API. If RESEND_API_KEY isn't configured,
 * logs the notification instead so the app still works during local setup.
 */
export async function sendNotificationEmail({ subject, text, html }: SendEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!to) {
    console.warn("NOTIFY_EMAIL is not set; skipping email notification:", subject);
    return;
  }

  if (!apiKey) {
    console.log(`[email notification - RESEND_API_KEY not set, logging instead]\nTo: ${to}\nSubject: ${subject}\n\n${text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html: html ?? `<p>${text.replace(/\n/g, "<br/>")}</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Failed to send notification email (${res.status}): ${body}`);
  }
}
