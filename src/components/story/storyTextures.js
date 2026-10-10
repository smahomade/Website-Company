/* Canvas painters for the 3D story's textures.
   Every sheet is SHEET_W × SHEET_H (the 3.4 × 2.3 world-unit sheet ratio).
   The demo site is split into four layers that share one layout, so the
   pencil sketch and the finished design line up exactly during the wipe. */

export const SHEET_W = 1024;
export const SHEET_H = 693;
export const DEMO_URL = 'yourbusiness.co.uk';

const CHROME_H = 62;
const CARD_X = [64, 378, 692];
const CARD_TITLES = ['Friendly service', 'Local & trusted', 'Book online'];

export function rr(c, x, y, w, h, r) {
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
function rng(seed) {
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
  c.font = '700 32px Caveat, "Segoe Print", cursive';
  c.textAlign = 'left';
  c.fillText('big, friendly headline!', 470, 214);
  P.arrow(462, 206, 418, 222);
  c.fillText('warm photo here', 690, 186);
  c.fillText('orange CTA', 300, 456);
  P.arrow(296, 446, 220, 424);
  c.fillText('reviews = trust', 712, 306);
  c.fillText('3 reasons to pick them', 340, 664);
  c.restore();
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
export function drawWordmark(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  c.font = '700 150px Fredoka, Outfit, sans-serif';
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  const a = c.measureText('PIXEL').width;
  const b = c.measureText('FOLD').width;
  const sq = 30;
  const total = a + b + 26 + sq * 2 + 6;
  const x = (W - total) / 2;
  const y = H / 2 + 8;
  c.fillStyle = '#FFFDF8';
  c.fillText('PIXEL', x, y);
  c.fillStyle = '#111111';
  c.fillText('FOLD', x + a, y);
  const sx = x + a + b + 26;
  c.fillStyle = '#FFFDF8';
  rr(c, sx, y - 52, sq, sq, 6);
  c.fill();
  c.fillStyle = '#111111';
  rr(c, sx + sq + 6, y - 52 + sq + 6, sq, sq, 6);
  c.fill();
}

const LAYER_NAMES = ['Structure', 'Layout', 'Content', 'Interaction'];

export function drawLayerLabel(c, i) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  c.fillStyle = 'rgba(17,17,17,0.82)';
  rr(c, 2, 2, W - 4, H - 4, (H - 4) / 2);
  c.fill();
  c.strokeStyle = 'rgba(255,122,26,0.7)';
  c.lineWidth = 3;
  c.stroke();
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  c.font = '700 40px Outfit, sans-serif';
  c.fillStyle = '#FF7A1A';
  c.fillText('0' + (i + 1), 34, H / 2 + 2);
  c.fillStyle = '#FFFDF8';
  c.font = '600 40px Outfit, sans-serif';
  c.fillText(LAYER_NAMES[i], 104, H / 2 + 2);
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
  const g = c.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, W);
}

export function drawScanGlow(c) {
  const W = c.canvas.width;
  const H = c.canvas.height;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}
