# Fix: phone + email being mangled on my-custom-adu.com

**What's happening:** Cloudflare's free "Email Obfuscation" feature is auto-replacing every email and phone-shaped number on the page with `[email protected]` spans and `+171****0340` masks. It makes the page look broken and breaks tap-to-call.

**The fix is a one-click toggle in the dashboard.** 30 seconds:

---

## Steps

1. Open: **https://dash.cloudflare.com/?to=/:account/my-custom-adu.com/security**
   (or: Cloudflare → `my-custom-adu.com` → **Security** → **Settings**)
2. Scroll to **"Email Obfuscation"** section
3. Toggle it **OFF**
4. Wait ~30 seconds for the change to propagate

---

## After it's off

The site's HTML on the edge is currently cached. Two ways to refresh:

**Easiest:** Hard-refresh your browser — Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows).

**Or just wait** — the cache will pick up the new behavior naturally as you make changes. I've already pushed a deploy that fixes the function env-var binding, so the form should also start working once your Resend env vars are bound** AND** the CF Pages Functions runtime picks them up (already pushed `eff035e` for that — waiting on your next deploy after you finish setting up Resend).

---

## Why this works

CF Email Obfuscation is a free "Scrape Shield" feature. It's great when you're a blogger worried about scrapers stealing your email. But for a service-business site where every email/phone IS the call-to-action, it actively hurts you. Turning it off = the page renders your real phone and email as written.

If you want email obfuscation back on for other domains later, you can — it's per-domain. Only `my-custom-adu.com` is affected.