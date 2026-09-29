import { vec3 } from "pex-math";
import random from "pex-random";

import { curves as allCurves } from "../examples/curves.js";

export const reject = (a, axis) =>
  vec3.addScaled([...a], axis, -vec3.dot(a, axis));

// Angle rotating a onto b around axis
export const signedAngle = (a, b, axis) =>
  Math.atan2(vec3.dot(vec3.cross([...a], b), axis), vec3.dot(a, b));

const reflect = (a, v) =>
  vec3.addScaled([...a], v, (-2 * vec3.dot(v, a)) / vec3.dot(v, v));

// Normal transported one step with double reflection
export const transport = (n, t0, t1, x0, x1) => {
  const v1 = vec3.sub([...x1], x0);
  const v2 = vec3.sub([...t1], reflect(t0, v1));
  return vec3.normalize(reflect(reflect(n, v1), v2));
};

// Curves the accuracy results are measured against
export const curves = {
  helix: allCurves.helix,
  torusKnot: allCurves.torusKnot,
  sinWave: allCurves.sinWave,
  viviani: allCurves.viviani,
  trefoil: allCurves.trefoil,
  spiral: allCurves.spiral,
  freeform: allCurves.freeform,
  tightLoops: allCurves.tightLoops,
};

const TAU = Math.PI * 2;

// Sample parameters over [0, 1]
export const samplings = {
  uniform: (count) => Array.from({ length: count }, (_, i) => i / (count - 1)),
  jitter: (count) => {
    const rng = random.create(3);
    return Array.from(
      { length: count },
      (_, i) =>
        (i + (i === 0 || i === count - 1 ? 0 : rng.float(-0.4, 0.4))) /
        (count - 1),
    );
  },
  clustered: (count) =>
    Array.from({ length: count }, (_, i) => {
      const u = i / (count - 1);
      return u - 0.144 * Math.sin(TAU * u);
    }),
};

export const sample = (curve, count, sampling = samplings.uniform) =>
  sampling(count).map(curve);

export const curveTangent = (curve, u, h = 1e-6) =>
  vec3.normalize(vec3.sub(curve(u + h), curve(u - h)));
