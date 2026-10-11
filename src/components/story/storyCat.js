import * as THREE from 'three';
import * as TX from './storyTextures.js';

/* The PixelFold cat, as a flat cartoon: unlit colours, one ink line round the
   whole silhouette and a cream sticker border (both cut with the stencil
   buffer, so overlapping parts never outline each other). storyScene places
   `root`, `paws`, `button` and `shadow`, and calls pose() every frame. */

const FUR = '#1F1F23';
const WHITE = '#FFFDF8';
const INK = '#121214';
const PINK = '#F0805A';
const CREAM = '#FFF6EA';
const TAIL_N = 26;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
/* 0 → 1 → 0 as a leg swings forward, with no corners (a paw lifting) */
const lift = (a) => {
  const k = 0.5 + 0.5 * Math.cos(a);
  return k * k;
};

export function createCat({ keep, canvasTex }) {
  /* outline widths in the cat's own units (the scene widens them on small screens) */
  const inkT = { value: 0.034 };
  const creamT = { value: 0.085 };

  /* Stencil bits: 1 the cat, 2 its ink line, 4 the paws hooked over the folder,
     8 their ink line. Ink draws only outside its own shapes, cream only outside
     everything. */
  const flat = (color, bit = 1, extra = {}) =>
    keep(
      Object.assign(new THREE.MeshBasicMaterial({ color, toneMapped: false, fog: false, ...extra }), {
        stencilWrite: true,
        stencilRef: bit,
        stencilWriteMask: bit,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilZPass: THREE.ReplaceStencilOp,
      })
    );
  function hull(color, width, stencil) {
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, toneMapped: false, fog: false });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uT = width;
      shader.vertexShader =
        'uniform float uT;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uT;');
    };
    m.customProgramCacheKey = () => 'pf-hull';
    return keep(Object.assign(m, { stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilZPass: THREE.KeepStencilOp }, stencil));
  }
  const inkHull = hull(INK, inkT, { stencilRef: 2, stencilFuncMask: 1, stencilWriteMask: 2, stencilZPass: THREE.ReplaceStencilOp });
  const pawInk = hull(INK, inkT, { stencilRef: 8, stencilFuncMask: 4, stencilWriteMask: 8, stencilZPass: THREE.ReplaceStencilOp });
  const creamHull = hull(CREAM, creamT, { stencilRef: 0, stencilFuncMask: 15, stencilWriteMask: 0 });

  const fur = flat(FUR);
  const white = flat(WHITE);
  const pink = flat(PINK);
  const ink = flat(INK);
  const pure = flat('#FFFFFF');
  const orange = flat('#FF6A00');
  const sph = (r, ws = 24, hs = 16) => keep(new THREE.SphereGeometry(r, ws, hs));

  /* A part, plus its two outline shells (pass line = null for inner details). */
  function part(geo, mat, parent, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], line = inkHull) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    parent.add(m);
    if (line) {
      const a = new THREE.Mesh(geo, line);
      a.renderOrder = 1;
      const b = new THREE.Mesh(geo, creamHull);
      b.renderOrder = 2;
      m.add(a, b);
    }
    return m;
  }

  const root = new THREE.Group();
  root.matrixAutoUpdate = false;
  const turn = new THREE.Group(); /* which way it faces, and squash and stretch */
  root.add(turn);
  const body = new THREE.Group();
  turn.add(body);

  const torso = part(sph(0.34, 22, 14), fur, body, [0, 0.5, -0.02], [1, 0.96, 1.26]);
  part(sph(0.23, 20, 14), white, body, [0, 0.43, 0.24], [0.92, 1.0, 0.72], [0, 0, 0], null);

  const legGeo = keep(new THREE.CapsuleGeometry(0.105, 0.12, 4, 12));
  const footGeo = sph(0.125, 14, 10);
  /* front pair first: [left, right] front, [left, right] back */
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.18, 0.4, sz * 0.27);
    body.add(hip);
    part(legGeo, fur, hip, [0, -0.12, 0]);
    part(footGeo, white, hip, [0, -0.285, 0.04], [1, 0.72, 1.3]);
    return hip;
  });

  /* Tail: a chain of beads, drawn as three instanced meshes (fill, ink, cream). */
  const tailBase = new THREE.Group();
  tailBase.position.set(0, 0.62, -0.4);
  body.add(tailBase);
  const tailGeo = sph(0.092, 10, 6);
  const tail = keep(new THREE.InstancedMesh(tailGeo, pure, TAIL_N));
  tail.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const tmpColor = new THREE.Color();
  for (let i = 0; i < TAIL_N; i++) tail.setColorAt(i, tmpColor.set(i >= 21 ? WHITE : FUR));
  const tailLines = [inkHull, creamHull].map((mat, k) => {
    const im = keep(new THREE.InstancedMesh(tailGeo, mat, TAIL_N));
    im.instanceMatrix = tail.instanceMatrix; /* same beads */
    im.renderOrder = k + 1;
    return im;
  });
  [tail, ...tailLines].forEach((im) => {
    im.frustumCulled = false;
    tailBase.add(im);
  });

  const head = new THREE.Group();
  head.position.set(0, 1.0, 0.36);
  body.add(head);
  const face = canvasTex(1024, 512, TX.drawCatFace);
  const skull = part(sph(0.5, 36, 24), flat('#FFFFFF', 1, { map: face.tex }), head, [0, 0, 0], [1.24, 1.0, 1.0]);
  part(sph(0.17, 20, 14), white, head, [0, -0.17, 0.4], [1.35, 0.8, 0.7], [0, 0, 0], null);
  part(sph(0.05, 12, 8), ink, head, [0, -0.1, 0.535], [1.45, 0.9, 0.7], [0, 0, 0], null);
  const mouthGeo = keep(new THREE.TorusGeometry(0.042, 0.011, 6, 12, Math.PI));
  part(mouthGeo, ink, head, [-0.042, -0.16, 0.515], [1, 1, 1], [0, 0, Math.PI], null);
  part(mouthGeo, ink, head, [0.042, -0.16, 0.515], [1, 1, 1], [0, 0, Math.PI], null);

  const ringGeo = sph(0.205, 24, 16);
  const whiteGeo = sph(0.178, 24, 16);
  const pupilGeo = sph(0.122, 20, 14);
  const glintGeo = sph(0.034, 10, 8);
  const eyes = [-1, 1].map((sx) => {
    const eye = new THREE.Group();
    eye.position.set(sx * 0.235, 0.06, 0.415);
    eye.rotation.y = sx * 0.32;
    head.add(eye);
    part(ringGeo, ink, eye, [0, 0, -0.012], [1, 1.06, 0.34], [0, 0, 0], null);
    part(whiteGeo, pure, eye, [0, 0, 0], [1, 1.06, 0.4], [0, 0, 0], null);
    const pupil = part(pupilGeo, ink, eye, [0, 0, 0.05], [1, 1.05, 0.36], [0, 0, 0], null);
    part(glintGeo, pure, pupil, [-0.04, 0.046, 0.08], [1, 1, 1], [0, 0, 0], null);
    return { eye, pupil };
  });

  /* ears: a cone cut short and capped with a ball, so the tip and its outline stay
     round. The cone carries on down into the skull (same slope), so the ear
     grows out of the head instead of sitting on it with its flat base showing. */
  const EAR_SLOPE = 0.421; /* how fast the ear widens towards its root */
  const earGeo = keep(new THREE.CylinderGeometry(0.06, 0.06 + EAR_SLOPE * 0.6, 0.6, 24));
  const earTipGeo = sph(0.06, 14, 10);
  const earInGeo = keep(new THREE.ConeGeometry(0.15, 0.3, 18));
  const earCones = [];
  const ears = [-1, 1].map((sx) => {
    const ear = new THREE.Group();
    ear.position.set(sx * 0.36, 0.36, -0.02);
    ear.rotation.set(-0.06, 0, -sx * 0.32);
    head.add(ear);
    earCones.push(part(earGeo, fur, ear, [0, 0.08, 0])); /* tip at 0.38, root at -0.22 */
    part(earTipGeo, fur, ear, [0, 0.38, 0]);
    /* inner ear: a flattened cone lying along the ear's front face */
    part(earInGeo, pink, ear, [0, 0.168, 0.149], [1, 1, 0.25], [-Math.atan(EAR_SLOPE), 0, 0], null);
    return ear;
  });

  const whiskerGeo = keep(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 5));
  [-1, 1].forEach((sx) => {
    for (let k = 0; k < 2; k++) part(whiskerGeo, pure, head, [sx * 0.42, -0.15 + k * 0.06, 0.34], [1, 1, 1], [0, 0, sx * (1.45 + k * 0.2)], null);
  });

  /* The logo's two "surprise" strokes by the ear (orange, then yellow). */
  const markGeo = keep(new THREE.CapsuleGeometry(0.032, 0.14, 4, 10));
  const marks = [['#FF6A00', -0.86, 0.36, 1.05], ['#FFC83D', -0.74, 0.62, 0.62]].map(([color, x, y, rz]) =>
    part(markGeo, flat(color), head, [x, y, 0.02], [1, 1, 1], [0, 0, rz])
  );

  /* The laptop it builds the site on: sits in front of it and turns with it. */
  const laptop = new THREE.Group();
  laptop.position.set(0, 0, 0.74);
  laptop.visible = false;
  turn.add(laptop);
  const shell = flat('#EDE7DE');
  part(keep(new THREE.BoxGeometry(0.9, 0.05, 0.52)), shell, laptop, [0, 0.03, 0]);
  part(keep(new THREE.BoxGeometry(0.9, 0.6, 0.04)), shell, laptop, [0, 0.33, 0.32], [1, 1, 1], [0.3, 0, 0]);
  part(keep(new THREE.BoxGeometry(0.16, 0.16, 0.02)), orange, laptop, [0, 0.34, 0.352], [1, 1, 1], [0.3, 0, 0], null);

  /* The launch button it steps on (the scene places it on the floor). */
  const button = new THREE.Group();
  button.visible = false;
  part(keep(new THREE.CylinderGeometry(0.34, 0.36, 0.08, 28)), flat('#2B2B2B'), button, [0, 0.04, 0]);
  const buttonTop = part(keep(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 28)), orange, button, [0, 0.13, 0]);

  /* The two paws hooked over the folder's front edge in the logo pose. They sit
     in front of the card while the cat is behind it, so they are their own group. */
  const paws = new THREE.Group();
  paws.matrixAutoUpdate = false;
  const pawGeo = sph(0.15, 20, 14);
  const toeGeo = keep(new THREE.CapsuleGeometry(0.011, 0.07, 3, 6));
  const pawWhite = flat(WHITE, 4);
  const pawToe = flat(INK, 4);
  const pawList = [-1, 1].map((sx) => {
    const g = new THREE.Group();
    g.position.set(sx * 0.36, 0, 0);
    paws.add(g);
    part(pawGeo, pawWhite, g, [0, 0, 0], [1.05, 0.82, 0.6], [0, 0, 0], pawInk);
    [-1, 1].forEach((k) => part(toeGeo, pawToe, g, [k * 0.05, 0.04, 0.1], [1, 1, 1], [0, 0, 0], null));
    return g;
  });

  /* Flat cartoon shadow; the scene lays it on the floor under the cat. */
  const shadow = new THREE.Mesh(
    keep(new THREE.CircleGeometry(0.62, 36)),
    keep(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false, toneMapped: false, fog: false }))
  );
  shadow.rotation.x = -Math.PI / 2;

  const m4 = new THREE.Matrix4();
  const link = new THREE.Matrix4();
  const bead = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const v3 = new THREE.Vector3();

  /* Every input is continuous, so the cat moves as smoothly as it is driven.
     p: phase (walk cycle, radians), walk 0..1, lean (forward tilt when it hurries),
     tail (its own sway clock, radians), time (s), yaw, squash, tuck 0..1 (legs
     gathered in a hop), leap 0..1 (legs stretched in a long jump), typing 0..1,
     press 0..1 (the button under it), lookYaw / lookPitch (head, relative to the
     body), eyeX / eyeY, blink 0..1, marks 0..1, paw 0..1. */
  function pose(p) {
    const wk = p.walk;
    const ph = p.phase;
    const t = p.time;
    const ty = p.typing;
    const s = Math.sin(ph);
    const bob = 0.5 - 0.5 * Math.cos(ph * 2); /* 0 → 1 → 0 on every step, no corners */

    turn.rotation.y = p.yaw;
    turn.scale.set(1 + p.squash, 1 - p.squash, 1 + p.squash);

    /* body: bounce and sway with the steps, breathe when still */
    body.position.y = bob * 0.06 * wk + Math.sin(t * 2.2) * 0.008 * (1 - wk);
    body.rotation.set(Math.sin(ph * 2) * 0.035 * wk + p.lean - p.leap * 0.25 - ty * 0.26, 0, s * 0.07 * wk);
    body.scale.set(1, 1 - (1 - bob) * 0.035 * wk, 1);

    /* legs: diagonal pairs swing together, paws lift on the forward swing;
       at the laptop the front pair taps the keys */
    legs.forEach((hip, i) => {
      const a = ph + (i === 0 || i === 3 ? 0 : Math.PI);
      const front = i < 2;
      const tap = 0.5 + 0.5 * Math.sin(t * 8 + i * Math.PI);
      hip.rotation.x = Math.sin(a) * 0.8 * wk - p.tuck * 0.6 + (front ? -1 : 1) * p.leap * 0.95 + (front ? -0.7 + tap * 0.36 : 0.2) * ty;
      hip.position.y = 0.4 + lift(a) * 0.07 * wk + (front ? 0.05 * ty : 0);
    });

    /* tail: held up in a curve, swaying on its own clock */
    tailBase.rotation.x = -0.75 + Math.sin(ph * 2) * 0.08 * wk + p.leap * 0.5 + p.tuck * 0.3;
    m4.identity();
    for (let i = 0; i < TAIL_N; i++) {
      euler.set(0.062, 0, Math.sin(p.tail - i * 0.17) * (0.03 + 0.03 * wk) * (i / 12 + 0.3));
      link.makeRotationFromEuler(euler);
      if (i) link.setPosition(0, 0.03, 0);
      m4.multiply(link);
      const k = 1 - i * 0.0087;
      tail.setMatrixAt(i, bead.copy(m4).scale(v3.set(k, k, k)));
    }
    tail.instanceMatrix.needsUpdate = true;

    /* head: counter-bob on the steps, then wherever it's looking */
    head.position.y = 1.0 - bob * 0.025 * wk;
    head.rotation.set(Math.sin(ph * 2 + 0.6) * 0.05 * wk + p.lookPitch + p.leap * 0.2, p.lookYaw, s * -0.06 * wk - p.lookYaw * 0.1);
    ears.forEach((ear, i) => {
      const flick = Math.max(0, Math.sin(t * 0.9 + i * 2.1) - 0.93) * 8;
      const sx = i ? 1 : -1;
      ear.rotation.z = -sx * (0.32 + flick * 0.3);
      ear.rotation.x = -0.06 - bob * 0.04 * wk;
    });
    eyes.forEach(({ eye, pupil }) => {
      eye.scale.y = 1 - 0.92 * p.blink;
      pupil.position.set(clamp(0.012 + p.eyeX, -0.045, 0.045), clamp(p.eyeY, -0.045, 0.045), 0.05);
    });

    marks.forEach((m, i) => {
      m.visible = p.marks > 0.02;
      m.scale.setScalar(p.marks * (1 + 0.1 * Math.sin(t * 3 + i * 1.7)));
    });
    pawList.forEach((g) => g.scale.setScalar(Math.max(0.001, p.paw)));
    laptop.visible = ty > 0.02;
    laptop.scale.setScalar(Math.max(0.001, ty));
    buttonTop.position.y = 0.13 - 0.045 * p.press;
  }

  return { root, paws, button, shadow, pose, inkT, creamT, hitBody: [skull, torso, ...earCones], hitHead: [skull, ...earCones] };
}
