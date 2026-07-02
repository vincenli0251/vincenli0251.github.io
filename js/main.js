/* ═══════════════════════════════════════════════════════════
   VINCENT LI — PORTFOLIO ENGINE
   ═══════════════════════════════════════════════════════════ */
"use strict";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isMobile = matchMedia("(max-width: 900px)").matches;
const reduced  = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── 1. PRELOADER ────────────────────────────────────────── */
(() => {
  const pre = $("#preloader"), fill = $("#plBarFill"), count = $("#plCount");
  let p = 0;
  const tick = () => {
    p = Math.min(100, p + Math.random() * 16 + 6);
    fill.style.width = p + "%";
    count.textContent = String(Math.floor(p)).padStart(2, "0");
    if (p < 100) setTimeout(tick, 90 + Math.random() * 120);
    else setTimeout(exit, 350);
  };
  const exit = () => {
    pre.classList.add("exit");
    document.body.classList.add("loaded");
    setTimeout(() => { pre.classList.add("done"); pre.style.display = "none"; }, 950);
  };
  reduced ? exit() : setTimeout(tick, 300);
})();

/* ─── 2. CUSTOM CURSOR ────────────────────────────────────── */
(() => {
  if (isMobile) return;
  const dot = $("#cursorDot"), ring = $("#cursorRing");
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
  addEventListener("mousedown", () => ring.classList.add("down"));
  addEventListener("mouseup",   () => ring.classList.remove("down"));
  const loop = () => {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    dot.style.transform  = `translate(${mx}px,${my}px)`;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  const hoverables = "a, button, .project-card, .impact-card, .skill-block, .hero-tags span";
  document.addEventListener("mouseover", e => { if (e.target.closest(hoverables)) ring.classList.add("hover"); });
  document.addEventListener("mouseout",  e => { if (e.target.closest(hoverables)) ring.classList.remove("hover"); });
})();

/* ─── 3. HERO CANVAS — drifting gold particles + linkage ──── */
(() => {
  if (reduced) return;
  const cv = $("#heroCanvas"), ctx = cv.getContext("2d");
  let W, H, pts = [], mouse = { x: -9e3, y: -9e3 };
  const N = isMobile ? 40 : 90;

  const resize = () => {
    W = cv.width  = cv.offsetWidth  * devicePixelRatio;
    H = cv.height = cv.offsetHeight * devicePixelRatio;
  };
  resize(); addEventListener("resize", resize);

  for (let i = 0; i < N; i++) pts.push({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - .5) * .0004, vy: (Math.random() - .5) * .0004,
    r: Math.random() * 1.6 + .4, tw: Math.random() * Math.PI * 2
  });

  cv.parentElement.addEventListener("mousemove", e => {
    const b = cv.getBoundingClientRect();
    mouse.x = (e.clientX - b.left) / b.width;
    mouse.y = (e.clientY - b.top) / b.height;
  });
  cv.parentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9e3; });

  let t = 0;
  const draw = () => {
    t += .016;
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      // gentle mouse repel
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < .12) { p.x += dx / d * .0012; p.y += dy / d * .0012; }
      const a = .35 + Math.sin(t * 2 + p.tw) * .25;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r * devicePixelRatio, 0, 7);
      ctx.fillStyle = `rgba(222,178,106,${a})`;
      ctx.fill();
    }
    // connective threads
    ctx.lineWidth = devicePixelRatio * .5;
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const a = pts[i], b = pts[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < .09) {
        ctx.beginPath();
        ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H);
        ctx.strokeStyle = `rgba(216,162,74,${(1 - d / .09) * .14})`;
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ─── 4. HERO TITLE — char split + parallax bg ────────────── */
(() => {
  const title = $("#heroTitle");
  const chars = [...title.textContent];
  title.textContent = "";
  chars.forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "cw";
    s.textContent = ch;
    s.style.cssText = `opacity:0;transform:translateY(60%) rotate(4deg);transition:opacity 1s cubic-bezier(.19,1,.22,1) ${1.15 + i * .12}s,transform 1s cubic-bezier(.19,1,.22,1) ${1.15 + i * .12}s`;
    title.appendChild(s);
  });
  requestAnimationFrame(() => requestAnimationFrame(() =>
    $$(".cw", title).forEach(s => { s.style.opacity = 1; s.style.transform = "none"; })
  ));

  // reveal hero secondary elements after the title
  $$(".hero [data-reveal]").forEach((el, i) => {
    setTimeout(() => el.classList.add("in"), 1700 + i * 180);
  });

  if (!reduced) {
    const bg = $(".hero-bg"), content = $(".hero-content");
    addEventListener("scroll", () => {
      const y = scrollY;
      if (y < innerHeight) {
        bg.style.transform      = `scale(1.08) translateY(${y * .18}px)`;
        content.style.transform = `translateY(${y * .32}px)`;
        content.style.opacity   = 1 - y / (innerHeight * .85);
      }
    }, { passive: true });
  }
})();

