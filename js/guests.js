/* Secret guest list — needs ?key=<secret> in the URL */
(function () {
  const cfg = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  const msg = $("guestsMsg");

  const LABELS = {
    yes:      "🎉 Wouldn't miss it",
    plus_one: "💃 Coming with a +1",
    maybe:    "🤔 Not sure yet",
    no:       "😢 Can't make it",
  };

  const key = new URLSearchParams(location.search).get("key");

  async function load() {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      msg.textContent = "Supabase isn't connected yet — paste your keys into js/config.js first.";
      return;
    }
    if (!key) {
      msg.textContent = "This page is for the happy couple only 💌 (missing key)";
      return;
    }
    try {
      const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/rpc/guest_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: cfg.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${cfg.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ p_key: key }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const rows = await res.json();

      const by = (s) => rows.filter((r) => r.status === s).length;
      $("tYes").textContent = by("yes");
      $("tPlus").textContent = by("plus_one");
      $("tMaybe").textContent = by("maybe");
      $("tNo").textContent = by("no");
      $("tHead").textContent = by("yes") + by("plus_one") * 2;
      $("totals").hidden = false;

      if (!rows.length) {
        msg.textContent = "No answers yet — send the link around! 📨";
        return;
      }
      const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
      $("guestRows").innerHTML = rows.map((r) =>
        `<tr><td>${r.name.replace(/</g, "&lt;")}</td>` +
        `<td class="status">${LABELS[r.status] || r.status}</td>` +
        `<td>${fmt.format(new Date(r.updated_at))}</td></tr>`).join("");
      $("guestTable").hidden = false;
      msg.textContent = "";
    } catch (_) {
      msg.textContent = "This page is for the happy couple only 💌 (wrong key?)";
    }
  }
  load();
})();
