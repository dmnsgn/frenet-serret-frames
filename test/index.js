import test from "node:test";
import assert from "node:assert/strict";

import computePathTangents from "path-tangents";
import { avec3, vec3 } from "pex-math";
import random from "pex-random";
import frenetSerretFrames from "../index.js";
import { reject, signedAngle, transport, curves, sample } from "./utils.js";

const MODES = ["bishop", "frenet"];
const TANGENTS = ["forward", "uniform", "centripetal", "chordal"];

const deepAlmostEqual = (a, b, epsilon = 1e-6) => {
  assert.equal(a.length, b.length, `${a} != ${b}`);
  for (let i = 0; i < a.length; i++) {
    assert.ok(
      Number.isFinite(a[i]) && Math.abs(a[i] - b[i]) <= epsilon,
      `[${i}] ${a[i]} != ${b[i]} (±${epsilon})`,
    );
  }
};

const assertOrthonormal = (geometry, epsilon = 1e-6) =>
  geometry.normals.forEach((n, i) => {
    const t = geometry.tangents[i];
    const b = geometry.binormals[i];
    for (const v of [t, n, b]) {
      assert.ok(v.every(Number.isFinite), `frame ${i} not finite`);
      assert.ok(Math.abs(vec3.dot(v, v) - 1) < epsilon, `frame ${i} not unit`);
    }
    assert.ok(Math.abs(vec3.dot(t, n)) < epsilon, `frame ${i} t·n != 0`);
    assert.ok(Math.abs(vec3.dot(t, b)) < epsilon, `frame ${i} t·b != 0`);
    assert.ok(Math.abs(vec3.dot(n, b)) < epsilon, `frame ${i} n·b != 0`);
    assert.ok(
      vec3.dot(vec3.cross([...t], n), b) > 1 - epsilon,
      `frame ${i} not right-handed`,
    );
  });

test("should return the same values for TypedArray or Array of vec3", () => {
  for (const [name, curve] of Object.entries(curves)) {
    // Rounded to Float32 so both inputs hold the same positions
    const flat = new Float32Array(sample(curve, 60).flat());
    const positions = Array.from({ length: flat.length / 3 }, (_, i) =>
      Array.from(flat.subarray(i * 3, i * 3 + 3)),
    );
    for (const method of [undefined, ...TANGENTS]) {
      for (const mode of MODES) {
        for (const closed of [false, true]) {
          const tangents = (p) =>
            method && computePathTangents(p, { closed, method });
          const a = frenetSerretFrames(
            { positions: flat, tangents: tangents(flat) },
            { mode, closed },
          );
          const b = frenetSerretFrames(
            { positions, tangents: tangents(positions) },
            { mode, closed },
          );
          for (const key of ["tangents", "normals", "binormals"]) {
            deepAlmostEqual(a[key], b[key].flat(), 1e-5);
          }
        }
      }
    }
  }
});

test("should write into provided arrays", () => {
  const normals = new Float32Array(10 * 3);
  const geometry = frenetSerretFrames({
    positions: new Float32Array(sample(curves.helix, 10).flat()),
    normals,
  });
  assert.equal(geometry.normals, normals);
  assert.ok(normals.some((x) => x !== 0));
});

test("should compute orthonormal frames", () => {
  for (const [name, curve] of Object.entries(curves)) {
    for (const mode of MODES) {
      for (const closed of [false, true]) {
        const geometry = frenetSerretFrames(
          { positions: sample(curve, 40) },
          { mode, closed },
        );
        assert.doesNotThrow(() => assertOrthonormal(geometry), name);
      }
    }
  }
});

test("bishop: should respect the initial normal", () => {
  const initialNormal = [0, 0, 1];
  const { tangents, normals } = frenetSerretFrames(
    { positions: sample(curves.sinWave, 20) },
    { initialNormal },
  );
  deepAlmostEqual(
    normals[0],
    vec3.normalize(reject(initialNormal, tangents[0])),
  );
});

