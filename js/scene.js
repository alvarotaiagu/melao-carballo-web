/**
 * Ambient hero motif: three of Melao's own signature dishes — smash burger,
 * tequeño, pinsa — orbiting slowly behind the hero photo card, each tinted
 * one of the logo's three colours and leaning gently toward the pointer.
 * Drawn with plain canvas 2D: each icon is a closed silhouette rendered
 * twice (a larger blurred copy under a smaller sharp one) so the edges
 * read as gooey/gel rather than a flat sticker — an evolution of the
 * abstract colour-blob version this replaced, now with recognisable food.
 * One responsibility — ambient colour, depth and a wink of brand identity
 * — and it stays fully subordinate to the real photo and copy stacked in
 * front of it. Nothing here is required to read or use the page.
 */

const CORAL = "#E9573E";
const CORAL_GLOW = "rgba(233,87,62,0.5)";
const SKY = "#3FA7C9";
const SKY_GLOW = "rgba(63,167,201,0.5)";
const LIME = "#96C93E";
const LIME_GLOW = "rgba(150,201,62,0.5)";

const SHAPES = {
  burger: {
    outline(ctx, s) {
      ctx.moveTo(-0.55 * s, -0.05 * s);
      ctx.arc(0, -0.05 * s, 0.55 * s, Math.PI, 0, false);
      ctx.lineTo(0.55 * s, 0.5 * s);
      ctx.quadraticCurveTo(0, 0.68 * s, -0.55 * s, 0.5 * s);
      ctx.closePath();
    },
    details(ctx, s) {
      for (const dy of [0.1, 0.27, 0.44]) {
        ctx.beginPath();
        ctx.moveTo(-0.4 * s, dy * s);
        ctx.lineTo(0.4 * s, dy * s);
        ctx.stroke();
      }
      ctx.beginPath();
      for (const [dx, dy, r] of [[-0.15, -0.3, 0.04], [0.12, -0.26, 0.036], [-0.02, -0.4, 0.032]]) {
        ctx.moveTo((dx + r) * s, dy * s);
        ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
      }
      ctx.fill();
    },
  },
  tequeno: {
    outline(ctx, s) {
      const r = 0.16 * s, half = 0.5 * s;
      ctx.roundRect(-r, -half, r * 2, half * 2 - r * 0.3, r);
    },
    details(ctx, s) {
      const r = 0.16 * s, half = 0.5 * s;
      for (const dy of [-0.16, 0.06, 0.28]) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.75, dy * s);
        ctx.lineTo(r * 0.75, (dy + 0.1) * s);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, half * 0.82);
      ctx.quadraticCurveTo(0, half * 1.3, r * 0.5, half * 0.82);
      ctx.closePath();
      ctx.fill();
    },
  },
  pinsa: {
    outline(ctx, s) {
      ctx.moveTo(0, 0.62 * s);
      ctx.lineTo(-0.5 * s, -0.5 * s);
      ctx.quadraticCurveTo(0, -0.66 * s, 0.5 * s, -0.5 * s);
      ctx.closePath();
    },
    details(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(-0.32 * s, -0.28 * s);
      ctx.quadraticCurveTo(0, -0.4 * s, 0.32 * s, -0.28 * s);
      ctx.stroke();
      ctx.beginPath();
      for (const [dx, dy, r] of [[-0.09, -0.02, 0.045], [0.12, 0.16, 0.04], [-0.05, 0.32, 0.035]]) {
        ctx.moveTo((dx + r) * s, dy * s);
        ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
      }
      ctx.fill();
    },
  },
};

const ITEMS = [
  { icon: "burger", color: CORAL, glow: CORAL_GLOW, radius: 0.15 },
  { icon: "tequeno", color: SKY, glow: SKY_GLOW, radius: 0.125 },
  { icon: "pinsa", color: LIME, glow: LIME_GLOW, radius: 0.105 },
];

function smoothstep(edge0, edge1, x) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

// Mirrors the real vignette on the shader this replaced: fades an icon out
// as it drifts toward the edge of the hero instead of clipping it abruptly.
function edgeFade(x, y, W, H) {
  const dx = x / W - 0.5;
  const dy = y / H - 0.5;
  const d = Math.sqrt(dx * dx + dy * dy);
  return smoothstep(0.95, 0.35, d);
}