/* ─── 5. NAV state + burger ───────────────────────────────── */
(() => {
  const nav = $("#nav"), burger = $("#navBurger"), menu = $("#mobileMenu");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40), { passive: true });
  burger.addEventListener("click", () => {
    nav.classList.toggle("menu-open");
    menu.classList.toggle("open");
  });
  $$("a", menu).forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("menu-open"); menu.classList.remove("open");
  }));

  // scroll-spy
  const ids = ["about", "impact", "projects", "journey", "skills", "contact"];
  const links = $$(".nav-links a[data-nav]");
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l =>
      l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  ids.forEach(id => { const el = $("#" + id); el && spy.observe(el); });
})();

/* ─── 6. SCROLL PROGRESS ──────────────────────────────────── */
(() => {
  const bar = $("#scrollProgressBar");
  addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
  }, { passive: true });
})();

/* ─── 7. REVEALS + TITLE SPLIT ────────────────────────────── */
(() => {
  // wrap section titles into masked lines
  $$("[data-split]").forEach(t => {
    const html = t.innerHTML.split(/<br\s*\/?>/i);
    t.innerHTML = html.map(l => `<span class="split-line"><span>${l}</span></span>`).join("");
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .18, rootMargin: "0px 0px -40px 0px" });
  $$("[data-reveal]:not(.hero [data-reveal]), [data-split], .tl-item, .project-card").forEach(el => io.observe(el));
})();

/* ─── 8. COUNTERS ─────────────────────────────────────────── */
(() => {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, target = parseFloat(el.dataset.count);
    const dec = +(el.dataset.decimals || 0), pre = el.dataset.prefix || "";
    const t0 = performance.now(), dur = 1800;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + (target * eased).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$("[data-count]").forEach(el => io.observe(el));
})();

/* ─── 9. IMPACT CARD spotlight follow ─────────────────────── */
(() => {
  if (isMobile) return;
  $$(".impact-card").forEach(card => card.addEventListener("mousemove", e => {
    const b = card.getBoundingClientRect();
    card.style.setProperty("--mx", ((e.clientX - b.left) / b.width * 100) + "%");
    card.style.setProperty("--my", ((e.clientY - b.top) / b.height * 100) + "%");
  }));
})();

/* ─── 10. TIMELINE progressive fill ───────────────────────── */
(() => {
  const tl = $("#timeline"), fill = $("#tlFill");
  if (!tl) return;
  addEventListener("scroll", () => {
    const b = tl.getBoundingClientRect();
    const done = Math.min(1, Math.max(0, (innerHeight * .75 - b.top) / b.height));
    fill.style.height = done * 100 + "%";
  }, { passive: true });
})();

