/* ============================================================
   HAPPY BIRTHDAY — FULLY RESPONSIVE SCRIPT (Mobile, Tab & PC)
   ============================================================ */

import gsap from 'gsap';

const $ = (id) => document.getElementById(id);

const canvas = $('tree');
const ctx    = canvas.getContext('2d');
const wishEl = $('wish');

const hero       = $('hero');
const eyebrow    = $('eyebrow');
const hint       = $('hint');
const motes      = $('motes');
const target     = $('target');
const targetHeart= $('targetHeart');
const heartGlow  = target.querySelector('.heart__glow');
const aim        = $('aim');

const archery = $('archery');
const bow     = $('bow');
const arrow   = $('arrow');
const strL    = $('strL');
const strR    = $('strR');
const serving = $('serving');

const flood   = $('flood');
const field   = $('field');
const camera  = $('camera');
const kEyebrow= $('kEyebrow');
const kSub    = $('kSub');
const barTop  = $('barTop');
const barBot  = $('barBot');
const bloom   = $('bloom');
const replay  = $('replay');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isRecord     = new URLSearchParams(location.search).has('record');

if (isRecord) window.bdayCues = [];
let recT0 = 0;
function cue(name){ if (isRecord && recT0) window.bdayCues.push({ cue: name, t: (performance.now() - recT0) / 1000 }); }

/* ============================================================
   MATH HELPERS
   ============================================================ */
const rand  = (a, b) => a + Math.random() * (b - a);
const pick  = (a)    => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp  = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack  = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* ============================================================
   TREE ENGINE (Act 4)
   ============================================================ */
const T = {
  trunkStart: 0.10,
  branchSpan: 1.80,
  leafT0:     1.10,
  bloomT0:    1.25,
  bloomSpan:  2.00,
  petalT0:    2.45,
  noteStart:  0.45,
  done:       4.60,
};

const SS = 180;