// The icons are recognisable shapes, not abstract colour — unlike the old
// shader's blobs, having one drift across the headline reads as a mistake.
// Keep them anchored near the hero photo card (whichever side/row it's on,
// desktop or the stacked mobile layout) and fade them out past it.
function photoAreaFade(x, y, anchor) {
  if (!anchor) return 1;
  const dx = (x - anchor.cx) / (anchor.hw + 70);
  const dy = (y - anchor.cy) / (anchor.hh + 70);
  const d = Math.sqrt(dx * dx + dy * dy);
  return smoothstep(1.55, 0.85, d);
}

function drawGooeyIcon(ctx, item, s, alpha) {
  const shape = SHAPES[item.icon];
  ctx.save();
  ctx.shadowColor = item.glow;
  ctx.shadowBlur = s * 0.22;
  ctx.filter = `blur(${Math.max(2, s * 0.1)}px)`;
  ctx.globalAlpha = 0.85 * alpha;
  ctx.fillStyle = item.color;
  ctx.beginPath();
  shape.outline(ctx, s * 1.08);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = item.color;
  ctx.beginPath();
  shape.outline(ctx, s * 0.9);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = `blur(${Math.max(1, s * 0.02)}px)`;
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = s * 0.03;
  ctx.lineCap = "round";
  shape.details(ctx, s * 0.9);
  ctx.restore();
}

export function initHeroScene(canvas) {
  let ctx;
  try {
    ctx = canvas.getContext("2d");
    if (!ctx) return null;
  } catch (err) {
    return null;
  }

  let W = 0;
  let H = 0;
  let photoAnchor = null;

  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    targetX = ((x - rect.left) / rect.width - 0.5) * 2;
    targetY = -((y - rect.top) / rect.height - 0.5) * 2;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  function resize() {
    const parent = canvas.parentElement;
    W = parent.clientWidth;
    H = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const photoEl = canvas.closest(".hero")?.querySelector(".hero-photo-card");
    if (photoEl) {
      const canvasRect = canvas.getBoundingClientRect();
      const photoRect = photoEl.getBoundingClientRect();
      photoAnchor = {
        cx: photoRect.left - canvasRect.left + photoRect.width / 2,
        cy: photoRect.top - canvasRect.top + photoRect.height / 2,
        hw: photoRect.width / 2,
        hh: photoRect.height / 2,
      };
    }
  }
  resize();
  window.addEventListener("resize", resize);

  let running = false;
  let rafId = null;
  const clock = { start: 0, elapsed: 0 };

  function tick() {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    const now = performance.now();
    const t = ((now - clock.start) / 1000) * 0.9;

    pointerX += (targetX - pointerX) * 0.04;
    pointerY += (targetY - pointerY) * 0.04;

    ctx.clearRect(0, 0, W, H);

    const aspect = W / Math.max(H, 1);
    const c1 = [Math.sin(t * 1.3) * 0.5 + 0.18, Math.cos(t * 1.1) * 0.32 + 0.06];
    const c2 = [Math.cos(t * 0.9 + 1.7) * 0.42 - 0.22, Math.sin(t * 1.4 + 0.6) * 0.4 - 0.1];
    const c3 = [Math.sin(t * 0.7 + 3.1) * 0.36 - 0.05, Math.cos(t * 0.6 + 2.0) * 0.3 + 0.28];
    const pull = [pointerX * 0.14, pointerY * 0.14];
    const centers = [
      [c1[0] + pull[0], c1[1] + pull[1]],
      [c2[0] + pull[0] * 0.6, c2[1] + pull[1] * 0.6],
      [c3[0] + pull[0] * 0.35, c3[1] + pull[1] * 0.35],
    ];
    const minDim = Math.min(W, H);

    ITEMS.forEach((item, i) => {
      const [px, py] = centers[i];
      const x = W * (0.5 + px / aspect);
      const y = H * (0.5 - py);
      const alpha = edgeFade(x, y, W, H) * photoAreaFade(x, y, photoAnchor);
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.translate(x, y);
      drawGooeyIcon(ctx, item, minDim * item.radius, alpha);
      ctx.restore();
    });
  }

  function start() {
    if (running) return;
    running = true;
    clock.start = performance.now();
    tick();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  function onVisibility() {
    if (document.hidden) stop();
    else if (io.takeRecords) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  function destroy() {
    stop();
    io.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
  }

  canvas.classList.add("is-active");

  return { destroy };
}
