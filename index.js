import { vec3, quat } from "gl-matrix";
import clamp from "clamp";

/**
 * @typedef {number[]} vec3
 */

/**
 * @typedef {Object} Options Options for frames computation. All optional.
 * @property {boolean} [closed=false] Specify is the path is closed.
 * @property {vec3} [initialNormal=null] Specify a starting normal for the frames. Default to the direction of the minimum tangent component.
 */

/**
 * @typedef {Object} Frame
 * @property {vec3} position
 * @property {vec3} normal
 * @property {vec3} binormal
 * @property {vec3} tangent
 */

const X_UP = [1, 0, 0];
const Y_UP = [0, 1, 0];
const Z_UP = [0, 0, 1];

/**
 * Compute Frenet-Serret frames for a path of 3D points and tangents
 *
 * @param {vec3[]} points Array of 3D points [x, y, z].
 * @param {vec3[]} tangents Array of 3D points [x, y, z] corresponding to the tangents of the path.
 * @param {Options} [options={}]
 * @returns {Frame[]}
 *
 * @see [Frenet–Serret formulas]{@link https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas}
 */
function frenetSerretFrames(points, tangents, options) {
  // Extends options
  const { closed = false, initialNormal = null } = {
    ...options,
  };

  const frames = [];
  const v = vec3.create();

  // Compute initial frame
  let tangent = tangents[0];
  let normal = initialNormal || vec3.create();

  const atx = Math.abs(tangent[0]);
  const aty = Math.abs(tangent[1]);
  const atz = Math.abs(tangent[2]);

  if (!initialNormal) {
    if (aty > atx && aty >= atz) {
      vec3.cross(v, tangent, X_UP);
    } else if (atz > atx && atz >= aty) {
      vec3.cross(v, tangent, Y_UP);
    } else {
      vec3.cross(v, tangent, Z_UP);
    }

    vec3.cross(normal, tangent, v);
    vec3.normalize(normal, normal);
  }

  let binormal = vec3.cross(vec3.create(), tangent, normal);
  vec3.normalize(binormal, binormal);

  frames.push({
    position: [...points[0]],
    normal: vec3.clone(normal),
    binormal: vec3.clone(binormal),
    tangent: vec3.clone(tangent),
  });

  // Compute the rest of the frames
  const rotation = quat.create();
  let previousTangent;

  for (let i = 1; i < points.length; i++) {
    const position = points[i];
    previousTangent = tangents[i - 1];
    tangent = tangents[i];
    normal = vec3.clone(normal);
    binormal = vec3.clone(binormal);

    vec3.cross(v, previousTangent, tangent);

    if (vec3.length(v) > Number.EPSILON) {
      vec3.normalize(v, v);

      let theta = Math.acos(clamp(vec3.dot(previousTangent, tangent), -1, 1));
      quat.setAxisAngle(rotation, v, theta);
      vec3.transformQuat(normal, normal, rotation);
    }
    vec3.cross(binormal, tangent, normal);

    frames.push({
      position: [...position],
      normal: vec3.clone(normal),
      binormal: vec3.clone(binormal),
      tangent: vec3.clone(tangent),
    });
  }

  if (closed) {
    const firstNormal = frames[0].normal;
    const lastNormal = frames[frames.length - 1].normal;

    let theta = Math.acos(clamp(vec3.dot(firstNormal, lastNormal), 0, 1));
    theta /= frames.length - 1;

    if (
      vec3.dot(
        vec3.clone(tangents[0]),
        vec3.cross(v, firstNormal, lastNormal)
      ) > 0
    ) {
      theta = -theta;
    }

    frames.forEach(({ normal, binormal, tangent }, index) => {
      quat.setAxisAngle(rotation, tangent, theta * index);
      vec3.transformQuat(normal, normal, rotation);
      vec3.cross(binormal, tangent, normal);
    });
  }

  return frames;
}

export default frenetSerretFrames;
