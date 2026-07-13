/* Tiny hand-rolled canvas confetti — no dependencies. */
(function () {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pieces = [];
  let running = false;

  function fit() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  window.addEventListener("resize", fit);
  fit();

  const SHAPES = ["rect", "rect", "circle", "heart"];

  function spawn(x, y, angle, spread, count, colors, power) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = power * (0.5 + Math.random() * 0.7);
      pieces.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 7,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        shape: SHAPES[(Math.random() * SHAPES.length) | 0],
        life: 1,
        decay: 0.004 + Math.random() * 0.006,
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function drawHeart(p) {
    const s = p.w / 14;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.bezierCurveTo(-8 * s, -4 * s, -3 * s, -9 * s, 0, -4 * s);
    ctx.bezierCurveTo(3 * s, -9 * s, 8 * s, -4 * s, 0, 4 * s);
    ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    for (const p of pieces) {
      p.vy += 0.18;          // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === "heart") {
        drawHeart(p);
      } else {
        ctx.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2);
      }
      ctx.restore();
    }
    if (pieces.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  const PARTY = ["#FF5D73", "#FFC94D", "#4DDBB0", "#5AA9FF", "#FFF4E4"];

  window.Confetti = {
    /* two cannons from bottom corners + a center burst */
    cannons(colors) {
      if (reduced) return;
      const c = colors || PARTY;
      const h = window.innerHeight, w = window.innerWidth;
      spawn(0, h * 0.9, -Math.PI / 3.2, 0.6, 70, c, 16);
      spawn(w, h * 0.9, Math.PI + Math.PI / 3.2, 0.6, 70, c, 16);
      setTimeout(() => spawn(w / 2, h * 0.35, -Math.PI / 2, 2.6, 50, c, 9), 180);
    },
    /* burst at a specific element, tinted to match it */
    burstAt(el, colors) {
      if (reduced) return;
      const r = el.getBoundingClientRect();
      spawn(r.left + r.width / 2, r.top + r.height / 2, -Math.PI / 2, 2.2, 55, colors || PARTY, 11);
    },
  };
})();