test("bishop: should match the analytic helix twist at 4th order with exact tangents", () => {
  // Helix (cos t, c·t, sin t): the frame rotates against the Frenet frame at a
  // constant rate c / √(1 + c²) per unit of t.
  const c = 0.1;
  const rate = c / Math.hypot(1, c);
  const error = (count) => {
    const ts = Array.from(
      { length: count },
      (_, i) => (8 * Math.PI * i) / (count - 1),
    );
    const tangents = ts.map((t) =>
      vec3.normalize([-Math.sin(t), c, Math.cos(t)]),
    );
    const geometry = frenetSerretFrames({
      positions: ts.map((t) => [Math.cos(t), c * t, Math.sin(t)]),
      tangents,
    });
    const angles = geometry.normals.map((n, i) =>
      signedAngle([-Math.cos(ts[i]), 0, -Math.sin(ts[i])], n, tangents[i]),
    );
    return Math.max(
      ...angles.map((a, i) => {
        const d = a - angles[0] - rate * ts[i];
        return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
      }),
    );
  };

  assert.ok(error(100) < 1e-6, `${error(100)}`);
  assert.ok(error(50) / error(100) > 12, "not 4th order");
});

test("bishop: should close seamlessly with an even twist along the curve", () => {
  // Exclude u = 1: it would duplicate the first point
  const positions = Array.from({ length: 50 }, (_, i) =>
    curves.torusKnot(i / 50),
  );
  const size = positions.length;

  // Multiples of 2π keep the frames closed
  for (const twist of [0, 4 * Math.PI]) {
    const { tangents, normals } = frenetSerretFrames(
      { positions },
      { closed: true, twist },
    );

    // Residual twist of each segment, closing one included, per unit length
    const rates = positions.map((x0, i) => {
      const j = (i + 1) % size;
      const transported = transport(
        normals[i],
        tangents[i],
        tangents[j],
        x0,
        positions[j],
      );
      return (
        signedAngle(transported, normals[j], tangents[j]) /
        vec3.distance(positions[j], x0)
      );
    });
    rates.forEach((rate) =>
      assert.ok(Math.abs(rate - rates[0]) < 1e-6, `${twist}`),
    );
  }
});

test("bishop: should keep a constant frame along straight lines", () => {
  const { normals } = frenetSerretFrames({
    positions: [0, 0.1, 0.15, 2, 2.01, 5].map((x) => [x, 2 * x, -x]),
  });
  normals.forEach((n) => deepAlmostEqual(n, normals[0]));
});

test("frenet: should point towards the helix axis", () => {
  const count = 100;
  const ts = Array.from(
    { length: count },
    (_, i) => (8 * Math.PI * i) / (count - 1),
  );
  // Exact tangents: estimated ones are least accurate at open ends
  const { normals } = frenetSerretFrames(
    {
      positions: ts.map((t) => [Math.cos(t), 0.1 * t, Math.sin(t)]),
      tangents: ts.map((t) => vec3.normalize([-Math.sin(t), 0.1, Math.cos(t)])),
    },
    { mode: "frenet" },
  );
  // Open ends borrow the curvature direction of their neighbour
  normals.forEach((n, i) =>
    deepAlmostEqual(
      n,
      [-Math.cos(ts[i]), 0, -Math.sin(ts[i])],
      i === 0 || i === count - 1 ? 3e-2 : 1e-6,
    ),
  );
});

test("frenet: should flip at inflection points where bishop does not", () => {
  // Planar S curve: curvature changes sign at x = 0
  const positions = Array.from({ length: 41 }, (_, i) => {
    const x = -1 + i / 20;
    return [x, x * x * x, 0];
  });
  const flips = (mode) => {
    const { normals } = frenetSerretFrames({ positions }, { mode });
    return normals.slice(1).filter((n, i) => vec3.dot(n, normals[i]) < 0)
      .length;
  };
  assert.equal(flips("frenet"), 1);
  assert.equal(flips("bishop"), 0);
});

