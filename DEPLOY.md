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
- `/thank-you-last-human-job` is a static page, no Function needed.

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

## Deploy

Automatic: every push to `main` runs `.github/workflows/deploy-pages.yml`, once
the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets exist.

By hand, from the repository root so `functions/` is picked up:

```bash
npm ci
npm run build
npx wrangler pages deploy dist/public --project-name method-portfolio-preview --branch main
```

Use any other `--branch` name for a preview that leaves production alone.

## Test locally

```bash
npx wrangler pages dev dist/public --binding STRIPE_SECRET_KEY=sk_test_... --binding STRIPE_PRICE_ID=price_... --binding BASE_URL=http://localhost:8788
```

## Roll back

Cloudflare dashboard > Workers & Pages > method-portfolio-preview >
Deployments, then "Rollback" on the last good production deployment.
