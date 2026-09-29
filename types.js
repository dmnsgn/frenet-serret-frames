/**
 * @typedef {object} SimplicialComplex Geometry definition.
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} positions
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} [tangents]
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} [normals]
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} [binormals]
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec2[]} [uvs]
 * @property {Uint8Array | Uint16Array | Uint32Array | Array | import("pex-math").Vec3[]} [cells]
 */

/**
 * @typedef {object} SimplicialComplexWithTNB Geometry definition augmented with
 *   tangents, normals and binormals.
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} positions
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} tangents
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} normals
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec3[]} binormals
 * @property {import("pex-math").TypedArray | number[] | import("pex-math").Vec2[]} [uvs]
 * @property {Uint8Array | Uint16Array | Uint32Array | Array | import("pex-math").Vec3[]} [cells]
 */

/**
 * @typedef {object} Options Options for frames computation. All optional.
 * @property {boolean} [closed=false] Specify if the path is closed.
 * @property {"bishop" | "frenet"} [mode="bishop"] Frame type:
 *
 *   - "bishop": rotation minimizing (parallel transport) frames, computed with the
 *       double reflection method. Twist free, suited for sweeping.
 *   - "frenet": normal pointing towards the curvature centre. Flips at inflection
 *       points and is undefined on straight parts, where the nearest frame is
 *       transported instead.
 *
 * @property {import("pex-math").Vec3} [initialNormal=null] Specify a starting
 *   normal for "bishop" frames, made orthogonal to the first tangent. Defaults
 *   to a coordinate axis not aligned with the first tangent, also used when the
 *   initial normal is parallel to it.
 * @property {import("pex-math").Vec3} [finalNormal=null] Specify an ending
 *   normal for "bishop" frames of open paths, made orthogonal to the last
 *   tangent. Reached with the smallest rotation, spread along the arc length.
 *   Ignored when parallel to the last tangent.
 * @property {number} [twist=0] Additional rotation of "bishop" frames around
 *   the tangent, in radians, spread along the arc length from the first frame
 *   to the last. Closed paths and paths with a final normal need a multiple of
 *   2π to keep their end frame, or of π when the sign of the normal doesn't
 *   matter (eg. flat ribbons).
 */

export {};
