# My Custom ADU — Deploy Checklist

The site is built and pushed to GitHub. **One 60-second manual step** completes deployment, then every future commit auto-deploys via the proven Cloudflare Pages + GitHub pipeline.

---

## What I did

| Step | Status |
|---|---|
| Domain `my-custom-adu.com` registered on Cloudflare | ✅ Done |
| Site scaffolded in `~/my-custom-adu/` (homepage + lead function + favicons + sitemap + schema) | ✅ Done |
| Local preview tested at `http://127.0.0.1:8777/` | ✅ Verified |
| HTML/CSS sanity check passed | ✅ Done |
| Visual review — desktop + mobile | ✅ Verified |
| Mobile hamburger nav works | ✅ Verified |
| Contact form UX (form submit, status messages) | ✅ Wired (needs Resend to send actual email) |
| GitHub repo created: `anndygarcia/my-custom-adu` | ✅ Pushed |
| Cloudflare Pages project `my-custom-adu` created | ✅ Created |

---

## Step 1 — Connect GitHub → Cloudflare Pages (60 sec)

1. Open **https://dash.cloudflare.com/** → Pages → `my-custom-adu`
2. Click **"Connect to Git"**
3. Pick **GitHub** → authorize Cloudflare
4. Select repo **anndygarcia/my-custom-adu** → branch **main**
5. Build settings:
   - **Build command:** *(leave blank)*
   - **Build output directory:** *(leave blank)*
   - **Root directory:** *(leave blank)*
6. Click **Save and Deploy**
7. Wait ~30s for first deploy → you'll get `https://my-custom-adu.pages.dev`

Once the Pages project is connected to GitHub, every `git push` auto-deploys. No API calls ever needed.

---

## Step 2 — Add custom domain `my-custom-adu.com`

After Step 1's first deploy succeeds:

1. In the same Pages project → **Custom domains** → Set up a custom domain
2. Type `my-custom-adu.com`
3. Cloudflare will automatically create the DNS record (it's already on Cloudflare, so this is instant)
4. HTTPS cert auto-issued in ~2 min by Google CA

---

## Step 3 — Add Resend API key to the contact form (5 min, optional for launch)

The site works without this — form just shows a fallback "call us" note. To enable real lead delivery:

1. Sign up free at **https://resend.com** (no card, 100 emails/day)
2. Add domain `my-custom-adu.com` → copy the DNS records they give you
3. In Cloudflare DNS for `my-custom-adu.com`, add those 3 records (DKIM, SPF, DMARC)
4. Wait ~10 min for Resend to verify
6. In Cloudflare Pages → `my-custom-adu` → Settings → Functions → **Environment variables**:
   - `RESEND_API_KEY` = `re_xxxxxxxxx` (from Resend dashboard)
   - `LEAD_FROM` = `My Custom ADU <hello@my-custom-adu.com>`
   - `LEAD_TO` = `leads@my-custom-adu.com` *(or any email where you want them)*
7. Push any tiny commit (e.g. `echo "# seed" >> README.md && git push`) to redeploy Functions with the env vars bound.

---

## Step 4 — Configure `hello@my-custom-adu.com` to forward to your real inbox (3 min)

Cloudflare Email Routing is free and doesn't require any external service:

1. Cloudflare Dashboard → `my-custom-adu.com` → **Email** → **Email Routing**
2. Enable Email Routing
3. Add destination: your real email (e.g. Gartexbuilders@gmail.com or similar)
4. Add custom address: `hello@my-custom-adu.com` → routes to your real inbox
5. Verify your real email when Cloudflare sends the confirmation

---

## What's left after Step 1

| Task | When |
|---|---|
| Step 2: Custom domain | 2 min after first deploy |
| Step 3: Resend setup | 5 min, optional for launch |
| Step 4: Email routing | 3 min, optional for launch |
| 3 service subpages (`/framing-houston/`, `/garage-conversion-houston/`, `/casita-houston/`) | After Step 1 lands |
| Google Business Profile setup | After you have a real address to share |
| 4-6 blog posts (cost, ROI, HOA, timeline) | Week 2-3 |
| Real project photos & case studies | As projects complete |

Tell me when Step 1 is done and I'll continue.