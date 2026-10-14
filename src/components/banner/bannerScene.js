import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* The small 3D object in an inner page's banner, one per page, in the home
   story's card-stock look: orange and cream under a warm light, with a few
   drifting pixel cubes. Motion is slow and continuous (no flashes); `still`
   draws one frame and never animates. Throws if WebGL is unavailable, and the
   banner simply goes without. */

const ORANGE = '#FF6A00';
const DEEP = '#D95400';
const CREAM = '#FFF8EC';
const INK = '#2A2420';
const STILL_T = 2.2; /* the moment a still banner shows */

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function createBannerScene(host, { kind, labels = [], still = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'pb-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 1.5, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const owned = [];
  const keep = (x) => {
    owned.push(x);
    return x;
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 60);
  scene.add(new THREE.HemisphereLight(0xfff3e4, 0x3a2414, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-3, 5, 6);
  scene.add(sun);

  const mat = (color) => keep(new THREE.MeshLambertMaterial({ color }));
  const slab = (w, h, d, color, r = 0.035) => new THREE.Mesh(keep(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, d / 2))), mat(color));
  const textures = [];
  /* a canvas texture; `paint` can be called again to redraw it */
  const canvasTex = (w, h, draw) => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const c = cv.getContext('2d');
    const tex = keep(new THREE.CanvasTexture(cv));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const entry = {
      tex,
      paint(...args) {
        draw(c, ...args);
        tex.needsUpdate = true;
        if (still) render();
      },
    };
    textures.push(entry);
    return entry;
  };
  const face = (w, h, tex) => new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), keep(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })));

  const art = new THREE.Group();
  scene.add(art);
  let tick = () => {};
  let fit = { w: 4, h: 2.6, y: 1 }; /* the box the object occupies, for framing */

  if (kind === 'steps') {
    /* How it works: a card per step, climbing, each lifting in turn */
    const n = Math.max(3, labels.length || 3);
    const cards = Array.from({ length: n }, (_, i) => {
      const t = canvasTex(320, 200, (c) => {
        c.fillStyle = CREAM;
        c.fillRect(0, 0, 320, 200);
        c.fillStyle = ORANGE;
        c.beginPath();
        c.arc(70, 100, 42, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fff';
        c.font = '800 46px Outfit, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(String(i + 1), 70, 103);
        c.textAlign = 'left';
        c.fillStyle = INK;
        c.font = '800 34px Outfit, sans-serif';
        if (labels[i]) c.fillText(labels[i], 132, 84);
        else {
          c.fillStyle = '#D9D0C2';
          rr(c, 132, 70, 140, 18, 9);
          c.fill();
        }
        c.fillStyle = '#D9D0C2';
        rr(c, 132, 116, 120, 14, 7);
        c.fill();
      });
      t.paint();
      const g = new THREE.Group();
      const f = face(1.24, 0.775, t.tex);
      f.position.z = 0.041;
      g.add(slab(1.28, 0.8, 0.08, CREAM), f);
      g.position.set((i - (n - 1) / 2) * 1.2, 0.35 + i * 0.55, -i * 0.15);
      g.rotation.y = -0.22;
      art.add(g);
      return g;
    });
    fit = { w: n * 1.2 + 0.3, h: n * 0.55 + 0.9, y: 0.35 + ((n - 1) * 0.55) / 2 };
    tick = (t) =>
      cards.forEach((g, i) => {
        g.position.y = 0.35 + i * 0.55 + Math.sin(t * 1.1 - i * 0.8) * 0.06;
      });
  } else if (kind === 'folders') {
    /* Services: three folders, small to large, each lifting in turn */
    const folder = (w, h) => {
      const g = new THREE.Group();
      const back = slab(w, h, 0.06, DEEP);
      back.position.set(0, h / 2, -0.07);
      const tab = slab(w * 0.38, h * 0.18, 0.06, DEEP);
      tab.position.set(-w * 0.29, h * 1.04, -0.07);
      const sheet = slab(w * 0.86, h * 0.9, 0.02, CREAM, 0.01);
      sheet.position.set(0, h * 0.6, -0.01);
      const front = slab(w, h * 0.84, 0.06, ORANGE);
      front.position.set(0, h * 0.42, 0.05);
      front.rotation.x = -0.07;
      g.add(back, tab, sheet, front);
      return g;
    };
    const fs = [
      [0.9, 0.66, -1.5],
      [1.16, 0.85, -0.2],
      [1.46, 1.08, 1.36],
    ].map(([w, h, x], i) => {
      const f = folder(w, h);
      f.position.set(x, 0, i * 0.14);
      f.rotation.y = -0.24;
      art.add(f);
      return f;
    });
    fit = { w: 4.4, h: 1.5, y: 0.6 };
    tick = (t) =>
      fs.forEach((f, i) => {
        f.position.y = Math.max(0, Math.sin(t * 0.9 - i * 1.15)) * 0.14;
      });
  } else if (kind === 'sites') {
    /* Portfolio: three of the real sites in browser windows, fanned */
    const SITES = [
      ['/images/story/shot-raza-academy.webp', 'razaacademy.co.uk'],
      ['/images/story/shot-top-one-salon.webp', 'topone.co.uk'],
      ['/images/story/shot-change-work-therapies.webp', 'changeworktherapies.com'],
    ];
    const sheets = SITES.map(([src, url], i) => {
      const t = canvasTex(480, 324, (c, img) => {
        c.fillStyle = '#fff';
        c.fillRect(0, 0, 480, 324);
        if (img) {
          const h = (img.naturalHeight / img.naturalWidth) * 480;
          c.drawImage(img, 0, 34, 480, h);
        } else {
          c.fillStyle = '#EDE7DE';
          c.fillRect(0, 34, 480, 290);
        }
        c.fillStyle = '#EFECE8';
        c.fillRect(0, 0, 480, 34);
        ['#FF5F57', '#FEBC2E', '#28C840'].forEach((d, k) => {
          c.fillStyle = d;
          c.beginPath();
          c.arc(18 + k * 16, 17, 5, 0, Math.PI * 2);
          c.fill();
        });
        c.fillStyle = '#fff';
        rr(c, 82, 8, 316, 18, 9);
        c.fill();
        c.fillStyle = '#8A847D';
        c.font = '500 12px ui-monospace, Menlo, Consolas, monospace';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(url, 240, 18);
      });
      t.paint(null);
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => t.paint(img);
      img.src = src;
      const g = new THREE.Group();
      const f = face(1.66, 1.12, t.tex);
      f.position.z = 0.026;
      g.add(slab(1.7, 1.16, 0.05, '#FFFFFF', 0.02), f);
      g.position.set((i - 1) * 1.12, 0.62 + (i === 1 ? 0.16 : 0), i === 1 ? 0.24 : 0);
      g.rotation.set(0, (1 - i) * 0.2, (1 - i) * 0.15);
      art.add(g);
      return g;
    });
    fit = { w: 4.0, h: 1.7, y: 0.7 };
    tick = (t) =>
      sheets.forEach((g, i) => {
        g.rotation.z = (1 - i) * 0.15 + Math.sin(t * 0.8 + i * 1.3) * 0.025;
        g.position.y = 0.62 + (i === 1 ? 0.16 : 0) + Math.sin(t * 0.9 + i) * 0.04;
      });
  } else if (kind === 'plane') {
    /* Contact: a folded paper plane on a slow loop, with a dotted trail */
    const plane = new THREE.Group();
    const body = new THREE.Group();
    const tri = (pts, color) => {
      const geo = keep(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      return new THREE.Mesh(geo, keep(new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false })));
    };
    body.add(
      tri([1, 0, 0, -0.8, 0.1, 0.7, -0.55, 0, 0], CREAM),
      tri([1, 0, 0, -0.55, 0, 0, -0.8, 0.1, -0.7], '#EAD9BF'),
      tri([1, 0, 0, -0.55, 0, 0, -0.66, -0.36, 0], ORANGE)
    );
    plane.add(body);
    plane.scale.setScalar(0.9);
    art.add(plane);
    const dotGeo = keep(new THREE.SphereGeometry(0.04, 8, 6));
    const dotMat = keep(new THREE.MeshBasicMaterial({ color: '#FFB27A', toneMapped: false }));
    const dots = Array.from({ length: 9 }, () => {
      const d = new THREE.Mesh(dotGeo, dotMat);
      art.add(d);
      return d;
    });
    const at = (t, o) => o.set(Math.sin(t * 0.5) * 1.2, 0.9 + Math.sin(t * 1.0) * 0.3, 0);
    const ahead = new THREE.Vector3();
    const back = new THREE.Vector3();
    fit = { w: 3.8, h: 1.9, y: 0.9 };
    tick = (t) => {
      at(t, plane.position);
      at(t + 0.05, ahead);
      const dx = ahead.x - plane.position.x;
      const dy = ahead.y - plane.position.y;
      plane.rotation.set(0, dx < 0 ? Math.PI : 0, Math.atan2(dy, Math.abs(dx)));
      body.rotation.x = 1.05 + Math.sin(t) * 0.1; /* a gentle roll, top side to the visitor */
      dots.forEach((d, i) => {
        at(t - 0.4 - i * 0.2, back);
        d.position.copy(back);
        d.scale.setScalar(1 - i * 0.09);
      });
    };
  } else if (kind === 'brief') {
    /* Free quote: a brief on a clipboard, its boxes ticked one by one */
    let shown = -1;
    const sheet = canvasTex(300, 400, (c, n) => {
      c.fillStyle = CREAM;
      c.fillRect(0, 0, 300, 400);
      c.fillStyle = INK;
      c.font = '800 28px Outfit, sans-serif';
      c.textBaseline = 'middle';
      c.fillText('Your brief', 34, 62);
      for (let i = 0; i < 3; i++) {
        const y = 140 + i * 84;
        c.strokeStyle = '#B9AE9E';
        c.lineWidth = 4;
        rr(c, 34, y - 20, 40, 40, 9);
        c.stroke();
        c.fillStyle = '#DDD4C6';
        rr(c, 94, y - 16, 160, 13, 6);
        c.fill();
        rr(c, 94, y + 6, 104, 13, 6);
        c.fill();
        if (i < n) {
          c.fillStyle = ORANGE;
          rr(c, 34, y - 20, 40, 40, 9);
          c.fill();
          c.strokeStyle = '#fff';
          c.lineWidth = 6;
          c.lineCap = 'round';
          c.lineJoin = 'round';
          c.beginPath();
          c.moveTo(44, y + 1);
          c.lineTo(52, y + 9);
          c.lineTo(65, y - 9);
          c.stroke();
        }
      }
    });
    const pad = new THREE.Group();
    const f = face(1.18, 1.57, sheet.tex);
    f.position.set(0, -0.04, 0.046);
    const clip = slab(0.5, 0.2, 0.1, ORANGE);
    clip.position.set(0, 0.86, 0.06);
    pad.add(slab(1.36, 1.8, 0.07, '#4A3524'), f, clip);
    pad.position.set(0, 1.0, 0);
    pad.rotation.set(-0.08, -0.26, 0.04);
    art.add(pad);
    const pencil = new THREE.Group();
    const lead = new THREE.Mesh(keep(new THREE.ConeGeometry(0.055, 0.16, 12)), mat('#F3DDBB'));
    lead.rotation.x = Math.PI;
    lead.position.y = 0.08;
    const shaft = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.055, 0.055, 0.8, 12)), mat(ORANGE));
    shaft.position.y = 0.56;
    pencil.add(lead, shaft);
    pencil.rotation.z = -0.62;
    pad.add(pencil);
    fit = { w: 2.6, h: 2.2, y: 1.0 };
    tick = (t) => {
      const u = (t % 9) / 9;
      const n = u < 0.2 ? 0 : u < 0.42 ? 1 : u < 0.64 ? 2 : 3;
      if (n !== shown) {
        shown = n;
        sheet.paint(n);
      }
      const row = Math.min(2, Math.floor(Math.max(0, u - 0.06) / 0.22));
      pencil.position.set(-0.36 + Math.sin(t * 6) * 0.012 * (still ? 0 : 1), 0.2 - row * 0.33, 0.1);
      pencil.visible = u < 0.9;
      pad.position.y = 1.0 + Math.sin(t * 0.9) * 0.04;
    };
  }

  /* drifting pixel cubes, like the home story's */
  const BITS = 14;
  const bits = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.09, 0.09, 0.09)), mat('#ffffff'), BITS);
  const bitData = Array.from({ length: BITS }, (_, i) => {
    bits.setColorAt(i, new THREE.Color(i % 4 ? ORANGE : '#FFD9B5'));
    return { x: Math.sin(i * 12.9) * 3.2, y: -0.2 + ((i * 0.618) % 1) * 2.8, z: -1.4 + ((i * 0.37) % 1) * 1.8, p: i * 1.7, s: 0.25 + ((i * 0.23) % 1) * 0.25 };
  });
  scene.add(bits);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);

  /* pointer parallax: the object turns a touch towards the visitor's mouse */
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (ev) => {
    ptr.x = ev.clientX / window.innerWidth - 0.5;
    ptr.y = ev.clientY / window.innerHeight - 0.5;
  };
  if (!still && window.matchMedia('(hover: hover) and (pointer: fine)').matches) window.addEventListener('pointermove', onMove, { passive: true });

  function frame(t) {
    tick(t);
    art.rotation.set(ptr.sy * 0.06, ptr.sx * 0.14, 0);
    bitData.forEach((d, i) => {
      v.set(d.x + Math.sin(t * d.s + d.p) * 0.25, fit.y - 1 + d.y + Math.cos(t * d.s * 0.8 + d.p) * 0.3, d.z);
      q.setFromEuler(e.set(t * d.s + d.p, t * d.s * 0.7, 0));
      bits.setMatrixAt(i, m4.compose(v, q, one));
    });
    bits.instanceMatrix.needsUpdate = true;
  }

  /* frame the object: it fills most of the canvas, whatever its shape */
  function resize() {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(15));
    const dist = Math.max((fit.h * 0.62) / tan, (fit.w * 0.6) / (tan * camera.aspect));
    camera.position.set(0, fit.y + 0.25, dist + 0.8);
    camera.lookAt(0, fit.y, 0);
    camera.updateProjectionMatrix();
  }
  function render() {
    renderer.render(scene, camera);
  }

  host.appendChild(canvas);
  resize();
  frame(STILL_T);
  render();
  const ro = new ResizeObserver(() => {
    resize();
    render();
  });
  ro.observe(host);

  /* runs only while the banner is on screen and the tab is visible */
  let raf = 0;
  let onScreen = true;
  let time = STILL_T;
  let last = 0;
  const loop = (now) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    time += dt;
    const kp = 1 - Math.exp(-dt * 3);
    ptr.sx += (ptr.x - ptr.sx) * kp;
    ptr.sy += (ptr.y - ptr.sy) * kp;
    frame(time);
    render();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (still || raf || !onScreen || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    start();
  });
  io.observe(host);
  const onVis = () => start();
  document.addEventListener('visibilitychange', onVis);
  /* text on the textures waits for the web fonts */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (kind === 'steps') textures.forEach((t) => t.paint());
      render();
    });
  }
  start();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      owned.forEach((x) => x.dispose && x.dispose());
      bits.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