/* ─── 11. LIGHTBOX GALLERIES ──────────────────────────────── */
(() => {
  const galleries = {
    audit: {
      title: "汽车质量体系审核系统",
      imgs: [
        "images/audit/微信图片_2026-06-29_134240_575.png",
        "images/audit/微信图片_2026-06-29_134315_135.png",
        "images/audit/微信图片_2026-06-29_134328_897.png",
        "images/audit/微信图片_2026-06-29_134351_764.png",
        "images/audit/微信图片_2026-06-29_134404_807.png",
        "images/audit/微信图片_2026-06-29_134415_387.png",
        "images/audit/微信图片_2026-06-29_134424_303.png",
        "images/audit/微信图片_2026-06-29_134440_139.png",
        "images/audit/微信图片_2026-06-29_134452_285.png",
        "images/audit/微信图片_2026-06-29_134503_266.png",
        "images/audit/微信图片_2026-06-29_134517_736.png",
        "images/audit/微信图片_2026-06-29_134529_783.png"
      ]
    },
    fault:     { title: "产线故障快速判定系统", imgs: ["images/fault/1.png","images/fault/2.png","images/fault/3.png","images/fault/4.png","images/fault/5.png"] },
    capacitor: { title: "电容外观 AI 检测",     imgs: ["images/capacitor/1.png","images/capacitor/2.png","images/capacitor/3.png","images/capacitor/4.png","images/capacitor/5.png"] },
    motion:    { title: "人员动作监控系统",     imgs: ["images/motion/1.png","images/motion/2.png","images/motion/3.png","images/motion/4.png","images/motion/5.png","images/motion/6.png"] },
    plc:       { title: "PLC 产线数据监控",     imgs: ["images/plc/微信图片_2026-06-24_151942_414.png","images/plc/微信图片_2026-06-24_152015_941.png"] },
    ep:        { title: "防错报告自动导出系统", imgs: ["images/error-proofing-export.png"] },
    solar:     { title: "太阳系交互系统",       imgs: ["images/solar-system.png"] }
  };

  const lb = $("#lightbox"), img = $("#lbImg"), title = $("#lbTitle"),
        counter = $("#lbCounter"), prev = $("#lbPrev"), next = $("#lbNext");
  let cur = null, idx = 0;

  const show = () => {
    const g = galleries[cur];
    img.style.opacity = 0;
    const pic = new Image();
    pic.onload = () => { img.src = pic.src; img.style.opacity = 1; };
    pic.src = g.imgs[idx];
    title.textContent = g.title;
    counter.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(g.imgs.length).padStart(2, "0")}`;
    const solo = g.imgs.length < 2;
    prev.style.display = next.style.display = solo ? "none" : "";
  };
  const open = key => {
    cur = key; idx = 0;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    show();
  };
  const close = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  const nav = d => {
    const g = galleries[cur];
    idx = (idx + d + g.imgs.length) % g.imgs.length;
    show();
  };

  img.style.transition = "opacity .35s ease";
  $$(".project-card").forEach(c => c.addEventListener("click", () => open(c.dataset.gallery)));
  $("#lbClose").addEventListener("click", close);
  $("#lbBackdrop").addEventListener("click", close);
  prev.addEventListener("click", e => { e.stopPropagation(); nav(-1); });
  next.addEventListener("click", e => { e.stopPropagation(); nav(1); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") nav(-1);
    if (e.key === "ArrowRight") nav(1);
  });
  // touch swipe
  let sx = 0;
  lb.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) nav(dx > 0 ? -1 : 1);
  }, { passive: true });
})();

/* ─── 12. Business card tilt ──────────────────────────────── */
(() => {
  if (isMobile || reduced) return;
  const wrap = $(".contact-card"), card = $("#bizCard");
  if (!wrap) return;
  wrap.addEventListener("mousemove", e => {
    const b = wrap.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5;
    const y = (e.clientY - b.top) / b.height - .5;
    wrap.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  });
  wrap.addEventListener("mouseleave", () => wrap.style.transform = "");
})();
