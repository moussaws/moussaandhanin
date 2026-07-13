/* ============================================================
   EDIT ME — everything you'll ever need to change lives here
   ============================================================ */
window.CONFIG = {
  // --- Supabase (paste from supabase.com → Project Settings → API) ---
  // Leave both empty to run in demo mode (answers saved only in the visitor's browser).
  SUPABASE_URL: "",       // e.g. "https://abcdefgh.supabase.co"
  SUPABASE_ANON_KEY: "",  // the long "anon / public" key — safe to publish

  // --- Event details (shown on the ticket) ---
  EVENT: {
    date: "",                       // e.g. "Friday, Sept 4, 2026" — empty = "To be announced ✨"
    time: "",                       // e.g. "7:00 PM"
    venue: "",                      // e.g. "Nile Terrace, Cairo"
    dress: "Bring your best smile", // dress code line
    countdownTo: "",                // ISO date-time for the countdown, e.g. "2026-09-04T19:00:00+02:00"
                                    // empty = countdown hidden
  },
};
