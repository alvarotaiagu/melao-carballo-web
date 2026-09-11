import { initHeroScene } from "./scene.js";

gsap.registerPlugin(ScrollTrigger);

/* ---------- Word splitting (accessible) ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  const words = text.split(/\s+/);
  el.innerHTML = "";
  const wrap = document.createElement("span");
  wrap.className = "split-wrap";
  wrap.setAttribute("aria-hidden", "true");
  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "split-word";
    const inner = document.createElement("span");
    inner.textContent = word;
    outer.appendChild(inner);
    wrap.appendChild(outer);
    if (i < words.length - 1) wrap.appendChild(document.createTextNode(" "));
  });
  el.appendChild(wrap);
  return Array.from(wrap.querySelectorAll(".split-word > span"));
}

const splitTargets = document.querySelectorAll("[data-split-word]");
const splitMap = new Map();
splitTargets.forEach((el) => splitMap.set(el, splitWords(el)));

/* ---------- Blur-up image reveal (a loading state, not decoration —
   runs regardless of motion/pointer preferences) ---------- */
function initLqipReveal() {
  document.querySelectorAll(".lqip-img").forEach((img) => {
    const reveal = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth > 0) {
      reveal();
    } else {
      img.addEventListener("load", reveal, { once: true });
    }
  });
}
initLqipReveal();

/* ---------- Cookie notice (informational — nothing loads without a
   click, so there is nothing to "accept" beyond acknowledging this) ---------- */
function initCookieBanner() {
  const banner = document.querySelector(".cookie-banner");
  const ackBtn = document.querySelector(".cookie-ack");
  if (!banner || !ackBtn) return;
  const KEY = "melao-cookie-ack";
  let acknowledged = false;
  try {
    acknowledged = localStorage.getItem(KEY) === "1";
  } catch (e) {}
  if (!acknowledged) banner.hidden = false;
  ackBtn.addEventListener("click", () => {
    banner.hidden = true;
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {}
  });
}
initCookieBanner();

/* ---------- Map: only loads Google's iframe (and its cookies) on click ---------- */
function initMapConsent() {
  document.querySelectorAll(".map-consent").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const iframe = document.createElement("iframe");
        iframe.title = btn.dataset.mapTitle || "Mapa";
        iframe.src = btn.dataset.mapSrc;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        btn.replaceWith(iframe);
      },
      { once: true }
    );
  });
}
initMapConsent();

/* ---------- Opening hours: live "open now" status + today highlight ----------
   Real hours (cross-checked across several public listings for this
   business). Each day can have zero, one or two service windows, and
   Friday/Saturday close past midnight, so "today" and "still open from
   last night" are checked separately. ---------- */
const OPENING_HOURS = {
  1: [], // Lunes: cerrado
  2: [["08:30", "13:30"], ["17:00", "23:00"]], // Martes
  3: [["08:30", "13:30"], ["17:00", "23:00"]], // Miércoles
  4: [["08:30", "13:30"], ["17:00", "23:00"]], // Jueves
  5: [["19:00", "01:00"]], // Viernes
  6: [["09:00", "13:30"], ["19:00", "01:00"]], // Sábado
  0: [["10:00", "16:00"], ["18:00", "23:00"]], // Domingo
};

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOpenAt(date) {
  const day = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();
  const today = OPENING_HOURS[day] || [];
  const yesterday = OPENING_HOURS[(day + 6) % 7] || [];

  const openNow = today.some(([open, close]) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    return c > o ? minutes >= o && minutes < c : minutes >= o;
  });
  if (openNow) return true;

  return yesterday.some(([open, close]) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    return c <= o && minutes < c;
  });
}

function initOpeningHours() {
  const statusText = document.getElementById("hours-status-text");
  const list = document.getElementById("hours-list");
  const dot = document.querySelector(".hours-card .live-dot");
  if (!statusText || !list) return;

  function update() {
    const now = new Date();
    list.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("is-today", Number(li.dataset.day) === now.getDay());
    });
    const open = isOpenAt(now);
    statusText.textContent = open ? "Abierto ahora" : "Cerrado ahora";
    if (dot) dot.classList.toggle("is-closed", !open);
  }
  update();
  setInterval(update, 60000);
}
initOpeningHours();

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");

function closeMobileNav() {
  mobileNav.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
}
function openMobileNav() {
  mobileNav.hidden = false;
  navToggle.setAttribute("aria-expanded", "true");
}
navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMobileNav() : openMobileNav();
});
mobileNav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMobileNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    closeMobileNav();
    navToggle.focus();
  }
});

/* ---------- Reduced motion & smooth-scroll wiring ---------- */
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let lenis = null;

function smoothScrollToSelector(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const headerOffset = 68;
  if (lenis) {
    lenis.scrollTo(target, { offset: -headerOffset });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduceQuery.matches ? "auto" : "smooth" });
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute("href");
  if (id.length <= 1) return;
  if (!document.querySelector(id)) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileNav();
    smoothScrollToSelector(id);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => smoothScrollToSelector(btn.dataset.scrollTarget));
});

/* ---------- Nav scroll-spy (state, not motion — runs regardless) ---------- */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"], .mobile-nav a[href^="#"], .footer-nav a[href^="#"]');
  if (!navLinks.length) return;
  function setActive(id) {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
  }
  ["mezcla", "carta", "estrella", "encuentranos"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id),
    });
  });
}

/* ---------- Scroll chrome: progress bar + header elevation (state, not
   motion — runs regardless of prefers-reduced-motion) ---------- */
