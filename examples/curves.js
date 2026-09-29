import { vec3 } from "pex-math";
import random from "pex-random";

const TAU = Math.PI * 2;
const UNIT_BOX = [
  [-0.5, -0.5, -0.5],
  [0.5, 0.5, 0.5],
];

function line(start, end) {
  const length = vec3.distance(start, end);
  return {
    length,
    at: (s) => vec3.lerp([...start], end, length && s / length),
  };
}

// Arc tangent to `d1` at `start`, turning by `angle` towards `d2`
function arc(start, d1, d2, radius, angle) {
  const n = vec3.normalize(vec3.addScaled([...d2], d1, -vec3.dot(d1, d2)));
  const center = vec3.addScaled([...start], n, radius);
  return {
    length: radius * angle,
    at: (s) => {
      const phi = s / radius;
      const p = vec3.addScaled([...center], n, -radius * Math.cos(phi));
      return vec3.addScaled(p, d1, radius * Math.sin(phi));
    },
  };
}

// Straight segments joined by circular fillets, parametrised by arc length
function roundedPolyline(points, radius) {
  const pieces = [];
  let start = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const corner = points[i];
    const d1 = vec3.normalize(vec3.sub([...corner], points[i - 1]));
    const d2 = vec3.normalize(vec3.sub([...points[i + 1]], corner));
    const angle = Math.acos(Math.min(1, vec3.dot(d1, d2)));
    const offset = radius * Math.tan(angle / 2);
    const arcStart = vec3.addScaled([...corner], d1, -offset);
    pieces.push(line(start, arcStart));
    if (angle > 0) pieces.push(arc(arcStart, d1, d2, radius, angle));
    start = vec3.addScaled([...corner], d2, offset);
  }
  pieces.push(line(start, points.at(-1)));

  const length = pieces.reduce((sum, piece) => sum + piece.length, 0);
  return (u) => {
    let s = u * length;
    for (const piece of pieces) {
      if (s <= piece.length) return piece.at(s);
      s -= piece.length;
    }
    return pieces.at(-1).at(pieces.at(-1).length);
  };
}

// Uniform Catmull-Rom spline: evenly spread u, unevenly spaced positions
function catmullRom(points) {
  const padded = [points[0], ...points, points.at(-1)];
  const segments = points.length - 1;
  return (u) => {
    const i = Math.min(Math.floor(u * segments), segments - 1);
    const t = u * segments - i;
    const [p0, p1, p2, p3] = padded.slice(i, i + 4);
    return [0, 1, 2].map(
      (k) =>
        0.5 *
        (2 * p1[k] +
          (p2[k] - p0[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
          (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t),
    );
  };
}

const createTorusKnot =
  (p, q, radius = 1, tube = 0.4) =>
  (u) => {
    const t = TAU * u;
    const r = radius + tube * Math.cos(q * t);
    return [r * Math.cos(p * t), tube * Math.sin(q * t), r * Math.sin(p * t)];
  };

const freeform = (() => {
  const rng = random.create(7);
  const terms = [1, 2, 3, 5].map((f) => ({
    f,
    a: rng.vec3InAABB(UNIT_BOX),
    b: rng.vec3InAABB(UNIT_BOX),
  }));
  return (u) =>
    terms.reduce(
      (p, { f, a, b }) =>
        vec3.addScaled(
          vec3.addScaled(p, a, (Math.cos(TAU * f * u) * 2) / f),
          b,
          (Math.sin(TAU * f * u) * 2) / f,
        ),
      [0, 0, 0],
    );
})();

const catmullRomPath = (() => {
  const rng = random.create(11);
  return catmullRom(
    Array.from({ length: 8 }, () =>
      rng.vec3InAABB([
        [-2, -2, -2],
        [2, 2, 2],
      ]),
    ),
  );
})();

// Curves parametrised over u ∈ [0, 1]
const curves = {
  torusKnot: (u) => {
    const t = TAU * u;
    return [
      (10 * (Math.cos(t) + Math.cos(3 * t)) +
        Math.cos(2 * t) +
        Math.cos(4 * t)) /
        10,
      (6 * Math.sin(t) + 10 * Math.sin(3 * t)) / 10,
      (4 * Math.sin(3 * t) * Math.sin((5 * t) / 2) +
        4 * Math.sin(4 * t) -
        2 * Math.sin(6 * t)) /
        10,
    ];
  },
  helix: (u) => {
    const t = 4 * TAU * u;
    return [Math.cos(t), 0.1 * t, Math.sin(t)];
  },
  circle: (u) => [Math.cos(TAU * u), Math.sin(TAU * u), 0],
  sinWave: (u) => {
    const t = TAU * u;
    return [4 * u - 2, Math.sin(t), Math.cos(2 * t) / 2];
  },

  // Frenet flips at the inflection point, Bishop doesn't
  cubic: (u) => {
    const x = 2 * u - 1;
    return [2 * x, 2 * x ** 3, 0];
  },
  // Frenet is undefined along straight parts
  lineArcLine: roundedPolyline(
    [
      [-1.5, 1, 0],
      [1, 1, 0],
      [1, -1.5, 0],
    ],
    1,
  ),
  pipe: roundedPolyline(
    [
      [-1.5, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [1, 1, -1],
      [-1, 1, -1],
    ],
    0.3,
  ),

  // Bishop twist left over at closure
  trefoil: (u) => {
    const t = TAU * u;
    return [
      Math.sin(t) + 2 * Math.sin(2 * t),
      Math.cos(t) - 2 * Math.cos(2 * t),
      -Math.sin(3 * t),
    ];
  },
  viviani: (u) => {
    const t = TAU * u;
    return [1 + Math.cos(t), Math.sin(t), 2 * Math.sin(t / 2)];
  },
  cinquefoil: createTorusKnot(2, 5),
  lissajous: (u) => {
    const t = TAU * u;
    return [Math.sin(3 * t), Math.sin(4 * t), Math.sin(5 * t)];
  },
  // Stays on the unit sphere when a + b = 1
  seam: (u) => {
    const t = TAU * u;
    const [a, b] = [0.65, 0.35];
    return [
      a * Math.cos(t) + b * Math.cos(3 * t),
      a * Math.sin(t) - b * Math.sin(3 * t),
      2 * Math.sqrt(a * b) * Math.sin(2 * t),
    ];
  },
  freeform,

  // Varying curvature and torsion
  spiral: (u) => {
    const t = 3 * TAU * u;
    const r = 0.2 + 2 * u;
    return [r * Math.cos(t), 2 * u * u, r * Math.sin(t)];
  },
  loxodrome: (u) => {
    const t = 3 * Math.PI * (2 * u - 1);
    const a = 0.3;
    return [
      Math.cos(t) / Math.cosh(a * t),
      Math.tanh(a * t),
      Math.sin(t) / Math.cosh(a * t),
    ];
  },
  coil: (u) => {
    const t = 6 * TAU * u;
    return [0.6 * Math.cos(t), 3 * u ** 3, 0.6 * Math.sin(t)];
  },

  // Tangent methods stress tests
  tightLoops: (u) => {
    const t = TAU * u;
    return [
      4 * u + 0.6 * Math.cos(12 * t),
      0.6 * Math.sin(12 * t),
      0.3 * Math.sin(3 * t),
    ];
  },
  catmullRom: catmullRomPath,
};

export { curves };