test("frenet: should transport frames over straight parts", () => {
  // Straight lead-in, quarter circle, straight lead-out
  const positions = [
    ...[-3, -2, -1].map((x) => [x, 1, 0]),
    ...Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI / 2 - (Math.PI / 2) * (i / 8);
      return [Math.cos(a), Math.sin(a), 0];
    }),
    ...[1, 2, 3].map((y) => [1, -y, 0]),
  ];
  const { normals } = frenetSerretFrames({ positions }, { mode: "frenet" });
  // Towards the circle centre on the arc, unchanged along the straight parts
  deepAlmostEqual(normals[7], vec3.normalize([-1, -1, 0]), 1e-2);
  deepAlmostEqual(normals[0], normals[2]);
  deepAlmostEqual(normals.at(-1), normals.at(-3));
});

test("frenet: should fall back to bishop on straight lines", () => {
  const positions = [0, 1, 2, 3].map((x) => [x, x, x]);
  assert.deepEqual(
    frenetSerretFrames(
      { positions: positions.map((p) => [...p]) },
      { mode: "frenet" },
    ).normals,
    frenetSerretFrames({ positions: positions.map((p) => [...p]) }).normals,
  );
});

test("should handle degenerate paths", () => {
  const paths = {
    empty: [],
    single: [[1, 2, 3]],
    two: [
      [0, 0, 0],
      [0, 1, 0],
    ],
    duplicates: [
      [0, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1],
    ],
    fold: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [1, 0, 0],
      [0, 0, 0],
    ],
    triangle: [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
    ],
    coincident: [
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ],
  };
  for (const [name, positions] of Object.entries(paths)) {
    for (const mode of MODES) {
      for (const closed of [false, true]) {
        const geometry = frenetSerretFrames(
          { positions: positions.map((p) => [...p]) },
          { mode, closed },
        );
        assert.equal(geometry.normals.length, positions.length, name);
        for (const key of ["normals", "binormals"]) {
          geometry[key].forEach((v) =>
            assert.ok(v.every(Number.isFinite), `${name} ${mode} ${key}`),
          );
        }
        if (name === "coincident") {
          geometry.normals.forEach((n) => deepAlmostEqual(n, [0, 0, -1]));
        } else if (positions.length > 1) {
          assert.doesNotThrow(
            () => assertOrthonormal(geometry),
            `${name} ${mode}`,
          );
        }
      }
    }
  }
});

