import { avec3, vec3, quat, utils } from "pex-math";
import computePathTangents from "path-tangents";

const X_UP = [1, 0, 0];
const Y_UP = [0, 1, 0];
const Z_UP = [0, 0, 1];

/**
 * Compute Frenet-Serret frames for a geometry of 3D positions and optionally provided tangents.
 *
 * @param {import("./types.js").SimplicialComplex} geometry
 * @param {import("./types.js").Options} [options={}]
 * @returns {import("./types.js").SimplicialComplexWithTNB}
 *
 * @see [Frenet–Serret formulas]{@link https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas}
 */
function frenetSerretFrames(geometry, options) {
  const isFlatArray = !geometry.positions[0]?.length;

  // Extends options
  const { closed = false, initialNormal = null } = { ...options };

  const size = geometry.positions.length / (isFlatArray ? 3 : 1);
  geometry.tangents ||= computePathTangents(geometry.positions, closed);
  geometry.normals ||= isFlatArray ? new Float32Array(size * 3) : [];
  geometry.binormals ||= isFlatArray ? new Float32Array(size * 3) : [];

  let v = vec3.create();

  // Compute initial frame
  let tangent = isFlatArray
    ? geometry.tangents.slice(0, 3)
    : geometry.tangents[0];
  let normal;

  if (initialNormal) {
    normal = [...initialNormal];
  } else {
    const atx = Math.abs(tangent[0]);
    const aty = Math.abs(tangent[1]);
    const atz = Math.abs(tangent[2]);

    if (aty > atx && aty >= atz) {
      v = vec3.cross([...tangent], X_UP);
    } else if (atz > atx && atz >= aty) {
      v = vec3.cross([...tangent], Y_UP);
    } else {
      v = vec3.cross([...tangent], Z_UP);
    }

    normal = vec3.normalize(vec3.cross([...tangent], v));
  }

  let binormal = vec3.normalize(vec3.cross([...tangent], normal));

  if (isFlatArray) {
    geometry.normals.set(normal);
    geometry.binormals.set(binormal);
  } else {
    geometry.normals.push(normal);
    geometry.binormals.push(binormal);
  }

  // Compute the rest of the frames
  const rotation = quat.create();
  let previousTangent = vec3.create();

  for (let i = 1; i < size; i++) {
    if (isFlatArray) {
      avec3.set(previousTangent, 0, geometry.tangents, i - 1);
      avec3.set(tangent, 0, geometry.tangents, i);
    } else {
      previousTangent = geometry.tangents[i - 1];
      tangent = geometry.tangents[i];
    }

    normal = vec3.copy(normal);
    binormal = vec3.copy(binormal);

    v = vec3.cross([...previousTangent], tangent);

    if (vec3.length(v) > Number.EPSILON) {
      vec3.normalize(v);

      const theta = Math.acos(
        utils.clamp(vec3.dot(previousTangent, tangent), -1, 1),
      );
      quat.fromAxisAngle(rotation, v, theta);
      vec3.multQuat(normal, rotation);
    }
    binormal = vec3.cross([...tangent], normal);

    if (isFlatArray) {
      avec3.set(geometry.normals, i, normal, 0);
      avec3.set(geometry.binormals, i, binormal, 0);
    } else {
      geometry.normals.push(normal);
      geometry.binormals.push(binormal);
    }
  }

  if (closed) {
    const firstNormal = isFlatArray
      ? geometry.normals.slice(0, 3)
      : geometry.normals[0];
    const lastNormal = isFlatArray
      ? geometry.normals.slice(-3)
      : geometry.normals.at(-1);
    const firstTangent = isFlatArray
      ? geometry.tangents.slice(0, 3)
      : geometry.tangents[0];

    let theta = Math.acos(
      utils.clamp(vec3.dot(firstNormal, lastNormal), -1, 1),
    );
    theta /= size - 1;

    if (vec3.dot(firstTangent, vec3.cross([...firstNormal], lastNormal)) > 0) {
      theta = -theta;
    }

    for (let i = 0; i < size; i++) {
      if (isFlatArray) {
        avec3.set(tangent, 0, geometry.tangents, i);
        avec3.set(normal, 0, geometry.normals, i);
        avec3.set(binormal, 0, geometry.binormals, i);

        quat.fromAxisAngle(rotation, tangent, theta * i);
        vec3.multQuat(normal, rotation);
        binormal = vec3.cross([...tangent], normal);

        avec3.set(geometry.normals, i, normal, 0);
        avec3.set(geometry.binormals, i, binormal, 0);
      } else {
        const tangent = geometry.tangents[i];
        const normal = geometry.normals[i];
        quat.fromAxisAngle(rotation, tangent, theta * i);
        vec3.multQuat(normal, rotation);
        geometry.binormals[i] = vec3.cross([...tangent], normal);
      }
    }
  }

  return geometry;
}

export default frenetSerretFrames;
