# Deploy prompt for Codex

Copy everything below the line into Codex.

---

You are deploying two Cloudflare Pages sites for The Method Co. The code is finished, tested and merged to `main` of `victormirandads97/Method-Strategy-Serve` (merge commit `e87cf3000ba25320045df61d1c9bb8fb2ed50c4c`). Your job is deployment, configuration and verification only. Do not redesign or rewrite features.

## Context

- Cloudflare account ID: `af175164c646167744368bafa1b07088`
- Both Pages projects are **direct upload** projects (not connected to Git). Pushing to GitHub does not deploy them.
- A previous agent could not deploy from its sandbox: its network proxy replaced Cloudflare's short-lived Pages upload token (JWT) with an account token, so `/pages/assets/check-missing` returned `8000013 Authorization failed`. Deploy from a normal machine or CI with a real Cloudflare API token (permission: Cloudflare Pages Edit, plus D1 Edit for step 2).
- Read `DEPLOY.md` in the repo first. It is the source of truth.

## Site 1: themethodco.co

- Pages project: `method-portfolio-preview` (custom domains `themethodco.co`, `www.themethodco.co`, production branch `main`)
- Current production deployment, the **rollback point**: `1d15038a-d92e-415c-8651-338796951074`. Do not delete it.
- Build: `npm ci && npm run build` (outputs `dist/public/`; the build also copies `private/The_Last_Human_Job_-_ebook.pdf` to `functions/_generated/ebook.bin`, which the Functions bundle; the deploy fails if the build was skipped)
- Deploy from the repo root so `functions/` is included:
  `npx wrangler pages deploy dist/public --project-name method-portfolio-preview --branch main`
- Pages Functions in `functions/`:
  - `/api/create-checkout-session`: Stripe Checkout for the ebook (GET answers 303 to Stripe, POST answers `{ url }`)
  - `/api/ebook-download?session_id=cs_...`: returns the PDF only for a paid session of `STRIPE_PRICE_ID`
  - `/api/leads`: POST saves landing-page enquiries to D1; GET exports CSV behind `LEADS_ADMIN_TOKEN`
- Existing env vars on the project (keep them, do not overwrite or delete): `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `BASE_URL`. **Be careful with any API call that edits the project's deployment configs; a wrong PATCH could wipe the Stripe secrets, which cannot be recovered from the API.** Prefer the dashboard for config changes.
- Do not add a `wrangler.toml` for this project; it would make the file the source of truth and override dashboard settings.

## Site 2: calculators.themethodco.co (Instant Pricing Tool)

- Pages project: `method-calculators`
- Source: `sites/calculators/` (plain HTML, no build step)
- Deploy: `npx wrangler pages deploy sites/calculators --project-name method-calculators --branch main`
- Note `CONFIG.stripeLink` in `sites/calculators/index.html` is still `https://buy.stripe.com/REPLACE_ME`. That is expected: pay buttons fall back to WhatsApp. Do not invent a link. Ask the owner for their €150 Stripe Payment Link if they want it wired; the amount charged must stay €150.

## Steps

1. Record the current production deployment IDs of both projects (rollback points).
2. Lead storage for `/api/leads`:
   - Create a D1 database named `method-leads` (if it does not exist).
   - Bind it to `method-portfolio-preview` for **production and preview** with the variable name `LEADS_DB` (dashboard: Workers & Pages > method-portfolio-preview > Settings > Bindings > Add > D1 database).
   - Add a secret `LEADS_ADMIN_TOKEN` with a long random value, and give that value to the owner privately (not in a commit or log).
   - The `leads` table creates itself on the first enquiry; no migration needed.
3. Preview first: deploy `method-portfolio-preview` with `--branch preview-rebrand` (any non-`main` name makes a preview and leaves production untouched) and verify it (checks below).
4. Deploy production for both projects with the commands above.
5. Optional, for future automatic deploys: add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub. The workflows `.github/workflows/deploy-pages.yml` and `deploy-calculators.yml` then deploy on every push to `main` (they skip the deploy until the secrets exist).

## Verify (preview, then production)

- `/`: new green "M" logo in the header, a green "Landing pages" link in the nav, and a "Ready-made offers" section showing Instant Pricing Tool (€299 crossed out, €150) and High-Conversion Landing Pages (from €250)
- `/landing-pages/` loads, and the five demos load: `/landing-pages/demos/cleaning/`, `beauty/`, `renovation/`, `fitness/`, `restaurant/`
- Lead form on `/landing-pages/#start`: submit a test enquiry, expect the green "Request received" message; confirm the row in D1 (`SELECT * FROM leads ORDER BY id DESC;`), then delete the test row. Without the binding the form shows "your request wasn't saved"; that means step 2 is missing.
- `curl -H "Authorization: Bearer <LEADS_ADMIN_TOKEN>" https://themethodco.co/api/leads` returns CSV; without the header it returns 401
- `curl -sI https://themethodco.co/api/create-checkout-session` returns 303 to `checkout.stripe.com` (opening the session charges nothing; do not complete a payment unless the owner wants a real test)
- `https://themethodco.co/api/ebook-download?session_id=cs_test_x` returns 403 (not a PDF), and no public URL serves the PDF
- `/last-human-job`, `/thank-you-last-human-job`, `/work/onishi`, `/work/dezorzi`, `/privacy`, `/terms`, `/insights/`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg` all return 200
- `https://calculators.themethodco.co/`: header shows the new logo and "THE METHOD CO.", the offer bar reads "Instant Pricing Tool for ~~€299~~ €150", there is no ticking countdown, and the five demos open from the "Try them, they work" section

If production checks fail: roll back in the dashboard (Deployments > the recorded deployment > Rollback) and report what failed.

## Report back

Deployment URLs and IDs for both projects, which checks passed, whether rollback was needed, and the `LEADS_ADMIN_TOKEN` handed to the owner privately.
