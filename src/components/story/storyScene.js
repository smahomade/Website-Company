import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as TX from './storyTextures.js';

/* The home page's 3D story, in plain three.js (loaded lazily by ScrollStory).
   Everything on screen is a pure function of the story position `t`
   (0 = intro … 5 = work) plus a small idle clock, so scrolling backwards
   replays the story in reverse. t is fed in by ScrollStory and eased here. */

const SW = 3.4; /* sheet size (world units) */
const SH = 2.3;
const FW = 4.2; /* folder */
const FH = 2.9;
const FHF = 2.5;
const FR = 0.2;
const FOLDER_SCALE = 0.85;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eout = (k) => 1 - Math.pow(1 - k, 3);
const ein = (k) => k * k * k;
const eback = (k) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

/* Keyframe track: [[t, value], ...] eased in-out between keys. */
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return v0 + (v1 - v0) * eio((t - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

function rrShape(x, y, w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* Folder back panel with the tab on its top-left edge. */
function backShape() {
  const s = new THREE.Shape();
  const x = -FW / 2;
  const tabR = x + 1.5;
  const tabH = 0.34;
  s.moveTo(x + FR, 0);
  s.lineTo(x + FW - FR, 0);
  s.quadraticCurveTo(x + FW, 0, x + FW, FR);
  s.lineTo(x + FW, FH - FR);
  s.quadraticCurveTo(x + FW, FH, x + FW - FR, FH);
  s.lineTo(tabR + 0.28, FH);
  s.quadraticCurveTo(tabR + 0.12, FH, tabR + 0.04, FH + tabH * 0.5);
  s.quadraticCurveTo(tabR - 0.04, FH + tabH, tabR - 0.2, FH + tabH);
  s.lineTo(x + FR * 0.8, FH + tabH);
  s.quadraticCurveTo(x, FH + tabH, x, FH + tabH - FR * 0.8);
  s.lineTo(x, FR);
  s.quadraticCurveTo(x, 0, x + FR, 0);
  return s;
}

/* Rounded sheet whose UVs span 0..1 across the shape. */
function sheetGeometry(w, h, r) {
  const g = new THREE.ShapeGeometry(rrShape(-w / 2, -h / 2, w, h, r), 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return g;
}

/* Unlit material that only draws above (or below) a horizontal UV line —
   drives the sketch → design wipe. Screens are unlit so they read crisp. */
function cutMaterial(map, keepAbove, cut, extra = {}) {
  const m = new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, ...extra });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uCut = cut;
    shader.fragmentShader =
      'uniform float uCut;\n' +
      shader.fragmentShader.replace(
        '#include <map_fragment>',
        '#include <map_fragment>\n' + (keepAbove ? 'if (vMapUv.y < uCut) discard;' : 'if (vMapUv.y >= uCut) discard;')
      );
  };
  m.customProgramCacheKey = () => (keepAbove ? 'pf-cut-above' : 'pf-cut-below');
  return m;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Client sheet poses, in folder space. */
const CLIENT_START = [
  { x: -0.1, y: 1.2, z: 0.12, rz: 0.025 },
  { x: 0, y: 1.2, z: 0.24, rz: -0.01 },
  { x: 0.12, y: 1.2, z: 0.18, rz: -0.03 },
];
const CLIENT_FAN = [
  { x: -2.05, y: 3.05, z: 0.95, rz: 0.13, ry: 0.24 },
  { x: 0, y: 3.4, z: 1.35, rz: 0, ry: 0 },
  { x: 2.05, y: 3.05, z: 0.95, rz: -0.13, ry: -0.24 },
];
const CLIENT_RISE = 1.55;
const PAGE_SLOT = new THREE.Vector3(0, 1.2, 0.3); /* in front of the client sheets */
const PAGE_RISEN = new THREE.Vector3(0, 3.3, 0.75);

/* Choreography. S is the sideways offset that leaves room for the copy:
   positive puts the focus object on the right, text on the left. */
function buildTracks(S, portrait = false) {
  const wy = portrait ? 1.35 : 0; /* portrait: lift the finale clear of the copy */
  return {
    /* the folder sinks out of frame while the page has the stage, then returns */
    folderX: [[0, S], [0.55, -S], [1.3, -S], [2.0, -S * 0.7], [4.0, S * 0.5], [4.4, S * 0.85], [5, S * 0.85]],
    folderY: [[0, 0.2], [0.55, -1.2], [1.3, -1.2], [2.0, -7.5], [4.0, -7.5], [4.4, -0.45 + wy], [5, -0.45 + wy]],
    folderZ: [[0, 0], [0.55, 0.3], [1.3, 0.3], [2.0, -2], [4.0, -2], [4.4, 0.2], [5, 0.2]],
    folderRY: [[0, -0.55], [0.55, 0.42], [1.3, 0.42], [2.0, 0.9], [4.0, -0.9], [4.4, -0.08], [5, -0.04]],
    folderS: [[0, 1.0], [0.55, 0.92], [4.4, 0.92], [5, portrait ? 0.8 : 0.95]],
    flap: [[0, 0], [0.5, 0], [0.85, 0.62], [1.25, 0.62], [1.7, 0.1], [4.2, 0.1], [4.5, 0.45], [5, 0.45]],
    pageX: [[2, S * 0.92], [3, -S], [4, S * 0.9]],
    pageY: [[2, 1.45], [3, 1.3], [4, 1.5]],
    pageZ: [[2, 1.5], [2.5, 2.4], [3, 0.9], [3.5, 2.2], [4, 1.5]],
    pageRX: [[2, 0], [2.4, 0], [3, -0.4], [3.5, -0.4], [4, 0]],
    pageRY: [[2, -0.3], [3, 0.68], [4, -0.2]],
    pageS: [[2, 1.12], [3, 1.0], [4, 1.08]],
    reveal: [[1.4, 0], [1.92, 1]],
    explode: [[2.35, 0], [2.95, 1], [3.35, 1], [3.75, 0]],
    badge: [[3.72, 0], [3.95, 1], [4.12, 1], [4.3, 0]],
    burst: [[3.68, 0], [3.95, 1], [4.6, 0]],
    glowX: [[0, S], [0.55, -S], [1.6, -S], [2, S * 0.92], [3, -S], [4, S * 0.9], [4.4, S * 0.85], [5, S * 0.85]],
    glowY: [[0, 1.2], [1, 1.5], [2, 1.5], [3, 1.3], [4, 1.6], [5, 1.4 + wy]],
    glowA: [[0, 0.34], [1, 0.26], [2, 0.3], [3, 0.24], [3.95, 0.52], [4.4, 0.3], [5, 0.34]],
    camZ: [[0, 1], [1, 0.97], [2, 0.92], [3, 0.95], [4, 0.94], [5, 1.04]],
  };
}

export function createStoryScene(container, { clients = [], still = false, stillT = 5 } = {}) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'story-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  /* Throws when WebGL is unavailable; ScrollStory falls back to static copy. */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  container.prepend(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = !coarse;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };
  const canvasTextures = [];
  function canvasTex(w, h, draw) {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    draw(ctx);
    const tex = keep(new THREE.CanvasTexture(cv));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;
    const entry = {
      tex,
      ctx,
      draw,
      redraw() {
        entry.draw(ctx);
        tex.needsUpdate = true;
      },
    };
    canvasTextures.push(entry);
    return entry;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x111111, 16, 34);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  /* Soft studio reflections without loading an HDR file. */
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 14, 20), new THREE.MeshBasicMaterial({ color: 0x5a5550, side: THREE.BackSide })));
    const panel = (w, h, hex, k, pos) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide })
      );
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(10, 4, 0xffffff, 6, [0, 6.5, 2]);
    panel(4, 8, 0xffb070, 3.5, [-8, 2, -3]);
    panel(4, 8, 0xffffff, 2.2, [8, 3, 2]);
    const rt = keep(pmrem.fromScene(env, 0.04));
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.6;
    env.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    pmrem.dispose();
  }

  scene.add(new THREE.HemisphereLight(0xfff6ec, 0x1a1410, 0.55));
  const key = new THREE.DirectionalLight(0xfff3e6, 2.4);
  key.position.set(4, 9, 8);
  if (renderer.shadowMap.enabled) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -5, near: 1, far: 40 });
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.03;
    key.shadow.radius = 4;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8a3d, 2.2);
  rim.position.set(-6, 4, -7);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xfff1e4, 0.7);
  fill.position.set(0, 2, 12);
  scene.add(fill);
  const under = new THREE.DirectionalLight(0xffd2b0, 1.3); /* lifts the open flap's underside */
  under.position.set(0, -4, 8);
  scene.add(under);

  /* `world` holds the story objects and leans with the pointer;
     the pixel field sits outside it with its own, stronger parallax. */
  const world = new THREE.Group();
  scene.add(world);
  const pixelGroup = new THREE.Group();
  scene.add(pixelGroup);

  const radial = canvasTex(256, 256, TX.drawRadial);
  const glow = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(12, 12)),
    keep(new THREE.MeshBasicMaterial({ map: radial.tex, color: 0xff6a00, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false, fog: false }))
  );
  glow.renderOrder = -1;
  world.add(glow);

  /* ─────────── Folder ─────────── */
  const ext = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 5, curveSegments: 18 };
  const matFront = keep(new THREE.MeshPhysicalMaterial({ color: '#FF6A00', roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.22 }));
  const matBack = keep(new THREE.MeshPhysicalMaterial({ color: '#EE5E00', roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.35 }));
  const matFold = keep(matBack.clone());
  matFold.side = THREE.DoubleSide;

  const folder = new THREE.Group();
  folder.matrixAutoUpdate = false;
  world.add(folder);
  const back = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(backShape(), ext)), matBack);
  back.castShadow = true;
  back.receiveShadow = true;
  folder.add(back);
  const fold = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.24, 0.24, FW + 0.07, 32, 1, false, Math.PI, Math.PI)), matFold);
  fold.rotation.z = Math.PI / 2;
  fold.position.set(0, 0, 0.205);
  fold.castShadow = true;
  folder.add(fold);
  const flap = new THREE.Group();
  flap.position.set(0, 0, 0.36);
  folder.add(flap);
  const front = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(rrShape(-FW / 2, 0, FW, FHF, FR), ext)), matFront);
  front.castShadow = true;
  front.receiveShadow = true;
  flap.add(front);
  const wordmark = canvasTex(1024, 256, TX.drawWordmark);
  const decal = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(2.4, 0.6)),
    keep(new THREE.MeshStandardMaterial({ map: wordmark.tex, transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }))
  );
  decal.position.set(0, 0.72, 0.088);
  flap.add(decal);

  const blobCanvas = canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });
  const blob = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(6.4, 2.2)),
    keep(new THREE.MeshBasicMaterial({ map: blobCanvas.tex, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false }))
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(0, -0.27, 0.2);
  folder.add(blob);

  /* ─────────── Client sheets (live in the folder) ─────────── */
  const sheetGeo = keep(sheetGeometry(SW, SH, 0.11));
  const paperBack = keep(new THREE.MeshStandardMaterial({ color: '#ECE8E2', roughness: 0.8 }));
  let disposed = false;
  const clientSheets = clients.slice(0, 3).map((client) => {
    const ct = canvasTex(TX.SHEET_W, TX.SHEET_H, (c) => TX.drawClientStandIn(c, client));
    const g = new THREE.Group();
    const face = new THREE.Mesh(sheetGeo, keep(new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false })));
    face.position.z = 0.004;
    face.castShadow = true;
    const rear = new THREE.Mesh(sheetGeo, paperBack);
    rear.rotation.y = Math.PI;
    rear.position.z = -0.004;
    g.add(face, rear);
    folder.add(g);
    /* Swap in the real screenshot when the bucket allows cross-origin reads. */
    if (client.img) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => {
        if (disposed) return;
        ct.draw = (c) => TX.drawClientShot(c, img, client.host);
        ct.redraw();
      };
      img.src = client.img + (client.img.includes('?') ? '&' : '?') + 'pf3d=1';
    }
    return { g };
  });

  /* ─────────── The demo page: sketch + four design layers ─────────── */
  const page = new THREE.Group();
  page.matrixAutoUpdate = true;
  world.add(page);
  const cut = { value: 1 };
  const pageMats = [];
  const outlineGeo = keep(new THREE.BufferGeometry().setFromPoints(rrShape(-SW / 2, -SH / 2, SW, SH, 0.11).getPoints(6)));
  const labelGeo = keep(new THREE.PlaneGeometry(1.1, 0.24));
  const layers = [TX.drawDemoBase, TX.drawDemoLayout, TX.drawDemoContent, TX.drawDemoUI].map((draw, i) => {
    const ct = canvasTex(TX.SHEET_W, TX.SHEET_H, draw);
    const holder = new THREE.Group();
    const mat = keep(cutMaterial(ct.tex, true, cut, { depthWrite: i === 0 }));
    const mesh = new THREE.Mesh(sheetGeo, mat);
    mesh.renderOrder = 2 + i;
    holder.add(mesh);
    if (i === 0) {
      mesh.castShadow = true;
      const rear = new THREE.Mesh(sheetGeo, paperBack);
      rear.rotation.y = Math.PI;
      rear.position.z = -0.004;
      holder.add(rear);
    }
    const line = new THREE.LineLoop(
      outlineGeo,
      keep(new THREE.LineBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }))
    );
    holder.add(line);
    const lt = canvasTex(512, 112, (c) => TX.drawLayerLabel(c, i));
    const label = new THREE.Mesh(
      labelGeo,
      keep(new THREE.MeshBasicMaterial({ map: lt.tex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }))
    );
    label.position.set(-SW / 2 + 0.55, SH / 2 + 0.17, 0.002);
    label.renderOrder = 10;
    holder.add(label);
    page.add(holder);
    pageMats.push(mat);
    return { holder, mesh, line, label };
  });

  const sketchTex = canvasTex(TX.SHEET_W, TX.SHEET_H, TX.drawDemoSketch);
  const sketchMat = keep(cutMaterial(sketchTex.tex, false, cut));
  const sketch = new THREE.Mesh(sheetGeo, sketchMat);
  sketch.position.z = 0.001;
  sketch.renderOrder = 6;
  sketch.castShadow = true;
  page.add(sketch);
  pageMats.push(sketchMat);

  const scan = new THREE.Group();
  const scanLineMat = keep(new THREE.MeshBasicMaterial({ color: 0xffa060, transparent: true, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  const scanLine = new THREE.Mesh(keep(new THREE.PlaneGeometry(SW * 1.04, 0.022)), scanLineMat);
  const scanGlowTex = canvasTex(32, 128, TX.drawScanGlow);
  const scanGlowMat = keep(
    new THREE.MeshBasicMaterial({ map: scanGlowTex.tex, color: 0xff6a00, transparent: true, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  const scanGlow = new THREE.Mesh(keep(new THREE.PlaneGeometry(SW * 1.08, 0.5)), scanGlowMat);
  scan.add(scanGlow, scanLine);
  scan.position.z = 0.03;
  scan.renderOrder = 12;
  scanLine.renderOrder = 12;
  scanGlow.renderOrder = 11;
  page.add(scan);

  const badgeTex = canvasTex(640, 144, TX.drawLiveBadge);
  const badgeMat = keep(new THREE.MeshBasicMaterial({ map: badgeTex.tex, transparent: true, toneMapped: false, depthWrite: false }));
  const badge = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.5, 0.34)), badgeMat);
  badge.position.set(SW / 2 - 0.62, SH / 2 + 0.32, 0.06);
  badge.renderOrder = 13;
  page.add(badge);

  /* ─────────── Pixel field ─────────── */
  const PIX = coarse ? 64 : 120;
  const pixels = new THREE.InstancedMesh(
    keep(new RoundedBoxGeometry(1, 1, 1, 2, 0.16)),
    keep(new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.05 })),
    PIX
  );
  pixels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  pixels.frustumCulled = false;
  const palette = [[0xff6a00, 0.5], [0xd94f00, 0.16], [0xfff4e6, 0.14], [0x2b2b2b, 0.2]];
  const rand = mulberry(11);
  const pd = [];
  const tmpColor = new THREE.Color();
  for (let i = 0; i < PIX; i++) {
    const x = (rand() * 2 - 1) * 10;
    const y = -6 + rand() * 13.5;
    let z = -11 + rand() * 13.5;
    if (z > -1.5 && Math.abs(x) < 7.5) z = -1.5 - rand() * 8;
    const pick = rand();
    let acc = 0;
    let hex = palette[0][0];
    for (const [h, w] of palette) {
      acc += w;
      if (pick <= acc) {
        hex = h;
        break;
      }
    }
    pixels.setColorAt(i, tmpColor.setHex(hex));
    pd.push({
      base: new THREE.Vector3(x, y, z),
      s: 0.06 + rand() * 0.09,
      ph: rand() * Math.PI * 2,
      sp: 0.25 + rand() * 0.5,
      rs: 0.2 + rand() * 0.6,
      ax: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      k: 0.5 + rand(),
    });
  }
  pixels.instanceColor.needsUpdate = true;
  pixelGroup.add(pixels);

  /* ─────────── Layout ─────────── */
  const lay = { portrait: false, S: 2.7, D: 13, liftY: 0, fanK: 1 };
  const briefFolder = new THREE.Object3D();
  let T = buildTracks(lay.S);
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(16));

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    lay.portrait = aspect < 0.95;
    lay.D = lay.portrait ? Math.max(13, 9.76 / aspect) : 13;
    const halfW = lay.D * tanHalf * aspect;
    lay.S = lay.portrait || still ? 0 : halfW * 0.4;
    lay.liftY = lay.portrait ? lay.D * tanHalf * 0.34 : 0;
    lay.fanK = lay.portrait ? 0.62 : 0.94;
    scene.fog.near = lay.D + 3;
    scene.fog.far = lay.D + 21;
    T = buildTracks(lay.S, lay.portrait);
    /* Folder pose the page leaves from (t = 1.3); frozen so the folder can
       sink away without dragging the departing page with it. */
    briefFolder.position.set(track(T.folderX, 1.3), track(T.folderY, 1.3), track(T.folderZ, 1.3));
    briefFolder.rotation.set(0.06, track(T.folderRY, 1.3), 0);
    briefFolder.scale.setScalar(FOLDER_SCALE * track(T.folderS, 1.3));
    briefFolder.updateMatrix();
    if (still) renderFrame();
  }

  /* ─────────── Per-frame update ─────────── */
  let time = 0;
  let tTarget = still ? stillT : 0;
  let tCur = tTarget;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  const v3a = new THREE.Vector3();
  const v3b = new THREE.Vector3();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const dir = new THREE.Vector3();

  function folderRelative(local, localScale, outPos, outQuat, src = folder) {
    outPos.copy(local).applyMatrix4(src.matrix);
    outQuat.copy(src.quaternion);
    return src.scale.x * localScale;
  }

  function freePose(t, outPos, outQuat) {
    outPos.set(track(T.pageX, t), track(T.pageY, t), track(T.pageZ, t));
    euler.set(track(T.pageRX, t), track(T.pageRY, t), 0);
    outQuat.setFromEuler(euler);
    return track(T.pageS, t);
  }

  function update(t) {
    /* folder */
    const fs = FOLDER_SCALE * track(T.folderS, t);
    const idle = clamp(1 - seg(t, 0.85, 1.05) + seg(t, 4.4, 4.7)); /* still while the page leaves */
    folder.position.set(track(T.folderX, t), track(T.folderY, t) + Math.sin(time * 0.9) * 0.04 * idle, track(T.folderZ, t));
    folder.rotation.set(0.06, track(T.folderRY, t) + Math.sin(time * 0.45) * 0.05 * idle, 0);
    folder.scale.setScalar(fs);
    folder.updateMatrix();
    flap.rotation.x = track(T.flap, t);

    /* page pose: rides in the folder, rises out, flies free, then launches */
    let s;
    if (t < 1.05) {
      v3b.lerpVectors(PAGE_SLOT, PAGE_RISEN, eout(seg(t, 0.6, 1.0)));
      s = folderRelative(v3b, 1 + 0.12 * eout(seg(t, 0.6, 1.0)), page.position, page.quaternion);
    } else if (t < 2) {
      const sa = folderRelative(PAGE_RISEN, 1.12, v3a, qa, briefFolder);
      const sb = freePose(2, v3b, qb);
      const k = eio(seg(t, 1.05, 2));
      page.position.lerpVectors(v3a, v3b, k);
      page.position.z += Math.sin(Math.PI * k) * 1.4;
      page.quaternion.slerpQuaternions(qa, qb, k);
      s = lerp(sa, sb, k);
    } else {
      s = freePose(t, page.position, page.quaternion);
      const fly = ein(seg(t, 4.12, 4.5));
      if (fly > 0) {
        page.position.y += fly * 6.5;
        page.position.z -= fly * 2;
        s *= 1 - 0.35 * fly;
      }
    }
    page.position.y += Math.sin(time * 1.1) * 0.05 * seg(t, 1.0, 1.6);
    page.scale.setScalar(s);
    const alpha = 1 - seg(t, 4.3, 4.5);
    page.visible = alpha > 0.001;

    const reveal = track(T.reveal, t);
    cut.value = 1 - reveal;
    sketch.visible = reveal < 0.999;
    const explode = track(T.explode, t);
    layers.forEach((L, i) => {
      L.mesh.visible = reveal > 0.001;
      L.holder.position.z = (i - 1.5) * (0.004 + explode * 0.58);
      const show = explode > 0.01;
      L.line.visible = show;
      L.label.visible = show;
      L.line.material.opacity = explode * 0.85 * alpha;
      L.label.material.opacity = explode * alpha;
    });
    pageMats.forEach((m) => {
      m.opacity = alpha;
    });
    scan.visible = reveal > 0.03 && reveal < 0.985;
    scan.position.y = (cut.value - 0.5) * SH;
    const scanK = Math.sin(Math.PI * reveal);
    scanLineMat.opacity = scanK;
    scanGlowMat.opacity = scanK * 0.7;
    const b = track(T.badge, t);
    badge.visible = b > 0.01;
    badge.scale.setScalar(Math.max(0.001, eback(b)));
    badgeMat.opacity = clamp(b * 1.6) * alpha;

    /* client sheets rise and fan in the work chapter */
    clientSheets.forEach((cs, i) => {
      cs.g.visible = t > 4.3;
      const rise = eout(seg(t, 4.45 + i * 0.06, 4.78 + i * 0.06));
      const fan = eback(seg(t, 4.6 + (i === 1 ? 0.05 : 0), 5.0));
      const a = CLIENT_START[i];
      const f = CLIENT_FAN[i];
      const k = lay.fanK;
      cs.g.position.set(
        lerp(a.x, f.x * k, fan),
        a.y + CLIENT_RISE * rise + (f.y - (a.y + CLIENT_RISE)) * fan + Math.sin(time * 1.3 + i * 1.7) * 0.03 * fan,
        lerp(a.z, f.z, fan)
      );
      cs.g.rotation.set(0, f.ry * k * fan, lerp(a.rz, f.rz * k, fan));
      cs.g.scale.setScalar(1 + 0.06 * fan);
    });

    /* glow follows the focus object */
    glow.position.set(track(T.glowX, t), track(T.glowY, t), -3);
    glow.material.opacity = track(T.glowA, t);

    /* pixel field: idle drift, scroll parallax, launch burst */
    const burst = track(T.burst, t);
    for (let i = 0; i < PIX; i++) {
      const d = pd[i];
      v3a.set(
        d.base.x + Math.sin(time * d.sp + d.ph) * 0.35,
        d.base.y + Math.cos(time * d.sp * 0.8 + d.ph) * 0.4 + t * 0.5 * d.k,
        d.base.z
      );
      let boost = 0;
      if (burst > 0.001) {
        dir.subVectors(v3a, page.position);
        const dist = dir.length() || 1;
        dir.divideScalar(dist);
        const f = (burst * d.k * 3.2) / (1 + dist * 0.18);
        v3a.addScaledVector(dir, f);
        boost = f * 0.25;
      }
      q.setFromAxisAngle(d.ax, time * d.rs + d.ph + burst * d.k * 3);
      sc.setScalar(d.s * (1 + boost));
      m4.compose(v3a, q, sc);
      pixels.setMatrixAt(i, m4);
    }
    pixels.instanceMatrix.needsUpdate = true;

    /* pointer parallax */
    ptr.sx += (ptr.x - ptr.sx) * 0.06;
    ptr.sy += (ptr.y - ptr.sy) * 0.06;
    world.rotation.set(ptr.sy * 0.035, ptr.sx * 0.08, 0);
    pixelGroup.position.set(ptr.sx * 0.6, -ptr.sy * 0.4, 0);

    /* camera */
    const fx = track(T.glowX, t);
    camera.position.set(fx * 0.12, 1.85 - lay.liftY, lay.D * track(T.camZ, t));
    camera.lookAt(fx * 0.18, 1.55 - lay.liftY, 0);
  }

  function renderFrame() {
    update(tCur);
    renderer.render(scene, camera);
  }

  let raf = 0;
  let last = performance.now();
  let visible = true;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;
    time += dt;
    tCur += (tTarget - tCur) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(tTarget - tCur) < 1e-4) tCur = tTarget;
    renderFrame();
  }

  /* Re-paint text textures once the web fonts are in. */
  const fontsReady = Promise.race([
    Promise.all([
      document.fonts.load('700 150px Fredoka'),
      document.fonts.load('800 54px Outfit'),
      document.fonts.load('500 15px Outfit'),
      document.fonts.load('700 32px Caveat'),
    ]),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
  fontsReady
    .then(() => {
      if (disposed) return;
      canvasTextures.forEach((ct) => ct.redraw());
      if (still) renderFrame();
    })
    .catch(() => {});

  resize();
  if (still) renderFrame();
  else raf = requestAnimationFrame(tick);

  return {
    setTarget(t, jump = false) {
      tTarget = t;
      if (jump) tCur = t;
    },
    setPointer(x, y) {
      ptr.x = x;
      ptr.y = y;
    },
    setVisible(v) {
      visible = v;
    },
    resize,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
