# Deploying themethodco.co

The site is the Cloudflare Pages project `method-portfolio-preview`. The custom
domains `themethodco.co` and `www.themethodco.co` point at its production
branch, `main`.

## What gets deployed

- `dist/public/`: the static site, built by `npm run build`
- `functions/`: Pages Functions for the ebook sale
  - `/api/create-checkout-session` starts Stripe Checkout with the existing
    price. GET redirects (303) to Stripe, POST returns `{ url }`.
  - `/api/ebook-download?session_id=cs_...` checks with Stripe that the session
    is paid and bought this book, then returns the PDF.
  - `/api/leads` stores enquiries from both sales pages in D1 (POST), and
    exports them as CSV for you (GET, behind `LEADS_ADMIN_TOKEN`). The landing
    pages form posts to it from the same origin. The Method Instant Quotes form
    on calculators.themethodco.co posts to it cross-origin: CORS is answered
    only for that origin (and `*.method-calculators.pages.dev` previews), and a
    POST from any other browser origin is refused with 403. Each enquiry stores
    its enquiry type and the page it came from. No discount offers run today;
    an old offer code from a stale tab is ignored, never refused.
- `/thank-you-last-human-job` is a static page, no Function needed.
- `/landing-pages/` is the High-Conversion Landing Pages sales page, and
  `/landing-pages/demos/<name>/` its five demos. Plain HTML in
  `client/public/landing-pages/`, copied into the build as they are.

The ebook PDF lives in `private/`. `npm run build` copies it to
`functions/_generated/ebook.bin`, and Wrangler bundles it into the Function.
It is never one of the public files. Run the build before every deploy, or the
deploy stops with a missing-file error.

## Settings the Functions read

Set in Cloudflare: Pages project > Settings > Variables and Secrets. They are
not in this repository and must never be.

| Name | What |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID` | The existing price for The Last Human Job |
| `BASE_URL` | `https://themethodco.co`, used in Stripe's return links |
| `LEADS_ADMIN_TOKEN` | A long random password for downloading enquiries (secret) |

And one binding (Pages project > Settings > Bindings > Add > D1 database):

| Variable name | Database |
| --- | --- |
| `LEADS_DB` | A D1 database, for example `method-leads` (create it under Storage & Databases > D1) |

Every enquiry is also emailed to you through Formspree form `xkovloyk`, the
same form the older contact pages use. Set `FORMSPREE_FORM_ID` to use a
different form, or to `off` to stop the emails. In Formspree, keep reCAPTCHA
switched off for this form, or it will refuse submissions sent from the
server. The form succeeds if the enquiry was saved or emailed; it only shows
an error if both failed.

The `leads` table creates itself on the first enquiry. Until `LEADS_DB` is
bound, the form says the request was not saved and offers email instead; it
never shows a false success.

## WhatsApp buttons

WhatsApp is the main call to action on both sales pages. Every button opens a
chat with a message written for that product. The number lives in one place
per page: `CONFIG.whatsapp` in `sites/calculators/index.html`, and `WHATSAPP`
in the script of `client/public/landing-pages/index.html`. Clear it and the
buttons fall back to the WhatsApp Business link (without the message). Clicks
are reported as a Meta Pixel `Contact` event, a Google tag `whatsapp_click`
event or a dataLayer push, but only if one of those is already on the page.

## Reading enquiries

- Cloudflare dashboard > Storage & Databases > D1 > method-leads > Console:
  `SELECT * FROM leads ORDER BY id DESC;`
- Or download a CSV (works in Excel):

```bash
curl -H "Authorization: Bearer YOUR_LEADS_ADMIN_TOKEN" https://themethodco.co/api/leads -o leads.csv
```

## Deploy

Automatic: every push to `main` runs `.github/workflows/deploy-pages.yml`, once
the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets exist.
Until then the workflows pass but skip the deploy (they print a warning), so
deploy by hand as below.

By hand, from the repository root so `functions/` is picked up:

```bash
npm ci
npm run build
npx wrangler pages deploy dist/public --project-name method-portfolio-preview --branch main
```

Use any other `--branch` name for a preview that leaves production alone.

## Test locally

```bash
npx wrangler pages dev dist/public --d1 LEADS_DB=local-leads --binding LEADS_ADMIN_TOKEN=local-test --binding STRIPE_SECRET_KEY=sk_test_... --binding STRIPE_PRICE_ID=price_... --binding BASE_URL=http://localhost:8788
```

Then open http://localhost:8788/landing-pages/.

## The Method Instant Quotes site

`sites/calculators/` is the source of calculators.themethodco.co, a separate
Pages project called `method-calculators`. It is plain HTML with no build step.
`.github/workflows/deploy-calculators.yml` deploys it when that folder changes
on `main`; by hand, from inside the folder (from the repository root Wrangler
would also bundle the main site's `functions/` into this project):

```bash
cd sites/calculators && npx wrangler pages deploy . --project-name method-calculators --branch main
```

Its Stripe Payment Link is set in `CONFIG.stripeLink` near the bottom of
`sites/calculators/index.html`. Until a real link is there, the pay buttons
open WhatsApp instead.

Its enquiry form posts to `CONFIG.leadsEndpoint`
(`https://themethodco.co/api/leads`), so the main site must be deployed with
the CORS change before the form works from this origin. Opened on localhost,
the page posts to `http://localhost:8788/api/leads` instead; start
`wrangler pages dev` with
`--binding LEADS_EXTRA_ORIGINS=http://localhost:8790` (the port you serve
`sites/calculators` on).

## Roll back

Cloudflare dashboard > Workers & Pages > method-portfolio-preview >
Deployments, then "Rollback" on the last good production deployment.