test("bishop: should rotate, not mirror, frames at duplicated points", () => {
  const { normals } = frenetSerretFrames(
    {
      positions: [
        [0, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
      ],
      tangents: [
        [1, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    },
    { initialNormal: [0, Math.SQRT1_2, Math.SQRT1_2] },
  );
  deepAlmostEqual(normals[2], [-Math.SQRT1_2, 0, Math.SQRT1_2]);
  deepAlmostEqual(normals[3], normals[2]);
});

test("bishop: should keep frames when tangents are perpendicular to the segment", () => {
  const { normals } = frenetSerretFrames(
    {
      positions: [
        [0, 0, 0],
        [1, 0, 0],
      ],
      tangents: [
        [0, 1, 0],
        [0, 1, 0],
      ],
    },
    { initialNormal: [Math.SQRT1_2, 0, Math.SQRT1_2] },
  );
  deepAlmostEqual(normals[1], normals[0]);
});

test("bishop: should not depend on the geometry scale", () => {
  const positions = sample(curves.helix, 40);
  const reference = frenetSerretFrames({
    positions: positions.map((p) => [...p]),
  }).normals;
  for (const scale of [1e-150, 1e-9, 1e9, 1e150]) {
    frenetSerretFrames({
      positions: positions.map((p) => p.map((x) => x * scale)),
    }).normals.forEach((n, i) => deepAlmostEqual(n, reference[i], 1e-6));
  }
});

test("bishop: should make the initial normal orthonormal", () => {
  const geometry = frenetSerretFrames(
    {
      positions: [
        [0, 0, 0],
        [1, 0, 0],
        [2, 1, 0],
      ],
    },
    { initialNormal: [1, 1, 0] },
  );
  assertOrthonormal(geometry);
  deepAlmostEqual(
    geometry.normals[0],
    vec3.normalize(reject([1, 1, 0], geometry.tangents[0])),
  );
});

test("should write into provided arrays of vec3", () => {
  const normals = Array.from({ length: 10 }, () => [0, 0, 0]);
  const first = normals[0];
  const geometry = frenetSerretFrames({
    positions: sample(curves.helix, 10),
    normals,
  });
  assert.equal(geometry.normals, normals);
  assert.equal(geometry.normals[0], first);
  assertOrthonormal(geometry);
});

test("should accept tangents in another layout than positions", () => {
  const positions = sample(curves.helix, 20);
  const tangents = computePathTangents(positions);
  const expected = frenetSerretFrames({ positions, tangents }).normals;
  const { normals } = frenetSerretFrames({
    positions: new Float32Array(positions.flat()),
    tangents,
  });
  deepAlmostEqual(normals, expected.flat(), 1e-5);
});

test("should output the flat layout of the positions", () => {
  const positions = sample(curves.helix, 10).flat();
  const cases = [
    [new Float64Array(positions), Float64Array],
    [new Float32Array(positions), Float32Array],
    [positions, Float32Array],
  ];
  for (const [input, ArrayType] of cases) {
    const geometry = frenetSerretFrames({ positions: input });
    for (const key of ["tangents", "normals", "binormals"]) {
      assert.ok(geometry[key] instanceof ArrayType, key);
    }
  }
});

test("should reuse tangents until deleted", () => {
  const geometry = frenetSerretFrames({ positions: sample(curves.helix, 10) });
  const { tangents } = geometry;
  geometry.positions = sample(curves.viviani, 10);
  assert.equal(frenetSerretFrames(geometry).tangents, tangents);
  delete geometry.tangents;
  assert.notEqual(frenetSerretFrames(geometry).tangents, tangents);
});

test("bishop: should default to an axis not aligned with the first tangent", () => {
  const expected = [
    [
      [1, 0, 0],
      [0, 0, -1],
    ],
    [
      [0, 1, 0],
      [-1, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, -1, 0],
    ],
    [
      [0.9, 1, 0],
      [-0.743294, 0.668965, 0],
    ],
    [
      [-1, 2, 3],
      [-0.169031, -0.845154, 0.507093],
    ],
  ];
  for (const [direction, normal] of expected) {
    const t = vec3.normalize([...direction]);
    const { normals } = frenetSerretFrames({
      positions: [[0, 0, 0], t],
      tangents: [t, t],
    });
    deepAlmostEqual(normals[0], normal);
  }
});

test("bishop: should ignore an initial normal parallel to the tangent or zero", () => {
  const positions = sample(curves.sinWave, 20);
  const expected = frenetSerretFrames({ positions }).normals;
  const tangent = computePathTangents(positions)[0];
  for (const initialNormal of [
    [0, 0, 0],
    tangent,
    vec3.scale([...tangent], -3),
  ]) {
    const geometry = frenetSerretFrames({ positions }, { initialNormal });
    assertOrthonormal(geometry);
    geometry.normals.forEach((n, i) => deepAlmostEqual(n, expected[i]));
  }
});

test("bishop: should not flip near a degenerate second reflection", () => {
  // Both cases of Wang et al. 2008, §4.4 for a chord along x, in the xy plane
  const s = Math.SQRT1_2;
  const cases = [
    // Chord perpendicular to equal tangents
    { t0: [0, 1, 0], t1: [0, 1, 0], initialNormal: [s, 0, s] },
    // Second tangent mirroring the first across the bisecting plane
    { t0: [s, s, 0], t1: [-s, s, 0], initialNormal: [0, 0, 1] },
  ];
  for (const { t0, t1, initialNormal } of cases) {
    for (const epsilon of [0, 1e-9, 1e-7, 1e-5, 1e-3]) {
      const { normals } = frenetSerretFrames(
        {
          positions: [
            [0, 0, 0],
            [1, 0, 0],
          ],
          tangents: [t0, vec3.normalize([t1[0], t1[1], epsilon])],
        },
        { initialNormal },
      );
      assert.ok(vec3.dot(normals[1], initialNormal) > 0.99, `${t1} ${epsilon}`);
    }
  }
});

test("bishop: should keep the normal on reversed tangents", () => {
  const initialNormal = [0, Math.SQRT1_2, Math.SQRT1_2];
  const geometry = frenetSerretFrames(
    {
      positions: [
        [0, 0, 0],
        [1, 0, 0],
      ],
      tangents: [
        [1, 0, 0],
        [-1, 0, 0],
      ],
    },
    { initialNormal },
  );
  assertOrthonormal(geometry);
  deepAlmostEqual(geometry.normals[1], initialNormal);
});

test("should close seamlessly when the last point duplicates the first", () => {
  // Sampled up to u = 1: the last point is within rounding of the first
  const positions = Array.from({ length: 51 }, (_, i) =>
    curves.torusKnot(i / 50),
  );
  const duplicated = [...positions.slice(0, -1), positions[0]];
  for (const mode of MODES) {
    for (const input of [positions, duplicated]) {
      const { normals } = frenetSerretFrames(
        { positions: input },
        { mode, closed: true },
      );
      deepAlmostEqual(normals.at(-1), normals[0], 1e-6);
    }
  }
});

test("frenet: should treat Float32 rounding far from the origin as straight", () => {
  const positions = new Float32Array(
    Array.from({ length: 200 }, (_, i) =>
      [3, 2, -1].map((x) => 1000 + x * i * 0.01),
    ).flat(),
  );
  const { normals } = frenetSerretFrames({ positions }, { mode: "frenet" });
  for (let i = 1; i < 200; i++) {
    assert.ok(avec3.dot(normals, i, normals, 0) > 0.99, `${i}`);
  }
});

test("frenet: should detect small turns of large or densely sampled curves", () => {
  const arc = (radius, count, step) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i * step) / radius;
      return [radius * Math.cos(a), 0, radius * Math.sin(a)];
    });
  for (const positions of [arc(1e6, 100, 1), arc(1, 100, 1e-6)]) {
    const { normals } = frenetSerretFrames({ positions }, { mode: "frenet" });
    // Towards the circle centre
    normals.forEach((n, i) =>
      assert.ok(
        vec3.dot(n, vec3.normalize(vec3.scale([...positions[i]], -1))) >
          1 - 1e-6,
        `${i}`,
      ),
    );
  }
});

