# haninandmoussa.com 💍

The engagement invitation site for Moussa & Hanin — a night-funfair themed
single page with a ring-box opening, confetti, a ticket card, and a
poll-style RSVP backed by Supabase.

## Files you'll actually touch

| File | What it's for |
|---|---|
| `js/config.js` | **The only file you edit.** Supabase keys + event date/time/venue/countdown. |
| `supabase/schema.sql` | Run once in the Supabase SQL Editor (edit the secret on the last line first). |

## Setup (once)

1. **Supabase**: create a free project at supabase.com → SQL Editor → paste
   `supabase/schema.sql` (after changing the `CHANGE-ME` secret) → Run.
2. **Keys**: Project Settings → API → copy the Project URL and the
   `anon public` key into `js/config.js`.
3. **Event details**: fill in `EVENT` in `js/config.js` whenever you know them.

Until the keys are pasted, the site runs in demo mode: everything works, but
answers only save in each visitor's own browser.

## Pages

- `/` — the invitation + RSVP poll.
- `/guests.html?key=YOUR-SECRET` — private guest list (the secret is the one
  you set in `schema.sql`; it's never stored in this repo).

## Deploy

GitHub Pages serves `main` at haninandmoussa.com (see `CNAME`).
DNS at your registrar:

```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  moussaws.github.io
```
