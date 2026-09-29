import { avec3 } from "pex-math";
import computePathTangents, {
  computeNeighbours,
  setDelta,
} from "path-tangents";

const X_AXIS = [1, 0, 0];
const Y_AXIS = [0, 1, 0];
const Z_AXIS = [0, 0, 1];

// v₂ = tᵢ₊₁ − R₁tᵢ has |v₂|² ≈ 4 on sampled curves and vanishes where R₂ is
// undefined (Wang et al. 2008, §4.4): its direction, hence the frame, is then
// set by rounding errors. Accuracy is unchanged from 1e-12 to 1e-2.
const DEGENERATE_V2_SQ = 1e-6;

// Turns below this many rounding errors of the positions are noise.
const FRENET_NOISE = 4;
const FLOAT32_EPSILON = 2 ** -23;

// Temporary vectors reused to avoid allocations.
// v₁, v₂ and tᴸ follow Wang et al. 2008.
const TEMP_AVEC3 = new Float64Array(5 * 3);
const [V1, V2, TANGENT_L, END_NORMAL, CROSS] = [0, 1, 2, 3, 4];

function toFlatArray(array) {
  if (!array[0]?.length) return array;
  const flat = new Float64Array(array.length * 3);
  array.forEach((v, i) => avec3.set(flat, i, v, 0));
  return flat;
}

function fromFlatArray(flat, size, ArrayConstructor, out) {
  const isFlatArray = ArrayConstructor !== Array;
  out ||= new ArrayConstructor(isFlatArray ? size * 3 : size);

  for (let i = 0; i < size; i++) {
    if (isFlatArray) {
      avec3.set(out, i, flat, i);
    } else {
      avec3.set((out[i] ||= [0, 0, 0]), 0, flat, i);
    }
  }
  return out;
}

// Remove the component of out[i] along the unit axes[j], leaving the part
// orthogonal to it.
function reject(out, i, axes, j) {
  avec3.addScaled(out, i, axes, j, -avec3.dot(out, i, axes, j));
}

// Mirror a[i] across the plane orthogonal to v[j], which needs no normalizing.
function reflect(a, i, v, j) {
  avec3.addScaled(
    a,
    i,
    v,
    j,
    (-2 * avec3.dot(v, j, a, i)) / avec3.lengthSq(v, j),
  );
}

// Any axis but the one most aligned with the tangent: at least 45° away.
function getReferenceAxis(tangents) {
  const x = Math.abs(tangents[0]);
  const y = Math.abs(tangents[1]);
  const z = Math.abs(tangents[2]);

  if (y > x && y >= z) return X_AXIS;
  return z > x && z >= y ? Y_AXIS : Z_AXIS;
}

function setInitialNormal(normals, tangents, initialNormal) {
  if (initialNormal) {
    avec3.set(normals, 0, initialNormal, 0);
    avec3.normalize(normals, 0);
    reject(normals, 0, tangents, 0);
  } else {
    // Clear leftovers of undefined Frenet normals
    normals.fill(0, 0, 3);
  }

  // Missing, zero or parallel to the tangent: t × (t × axis) = (t·axis)t − axis
  if (avec3.lengthSq(normals, 0) <= Number.EPSILON) {
    const axis = getReferenceAxis(tangents);
    avec3.set(normals, 0, tangents, 0);
    avec3.scale(normals, 0, avec3.dot(tangents, 0, axis, 0));
    avec3.sub(normals, 0, axis, 0);
  }

  avec3.normalize(normals, 0);
}

// Double reflection of the normal at `from` onto `to` across v₁ then v₂,
// written at out[i]. Returns false where either reflection is undefined or
// ill-conditioned.
function doubleReflect(out, i, normals, tangents, from, to) {
  if (!avec3.lengthSq(TEMP_AVEC3, V1)) return false;

  avec3.set(TEMP_AVEC3, TANGENT_L, tangents, from);
  reflect(TEMP_AVEC3, TANGENT_L, TEMP_AVEC3, V1);
  avec3.set(TEMP_AVEC3, V2, tangents, to);
  avec3.sub(TEMP_AVEC3, V2, TEMP_AVEC3, TANGENT_L);

  if (avec3.lengthSq(TEMP_AVEC3, V2) <= DEGENERATE_V2_SQ) return false;

  avec3.set(out, i, normals, from);
  reflect(out, i, TEMP_AVEC3, V1);
  reflect(out, i, TEMP_AVEC3, V2);

  return true;
}

