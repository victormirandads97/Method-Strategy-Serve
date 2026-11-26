# Little Plot Books: owner handover

Shop at `https://little-plot-books.pages.dev/books/`. It uses a standalone Cloudflare Pages project: the storefront is a React app (`client/src/books/`), the server is Pages Functions
(`functions/api/books/`, `functions/_lib/books/`), orders live in D1 and photos and
customer proof PDFs in a private R2 bucket. Prices, stories and styles: `shared/books/`.

Live payments require the production print settings, private storage and payment credentials below.

## Where to see completed forms and photos

1. Go to `/books/owner` and sign in. **Orders** opens first and shows what's still to make.
2. Search by order number, email or the child's name, and filter by status or by test/live.
3. Open an order to see:
   - the full brief and every personal touch;
   - the characters, each with their uploaded photos (open or download each one);
   - the payment, the delivery address and the price breakdown.
4. **Export production brief** downloads a tidy text brief for your writer or illustrator.
   It contains no photos; download those separately from the order page.
5. Add private production notes on the same page. To ask the customer for something, use
   **Ask the customer for details**. That emails them and sets the order to *Awaiting details*.

Statuses: Awaiting payment, Payment failed, Paid, Awaiting details, In production,
Ready to deliver, Delivered, Cancelled. *Paid* is set only by the payment provider.

Each new paid order also emails `BOOKS_OWNER_NOTIFY_EMAIL` with a link to the order. The
email contains no child details and no photos.

## How to fulfil a printed order

1. Open the paid softcover or hardcover order in **Orders**.
2. Under **Customer proof**, select **Upload PDF and send for review**. The customer gets a
   private order link to read the PDF and either approve it or leave notes.
3. Check the proof status in the dashboard. If they request changes, apply their notes and
   upload a new revision. A customer can only approve the version they were shown.
4. Once the proof is approved, have the book printed and post it. Enter the carrier and
   tracking number, then select **Record shipping and email customer**.
5. The approved PDF is included. It is downloadable from the customer's order page as soon
   as they approve it. After shipping, the same page shows tracking and offers **Leave a review**.

Previously paid digital orders can still be fulfilled or accessed through their original workflow.

## Prices and promotions

Go to **Owner dashboard → Prices and settings**. Nothing on the homepage needs editing.

- **Formats**: switch each on or off and set its price, shipping, specs, turnaround,
  delivery line and Christmas order-by date. Each print format needs a shipping price before it can be switched on. Any blank field is simply not shown to customers.
- **Black Friday**: the default 20% campaign is scheduled for 27–30 November 2026 (Ireland time). The label, discount and dates are editable. It applies only:
  - between those dates;
  - to formats whose **reference price** box is ticked as genuine;
  - to the book price. Extra characters (€5 each) and shipping are never discounted, and
    every place that shows the sale says so.

  With a €47.99 verified reference, the book is €38.39, and €43.39 with one extra
  character (before shipping).
- **Christmas treatment**: the announcement bar, hand-drawn stars and greenery, all on or off.
- All prices are calculated in cents on the server from these settings. Orders keep the
  price they were paid at.

## Reviews

Customers review from their order page once the book is delivered. Every review waits in
**Reviews** for you to approve, reject or mark as spam:

- Approve genuine reviews, critical ones included.
- A review appears on the site only if you approve it **and** the customer ticked
  permission to publish.
- The homepage publishes approved reviews from live orders. Test reviews remain in the dashboard.
- "Verified purchase" appears only on reviews linked to a real order.

## Privacy, retention and deletion

- **Photos**:
  - Checked by file content (JPG, PNG or WebP, up to 12 MB). Location and other metadata is
    removed on upload.
  - Stored privately in R2. Only the customer's own browser sees them before ordering;
    after ordering, only you do, through the dashboard. Each photo link lasts 5 minutes
    and also needs your sign-in.
  - Never in emails, logs, analytics or public URLs.
- **Deleted automatically**:
  - unpaid drafts and their photos after 30 days;
  - photos of unpaid orders after 30 days;
  - photos of delivered or cancelled orders 30 days after delivery (change this in
    settings).
  - The clean-up runs whenever the dashboard or builder is used.
- **Delete now**: an order's photos can be deleted at once from its page.
- **Outside services**: list any service that will receive customer photos under
  *Outside providers* in settings. The upload page then names it. Leave it empty until
  you've approved a provider and its terms.
- **Marketing**: opt-in is a separate, unticked checkbox and is stored on the order. Photos
  are never used for marketing.
- **HEIC (iPhone) photos**: not accepted, because the server can't convert them yet. The
  upload says so and explains how to share as JPEG. iPhones usually convert automatically
  when uploading through a browser.

## Samples and styles