test("bishop: should add the twist proportionally to arc length", () => {
  const positions = sample(curves.torusKnot, 60).slice(0, -1);
  const twist = 5;
  for (const closed of [false, true]) {
    const reference = frenetSerretFrames({ positions }, { closed });
    const { normals } = frenetSerretFrames({ positions }, { closed, twist });
    let length = 0;
    const totalLength =
      positions.reduce(
        (sum, x, i) => sum + (i ? vec3.distance(x, positions[i - 1]) : 0),
        0,
      ) + (closed ? vec3.distance(positions.at(-1), positions[0]) : 0);
    normals.forEach((n, i) => {
      if (i) length += vec3.distance(positions[i], positions[i - 1]);
      const angle = signedAngle(reference.normals[i], n, reference.tangents[i]);
      const d = angle - (twist * length) / totalLength;
      assert.ok(
        Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < 1e-9,
        `${closed} ${i}`,
      );
    });
  }
});

test("bishop: should end on the final normal of open paths", () => {
  const positions = sample(curves.torusKnot, 60);
  const reference = frenetSerretFrames({ positions });
  const lastTangent = reference.tangents.at(-1);
  const finalNormal = [0.3, -0.8, 0.5];
  const expected = vec3.normalize(reject([...finalNormal], lastTangent));
  const endAngle = signedAngle(reference.normals.at(-1), expected, lastTangent);
  const lengths = positions.map((x, i) =>
    positions
      .slice(1, i + 1)
      .reduce((sum, y, j) => sum + vec3.distance(y, positions[j]), 0),
  );

  for (const twist of [0, 2 * Math.PI, -4 * Math.PI]) {
    const geometry = frenetSerretFrames({ positions }, { finalNormal, twist });
    assertOrthonormal(geometry);
    deepAlmostEqual(geometry.normals.at(-1), expected, 1e-9);

    // Smallest rotation to the final normal, plus whole turns, along the arc
    geometry.normals.forEach((n, i) => {
      const angle = signedAngle(reference.normals[i], n, reference.tangents[i]);
      const d = angle - ((endAngle + twist) * lengths[i]) / lengths.at(-1);
      assert.ok(Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < 1e-9, `${i}`);
    });
  }
});

