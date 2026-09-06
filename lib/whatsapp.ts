/**
 * Sends a WhatsApp template message via Meta's Cloud API directly (no BSP fee).
 *
 * SETUP (one-time, free):
 * 1. Create a Meta App at developers.facebook.com -> add "WhatsApp" product
 * 2. Get a permanent access token + phone_number_id (Meta for Developers > WhatsApp > API Setup)
 * 3. Create & get approval for message templates in WhatsApp Manager, e.g.:
 *      Name: due_reminder
 *      Category: UTILITY
 *      Body: "Hi {{1}}, your gym membership is due on {{2}}. Please renew to continue enjoying access."
 *    Approval usually takes minutes to a few hours.
 * 4. Templates are the ONLY way to message someone who hasn't messaged you first (business-initiated).
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const API_VERSION = "v21.0";

export async function sendWhatsAppTemplate({
  to,               // e.g. "919876543210" (country code, no + or spaces)
  templateName,     // e.g. "due_reminder" or "overdue_alert"
  params,           // array of strings filling {{1}}, {{2}} ... in order
}: {
  to: string;
  templateName: string;
  params: string[];
}) {
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: params.map((p) => ({ type: "text", text: p })),
          },
        ],
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("WhatsApp send failed:", data);
    return { success: false, error: data };
  }
  return { success: true, data };
}
