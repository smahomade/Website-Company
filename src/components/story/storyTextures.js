/* Canvas painters for the 3D story's textures.
   Every sheet is SHEET_W × SHEET_H (the 3.4 × 2.3 world-unit sheet ratio).
   The demo site is split into four layers that share one layout, so the
   pencil sketch and the finished design line up exactly during the wipe. */

export const SHEET_W = 1024;
export const SHEET_H = 693;
const DEMO_URL = 'yourbusiness.co.uk';

const CHROME_H = 62;
const CARD_X = [64, 378, 692];
const CARD_TITLES = ['Friendly service', 'Local & trusted', 'Book online'];

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function glow(c, x, y, r, rgb, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
  g.addColorStop(1, 'rgba(' + rgb + ',0)');
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

/* Small seeded PRNG so redraws (e.g. after web fonts load) are identical. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Clear, then clip to the sheet's rounded corners. Callers c.restore(). */
function begin(c) {
  c.clearRect(0, 0, SHEET_W, SHEET_H);
  c.save();
  rr(c, 0, 0, SHEET_W, SHEET_H, 34);
  c.clip();
}

/* Browser frame: begin() + white page + address bar. Callers c.restore(). */
function chrome(c, url, lock = false) {
  begin(c);
  c.fillStyle = '#fff';
  c.fillRect(0, 0, SHEET_W, SHEET_H);
  c.fillStyle = '#EFECE8';
  c.fillRect(0, 0, SHEET_W, CHROME_H);
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(38 + i * 26, 31, 8.5, 0, Math.PI * 2);
    c.fill();
  });
  c.fillStyle = '#fff';
  rr(c, 150, 15, SHEET_W - 300, 32, 16);
  c.fill();
  c.fillStyle = '#8A847D';
  c.font = '500 17px ui-monospace, Menlo, Consolas, monospace';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(url, SHEET_W / 2 + (lock ? 10 : 0), 32);
  if (lock) {
    const lx = SHEET_W / 2 - c.measureText(url).width / 2 - 8;
    c.strokeStyle = '#2E9E5B';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(lx, 28, 4, Math.PI, 0);
    c.stroke();
    c.fillStyle = '#2E9E5B';
    rr(c, lx - 6, 28, 12, 9, 2);
    c.fill();
  }
  c.textBaseline = 'alphabetic';
}

function pill(c, x, y, w, h, fill, label, color, size) {
  c.fillStyle = fill;
  rr(c, x, y, w, h, h / 2);
  c.fill();
  c.fillStyle = color;
  c.font = '700 ' + size + 'px Outfit, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(label, x + w / 2, y + h / 2 + 1);
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
}

function star(c, cx, cy, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r * 0.45 : r;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.closePath();
  c.fill();
}

function card(c, x, y, w, h, r) {
  c.save();
  c.shadowColor = 'rgba(40, 24, 10, 0.16)';
  c.shadowBlur = 26;
  c.shadowOffsetY = 10;
  c.fillStyle = '#FFFFFF';
  rr(c, x, y, w, h, r);
  c.fill();
  c.restore();
  c.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  c.lineWidth = 1.5;
  rr(c, x, y, w, h, r);
  c.stroke();
}

/* ─────────── Demo site, layer 1: structure (frame, backgrounds) ─────────── */
export function drawDemoBase(c) {
  chrome(c, DEMO_URL, true);
  const hy = 122;
  const hh = 318;
  let g = c.createLinearGradient(0, hy, SHEET_W, hy + hh);
  g.addColorStop(0, '#1C1411');
  g.addColorStop(0.55, '#3B2418');
  g.addColorStop(1, '#6A3A1E');
  c.fillStyle = g;
  c.fillRect(0, hy, SHEET_W, hh);
  c.save();
  c.beginPath();
  c.rect(0, hy, SHEET_W, hh);
  c.clip(); /* keep the glow and bokeh out of the browser bar and nav */
  glow(c, 820, 220, 320, '255,150,80', 0.55);
  glow(c, 640, 390, 220, '255,110,40', 0.25);
  const r = rng(7);
  for (let i = 0; i < 16; i++) {
    glow(c, 520 + r() * 480, hy + 20 + r() * 270, 14 + r() * 34, '255,214,160', 0.16 + r() * 0.2);
  }
  g = c.createLinearGradient(0, 0, 640, 0);
  g.addColorStop(0, 'rgba(17,12,10,0.78)');
  g.addColorStop(1, 'rgba(17,12,10,0)');
  c.fillStyle = g;
  c.fillRect(0, hy, 640, hh);
  c.restore();
  c.fillStyle = '#F7F4EF';
  c.fillRect(0, hy + hh, SHEET_W, 652 - (hy + hh));
  c.fillStyle = '#151515';
  c.fillRect(0, 652, SHEET_W, SHEET_H - 652);
  c.restore();
}

/* ─────────── Layer 2: layout (nav rule, cards) ─────────── */
export function drawDemoLayout(c) {
  begin(c);
  c.fillStyle = '#ECE7E0';
  c.fillRect(0, 120, SHEET_W, 2);
  card(c, 676, 318, 284, 92, 18);
  CARD_X.forEach((x) => card(c, x, 462, 268, 168, 18));
  c.restore();
}

