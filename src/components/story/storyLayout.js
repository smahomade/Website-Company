/* The home story's framing for a w × h stage, in plain maths (no three.js), shared by
   the 3D scene (storyScene) and the picture that stands in for it while it loads
   (ScrollStory), so the two line up exactly. */

export const TAN_HALF = Math.tan((16 * Math.PI) / 180); /* half the camera's 32° field of view */
export const FH = 2.9; /* folder back panel height (folder units) */
export const FOLDER_SCALE = 0.85;

/* portrait: upright frame; D: camera distance; S: sideways offset that leaves room for the
   copy; liftY: how far the camera drops on upright screens (the copy sits at the bottom). */
export function storyLayout(w, h) {
  const aspect = w / h;
  if (aspect < 0.95) {
    /* the bottom copy block takes a share of the height; frame the 3D in what's left */
    const r = Math.min(0.58, 360 / h);
    const band = 1 - r - 0.06;
    const D = Math.max(13, 9.76 / aspect, 8.5 / band);
    return { portrait: true, D, S: 0, liftY: D * TAN_HALF * Math.max(0.15, r - 0.12) };
  }
  /* Below 1.45:1 the copy leaves too little room beside the stage, so the camera pulls back
     to keep the 1.45:1 half-width. Very wide screens cap S so copy and scene don't drift
     into two halves. */
  const D = 13 * Math.max(1, 1.45 / aspect);
  const halfW = D * TAN_HALF * aspect;
  const k = Math.min(1, Math.max(0, (aspect - 1.3) / 0.4));
  return { portrait: false, D, S: Math.min(halfW * (0.46 - 0.06 * k), 3.2), liftY: 0 };
}

/* Where the folder stands on screen as the story opens (t = 0, as storyScene poses it): the
   middle of its fold and its height, in CSS px. */
export function introFolder(w, h) {
  const { D, S, liftY } = storyLayout(w, h);
  const aspect = w / h;
  /* the camera: at (S·0.12, 1.85 − liftY, D), looking at (S·0.18, 1.55 − liftY, 0) */
  const cam = [S * 0.12, 1.85 - liftY, D];
  const f = norm([S * 0.18 - cam[0], 1.55 - liftY - cam[1], -cam[2]]);
  const r = norm([-f[2], 0, f[0]]); /* f × up */
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const onScreen = (p) => {
    const d = [p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]];
    const z = dot(d, f);
    return [(dot(d, r) / (z * TAN_HALF * aspect) / 2 + 0.5) * w, (0.5 - dot(d, u) / (z * TAN_HALF) / 2) * h];
  };
  /* the folder: at (S, 0.2, 0), tipped back 0.06 about x; its top edge FH up */
  const top = FH * FOLDER_SCALE;
  const base = onScreen([S, 0.2, 0]);
  const peak = onScreen([S, 0.2 + top * Math.cos(0.06), top * Math.sin(0.06)]);
  return { x: base[0], y: base[1], h: base[1] - peak[1] };
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