// Transport the normal at `from` onto `to`, written at out[i], with the double
// reflection method. Where it degenerates, fall back to the rotation method
// (v₁ set to the tangent at `from`, Wang et al. 2008, §2.1), and keep the
// normal on reversed tangents where no rotation is minimal.
function transport(out, i, normals, tangents, positions, from, to) {
  setDelta(TEMP_AVEC3, V1, positions, from, to);

  if (!doubleReflect(out, i, normals, tangents, from, to)) {
    avec3.set(TEMP_AVEC3, V1, tangents, from);
    if (!doubleReflect(out, i, normals, tangents, from, to)) {
      avec3.set(out, i, normals, from);
    }
  }

  avec3.normalize(out, i);
}

function rotateAroundTangent(normals, tangents, i, angle) {
  avec3.set(TEMP_AVEC3, CROSS, tangents, i);
  avec3.cross(TEMP_AVEC3, CROSS, normals, i);
  avec3.scale(normals, i, Math.cos(angle));
  avec3.addScaled(normals, i, TEMP_AVEC3, CROSS, Math.sin(angle));
  avec3.normalize(normals, i);
}

// Angle from a[i] to b[j] around axes[k].
function signedAngle(a, i, b, j, axes, k) {
  avec3.set(TEMP_AVEC3, CROSS, a, i);
  avec3.cross(TEMP_AVEC3, CROSS, b, j);

  return Math.atan2(
    avec3.dot(TEMP_AVEC3, CROSS, axes, k),
    avec3.dot(a, i, b, j),
  );
}

// Minimal rotation from the last frame to the end condition (Wang et al. 2008,
// §6.3): the first frame for closed paths, transported back to the start, or
// the final normal for open ones.
function computeEndTwist(
  normals,
  tangents,
  positions,
  size,
  closed,
  finalNormal,
) {
  const last = size - 1;

  if (closed) {
    transport(TEMP_AVEC3, END_NORMAL, normals, tangents, positions, last, 0);
    return signedAngle(TEMP_AVEC3, END_NORMAL, normals, 0, tangents, 0);
  }

  if (!finalNormal) return 0;

  avec3.set(TEMP_AVEC3, END_NORMAL, finalNormal, 0);
  avec3.normalize(TEMP_AVEC3, END_NORMAL);
  reject(TEMP_AVEC3, END_NORMAL, tangents, last);

  // Zero or parallel to the tangent: no end condition.
  return avec3.lengthSq(TEMP_AVEC3, END_NORMAL) <= Number.EPSILON
    ? 0
    : signedAngle(normals, last, TEMP_AVEC3, END_NORMAL, tangents, last);
}

// Additional rotation proportional to arc length: minimal total squared
// angular speed (Wang et al. 2008, §6.3), even on uneven sampling.
function spreadTwist(normals, tangents, positions, size, closed, twist) {
  const lengths = new Float64Array(size);

  for (let i = 1; i < size; i++) {
    lengths[i] =
      lengths[i - 1] + avec3.distance(positions, i - 1, positions, i);
  }

  let totalLength = lengths[size - 1];

  if (closed) totalLength += avec3.distance(positions, size - 1, positions, 0);
  if (totalLength === 0) return;

  for (let i = 1; i < size; i++) {
    rotateAroundTangent(
      normals,
      tangents,
      i,
      (twist * lengths[i]) / totalLength,
    );
  }
}

function computeBishopNormals(
  normals,
  tangents,
  positions,
  size,
  closed,
  initialNormal,
  finalNormal,
  twist,
) {
  if (!size) return;

  setInitialNormal(normals, tangents, initialNormal);

  for (let i = 1; i < size; i++) {
    transport(normals, i, normals, tangents, positions, i - 1, i);
  }

  if (size < 2) return;

  const totalTwist =
    twist +
    computeEndTwist(normals, tangents, positions, size, closed, finalNormal);

  if (totalTwist) {
    spreadTwist(normals, tangents, positions, size, closed, totalTwist);
  }
}

const maxAbs = (a, i) =>
  Math.max(Math.abs(a[i * 3]), Math.abs(a[i * 3 + 1]), Math.abs(a[i * 3 + 2]));