/* ─────────── Layer 3: content (words) ─────────── */
export function drawDemoContent(c) {
  begin(c);
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillStyle = '#151515';
  c.font = '700 22px Outfit, sans-serif';
  c.fillText('yourbusiness', 84, 92);
  c.fillStyle = '#4A4540';
  c.font = '500 15px Outfit, sans-serif';
  [['Services', 500], ['About', 590], ['Reviews', 664], ['Contact', 752]].forEach(([s, x]) => c.fillText(s, x, 92));

  c.textBaseline = 'alphabetic';
  c.fillStyle = '#FFFFFF';
  c.font = '800 54px Outfit, sans-serif';
  c.fillText('Your business,', 64, 236);
  c.fillStyle = '#FFB27A';
  c.fillText('beautifully online.', 64, 298);
  c.fillStyle = 'rgba(255,255,255,0.74)';
  c.font = '400 18px Outfit, sans-serif';
  c.fillText('Friendly local service, booked in a few taps.', 66, 340);

  c.fillStyle = '#151515';
  c.font = '800 30px Outfit, sans-serif';
  c.fillText('4.9', 700, 374);
  c.fillStyle = '#7A736C';
  c.font = '500 14px Outfit, sans-serif';
  c.fillText('from 120 Google reviews', 700, 396);

  CARD_X.forEach((x, i) => {
    c.fillStyle = '#151515';
    c.font = '700 20px Outfit, sans-serif';
    c.fillText(CARD_TITLES[i], x + 24, 560);
    c.fillStyle = '#DDD6CC';
    rr(c, x + 24, 578, 206, 9, 4.5);
    c.fill();
    rr(c, x + 24, 598, 150, 9, 4.5);
    c.fill();
  });

  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.font = '700 14px Outfit, sans-serif';
  c.fillText('yourbusiness', 64, 678);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 4; i++) {
    rr(c, 560 + i * 100, 670, 70, 8, 4);
    c.fill();
  }
  c.restore();
}

