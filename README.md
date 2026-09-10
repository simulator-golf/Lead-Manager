# Lead Manager

A cold-calling lead management tool:

- **Upload a CSV of leads** — automatically split into balanced groups of 50, sorted so
  high- and low-revenue leads are spread evenly across groups (each group's total revenue
  ends up roughly equal).
- **Promos** — create a promo, then generate a call list of everyone who hasn't been
  called for it yet (also in balanced groups of 50). Upload a CSV export of call
  outcomes from your dialer to mark leads as called for a promo (matched by phone or
  email), so the next generated list automatically excludes them.
- **CSV downloads** — every group (and whole lists) can be downloaded as a CSV, ready to
  import straight into Google Sheets.
- **List requests** — a public, no-login page at `/request` where people can request a
  new list. You get an email notification each time (and a queue at `/requests` to track
  and mark them fulfilled).
- Everything except `/request` and `/login` requires the single admin password.

## Setup

```bash
npm install
cp .env.example .env   # then edit the values below
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (`.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | SQLite file, defaults to `file:./dev.db` (stored in `prisma/`). |
| `ADMIN_PASSWORD` | Yes | The one password used to log in. Change it from the default. |
| `SESSION_SECRET` | Yes | Long random string used to sign the login session cookie. |
| `RESEND_API_KEY` | No | API key from [resend.com](https://resend.com) for sending the "new list request" email. If unset, notifications are just logged to the server console instead of emailed — useful for local dev. |
| `NOTIFY_EMAIL` | Yes | Where list-request notifications are sent. |
| `FROM_EMAIL` | No | The "from" address for notification emails. Must be a verified sender/domain in Resend, or use `onboarding@resend.dev` for testing. |

## CSV formats

**Lead upload** (`/upload`) needs a `name` column and a revenue column (any of
`revenue`, `spent`, `amount`, `total spent`, `value`, `ltv`, ...). `phone`, `email`, and
`company` columns are optional but recommended — `phone`/`email` are used to match call
outcomes later. Column names are matched case-insensitively and don't need to be in any
particular order.

**Call outcome upload** (on a promo's page) needs a `phone` and/or `email` column to
match against existing leads (phone numbers are normalized to digits before matching, so
formatting differences like `(555) 123-4567` vs `555-123-4567` still match). An optional
`outcome`/`result`/`status` column is stored for reference.

## How grouping works

See `src/lib/grouping.ts`. Leads are sorted by revenue (highest first), then dealt out
one at a time to whichever group currently has the lowest running total — skipping any
group that has already reached its target size. Every group ends up at exactly 50
members except the last, which gets whatever's left over (e.g. 130 leads → groups of 50,
50, and 30), while keeping each group's total revenue close to the others.

## Deployment

This app needs a writable filesystem for its SQLite database, so a serverless platform
like plain Vercel won't persist data between requests. It deploys cleanly to any host
with a persistent disk — e.g. a small VPS, Railway, Fly.io, or a Docker container with a
mounted volume for the `prisma/` directory. Run `npx prisma migrate deploy` once against
the production `DATABASE_URL` before starting the app.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + SQLite, [Resend](https://resend.com)
for email.