function makeSunflowerSprite(label, soft) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = SS;
  const c = cv.getContext('2d');
  const cx = SS / 2, cy = SS / 2, r = SS * 0.44;

  c.save();
  c.shadowColor = 'rgba(120, 50, 10, 0.35)';
  c.shadowBlur = SS * 0.08;
  c.shadowOffsetY = SS * 0.04;

  const numPetals = 14;
  for (let layer = 0; layer < 2; layer++) {
    const angleOffset = layer * (Math.PI / numPetals);
    const petalLen = layer === 0 ? r * 0.95 : r * 0.85;
    const petalWidth = r * 0.28;

    for (let i = 0; i < numPetals; i++) {
      const angle = (i * 2 * Math.PI) / numPetals + angleOffset;
      c.save();
      c.translate(cx, cy);
      c.rotate(angle);

      const pg = c.createLinearGradient(0, -r * 0.3, 0, -petalLen);
      pg.addColorStop(0, '#e65100');
      pg.addColorStop(0.5, '#f57f17');
      pg.addColorStop(1, '#fff176');
      c.fillStyle = pg;

      c.beginPath();
      c.moveTo(0, -r * 0.25);
      c.quadraticCurveTo(-petalWidth, -petalLen * 0.6, 0, -petalLen);
      c.quadraticCurveTo(petalWidth, -petalLen * 0.6, 0, -r * 0.25);
      c.fill();
      c.restore();
    }
  }
  c.restore();

  const coreR = r * 0.44;
  const cg = c.createRadialGradient(cx, cy - coreR * 0.2, coreR * 0.1, cx, cy, coreR);
  cg.addColorStop(0, '#5d4037');
  cg.addColorStop(0.7, '#3e2723');
  cg.addColorStop(1, '#1b0000');

  c.beginPath();
  c.arc(cx, cy, coreR, 0, Math.PI * 2);
  c.fillStyle = cg;
  c.fill();
  c.lineWidth = 1.5;
  c.strokeStyle = '#ffb300';
  c.stroke();

  if (label) {
    c.save();
    c.font = `900 ${SS * 0.23}px "Fraunces", Georgia, serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    
    const tg = c.createLinearGradient(0, cy - coreR * 0.5, 0, cy + coreR * 0.5);
    tg.addColorStop(0, '#fff9c4');
    tg.addColorStop(0.5, '#ffe082');
    tg.addColorStop(1, '#ffb300');

    c.fillStyle = tg;
    c.shadowColor = 'rgba(0,0,0,0.85)';
    c.shadowBlur = 4;
    c.fillText(label, cx, cy + 1);
    c.restore();
  }

  if (!soft) return cv;

  const cv2 = document.createElement('canvas');
  cv2.width = cv2.height = SS;
  const c2 = cv2.getContext('2d');
  c2.filter = 'blur(2px)';
  c2.drawImage(cv, 0, 0);
  return cv2;
}

function makeLeafSprite(soft) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = SS;
  const c = cv.getContext('2d');
  const cx = SS / 2, cy = SS / 2;

  c.save();
  c.translate(cx, cy);

  const lg = c.createLinearGradient(0, -SS * 0.42, 0, SS * 0.42);
  lg.addColorStop(0, '#8bc34a');
  lg.addColorStop(0.4, '#43a047');
  lg.addColorStop(1, '#1b5e20');

  c.fillStyle = lg;
  c.beginPath();
  c.moveTo(0, -SS * 0.42);
  c.quadraticCurveTo(SS * 0.28, -SS * 0.1, 0, SS * 0.42);
  c.quadraticCurveTo(-SS * 0.28, -SS * 0.1, 0, -SS * 0.42);
  c.fill();

  c.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  c.lineWidth = 2.2;
  c.beginPath();
  c.moveTo(0, -SS * 0.38);
  c.lineTo(0, SS * 0.38);
  c.stroke();

  c.restore();

  if (!soft) return cv;
  const cv2 = document.createElement('canvas');
  cv2.width = cv2.height = SS;
  const c2 = cv2.getContext('2d');
  c2.filter = 'blur(2.2px)';
  c2.drawImage(cv, 0, 0);
  return cv2;
}

function makeBokeh(rgb){
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(0.45, `rgba(${rgb},0.22)`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(0, 0, S, S);
  return cv;
}

function makeSparkle(){
  const S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d'); const m = S / 2;
  const g = c.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, 'rgba(255,236,200,0.5)'); g.addColorStop(1, 'rgba(255,236,200,0)');
  c.fillStyle = g; c.beginPath(); c.arc(m, m, m, 0, 6.2832); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.95)';
  c.translate(m, m);
  for (let k = 0; k < 2; k++){
    c.beginPath();
    c.moveTo(0, -m); c.quadraticCurveTo(0, 0, m, 0); c.quadraticCurveTo(0, 0, 0, m); c.quadraticCurveTo(0, 0, -m, 0); c.quadraticCurveTo(0, 0, 0, -m);
    c.fill(); c.rotate(Math.PI / 4); c.scale(0.5, 0.5);
  }
  return cv;
}

let SPR = { crisp25: null, soft25: null, crisp24: null, soft24: null, leaf: null, leafSoft: null }, BOKEH = [], SPARKLE = null;
function buildSprites(){
  SPR = {
    crisp25: makeSunflowerSprite('25', false),
    soft25:  makeSunflowerSprite('25', true),
    crisp24: makeSunflowerSprite('24', false),
    soft24:  makeSunflowerSprite('24', true),
    leaf:    makeLeafSprite(false),
    leafSoft:makeLeafSprite(true),
  };
  BOKEH = [makeBokeh('255,224,188'), makeBokeh('255,210,120'), makeBokeh('255,238,210')];
  SPARKLE = makeSparkle();
}

function drawSprite(sprite, x, y, size, rot, alpha){
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -size * 0.5, -size * 0.5, size, size);
  ctx.restore();
}

function insideCrown(u, v) {
  const dist = (u * u) / 1.15 + (v * v) / 0.95;
  return dist <= 1.0;
}

let W = 0, H = 0, dpr = 1;
let cx = 0, cy = 0, rx = 0, ry = 0, groundY = 0;
let branches = [], leavesBack = [], leavesFront = [], hearts = [], petals = [], rested = [], orbs = [], floaters = [], twinkles = [];
let bgGrad = null, glowGrad = null, groundGrad = null;

const quad = (b, t) => { const m = 1 - t, a = m * m, k = 2 * m * t, d = t * t; return { x: a * b.x1 + k * b.cx + d * b.x2, y: a * b.y1 + k * b.cy + d * b.y2 }; };

function barkGrad(x1, y1, x2, y2, depth){
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, `hsl(348 26% ${26 + depth * 3}%)`);
  g.addColorStop(1, `hsl(346 24% ${40 + depth * 5}%)`);
  return g;
}

// রেসপনসিভ সিন ক্যালকুলেশন (Desktop vs Mobile)
function buildScene(){
  branches = []; leavesBack = []; leavesFront = []; hearts = []; petals = []; rested = []; twinkles = []; orbs = []; floaters = [];

  const isWide = W / H > 1.0;
  // মোবাইল পোট্রেটে গাছ মাঝখানে ও কিছুটা উপরে থাকবে যাতে নিচের উইশ কার্ড ঢাকা না পড়ে
  cx = isWide ? W * 0.58 : W * 0.5;
  cy = isWide ? H * 0.38 : H * 0.33;
  ry = isWide ? Math.min(H * 0.34, W * 0.35) : Math.min(H * 0.28, W * 0.44);
  rx = isWide ? ry * 1.35 : ry * 1.15;
  groundY = H * 0.93;

  bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#fff6ee');
  bgGrad.addColorStop(0.5, '#fdebd0');
  bgGrad.addColorStop(1, '#f9d5b7');
  
  glowGrad = ctx.createRadialGradient(cx, cy, ry * 0.1, cx, cy, ry * 1.55);
  glowGrad.addColorStop(0, 'rgba(255,219,170,0.6)');
  glowGrad.addColorStop(0.5, 'rgba(255,170,150,0.2)');
  glowGrad.addColorStop(1, 'rgba(255,170,150,0)');
  
  groundGrad = ctx.createRadialGradient(cx, H * 1.02, ry * 0.2, cx, H * 1.02, ry * 1.6);
  groundGrad.addColorStop(0, 'rgba(255,205,165,0.5)');
  groundGrad.addColorStop(1, 'rgba(255,205,165,0)');

  for (let i = 0; i < 11; i++){
    orbs.push({ x: rand(0, W), y: rand(0, H), r: rand(W * 0.05, W * 0.17), vy: rand(-6, -16), drift: rand(-0.3, 0.3), phase: rand(0, 6.28), alpha: rand(0.05, 0.13), sprite: pick(BOKEH) });
  }

  const FN = isWide ? 18 : 12;
  for (let i = 0; i < FN; i++){
    const depth = Math.random();
    floaters.push({
      x: rand(0, W), y: rand(-H * 0.1, H * 1.1), depth,
      box: lerp(Math.min(W, H) * 0.03, Math.min(W, H) * 0.065, depth),
      vy: lerp(7, 18, depth), sway: rand(8, 20), phase: rand(0, 6.28),
      rot: rand(-0.4, 0.4), vrot: rand(-0.5, 0.5),
      baseA: lerp(0.2, 0.5, depth), soft: depth < 0.45,
    });
  }

  const baseX = cx, baseY = H * 1.0;
  const trunkTopY = cy + ry * 0.45;
  const trunkW = Math.max(8, isWide ? W * 0.024 : W * 0.035);
  const limbLen = ry * 0.45;

  function addBranch(x, y, ang, len, w0, depth, t0){
    const ex = x + Math.cos(ang) * len;
    const ey = y + Math.sin(ang) * len;
    const mx = (x + ex) / 2, my = (y + ey) / 2;
    const perp = ang + Math.PI / 2;
    const bend = rand(-1, 1) * len * 0.12;
    const w1 = w0 * 0.65;
    branches.push({ x1: x, y1: y, cx: mx + Math.cos(perp) * bend, cy: my + Math.sin(perp) * bend, x2: ex, y2: ey, w0, w1, t0, dur: Math.max(0.14, 0.32 - depth * 0.03), depth, grad: barkGrad(x, y, ex, ey, depth) });
    return { ex, ey, w1 };
  }

  function grow(x, y, ang, len, w, depth, t0){
    if (depth >= 4 || len < ry * 0.1) return;
    const r = addBranch(x, y, ang, len, w, depth, t0);
    const childT0 = t0 + (0.32 - depth * 0.03) * 0.55;
    const n = Math.random() < 0.5 ? 2 : 3;
    for (let i = 0; i < n; i++){
      const spread = 0.65 * (i - (n - 1) / 2) + rand(-0.15, 0.15);
      const lift = -0.05 + rand(-0.04, 0.04);
      grow(r.ex, r.ey, ang + spread + lift, len * rand(0.68, 0.78), r.w1, depth + 1, childT0 + i * 0.03);
    }
  }

  addBranch(baseX, baseY, -Math.PI / 2, baseY - trunkTopY, trunkW, 0, T.trunkStart);
  branches[0].dur = 0.55;
  const limbT0 = T.trunkStart + 0.36;
  const L = 4;
  for (let i = 0; i < L; i++){
    const ang = -Math.PI / 2 + 0.65 * (i - (L - 1) / 2) + rand(-0.1, 0.1);
    grow(baseX, trunkTopY, ang, limbLen, trunkW * 0.7, 1, limbT0 + i * 0.04);
  }

  const maxT0 = branches.reduce((m, b) => Math.max(m, b.t0 + b.dur), 0);
  const sc = (T.branchSpan - T.trunkStart) / (maxT0 - T.trunkStart);
  for (const b of branches) b.t0 = T.trunkStart + (b.t0 - T.trunkStart) * sc;

  // ব্যাকগ্রাউন্ড পাতা
  const leafBaseBox = clamp(Math.min(W, H) * (isWide ? 0.08 : 0.095), 22, 48);
  const leafCount = isWide ? 180 : 120;
  for (let i = 0; i < leafCount; i++) {
    const u = rand(-1.15, 1.15), v = rand(-1.15, 1.15);
    if (!insideCrown(u, v)) continue;
    const x = cx + u * rx;
    const y = cy + v * ry;
    const t0 = T.leafT0 + rand(0, 1.2);
    const soft = Math.random() < 0.35;
    leavesBack.push({
      x, y, soft,
      box: leafBaseBox * (soft ? rand(0.8, 1.1) : rand(1.0, 1.35)),
      rot: rand(-Math.PI, Math.PI),
      sway: rand(0, 6.28),
      t0
    });
  }

  // গাছে থাকা '25' ফুল
  const COUNT = Math.round(clamp(rx * ry / (isWide ? 58 : 46), 180, 360));
  const baseBox = clamp(Math.min(W, H) * (isWide ? 0.115 : 0.13), 26, 62);
  let guard = 0;
  while (hearts.length < COUNT && guard < COUNT * 50){
    guard++;
    const u = rand(-1.02, 1.02), v = rand(-1.02, 1.02);
    if (!insideCrown(u, v)) continue;
    const x = cx + u * rx;
    const y = cy + v * ry;
    const d = clamp01(Math.hypot(u, v) / 1.15);
    const t0 = T.bloomT0 + d * (T.bloomSpan * 0.85) + rand(0, T.bloomSpan * 0.15);
    const soft = Math.random() < 0.28;
    hearts.push({ x, y, soft, box: baseBox * (soft ? rand(0.7, 0.9) : rand(0.85, 1.2)), rot: rand(-0.5, 0.5), sway: rand(0, 6.28), t0 });
  }
  hearts.sort((a, b) => (a.soft === b.soft ? a.y - b.y : a.soft ? -1 : 1));

  // ফ্রন্ট পাতা
  const frontLeafCount = isWide ? 90 : 60;
  for (let i = 0; i < frontLeafCount; i++) {
    const h = hearts[(Math.random() * hearts.length) | 0];
    if (!h) continue;
    const x = h.x + rand(-20, 20);
    const y = h.y + rand(-20, 20);
    const t0 = h.t0 + rand(0.1, 0.4);
    leavesFront.push({
      x, y, soft: false,
      box: leafBaseBox * rand(0.8, 1.15),
      rot: rand(-Math.PI, Math.PI),
      sway: rand(0, 6.28),
      t0
    });
  }
}

function drawBackground(){
  ctx.globalAlpha = 1;
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1; ctx.fillStyle = groundGrad; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawGodRays(t, intensity){
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const ox = cx, oy = cy - ry * 0.35, R = Math.hypot(W, H) * 1.1;
  const rays = 9, sweep = Math.sin(t * 0.07) * 0.18;
  for (let i = 0; i < rays; i++){
    const a = -Math.PI / 2 + sweep + (i - (rays - 1) / 2) * 0.2;
    const hw = 0.035 + 0.02 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 1.7));
    const a1 = a - hw, a2 = a + hw;
    const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * R, oy + Math.sin(a) * R);
    g.addColorStop(0, `rgba(255,232,190,${0.10 * intensity})`);
    g.addColorStop(0.5, `rgba(255,214,170,${0.05 * intensity})`);
    g.addColorStop(1, 'rgba(255,214,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(a1) * R, oy + Math.sin(a1) * R);
    ctx.lineTo(ox + Math.cos(a2) * R, oy + Math.sin(a2) * R);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawGlow(t){
  const gi = clamp01((t - T.bloomT0) / (T.bloomSpan * 0.9));
  if (gi <= 0) return;
  ctx.save(); ctx.globalAlpha = gi; ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawBokeh(t, dt){
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const o of orbs){
    o.y += o.vy * dt; o.x += Math.sin(t * 0.3 + o.phase) * o.drift;
    if (o.y < -o.r){ o.y = H + o.r; o.x = rand(0, W); }
    ctx.globalAlpha = o.alpha;
    ctx.drawImage(o.sprite, o.x - o.r, o.y - o.r, o.r * 2, o.r * 2);
  }
  ctx.restore();
}

function drawFloaters(t, dt, front){
  const appear = clamp01((t - 0.2) / 1.4);
  if (appear <= 0) return;
  for (const f of floaters){
    if ((f.depth >= 0.6) !== front) continue;
    f.y -= f.vy * dt;
    f.x += Math.sin(t * 0.5 + f.phase) * f.sway * dt;
    f.rot += f.vrot * dt;
    if (f.y < -f.box){ f.y = H + f.box; f.x = rand(0, W); }
    drawSprite((f.soft ? SPR.soft25 : SPR.crisp25), f.x, f.y, f.box, f.rot, f.baseA * appear);
  }
}

function drawBranches(t){
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const b of branches){
    const f = clamp01((t - b.t0) / b.dur);
    if (f <= 0) continue;
    const e = easeOutCubic(f);
    ctx.strokeStyle = b.grad;
    const steps = 12, last = Math.max(1, Math.ceil(steps * e));
    let prev = quad(b, 0);
    for (let i = 1; i <= last; i++){
      const tt = Math.min(e, i / steps), p = quad(b, tt);
      ctx.lineWidth = lerp(b.w0, b.w1, tt);
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      prev = p;
    }
  }
}

function drawLeafList(list, t) {
  const breathe = 1 + Math.sin(t * 0.8) * 0.012;
  for (const l of list) {
    const p = clamp01((t - l.t0) / 0.55);
    if (p <= 0) continue;
    const scale = Math.max(0, easeOutBack(p));
    let alpha = clamp01(p * 1.6);
    if (l.soft) alpha *= 0.85;
    const lx = cx + (l.x - cx) * breathe;
    const ly = cy + (l.y - cy) * breathe;
    drawSprite(l.soft ? SPR.leafSoft : SPR.leaf, lx, ly, l.box * scale, l.rot + Math.sin(t * 1.2 + l.sway) * 0.12, alpha);
  }
}

function drawHearts(t){
  const breathe = 1 + Math.sin(t * 0.8) * 0.012;
  for (const h of hearts){
    const p = clamp01((t - h.t0) / 0.6);
    if (p <= 0) continue;
    const scale = Math.max(0, easeOutBack(p));
    let alpha = clamp01(p * 1.7); if (h.soft) alpha *= 0.85;
    const settled = clamp01((t - h.t0 - 0.6) / 0.7);
    const sway = settled * Math.sin(t * 1.5 + h.sway) * (h.box * 0.05);
    const rise = (1 - easeOutCubic(p)) * h.box * 0.45;
    const hx = cx + (h.x - cx) * breathe + sway;
    const hy = cy + (h.y - cy) * breathe - rise;

    drawSprite((h.soft ? SPR.soft25 : SPR.crisp25), hx, hy, h.box * scale, h.rot + sway * 0.012, alpha);
  }
}

function updateTwinkles(t, dt){
  const active = t > T.bloomT0 + T.bloomSpan * 0.45;
  if (active && twinkles.length < 9 && Math.random() < 0.5){
    const h = hearts[(Math.random() * hearts.length) | 0];
    if (h) twinkles.push({ x: h.x, y: h.y, size: rand(0.6, 1.3) * (Math.min(W, H) * 0.05), age: 0, life: rand(0.7, 1.2), rot: rand(0, 6.28) });
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = twinkles.length - 1; i >= 0; i--){
    const s = twinkles[i]; s.age += dt;
    const k = s.age / s.life;
    if (k >= 1){ twinkles.splice(i, 1); continue; }
    const a = Math.sin(k * Math.PI);
    drawSprite(SPARKLE, s.x, s.y, s.size * (0.6 + 0.4 * a), s.rot + k * 1.2, a);
  }
  ctx.restore();
}

function spawnPetal(){
  const isLeaf = Math.random() < 0.45;
  const source = isLeaf ? (leavesBack.concat(leavesFront)) : hearts;
  const item = source[(Math.random() * source.length) | 0];
  if (!item) return;

  petals.push({
    isLeaf,
    x: item.x + rand(-12, 12),
    y: item.y + rand(-12, 12),
    vy: rand(22, 42),
    vx: rand(-14, 14),
    sway: rand(0.8, 1.8),
    phase: rand(0, 6.28),
    box: item.box * (isLeaf ? rand(0.7, 0.95) : rand(0.65, 0.85)),
    rot: rand(0, 6.28),
    vrot: rand(-2.0, 2.0),
    age: 0,
    land: groundY + rand(-8, H * 0.05)
  });
}

function drawPetals(t, dt){
  for (let i = petals.length - 1; i >= 0; i--){
    const p = petals[i]; p.age += dt; p.vy += 12 * dt;
    p.x += (p.vx + Math.sin(t * p.sway + p.phase) * 22) * dt;
    p.y += p.vy * dt; p.rot += p.vrot * dt;
    if (p.y >= p.land){
      rested.push({ isLeaf: p.isLeaf, x: clamp(p.x, 8, W - 8), y: p.land, box: p.box, rot: p.rot, a: rand(0.8, 0.95) });
      if (rested.length > 80) rested.shift();
      petals.splice(i, 1); continue;
    }
    const a = p.age < 0.25 ? p.age / 0.25 : 1;
    drawSprite(p.isLeaf ? SPR.leaf : SPR.crisp24, p.x, p.y, p.box, p.rot, a);
  }
}

function drawRested(){
  for (const r of rested) {
    drawSprite(r.isLeaf ? SPR.leaf : SPR.crisp24, r.x, r.y, r.box, r.rot, r.a);
  }
}

function showWish(on){ wishEl.classList.toggle('is-in', on); }

let treeStartT = 0, treeLastT = 0, treeRAF = 0, lastPetal = 0, replayArmed = false;
window.bdayDone = false;

function treeFrame(now){
  if (!treeStartT){ treeStartT = now; treeLastT = now; }
  const t  = (now - treeStartT) / 1000;
  const dt = Math.min(0.05, (now - treeLastT) / 1000); treeLastT = now;

  const rays = clamp01((t - T.bloomT0) / T.bloomSpan);

  drawBackground();
  drawGodRays(t, rays);
  drawGlow(t);
  drawBokeh(t, dt);
  drawFloaters(t, dt, false);
  drawBranches(t);
  drawLeafList(leavesBack, t);
  drawHearts(t);
  drawLeafList(leavesFront, t);
  updateTwinkles(t, dt);
  
  if (t > T.petalT0 && now - lastPetal > 140){ 
    spawnPetal(); 
    spawnPetal(); 
    lastPetal = now; 
  }
  drawPetals(t, dt);
  drawRested();
  drawFloaters(t, dt, true);

  showWish(t >= T.noteStart);

  if (!window.bdayDone && t >= T.done) window.bdayDone = true;
  if (!replayArmed && t >= T.done + 1.0){ replayArmed = true; armReplay(); }

  treeRAF = requestAnimationFrame(treeFrame);
}

function treeStart(){
  treeStartT = 0; treeLastT = 0; lastPetal = 0; replayArmed = false; window.bdayDone = false;
  cue('grow');
  buildScene();
  if (!treeRAF) treeRAF = requestAnimationFrame(treeFrame);
}
function treeStop(){
  if (treeRAF){ cancelAnimationFrame(treeRAF); treeRAF = 0; }
  ctx.clearRect(0, 0, W, H);
}

function drawFinal(){
  buildScene();
  drawBackground(); drawGodRays(0, 1); drawGlow(T.done); drawBokeh(0, 0); drawFloaters(99, 0, false);
  drawBranches(99); 
  drawLeafList(leavesBack, 99);
  drawHearts(99); 
  drawLeafList(leavesFront, 99);
  for (let i = 0; i < 40; i++){ 
    const isLeaf = Math.random() < 0.5;
    const src = isLeaf ? leavesBack : hearts;
    const h = src[(Math.random() * src.length) | 0]; 
    if (h) rested.push({ isLeaf, x: clamp(h.x + rand(-W * 0.3, W * 0.3), 8, W - 8), y: groundY + rand(-6, H * 0.05), box: h.box * 0.7, rot: rand(0, 6.28), a: 0.85 }); 
  }
  drawRested(); drawFloaters(99, 0, true);
  showWish(true);
  window.bdayDone = true;
}

/* ============================================================
   ACTS 1–3 (GSAP)
   ============================================================ */
function splitWord(el){
  const chars = [...el.textContent];
  el.textContent = '';
  return chars.map((c) => {
    const s = document.createElement('span');
    s.className = 'hl__ch';
    s.textContent = c === ' ' ? ' ' : c;
    el.appendChild(s);
    return s;
  });
}
const line1Chars = splitWord($('wLine1'));
const line2Chars = splitWord($('wLine2'));
const kChars = [...line1Chars, ...line2Chars];

function buildMotes(){
  motes.innerHTML = '';
  for (let i = 0; i < 12; i++){
    const m = document.createElement('span');
    m.className = 'mote';
    const s = rand(4, 12);
    m.style.width = m.style.height = `${s}px`;
    m.style.left = `${rand(4, 96)}%`;
    m.style.top  = `${rand(10, 96)}%`;
    motes.appendChild(m);
    gsap.set(m, { opacity: rand(0.25, 0.7) });
    gsap.to(m, { y: -rand(40, 140), x: rand(-30, 30), duration: rand(7, 14), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -rand(0, 8) });
    gsap.to(m, { opacity: rand(0.1, 0.5), duration: rand(2.5, 5), repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
}

const tip = $('tip');
let svgScale = 1, arrowBaseX = 0, arrowBaseY = 0, maxDraw = 120, curDraw = 0;
let pullUX = 0, pullUY = 1;
const REST_NOCK = 96;
const nockProxy = { val: REST_NOCK };

function applyNock(){
  const y = nockProxy.val;
  strL.setAttribute('y2', y); strR.setAttribute('y2', y); serving.setAttribute('cy', y);
}

// রেসপনসিভ ধনু ও বাণ অ্যাঙ্কর
function refreshRig(){
  const isWide = W / H > 1.0;
  const gripX = isWide ? W * 0.24 : W * 0.22;
  const gripY = isWide ? H * 0.76 : H * 0.78;
  const heartX = W * 0.5, heartY = H * 0.33;
  const aimRad = Math.atan2(heartX - gripX, gripY - heartY);
  pullUX = -Math.sin(aimRad); pullUY = Math.cos(aimRad);

  nockProxy.val = REST_NOCK; applyNock();
  gsap.set(archery, { rotation: 0, scale: 1, x: 0, y: 0 });
  archery.style.left = '0px'; archery.style.top = '0px';
  gsap.set(arrow, { x: 0, y: 0 });
  const aR = archery.getBoundingClientRect();
  const bR = bow.getBoundingClientRect();
  const sR = serving.getBoundingClientRect();
  const rR = arrow.getBoundingClientRect();
  svgScale = bR.width / 460;
  const gripLX = (bR.left - aR.left) + 0.5 * bR.width;
  const gripLY = (bR.top  - aR.top ) + (240 / 300) * bR.height;
  const nockLX = (sR.left - aR.left) + 0.5 * sR.width;
  const nockLY = (sR.top  - aR.top ) + 0.5 * sR.height;
  arrowBaseX = nockLX - ((rR.left - aR.left) + 0.5 * rR.width);
  arrowBaseY = nockLY - ((rR.top  - aR.top ) + (205 / 220) * rR.height);

  archery.style.left = (gripX - gripLX) + 'px';
  archery.style.top  = (gripY - gripLY) + 'px';
  gsap.set(archery, { transformOrigin: `${gripLX}px ${gripLY}px`, rotation: aimRad * 180 / Math.PI });
  gsap.set(arrow, { x: arrowBaseX, y: arrowBaseY });
  maxDraw = Math.min(bR.height * 0.72, H * 0.16, 132);
  curDraw = 0;
}

function setDraw(d){
  curDraw = clamp(d, 0, maxDraw);
  gsap.set(arrow, { x: arrowBaseX, y: arrowBaseY + curDraw });
  nockProxy.val = REST_NOCK + curDraw / svgScale; applyNock();
  gsap.set(aim, { opacity: 0.55 * (curDraw / maxDraw) });
}

let beatTL = null;
function startBeat(){
  gsap.set(targetHeart, { scale: 1 });
  gsap.set(heartGlow, { scale: 1, opacity: 0.7 });
  beatTL = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  beatTL.to(targetHeart, { scale: 1.07, duration: 0.13, ease: 'power2.out' }, 0)
        .to(heartGlow,   { scale: 1.15, opacity: 0.9, duration: 0.13, ease: 'power2.out' }, 0)
        .to(targetHeart, { scale: 1.0, duration: 0.2, ease: 'power2.in' }, 0.13)
        .to(targetHeart, { scale: 1.05, duration: 0.12, ease: 'power2.out' }, 0.3)
        .to(targetHeart, { scale: 1.0, duration: 0.5, ease: 'power2.inOut' }, 0.42)
        .to(heartGlow,   { scale: 1.0, opacity: 0.7, duration: 0.7, ease: 'power2.inOut' }, 0.3);
}
function stopBeat(){ if (beatTL){ beatTL.kill(); beatTL = null; } gsap.set(targetHeart, { scale: 1 }); }

function miniHeartSVG(fill){
  return `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 20C5.5 15 1.5 11.4 1.5 6.9 1.5 3.6 4 1.5 7 1.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.5 2.1 5.5 5.4C23.5 11.4 19.5 15 12 20Z" fill="${fill}"/></svg>`;
}
function burstHearts(){
  const r = target.getBoundingClientRect();
  const hr = hero.getBoundingClientRect();
  const ox = r.left - hr.left + r.width / 2;
  const oy = r.top - hr.top + r.height * 0.42;
  const cols = ['#ff6f97', '#ffb14e', '#ff8fae', '#ffd36a', '#e23b67'];
  const frag = document.createDocumentFragment();
  const nodes = [];
  for (let i = 0; i < 12; i++){
    const heart = i < 8;
    const el = document.createElement('span');
    el.className = 'burst';
    const s = heart ? rand(12, 22) : rand(4, 8);
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;pointer-events:none;z-index:4;`;
    if (heart) el.innerHTML = miniHeartSVG(pick(cols));
    else { el.style.borderRadius = '50%'; el.style.background = 'radial-gradient(circle,#fff,rgba(255,210,150,0) 70%)'; }
    frag.appendChild(el); nodes.push({ el, heart });
  }
  hero.appendChild(frag);
  nodes.forEach(({ el, heart }) => {
    const ang = rand(-Math.PI, 0);
    const dist = rand(heart ? 70 : 40, heart ? 190 : 120);
    gsap.to(el, {
      x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - rand(10, 50),
      rotation: rand(-120, 120), scale: heart ? rand(0.7, 1.2) : rand(0.4, 1),
      duration: rand(0.7, 1.15), ease: 'power2.out',
    });
    gsap.to(el, { opacity: 0, duration: 0.5, delay: rand(0.35, 0.6), ease: 'power1.in', onComplete: () => el.remove() });
  });
}

function shotGeom(){
  const tipR = tip.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();
  const tipX = tipR.left + tipR.width / 2, tipY = tipR.top + tipR.height / 2;
  const tcx = tRect.left + tRect.width / 2, tcy = tRect.top + tRect.height / 2;
  const flightDist = Math.hypot(tcx - tipX, tcy - tipY);
  const fallPx = Math.min(H * 0.26, H - tcy - tRect.height * 0.4);
  const impactX = tcx, impactY = tcy + fallPx;
  const distC = Math.hypot(Math.max(impactX, W - impactX), Math.max(impactY, H - impactY));
  const reach = Math.hypot(W / 2, H / 2);
  return {
    arrowStartY: arrowBaseY + curDraw,
    arrowFlyY:   arrowBaseY + curDraw - flightDist,
    drawnNock:   REST_NOCK + curDraw / svgScale,
    fallPx, fx: impactX - W / 2, fy: impactY - H / 2,
    floodScale: (distC * 1.12) / 70, bloomScale: (reach * 1.2) / 30,
  };
}

let filmTL = null;
function buildFilm(m){
  const t = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(field, { autoAlpha: 0 });
      treeStart();
      gsap.to(bloom, { autoAlpha: 0, duration: 1.15, ease: 'power2.out' });
    },
  });

  t.set(target, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 })
   .set(arrow, { opacity: 1, x: arrowBaseX, y: m.arrowStartY, scaleY: 1 })
   .set([flood, bloom], { autoAlpha: 0, scale: 0.001, x: 0, y: 0 })
   .set(flood, { x: m.fx, y: m.fy })
   .set(field, { autoAlpha: 0 })
   .set(camera, { scale: 1, yPercent: 0 })
   .set(barTop, { yPercent: -100 })
   .set(barBot, { yPercent: 100 })
   .set(kEyebrow, { opacity: 0, y: 12 })
   .set(kSub, { opacity: 0, y: 12 })
   .set(kChars, { transformPerspective: 620, transformOrigin: '50% 100%', yPercent: 135, rotationX: -82 });

  t.fromTo(nockProxy, { val: m.drawnNock }, { val: REST_NOCK, duration: 0.5, ease: 'elastic.out(1,0.34)', onUpdate: applyNock }, 0)
   .to(arrow, { y: m.arrowFlyY, duration: 0.26, ease: 'power2.in' }, 0)
   .to(arrow, { scaleY: 1.16, duration: 0.14, ease: 'power2.in' }, 0)
   .to(arrow, { scaleY: 1.0, duration: 0.1, ease: 'power1.out' }, 0.16)
   .to(aim, { opacity: 0, duration: 0.18 }, 0)
   .to([eyebrow, hint], { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

  t.add(burstHearts, 0.26)
   .to(target, { x: 7, y: -9, duration: 0.06, ease: 'power2.out' }, 0.26)
   .to(target, { x: 0, y: 0, duration: 0.32, ease: 'power2.out' }, 0.32)
   .to(target, { scale: 1.14, duration: 0.06, ease: 'power2.out' }, 0.26)
   .to(target, { scale: 1.0, duration: 0.26, ease: 'power2.inOut' }, 0.32)
   .to(arrow, { rotation: '+=4', duration: 0.05, yoyo: true, repeat: 4, ease: 'sine.inOut' }, 0.27)
   .set(arrow, { rotation: 0 }, 0.52)
   .to(arrow, { opacity: 0, duration: 0.16, ease: 'power1.out' }, 0.56);

  t.to(target, { y: m.fallPx, scaleX: 0.84, scaleY: 1.3, duration: 0.34, ease: 'power1.in' }, 0.64)
   .to(target, { scaleX: 1.4, scaleY: 0.6, duration: 0.07, ease: 'power2.out' }, 0.98)
   .set(flood, { autoAlpha: 1 }, 1.00)
   .fromTo(flood, { scale: 0.02 }, { scale: m.floodScale, duration: 0.34, ease: 'power2.in' }, 1.00)
   .to(target, { opacity: 0, duration: 0.12, ease: 'power1.out' }, 1.06);

  t.set(field, { autoAlpha: 1 }, 1.32)
   .set(hero, { autoAlpha: 0 }, 1.33)
   .set(flood, { autoAlpha: 0 }, 1.36);

  t.fromTo(camera, { scale: 1.0, yPercent: 0 }, { scale: 1.05, yPercent: -1.0, duration: 2.6, ease: 'none' }, 1.38);

  t.call(cue, ['hit'], 0.26)
   .call(cue, ['flood'], 1.00)
   .call(cue, ['wish'], 1.68)
   .call(cue, ['wish2'], 2.06)
   .call(cue, ['bloom'], 3.42);

  t.to(barTop, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
   .to(barBot, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5);

  t.to(kEyebrow, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.54)
   .to(line1Chars, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 1.68)
   .to(line2Chars, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 2.06)
   .to(kSub, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 2.65);

  t.to(barTop, { yPercent: -100, duration: 0.5, ease: 'power2.in' }, 3.32)
   .to(barBot, { yPercent: 100, duration: 0.5, ease: 'power2.in' }, 3.32)
   .set(bloom, { autoAlpha: 1 }, 3.42)
   .fromTo(bloom, { scale: 0.02 }, { scale: m.bloomScale, duration: 0.58, ease: 'power2.in' }, 3.42);

  return t;
}

let played = false, drawing = false, startPX = 0, startPY = 0, startDraw = 0;

function fire(){
  if (played) return;
  played = true;
  drawing = false;
  stopBeat();
  cue('release'); cue('whoosh');
  filmTL = buildFilm(shotGeom());
  filmTL.play(0);
}

function springBack(){
  const from = curDraw;
  gsap.to({ d: from }, { d: 0, duration: 0.55, ease: 'elastic.out(1,0.4)', onUpdate() { setDraw(this.targets()[0].d); } });
}

function autoFire(){
  if (played) return;
  recT0 = performance.now(); cue('draw');
  gsap.to({ d: curDraw }, {
    d: maxDraw * 0.94, duration: 0.62, ease: 'power2.inOut',
    onUpdate() { setDraw(this.targets()[0].d); },
    onComplete: () => gsap.delayedCall(0.16, fire),
  });
}

archery.addEventListener('pointerdown', (e) => {
  if (played) return;
  drawing = true;
  try { archery.setPointerCapture(e.pointerId); } catch (_) {}
  startPX = e.clientX; startPY = e.clientY; startDraw = curDraw;
  e.preventDefault();
});
archery.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const proj = (e.clientX - startPX) * pullUX + (e.clientY - startPY) * pullUY;
  setDraw(startDraw + proj);
});
function endDraw(){
  if (!drawing) return;
  drawing = false;
  if (curDraw > maxDraw * 0.26) fire(); else springBack();
}
archery.addEventListener('pointerup', endDraw);
archery.addEventListener('pointercancel', endDraw);
archery.addEventListener('keydown', (e) => {
  if (played) return;
  if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); autoFire(); }
});

function enter(){
  gsap.set(hero, { autoAlpha: 1 });
  refreshRig();
  setDraw(0);
  gsap.set([eyebrow, hint], { opacity: 0, y: 14 });
  gsap.set(target, { opacity: 0, y: 10, scaleX: 0.9, scaleY: 0.9 });
  gsap.set(archery, { opacity: 0, scale: 0.85 });
  gsap.set(heartGlow, { opacity: 0, scale: 1 });
  gsap.set(arrow, { opacity: 1 });

  const tl = gsap.timeline({ onComplete: startBeat });
  tl.to(target,   { opacity: 1, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'power3.out' }, 0.1)
    .to(heartGlow,{ opacity: 0.7, duration: 0.8, ease: 'power2.out' }, 0.2)
    .to(archery,  { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.28)
    .to(eyebrow,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
    .to(hint,     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
}

function armReplay(){
  replay.hidden = false;
  requestAnimationFrame(() => replay.classList.add('is-shown'));
}

function resetAll(){
  treeStop();
  showWish(false);
  window.bdayDone = false; replayArmed = false;
  replay.classList.remove('is-shown'); replay.hidden = true;
  if (filmTL){ filmTL.pause(0); }
  gsap.set([flood, bloom], { autoAlpha: 0 });
  gsap.set(field, { autoAlpha: 0 });
  gsap.set(arrow, { opacity: 1, scaleY: 1 });
  played = false;
  enter();
}

function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; 
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr); 
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildSprites();
  buildScene();
  if (reduceMotion){ drawFinal(); return; }
  if (played && filmTL){
    const at = filmTL.time(); const active = filmTL.isActive();
    filmTL = buildFilm(shotGeom());
    filmTL.pause(at);
    if (active) filmTL.play(at);
  } else {
    refreshRig(); setDraw(0);
  }
}
let resizeRAF = 0;
window.addEventListener('resize', () => { if (resizeRAF) return; resizeRAF = requestAnimationFrame(() => { resizeRAF = 0; resize(); }); });

resize();

if (reduceMotion){
  drawFinal();
} else {
  buildMotes();
  document.fonts && document.fonts.ready.then(() => { refreshRig(); setDraw(0); });
  enter();
  replay.addEventListener('click', resetAll);
}

if (isRecord){
  window.bdayAPI = {
    start(){ autoFire(); },
    replay(){ resetAll(); },
  };
}