// Discrete curvature direction: how the unit segment directions turn at a
// point, between its distinct neighbours. Open path ends borrow the turn of
// their neighbour. Returns false where the turn is below the rounding noise of
// the positions, which grows with their magnitude over the segment lengths.
function computeFrenetNormal(
  normals,
  tangents,
  positions,
  { prev, next },
  precision,
  i,
) {
  let center = i;
  if (prev[i] === -1) {
    center = next[i];
  } else if (next[i] === -1) {
    center = prev[i];
  }
  if (center === -1 || prev[center] === -1 || next[center] === -1) {
    return false;
  }

  setDelta(TEMP_AVEC3, V1, positions, prev[center], center);
  setDelta(TEMP_AVEC3, V2, positions, center, next[center]);

  const l1 = avec3.length(TEMP_AVEC3, V1);
  const l2 = avec3.length(TEMP_AVEC3, V2);

  avec3.scale(TEMP_AVEC3, V1, 1 / l1);
  avec3.scale(TEMP_AVEC3, V2, 1 / l2);

  avec3.set(normals, i, TEMP_AVEC3, V2);
  avec3.sub(normals, i, TEMP_AVEC3, V1);
  reject(normals, i, tangents, i);

  const magnitude = Math.max(
    maxAbs(positions, prev[center]),
    maxAbs(positions, center),
    maxAbs(positions, next[center]),
  );
  const noise = FRENET_NOISE * precision * magnitude * (1 / l1 + 1 / l2);
  if (avec3.length(normals, i) <= noise) return false;

  avec3.normalize(normals, i);

  return true;
}

// Frenet frames are undefined where the curve is straight: fill those points
// by transporting the nearest defined frame.
function computeFrenetNormals(
  normals,
  tangents,
  positions,
  size,
  closed,
  precision,
) {
  const neighbours = computeNeighbours(positions, size, closed);
  const defined = Array.from({ length: size }, (_, i) =>
    computeFrenetNormal(normals, tangents, positions, neighbours, precision, i),
  );
  const first = defined.indexOf(true);
  if (first === -1) {
    computeBishopNormals(
      normals,
      tangents,
      positions,
      size,
      closed,
      null,
      null,
      0,
    );
    return;
  }

  // Closed paths wrap around so frames stay continuous across the seam.
  if (!closed) {
    for (let i = first - 1; i >= 0; i--) {
      transport(normals, i, normals, tangents, positions, i + 1, i);
    }
  }
  const end = closed ? first + size : size;
  for (let k = first + 1; k < end; k++) {
    const i = k % size;
    if (!defined[i]) {
      transport(normals, i, normals, tangents, positions, (k - 1) % size, i);
    }
  }
}

/**
 * Compute rotation minimizing (Bishop) or Frenet-Serret frames for a path of 3D
 * positions.
 *
 * @param {import("./types.js").SimplicialComplex} geometry
 * @param {import("./types.js").Options} [options={}]
 * @returns {import("./types.js").SimplicialComplexWithTNB}
 * @see [Frenet–Serret formulas]{@link https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas}
 * @see [Computation of Rotation Minimizing Frames (Wang et al. 2008)]{@link https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/Computation-of-rotation-minimizing-frames.pdf}
 */
function frenetSerretFrames(geometry, options) {
  const {
    closed = false,
    mode = "bishop",
    initialNormal = null,
    finalNormal = null,
    twist = 0,
  } = { ...options };

  const isFlatArray = !geometry.positions[0]?.length;
  const size = geometry.positions.length / (isFlatArray ? 3 : 1);
  const positions = toFlatArray(geometry.positions);

  // Same layout as path-tangents output
  let ArrayConstructor = Array;
  if (isFlatArray) {
    ArrayConstructor =
      geometry.positions instanceof Float64Array ? Float64Array : Float32Array;
  }

  geometry.tangents ||= computePathTangents(geometry.positions, { closed });
  const tangents = toFlatArray(geometry.tangents);
  const normals = new Float64Array(size * 3);
  const binormals = new Float64Array(size * 3);

  if (mode === "frenet") {
    computeFrenetNormals(
      normals,
      tangents,
      positions,
      size,
      closed,
      geometry.positions instanceof Float32Array
        ? FLOAT32_EPSILON
        : Number.EPSILON,
    );
  } else {
    computeBishopNormals(
      normals,
      tangents,
      positions,
      size,
      closed,
      initialNormal,
      finalNormal,
      twist,
    );
  }

  for (let i = 0; i < size; i++) {
    avec3.set(binormals, i, tangents, i);
    avec3.cross(binormals, i, normals, i);
  }

  geometry.normals = fromFlatArray(
    normals,
    size,
    ArrayConstructor,
    geometry.normals,
  );
  geometry.binormals = fromFlatArray(
    binormals,
    size,
    ArrayConstructor,
    geometry.binormals,
  );

  return geometry;
}

export default frenetSerretFrames;

export * from "./types.js";
