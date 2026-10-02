# My Custom ADU — Houston Metro Custom Builder

Custom ADU builder serving the Houston metropolitan area. Detached cottages, garage conversions, casitas.

## Stack
- Static HTML/CSS site
- Cloudflare Pages hosting
- Cloudflare Pages Function (`functions/api/lead.js`) for the contact form
- Resend for transactional email

## Local preview
```bash
cd ~/my-custom-adu
python3 -m http.server 8765
# Open http://localhost:8765
```

## Environment variables (CF Pages → Settings → Functions)
- `LEAD_FROM` — sender identity, e.g. `My Custom ADU <hello@my-custom-adu.com>`
- `LEAD_TO` — destination for lead notifications, e.g. `leads@my-custom-adu.com`
- `RESEND_API_KEY` — `re_...`

## Deploy
```bash
git add .
git commit -m "describe change"
git push origin main
```

Cloudflare Pages auto-deploys on push. Verify at https://my-custom-adu.com.

## Phone / email / business
- Phone: (713) 405-0340
- Email: hello@my-custom-adu.com
- Service area: Houston metropolitan area (Harris, Fort Bend, Montgomery, Galveston)
