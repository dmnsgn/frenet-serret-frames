/**
 * @typedef {number[]} vec3
 */

/**
 * @typedef {object} SimplicialComplex Geometry definition.
 * @property {Float32Array | vec3[]} positions
 * @property {Float32Array | vec3[]} [tangents]
 * @property {Float32Array | vec3[]} [normals]
 * @property {Float32Array | vec3[]} [uvs]
 * @property {(Uint8Array | Uint16Array | Uint32Array | vec3[])} [cells]
 */

/**
 * @typedef {object} SimplicialComplexWithTNB Geometry definition augmented with tangent, normals and binormals.
 * @property {Float32Array | vec3[]} positions
 * @property {Float32Array | vec3[]} tangents
 * @property {Float32Array | vec3[]} normals
 * @property {Float32Array | vec3[]} binormals
 * @property {Float32Array | vec3[]} [uvs]
 * @property {(Uint8Array | Uint16Array | Uint32Array | vec3[])} [cells]
 */

/**
 * @typedef {object} Options Options for frames computation. All optional.
 * @property {boolean} [closed=false] Specify is the path is closed.
 * @property {vec3} [initialNormal=null] Specify a starting normal for the frames. Default to the direction of the minimum tangent component.
 */

export {};