/* ─────────── Layer 4: interaction (buttons, icons, stars) ─────────── */
export function drawDemoUI(c) {
  begin(c);
  c.fillStyle = '#FF6A00';
  rr(c, 44, 78, 28, 28, 8);
  c.fill();
  c.fillStyle = '#FFFDF8';
  rr(c, 51, 85, 6, 6, 1.5);
  c.fill();
  rr(c, 59, 93, 6, 6, 1.5);
  c.fill();

  pill(c, 862, 76, 118, 32, '#FF6A00', 'Book now', '#FFFFFF', 14);
  pill(c, 64, 372, 168, 46, '#FF6A00', 'Get in touch', '#FFFFFF', 16);
  c.strokeStyle = 'rgba(255,255,255,0.8)';
  c.lineWidth = 2;
  rr(c, 247, 373, 166, 44, 22);
  c.stroke();
  c.fillStyle = '#FFFFFF';
  c.font = '700 16px Outfit, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('Our services', 330, 396);
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';

  c.fillStyle = '#FF6A00';
  for (let i = 0; i < 5; i++) star(c, 772 + i * 24, 364, 10);

  CARD_X.forEach((x, i) => {
    c.fillStyle = '#FFE8D7';
    c.beginPath();
    c.arc(x + 46, 508, 24, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#FF6A00';
    c.strokeStyle = '#FF6A00';
    c.lineWidth = 3;
    if (i === 0) {
      c.beginPath();
      c.arc(x + 46, 504, 9, 0.1 * Math.PI, 0.9 * Math.PI);
      c.stroke();
      c.beginPath();
      c.arc(x + 41, 500, 2.2, 0, Math.PI * 2);
      c.arc(x + 51, 500, 2.2, 0, Math.PI * 2);
      c.fill();
    } else if (i === 1) {
      c.beginPath();
      c.moveTo(x + 46, 520);
      c.bezierCurveTo(x + 32, 504, x + 36, 494, x + 46, 494);
      c.bezierCurveTo(x + 56, 494, x + 60, 504, x + 46, 520);
      c.fill();
      c.fillStyle = '#FFE8D7';
      c.beginPath();
      c.arc(x + 46, 503, 3.5, 0, Math.PI * 2);
      c.fill();
    } else {
      rr(c, x + 34, 497, 24, 22, 4);
      c.stroke();
      c.beginPath();
      c.moveTo(x + 34, 505);
      c.lineTo(x + 58, 505);
      c.stroke();
      c.fillRect(x + 39, 492, 3, 7);
      c.fillRect(x + 50, 492, 3, 7);
    }
  });

  c.fillStyle = '#FF6A00';
  c.beginPath();
  c.arc(966, 612, 24, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#FFFFFF';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(957 + i * 9, 612, 2.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/* ─────────── The brief: same layout, drawn in pencil on paper ─────────── */
function pencil(c, r) {
  const j = (k = 1) => (r() - 0.5) * 2.2 * k;
  const line = (x1, y1, x2, y2) => {
    for (let p = 0; p < 2; p++) {
      c.beginPath();
      c.moveTo(x1 + j(), y1 + j());
      c.quadraticCurveTo((x1 + x2) / 2 + j(2), (y1 + y2) / 2 + j(2), x2 + j(), y2 + j());
      c.stroke();
    }
  };
  const rect = (x, y, w, h) => {
    line(x - 4, y, x + w + 3, y);
    line(x + w, y - 3, x + w, y + h + 4);
    line(x + w + 4, y + h, x - 3, y + h);
    line(x, y + h + 3, x, y - 4);
  };
  const circle = (cx, cy, rad) => {
    for (let p = 0; p < 2; p++) {
      const s = r() * Math.PI * 2;
      c.beginPath();
      for (let a = 0; a <= 6.6; a += 0.3) {
        const k = rad + j(0.6);
        const px = cx + Math.cos(s + a) * k;
        const py = cy + Math.sin(s + a) * k;
        if (a === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
    }
  };
  const scribble = (x, y, w) => {
    c.beginPath();
    c.moveTo(x, y + j());
    for (let i = 0; i < w; i += 16) {
      c.quadraticCurveTo(x + i + 8, y + ((i / 16) % 2 ? -4 : 4) + j(), x + i + 16, y + j());
    }
    c.stroke();
  };
  const capsule = (x, y, w, h) => {
    for (let p = 0; p < 2; p++) {
      c.save();
      c.translate(j(), j());
      rr(c, x, y, w, h, h / 2);
      c.stroke();
      c.restore();
    }
  };
  const arrow = (x1, y1, x2, y2) => {
    line(x1, y1, x2, y2);
    const a = Math.atan2(y2 - y1, x2 - x1);
    line(x2, y2, x2 - 14 * Math.cos(a - 0.5), y2 - 14 * Math.sin(a - 0.5));
    line(x2, y2, x2 - 14 * Math.cos(a + 0.5), y2 - 14 * Math.sin(a + 0.5));
  };
  return { line, rect, circle, scribble, capsule, arrow };
}

export function drawDemoSketch(c) {
  const W = SHEET_W;
  const H = SHEET_H;
  const P = pencil(c, rng(42));
  begin(c);
  c.fillStyle = '#FBF8F1';
  c.fillRect(0, 0, W, H);
  c.fillStyle = '#E6DED0';
  for (let x = 18; x < W; x += 26) for (let y = 18; y < H; y += 26) c.fillRect(x, y, 2, 2);

  c.strokeStyle = 'rgba(38, 34, 30, 0.82)';
  c.lineWidth = 2.2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  P.rect(16, 14, W - 32, H - 28);
  P.line(16, 62, W - 16, 62);
  P.circle(44, 38, 7);
  P.circle(68, 38, 7);
  P.circle(92, 38, 7);
  P.capsule(160, 26, W - 320, 24);

  P.rect(44, 78, 28, 28);
  P.line(46, 80, 70, 104);
  P.line(70, 80, 46, 104);
  P.scribble(84, 92, 110);
  [500, 590, 664, 752].forEach((x) => P.scribble(x, 92, 56));
  P.capsule(862, 76, 118, 32);
  P.line(16, 122, W - 16, 122);

  c.strokeStyle = 'rgba(38, 34, 30, 0.35)';
  P.rect(30, 134, W - 60, 294);
  P.line(560, 142, W - 40, 420);
  P.line(W - 40, 142, 560, 420);
  c.strokeStyle = 'rgba(38, 34, 30, 0.85)';

  c.lineWidth = 7;
  P.scribble(64, 222, 340);
  P.scribble(64, 286, 420);
  c.lineWidth = 2.2;
  P.line(66, 334, 430, 334);
  P.capsule(64, 372, 168, 46);
  P.capsule(246, 372, 168, 46);

  P.rect(676, 318, 284, 92);
  P.scribble(700, 368, 48);
  for (let i = 0; i < 5; i++) {
    const x = 772 + i * 24;
    P.line(x - 7, 364, x + 7, 364);
    P.line(x, 357, x, 371);
  }

  CARD_X.forEach((x) => {
    P.rect(x, 462, 268, 168);
    P.circle(x + 46, 508, 22);
    P.scribble(x + 24, 556, 150);
    P.line(x + 24, 582, x + 230, 582);
    P.line(x + 24, 602, x + 174, 602);
  });
  P.circle(966, 612, 22);

  c.fillStyle = '#E35500';
  c.strokeStyle = '#E35500';
  c.lineWidth = 2.4;
  c.font = '700 36px Caveat, "Segoe Print", cursive';
  c.textAlign = 'left';
  /* paper-coloured halo knocks the pencil lines out from under the notes */
  const note = (txt, x, y) => {
    c.save();
    c.strokeStyle = '#FBF8F1';
    c.lineWidth = 9;
    c.lineJoin = 'round';
    c.strokeText(txt, x, y);
    c.restore();
    c.fillText(txt, x, y);
  };
  note('big, friendly headline!', 470, 214);
  P.arrow(462, 206, 418, 222);
  note('warm photo here', 690, 186);
  note('orange CTA', 300, 456);
  P.arrow(296, 446, 220, 424);
  note('reviews = trust', 712, 306);
  note('3 reasons to pick them', 340, 664);
  c.restore();
}

/* Where the sketch's handwritten notes sit (x, y, w, h on the sheet), in the
   order the cat points them out when it presents the brief. */
export const SKETCH_NOTES = [
  [470, 178, 330, 48], /* big, friendly headline! */
  [286, 422, 190, 48], /* orange CTA */
  [700, 270, 240, 48], /* reviews = trust */
  [326, 630, 350, 48], /* 3 reasons to pick them */
];

/* The tablet the cat designs on: the brand's colours along the top and, under
   them, the page in miniature. It starts as the pencil sketch and the cat
   colours it in the way you would with a fat marker: scribbling up and down
   across one band, lifting, then back across the next, as k goes 0 → 1.
   `sketch` and `design` are the two full-size sheet canvases. */
export const PAD_W = 384;
export const PAD_H = 300;
const PAD_BAR = 40;
const PAD_ROWS = 3;
const PAD_ROW_H = (PAD_H - PAD_BAR) / PAD_ROWS;
const PAD_SWINGS = 8; /* strokes up or down across each band */
const PAD_LIFT = 0.1; /* the share of each band's time spent lifting the pencil to the next */
const PAD_MARK = 82; /* how wide the marker lays colour down: enough for neighbouring strokes to meet */
const PAD_INKS = ['#1C1411', '#6A3A1E', '#FF6A00', '#FFB27A', '#FFFDF8'];
/* the pencil on band i, u (0..1) of the way across it: it runs a little past
   the band's edges at each turn, as a hand does */
function padStroke(i, u, out) {
  out[0] = PAD_W * (i % 2 ? 1 - u : u);
  out[1] = PAD_BAR + (i + 0.5) * PAD_ROW_H - Math.cos(u * PAD_SWINGS * Math.PI) * (PAD_ROW_H / 2 + 8);
  return out;
}
const padAt = [0, 0, 0, 0];
const padTo = [0, 0];
let padMask = null;
/* Where the pencil is at k: [x, y, swing, lift]. swing (-1..1) is which way the
   stroke is going, for the wrist; lift (0..1) is the pencil off the glass
   between bands. */
export function padTip(k) {
  const p = Math.min(1, Math.max(0, k)) * PAD_ROWS;
  const i = Math.min(PAD_ROWS - 1, Math.floor(p));
  const f = Math.min(1, p - i);
  const u = Math.min(1, f / (1 - PAD_LIFT));
  padStroke(i, u, padAt);
  padAt[2] = u < 1 ? Math.sin(u * PAD_SWINGS * Math.PI) : 0;
  padAt[3] = 0;
  if (u >= 1 && i < PAD_ROWS - 1) {
    /* across to the start of the next band */
    const v = (f - (1 - PAD_LIFT)) / PAD_LIFT;
    const e = v * v * (3 - 2 * v);
    padStroke(i + 1, 0, padTo);
    padAt[0] += (padTo[0] - padAt[0]) * e;
    padAt[1] += (padTo[1] - padAt[1]) * e;
    padAt[3] = Math.sin(Math.PI * v);
  }
  return padAt;
}
export function drawPad(c, sketch, design, k) {
  const p = Math.min(1, Math.max(0, k)) * PAD_ROWS;
  c.fillStyle = '#F4EFE7';
  c.fillRect(0, 0, PAD_W, PAD_H);
  PAD_INKS.forEach((ink, i) => {
    const x = 26 + i * 30;
    c.fillStyle = ink;
    c.beginPath();
    c.arc(x, PAD_BAR / 2, 9, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(38, 34, 30, 0.3)';
    c.lineWidth = 1.5;
    c.stroke();
    if (k > 0 && k < 1 && i === Math.min(PAD_INKS.length - 1, Math.floor(k * PAD_INKS.length))) {
      /* the colour in use */
      c.strokeStyle = '#FF6A00';
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(x, PAD_BAR / 2, 13, 0, Math.PI * 2);
      c.stroke();
    }
  });
  c.drawImage(sketch, 0, PAD_BAR, PAD_W, PAD_H - PAD_BAR);
  if (p <= 0) return;
  /* everything the marker has been over so far, then the design shown through it */
  if (!padMask) {
    padMask = document.createElement('canvas');
    padMask.width = PAD_W;
    padMask.height = PAD_H;
  }
  const m = padMask.getContext('2d');
  m.globalCompositeOperation = 'source-over';
  m.clearRect(0, 0, PAD_W, PAD_H);
  m.fillStyle = '#000';
  m.strokeStyle = '#000';
  m.lineWidth = PAD_MARK;
  m.lineCap = 'round';
  m.lineJoin = 'round';
  for (let i = 0; i < PAD_ROWS; i++) {
    const f = Math.min(1, p - i);
    if (f <= 0) break;
    const u = Math.min(1, f / (1 - PAD_LIFT));
    const y = PAD_BAR + i * PAD_ROW_H;
    if (u >= 1) {
      m.fillRect(0, y, PAD_W, PAD_ROW_H + 0.5);
      continue;
    }
    m.save();
    m.beginPath();
    m.rect(0, y, PAD_W, PAD_ROW_H + 0.5);
    m.clip();
    m.beginPath();
    for (let q = 0; q < u; q += 1 / 96) {
      padStroke(i, q, padTo);
      m.lineTo(padTo[0], padTo[1]);
    }
    padStroke(i, u, padTo);
    m.lineTo(padTo[0], padTo[1]);
    m.stroke();
    m.restore();
  }
  m.globalCompositeOperation = 'source-in';
  m.drawImage(design, 0, PAD_BAR, PAD_W, PAD_H - PAD_BAR);
  c.drawImage(padMask, 0, 0);
}

/* ─────────── Client sheets ─────────── */
export function drawClientShot(c, img, url) {
  chrome(c, url, true);
  const top = CHROME_H;
  const areaH = SHEET_H - top;
  const s = Math.max(SHEET_W / img.naturalWidth, areaH / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  c.drawImage(img, (SHEET_W - dw) / 2, top, dw, dh);
  c.restore();
}

function drawRaza(c, url) {
  const W = SHEET_W;
  const H = SHEET_H;
  chrome(c, url, true);
  c.fillStyle = '#1D4FA3';
  c.beginPath();
  c.arc(56, 90, 14, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#C9CDD6';
  for (let i = 0; i < 5; i++) {
    rr(c, 470 + i * 80, 86, 58, 8, 4);
    c.fill();
  }
  c.fillStyle = '#1D4FA3';
  rr(c, W - 132, 76, 94, 28, 14);
  c.fill();
  const g = c.createLinearGradient(0, 118, 0, 566);
  g.addColorStop(0, '#2259B8');
  g.addColorStop(1, '#153C82');
  c.fillStyle = g;
  c.fillRect(0, 118, W, 448);
  c.fillStyle = '#FF8A1F';
  rr(c, W / 2 - 132, 148, 264, 30, 15);
  c.fill();
  c.fillStyle = '#fff';
  c.font = '700 14px Outfit, sans-serif';
  c.textAlign = 'center';
  c.fillText('WELCOME TO RAZA ACADEMY', W / 2 + 1, 168);
  c.fillStyle = '#fff';
  c.beginPath();
  c.arc(W / 2, 232, 34, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#1D4FA3';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(W / 2, 232, 21, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = '#FF8A1F';
  c.beginPath();
  c.arc(W / 2, 232, 8, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#fff';
  c.font = '800 60px Outfit, sans-serif';
  c.fillText('Expert Tuition in', W / 2, 322);
  c.fillStyle = '#FFA43A';
  c.fillText('Maths & Islamic Studies', W / 2, 388);
  c.fillStyle = 'rgba(255,255,255,.5)';
  rr(c, W / 2 - 230, 420, 460, 10, 5);
  c.fill();
  rr(c, W / 2 - 170, 440, 340, 10, 5);
  c.fill();
  c.fillStyle = '#fff';
  rr(c, W / 2 - 152, 482, 144, 42, 21);
  c.fill();
  c.fillStyle = '#FF8A1F';
  rr(c, W / 2 + 8, 482, 144, 42, 21);
  c.fill();
  c.fillStyle = '#F5F6F9';
  c.fillRect(0, 566, W, H - 566);
  for (let i = 0; i < 3; i++) {
    const x = 56 + i * 312;
    c.fillStyle = '#fff';
    rr(c, x, 592, 288, 130, 14);
    c.fill();
    c.strokeStyle = '#E2E5EB';
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = '#1D4FA3';
    rr(c, x + 22, 614, 42, 42, 10);
    c.fill();
  }
  c.restore();
}

function drawTopOne(c, url) {
  const W = SHEET_W;
  const H = SHEET_H;
  chrome(c, url, true);
  const g = c.createRadialGradient(W / 2, 320, 40, W / 2, 320, 640);
  g.addColorStop(0, '#5E5A57');
  g.addColorStop(1, '#191817');
  c.fillStyle = g;
  c.fillRect(0, 62, W, H - 62);
  c.fillStyle = 'rgba(255,255,255,.8)';
  c.font = '400 18px Georgia, serif';
  c.textAlign = 'left';
  c.fillText('TOP 1 ONE', 40, 102);
  c.fillStyle = 'rgba(255,255,255,.4)';
  for (let i = 0; i < 6; i++) {
    rr(c, 330 + i * 92, 94, 62, 7, 3.5);
    c.fill();
  }
  c.fillStyle = '#F3EFEA';
  c.font = '400 116px Georgia, serif';
  c.textAlign = 'right';
  c.fillText('TOP', W / 2 - 46, 340);
  c.textAlign = 'left';
  c.fillText('ONE', W / 2 + 46, 340);
  c.font = 'italic 700 200px Georgia, serif';
  c.textAlign = 'center';
  c.fillText('1', W / 2, 358);
  c.font = '400 22px Georgia, serif';
  c.fillText('H A I R   &   B E A U T Y   S A L O N', W / 2, 404);
  ['#8B6F5A', '#C9A27E', '#6B5446', '#A88B74', '#D9BFA3'].forEach((t, i) => {
    c.fillStyle = t;
    rr(c, W / 2 - 304 + i * 124, 456, 112, 80, 10);
    c.fill();
  });
  c.strokeStyle = 'rgba(255,255,255,.65)';
  c.lineWidth = 2;
  rr(c, W / 2 - 84, 572, 168, 44, 22);
  c.stroke();
  c.fillStyle = '#fff';
  c.font = '600 15px Outfit, sans-serif';
  c.fillText('BOOK NOW', W / 2, 600);
  c.restore();
}

function drawCWT(c, url) {
  const W = SHEET_W;
  const H = SHEET_H;
  chrome(c, url, true);
  const g = c.createLinearGradient(0, 62, W, H);
  g.addColorStop(0, '#30472A');
  g.addColorStop(1, '#141E10');
  c.fillStyle = g;
  c.fillRect(0, 62, W, H - 62);
  glow(c, 600, 300, 260, '214,190,140', 0.35);
  [[110, 210, 200, '86,122,62'], [900, 190, 220, '92,128,66'], [960, 450, 170, '70,100,52'], [70, 500, 170, '64,92,48'], [480, 150, 130, '78,110,58']]
    .forEach(([x, y, r, col]) => glow(c, x, y, r, col, 0.85));
  ['#D9443A', '#EE8A2E', '#F2C53D', '#5DAF4E', '#3E7FC1', '#7A4FB0'].forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(250 + i * 104, H);
    c.lineTo(354 + i * 104, H);
    c.lineTo(462 + i * 62, H - 120);
    c.lineTo(400 + i * 62, H - 120);
    c.closePath();
    c.fill();
  });
  c.fillStyle = '#EDE7DC';
  c.beginPath();
  c.ellipse(590, 548, 128, 50, 0, 0, Math.PI * 2);
  c.fill();
  rr(c, 546, 384, 88, 170, 44);
  c.fill();
  c.fillStyle = '#5A3E2C';
  c.beginPath();
  c.arc(590, 356, 32, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.9)';
  c.font = '600 16px Outfit, sans-serif';
  c.textAlign = 'left';
  c.fillText('Change Work Therapies', 40, 100);
  c.fillStyle = '#F4EFE6';
  c.font = 'italic 400 76px Georgia, serif';
  c.fillText('Heal from', 70, 290);
  c.fillText('within.', 70, 370);
  c.fillStyle = '#E07A3A';
  rr(c, 72, 462, 130, 38, 19);
  c.fill();
  c.fillStyle = '#F4EFE6';
  rr(c, 214, 462, 130, 38, 19);
  c.fill();
  c.restore();
}

function drawGenericClient(c, url, title) {
  chrome(c, url, true);
  c.fillStyle = '#1A1A1A';
  c.fillRect(0, 62, SHEET_W, SHEET_H - 62);
  c.fillStyle = '#FFFDF8';
  c.font = '800 56px Outfit, sans-serif';
  c.textAlign = 'center';
  c.fillText(title, SHEET_W / 2, 380);
  c.restore();
}

const STAND_INS = { 'raza-academy': drawRaza, 'top-one-salon': drawTopOne, 'change-work-therapies': drawCWT };

/* Drawn likeness used until (or instead of) the real screenshot loads. */
export function drawClientStandIn(c, client) {
  const fn = STAND_INS[client.id];
  if (fn) fn(c, client.host);
  else drawGenericClient(c, client.host, client.title);
}

/* ─────────── Small decals ─────────── */
/* ─────────── Build chapter ─────────── */
/* The plan the site is built from: the demo's layout as dashed outlines. */
export function drawDemoPlan(c) {
  begin(c);
  c.fillStyle = '#231A15';
  c.fillRect(0, 0, SHEET_W, SHEET_H);
  c.strokeStyle = 'rgba(255,138,61,0.6)';
  c.lineWidth = 3;
  c.setLineDash([10, 8]);
  [[0, CHROME_H, SHEET_W, 60, 0], [0, 122, SHEET_W, 318, 0], [64, 372, 168, 46, 23], [247, 373, 166, 44, 22], [676, 318, 284, 92, 18], [0, 652, SHEET_W, 41, 0]]
    .concat(CARD_X.map((x) => [x, 462, 268, 168, 18]))
    .forEach(([x, y, w, h, r]) => {
      rr(c, x, y, w, h, r);
      c.stroke();
    });
  c.setLineDash([]);
  c.fillStyle = 'rgba(255,138,61,0.35)';
  rr(c, 64, 196, 420, 40, 8);
  c.fill();
  rr(c, 64, 256, 500, 40, 8);
  c.fill();
  c.restore();
}

/* Editor window that types the page out while it builds. p: 0 → 1. */
const CODE_LINES = [
  ['<header ', 'class', '="nav">', 0.02],
  ['  <a ', 'class', '="logo">yourbusiness</a>', 0.07],
  ['<h1>', '', 'Your business, online.</h1>', 0.16],
  ['<a ', 'class', '="btn">Get in touch</a>', 0.3],
  ['<section ', 'class', '="cards">', 0.45],
  ['  <article>', '', 'Friendly service</article>', 0.52],
  ['  <article>', '', 'Book online</article>', 0.6],
  ['<footer>', '', '© yourbusiness</footer>', 0.7],
];
const MONO = 'ui-monospace, Menlo, Consolas, monospace';
export function drawCodeWindow(c, p) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#171412';
  rr(c, 0, 0, W, H, 22);
  c.fill();
  c.strokeStyle = 'rgba(255,253,248,0.14)';
  c.lineWidth = 2;
  rr(c, 1, 1, W - 2, H - 2, 22);
  c.stroke();
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(30 + i * 22, 28, 7, 0, Math.PI * 2);
    c.fill();
  });
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillStyle = 'rgba(255,253,248,0.45)';
  c.font = '500 17px ' + MONO;
  c.fillText('index.html', 110, 29);
  c.font = '500 23px ' + MONO;
  CODE_LINES.forEach(([tag, attr, rest, at], i) => {
    const k = Math.min(1, Math.max(0, (p - at) / 0.1));
    if (k <= 0) return;
    const shown = Math.ceil((tag + attr + rest).length * k);
    const y = 84 + i * 37;
    c.fillStyle = 'rgba(255,253,248,0.22)';
    c.fillText(String(i + 1).padStart(2, ' '), 22, y);
    let x = 66;
    let used = 0;
    [[tag, '#E8905A'], [attr, '#E2BC62'], [rest, '#D9D3CA']].forEach(([text, col]) => {
      const part = text.slice(0, Math.max(0, shown - used));
      c.fillStyle = col;
      c.fillText(part, x, y);
      x += c.measureText(part).width;
      used += text.length;
    });
  });
  if (p >= 0.92) {
    c.fillStyle = '#58B985';
    c.fillText('✓ built in 1.9s', 66, 84 + CODE_LINES.length * 37);
  }
  c.textBaseline = 'alphabetic';
}

/* ─────────── Launch chapter: what the live site brings in ─────────── */
function resultCard(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.4)';
  c.shadowBlur = 26;
  c.shadowOffsetY = 12;
  c.fillStyle = '#F4EFE7';
  rr(c, 28, 20, W - 56, H - 60, 26);
  c.fill();
  c.restore();
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
}
export function drawEnquiryCard(c) {
  resultCard(c);
  c.fillStyle = '#1B1714';
  c.font = '700 36px Outfit, sans-serif';
  c.fillText('New enquiry', 58, 74);
  c.font = '400 30px Outfit, sans-serif';
  c.fillText('Sarah wants to book for Friday', 58, 116);
  c.fillStyle = '#7A726A';
  c.font = '400 25px Outfit, sans-serif';
  c.fillText('just now', 58, 152);
}
export function drawReviewCard(c) {
  resultCard(c);
  c.fillStyle = '#FF6A00';
  for (let i = 0; i < 5; i++) star(c, 74 + i * 38, 60, 16);
  c.fillStyle = '#1B1714';
  c.font = '400 30px Outfit, sans-serif';
  c.fillText('“Exactly what we wanted.”', 58, 116);
  c.fillStyle = '#7A726A';
  c.font = '400 25px Outfit, sans-serif';
  c.fillText('New Google review', 58, 152);
}
export function drawVisitorsCard(c, n) {
  resultCard(c);
  c.fillStyle = '#7A726A';
  c.font = '400 25px Outfit, sans-serif';
  c.fillText('Visitors today', 58, 66);
  c.fillStyle = '#1B1714';
  c.font = '700 60px Outfit, sans-serif';
  c.fillText(String(n), 56, 132);
}
/* A visitor's pointer. */
export function drawPointer(c, fill) {
  const W = c.canvas.width;
  c.clearRect(0, 0, W, W);
  c.save();
  c.scale(W / 24, W / 24);
  const p = new Path2D('M4.2 3.4l15 7.3-6.3 1.6 3.6 6.6-2.6 1.4-3.6-6.7-4.4 4.6z');
  c.lineJoin = 'round';
  c.lineWidth = 1.6;
  c.strokeStyle = '#111111';
  c.stroke(p);
  c.fillStyle = fill;
  c.fill(p);
  c.restore();
}

export function drawLiveBadge(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#141414';
  rr(c, 4, 4, W - 8, H - 8, (H - 8) / 2);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = 3;
  c.stroke();
  glow(c, 66, H / 2, 34, '61,220,132', 0.55);
  c.fillStyle = '#3DDC84';
  c.beginPath();
  c.arc(66, H / 2, 13, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#FFFDF8';
  c.font = '700 52px Outfit, sans-serif';
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  c.fillText('Live', 104, H / 2 + 3);
  c.fillStyle = 'rgba(255,253,248,0.6)';
  c.font = '500 34px Outfit, sans-serif';
  c.fillText(DEMO_URL, 222, H / 2 + 3);
}

export function drawRadial(c) {
  const W = c.canvas.width;
  c.clearRect(0, 0, W, W);
  const g = c.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  [[0, 1], [0.175, 0.92], [0.35, 0.7], [0.5, 0.57], [0.675, 0.4], [0.85, 0.2], [1, 0]].forEach(([o, a]) => g.addColorStop(o, 'rgba(255,255,255,' + a + ')'));
  c.fillStyle = g;
  c.fillRect(0, 0, W, W);
}

export function drawScanGlow(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  let g = c.createLinearGradient(0, 0, 0, H);
  [[0, 0], [0.125, 0.44], [0.25, 0.75], [0.375, 0.94], [0.5, 1], [0.625, 0.94], [0.75, 0.75], [0.875, 0.44], [1, 0]].forEach(([o, a]) => g.addColorStop(o, 'rgba(255,255,255,' + a + ')'));
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'destination-in'; /* fade out at both ends too */
  g = c.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.06, 'rgba(255,255,255,1)');
  g.addColorStop(0.94, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
}

/* ─────────── The folder: orange card stock ─────────── */
function cardWordmark(c, cx, cy, size, pixel, fold = pixel) {
  c.font = '700 ' + size + 'px Fredoka, Outfit, sans-serif';
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  const a = c.measureText('PIXEL').width;
  const b = c.measureText('FOLD').width;
  const s = size * 0.2;
  const x = cx - (a + b + s * 2.9) / 2;
  c.fillStyle = pixel;
  c.fillText('PIXEL', x, cy);
  c.fillStyle = fold;
  c.fillText('FOLD', x + a, cy);
  const sx = x + a + b + s * 0.7;
  c.fillStyle = pixel;
  rr(c, sx, cy - s * 1.7, s, s, s * 0.2);
  c.fill();
  c.fillStyle = fold;
  rr(c, sx + s * 1.2, cy - s * 0.5, s, s, s * 0.2);
  c.fill();
}

/* Paper grain for bump maps: soft noise plus faint fibres (tiles). */
export function drawGrain(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  const r = rng(3);
  const img = c.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = 128 + (r() - 0.5) * 34;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  c.globalAlpha = 0.18;
  c.strokeStyle = '#000';
  c.lineWidth = 0.6;
  for (let i = 0; i < 260; i++) {
    const x = r() * W;
    const y = r() * H;
    const l = 6 + r() * 18;
    const an = r() * Math.PI;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l);
    c.stroke();
  }
  c.globalAlpha = 1;
}

/* Front flap: warm orange card, wordmark letterpressed (pressed in and inked). */
export function drawCardFace(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#F7782A');
  g.addColorStop(1, '#E8600F');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  /* a faint shadow on the upper rim of each letter sells the press */
  c.save();
  c.translate(0, -3);
  c.globalAlpha = 0.35;
  cardWordmark(c, W / 2, H * 0.72, 128, '#B8460A');
  c.restore();
  cardWordmark(c, W / 2, H * 0.72, 128, '#FFF4E6', '#1E1A17');
}

/* Bump for the front: grain, with the wordmark pressed into it. */
export function drawCardBump(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  const tile = document.createElement('canvas');
  tile.width = tile.height = 512;
  drawGrain(tile.getContext('2d'));
  c.drawImage(tile, 0, 0, W, H);
  c.filter = 'blur(2.5px)';
  cardWordmark(c, W / 2, H * 0.72, 128, '#5a5a5a');
  c.filter = 'none';
}

/* Back panel: a touch darker, light falling off towards the fold. */
export function drawCardBack(c) {
  const g = c.createLinearGradient(0, 0, 0, c.canvas.height);
  g.addColorStop(0, '#EC6A1E');
  g.addColorStop(1, '#D65810');
  c.fillStyle = g;
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);
}

/* The cat's face, wrapped round its head: the white blaze from the forehead
   down over the muzzle. The front of a three.js sphere is u = 0.25. */
export function drawCatFace(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.fillStyle = '#1F1F23';
  c.fillRect(0, 0, W, H);
  c.save();
  c.scale(W / 1024, H / 512);
  c.fillStyle = '#FFFDF8';
  const x = 256;
  c.beginPath();
  c.moveTo(x, 130);
  c.bezierCurveTo(x - 16, 195, x - 54, 245, x - 68, 300);
  c.bezierCurveTo(x - 88, 385, x - 62, 475, x, 485);
  c.bezierCurveTo(x + 62, 475, x + 88, 385, x + 68, 300);
  c.bezierCurveTo(x + 54, 245, x + 16, 195, x, 130);
  c.fill();
  c.restore();
}

/* Soft contact shadow under the folder. */
export function drawShadowBlob(c) {
  const W = c.canvas.width;
  c.clearRect(0, 0, W, W);
  const g = c.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  [[0, 0.84], [0.25, 0.7], [0.5, 0.51], [0.75, 0.28], [1, 0]].forEach(([o, a]) => g.addColorStop(o, 'rgba(0,0,0,' + a + ')'));
  c.fillStyle = g;
  c.fillRect(0, 0, W, W);
}
