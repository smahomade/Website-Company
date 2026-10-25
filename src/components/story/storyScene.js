import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as TX from './storyTextures.js';
import { createCat } from './storyCat.js';
import { storyLayout, FH, FOLDER_SCALE } from './storyLayout.js';

/* The home page's 3D story, in plain three.js (loaded lazily by ScrollStory).
   Everything on screen is a pure function of the story position `t`
   (0 = intro … 5 = work) plus a small idle clock, so scrolling backwards
   replays the story in reverse. t is fed in by ScrollStory and eased here.
   The exceptions run on their own clocks (see stepCat): the cat walks to where
   t says it should stand at its own pace, and its acts, the build and the
   launch results play out at theirs. */

const SW = 3.4; /* sheet size (world units) */
const SH = 2.3;
const FW = 4.2; /* folder */
const FHF = 2.5;
const FR = 0.16; /* top corners only: the bottom is a fold */
const CARD_T = 0.018; /* card thickness */
const CARD_BEVEL = 0.004;
const BEND_R = 0.06; /* radius of the fold joining back and front */
const BASE_Y = BEND_R + CARD_T / 2; /* where the flat panels meet the bend */

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
const smoothstep = THREE.MathUtils.smoothstep;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a)); /* angle to -PI..PI */
const soft = (k) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
/* Smooth bump: 0 at a, 1 at m, back to 0 at b. */
const bell = (u, a, m, b) => (u <= a || u >= b ? 0 : u < m ? soft((u - a) / (m - a)) : 1 - soft((u - m) / (b - m)));

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

/* Folder back panel with the tab on its top-left edge. Square at the bottom,
   where it runs into the fold. */
function backShape() {
  const s = new THREE.Shape();
  const x = -FW / 2;
  const tabR = x + 1.5;
  const tabH = 0.34;
  s.moveTo(x, BASE_Y);
  s.lineTo(x + FW, BASE_Y);
  s.lineTo(x + FW, FH - FR);
  s.quadraticCurveTo(x + FW, FH, x + FW - FR, FH);
  s.lineTo(tabR + 0.28, FH);
  s.quadraticCurveTo(tabR + 0.12, FH, tabR + 0.04, FH + tabH * 0.5);
  s.quadraticCurveTo(tabR - 0.04, FH + tabH, tabR - 0.2, FH + tabH);
  s.lineTo(x + FR * 0.8, FH + tabH);
  s.quadraticCurveTo(x, FH + tabH, x, FH + tabH - FR * 0.8);
  s.lineTo(x, BASE_Y);
  return s;
}

