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
- **Live Google Sheets feed** — a continuously-updating view of every lead's called
  status per promo, pullable straight into a Sheet with `IMPORTDATA` (no export clicks,
  no Google account setup). See "Google Sheets feed" below.
- Everything except `/request`, `/login`, and `/api/export/*` requires the single admin
  password.

## Setup

You'll need a Postgres database (a free one from [Neon](https://neon.tech) or
[Supabase](https://supabase.com) works fine, or run one locally).

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
| `DATABASE_URL` | Yes | Postgres connection string, e.g. `postgresql://user:password@host:5432/dbname`. |
| `ADMIN_PASSWORD` | Yes | The one password used to log in. Change it from the default. |
| `SESSION_SECRET` | Yes | Long random string used to sign the login session cookie. |
| `RESEND_API_KEY` | No | API key from [resend.com](https://resend.com) for sending the "new list request" email. If unset, notifications are just logged to the server console instead of emailed — useful for local dev. |
| `NOTIFY_EMAIL` | Yes | Where list-request notifications are sent. |
| `FROM_EMAIL` | No | The "from" address for notification emails. Must be a verified sender/domain in Resend, or use `onboarding@resend.dev` for testing. |
| `EXPORT_TOKEN` | Yes (if using the Sheets feed) | Secret required as `?token=` on `/api/export/*` feeds, since Google Sheets can't send a login cookie. Anyone with this value and your app's URL can read the exported data — keep it private, don't share the full feed URL. |

## CSV formats

**Lead upload** (`/upload`) needs a `name` column (or separate `first name` /
`last name` columns — either works) and a revenue column (any of `revenue`, `spent`,
`amount`, `total spent`, `lifetime spend`, `value`, `ltv`, ...). `phone`, `email`, and
`company` columns are optional but recommended — `phone`/`email` are used to match call
outcomes later, and also as a fallback name if a row has no name filled in at all.
Column names are matched case-insensitively and don't need to be in any particular
order; extra columns (like a CRM's internal ID) are ignored.

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

## Google Sheets feed

`GET /api/export/call-status?token=YOUR_EXPORT_TOKEN` returns a CSV with one row per
lead (name, phone, email, company, revenue) and one column per promo showing the date
that lead was marked called for it (blank if not yet called). It requires no session —
just the `EXPORT_TOKEN` value as a query param — so Google Sheets can pull it directly.

In a Google Sheet, put this in cell A1:

```
=IMPORTDATA("https://your-app.vercel.app/api/export/call-status?token=YOUR_EXPORT_TOKEN")
```

Google refreshes `IMPORTDATA` automatically every so often (and whenever the sheet is
opened) — it's not instant, but it keeps the Sheet current without anyone touching a
CSV. Treat that formula as sensitive: whoever can see it can see the whole feed.

## Deployment

Deploys cleanly to Vercel (or any Node host). The `build` script runs
`prisma migrate deploy` automatically before `next build`, so migrations apply on every
deploy — just set `DATABASE_URL` (and the other env vars above) in the platform's project
settings. A free Postgres database from Neon or Supabase is enough for this app's scale.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + Postgres, [Resend](https://resend.com)
for email.
