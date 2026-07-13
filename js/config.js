/* ============================================================
   EDIT ME — everything you'll ever need to change lives here
   ============================================================ */
window.CONFIG = {
  // --- Supabase (paste from supabase.com → Project Settings → API) ---
  // Leave both empty to run in demo mode (answers saved only in the visitor's browser).
  SUPABASE_URL: "https://tzdzpgdimosnbnobqelu.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_0mYxfDh9qSY3A9yImVYPNg_cXkjjped", // publishable key, safe to publish

  // --- Event details (shown on the ticket) ---
  EVENT: {
    date: "Saturday, July 25, 2026", // shown on the ticket; empty = "To be announced"
    time: "8:00 PM",                 // doors at eight
    venue: "Pete's Lounge",          // shown on the ticket
    venueUrl: "https://maps.app.goo.gl/PvWF4kUS3otfKby3A?g_st=ic", // makes the venue a clickable Maps link
    dress: "Bring your best smile",  // dress code line
    // Countdown target: Sat July 25, 2026 at 8:00 PM. (+03:00 = Egypt summer time.)
    countdownTo: "2026-07-25T20:00:00+03:00",
  },

  // --- Shared photo album ---
  // Paste your iCloud Shared Album link (looks like
  // "https://www.icloud.com/sharedalbum/#B0Abc...") to show the photo section.
  // Empty = the section stays hidden.
  PHOTOS: {
    albumUrl: "https://www.icloud.com/sharedalbum/#B24532ODWr0B3YE",
  },
};
