# moussaandhanin.com — Engagement invitation site (approved design)

Date: 2026-07-13. Approved by Moussa in-session.

## Goal
A playful, fun, extremely creative single-page invitation for Moussa & Hanin's
engagement outing, with a poll-style RSVP (name + coming / +1 / not sure / not
coming) and a secret guest-list page. English only. Event date/time/venue are
placeholders edited in one obvious config block.

## Stack (Option A — approved)
- Pure static HTML/CSS/JS, no framework, no build step, no external CDNs.
- Supabase (NEW dedicated free project, separate from Athletiq) stores RSVPs.
- Deployed on GitHub Pages (public repo) behind moussaandhanin.com.
- Domain purchased by Moussa at a registrar; DNS steps provided at the end.

## Experience
1. **Opening**: closed ring box on a festive gradient → tap → box springs
   open, ring + sparkle burst, confetti cannons, headline "He asked. She said
   YES!" swings in.
2. **Details**: ticket-style card with placeholder date/time/venue, live
   countdown timer, 3-emoji "our story" strip (👀 → ❤️ → 💍).
3. **RSVP poll**: name input + four oversized reaction cards:
   🎉 Wouldn't miss it! / 💃 Coming with a +1! / 🤔 Hmm, let me check /
   😢 Sadly can't make it. Card click = colored confetti + personalized
   thank-you. Live "N people are celebrating with us" counter (yes + plus_one
   only). Re-submitting the same name updates the previous answer.
4. **Secret page**: /guests.html?key=SECRET lists all responses + totals.

## Data / security design
- Table `rsvps(id, name text, name_key text unique (lowercased/trimmed),
  status text check in ('yes','plus_one','maybe','no'), created_at, updated_at)`.
- RLS enabled, NO direct policies — all access via SECURITY DEFINER functions:
  - `submit_rsvp(p_name, p_status)` — upsert by name_key.
  - `celebrating_count()` — count of yes/plus_one (public, powers counter).
  - `guest_list(p_key)` — returns rows only if p_key matches secret stored in
    a private `settings` table; else raises. Secret never committed to repo.
- Frontend uses anon key via plain fetch to PostgREST /rest/v1/rpc/* (no SDK).

## Out of scope (YAGNI)
Admin editing, email notifications, multiple events, i18n, analytics.