test("bishop: should ignore a final normal parallel to the tangent, zero or on closed paths", () => {
  const positions = sample(curves.torusKnot, 60).slice(0, -1);
  const lastTangent = frenetSerretFrames({ positions }).tangents.at(-1);
  for (const closed of [false, true]) {
    const { normals } = frenetSerretFrames({ positions }, { closed });
    for (const finalNormal of [
      [0, 0, 0],
      vec3.scale([...lastTangent], -2),
      ...(closed ? [[0.3, -0.8, 0.5]] : []),
    ]) {
      const geometry = frenetSerretFrames(
        { positions },
        { closed, finalNormal },
      );
      deepAlmostEqual(geometry.normals.flat(), normals.flat(), 1e-12);
    }
  }
});

test("should output orthonormal frames on random degenerate paths", () => {
  const rng = random.create(9);
  const generators = [
    () => rng.vec3(),
    (points) => (points.length && rng.chance(0.5) ? points.at(-1) : rng.vec3()),
    () => vec3.scale([1, 2, -1], rng.float()),
    () => [rng.int(0, 2), rng.int(0, 2), 0],
    () => [1e4 + rng.float(0, 1e-3), rng.float(0, 1e-3), 0],
  ];
  const toVec3Array = (a) =>
    Array.from({ length: a.length / 3 }, (_, i) => [
      ...a.slice(i * 3, i * 3 + 3),
    ]);

  for (let trial = 0; trial < 500; trial++) {
    const generate = generators[trial % generators.length];
    const points = [];
    for (let i = rng.int(2, 8); i > 0; i--) points.push([...generate(points)]);

    for (const mode of MODES) {
      for (const closed of [false, true]) {
        for (const positions of [points, new Float32Array(points.flat())]) {
          const geometry = frenetSerretFrames(
            { positions },
            {
              closed,
              mode,
              initialNormal: rng.chance(0.3) ? rng.vec3() : null,
              finalNormal: rng.chance(0.3) ? rng.vec3() : null,
              twist: rng.chance(0.3) ? rng.float(-10, 10) : 0,
            },
          );
          const isFlat = !Array.isArray(geometry.normals);
          const frames = {
            tangents: isFlat
              ? toVec3Array(geometry.tangents)
              : geometry.tangents,
            normals: isFlat ? toVec3Array(geometry.normals) : geometry.normals,
            binormals: isFlat
              ? toVec3Array(geometry.binormals)
              : geometry.binormals,
          };
          // Coincident points have no tangent
          if (frames.tangents.every((t) => vec3.length(t) > 0.5)) {
            // Float32 outputs round unit tangents
            assertOrthonormal(frames, isFlat ? 1e-5 : 1e-6);
          }
        }
      }
    }
  }
});