/* Front flap: rounded top corners, square bottom edge on the fold. */
function frontShape() {
  const s = new THREE.Shape();
  const x = -FW / 2;
  s.moveTo(x, 0);
  s.lineTo(x + FW, 0);
  s.lineTo(x + FW, FHF - FR);
  s.quadraticCurveTo(x + FW, FHF, x + FW - FR, FHF);
  s.lineTo(x + FR, FHF);
  s.quadraticCurveTo(x, FHF, x, FHF - FR);
  s.lineTo(x, 0);
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

/* Client sheet poses, in folder space. Slots: 0 left, 1 middle, 2 right. */
const CLIENT_START = [
  { x: -0.1, y: 1.2, z: 0.04, rz: 0.025 },
  { x: 0, y: 1.2, z: 0.07, rz: -0.01 },
  { x: 0.12, y: 1.2, z: 0.055, rz: -0.03 },
];
const CLIENT_FAN = [
  { x: -1.85, y: 4.72, z: -0.62, rz: 0.12, ry: 0.22 },
  { x: 0, y: 5.08, z: -0.34, rz: 0, ry: 0 },
  { x: 1.85, y: 4.72, z: -0.62, rz: -0.12, ry: -0.22 },
];
/* sides rise and tuck back first, the middle last, so no sheet passes through another */
const CLIENT_TIMING = [
  { rise: 4.42, fan: 4.66 },
  { rise: 4.52, fan: 4.78 },
  { rise: 4.47, fan: 4.71 },
];
const CLIENT_SLOTS = { 1: [1], 2: [0, 2], 3: [0, 1, 2] };
const CLIENT_RISE = 3.25; /* clear of the back panel and tab before tucking behind */
const PAGE_SLOT = new THREE.Vector3(0, 1.2, 0.098); /* in front of the client sheets, inside the card */
const PAGE_RISEN = new THREE.Vector3(0, 3.42, 0.75); /* bottom edge clears the open flap's lip */

/* The cat walks the floor in front of the story, then jumps into the folder and
   looks over its front edge, as in the logo. In there it is pressed almost flat
   (CAT_FLAT) so it fits between the card's two panels. */
const CAT_LEAP = 4.06; /* it jumps as the page takes off */
const CAT_IN = 4.52; /* from here it jumps into the folder… */
const CAT_UP = 4.78; /* …and from here it looks over the edge */
const CAT_IN_S = 1.55; /* its size in the folder, in folder units */
const CAT_SLAB_Z = 0.097; /* between the client sheets and the front panel */
const CAT_FLAT = 0.0095;
const CAT_PAW_Z = 0.15; /* just proud of the front panel */
const CAT_HIDE = 1.95; /* how far up the cat the folder's edge comes: ducked right down… */
const CAT_PEEK = 0.8; /* …and looking over it */
const CAT_DUCK = 0.6; /* how far it squashes down to hide */
const CAT_Z = [1.3, 1.3, 2.4, 2.4, 2.4]; /* depth of its five stops (intro … launch) */
const SHEETS_LIVE = 4.9; /* from here the fanned client sheets answer the pointer */
const CAM_Z = [1, 0.97, 0.92, 0.95, 0.94, 1.04]; /* camera distance per chapter, × lay.D */
/* The sketch, the design and the build (drawn by the cat on its tablet) and
   the launch results run on their own clocks once the story reaches them: at
   a steady calm pace however fast the visitor scrolls, finishing while the
   visitor rests on the chapter, and in a hurry if they scroll on. */
const PLAN = [2.2, 2.46]; /* the build takes over the sketch as the page crosses over */
const BUILD_AT = 2.56; /* from here the site can assemble */
const LIFT = 3.3; /* the build sheet and the code window step aside as the page comes forward to go live */
/* launch: once the cat has reached its spot its button appears, it steps on and presses it, the
   site goes live, and then visitors, an enquiry and a review arrive, all on their own clock */
const GOLIVE = [3.78, 4.3];
const LIVE_S = 0.9; /* going live (the badge, the cubes drifting out) takes this many seconds… */
const RESULTS_S = 2.8; /* …and the results this many */
/* The cat's acts, each while the story rests on that chapter. */
const CALL = [0.9, 1.08]; /* consultation: on a video call with the client (another cat), whose wishes arrive as messages… */
const CALL_S = 12.6; /* …over this many seconds */
const DRAW = [1.94, 2.14]; /* design: at its tablet it sketches the page, and the big page draws itself… */
const SKETCH_S = 4.5;
const MAKE = [BUILD_AT, 3.06]; /* build: it puts the site's blocks on its sketch one by one, and the real site assembles there */
const BUILD_S = 4.2;
const CHECK = [0.4, 1.1, 2.9, 3.6]; /* then it holds the pencil up to check its work (seconds after: in from, in to, out from, out to) */
const PAD_DX = 1.32; /* how far to its side the tablet stands (cat units) */
const NAP = [3.9, 4.03]; /* once the results are in: a yawn, then asleep */
const FOLLOW = 6; /* stiffness of the story position's spring (1/s): about a third of a second behind a steady scroll */
/* The cat walks to each chapter's spot as fast as the scroll carries its spot along, from a
   stroll up to a run, but never faster than a run (cat sizes per second, and per second² to
   get going and to slow down), so a quick scroll never carries it across in a blink. */
const WALK_V = 2.9;
const WALK_A = 4.5;
const RUN_V = 12;
const RUN_A = 26;
/* When it stops to watch the page instead of the visitor. */
const catWatch = (t) =>
  clamp(
    Math.max(
      seg(t, 0.72, 0.9) - seg(t, 1.1, 1.2), /* the sketch rising */
      seg(t, 2.6, 2.7) - seg(t, 3.02, 3.1), /* the site assembling */
      seg(t, 3.34, 3.46) - seg(t, 4.42, 4.5) /* going live */
    )
  );

/* Where the page holds still (design, build, launch): x and scale. */
const pageHolds = (S) => ({ x: [S * 0.92, -S, S * 0.9], s: [1.12, 1.15, 1.12] });
/* How far past the page's sides its extras reach in those chapters (page units):
   nothing, the editor window, the result cards. */
const PAGE_OVER = [[0, 0], [0.45, 0], [0.43, 0.3]];

/* Where the cat stops in each chapter (intro … launch): x, and the floor it stands on. It keeps
   to the right-hand side throughout, so it moves along with the folder instead of crossing the
   screen; where the copy is on the right too, rebuild() stands it under the copy. */
function catStops(S, portrait, page = pageHolds(S)) {
  const floor = portrait ? -1.1 : -0.72;
  return {
    x: portrait ? [1.9, 1.9, 1.5, 1.5, 0.6] : [S + 1.95, S * 0.75, page.x[0] + 1.3, S * 0.75, page.x[2] + 0.1],
    y: [0.2, portrait ? -0.5 : -1, floor, portrait ? floor : -1, floor],
  };
}

/* Choreography. S is the sideways offset that leaves room for the copy:
   positive puts the focus object on the right, text on the left.
   `sink` is how far the folder drops out of frame while the page has the
   stage; `workX` / `workS` fit the finale between the copy and the rail. */
function buildTracks(S, portrait = false, { sink = -7.5, workX = S * 0.85, workS = portrait ? 0.8 : 0.95, page = pageHolds(S), cat = catStops(S, portrait, page) } = {}) {
  const [px, ps] = [page.x, page.s];
  const push = portrait ? [1.8, 1.22] : [1.95, 1.28]; /* the push-in before launch: height, scale (gentler on upright screens, which it nearly fills) */
  const wy = portrait ? 1.35 : 0; /* portrait: lift the finale clear of the copy */
  const stops = (v) => [[0, v[0]], [0.22, v[0]], [0.68, v[1]], [1.15, v[1]], [1.9, v[2]], [2.3, v[2]], [2.58, v[3]], [3.3, v[3]], [3.74, v[4]], [5, v[4]]];
  return {
    /* the cat: beside the folder (intro, brief), then over the floor after the page
       (design, build, launch); it walks while the copy cross-fades */
    catX: stops(cat.x),
    catY: stops(cat.y),
    catZ: [[0, CAT_Z[0]], [1.15, CAT_Z[1]], [1.5, CAT_Z[2]], [5, CAT_Z[4]]],
    /* intro: the folder holds until 0.22 so it never sweeps under the hero copy;
       launch: it only rises once the page has left (4.1 → 4.55) */
    folderX: [[0, S], [0.22, S], [0.65, -S], [1.3, -S], [2.0, -S * 0.7], [4.1, S * 0.5], [4.55, workX], [5, workX]],
    folderY: [[0, 0.2], [0.22, 0.2], [0.65, -0.5], [1.3, -0.5], [2.0, sink], [3.6, sink], [4.1, portrait ? sink : -6.0], [4.55, -0.8 + wy], [5, -0.8 + wy]],
    folderZ: [[0, 0], [0.22, 0], [0.65, 0.3], [1.3, 0.3], [2.0, -2], [4.1, -2], [4.55, 0.2], [5, 0.2]],
    folderRY: [[0, -0.55], [0.22, -0.55], [0.65, 0.42], [1.3, 0.42], [2.0, 0.9], [4.1, -0.9], [4.55, -0.08], [5, -0.04]],
    folderS: [[0, 1.0], [0.22, 1.0], [0.65, 0.92], [4.1, 0.92], [5, workS]],
    /* held open until the departing page is clear, reopened as the folder lands */
    flap: [[0, 0], [0.6, 0], [0.9, 0.62], [1.42, 0.62], [1.8, 0.1], [4.25, 0.1], [4.6, 0], [5, 0]],
    /* The page holds still while a chapter's copy is up and crosses the stage
       between chapters: over to the build side (2.32 → 2.6), then forward and
       back out to the launch side (3.3 → 3.72). */
    pageX: [[2, px[0]], [2.32, px[0]], [2.6, px[1]], [3.3, px[1]], [3.5, S * 0.1], [3.72, px[2]], [4, px[2]]],
    pageY: [[2, 1.5], [2.32, 1.5], [2.6, 1.42], [3.3, 1.42], [3.5, push[0]], [3.72, 1.5], [4, 1.5]], /* high enough for the cat to sit under it */
    pageZ: [[2, 1.5], [2.32, 1.5], [2.46, 2.1], [2.6, 1.0], [3.3, 1.0], [3.5, 3.0], [3.72, 1.5], [4, 1.5]],
    pageRX: [[2, 0], [2.6, -0.06], [3.3, -0.06], [3.5, 0], [4, 0]],
    pageRY: [[2, -0.3], [2.32, -0.3], [2.6, 0.36], [3.3, 0.36], [3.5, 0.02], [3.72, -0.22], [4, -0.22]],
    pageS: [[2, ps[0]], [2.32, ps[0]], [2.6, ps[1]], [3.3, ps[1]], [3.5, push[1]], [3.72, ps[2]], [4, ps[2]]],
    glowX: [[0, S], [0.22, S], [0.65, -S], [1.4, -S], [2, S * 0.92], [3, -S], [4, S * 0.9], [4.55, workX], [5, workX]],
    glowY: [[0, 1.2], [1, 1.5], [2, 1.5], [3, 1.3], [4, 1.6], [5, 1.9 + wy]],
    glowA: [[0, 0.34], [1, 0.26], [2, 0.3], [3, 0.24], [3.95, 0.4], [4.4, 0.3], [5, 0.34]],
    camZ: CAM_Z.map((z, i) => [i, z]),
  };
}

/* Async: shaders compile in parallel (KHR_parallel_shader_compile) and textures
   paint once the fonts are in, so the page never freezes while the story loads.
   Resolves once the first real frame is on the canvas. */
export async function createStoryScene(container, { clients = [], still = false, stillT = 5 } = {}) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'story-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  /* Throws when WebGL is unavailable; ScrollStory falls back to static copy. */
  /* MSAA only below DPR 1.5; at higher densities the supersampling already smooths edges.
     The stencil buffer cuts the cat's outline. */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 1.5, alpha: true, stencil: true, powerPreference: 'high-performance' });
  const disposables = [];
  const pendingImgs = [];
  let disposed = false;
  let fontTimer = 0;
  let raf = 0;

  try {
    let dprCap = coarse ? 1.5 : 1.75; /* lowered at runtime if frames come in slow */
    let lastDpr = 0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = !coarse;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const aniso = renderer.capabilities.getMaxAnisotropy();

    const keep = (x) => {
      disposables.push(x);
      return x;
    };
    /* Paint text textures once, with the web fonts loaded (3 s cap). */
    const fontsOk = await Promise.race([
      Promise.all([
        document.fonts.load('700 150px Fredoka'),
        document.fonts.load('800 54px Outfit'),
        document.fonts.load('500 15px Outfit'),
        document.fonts.load('700 36px Caveat'),
      ]).then(() => true, () => false),
      new Promise((r) => {
        fontTimer = setTimeout(() => r(false), 3000);
      }),
    ]);
    clearTimeout(fontTimer);
    if (disposed) throw new Error('disposed');
    const canvasTextures = [];
    function canvasTex(w, h, draw, { srgb = true, repeat = false } = {}) {
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext('2d');
      draw(ctx);
      const tex = keep(new THREE.CanvasTexture(cv));
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace; /* bump maps stay linear */
      if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = aniso;
      const entry = {
        tex,
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
    const camera = new THREE.PerspectiveCamera(32, 1, 2, 100); /* nothing comes within 2 of the lens; keeps depth precise */

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
      /* Compile PMREM's GGX/blur shaders in parallel first: otherwise fromScene()
         blocks for ~0.8 s on ANGLE/D3D11. Uses three r186 internals (package pins
         0.186.x); if they change, fall back to the plain blocking build. */
      try {
        if (renderer.compileAsync && typeof pmrem._setSize === 'function' && typeof pmrem._allocateTargets === 'function') {
          pmrem._setSize(256);
          pmrem._allocateTargets().dispose();
          const lod = pmrem._lodMeshes && pmrem._lodMeshes[0];
          if (lod && pmrem._ggxMaterial && pmrem._blurMaterial && pmrem._pingPongRenderTarget) {
            const warm = new THREE.Group();
            for (const m of [pmrem._ggxMaterial, pmrem._blurMaterial]) warm.add(new THREE.Mesh(lod.geometry, m));
            const prevRT = renderer.getRenderTarget();
            renderer.setRenderTarget(pmrem._pingPongRenderTarget); /* program keys must match the target pass */
            const ready = renderer.compileAsync(warm, camera);
            renderer.setRenderTarget(prevRT);
            await ready;
          }
        }
      } catch (err) {
        /* plain build below still works, it just blocks */
      }
      if (disposed) throw new Error('disposed');
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
    const under = new THREE.DirectionalLight(0xffd2b0, 1.1); /* lifts the open flap's underside */
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
      keep(new THREE.CircleGeometry(6, 48)), /* the radial texture is transparent outside the circle */
      keep(new THREE.MeshBasicMaterial({ map: radial.tex, color: 0xff6a00, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false, fog: false }))
    );
    glow.renderOrder = -1;
    world.add(glow);

    /* ─────────── Folder: one sheet of orange card, folded once ─────────── */
    /* Thin matte card with a paper grain and the wordmark pressed in. Back and
       front are joined by a tight bend that opens with the flap, so the front
       always reads as attached at the fold. */
    const ext = { depth: CARD_T, bevelEnabled: true, bevelThickness: CARD_BEVEL, bevelSize: CARD_BEVEL, bevelSegments: 3, curveSegments: 24 };
    const grain = canvasTex(512, 512, TX.drawGrain, { srgb: false, repeat: true });
    grain.tex.repeat.set(0.9, 0.9);
    /* extrude caps use the shape's x/y as UVs: map them onto the face */
    const cardFace = canvasTex(1024, Math.round((1024 * FHF) / FW), TX.drawCardFace);
    const cardBump = canvasTex(1024, Math.round((1024 * FHF) / FW), TX.drawCardBump, { srgb: false });
    [cardFace.tex, cardBump.tex].forEach((tx) => {
      tx.repeat.set(1 / FW, 1 / FHF);
      tx.offset.set(0.5, 0);
    });
    const cardBack = canvasTex(64, 512, TX.drawCardBack);
    cardBack.tex.repeat.set(1 / FW, 1 / (FH + 0.34));
    cardBack.tex.offset.set(0.5, 0);
    const matFront = keep(new THREE.MeshStandardMaterial({ map: cardFace.tex, roughness: 0.88, bumpMap: cardBump.tex, bumpScale: 0.9 }));
    const matBack = keep(new THREE.MeshStandardMaterial({ map: cardBack.tex, roughness: 0.9, bumpMap: grain.tex, bumpScale: 0.5 }));
    const matBend = keep(new THREE.MeshStandardMaterial({ color: '#DE5E10', roughness: 0.9, bumpMap: grain.tex, bumpScale: 0.5, side: THREE.DoubleSide }));

    const folder = new THREE.Group();
    folder.matrixAutoUpdate = false;
    world.add(folder);
    const back = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(backShape(), ext)), matBack);
    back.castShadow = true;
    back.receiveShadow = true;
    folder.add(back);
    const flap = new THREE.Group();
    folder.add(flap);
    const frontGeo = keep(new THREE.ExtrudeGeometry(frontShape(), ext));
    frontGeo.translate(0, 0, -CARD_T / 2); /* mid-plane on the hinge line */
    const front = new THREE.Mesh(frontGeo, matFront);
    front.castShadow = true;
    front.receiveShadow = true;
    flap.add(front);

    /* The fold: a thin curved strip from the back's bottom edge round to the
       front's, rebuilt whenever the flap angle changes. */
    const BEND_N = 14;
    const HINGE_Y = BASE_Y; /* centre of the bend */
    const HINGE_Z = CARD_T / 2 + BEND_R;
    const bendGeo = keep(new THREE.BufferGeometry());
    const bendPos = new Float32Array((BEND_N + 1) * 12);
    const bendNrm = new Float32Array((BEND_N + 1) * 12);
    const bendUv = new Float32Array((BEND_N + 1) * 8);
    const bendIdx = [];
    for (let i = 0; i < BEND_N; i++) {
      for (let k = 0; k < 2; k++) {
        const a = i * 4 + k * 2;
        const b = a + 4;
        bendIdx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    bendGeo.setIndex(bendIdx);
    bendGeo.setAttribute('position', new THREE.BufferAttribute(bendPos, 3));
    bendGeo.setAttribute('normal', new THREE.BufferAttribute(bendNrm, 3));
    bendGeo.setAttribute('uv', new THREE.BufferAttribute(bendUv, 2));
    const bend = new THREE.Mesh(bendGeo, matBend);
    bend.castShadow = true;
    bend.receiveShadow = true;
    folder.add(bend);
    let bendAngle = -1;
    function setFlap(phi) {
      /* the front's bottom edge rides round the bend as it opens */
      flap.rotation.x = phi;
      flap.position.set(0, HINGE_Y - BEND_R * Math.sin(phi), HINGE_Z + BEND_R * Math.cos(phi));
      const B = Math.PI - phi; /* how far the bend wraps */
      if (Math.abs(B - bendAngle) < 1e-4) return;
      bendAngle = B;
      for (let i = 0; i <= BEND_N; i++) {
        const a = (B * i) / BEND_N;
        const cz = -Math.cos(a);
        const cy = -Math.sin(a);
        for (let k = 0; k < 2; k++) {
          const r = k === 0 ? BEND_R + CARD_T / 2 : BEND_R - CARD_T / 2; /* outer, inner skin */
          const sgn = k === 0 ? 1 : -1;
          const y = HINGE_Y + r * cy;
          const z = HINGE_Z + r * cz;
          const o = (i * 4 + k * 2) * 3;
          bendPos.set([-FW / 2, y, z, FW / 2, y, z], o);
          bendNrm.set([0, cy * sgn, cz * sgn, 0, cy * sgn, cz * sgn], o);
          const v = a * r;
          bendUv.set([0, v, FW, v], (i * 4 + k * 2) * 2);
        }
      }
      bendGeo.attributes.position.needsUpdate = true;
      bendGeo.attributes.normal.needsUpdate = true;
      bendGeo.attributes.uv.needsUpdate = true;
      bendGeo.computeBoundingSphere();
    }
    setFlap(0);

    const blobTex = canvasTex(256, 256, TX.drawShadowBlob);
    const blob = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(6.4, 2.2)),
      keep(new THREE.MeshBasicMaterial({ map: blobTex.tex, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false }))
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.set(0, -0.005, HINGE_Z);
    folder.add(blob);

    /* ─────────── Client sheets (live in the folder) ─────────── */
    const sheetGeo = keep(sheetGeometry(SW, SH, 0.11));
    const paperBack = keep(new THREE.MeshStandardMaterial({ color: '#ECE8E2', roughness: 0.8 }));
    const slots = CLIENT_SLOTS[Math.min(3, clients.length)] || [];
    const clientSheets = clients.slice(0, 3).map((client, ci) => {
      const ct = canvasTex(TX.SHEET_W, TX.SHEET_H, (c) => TX.drawClientStandIn(c, client));
      const g = new THREE.Group();
      const face = new THREE.Mesh(sheetGeo, keep(new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false })));
      face.position.z = 0.004;
      face.castShadow = true;
      const rear = new THREE.Mesh(sheetGeo, paperBack);
      rear.rotation.y = Math.PI;
      rear.position.z = -0.004;
      /* orange edge, shown while the sheet is hovered */
      const rim = new THREE.Mesh(sheetGeo, keep(new THREE.MeshBasicMaterial({ color: 0xff6a00, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })));
      rim.scale.set(1 + 0.13 / SW, 1 + 0.13 / SH, 1);
      rim.visible = false;
      g.add(face, rear, rim);
      folder.add(g);
      /* Swap in the real screenshot once it loads; the drawn stand-in stays if it
         never does. crossOrigin keeps an image WebGL may not read from loading at all. */
      if (client.img) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
          if (disposed) return;
          ct.draw = (c) => TX.drawClientShot(c, img, client.host);
          ct.redraw();
          if (still) renderFrame(); /* the still has no loop to pick the texture up */
        };
        img.src = client.img;
        pendingImgs.push(img);
      }
      return { g, slot: slots[ci], id: client.id, face, rim, hl: 0 };
    });
    let hover = -1; /* index of the sheet under the pointer */

    /* ─────────── The demo page: sketch + four design layers ─────────── */
    const page = new THREE.Group();
    world.add(page);
    const cut = { value: 1 };
    const pageMats = [];
    const layers = [TX.drawDemoBase, TX.drawDemoLayout, TX.drawDemoContent, TX.drawDemoUI].map((draw, i) => {
      const ct = canvasTex(TX.SHEET_W, TX.SHEET_H, draw);
      const mat = keep(cutMaterial(ct.tex, true, cut, { depthWrite: i === 0 }));
      const mesh = new THREE.Mesh(sheetGeo, mat);
      mesh.position.z = (i - 1.5) * 0.004;
      mesh.renderOrder = 2 + i;
      page.add(mesh);
      if (i === 0) {
        mesh.castShadow = true;
        const rear = new THREE.Mesh(sheetGeo, paperBack);
        rear.rotation.y = Math.PI;
        rear.position.z = mesh.position.z - 0.004;
        page.add(rear);
      }
      pageMats.push(mat);
      return { mesh, canvas: ct.tex.image };
    });

    /* the sketch the cat draws in the design chapter, sketchK (0..1) of the way drawn */
    let sketchK = 1;
    const SKETCH_STEPS = coarse ? 160 : 320; /* how often it is repainted while it draws */
    const sketchTex = canvasTex(TX.SHEET_W, TX.SHEET_H, (c) => TX.drawDemoSketch(c, sketchK));
    const sketchMat = keep(cutMaterial(sketchTex.tex, false, cut));
    const sketch = new THREE.Mesh(sheetGeo, sketchMat);
    sketch.position.z = 0.001;
    sketch.renderOrder = 6;
    sketch.castShadow = true;
    page.add(sketch);
    pageMats.push(sketchMat);
    /* Consultation: the page is a video call window (the chat fills in as the call goes)
       with the client live in its picture, until the page sets off for the design. */
    const callShown = TX.CALL_MSGS.map(() => 0);
    let callSecs = 0; /* the call's clock, in the title bar */
    const callTex = canvasTex(TX.SHEET_W, TX.SHEET_H, (c) => TX.drawCallWindow(c, callShown, callSecs));
    const callMat = keep(new THREE.MeshBasicMaterial({ map: callTex.tex, transparent: true, depthWrite: false, toneMapped: false }));
    const callSheet = new THREE.Mesh(sheetGeo, callMat);
    callSheet.position.z = 0.006;
    callSheet.renderOrder = 9;
    callSheet.visible = false;
    page.add(callSheet);
    const [ctx0, cty0, ctx1, cty1] = TX.CALL_TILE;
    const callRT = keep(new THREE.WebGLRenderTarget(coarse ? 448 : 640, Math.round(((coarse ? 448 : 640) * (cty1 - cty0)) / (ctx1 - ctx0)), { stencilBuffer: true, samples: coarse ? 0 : 4 }));
    callRT.texture.colorSpace = THREE.SRGBColorSpace;
    const tileMask = canvasTex(256, 212, (c) => {
      c.fillStyle = '#000';
      c.fillRect(0, 0, 256, 212);
      c.fillStyle = '#fff';
      c.beginPath();
      c.roundRect(0, 0, 256, 212, 8);
      c.fill();
    });
    const tileMat = keep(new THREE.MeshBasicMaterial({ map: callRT.texture, alphaMap: tileMask.tex, transparent: true, depthWrite: false, toneMapped: false }));
    const callTile = new THREE.Mesh(keep(new THREE.PlaneGeometry(((ctx1 - ctx0) / TX.SHEET_W) * SW, ((cty1 - cty0) / TX.SHEET_H) * SH)), tileMat);
    callTile.position.set(((ctx0 + ctx1) / 2 / TX.SHEET_W - 0.5) * SW, (0.5 - (cty0 + cty1) / 2 / TX.SHEET_H) * SH, 0.009);
    callTile.renderOrder = 11;
    callTile.visible = false;
    page.add(callTile);
    /* a soft green ring round the picture while the client speaks, as call apps do */
    const ringTex = canvasTex(336, Math.round((336 * (cty1 - cty0 + 20)) / (ctx1 - ctx0 + 20)), TX.drawSpeakerRing);
    const ringMat = keep(new THREE.MeshBasicMaterial({ map: ringTex.tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    const callRing = new THREE.Mesh(keep(new THREE.PlaneGeometry(((ctx1 - ctx0 + 20) / TX.SHEET_W) * SW, ((cty1 - cty0 + 20) / TX.SHEET_H) * SH)), ringMat);
    callRing.position.set(callTile.position.x, callTile.position.y, 0.0075);
    callRing.renderOrder = 10;
    callRing.visible = false;
    page.add(callRing);
    const tagTex = canvasTex(512, 64, TX.drawCallTag);
    const tagMat = keep(new THREE.MeshBasicMaterial({ map: tagTex.tex, transparent: true, depthWrite: false, toneMapped: false }));
    const callTag = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.5, 0.19)), tagMat);
    callTag.position.set(((ctx0 + 240) / TX.SHEET_W - 0.5) * SW, (0.5 - (cty1 - 44) / TX.SHEET_H) * SH, 0.012);
    callTag.renderOrder = 12;
    callTag.visible = false;
    page.add(callTag);
    /* Scan line for the wipe: kept inside the sheet's width, glow fades at both ends.
       Plain blending and low opacity: a soft line, never a bright flash. */
    const scan = new THREE.Group();
    const scanLineMat = keep(new THREE.MeshBasicMaterial({ color: 0xffa060, transparent: true, toneMapped: false, depthWrite: false }));
    const scanLine = new THREE.Mesh(keep(new THREE.PlaneGeometry(SW * 0.99, 0.022)), scanLineMat);
    const scanGlowTex = canvasTex(128, 128, TX.drawScanGlow);
    const scanGlowMat = keep(
      new THREE.MeshBasicMaterial({ map: scanGlowTex.tex, color: 0xff6a00, transparent: true, toneMapped: false, depthWrite: false })
    );
    const scanGlow = new THREE.Mesh(keep(new THREE.PlaneGeometry(SW * 0.99, 0.5)), scanGlowMat);
    scan.add(scanGlow, scanLine);
    scan.position.z = 0.03;
    scanLine.renderOrder = 12;
    scanGlow.renderOrder = 11;
    page.add(scan);

    const badgeTex = canvasTex(640, 144, TX.drawLiveBadge);
    const badgeMat = keep(new THREE.MeshBasicMaterial({ map: badgeTex.tex, transparent: true, toneMapped: false, depthWrite: false }));
    const badge = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.5, 0.34)), badgeMat);
    badge.position.set(SW / 2 - 0.62, SH / 2 + 0.32, 0.06);
    badge.renderOrder = 13;
    page.add(badge);

    /* ─────────── Build: the plan, the site fading in over it, the code ─────────── */
    const fullTex = canvasTex(TX.SHEET_W, TX.SHEET_H, (c) => {
      c.clearRect(0, 0, TX.SHEET_W, TX.SHEET_H);
      layers.forEach((L) => c.drawImage(L.canvas, 0, 0));
    });
    /* One sheet over the page: the sketch where the site isn't built yet, the site
       where it is. It assembles block by block (TX.BUILD_BLOCKS) as the cat puts
       each one on the plan on its tablet, each sweeping in with a soft edge. */
    const NB = TX.BUILD_BLOCKS.length;
    const buildU = {
      uShow: { value: 0 },
      uMap: { value: fullTex.tex },
      uPlan: { value: sketchTex.tex },
      uBox: { value: TX.BUILD_BLOCKS.map(([x0, y0, x1, y1]) => new THREE.Vector4(x0 / TX.SHEET_W, 1 - y1 / TX.SHEET_H, x1 / TX.SHEET_W, 1 - y0 / TX.SHEET_H)) },
      uK: { value: new Array(NB).fill(0) },
    };
    const buildSheet = new THREE.Mesh(
      sheetGeo,
      keep(
        new THREE.ShaderMaterial({
          uniforms: buildU,
          transparent: true,
          depthWrite: false,
          vertexShader: 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: [
            'uniform sampler2D uMap; uniform sampler2D uPlan; uniform float uShow;',
            'uniform vec4 uBox[' + NB + ']; uniform float uK[' + NB + '];',
            'varying vec2 vUv;',
            'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
            'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
            '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
            'void main(){',
            '  float r = 0.0;',
            '  for (int i = 0; i < ' + NB + '; i++) {',
            '    vec4 b = uBox[i];',
            '    if (vUv.x >= b.x && vUv.x <= b.z && vUv.y >= b.y && vUv.y <= b.w) {', /* a later block wins */
            '      vec2 l = (vUv - b.xy) / (b.zw - b.xy);',
            '      float d = l.x * 0.6 + (1.0 - l.y) * 0.25 + noise(vUv * vec2(9.0, 6.0)) * 0.15;', /* left to right, as the pencil drags it in */
            '      r = smoothstep(d, d + 0.3, uK[i] * 1.3);',
            '    }',
            '  }',
            '  vec4 plan = texture2D(uPlan, vUv); vec4 site = texture2D(uMap, vUv);',
            '  gl_FragColor = vec4(mix(plan.rgb, site.rgb, r), mix(plan.a, site.a, r) * uShow);',
            '  #include <colorspace_fragment>',
            '}',
          ].join('\n'),
        })
      )
    );
    buildSheet.position.z = 0.012;
    buildSheet.renderOrder = 7;
    buildSheet.visible = false;
    page.add(buildSheet);

    /* Small soft motes that drift in to where the site is appearing, then fade. */
    const MOTES = coarse ? 200 : 360;
    const moteGeo = keep(new THREE.BufferGeometry());
    {
      const r = TX.rng(5);
      const home = new Float32Array(MOTES * 3);
      const from = new Float32Array(MOTES * 3);
      const delay = new Float32Array(MOTES);
      const seed = new Float32Array(MOTES);
      const col = new Float32Array(MOTES * 3);
      const tones = [new THREE.Color('#FFE9D2'), new THREE.Color('#FFE9D2'), new THREE.Color('#FF9A55')];
      for (let i = 0; i < MOTES; i++) {
        const u = r();
        const v = r();
        home.set([(u - 0.5) * SW, (v - 0.5) * SH, 0.03], i * 3);
        const ang = r() * Math.PI * 2;
        const rad = 1.1 + r() * 2.1;
        from.set([home[i * 3] + Math.cos(ang) * rad, home[i * 3 + 1] + Math.sin(ang) * rad * 0.8, 0.3 + r() * 1.3], i * 3);
        /* it lands as its block sweeps in */
        let at = 0;
        TX.BUILD_BLOCKS.forEach(([x0, y0, x1, y1], b) => {
          if (u * TX.SHEET_W >= x0 && u * TX.SHEET_W <= x1 && (1 - v) * TX.SHEET_H >= y0 && (1 - v) * TX.SHEET_H <= y1) at = b;
        });
        const [bx0, , bx1] = TX.BUILD_BLOCKS[at];
        delay[i] = Math.max(0, (at + 0.42 + 0.4 * ((u * TX.SHEET_W - bx0) / (bx1 - bx0)) + r() * 0.1) / NB - 0.24);
        seed[i] = r();
        const c = tones[Math.floor(r() * tones.length)];
        col.set([c.r, c.g, c.b], i * 3);
      }
      moteGeo.setAttribute('position', new THREE.BufferAttribute(home, 3));
      moteGeo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
      moteGeo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
      moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      moteGeo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    }
    const moteU = { uP: { value: 0 }, uTime: { value: 0 }, uSize: { value: 60 }, uAlpha: { value: 1 } };
    const motes = new THREE.Points(
      moteGeo,
      keep(
        new THREE.ShaderMaterial({
          uniforms: moteU,
          transparent: true,
          depthWrite: false,
          vertexShader: [
            'attribute vec3 aFrom; attribute float aDelay; attribute float aSeed; attribute vec3 aCol;',
            'uniform float uP; uniform float uTime; uniform float uSize; uniform float uAlpha;',
            'varying float vA; varying vec3 vCol;',
            'void main(){',
            '  float k = clamp((uP * 1.04 - aDelay) / 0.3, 0.0, 1.0);',
            '  float e = k * k * (3.0 - 2.0 * k);',
            '  vec3 p = mix(aFrom, position, e);',
            '  p.xy += vec2(sin(e * 3.14159 + aSeed * 6.0), cos(e * 2.5 + aSeed * 4.0)) * 0.16 * (1.0 - e);',
            '  p.xy += vec2(sin(uTime * 0.5 + aSeed * 20.0), cos(uTime * 0.4 + aSeed * 14.0)) * 0.025;',
            '  vA = smoothstep(0.0, 0.3, k) * (1.0 - smoothstep(0.72, 1.0, k)) * 0.6 * uAlpha;',
            '  vCol = aCol;',
            '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
            '  gl_PointSize = uSize * (0.55 + aSeed * 0.7) / -mv.z;',
            '  gl_Position = projectionMatrix * mv;',
            '}',
          ].join('\n'),
          fragmentShader: [
            'varying float vA; varying vec3 vCol;',
            'void main(){',
            '  float d = length(gl_PointCoord - 0.5);',
            '  gl_FragColor = vec4(vCol, smoothstep(0.5, 0.12, d) * vA);',
            '  #include <colorspace_fragment>',
            '}',
          ].join('\n'),
        })
      )
    );
    motes.frustumCulled = false;
    motes.renderOrder = 8;
    motes.visible = false;
    page.add(motes);

    /* The editor window behind the page's top corner, typing as the site builds. */
    const CODE_STEPS = 160;
    let codeStep = 0;
    const codeTex = canvasTex(640, 400, (c) => TX.drawCodeWindow(c, codeStep / CODE_STEPS));
    const codeMat = keep(new THREE.MeshBasicMaterial({ map: codeTex.tex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    const codeWin = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.3, 1.4375)), codeMat);
    codeWin.position.set(-SW / 2 + 0.7, SH / 2 + 0.52, -0.5);
    codeWin.rotation.set(0, 0.06, -0.02);
    codeWin.renderOrder = 1;
    codeWin.visible = false;
    page.add(codeWin);

    /* ─────────── Launch: what the live site brings in ─────────── */
    function resultCard(w, h, px, draw, pos) {
      const ct = canvasTex(px, Math.round((px * h) / w), draw);
      const mat = keep(new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
      const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), mat);
      m.position.set(...pos);
      m.renderOrder = 14;
      m.visible = false;
      page.add(m);
      return { m, mat, ct, y: pos[1] };
    }
    let visitorCount = 0;
    const visitors = resultCard(1.196, 0.65, 368, (c) => TX.drawVisitorsCard(c, visitorCount), [-SW / 2 + 0.5, SH / 2 + 0.22, 0.07]);
    const enquiry = resultCard(1.95, 0.65, 600, TX.drawEnquiryCard, [-SW / 2 + 0.55, -SH / 2 + 0.04, 0.08]);
    const review = resultCard(1.82, 0.65, 560, TX.drawReviewCard, [SW / 2 - 0.62, SH / 2 - 0.86, 0.09]);
    /* two visitors' pointers gliding to a button each (page units; rK: when in the sequence) */
    const pointerGeo = keep(new THREE.PlaneGeometry(0.17, 0.17));
    const pointers = [
      { fill: '#FFFFFF', from: [-2.5, -1.9], to: [-1.2, -0.16], at: 0.08 },
      { fill: '#FFC83D', from: [2.7, -1.6], to: [1.24, -0.7], at: 0.46 },
    ].map((pt) => {
      const ct = canvasTex(96, 96, (c) => TX.drawPointer(c, pt.fill));
      const mat = keep(new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
      const m = new THREE.Mesh(pointerGeo, mat);
      m.renderOrder = 15;
      m.visible = false;
      page.add(m);
      return { ...pt, m, mat };
    });

    /* ─────────── Pixel field ─────────── */
    const PIX = coarse ? 64 : 120;
    const pixels = new THREE.InstancedMesh(
      keep(new RoundedBoxGeometry(1, 1, 1, 1, 0.16)),
      keep(new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.05 })),
      PIX
    );
    pixels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pixels.frustumCulled = false;
    const palette = [[0xff6a00, 0.5], [0xd94f00, 0.16], [0xfff4e6, 0.14], [0x2b2b2b, 0.2]];
    const rand = TX.rng(11);
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

    /* ─────────── The PixelFold cat ─────────── */
    /* the screen of the tablet it works on: the page in miniature, as far as its act (padAct) has got (padK) */
    let padK = -1;
    let padAct = 0;
    const padTex = canvasTex(TX.PAD_W, TX.PAD_H, (c) => {
      if (padAct === 3) TX.drawPadBuild(c, sketchTex.tex.image, fullTex.tex.image, Math.max(0, padK));
      else TX.drawPadSketch(c, Math.max(0, padK));
    });
    /* The client on the call: the same cat in a grey coat, in its own little room, drawn into
       the call window's picture (renderFrame) while the call is on screen. */
    const client = createCat({ keep, canvasTex, coat: { fur: '#8B8F98', white: '#FFFDF8' } });
    const callRoom = new THREE.Scene();
    callRoom.background = new THREE.Color('#EFE1CF');
    const roomTex = canvasTex(512, 384, TX.drawCallRoom);
    const roomBack = new THREE.Mesh(keep(new THREE.PlaneGeometry(6.4, 4.8)), keep(new THREE.MeshBasicMaterial({ map: roomTex.tex, toneMapped: false, fog: false })));
    roomBack.position.set(0, 1.2, -1.6);
    callRoom.add(roomBack, client.root);
    const roomCam = new THREE.PerspectiveCamera(30, callRT.width / callRT.height, 0.5, 20);
    roomCam.position.set(0, 1.2, 3.7);
    roomCam.lookAt(0, 1.1, 0);
    const callPose = { phase: 0, walk: 0, lean: 0, tail: 0, time: 0, yaw: 0, squash: 0, tuck: 0, leap: 0, press: 0, lookYaw: 0, lookPitch: 0, eyeX: 0, eyeY: -0.01, blink: 0, marks: 0, paw: 0, hand: -1, arm: 0, armX: 0, armY: 1, armZ: 0, talk: 0 };
    /* who is talking at `ct` seconds into the call, and a mouth that moves in syllables, not like a metronome */
    const saying = (ct, who) => TX.CALL_MSGS.some((m) => m.who === who && ct > m.at - 0.15 && ct < m.at + 1.3);
    const CALL_HI = TX.CALL_MSGS.find((m) => m.who === 'us').at; /* our cat's hello (it waves) */
    const CALL_LAST = TX.CALL_MSGS[TX.CALL_MSGS.length - 1].at; /* and its last word */
    const syllables = (k) => 0.5 + 0.5 * Math.sin(time * 13 + k) * Math.sin(time * 5.3 + k * 2);
    /* Its speech bubble: hung off its head on whichever side has room (never over the copy),
       drawn on top of everything. Placed in screen space each frame (update). */
    let bubbleText = '';
    let bubbleSide = 'right';
    let bubbleShift = 0;
    const speechTex = canvasTex(TX.SPEECH.w * 2, TX.SPEECH.h * 2, (c) => TX.drawSpeech(c, bubbleText, bubbleSide, bubbleShift));
    const bubbleMat = keep(new THREE.SpriteMaterial({ map: speechTex.tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false }));
    const bubble = new THREE.Sprite(bubbleMat);
    bubble.renderOrder = 30;
    bubble.visible = false;
    scene.add(bubble);
    const cat = createCat({ keep, canvasTex, padMap: padTex.tex });
    world.add(cat.shadow, cat.button, cat.tablet, cat.root, cat.paws);
    /* Its walk is driven by how far it actually moved since the last frame, so it
       steps when you scroll, stops when you stop, and turns round when you scroll back. */
    const cst = {
      phase: 0, walk: 0, lean: 0, tail: 0, yaw: 0, /* the walk */
      lookYaw: 0, lookPitch: 0, eyeX: 0, eyeY: 0, /* the gaze */
      btnUp: 0, btnK: 0, inK: 0, upK: 0, /* its launch button out, it on the button, into the folder, up over its edge (each 0..1) */
      tool: 0, hand: 1, stand: 0, arm: 0, toolK: 0, /* its act (1 the call, 2 design and 3 build at its tablet), which front leg it works with, then how far it is up, ready, holding the pencil (0..1) */
      actT: 0, tipX: 0, tipY: 0, tipSw: 0, tipUp: 0, /* seconds since its work was finished; the pencil on the tablet: where (px), which way its stroke is going, how far it is lifted */
      sleep: 0, restT: 0, yawnAt: -10, /* the nap: how far down it is, seconds rested at launch, when it yawned */
      say: '', sayK: 0, speak: 0, /* what it is saying (its speech bubble) and how far that is shown; the client's speaking ring */
      px: 0, py: 0, pz: 0, wv: 0, spotV: 0, tgx: 0, tgy: 0, tgz: 0, dip: 0, tWas: 0, snap: true, away: true, inFolder: false, /* where it really is, how fast it is walking there, how far down it has stepped to pass under the copy */
      hopU: null, /* dev hook: pin the hop at this point of its arc */
    };
    /* The call, the sketch, the build, going live and the launch results, each 0..1 on its own clock (see stepCat). */
    const prog = { call: 0, sketch: 0, build: 0, live: 0, results: 0 };
    /* how far its act has got, and where its pencil is on the tablet */
    const actProg = (act) => (act === 1 ? prog.call : act === 3 ? prog.build : prog.sketch);
    const actTip = (act) => (act === 3 ? TX.buildTip(prog.build) : TX.sketchTip(prog.sketch));
    /* One hop at a time, on its own clock: a crouch, an arc and a landing. */
    const hop = { at: -10, dur: 0.62, h: 0.5 };
    const hopV = { air: 0, squash: 0 };
    let pokeAt = -10;
    let marksAt = -10;
    /* what it says when it is poked, in turn (and when a poke wakes it) */
    const POKES = ['Hey!', 'That tickles!', 'Hi there!', 'Mrrp?'];
    let pokes = 0;
    let pokeLine = '';
    function hopPose(u) {
      if (!(u > 0 && u < 1)) {
        hopV.air = 0;
        hopV.squash = 0;
        return;
      }
      const v = clamp((u - 0.2) / 0.56);
      hopV.air = 4 * v * (1 - v);
      /* gather, stretch off the ground, reach for it again, then soak up the landing */
      hopV.squash = 0.12 * bell(u, 0, 0.14, 0.26) - 0.07 * bell(u, 0.18, 0.34, 0.62) - 0.03 * bell(u, 0.5, 0.7, 0.8) + 0.13 * bell(u, 0.72, 0.82, 1);
    }
    const raycaster = new THREE.Raycaster();
    const ndcHit = new THREE.Vector2();
    function hitCat(nx, ny) {
      if (!cat.root.visible) return false;
      ndcHit.set(nx, ny);
      raycaster.setFromCamera(ndcHit, camera);
      return raycaster.intersectObjects(cst.inFolder ? cat.hitHead : cat.hitBody, false).length > 0;
    }

    /* ─────────── Layout ─────────── */
    const lay = { portrait: false, S: 2.7, D: 13, liftY: 0, fanK: 1, w: 1, h: 1, catS: 0.62, btnDx: 0.85 };
    const briefFolder = new THREE.Object3D();
    let T = buildTracks(lay.S);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(16));
    /* Chapter copy boxes measured by ScrollStory (CSS px, stage-relative) and the
       rail's left edge: used to keep cubes off the copy and to fit the finale. */
    let copyBoxes = null;
    let railLeft = 0;
    const copyCols = [];
    const copyA = [];

    function fitWork(w, h, aspect) {
      if (lay.portrait || still || !copyBoxes || !copyBoxes[5]) return null;
      const L = copyBoxes[5].right + 36;
      const R = (railLeft || w - 112) - 16;
      if (R - L < 120) return null;
      const halfWd = (lay.D * 1.04 - 1) * tanHalf * aspect; /* half view width at the sheets' depth, t = 5 */
      return {
        workS: clamp((R - L) / (1.011 * h * FOLDER_SCALE), 0.7, 0.95), /* finale width ≈ 1.011 · h · scale px */
        workX: Math.max(lay.S * 0.85, (((L + R) / w - 1) * halfWd) / 0.825), /* camera follows ~0.175 · fx */
      };
    }

    /* On-screen span (CSS px) of the page and its extras, held at chapter i. */
    const fitObj = new THREE.Object3D();
    const fitCam = camera.clone();
    const fitV = new THREE.Vector3();
    function pageSpan(T0, i, x, s, over) {
      const fx = track(T0.glowX, i);
      fitCam.aspect = camera.aspect;
      fitCam.updateProjectionMatrix();
      fitCam.position.set(fx * 0.12, 1.85 - lay.liftY, lay.D * CAM_Z[i]);
      fitCam.lookAt(fx * 0.18, 1.55 - lay.liftY, 0);
      fitCam.updateMatrixWorld();
      fitObj.position.set(x, track(T0.pageY, i), track(T0.pageZ, i));
      fitObj.rotation.set(track(T0.pageRX, i), track(T0.pageRY, i), 0);
      fitObj.scale.setScalar(s);
      fitObj.updateMatrix();
      let lo = Infinity;
      let hi = -Infinity;
      [-SW / 2 - over[0], SW / 2 + over[1]].forEach((lx) => {
        [-SH / 2, SH / 2].forEach((ly) => {
          const sx = (fitV.set(lx, ly, 0).applyMatrix4(fitObj.matrix).project(fitCam).x * 0.5 + 0.5) * lay.w;
          lo = Math.min(lo, sx);
          hi = Math.max(hi, sx);
        });
      });
      return [lo, hi];
    }

    /* Narrower screens leave less room beside the copy: the held page is nudged
       away from it, and shrunk if it still doesn't fit before the frame edge
       (or the rail). Wide screens come back unchanged. */
    function fitPage(T0) {
      const fit = pageHolds(lay.S);
      if (lay.portrait || still || !copyBoxes) return fit;
      const { w } = lay;
      PAGE_OVER.forEach((over, n) => {
        const i = n + 2;
        const box = copyBoxes[i];
        if (!box) return;
        const copyOnRight = box.left + box.right >= w;
        const a = copyOnRight ? 20 : box.right + 36;
        const b = copyOnRight ? box.left - 36 : (railLeft || w - 112) - 28;
        if (b - a < 200) return;
        const perPx = (2 * (lay.D * CAM_Z[i] - track(T0.pageZ, i)) * tanHalf * camera.aspect) / w;
        const s0 = fit.s[n];
        for (let pass = 0; pass < 3; pass++) {
          let [lo, hi] = pageSpan(T0, i, fit.x[n], fit.s[n], over);
          if (hi - lo > b - a) {
            fit.s[n] = Math.max(s0 * 0.78, (fit.s[n] * (b - a)) / (hi - lo));
            [lo, hi] = pageSpan(T0, i, fit.x[n], fit.s[n], over);
          }
          /* the copy side first, then the outer edge with whatever slack is left */
          if (copyOnRight) fit.x[n] += (hi > b ? b - hi : Math.max(0, Math.min(a - lo, b - hi))) * perPx;
          else fit.x[n] += (lo < a ? a - lo : -Math.max(0, Math.min(hi - b, lo - a))) * perPx;
        }
      });
      return fit;
    }

    function rebuild() {
      const { w, h } = lay;
      const aspect = w / h;
      /* Portrait frames are taller and the camera drops by liftY, so the parked
         folder sinks further to clear the bottom edge. */
      const sink = lay.portrait ? Math.min(-7.5, -3.6 - 0.35 * lay.D) : -7.5;
      /* the cat's stops: inside the frame (clear of the rail) and off the copy:
         beside it on wide screens, just above it on upright ones */
      const pageFit = fitPage(buildTracks(lay.S, lay.portrait));
      lay.fit = pageFit;
      const stops = catStops(lay.S, lay.portrait, pageFit);
      const S = lay.S;
      [S, -S, S * 0.92, -S, S * 0.9].forEach((fx, i) => {
        const dist = lay.D * CAM_Z[i] - CAT_Z[i];
        const half = dist * tanHalf * aspect;
        const mid = fx * 0.17; /* the camera leans towards the focus */
        stops.x[i] = clamp(stops.x[i], mid - half * 0.8, mid + half * 0.74);
        const box = copyBoxes && copyBoxes[i];
        if (!box) return;
        if (lay.portrait) {
          if (!(box.top > 0)) return;
          const ang = Math.atan2(-0.3, lay.D * CAM_Z[i]) + Math.atan((1 - (2 * (box.top - 64)) / h) * tanHalf);
          stops.y[i] = Math.max(stops.y[i], 1.85 - lay.liftY + dist * Math.tan(ang));
        } else {
          /* half the cat, plus 12px; at launch, also its step across to the launch button */
          const room = 0.72 * lay.catS + (24 / w) * half + (i === 4 ? 0.85 : 0);
          const xAt = (px) => mid + ((px / w) * 2 - 1) * half;
          if (box.left + box.right < w) stops.x[i] = Math.max(stops.x[i], xAt(box.right) + room);
          else {
            /* the copy is on the right as well: it stands under the copy, its head clear of the
               words and its feet inside the frame (the floor at a row of the screen, where it stands) */
            const rowY = (py) => 1.85 - lay.liftY + dist * Math.tan(Math.atan2(-0.3, lay.D * CAM_Z[i]) + Math.atan((1 - (2 * py) / h) * tanHalf));
            const feet = rowY(box.bottom + 18) - 1.9 * lay.catS;
            if (box.bottom > 0 && feet >= rowY(h - 26)) {
              stops.x[i] = xAt((box.left + box.right) / 2);
              stops.y[i] = Math.min(stops.y[i], feet);
            } else stops.x[i] = Math.min(stops.x[i], xAt(box.left) - room); /* no room under it: beside it */
          }
        }
      });
      T = buildTracks(lay.S, lay.portrait, { sink, page: pageFit, cat: stops, ...(fitWork(w, h, aspect) || {}) });
      codeWin.position.y = SH / 2 + (lay.portrait ? 0.3 : 0.52); /* upright: tucked lower, inside the frame */
      {
        /* the launch button: beside its launch stop, towards the middle of the frame (the copy
           leaves room there), unless the frame has no room on that side */
        const half4 = (lay.D * CAM_Z[4] - CAT_Z[4]) * tanHalf * aspect;
        const mid4 = S * 0.9 * 0.17;
        const toward = stops.x[4] > mid4 ? -1 : 1;
        const fits = Math.abs(stops.x[4] + toward * (0.85 + 0.5 * lay.catS) - mid4) < half4 * 0.82;
        lay.btnDx = (fits ? toward : -toward) * 0.85;
      }
      cst.snap = true; /* the stops moved: that isn't the cat walking */
      /* Folder pose the page leaves from (t = 1.3); frozen so the folder can
         sink away without dragging the departing page with it. */
      briefFolder.position.set(track(T.folderX, 1.3), track(T.folderY, 1.3), track(T.folderZ, 1.3));
      briefFolder.rotation.set(0.06, track(T.folderRY, 1.3), 0);
      briefFolder.scale.setScalar(FOLDER_SCALE * track(T.folderS, 1.3));
      briefFolder.updateMatrix();
      copyCols.length = 0;
      if (copyBoxes) {
        copyBoxes.forEach((b) => {
          copyCols.push(b ? { x0: ((b.left - 24) / w) * 2 - 1, x1: ((b.right + 24) / w) * 2 - 1 } : null);
        });
      }
    }

    function resize(render = true) {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      lastDpr = window.devicePixelRatio || 1;
      const pr = Math.min(lastDpr, dprCap);
      if (renderer.getPixelRatio() !== pr) renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      lay.w = w;
      lay.h = h;
      /* the framing (camera distance, sideways room for the copy) is shared with the
         picture that stands in for the scene while it loads (storyLayout.js) */
      Object.assign(lay, storyLayout(w, h));
      if (still && !lay.portrait) {
        lay.D = 13;
        lay.S = 0;
      }
      lay.fanK = lay.portrait ? 0.62 : still ? 0.94 : 0.8;
      lay.catS = lay.portrait ? 0.58 : 0.62;
      /* keep the cat's outline from thinning out on small screens */
      const perPx = (2 * (lay.D - 2) * tanHalf) / h; /* world units per CSS px at its depth */
      cat.inkT.value = Math.max(0.034, (1.8 * perPx) / lay.catS);
      cat.creamT.value = Math.max(0.085, (4.4 * perPx) / lay.catS);
      moteU.uSize.value = 0.108 * h * pr; /* motes keep their size relative to the frame */
      scene.fog.near = lay.D + 3;
      scene.fog.far = lay.D + 21;
      rebuild();
      if (render) renderFrame(); /* setSize() cleared the drawing buffer; repaint before compositing */
    }

    /* ─────────── Per-frame update ─────────── */
    let time = 0;
    let frozen = false; /* dev hook: stops the idle clock for repeatable captures */
    let tTarget = still ? stillT : 0;
    let tCur = tTarget;
    let tVel = 0; /* how fast tCur is moving (story units per second) */
    let onFrame = null;
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
    const ndc = new THREE.Vector3();
    const catAt = new THREE.Vector3();
    const catPos = new THREE.Vector3();
    const catQuat = new THREE.Quaternion();
    const catScale = new THREE.Vector3();
    const vSh = new THREE.Vector3(); /* its working shoulder (world) */
    const vTip = new THREE.Vector3();
    const vArm = new THREE.Vector3(); /* where the working arm points, in the cat's own frame */
    const vTool = new THREE.Vector3(); /* …and the tool in its paw */
    /* a world direction → the cat's own frame (it is turned by yaw) */
    const toCat = (v, yaw) => {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      const x = v.x * c - v.z * s;
      v.z = v.x * s + v.z * c;
      v.x = x;
      return v;
    };
    /* Puts the pencil's tip over a world point as the camera sees it: sets the
       arm's direction (vArm) and the pencil's (vTool). The pencil is cocked at
       the wrist by `bend`, so the arm aims a little the other way. */
    function tipOver(target, bend, reach, yaw) {
      v3a.copy(camera.position).sub(target).normalize(); /* the line of sight */
      v3b.copy(vSh).sub(target);
      const along = v3b.dot(v3a);
      const back = Math.sqrt(Math.max(0, reach * reach - (v3b.lengthSq() - along * along)));
      v3b.copy(target).addScaledVector(v3a, Math.max(0, along - back)).sub(vSh).normalize(); /* shoulder → where the tip sits */
      const turned = (out, a) => out.set(v3b.x * Math.cos(a) - v3b.y * Math.sin(a), v3b.x * Math.sin(a) + v3b.y * Math.cos(a), v3b.z);
      toCat(turned(vTool, bend), yaw);
      toCat(turned(vArm, -bend * 1.6), yaw);
    }

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
      const idle = clamp(1 - seg(t, 0.85, 1.05) + seg(t, 4.55, 4.8)); /* still while the page leaves */
      folder.position.set(track(T.folderX, t), track(T.folderY, t) + Math.sin(time * 0.9) * 0.04 * idle, track(T.folderZ, t));
      folder.rotation.set(0.06, track(T.folderRY, t) + Math.sin(time * 0.45) * 0.05 * idle, 0);
      folder.scale.setScalar(fs);
      folder.updateMatrix();
      setFlap(track(T.flap, t));

      /* page pose: rides in the folder, rises out, flies free, then launches */
      let s;
      if (t < 1.05) {
        const rise = eio(seg(t, 0.66, 1.0)); /* starts gently while the flap opens */
        v3b.lerpVectors(PAGE_SLOT, PAGE_RISEN, rise);
        s = folderRelative(v3b, 1 + 0.12 * rise, page.position, page.quaternion);
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
        /* launch: straight up and out, fully opaque until it has left the frame */
        const fly = ein(seg(t, 4.03, 4.4));
        if (fly > 0) {
          page.position.y += fly * 7.5;
          s *= 1 - 0.35 * fly;
        }
      }
      page.position.y += Math.sin(time * 1.1) * 0.05 * seg(t, 1.0, 1.6);
      page.scale.setScalar(s);
      const alpha = 1 - seg(t, 4.36, 4.44);
      page.visible = alpha > 0.001;

      /* consultation: the call window, until the page sets off for the design; the chat fills
         in and the client talks as the call goes (prog.call) */
      const callK = (1 - soft(seg(t, 1.12, 1.4))) * alpha;
      const onCall = callK > 0.004 && t > 0.55;
      callSheet.visible = callTile.visible = callTag.visible = onCall;
      callRing.visible = onCall && cst.speak > 0.01;
      if (onCall) {
        callMat.opacity = tileMat.opacity = tagMat.opacity = callK;
        ringMat.opacity = cst.speak * callK;
        const ct = prog.call * CALL_S;
        let said = false;
        TX.CALL_MSGS.forEach((m, i) => {
          const k = Math.round(seg(ct, m.at, m.at + 0.5) * 40) / 40;
          if (k !== callShown[i]) {
            callShown[i] = k;
            said = true;
          }
        });
        if (said || Math.floor(ct) !== callSecs) {
          callSecs = Math.floor(ct);
          callTex.redraw();
        }
        /* the client: waves hello, talks, nods at the end */
        const live = prog.call > 0 && prog.call < 1;
        const q = callPose;
        q.time = time;
        q.tail = time * 1.7;
        q.talk = live && saying(ct, 'them') ? syllables(0) : 0;
        q.arm = live ? bell(ct, 0.05, 0.45, 1.7) : 0;
        q.armX = -0.5 + Math.sin(time * 8) * 0.28;
        q.armY = 0.85;
        q.armZ = 0.35;
        q.lookYaw = Math.sin(time * 0.6) * 0.12 + (q.talk ? Math.sin(time * 1.7) * 0.05 : 0);
        const listening = live && saying(ct, 'us') ? Math.max(0, Math.sin(time * 3.1)) * 0.08 : 0; /* nods while our cat talks */
        q.lookPitch = -0.05 + (q.talk ? Math.sin(time * 2.3) * 0.05 : 0) + listening + bell(ct, CALL_LAST + 0.1, CALL_LAST + 0.7, CALL_S) * 0.12;
        q.blink = bell((time + 2.3) % 3.9, 0, 0.09, 0.2);
        client.pose(q);
        client.root.matrixWorldNeedsUpdate = true;
      }

      /* design: the sketch draws itself as the cat sketches on its tablet */
      const drawn = Math.round(prog.sketch * SKETCH_STEPS) / SKETCH_STEPS;
      if (drawn !== sketchK) {
        sketchK = drawn;
        sketchTex.redraw();
      }
      /* the finished site takes the sketch's place under the build sheet once the build is
         done (the sheet covers the swap), so it is there when the sheet steps aside */
      const reveal = t >= PLAN[1] && (prog.build >= 1 || t >= LIFT) ? 1 : 0;
      cut.value = 1 - reveal;
      sketch.visible = reveal < 0.999;
      layers.forEach((L) => {
        L.mesh.visible = reveal > 0.001;
      });
      pageMats.forEach((m) => {
        m.opacity = alpha;
      });
      scan.visible = reveal > 0.03 && reveal < 0.985;
      scan.position.y = (cut.value - 0.5) * SH;
      const scanK = Math.sin(Math.PI * reveal);
      scanLineMat.opacity = scanK * 0.5;
      scanGlowMat.opacity = scanK * 0.28;
      const b = soft(prog.live); /* the Live badge, as it goes live (it leaves with the page) */
      badge.visible = b > 0.01;
      badge.scale.setScalar(0.92 + 0.08 * b);
      badgeMat.opacity = b * alpha;

      /* build: the build sheet takes over the sketch while the page crosses over, then the
         site assembles on it block by block (prog.build) with the code typing behind */
      const planK = soft(seg(t, PLAN[0], PLAN[1])) * (1 - soft(seg(t, LIFT, LIFT + 0.12)));
      buildSheet.visible = planK > 0.004 && prog.build < 1;
      buildU.uShow.value = planK * alpha;
      for (let i = 0; i < NB; i++) buildU.uK.value[i] = TX.blockK(i, prog.build);
      motes.visible = buildSheet.visible && prog.build > 0.002;
      moteU.uP.value = prog.build;
      moteU.uTime.value = time;
      moteU.uAlpha.value = planK;
      const codeA = soft(seg(t, BUILD_AT - 0.06, BUILD_AT + 0.06)) * (1 - soft(seg(t, LIFT - 0.06, LIFT + 0.06)));
      codeWin.visible = codeA > 0.01;
      codeMat.opacity = codeA;
      const step = Math.round(prog.build * CODE_STEPS);
      if (codeWin.visible && step !== codeStep) {
        codeStep = step;
        codeTex.redraw();
      }

      /* launch: visitors, an enquiry and a review fade up in turn (prog.results) */
      const rK = prog.results;
      [[visitors, seg(rK, 0, 0.14)], [enquiry, seg(rK, 0.32, 0.46)], [review, seg(rK, 0.68, 0.84)]].forEach(([card, k]) => {
        const e = soft(k);
        card.m.visible = e * alpha > 0.01;
        card.mat.opacity = e * alpha;
        card.m.position.y = card.y - (1 - e) * 0.08;
      });
      const count = Math.round(128 * soft(seg(rK, 0.05, 1)));
      if (visitors.m.visible && count !== visitorCount) {
        visitorCount = count;
        visitors.ct.redraw();
      }
      pointers.forEach((pt) => {
        const k = eio(seg(rK, pt.at, pt.at + 0.2));
        const a = soft(seg(rK, pt.at, pt.at + 0.05)) * alpha;
        pt.m.visible = a > 0.01;
        pt.mat.opacity = a;
        pt.m.position.set(lerp(pt.from[0], pt.to[0], k) + 0.07, lerp(pt.from[1], pt.to[1], k) - 0.07, 0.1);
      });

      /* client sheets rise and fan in the work chapter. They switch on only while
         they can't be seen: folder below frame (landscape) or behind the flap (portrait). */
      let hot = 0;
      clientSheets.forEach((cs) => {
        hot = Math.max(hot, cs.hl);
      });
      clientSheets.forEach((cs, i) => {
        cs.g.visible = t > (lay.portrait ? 4.4 : 4.1);
        const tm = CLIENT_TIMING[cs.slot];
        const rise = eout(seg(t, tm.rise, tm.rise + 0.28));
        const fan = eback(seg(t, tm.fan, 5.0));
        const a = CLIENT_START[cs.slot];
        const f = CLIENT_FAN[cs.slot];
        const k = lay.fanK;
        /* hovered: it swells a little and gets an orange edge while the others dim.
           It only ever grows in place (never shifts or overtakes the sheet in front),
           so what is under the pointer stays under it. */
        const h = cs.hl;
        cs.g.position.set(
          lerp(a.x, f.x * k, fan),
          a.y + CLIENT_RISE * rise + (f.y - (a.y + CLIENT_RISE)) * fan + Math.sin(time * 1.3 + i * 1.7) * 0.03 * fan,
          lerp(a.z, f.z, fan) + 0.1 * h
        );
        cs.g.rotation.set(0, f.ry * k * fan, lerp(a.rz, f.rz * k, fan));
        cs.g.scale.setScalar(1 + 0.06 * fan + 0.06 * h);
        cs.rim.visible = h > 0.01;
        cs.rim.material.opacity = h;
        cs.face.material.color.setScalar(1 - 0.4 * Math.max(0, hot - h));
      });

      /* glow follows the focus object */
      glow.position.set(track(T.glowX, t), track(T.glowY, t), -3);
      glow.material.opacity = track(T.glowA, t);

      /* the cat: on the floor, in the air, on its button, or in the folder */
      const cw = lay.catS;
      catAt.set(cst.px, cst.py - cst.dip, cst.pz); /* where it stands (it walks there on its own, see stepCat) */
      const standX = catAt.x; /* even while it is over on the launch button */
      const onBtn = soft(cst.btnK);
      const btnArc = 4 * cst.btnK * (1 - cst.btnK); /* the step up onto the button, and back off */
      const bs = soft(cst.btnUp);
      const btnX = track(T.catX, 4) + lay.btnDx; /* beside its launch stop */
      cat.button.visible = bs > 0.02;
      cat.button.position.set(btnX, track(T.catY, 4), track(T.catZ, 4));
      cat.button.scale.setScalar(cw * Math.max(0.001, bs));
      catAt.x = lerp(catAt.x, btnX, onBtn);
      hopPose(cst.hopU == null ? (time - hop.at) / hop.dur : cst.hopU);
      const kin = cst.inK;
      const up = eout(cst.upK);
      let squash = hopV.squash;
      let cs = cw;
      let tall = 1;
      let flat = 1;
      let yaw = cst.yaw;
      let air = 0;
      catPos.copy(catAt);
      /* at its tablet it leans across as the pencil goes to the far edge */
      const far = cst.hand < 0 ? 1 - cst.tipX / TX.PAD_W : cst.tipX / TX.PAD_W;
      if (cst.tool >= 2) catPos.x += cst.hand * 0.42 * cw * soft(cst.arm) * clamp(far * 1.6 - 0.5);
      catPos.y += (hopV.air * hop.h + btnArc * 0.5 + onBtn * 0.078) * cw;
      catQuat.identity();
      cst.inFolder = kin >= 1;
      if (kin > 0) {
        const fsx = folder.scale.x;
        const inS = CAT_IN_S * fsx;
        const spring = Math.sin(Math.PI * cst.upK) * 0.08 + hopV.air * 0.14;
        /* height in the folder: ducked behind the front panel, or looking over it */
        const restY = FHF - lerp(CAT_HIDE, CAT_PEEK, up) * lerp(CAT_DUCK, 1, up) * CAT_IN_S + spring;
        if (kin < 1) {
          /* up and over the front edge, then down behind it. Worked out in the
             folder's own space, so it lands between the panels however the folder leans. */
          const over = clamp(kin / 0.55);
          const kxz = eio(over);
          cs = lerp(cw, inS, eio(kin));
          v3b.copy(catAt).applyMatrix4(m4.copy(folder.matrix).invert());
          const top = FHF + (0.3 * cs) / fsx;
          catPos
            .set(
              lerp(v3b.x, 0, kxz),
              kin < 0.55 ? lerp(v3b.y, top, eout(over)) : lerp(top, restY, ein((kin - 0.55) / 0.45)),
              lerp(v3b.z, CAT_SLAB_Z, kxz)
            )
            .applyMatrix4(folder.matrix);
          catQuat.slerp(folder.quaternion, kxz);
          tall = lerp(1, CAT_DUCK, seg(kin, 0.72, 1));
          flat = lerp(1, CAT_FLAT, smoothstep(kin, 0.1, 0.5));
          air = Math.sin(Math.PI * clamp(kin / 0.8));
          squash = 0.1 * bell(kin, 0, 0.04, 0.1); /* a crouch before it springs */
        } else {
          catPos.set(0, restY, CAT_SLAB_Z).applyMatrix4(folder.matrix);
          catQuat.copy(folder.quaternion);
          cs = inS;
          tall = lerp(CAT_DUCK, 1, up);
          flat = CAT_FLAT;
          yaw = 0;
        }
      }
      squash -= 0.07 * air;
      catScale.set(cs, cs * tall, cs * flat);
      cat.root.matrix.compose(catPos, catQuat, catScale);
      cat.root.visible = !(kin >= 1 && cst.upK <= 0);
      const pawK = kin >= 1 ? soft(seg(cst.upK, 0.35, 0.9)) : 0;
      cat.paws.visible = pawK > 0.01;
      if (cat.paws.visible) {
        const ps = CAT_IN_S * folder.scale.x;
        v3a.set(0, FHF + 0.03 + hopV.air * 0.1, CAT_PAW_Z).applyMatrix4(folder.matrix);
        catScale.set(ps, ps, ps * 0.05);
        cat.paws.matrix.compose(v3a, folder.quaternion, catScale);
      }
      const shade = 1 - clamp(kin * 2.5);
      cat.shadow.visible = shade > 0.01;
      const lift = Math.min(1, air + hopV.air * 0.6 + btnArc * 0.5);
      cat.shadow.position.set(catPos.x, catAt.y + 0.006, catPos.z);
      const sl = kin > 0 ? 0 : eio(cst.sleep); /* curled up asleep */
      cat.shadow.scale.set(cw * (1 - 0.3 * lift) * (1 + 0.25 * sl), cw * 0.62 * (1 - 0.3 * lift) * (1 + 0.25 * sl), 1);
      cat.shadow.material.opacity = 0.38 * shade * (1 - 0.5 * lift);
      const jumping = kin > 0 && kin < 1;

      /* its working arm, and the pencil in it */
      let armK = kin > 0 ? 0 : soft(cst.arm);
      const toolK = kin > 0 ? 0 : soft(cst.toolK);
      /* its tablet stands beside it, on the side it draws with, showing its work */
      const padOn = cst.tool >= 2 ? toolK : 0;
      cat.tablet.visible = padOn > 0.02;
      if (cat.tablet.visible) {
        cat.tablet.position.set(standX + cst.hand * PAD_DX * cw, catAt.y, catAt.z - 0.22 * cw);
        cat.tablet.rotation.y = -cst.hand * 0.2;
        cat.tablet.scale.setScalar(cw * padOn);
        const shown = Math.round(actProg(cst.tool) * 250) / 250;
        if (shown !== padK || cst.tool !== padAct) {
          padK = shown;
          padAct = cst.tool;
          padTex.redraw();
        }
      }
      let check = 0; /* stepping back to check its work */
      let cocked = false; /* the pencil has its own direction, not the arm's */
      /* on the call: it waves hello, talks with a paw out as it explains, nods along while the
         client talks, and is pleased at the end */
      let talk = 0;
      let callMarks = 0;
      if (cst.tool === 1 && armK > 0) {
        const ct = prog.call * CALL_S;
        const live = prog.call < 1;
        const wave = live ? bell(ct, CALL_HI - 0.3, CALL_HI + 0.1, CALL_HI + 1.2) : 0;
        let gesture = 0;
        if (live) TX.CALL_MSGS.forEach((m) => {
          if (m.who === 'us' && m.at !== CALL_HI) gesture = Math.max(gesture, 0.7 * bell(ct, m.at - 0.25, m.at + 0.25, m.at + 1.35));
        });
        armK *= Math.max(wave, gesture);
        if (wave >= gesture) vArm.set(cst.hand * (0.5 + Math.sin(time * 8 + 1) * 0.28), 0.85, 0.3);
        else vArm.set(cst.hand * (0.4 + Math.sin(time * 4.2) * 0.12), 0.15 + Math.sin(time * 5.1) * 0.12, 0.75);
        talk = live && saying(ct, 'us') ? syllables(2) : 0;
        callMarks = bell(ct, CALL_LAST, CALL_LAST + 0.4, CALL_LAST + 1.5);
      }
      if (toolK > 0 && cst.tool >= 2) {
        /* at its tablet: the pencil follows its stroke, then comes up for a look */
        check = soft(seg(cst.actT, CHECK[0], CHECK[1])) * (1 - soft(seg(cst.actT, CHECK[2], CHECK[3]))) * armK;
        cat.tablet.updateMatrixWorld();
        cat.shoulder(cst.hand, vSh);
        /* on the glass while it strokes, a little off it between bands; the wrist rocks with each stroke */
        vTip.set((cst.tipX / TX.PAD_W - 0.5) * cat.padSize.w, (0.5 - cst.tipY / TX.PAD_H) * cat.padSize.h + 0.05 * cst.tipUp, 0.03 + 0.1 * cst.tipUp).applyMatrix4(cat.padScreen.matrixWorld);
        tipOver(vTip, -cst.hand * (0.42 + 0.13 * cst.tipSw), 0.84 * cw, yaw);
        cocked = true;
        if (check > 0) {
          /* arm out to the side, pencil upright, one eye shut */
          vArm.lerp(toCat(v3a.set(cst.hand * 0.8, 0.45, 0.45).normalize(), yaw), check);
          vTool.lerp(toCat(v3b.set(-cst.hand * 0.06, 1, -0.04).normalize(), yaw), check);
        }
      }
      const turnMax = lerp(1.05, 0.8, cst.walk);
      const pk = time - pokeAt;
      const bt = time % 4.3;
      cat.pose({
        phase: cst.phase,
        walk: kin > 0 ? 0 : cst.walk,
        lean: kin > 0 ? 0 : cst.lean - 0.1 * check,
        tail: cst.tail,
        time,
        yaw: yaw - cst.hand * 0.12 * check,
        squash,
        tuck: Math.max(hopV.air, btnArc),
        leap: air,
        press: soft(seg(cst.btnK, 0.8, 1)),
        lookYaw: jumping ? 0 : lerp(clamp(wrap(cst.lookYaw - yaw), -turnMax, turnMax), -0.8, sl), /* asleep: its face turned back to the visitor */
        lookPitch: jumping ? 0 : cst.lookPitch * (1 - sl),
        eyeX: cst.eyeX * (1 - sl),
        eyeY: cst.eyeY * (1 - sl),
        blink: pk >= 0 && pk < 0.22 ? Math.sin((Math.PI * pk) / 0.22) : bt < 0.16 ? Math.sin((Math.PI * bt) / 0.16) : 0,
        marks: Math.max(kin >= 1 ? soft(cst.upK) : 0, bell((time - marksAt) / 0.9, 0, 0.22, 1), callMarks),
        paw: pawK,
        stand: kin > 0 ? 0 : soft(cst.stand),
        hand: cst.hand,
        arm: armK,
        armX: vArm.x,
        armY: vArm.y,
        armZ: vArm.z,
        toolK,
        toolX: cocked ? vTool.x : undefined,
        toolY: vTool.y,
        toolZ: vTool.z,
        wink: soft(seg(check, 0.6, 1)),
        yawn: bell((time - cst.yawnAt) / 1.7, 0, 0.47, 1),
        talk,
        sleep: sl,
      });

      /* pointer parallax (smoothing runs in tick, so update stays a function of t) */
      world.rotation.set(ptr.sy * 0.035, ptr.sx * 0.08, 0);
      pixelGroup.position.set(ptr.sx * 0.6, -ptr.sy * 0.4, 0);

      /* camera (before the pixels, which are cleared out of the copy in screen space) */
      const fx = track(T.glowX, t);
      camera.position.set(fx * 0.12, 1.85 - lay.liftY, lay.D * track(T.camZ, t));
      camera.lookAt(fx * 0.18, 1.55 - lay.liftY, 0);
      camera.updateMatrixWorld();

      /* which chapter copy is showing (same fade ScrollStory uses) */
      let anyCopy = false;
      for (let c = 0; c < copyCols.length; c++) {
        const d = t - c;
        copyA[c] = lay.portrait || still || !copyCols[c] ? 0 : c === copyCols.length - 1 && d > 0 ? 1 : 1 - smoothstep(Math.abs(d), 0.28, 0.5);
        if (copyA[c] > 0.001) anyCopy = true;
      }

      /* its speech bubble: beside its head on the side it is talking to (or away from its tablet),
         else above it, else the other side; whichever keeps clear of the copy, the folder's
         wordmark and the frame's edges. It keeps its side while that stays clear, so it never
         hops about. */
      const sayA = soft(cst.sayK);
      bubble.visible = sayA > 0.01 && cst.say !== '' && cat.root.visible && kin === 0;
      if (bubble.visible) {
        world.updateMatrixWorld();
        v3a.set(catPos.x, catPos.y + (1.38 + 0.3 * soft(cst.stand)) * cw, catPos.z);
        world.localToWorld(v3a);
        const perPx = (2 * Math.max(1, camera.position.z - v3a.z) * tanHalf) / lay.h;
        v3b.copy(v3a).project(camera);
        const hx = (v3b.x * 0.5 + 0.5) * lay.w;
        const hy = (0.5 - v3b.y * 0.5) * lay.h;
        const r = (0.5 * cw) / perPx;
        const { w: bw, h: bh } = TX.speechBox(cst.say);
        const right = railLeft ? railLeft - 64 : lay.w - 18; /* clear of the rail and its chapter label */
        /* the wordmark pressed into the folder's front (painted centred, a little below halfway) */
        let mark = null;
        if (folder.position.y > -3) {
          front.updateWorldMatrix(true, false);
          let x0 = Infinity;
          let y0 = Infinity;
          let x1 = -Infinity;
          let y1 = -Infinity;
          [[-1.35, 0.42], [1.35, 0.42], [-1.35, 1.0], [1.35, 1.0]].forEach(([lx, ly]) => {
            v3b.set(lx, ly, CARD_T / 2).applyMatrix4(front.matrixWorld).project(camera);
            const sx = (v3b.x * 0.5 + 0.5) * lay.w;
            const sy = (0.5 - v3b.y * 0.5) * lay.h;
            x0 = Math.min(x0, sx);
            x1 = Math.max(x1, sx);
            y0 = Math.min(y0, sy);
            y1 = Math.max(y1, sy);
          });
          mark = { left: x0, right: x1, top: y0, bottom: y1 };
        }
        const place = (side) => {
          const tip = side === 'right' ? [hx - r, hy] : side === 'left' ? [hx + r, hy] : [hx, hy - r * 1.15 - 4];
          const box = side === 'right' ? [tip[0] - 14 - bw, tip[1] - bh / 2, tip[0] - 14, tip[1] + bh / 2] : side === 'left' ? [tip[0] + 14, tip[1] - bh / 2, tip[0] + 14 + bw, tip[1] + bh / 2] : [tip[0] - bw / 2, tip[1] - 14 - bh, tip[0] + bw / 2, tip[1] - 14];
          /* above it, the box slides along to stay inside the frame (its tail stays on the cat) */
          let shift = 0;
          if (side === 'down') {
            shift = Math.round(clamp(Math.max(0, 18 - box[0]) - Math.max(0, box[2] - right), 26 - bw / 2, bw / 2 - 26) / 4) * 4;
            box[0] += shift;
            box[2] += shift;
          }
          let bad = Math.max(0, 18 - box[0]) + Math.max(0, box[2] - right) + Math.max(0, 76 - box[1]) + Math.max(0, box[3] - (lay.h - 10));
          (copyBoxes || []).filter((b, c) => b && copyA[c] > 0.15).concat(mark ? [mark] : []).forEach((b) => {
            const ox = Math.min(box[2], b.right + 12) - Math.max(box[0], b.left - 12);
            const oy = Math.min(box[3], (b.bottom || b.top + 200) + 12) - Math.max(box[1], b.top - 12);
            if (ox > 0 && oy > 0) bad += (ox * oy) / 100;
          });
          return { side, tip, bad, shift };
        };
        /* where it would rather the bubble went: towards the call, away from its tablet, or to its right */
        const toward = cst.tool === 1 && cst.stand > 0.5 ? cst.hand : cst.tool >= 2 && cst.stand > 0.5 ? -cst.hand : 1;
        const order = [toward < 0 ? 'right' : 'left', 'down', toward < 0 ? 'left' : 'right'].map(place);
        const keepIt = order.find((o) => o.side === bubbleSide);
        const best = keepIt && keepIt.bad === 0 && cst.say === bubbleText ? keepIt : order.reduce((a, o) => (o.bad < a.bad ? o : a));
        if (best.side !== bubbleSide || cst.say !== bubbleText || best.shift !== bubbleShift) {
          bubbleSide = best.side;
          bubbleText = cst.say;
          bubbleShift = best.shift;
          speechTex.redraw();
        }
        /* hang the canvas so the tail's tip is on the head, rising a little as it appears */
        const [tx0, ty0] = TX.speechTip(best.side);
        const cx = best.tip[0] + TX.SPEECH.w / 2 - tx0;
        const cy = best.tip[1] + TX.SPEECH.h / 2 - ty0 + (1 - sayA) * 8;
        ndc.set((cx / lay.w) * 2 - 1, 1 - (cy / lay.h) * 2, 0.5).unproject(camera).sub(camera.position);
        bubble.position.copy(camera.position).addScaledVector(ndc, (v3a.z - camera.position.z) / ndc.z);
        bubble.scale.set(TX.SPEECH.w * perPx, TX.SPEECH.h * perPx, 1);
        bubbleMat.opacity = sayA;
      }

      /* pixel field: idle drift, scroll parallax, a gentle spread at launch, kept off the copy */
      const burst = soft(prog.live) * (1 - soft(seg(t, 4.3, 4.6))); /* the cubes drift outwards a little as it goes live */
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
          const f = (burst * d.k * 0.7) / (1 + dist * 0.18);
          v3a.addScaledVector(dir, f);
          boost = f * 0.25;
        }
        let clear = 0;
        if (anyCopy) {
          ndc.copy(v3a).add(pixelGroup.position).project(camera);
          const vy = 1 - smoothstep(Math.abs(ndc.y), 0.7, 0.9);
          for (let c = 0; c < copyCols.length; c++) {
            if (copyA[c] < 0.001) continue;
            const { x0, x1 } = copyCols[c];
            clear = Math.max(clear, copyA[c] * smoothstep(ndc.x, x0 - 0.06, x0) * (1 - smoothstep(ndc.x, x1, x1 + 0.06)) * vy);
          }
        }
        q.setFromAxisAngle(d.ax, time * d.rs + d.ph + burst * d.k * 0.6);
        sc.setScalar(d.s * (1 + boost) * (1 - clear));
        m4.compose(v3a, q, sc);
        pixels.setMatrixAt(i, m4);
      }
      pixels.instanceMatrix.needsUpdate = true;
    }

    function renderFrame() {
      update(tCur);
      if (callTile.visible) {
        /* the client's picture on the call */
        client.root.updateMatrixWorld();
        renderer.setRenderTarget(callRT);
        renderer.render(callRoom, roomCam);
        renderer.setRenderTarget(null);
      }
      renderer.render(scene, camera);
    }

    /* The parts of the scene that run on their own clocks instead of following t:
       the cat's walk, facing, gaze, hops and jumps, the site assembling and the
       launch results arriving. Each has a target set by t and moves to it at its
       own steady pace, so they stay smooth however the visitor scrolls. */
    const catIdleYaw = (t, x) => clamp((track(T.glowX, t) - x) * 0.4, -0.55, 0.55); /* three-quarters towards the action */
    function startHop(h, dur = 0.62) {
      if (time - hop.at < hop.dur) return false;
      hop.at = time;
      hop.h = h;
      hop.dur = dur;
      return true;
    }
    function cheer(h) {
      if (startHop(h)) marksAt = time;
    }
    function stepCat(dt) {
      const t = tCur;
      /* where t says it should stand, and where it really is: it walks there (below) */
      const tx = track(T.catX, t);
      const ty = track(T.catY, t);
      const tz = track(T.catZ, t);
      if (cst.snap) {
        cst.px = tx;
        cst.py = ty;
        cst.pz = tz;
        cst.tgx = tx;
        cst.tgy = ty;
        cst.tgz = tz;
        cst.wv = 0;
        cst.spotV = 0;
        cst.dip = 0;
      }
      const gx = tx - cst.px;
      const gy = ty - cst.py;
      const gz = tz - cst.pz;
      const gap = Math.hypot(gx, gy, gz);
      const x = cst.px;
      const z = cst.pz;
      const building = t >= BUILD_AT;
      const launching = t >= GOLIVE[0] && t < GOLIVE[1];
      const inTo = t >= CAT_IN && (cst.snap || (cst.sleep < 0.02 && gap < 0.05 * lay.catS)); /* it wakes, and gets to its spot, before it jumps */
      const act = t > CALL[0] && t < CALL[1] ? 1 : t > DRAW[0] && t < DRAW[1] ? 2 : t > MAKE[0] && t < MAKE[1] ? 3 : 0;
      const toRight = track(T.glowX, t) > x; /* which side its subject is on (its tablet goes on that side) */
      if (cst.snap) {
        /* a cut, a resize or the first frame: everything is simply where t says */
        cst.snap = false;
        cst.tWas = t;
        cst.yaw = catIdleYaw(t, x);
        cst.walk = 0;
        cst.lean = 0;
        cst.btnUp = 0;
        cst.btnK = 0;
        cst.inK = inTo ? 1 : 0;
        cst.upK = t >= CAT_UP ? 1 : 0;
        prog.call = t >= CALL[0] ? 1 : 0;
        prog.sketch = t >= DRAW[0] ? 1 : 0;
        prog.build = building ? 1 : 0;
        prog.live = t >= GOLIVE[0] ? 1 : 0;
        prog.results = launching ? 1 : 0;
        cst.tool = act;
        cst.hand = toRight ? 1 : -1;
        cst.stand = act ? 1 : 0;
        cst.arm = cst.stand;
        cst.toolK = act >= 2 ? 1 : 0;
        cst.actT = 0;
        const tip = actTip(act);
        cst.tipX = tip[0];
        cst.tipY = tip[1];
        cst.tipSw = 0;
        cst.tipUp = 0;
        cst.sleep = 0;
        cst.restT = 0;
        cst.say = '';
        cst.sayK = 0;
        cst.speak = 0;
      }
      const tWas = cst.tWas;
      cst.tWas = t;
      const ease = (rate) => 1 - Math.exp(-dt * rate);
      const ramp = (v, on, secs) => clamp(v + ((on ? 1 : -1) * dt) / secs);

      /* launch: once it is at its spot its button comes out, it steps on and presses it, the site
         goes live while it is on it (finished in a hurry if the story moves on, undone if it goes
         back), then it steps off, the button goes away, and the results arrive */
      const there = gap < 0.06 * lay.catS && cst.walk < 0.2;
      cst.btnUp = ramp(cst.btnUp, launching && (cst.btnK > 0 || (there && prog.live < 1)), 0.35);
      cst.btnK = ramp(cst.btnK, launching && cst.btnUp >= 1 && prog.live < 1, 0.55);
      prog.live = clamp(prog.live + (t >= GOLIVE[1] ? dt / 0.3 : launching ? (cst.btnK >= 1 || prog.live > 0 ? dt / LIVE_S : 0) : -dt / 0.6));
      const resulting = launching && prog.live >= 1;
      const results = prog.results;
      prog.results = ramp(prog.results, resulting, resulting ? RESULTS_S : 0.8);
      /* the call, the sketch and the build: each goes on while the cat is at it (and ready),
         is finished in a hurry once the story moves on, and is undone if the story goes back */
      const work = (v, [from, to], a, secs, back) => clamp(v + (t > to ? (dt / secs) * 5 : t >= from ? (cst.tool === a && cst.arm >= 1 ? dt / secs : 0) : -dt / back));
      prog.call = work(prog.call, CALL, 1, CALL_S, 0.6);
      prog.sketch = work(prog.sketch, DRAW, 2, SKETCH_S, 0.6);
      prog.build = work(prog.build, MAKE, 3, BUILD_S, 1.2);

      /* walking: it makes its own way to its spot, easing in and out. It goes as fast as it
         needs to keep up with how fast the scroll moves its spot (spotV) and to close the gap:
         a slow scroll walks it along at the scroll's pace, a fast one breaks it into a run, but
         never faster than a run. The legs follow the ground it covers, with a longer stride the
         faster it goes. */
      const spotV = dt > 0 ? Math.hypot(tx - cst.tgx, ty - cst.tgy, tz - cst.tgz) / dt / lay.catS : 0;
      cst.tgx = tx;
      cst.tgy = ty;
      cst.tgz = tz;
      cst.spotV += (spotV - cst.spotV) * ease(spotV > cst.spotV ? 10 : 3);
      let dx = 0;
      let dz = 0;
      let dist = 0;
      if (gap > 1e-4 && cst.inK === 0) {
        const pace = clamp(Math.max(cst.spotV * 1.3, (gap / lay.catS) * 3), WALK_V, RUN_V); /* cat sizes per second */
        const acc = lerp(WALK_A, RUN_A, (pace - WALK_V) / (RUN_V - WALK_V)) * lay.catS;
        cst.wv = Math.min(pace * lay.catS, Math.sqrt(2 * acc * gap), cst.wv + acc * dt);
        const k = Math.min(1, (cst.wv * dt) / gap);
        dx = gx * k;
        dz = gz * k;
        cst.px += dx;
        cst.py += gy * k;
        cst.pz += dz;
        dist = gap * k;
      } else cst.wv = 0;
      const speed = dt > 0 ? dist / dt : 0;
      const jumping = cst.inK > 0 && cst.inK < 1;
      const walking = cst.inK === 0 && speed > 0.1;
      if (walking) cst.phase += Math.min((dist * 7.2) / lay.catS / (1 + speed * 0.3), 30 * dt);
      /* walking past a chapter's copy, it steps down the frame to keep its head under the words
         (never off the bottom), and back up as it reaches its spot */
      let dipWant = 0;
      if (walking && copyBoxes && !lay.portrait) {
        const perPx = (2 * Math.max(1, camera.position.z - cst.pz) * tanHalf) / lay.h; /* world units per CSS px where it walks */
        v3a.set(cst.px, cst.py, cst.pz).project(camera);
        const sx = (v3a.x * 0.5 + 0.5) * lay.w;
        const feet = (0.5 - v3a.y * 0.5) * lay.h;
        const head = feet - (1.85 * lay.catS) / perPx;
        const half = (0.5 * lay.catS) / perPx;
        copyBoxes.forEach((b, c) => {
          if (!b || !(b.bottom > 0) || !(copyA[c] > 0.2) || sx + half < b.left || sx - half > b.right) return;
          dipWant = Math.max(dipWant, Math.min(b.bottom + 16 - head, lay.h - 28 - feet) * perPx);
        });
      }
      cst.dip += (Math.max(0, dipWant) - cst.dip) * ease(5);
      cst.walk += ((walking ? 1 : 0) - cst.walk) * ease(5.5);
      cst.lean += ((walking ? clamp(speed * 0.035, 0, 0.16) : 0) - cst.lean) * ease(5);
      cst.tail += dt * (1.8 + cst.walk * 2.4);

      /* into the folder */
      cst.upK = ramp(cst.upK, cst.inK >= 1 && t >= CAT_UP, 0.5);
      if (inTo || cst.upK <= 0) cst.inK = ramp(cst.inK, inTo, 0.85); /* it ducks before it jumps back out */
      cst.away = inTo; /* into the folder back first, out of it face first */

      /* each act: it gets up on its hind legs once it has stopped walking (taking its pencil
         for the tablet ones), is ready, and then the act runs at its own pace */
      if (act && cst.stand === 0 && cst.toolK === 0) {
        cst.tool = act;
        cst.hand = toRight ? 1 : -1;
        cst.actT = 0;
      }
      const up = act !== 0 && act === cst.tool && cst.walk < 0.2;
      cst.stand = ramp(cst.stand, up, 0.5);
      cst.toolK = ramp(cst.toolK, up && cst.stand > 0.6 && cst.tool >= 2, 0.3);
      cst.arm = ramp(cst.arm, up && cst.stand >= 1, 0.45);
      if (cst.arm >= 1 && actProg(cst.tool) >= 1) cst.actT += dt;
      if (cst.tool >= 2) {
        /* the pencil follows its stroke closely (the easing only softens the first reach to
           the glass); a big jump is a lift across */
        const tip = actTip(cst.tool);
        const across = Math.hypot(tip[0] - cst.tipX, tip[1] - cst.tipY) > 50;
        const kt = cst.arm > 0 ? ease(across ? 9 : 45) : 1;
        cst.tipX += (tip[0] - cst.tipX) * kt;
        cst.tipY += (tip[1] - cst.tipY) * kt;
        cst.tipSw += (tip[2] - cst.tipSw) * ease(18);
        cst.tipUp += ((across ? 1 : tip[3]) - cst.tipUp) * ease(30);
      }

      /* the client's speaking ring, eased on and off */
      const callT = prog.call * CALL_S;
      cst.speak += ((prog.call > 0 && prog.call < 1 && saying(callT, 'them') ? 1 : 0) - cst.speak) * ease(8);
      /* what it says in its speech bubble: its side of the call, and a word as each job is done */
      let line = '';
      if (cst.tool === 1 && cst.arm >= 1 && prog.call < 1) {
        TX.CALL_MSGS.forEach((m, i) => {
          const next = TX.CALL_MSGS[i + 1];
          if (m.who === 'us' && callT >= m.at - 0.1 && callT < (next ? next.at : CALL_S)) line = m.text;
        });
      } else if (cst.tool === 2 && cst.arm >= 1 && prog.sketch >= 1 && cst.actT > 0.3 && cst.actT < 3.4) line = 'Here’s the sketch!';
      else if (cst.tool === 3 && cst.arm >= 1 && prog.build >= 1 && cst.actT > 0.3 && cst.actT < 3.4) line = 'Built and tested!';
      else if (launching && t < NAP[1] && prog.live > 0.25 && prog.results < 0.6) line = 'We’re live!';
      else if (t < 0.12 && time > 1.4 && time < 5.4) line = 'Hi! Scroll down and I’ll show you how.'; /* a hello, once, as the page opens */
      if (pokeAt > 0 && time - pokeAt < 1.8) line = pokeLine; /* a poke gets an answer */
      if (cst.walk > 0.3 || cst.inK > 0 || cst.sleep > 0.05) line = '';
      /* one line at a time: the old one fades out before the next comes in */
      if (line !== cst.say) {
        cst.sayK = ramp(cst.sayK, false, 0.25);
        if (cst.sayK <= 0) cst.say = line;
      } else cst.sayK = ramp(cst.sayK, line !== '', 0.4);

      /* launch: once the results are in and the story rests there, a yawn, then a nap.
         Scrolling on, or a poke, wakes it. */
      const resting = t > NAP[0] && t < NAP[1] && prog.results >= 1 && cst.walk < 0.1 && time - hop.at > hop.dur;
      const rested = resting ? cst.restT + dt : 0;
      if (cst.restT <= 1.6 && rested > 1.6) cst.yawnAt = time;
      cst.restT = rested;
      cst.sleep = ramp(cst.sleep, rested > 3.4, rested > 3.4 ? 1.7 : 0.35);

      /* what it reacts to */
      if (dt > 0) {
        if (results < 0.36 && prog.results >= 0.36) cheer(0.4); /* an enquiry */
        if (tWas < CAT_LEAP && t >= CAT_LEAP && cst.sleep < 0.3) startHop(0.7, 0.74); /* the page takes off */
      }

      /* facing: the way it walks, the action when it stands, the site when it types */
      let want = jumping ? (cst.away ? Math.PI : 0) : walking ? Math.atan2(dx, dz) : catIdleYaw(t, x);
      if (!jumping && !walking) {
        want = lerp(want, cst.hand * 0.5, soft(cst.stand)); /* at its tablet: mostly to the visitor, turned a little to its work */
        want = lerp(want, 0.95, soft(cst.sleep)); /* asleep: side on */
      }
      cst.yaw += wrap(want - cst.yaw) * ease(jumping ? 10 : 5);

      /* gaze: the visitor (pointer), or the page while something is happening on it */
      const w = t < CAT_IN ? catWatch(t) * (1 - cst.walk) : 0;
      /* at its tablet: eyes on its work while it draws and checks, then mostly back to the visitor */
      const atPad = cst.tool >= 2 ? soft(cst.arm) * (actProg(cst.tool) < 1 || cst.actT < CHECK[3] ? 1 : 0.25) : 0;
      /* on the call: eyes on the client, nodding along while they talk, its head moving as it talks */
      const ct = prog.call * CALL_S;
      const onCall = cst.tool === 1 ? soft(cst.arm) * (prog.call < 1 ? 1 : 0) : 0;
      const nod = onCall * (saying(ct, 'them') ? Math.max(0, Math.sin(time * 3.1)) * 0.1 : saying(ct, 'us') ? Math.sin(time * 4.4) * 0.05 : 0);
      const hx = page.position.x - x;
      const hy = page.position.y - (cst.py + lay.catS);
      const k = ease(7);
      /* its head follows the pencil across the tablet */
      const padX = cst.hand < 0 ? 1 - cst.tipX / TX.PAD_W : cst.tipX / TX.PAD_W; /* 0 at the near edge, 1 at the far one */
      const padY = cst.tipY / TX.PAD_H - 0.5;
      cst.lookYaw += (lerp(lerp(ptr.sx * 0.7, clamp(hx * 0.5, -0.8, 0.8), w), cst.hand * (0.8 + 0.45 * padX), atPad) - cst.lookYaw) * k; /* never so far that the face is lost */
      cst.lookPitch += (lerp(lerp(ptr.sy * 0.35, -clamp(hy * 0.3, 0, 0.42), w), 0.06 + 0.3 * padY, atPad) + nod - cst.lookPitch) * k;
      cst.eyeX += (lerp(ptr.sx * 0.16, clamp(hx * 0.02, -0.03, 0.03), w) - cst.eyeX) * k;
      cst.eyeY += (lerp(-ptr.sy * 0.16, 0.035, w) - cst.eyeY) * k;

      /* anything still on its way keeps the scene at full frame rate */
      return (
        (prog.call > 0 && prog.call < 1) ||
        (prog.sketch > 0 && prog.sketch < 1) ||
        (prog.build > 0 && prog.build < 1) ||
        (prog.results > 0 && prog.results < 1) ||
        jumping ||
        cst.wv > 0 ||
        (cst.sayK > 0 && cst.sayK < 1) ||
        (cst.speak > 0.002 && cst.speak < 0.998) ||
        cst.dip > 0.001 ||
        (cst.btnK > 0 && cst.btnK < 1) ||
        (cst.btnUp > 0 && cst.btnUp < 1) ||
        (prog.live > 0 && prog.live < 1) ||
        (cst.upK > 0 && cst.upK < 1) ||
        time - hop.at < hop.dur ||
        (cst.stand > 0 && (!coarse || cst.stand < 1 || cst.arm < 1)) || /* its acts: full rate on desktops, the calmer idle rate on phones once it is settled */
        (cst.sleep > 0 && cst.sleep < 1) ||
        time - cst.yawnAt < 1.8
      );
    }

    let last = performance.now();
    let lastInput = last;
    let visible = true;
    const probe = { n: 0, slow: 0, done: false };
    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!visible) {
        last = now;
        return;
      }
      /* A frame per screen refresh, but never two within 10 ms (so 120/144 Hz
         screens don't double the cost), and about 30 fps when nothing but the slow
         idle drift is moving. (A plain 60 fps cap drops a 75 or 90 Hz screen to
         every other refresh, which reads as a stutter.) */
      const idleNow = tCur === tTarget && tVel === 0 && now - lastInput > 1500;
      if (now - last < (idleNow ? 28 : 10)) return;
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if ((window.devicePixelRatio || 1) !== lastDpr) resize(); /* monitor switch / zoom: no ResizeObserver fires */
      /* slow GPU? after a warm-up, step the pixel ratio down once */
      if (!probe.done && !frozen && !idleNow) {
        probe.n += 1;
        if (probe.n > 90 && dt > 0.021) probe.slow += 1;
        if (probe.n >= 210) {
          probe.done = true;
          if (probe.slow > 30 && renderer.getPixelRatio() > 1) {
            dprCap = Math.max(1, renderer.getPixelRatio() * 0.7);
            resize();
          }
        }
      }
      if (!frozen) time += dt;
      /* The story position follows the scroll on a critically damped spring, so it
         gathers speed and settles without a jolt however the scroll arrives
         (wheel notches, a trackpad, the scrollbar). */
      {
        const x = tCur - tTarget;
        const e = Math.exp(-FOLLOW * dt);
        const kv = (tVel + FOLLOW * x) * dt;
        tVel = (tVel - FOLLOW * kv) * e;
        tCur = clamp(tTarget + (x + kv) * e, 0, 5);
        if (Math.abs(tTarget - tCur) < 1e-4 && Math.abs(tVel) < 1e-3) {
          tCur = tTarget;
          tVel = 0;
        }
      }
      const kp = 1 - Math.exp(-dt * 3.7); /* = 0.06 per frame at 60 Hz, the same feel at 120/144 Hz */
      ptr.sx += (ptr.x - ptr.sx) * kp;
      ptr.sy += (ptr.y - ptr.sy) * kp;
      if (!frozen && stepCat(dt)) lastInput = now;
      if (tCur < SHEETS_LIVE) hover = -1;
      const kh = 1 - Math.exp(-dt * 12);
      clientSheets.forEach((cs, i) => {
        cs.hl += ((i === hover ? 1 : 0) - cs.hl) * kh;
        if (cs.hl < 0.002 && i !== hover) cs.hl = 0;
      });
      renderFrame();
      if (onFrame) onFrame(tCur, prog);
    }

    /* Fonts timed out: repaint once when they do arrive. */
    if (!fontsOk) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        canvasTextures.forEach((ct) => ct.redraw());
        if (still) renderFrame();
      });
    }

    /* Compile every program (hidden chapters included) in parallel before the
       first frame, then upload the remaining textures in idle time. */
    resize(false);
    stepCat(0);
    update(tCur);
    if (renderer.compileAsync) {
      await renderer.compileAsync(scene, camera);
      /* the client's picture renders into its own target, which needs its own programs */
      renderer.setRenderTarget(callRT);
      const roomReady = renderer.compileAsync(callRoom, roomCam);
      renderer.setRenderTarget(null);
      await roomReady;
    }
    if (disposed) throw new Error('disposed');
    container.prepend(canvas);
    renderFrame();
    if (!still) raf = requestAnimationFrame(tick);
    (async () => {
      const idle = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 250 }) : setTimeout(cb, 16));
      for (const ct of canvasTextures) {
        await new Promise((r) => idle(r));
        if (disposed) return;
        renderer.initTexture(ct.tex);
      }
    })();

    return {
      setTarget(t, jump = false) {
        if (t !== tTarget) lastInput = performance.now();
        tTarget = t;
        if (jump) {
          tCur = t;
          tVel = 0;
          cst.snap = true; /* a cut, not a walk */
        }
      },
      setPointer(x, y) {
        lastInput = performance.now();
        ptr.x = x;
        ptr.y = y;
      },
      /* What is under the pointer (nx, ny: normalised device coords on the canvas):
         'cat', the id of a fanned client sheet, or null. */
      pick(nx, ny) {
        ndcHit.set(nx, ny);
        raycaster.setFromCamera(ndcHit, camera);
        const onCat = cat.root.visible ? raycaster.intersectObjects(cst.inFolder ? cat.hitHead : cat.hitBody, false)[0] : null;
        let best = null;
        if (!still && tCur > SHEETS_LIVE) {
          clientSheets.forEach((cs) => {
            const hit = raycaster.intersectObject(cs.face, false)[0];
            if (hit && (!best || hit.distance < best.distance)) best = { distance: hit.distance, id: cs.id };
          });
        }
        if (onCat && (!best || onCat.distance < best.distance)) return 'cat';
        return best ? best.id : null;
      },
      /* Highlight a client sheet (by id), or none. */
      setHover(id) {
        const i = id ? clientSheets.findIndex((cs) => cs.id === id) : -1;
        if (i === hover) return;
        hover = i;
        lastInput = performance.now();
      },
      pokeCat(nx, ny) {
        if (!hitCat(nx, ny)) return false;
        const asleep = cst.sleep > 0;
        cst.restT = 0; /* a poke wakes it; it nods off again if it is left alone */
        if (!asleep && !startHop(0.5)) return false;
        pokeAt = time;
        marksAt = time;
        pokeLine = asleep ? 'Oh! I’m awake!' : POKES[pokes++ % POKES.length];
        lastInput = performance.now();
        return true;
      },
      setVisible(v) {
        visible = v;
      },
      /* Called after every frame with the eased story position (drives the copy)
         and { build, results }: how far the site has assembled and its results arrived. */
      setOnFrame(fn) {
        onFrame = fn;
      },
      /* boxes: per-chapter {left, right, top} of the copy (stage px); rail: rail's left edge. */
      setCopy(boxes, rail) {
        copyBoxes = boxes;
        railLeft = rail || 0;
        rebuild();
      },
      resize,
      /* Dev-only inspection; ScrollStory exposes it as window.__pfStory in dev builds. */
      debug: {
        renderAt(t) {
          tTarget = t;
          tCur = t;
          tVel = 0;
          cst.snap = true;
          stepCat(0);
          renderFrame();
        },
        /* force the call / sketch / build / results progress for captures, e.g. { build: 0.5 } */
        fx(o) {
          if (o) {
            Object.assign(prog, o);
            renderFrame();
          }
          return { ...prog };
        },
        /* force the cat's state for captures, e.g. { walk: 1, phase: 2, yaw: 1.57, hopU: 0.5 } */
        cat(o) {
          if (o) {
            Object.assign(cst, o);
            renderFrame();
          }
          return { ...cst };
        },
        freeze(on = true) {
          frozen = on;
          if (on) time = 0;
        },
        sample(t) {
          update(t);
          const e = new THREE.Euler();
          const pose = (o) => {
            e.setFromQuaternion(o.quaternion);
            return { x: +o.position.x.toFixed(4), y: +o.position.y.toFixed(4), z: +o.position.z.toFixed(4), rx: +e.x.toFixed(4), ry: +e.y.toFixed(4), rz: +e.z.toFixed(4), s: +o.scale.x.toFixed(4), visible: o.visible };
          };
          return {
            t,
            folder: pose(folder),
            flap: +flap.rotation.x.toFixed(4),
            page: { ...pose(page), alpha: pageMats[0].opacity, built: 1 - cut.value },
            clients: clientSheets.map((cs) => pose(cs.g)),
            camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            glow: { x: glow.position.x, y: glow.position.y, a: glow.material.opacity },
            badge: { s: badge.scale.x, visible: badge.visible },
            cat: { x: +catPos.x.toFixed(4), y: +catPos.y.toFixed(4), z: +catPos.z.toFixed(4), visible: cat.root.visible, paws: cat.paws.visible, inFolder: cst.inFolder },
            layout: { ...lay },
          };
        },
        info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries, pixelRatio: renderer.getPixelRatio() }),
        objects: () => ({ scene, camera, page, folder, flap, clientSheets, renderer, cat }),
      },
      dispose() {
        disposed = true;
        cancelAnimationFrame(raf);
        clearTimeout(fontTimer);
        pendingImgs.forEach((im) => {
          im.onload = null;
          im.removeAttribute('src');
        });
        /* three r186 shares one module-level DFG LUT texture across renderers and
           renderer.dispose() never removes the listener this renderer added to it,
           which would keep the whole renderer alive. Find it through any compiled
           material before material.dispose() clears renderer.properties. */
        let dfgLUT = null;
        for (const d of disposables) {
          if (!d.isMaterial) continue;
          const u = renderer.properties.get(d).uniforms;
          if (u && u.dfgLUT && u.dfgLUT.value) {
            dfgLUT = u.dfgLUT.value;
            break;
          }
        }
        disposables.forEach((d) => d.dispose && d.dispose());
        if (dfgLUT) dfgLUT.dispose(); /* the next renderer re-uploads it */
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      },
    };
  } catch (err) {
    /* Setup failed after the context existed: release it, then let ScrollStory fall back. */
    disposed = true;
    cancelAnimationFrame(raf);
    clearTimeout(fontTimer);
    disposables.forEach((d) => d.dispose && d.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    throw err;
  }
}
