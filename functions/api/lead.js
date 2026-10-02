// /functions/api/lead.js
// CF Pages Function: POST /api/lead
// - Validates lead payload
// - Sends notification to business email via Resend
// - Sends branded reply-to-able confirmation to the visitor
//
// Required env vars (set in CF Pages → Settings → Functions):
//   LEAD_FROM    e.g. "My Custom ADU <hello@my-custom-adu.com>"
//   LEAD_TO      e.g. "leads@my-custom-adu.com" (where Anndy gets notified)
//   RESEND_API_KEY "re_..."
//
// Free Resend tier: 100 emails/day, 3,000/month — plenty for lead volume.

const FROM_DEFAULT = "My Custom ADU <hello@my-custom-adu.com>";
const TO_DEFAULT   = "leads@my-custom-adu.com"; // fallback if LEAD_TO not set

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function onRequestPost({ request, env }) {
  // CORS preflight
  if (request.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Required fields
  const { name, phone, email, zip, project_type, timeline, message } = body || {};
  if (!name || !phone || !email || !zip || !project_type || !timeline) {
    return json({ error: "Missing required fields" }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  // Defensive: env vars from CF UI sometimes include stray whitespace / newlines
  const FROM = (env && env.LEAD_FROM ? String(env.LEAD_FROM) : FROM_DEFAULT).replace(/\s+/g, " ").trim();
  const TO   = (env && env.LEAD_TO   ? String(env.LEAD_TO)   : TO_DEFAULT  ).replace(/\s+/g, " ").trim();
  const RESEND = env && env.RESEND_API_KEY;

  if (!RESEND) {
    return json({ error: "Email service not configured" }, 503);
  }

  const safeName    = escapeHtml(name);
  const safePhone   = escapeHtml(phone);
  const safeEmail   = escapeHtml(email);
  const safeZip     = escapeHtml(zip);
  const safeType    = escapeHtml(project_type);
  const safeTime    = escapeHtml(timeline);
  const safeMessage = escapeHtml(message || "(none)");

  const submittedAt = new Date().toISOString();

  // ----- Email to business owner -----
  const ownerSubject = `New ADU lead · ${safeName} · ${safeZip}`;
  const ownerHtml = `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#101827;line-height:1.55;">
  <div style="max-width:560px;margin:0 auto;padding:24px;background:#faf7f3;">
    <div style="background:#fff;border:1px solid #e3dccd;border-radius:10px;padding:24px;">
      <div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#c97b3f;font-weight:700;margin-bottom:8px;">New Lead</div>
      <h2 style="margin:0 0 16px;color:#0f2540;font-size:22px;">${safeName}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td style="padding:8px 0;color:#5b6573;width:140px;">Phone</td><td style="padding:8px 0;"><a href="tel:${safePhone.replace(/[^\d+]/g,'')}" style="color:#a55d28;font-weight:600;">${safePhone}</a></td></tr>
        <tr><td style="padding:8px 0;color:#5b6573;">Email</td><td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#a55d28;font-weight:600;">${safeEmail}</a></td></tr>
        <tr><td style="padding:8px 0;color:#5b6573;">ZIP code</td><td style="padding:8px 0;">${safeZip}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6573;">Project type</td><td style="padding:8px 0;">${safeType}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6573;">Timeline</td><td style="padding:8px 0;">${safeTime}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6573;vertical-align:top;">Notes</td><td style="padding:8px 0;">${safeMessage}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6573;">Submitted</td><td style="padding:8px 0;">${submittedAt}</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e3dccd;font-size:13px;color:#5b6573;">
        Reply directly to this email to contact the lead.
      </div>
    </div>
  </div>
</body></html>`.trim();

  const ownerText = `New ADU lead

Name:     ${name}
Phone:    ${phone}
Email:    ${email}
ZIP:      ${zip}
Project:  ${project_type}
Timeline: ${timeline}
Notes:    ${message || "(none)"}

Submitted ${submittedAt}`;

  // ----- Confirmation to visitor -----
  const visitorSubject = `We got your ADU estimate request — My Custom ADU`;
  const visitorHtml = `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#101827;line-height:1.55;">
  <div style="max-width:560px;margin:0 auto;padding:24px;background:#faf7f3;">
    <div style="background:#fff;border:1px solid #e3dccd;border-radius:10px;padding:32px 28px;">
      <div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#c97b3f;font-weight:700;margin-bottom:8px;">Estimate Request Received</div>
      <h2 style="margin:0 0 16px;color:#0f2540;font-size:24px;">Thanks, ${safeName}!</h2>
      <p>We got your request for a ${safeType.toLowerCase()} in the ${safeZip} area. We'll be in touch within 24 hours to schedule your free site visit.</p>
      <p style="margin-top:20px;">In the meantime, here's what to expect:</p>
      <ol style="padding-left:20px;color:#1a2533;">
        <li style="margin-bottom:8px;">A short call to confirm your goals and timeline</li>
        <li style="margin-bottom:8px;">A free in-person site visit at your lot</li>
        <li style="margin-bottom:8px;">A transparent written estimate — no pressure</li>
      </ol>
      <div style="margin-top:24px;padding:20px;background:#0f2540;color:#fff;border-radius:8px;">
        <strong style="display:block;margin-bottom:4px;color:#f0c39a;font-size:13px;letter-spacing:.1em;text-transform:uppercase;">Questions before we reach you?</strong>
        Call or text: <a href="tel:+17134050340" style="color:#fff;font-weight:700;">(713) 405-0340</a><br/>
        Email: <a href="mailto:hello@my-custom-adu.com" style="color:#fff;font-weight:700;">hello@my-custom-adu.com</a>
      </div>
      <p style="margin-top:24px;font-size:13px;color:#5b6573;">— The My Custom ADU team · Houston, TX</p>
    </div>
  </div>
</body></html>`.trim();

  const visitorText = `Thanks, ${name}!

We got your ADU estimate request and we'll reach out within 24 hours to schedule your free site visit.

Project: ${project_type}
ZIP: ${zip}

Questions before then? Call or text (713) 405-0340 or email hello@my-custom-adu.com.

— The My Custom ADU team
Houston, TX`;

  // ----- Send both emails via Resend -----
  try {
    const send = (payload) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Resend ${r.status}: ${text}`);
        }
        return r.json();
      });

    await Promise.all([
      send({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: ownerSubject,
        html: ownerHtml,
        text: ownerText,
      }),
      send({
        from: FROM,
        to: [email],
        subject: visitorSubject,
        html: visitorHtml,
        text: visitorText,
      }),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ error: "Failed to send email", detail: String(err.message || err) }, 502);
  }
}

export async function onRequestGet() {
  return json({ ok: true, hint: "POST JSON to submit a lead." });
}