function initScrollChrome() {
  const bar = document.querySelector(".scroll-progress-bar");
  const header = document.querySelector(".site-header");
  if (bar) {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      },
    });
  }
  if (header) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top -80",
      onEnter: () => header.classList.add("is-scrolled"),
      onLeaveBack: () => header.classList.remove("is-scrolled"),
    });
  }
}

/* ---------- Torch-light spotlight over the dark "Encuéntranos" section ---------- */
function initSpotlight() {
  document.querySelectorAll(".spotlight").forEach((section) => {
    section.addEventListener("pointermove", (e) => {
      const rect = section.getBoundingClientRect();
      const mx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
      const my = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
      section.style.setProperty("--mx", mx);
      section.style.setProperty("--my", my);
    });
  });
}

/* ---------- Motion setup ---------- */
const mm = gsap.matchMedia();

mm.add(
  {
    isMotion: "(prefers-reduced-motion: no-preference)",
    isFinePointer: "(pointer: fine)",
  },
  (context) => {
    const { isMotion, isFinePointer } = context.conditions;

    if (isMotion) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      runHeroIntro();
      runSectionReveals();
      runGhostParallax();
      runHeroScene();
      initScrollSpy();
      initScrollChrome();

      if (isFinePointer) {
        initCustomCursor();
        initMagneticButtons();
        initTiltCards();
        initHeroTilt();
        initSpotlight();
      }

      window.addEventListener("pagehide", () => {
        lenis && lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      });
    } else {
      document.body.classList.add("motion-reduced");
      initScrollSpy();
      initScrollChrome();
    }

    return () => {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };
  }
);

/* ---------- Hero intro (runs once, on load) ---------- */
function runHeroIntro() {
  const titleWords = splitMap.get(document.querySelector(".hero-title"));
  const claimWords = splitMap.get(document.querySelector(".hero-claim"));
  if (titleWords) gsap.set(titleWords, { yPercent: 110, opacity: 0 });
  if (claimWords) gsap.set(claimWords, { yPercent: 110, opacity: 0 });

  const tl = gsap.timeline({ delay: 0.15 });
  tl.from(".site-header", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" });
  tl.from(".hero-eyebrow", { y: 12, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");
  if (titleWords) {
    tl.to(titleWords, { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.055, ease: "power4.out" }, "-=0.2");
  }
  if (claimWords) {
    tl.to(claimWords, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: "power3.out" }, "-=0.55");
  }
  tl.from(".hero-actions", { y: 14, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.35");
  tl.from(".hero-media", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.75");
  tl.from(".scroll-cue", { opacity: 0, duration: 0.5 }, "-=0.2");
}

/* ---------- Section-by-section reveals ---------- */
function runSectionReveals() {
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    const heading = group.querySelector("h2");
    const headingWords = heading ? splitMap.get(heading) : null;
    const rest = group.querySelectorAll(
      "p, .origin-card, .carta-card, .estrella-copy .btn, .hours-card, .info-list li, .map-card"
    );

    if (headingWords) gsap.set(headingWords, { yPercent: 110, opacity: 0 });
    gsap.set(rest, { y: 18, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: group,
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });
    if (headingWords) {
      tl.to(headingWords, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power4.out" });
    }
    tl.to(rest, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power2.out" }, headingWords ? "-=0.35" : 0);
  });
}

/* ---------- Ghost watermark parallax ---------- */
function runGhostParallax() {
  document.querySelectorAll(".ghost-word").forEach((el) => {
    gsap.to(el, {
      yPercent: -16,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

/* ---------- Hero ambient shader ---------- */
function runHeroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || !window.WebGLRenderingContext) return;
  const scene = initHeroScene(canvas);
  if (scene) {
    window.addEventListener("pagehide", () => scene.destroy());
  }
}

/* ---------- Custom cursor ---------- */
function initCustomCursor() {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;

  document.body.classList.add("has-custom-cursor");
  const moveDot = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
  const moveDotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
  const moveRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
  const moveRingY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

  function onMove(e) {
    dot.classList.add("is-visible");
    ring.classList.add("is-visible");
    moveDot(e.clientX);
    moveDotY(e.clientY);
    moveRing(e.clientX);
    moveRingY(e.clientY);
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  document.querySelectorAll("a, button, .carta-card, .origin-card").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
  });

  window.addEventListener("blur", () => {
    dot.classList.remove("is-visible");
    ring.classList.remove("is-visible");
  });
}

/* ---------- Magnetic buttons ---------- */
function initMagneticButtons() {
  document.querySelectorAll(".btn").forEach((el) => {
    const moveX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
      moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
    });
    el.addEventListener("mouseleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

/* ---------- Tilt on carta + origin cards ---------- */
function initTiltCards() {
  document.querySelectorAll(".carta-card, .origin-card").forEach((el) => {
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 6);
      rotX(-py * 6);
    });
    el.addEventListener("mouseleave", () => {
      rotX(0);
      rotY(0);
    });
  });
}

/* ---------- Hero 3D tilt (text block parallax) ---------- */
function initHeroTilt() {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  const rotX = gsap.quickTo(content, "rotationX", { duration: 0.7, ease: "power2" });
  const rotY = gsap.quickTo(content, "rotationY", { duration: 0.7, ease: "power2" });

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotY(px * 4);
    rotX(-py * 4);
  });
  hero.addEventListener("pointerleave", () => {
    rotX(0);
    rotY(0);
  });
}

/* Refresh ScrollTrigger measurements once fonts + layout settle */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener("load", () => ScrollTrigger.refresh());
