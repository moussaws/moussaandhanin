/* Moussa & Hanin : invitation logic */
(function () {
  const cfg = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  const live = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  /* ---------- Supabase RPC (plain fetch, no SDK) ---------- */
  async function rpc(fn, args) {
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${cfg.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(args || {}),
    });
    if (!res.ok) throw new Error(`rpc ${fn} failed: ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  /* demo mode: pretend-backend in localStorage so the page still works
     before Supabase keys are pasted in */
  const demo = {
    submit(name, status) {
      const all = JSON.parse(localStorage.getItem("demo_rsvps") || "{}");
      all[name.trim().toLowerCase()] = { name: name.trim(), status };
      localStorage.setItem("demo_rsvps", JSON.stringify(all));
    },
    count() {
      const all = JSON.parse(localStorage.getItem("demo_rsvps") || "{}");
      return Object.values(all).reduce(
        (n, r) => n + (r.status === "yes" ? 1 : r.status === "plus_one" ? 2 : 0), 0);
    },
  };

  /* ---------- intro: the ring box ---------- */
  const intro = $("intro");
  const ringbox = $("ringbox");
  const party = $("party");
  let opened = false;

  ringbox.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    ringbox.classList.add("open");
    $("introHint").textContent = "she said yes 🥹";
    setTimeout(() => {
      party.hidden = false;
      party.setAttribute("data-revealed", "");
      Confetti.cannons();
      intro.classList.add("closed");
      setTimeout(() => intro.remove(), 700);
    }, 900);
  });

  /* ---------- festoon bulbs ---------- */
  (function bulbs() {
    const g = $("bulbs");
    const colors = ["#FF5D73", "#FFC94D", "#4DDBB0", "#5AA9FF"];
    const pathY = (x) => {
      // roughly follow the festoon curve M0,20 Q300,105 600,45 T1200,25
      const t = x / 1200;
      return 20 + 90 * Math.sin(Math.PI * t) * (t < 0.5 ? 1 : 0.55);
    };
    let svg = "";
    for (let i = 1; i <= 14; i++) {
      const x = i * 80;
      const y = pathY(x) + 9;
      const c = colors[i % colors.length];
      svg += `<line x1="${x}" y1="${y - 9}" x2="${x}" y2="${y - 2}" stroke="#1F0F3D" stroke-width="2"/>` +
             `<circle class="bulb" cx="${x}" cy="${y + 5}" r="7" fill="${c}" opacity=".95"/>`;
    }
    g.innerHTML = svg;
  })();

  /* ---------- ticket facts ---------- */
  const tba = "To be announced";
  $("factDate").textContent = cfg.EVENT.date || tba + " ✨";
  $("factTime").textContent = cfg.EVENT.time || tba;
  $("factDress").textContent = cfg.EVENT.dress || "Come as you are";

  if (cfg.EVENT.venue && cfg.EVENT.venueUrl) {
    const a = document.createElement("a");
    a.href = cfg.EVENT.venueUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "venue-link";
    a.textContent = cfg.EVENT.venue + " ↗";
    $("factVenue").textContent = "";
    $("factVenue").appendChild(a);
  } else {
    $("factVenue").textContent = cfg.EVENT.venue || tba;
  }

  /* ---------- countdown ---------- */
  if (cfg.EVENT.countdownTo) {
    const target = new Date(cfg.EVENT.countdownTo).getTime();
    if (!isNaN(target)) {
      $("countdown").hidden = false;
      const pad = (n) => String(n).padStart(2, "0");
      const tickCd = () => {
        const d = Math.max(0, target - Date.now());
        $("cdD").textContent = Math.floor(d / 864e5);
        $("cdH").textContent = pad(Math.floor(d / 36e5) % 24);
        $("cdM").textContent = pad(Math.floor(d / 6e4) % 60);
        $("cdS").textContent = pad(Math.floor(d / 1e3) % 60);
      };
      tickCd();
      setInterval(tickCd, 1000);
    }
  }

  /* ---------- shared photo album ---------- */
  if (cfg.PHOTOS && cfg.PHOTOS.albumUrl) {
    $("photosBtn").href = cfg.PHOTOS.albumUrl;
    $("photos").hidden = false;
  }

  /* ---------- the great pet-off ---------- */
  (function petoff() {
    const CATS = ["pistachio", "leo"];
    const HEARTS = {
      pistachio: ["#4DDBB0", "#FF9EB0", "#FFF4E4"],
      leo:       ["#FFC94D", "#FF9EB0", "#FFF4E4"],
    };
    const el = {
      pistachio: { btn: $("petPistachio"), count: $("countPistachio"), crown: $("crownPistachio") },
      leo:       { btn: $("petLeo"),       count: $("countLeo"),       crown: $("crownLeo") },
    };
    let counts = { pistachio: 0, leo: 0 };
    let pending = { pistachio: 0, leo: 0 };
    let flushTimer = null;
    let cloud = live; // falls back to local-only if the SQL hasn't been run yet

    const localLoad = () => { try { return JSON.parse(localStorage.getItem("cat_pets_local") || "null"); } catch (_) { return null; } };
    const localSave = () => localStorage.setItem("cat_pets_local", JSON.stringify(counts));

    function render() {
      const p = counts.pistachio, l = counts.leo, total = p + l;
      el.pistachio.count.textContent = p.toLocaleString();
      el.leo.count.textContent = l.toLocaleString();
      el.pistachio.crown.hidden = !(p > l);
      el.leo.crown.hidden = !(l > p);
      const share = total ? Math.round((p / total) * 100) : 50;
      $("tugP").style.width = Math.max(6, Math.min(94, share)) + "%";
      $("tugL").style.width = (100 - Math.max(6, Math.min(94, share))) + "%";
      const cap = $("tugCaption");
      if (!total) cap.textContent = "Tap a cat to cast your pets.";
      else if (p === l) cap.textContent = "A perfect tie. The cats demand a recount.";
      else if (p > l) cap.textContent = `Pistachio leads by ${(p - l).toLocaleString()} ${p - l === 1 ? "pet" : "pets"} 👑`;
      else cap.textContent = `Leo leads by ${(l - p).toLocaleString()} ${l - p === 1 ? "pet" : "pets"} 👑`;
    }

    async function flush(cat) {
      const n = Math.min(pending[cat], 50);
      if (!n || !cloud) return;
      pending[cat] -= n;
      try {
        const serverCount = await rpc("pet_cat", { p_cat: cat, p_count: n });
        counts[cat] = serverCount + pending[cat];
        render();
      } catch (_) {
        cloud = false;            // table missing or offline: keep counting locally
        localSave();
      }
      if (pending[cat] > 0) flush(cat);
    }

    function scheduleFlush(cat) {
      if (!cloud) { localSave(); return; }
      if (pending[cat] >= 25) { flush(cat); return; }
      clearTimeout(flushTimer);
      flushTimer = setTimeout(() => CATS.forEach(flush), 1200);
    }

    function pet(cat, evt) {
      counts[cat] += 1;
      pending[cat] += 1;
      render();
      scheduleFlush(cat);

      const btn = el[cat].btn;
      btn.classList.remove("petting");
      void btn.offsetWidth;
      btn.classList.add("petting");
      clearTimeout(btn._petTimer);
      btn._petTimer = setTimeout(() => btn.classList.remove("petting"), 800);

      // floating +1 near the tap
      const card = btn.closest(".cat-card");
      const plus = document.createElement("span");
      plus.className = "pet-plus";
      plus.textContent = "+1 ❤";
      const r = card.getBoundingClientRect();
      const x = evt && evt.clientX ? evt.clientX - r.left : r.width / 2;
      plus.style.left = Math.max(10, Math.min(r.width - 30, x)) + "px";
      plus.style.top = "38%";
      card.appendChild(plus);
      setTimeout(() => plus.remove(), 850);

      if (counts[cat] % 10 === 0) Confetti.burstAt(btn, HEARTS[cat]);
    }

    el.pistachio.btn.addEventListener("click", (e) => pet("pistachio", e));
    el.leo.btn.addEventListener("click", (e) => pet("leo", e));
    window.addEventListener("beforeunload", () => { if (!cloud) localSave(); });

    (async () => {
      if (cloud) {
        try {
          const rows = await rpc("pet_counts");
          rows.forEach((r) => { counts[r.cat] = Number(r.count); });
        } catch (_) {
          cloud = false;
          const saved = localLoad();
          if (saved) counts = saved;
        }
      } else {
        const saved = localLoad();
        if (saved) counts = saved;
      }
      render();
    })();
  })();

  /* ---------- live headcount ---------- */
  async function refreshCount() {
    try {
      const n = live ? await rpc("celebrating_count") : demo.count();
      if (n > 0) {
        $("rsvpCount").textContent = `🥳 ${n} ${n === 1 ? "person is" : "people are"} celebrating with us so far`;
        $("rsvpCount").hidden = false;
      }
    } catch (_) { /* counter is a nice-to-have; stay quiet */ }
  }
  refreshCount();

  /* ---------- RSVP poll ---------- */
  const nameInput = $("guestName");
  const choices = $("choices");
  const hint = $("nameHint");
  const errBox = $("rsvpError");

  const MESSAGES = {
    yes:      { emoji: "🎉", msg: (n) => `You're on the list, ${n}! See you there!` },
    plus_one: { emoji: "💃", msg: (n) => `${n} +1! The more, the merrier. Two seats saved.` },
    maybe:    { emoji: "🤔", msg: (n) => `No pressure, ${n}. The door (and the cake) will be waiting.` },
    no:       { emoji: "🥺", msg: (n) => `We'll miss you, ${n}. You owe us a dance some other day!` },
  };
  const CARD_COLORS = {
    yes:      ["#FFC94D", "#FFF4E4", "#FF5D73"],
    plus_one: ["#FF5D73", "#FFC94D", "#FFF4E4"],
    maybe:    ["#5AA9FF", "#4DDBB0", "#FFF4E4"],
    no:       ["#B7A8D6", "#FFF4E4", "#5AA9FF"],
  };

  const nameOk = () => nameInput.value.trim().length >= 2;

  function syncLock() {
    choices.classList.toggle("locked", !nameOk());
    if (nameOk()) hint.textContent = "";
  }
  nameInput.addEventListener("input", syncLock);

  // prefill if they've answered before on this device
  try {
    const prev = JSON.parse(localStorage.getItem("my_rsvp") || "null");
    if (prev && prev.name) {
      nameInput.value = prev.name;
      if (prev.status) showDone(prev.name, prev.status, false);
    }
  } catch (_) {}
  syncLock();

  function showDone(name, status, celebrate) {
    const m = MESSAGES[status];
    $("doneEmoji").textContent = m.emoji;
    $("doneMsg").textContent = m.msg(name);
    $("rsvpForm").hidden = true;
    $("rsvpDone").hidden = false;
    if (celebrate && (status === "yes" || status === "plus_one")) Confetti.cannons(CARD_COLORS[status]);
  }

  choices.addEventListener("click", async (e) => {
    const btn = e.target.closest(".choice");
    if (!btn) return;
    errBox.hidden = true;

    if (!nameOk()) {
      choices.classList.remove("shake");
      void choices.offsetWidth; // restart animation
      choices.classList.add("shake");
      hint.textContent = "Type your name first 😉";
      nameInput.focus();
      return;
    }

    const name = nameInput.value.trim();
    const status = btn.dataset.status;
    btn.classList.add("sending");
    try {
      if (live) await rpc("submit_rsvp", { p_name: name, p_status: status });
      else demo.submit(name, status);
      localStorage.setItem("my_rsvp", JSON.stringify({ name, status }));
      Confetti.burstAt(btn, CARD_COLORS[status]);
      showDone(name, status, true);
      refreshCount();
    } catch (err) {
      errBox.textContent = "Hmm, that didn't go through. Check your internet and try again?";
      errBox.hidden = false;
    } finally {
      btn.classList.remove("sending");
    }
  });

  $("changeMind").addEventListener("click", () => {
    $("rsvpDone").hidden = true;
    $("rsvpForm").hidden = false;
    nameInput.focus();
  });
})();
