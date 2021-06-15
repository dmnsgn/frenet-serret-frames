import { c as create, s as sub, e as clone, n as normalize } from './common/vec3-a59c91aa.js';
import './common/es.typed-array.float32-array-cc8d9a55.js';
import './common/to-object-b740b57d.js';

/**
 * @typedef {number[]} vec3
 */

/**
 * Compute tangents for a path of 3D points.
 *
 * @param {vec3[]} path Array of 3D points [x, y, z].
 * @param {boolean} [isClosed=false] Specify if the path is closed.
 * @returns {vec3[]}
 */

const pathTangents = (path, isClosed = false) => path.map((point, index, points) => {
  let tangent = create();
  const isNotLastPoint = index < points.length - 1;

  if (isClosed) {
    const nextPoint = isNotLastPoint ? points[index + 1] : points[1];
    sub(tangent, clone(nextPoint), point);
  } else {
    if (isNotLastPoint) {
      const nextPoint = points[index + 1];
      sub(tangent, clone(nextPoint), point);
    } else {
      const prevPoint = points[index - 1];
      sub(tangent, clone(point), prevPoint);
    }
  }

  return normalize(tangent, tangent);
});

export default pathTangents;