- Five sample ebooks, each with 20 pages: a front cover, an illustrated opening spread, eight illustrated story spreads and a back cover:
  - `/api/books/samples/snow-globe.pdf` (soft pastel)
  - `/api/books/samples/sock-dragon.pdf` (bold cartoon)
  - `/api/books/samples/moonlight-delivery.pdf` (comic book)
  - `/api/books/samples/little-wonders.pdf` (watercolour)
  - `/api/books/samples/small-parade.pdf` (cut-paper collage)
- **Text and characters**: text is real, selectable text. All children and pets are
  fictional, and each looks the same on every page.
- **Seven styles**: the homepage and builder show all seven (the five above, plus
  coloured-pencil storybook and textured gouache) on the same girl, dog and park.
- **Not included**: EPUB, because a fixed-layout picture-book EPUB can't yet be produced
  reliably here.
- **Sample art** lives under `client/public/books-art/`. The storefront, builder, sample reader and PDF endpoint use the new picture-book illustrations. Customer books are illustrated to order.

## Brand assets

`brand/little-plot-books/` has editable SVGs:
- `logo-horizontal.svg` and `logo-horizontal-dark.svg`
- `icon.svg` and `icon-dark.svg`
- `favicon.svg`

The wordmark uses Young Serif (free, OFL). Convert the text to outlines before sending the
logo to a printer. Fonts on the site are Young Serif and Figtree.

## Lifestyle photography

Pexels photography appears in the hero and personalisation section. See
[the sourcing record](stock-photos.md) for the photographer, licence and crop.

## Still needs your input before launch

Business settings, all in the dashboard:
- [ ] Real **turnaround** text for each format and real **Christmas order-by dates**.
      Until set, the site says timing is confirmed by email and makes no cutoff claim.
- [ ] **Softcover and hardcover**: print specs, page count, supplier, shipping prices and delivery lines.
      In the local test database it's switched on with values marked TEST; production
      starts with it switched off.
- [ ] **Reference prices**: tick them as genuine only if the book really sold at that
      price (e.g. the lowest price in the prior 30 days), then set the campaign dates.
- [ ] **Tax note**, once your accountant confirms the VAT treatment of ebooks and printed
      books.
- [ ] **Contact email** shown on the contact page.
- [ ] Your real **privacy policy and terms** pages, covering children's photos.

Credentials (Cloudflare Pages → Settings → Variables and Secrets, plus Bindings):

| Name | What |
| --- | --- |
| `BOOKS_DB` (D1 binding) | the database, e.g. `little-plot-books` |
| `BOOKS_BUCKET` (R2 binding) | private bucket for photos and ebooks |
| `BOOKS_TOKEN_SECRET` | 48+ random characters; signs order links and owner sessions |
| `BOOKS_OWNER_EMAIL`, `BOOKS_OWNER_PASSWORD_HASH` | your sign-in; hash made with `npm run books:owner-password` |
| `BOOKS_OWNER_NOTIFY_EMAIL` | where new-order emails go |
| `STRIPE_SECRET_KEY` | test key first; live key is ignored until `BOOKS_LIVE_SALES=on` |
| `STRIPE_WEBHOOK_SECRET` | from a Stripe webhook on `/api/books/stripe-webhook` with `checkout.session.completed`, `.async_payment_succeeded`, `.async_payment_failed`, `.expired` |
| `BOOKS_STRIPE_PAYPAL` | `auto` (asks Stripe whether PayPal is on), `on` or `off` |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` | only if PayPal isn't available inside Stripe |
| `RESEND_API_KEY`, `BOOKS_EMAIL_FROM` | sending email (verified sender domain) |
| `BOOKS_LIVE_SALES=on` | **only when you approve live payments** |

Never set `BOOKS_TEST_CHECKOUT` in production.

## Run and test locally

```bash
cp .dev.vars.example .dev.vars   # fill it in
npm run books:dev                # http://localhost:8788/books
```

The test checkout can pay or fail a payment. Emails appear at `/books/dev/outbox`.

## Production checklist (for your approval)

1. Create D1 and R2 and bind them, and set the secrets above, using Stripe **test** keys.
2. Deploy to a preview branch and run one test order of each format with Stripe test cards
   and Stripe's PayPal test flow.
3. Fill in the business settings above.
4. Approve. Then switch to live keys and set `BOOKS_LIVE_SALES=on`.


## Deploy the standalone shop

Set `BOOKS_PRODUCTION_DB_ID` to the ID of the standalone `little-plot-books` D1 database.
Once private R2 storage is ready, set `BOOKS_PRODUCTION_BUCKET` to its bucket name.
Run `npm run books:stage` from the repo root, then run
`./node_modules/.bin/wrangler pages deploy --cwd dist/little-plot-deploy --project-name little-plot-books --branch main`.
The staging build includes only the book shop and its Functions. Manage production
secrets on the standalone Pages project.
