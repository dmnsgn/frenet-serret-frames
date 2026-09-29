import { r as __exportAll } from "./rolldown-runtime-ppdSCyCg.js";

var mat2x3_exports = /* @__PURE__ */ __exportAll({
	copy: () => copy$6,
	create: () => create$7,
	equals: () => equals$9,
	identity: () => identity$3,
	mult: () => mult$3,
	rotate: () => rotate$1,
	scale: () => scale$7,
	set: () => set$9,
	translate: () => translate$1
});
/** @module mat2x3 */
/**
* Returns a 2x3 identity matrix, a short form for a 3x3 matrix with the last
* row ignored.
*
* Row major memory layout:
*
* ```txt
* 0   1
* 2   3
* 4   5
* ```
*
* Equivalent to the column major OpenGL spec:
*
* ```txt
* 0   3
* 1   4
* 2   5
*
* m00 m10
* m01 m11
* m02 m12
* ```
*
* @returns {import("./types.js").Mat2x3}
*/
function create$7() {
	return [
		1,
		0,
		0,
		1,
		0,
		0
	];
}
/**
* Sets a matrix to the identity matrix.
*
* @param {import("./types.js").Mat2x3} a
* @returns {import("./types.js").Mat2x3}
*/
function identity$3(a) {
	a[0] = a[3] = 1;
	a[1] = a[2] = a[4] = a[5] = 0;
	return a;
}
/**
* Returns a copy of a matrix.
*
* @param {import("./types.js").Mat2x3} a
* @returns {import("./types.js").Mat2x3}
*/
function copy$6(a) {
	return a.slice();
}
/**
* Sets a matrix from another matrix.
*
* @param {import("./types.js").Mat2x3} a
* @param {import("./types.js").Mat2x3} b
* @returns {import("./types.js").Mat2x3}
*/
function set$9(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[3] = b[3];
	a[4] = b[4];
	a[5] = b[5];
	return a;
}
/**
* Compares two matrices.
*
* @param {import("./types.js").Mat2x3} a
* @param {import("./types.js").Mat2x3} b
* @returns {boolean}
*/
function equals$9(a, b) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}
/**
* Multiplies two matrices.
*
* @param {import("./types.js").Mat2x3} a
* @param {import("./types.js").Mat2x3} b
* @returns {import("./types.js").Mat2x3}
*/
function mult$3(a, b) {
	const a0 = a[0];
	const a1 = a[1];
	const a2 = a[2];
	const a3 = a[3];
	const a4 = a[4];
	const a5 = a[5];
	const b0 = b[0];
	const b1 = b[1];
	const b2 = b[2];
	const b3 = b[3];
	const b4 = b[4];
	const b5 = b[5];
	a[0] = a0 * b0 + a2 * b1;
	a[1] = a1 * b0 + a3 * b1;
	a[2] = a0 * b2 + a2 * b3;
	a[3] = a1 * b2 + a3 * b3;
	a[4] = a0 * b4 + a2 * b5 + a4;
	a[5] = a1 * b4 + a3 * b5 + a5;
	return a;
}
/**
* Translates a matrix by a vector.
*
* @param {import("./types.js").Mat2x3} a
* @param {import("./types.js").Vec2} v
* @returns {import("./types.js").Mat2x3}
*/
function translate$1(a, v) {
	const a0 = a[0];
	const a1 = a[1];
	const a2 = a[2];
	const a3 = a[3];
	const a4 = a[4];
	const a5 = a[5];
	const x = v[0];
	const y = v[1];
	a[0] = a0;
	a[1] = a1;
	a[2] = a2;
	a[3] = a3;
	a[4] = a0 * x + a2 * y + a4;
	a[5] = a1 * x + a3 * y + a5;
	return a;
}
/**
* Rotates a matrix by an angle.
*
* @param {import("./types.js").Mat2x3} a
* @param {import("./types.js").Radians} rad
* @returns {import("./types.js").Mat2x3}
*/
function rotate$1(a, rad) {
	const a0 = a[0];
	const a1 = a[1];
	const a2 = a[2];
	const a3 = a[3];
	const s = Math.sin(rad);
	const c = Math.cos(rad);
	a[0] = a0 * c + a2 * s;
	a[1] = a1 * c + a3 * s;
	a[2] = a0 * -s + a2 * c;
	a[3] = a1 * -s + a3 * c;
	return a;
}
/**
* Scales a matrix by a vector.
*
* @param {import("./types.js").Mat2x3} a
* @param {import("./types.js").Vec2} v
* @returns {import("./types.js").Mat2x3}
*/
function scale$7(a, v) {
	const a0 = a[0];
	const a1 = a[1];
	const a2 = a[2];
	const a3 = a[3];
	a[0] = a0 * v[0];
	a[1] = a1 * v[0];
	a[2] = a2 * v[1];
	a[3] = a3 * v[1];
	return a;
}

var mat3_exports = /* @__PURE__ */ __exportAll({
	copy: () => copy$5,
	create: () => create$6,
	equals: () => equals$8,
	fromMat2x3: () => fromMat2x3,
	fromMat4: () => fromMat4$1,
	fromQuat: () => fromQuat$2,
	identity: () => identity$2,
	mult: () => mult$2,
	set: () => set$8,
	transpose: () => transpose$1
});
/** @module mat3 */
/**
* Returns a 3x3 identity matrix.
*
* Row major memory layout:
*
* ```txt
*  0   1   2
*  3   4   5
*  6   7   8
* ```
*
* Equivalent to the column major OpenGL spec:
*
* ```txt
*   0   3   6
*   1   4   7
*   2   5   8
*
*  m00 m10 m20
*  m01 m11 m21
*  m02 m12 m22
* ```
*
* @returns {import("./types.js").Mat3}
*/
function create$6() {
	return [
		1,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		1
	];
}
/**
* Sets a matrix to the identity matrix.
*
* @param {import("./types.js").Mat3} a
* @returns {import("./types.js").Mat3}
*/
function identity$2(a) {
	a[0] = a[4] = a[8] = 1;
	a[1] = a[2] = a[3] = a[5] = a[6] = a[7] = 0;
	return a;
}
/**
* Returns a copy of a matrix.
*
* @param {import("./types.js").Mat3} a
* @returns {import("./types.js").Mat3}
*/
function copy$5(a) {
	return a.slice();
}
/**
* Sets a matrix from another matrix.
*
* @param {import("./types.js").Mat3} a
* @param {import("./types.js").Mat3} b
* @returns {import("./types.js").Mat3}
*/
function set$8(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[3] = b[3];
	a[4] = b[4];
	a[5] = b[5];
	a[6] = b[6];
	a[7] = b[7];
	a[8] = b[8];
	return a;
}
/**
* Compares two matrices.
*
* @param {import("./types.js").Mat3} a
* @param {import("./types.js").Mat3} b
* @returns {boolean}
*/
function equals$8(a, b) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9];
}
/**
* Multiplies two matrices.
*
* @param {import("./types.js").Mat3} a
* @param {import("./types.js").Mat3} b
* @returns {import("./types.js").Mat3}
*/
function mult$2(a, b) {
	const a00 = a[0];
	const a01 = a[1];
	const a02 = a[2];
	const a10 = a[3];
	const a11 = a[4];
	const a12 = a[5];
	const a20 = a[6];
	const a21 = a[7];
	const a22 = a[8];
	const b00 = b[0];
	const b01 = b[1];
	const b02 = b[2];
	const b10 = b[3];
	const b11 = b[4];
	const b12 = b[5];
	const b20 = b[6];
	const b21 = b[7];
	const b22 = b[8];
	a[0] = b00 * a00 + b01 * a10 + b02 * a20;
	a[1] = b00 * a01 + b01 * a11 + b02 * a21;
	a[2] = b00 * a02 + b01 * a12 + b02 * a22;
	a[3] = b10 * a00 + b11 * a10 + b12 * a20;
	a[4] = b10 * a01 + b11 * a11 + b12 * a21;
	a[5] = b10 * a02 + b11 * a12 + b12 * a22;
	a[6] = b20 * a00 + b21 * a10 + b22 * a20;
	a[7] = b20 * a01 + b21 * a11 + b22 * a21;
	a[8] = b20 * a02 + b21 * a12 + b22 * a22;
	return a;
}
/**
* Transposes a matrix.
*
* @param {import("./types.js").Mat3} a
* @returns {import("./types.js").Mat3}
*/
function transpose$1(a) {
	const a01 = a[1];
	const a02 = a[2];
	const a12 = a[5];
	a[1] = a[3];
	a[2] = a[6];
	a[3] = a01;
	a[5] = a[7];
	a[6] = a02;
	a[7] = a12;
	return a;
}
/**
* Sets matrix to a quaternion.
*
* @param {import("./types.js").Mat3} a
* @param {import("./types.js").Quat} q
* @returns {import("./types.js").Mat3}
*/
function fromQuat$2(a, q) {
	const x = q[0];
	const y = q[1];
	const z = q[2];
	const w = q[3];
	const x2 = x + x;
	const y2 = y + y;
	const z2 = z + z;
	const xx = x * x2;
	const xy = x * y2;
	const xz = x * z2;
	const yy = y * y2;
	const yz = y * z2;
	const zz = z * z2;
	const wx = w * x2;
	const wy = w * y2;
	const wz = w * z2;
	a[0] = 1 - (yy + zz);
	a[3] = xy - wz;
	a[6] = xz + wy;
	a[1] = xy + wz;
	a[4] = 1 - (xx + zz);
	a[7] = yz - wx;
	a[2] = xz - wy;
	a[5] = yz + wx;
	a[8] = 1 - (xx + yy);
	return a;
}
/**
* Sets a 3x3 matrix from a 2x3 matrix.
*
* @param {import("./types.js").Mat3} a
* @param {import("./types.js").Mat2x3} b
* @returns {import("./types.js").Mat3}
*/
function fromMat2x3(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = 0;
	a[3] = b[2];
	a[4] = b[3];
	a[5] = 0;
	a[6] = b[4];
	a[7] = b[5];
	a[8] = 1;
	return a;
}
/**
* Sets a 3x3 matrix to a 4x4 matrix.
*
* @param {import("./types.js").Mat3} a
* @param {import("./types.js").Mat4} b
* @returns {import("./types.js").Mat3}
*/
function fromMat4$1(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[3] = b[4];
	a[4] = b[5];
	a[5] = b[6];
	a[6] = b[8];
	a[7] = b[9];
	a[8] = b[10];
	return a;
}

var utils_exports = /* @__PURE__ */ __exportAll({
	EPSILON: () => EPSILON,
	HALF_PI: () => HALF_PI,
	Y_UP: () => Y_UP,
	clamp: () => clamp,
	isPowerOfTwo: () => isPowerOfTwo,
	lerp: () => lerp$6,
	map: () => map$3,
	nextPowerOfTwo: () => nextPowerOfTwo,
	prevPowerOfTwo: () => prevPowerOfTwo,
	remap: () => remap,
	smoothstep: () => smoothstep,
	toDegrees: () => toDegrees,
	toRadians: () => toRadians
});
/** @module utils */
/** @constant {number} */
const EPSILON = 1e-6;
/** @constant {number} */
const HALF_PI = Math.PI * .5;
/** @constant {import("./types.js").Vec3} */
const Y_UP = Object.freeze([
	0,
	1,
	0
]);
/**
* Linear interpolation between two numbers.
*
* @param {number} a
* @param {number} b
* @param {number} t
* @returns {number}
*/
function lerp$6(a, b, t) {
	return a + (b - a) * t;
}
/**
* Clamps a number between two numbers.
*
* @param {number} n
* @param {number} min
* @param {number} max
* @returns {number}
*/
function clamp(n, min, max) {
	return Math.max(min, Math.min(n, max));
}
/**
* Smooth Hermite interpolation between 0 and 1
*
* @param {number} n
* @param {number} min
* @param {number} max
* @returns {number}
*/
function smoothstep(n, min, max) {
	n = clamp((n - min) / (max - min), 0, 1);
	return n * n * (3 - 2 * n);
}
/**
* Maps a number from one range to another.
*
* @param {number} n
* @param {number} inStart
* @param {number} inEnd
* @param {number} outStart
* @param {number} outEnd
* @returns {number}
*/
function remap(n, inStart, inEnd, outStart, outEnd) {
	return outStart + (outEnd - outStart) * (n - inStart) / (inEnd - inStart);
}
/**
* @ignore
* @deprecated Use "remap()"
*/
function map$3(...args) {
	return remap(...args);
}
/**
* Transforms degrees into radians.
*
* @param {import("./types.js").Degrees} degrees
* @returns {import("./types.js").Radians}
*/
function toRadians(degrees) {
	return degrees * Math.PI / 180;
}
/**
* Transforms radians into degrees.
*
* @param {import("./types.js").Radians} radians
* @returns {import("./types.js").Degrees}
*/
function toDegrees(radians) {
	return radians * 180 / Math.PI;
}
/**
* Check if a number is a power of two
*
* @param {number} a
* @returns {boolean}
*/
function isPowerOfTwo(a) {
	return (a & a - 1) === 0;
}
/**
* Returns the next highest power of two.
*
* @param {number} n
* @returns {number}
*/
function nextPowerOfTwo(n) {
	if (n === 0) return 1;
	n--;
	n |= n >> 1;
	n |= n >> 2;
	n |= n >> 4;
	n |= n >> 8;
	n |= n >> 16;
	return n + 1;
}
/**
* Returns the previous power of two.
*
* @param {number} n
* @returns {number}
*/
function prevPowerOfTwo(n) {
	if (n <= 1) return 0;
	return nextPowerOfTwo(n) / 2;
}

/** @module mat4 */
var mat4_exports = /* @__PURE__ */ __exportAll({
	copy: () => copy$4,
	create: () => create$5,
	determinant: () => determinant,
	equals: () => equals$7,
	fromDirection: () => fromDirection$1,
	fromMat3: () => fromMat3$1,
	fromPointToPoint: () => fromPointToPoint$1,
	fromQuat: () => fromQuat$1,
	fromTranslationRotationScale: () => fromTranslationRotationScale,
	frustum: () => frustum,
	frustumZO: () => frustumZO,
	identity: () => identity$1,
	invert: () => invert$1,
	lookAt: () => lookAt,
	mult: () => mult$1,
	ortho: () => ortho,
	orthoZO: () => orthoZO,
	perspective: () => perspective,
	perspectiveZO: () => perspectiveZO,
	rotate: () => rotate,
	scale: () => scale$6,
	set: () => set$7,
	translate: () => translate,
	transpose: () => transpose
});
/**
* Returns a 4x4 identity matrix.
*
* Row major memory layout:
*
* ```txt
*  0   1   2   3
*  4   5   6   7
*  8   9  10  11
* 12  13  14  15
* ```
*
* Equivalent to the column major OpenGL spec:
*
* ```txt
*  0   4   8  12
*  1   5   9  13
*  2   6  10  14
*  3   7  11  15
*
*  m00 m10 m20 m30
*  m01 m11 m21 m31
*  m02 m12 m22 m32
*  m03 m13 m23 m33
* ```
*
* @returns {import("./types.js").Mat4}
*/
function create$5() {
	return [
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	];
}
/**
* Sets a matrix to the identity matrix.
*
* @param {import("./types.js").Mat4} a
* @returns {import("./types.js").Mat4}
*/
function identity$1(a) {
	a[0] = a[5] = a[10] = a[15] = 1;
	a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
	return a;
}
/**
* Returns a copy of a matrix.
*
* @param {import("./types.js").Mat4} a
* @returns {import("./types.js").Mat4}
*/
function copy$4(a) {
	return a.slice();
}
/**
* Sets a matrix from another matrix.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Mat4} b
* @returns {import("./types.js").Mat4}
*/
function set$7(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[3] = b[3];
	a[4] = b[4];
	a[5] = b[5];
	a[6] = b[6];
	a[7] = b[7];
	a[8] = b[8];
	a[9] = b[9];
	a[10] = b[10];
	a[11] = b[11];
	a[12] = b[12];
	a[13] = b[13];
	a[14] = b[14];
	a[15] = b[15];
	return a;
}
/**
* Compares two matrices.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Mat4} b
* @returns {boolean}
*/
function equals$7(a, b) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
/**
* Multiplies two matrices.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Mat4} b
* @returns {import("./types.js").Mat4}
*/
function mult$1(a, b) {
	const a00 = a[0];
	const a01 = a[1];
	const a02 = a[2];
	const a03 = a[3];
	const a10 = a[4];
	const a11 = a[5];
	const a12 = a[6];
	const a13 = a[7];
	const a20 = a[8];
	const a21 = a[9];
	const a22 = a[10];
	const a23 = a[11];
	const a30 = a[12];
	const a31 = a[13];
	const a32 = a[14];
	const a33 = a[15];
	let b0 = b[0];
	let b1 = b[1];
	let b2 = b[2];
	let b3 = b[3];
	a[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	a[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	a[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	a[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	a[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	a[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	a[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	a[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	a[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	a[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	a[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	a[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	a[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	a[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	a[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	a[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return a;
}
/**
* Inverts a matrix.
*
* @param {import("./types.js").Mat4} a
* @returns {import("./types.js").Mat4}
*/
function invert$1(a) {
	const a00 = a[0];
	const a10 = a[1];
	const a20 = a[2];
	const a30 = a[3];
	const a01 = a[4];
	const a11 = a[5];
	const a21 = a[6];
	const a31 = a[7];
	const a02 = a[8];
	const a12 = a[9];
	const a22 = a[10];
	const a32 = a[11];
	const a03 = a[12];
	const a13 = a[13];
	const a23 = a[14];
	const a33 = a[15];
	const a22a33 = a22 * a33;
	const a32a23 = a32 * a23;
	const a21a33 = a21 * a33;
	const a31a23 = a31 * a23;
	const a21a32 = a21 * a32;
	const a31a22 = a31 * a22;
	const a20a33 = a20 * a33;
	const a30a23 = a30 * a23;
	const a20a32 = a20 * a32;
	const a30a22 = a30 * a22;
	const a20a31 = a20 * a31;
	const a30a21 = a30 * a21;
	const a00a11 = a00 * a11;
	const a01a10 = a01 * a10;
	const a02a10 = a02 * a10;
	const a03a10 = a03 * a10;
	const a12a33 = a12 * a33;
	const a32a13 = a32 * a13;
	const a00a31 = a00 * a31;
	const a03a11 = a03 * a11;
	const a12a23 = a12 * a23;
	const a22a13 = a22 * a13;
	const a02a11 = a02 * a11;
	const a21a13 = a21 * a13;
	const a21a12 = a21 * a12;
	const a02a30 = a02 * a30;
	const a03a30 = a03 * a30;
	const a02a20 = a02 * a20;
	const a03a20 = a03 * a20;
	const a01a30 = a01 * a30;
	const a01a20 = a01 * a20;
	a[0] = a11 * a22a33 - a11 * a32a23 - a12 * a21a33 + a12 * a31a23 + a13 * a21a32 - a13 * a31a22;
	a[4] = -a01 * a22a33 + a01 * a32a23 + a02 * a21a33 - a02 * a31a23 - a03 * a21a32 + a03 * a31a22;
	a[8] = a01 * a12a33 - a01 * a32a13 - a02a11 * a33 + a02 * a31 * a13 + a03a11 * a32 - a03 * a31 * a12;
	a[12] = -a01 * a12a23 + a01 * a22a13 + a02a11 * a23 - a02 * a21a13 - a03a11 * a22 + a03 * a21a12;
	a[1] = -a10 * a22a33 + a10 * a32a23 + a12 * a20a33 - a12 * a30a23 - a13 * a20a32 + a13 * a30a22;
	a[5] = a00 * a22a33 - a00 * a32a23 - a02 * a20a33 + a02 * a30a23 + a03 * a20a32 - a03 * a30a22;
	a[9] = -a00 * a12a33 + a00 * a32a13 + a02a10 * a33 - a02a30 * a13 - a03a10 * a32 + a03a30 * a12;
	a[13] = a00 * a12a23 - a00 * a22a13 - a02a10 * a23 + a02a20 * a13 + a03a10 * a22 - a03a20 * a12;
	a[2] = a10 * a21a33 - a10 * a31a23 - a11 * a20a33 + a11 * a30a23 + a13 * a20a31 - a13 * a30a21;
	a[6] = -a00 * a21a33 + a00 * a31a23 + a01 * a20a33 - a01 * a30a23 - a03 * a20a31 + a03 * a30a21;
	a[10] = a00a11 * a33 - a00a31 * a13 - a01a10 * a33 + a01a30 * a13 + a03a10 * a31 - a03a30 * a11;
	a[14] = -a00a11 * a23 + a00 * a21a13 + a01a10 * a23 - a01a20 * a13 - a03a10 * a21 + a03a20 * a11;
	a[3] = -a10 * a21a32 + a10 * a31a22 + a11 * a20a32 - a11 * a30a22 - a12 * a20a31 + a12 * a30a21;
	a[7] = a00 * a21a32 - a00 * a31a22 - a01 * a20a32 + a01 * a30a22 + a02 * a20a31 - a02 * a30a21;
	a[11] = -a00a11 * a32 + a00a31 * a12 + a01a10 * a32 - a01a30 * a12 - a02a10 * a31 + a02a30 * a11;
	a[15] = a00a11 * a22 - a00 * a21a12 - a01a10 * a22 + a01a20 * a12 + a02a10 * a21 - a02a20 * a11;
	let det = a00 * a[0] + a10 * a[4] + a20 * a[8] + a30 * a[12];
	if (!det) return null;
	det = 1 / det;
	a[0] *= det;
	a[1] *= det;
	a[2] *= det;
	a[3] *= det;
	a[4] *= det;
	a[5] *= det;
	a[6] *= det;
	a[7] *= det;
	a[8] *= det;
	a[9] *= det;
	a[10] *= det;
	a[11] *= det;
	a[12] *= det;
	a[13] *= det;
	a[14] *= det;
	a[15] *= det;
	return a;
}
/**
* Returns the determinant of a matrix.
*
* @param {import("./types.js").Mat4} a
* @returns {number}
*/
function determinant(a) {
	const a00 = a[0];
	const a10 = a[1];
	const a20 = a[2];
	const a30 = a[3];
	const a01 = a[4];
	const a11 = a[5];
	const a21 = a[6];
	const a31 = a[7];
	const a02 = a[8];
	const a12 = a[9];
	const a22 = a[10];
	const a32 = a[11];
	const a03 = a[12];
	const a13 = a[13];
	const a23 = a[14];
	const a33 = a[15];
	return (a00 * a11 - a01 * a10) * (a22 * a33 - a23 * a32) - (a00 * a12 - a02 * a10) * (a21 * a33 - a23 * a31) + (a00 * a13 - a03 * a10) * (a21 * a32 - a22 * a31) + (a01 * a12 - a02 * a11) * (a20 * a33 - a23 * a30) - (a01 * a13 - a03 * a11) * (a20 * a32 - a22 * a30) + (a02 * a13 - a03 * a12) * (a20 * a31 - a21 * a30);
}
/**
* Transposes a matrix.
*
* @param {import("./types.js").Mat4} a
* @returns {import("./types.js").Mat4}
*/
function transpose(a) {
	const a01 = a[1];
	const a02 = a[2];
	const a03 = a[3];
	const a12 = a[6];
	const a13 = a[7];
	const a20 = a[8];
	const a21 = a[9];
	const a23 = a[11];
	const a30 = a[12];
	const a31 = a[13];
	const a32 = a[14];
	a[1] = a[4];
	a[2] = a20;
	a[3] = a30;
	a[4] = a01;
	a[6] = a21;
	a[7] = a31;
	a[8] = a02;
	a[9] = a12;
	a[11] = a32;
	a[12] = a03;
	a[13] = a13;
	a[14] = a23;
	return a;
}
/**
* Translates a matrix by a vector.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Vec3} v
* @returns {import("./types.js").Mat4}
*/
function translate(a, [x, y, z]) {
	a[12] += a[0] * x + a[4] * y + a[8] * z;
	a[13] += a[1] * x + a[5] * y + a[9] * z;
	a[14] += a[2] * x + a[6] * y + a[10] * z;
	a[15] += a[3] * x + a[7] * y + a[11] * z;
	return a;
}
/**
* Rotates a matrix by an angle at an axis.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Radians} r
* @param {import("./types.js").Vec3} v
* @returns {import("./types.js").Mat4}
*/
function rotate(a, r, [x, y, z]) {
	let len = Math.sqrt(x * x + y * y + z * z);
	if (len < 1e-6) return null;
	len = 1 / len;
	x *= len;
	y *= len;
	z *= len;
	const s = Math.sin(r);
	const c = Math.cos(r);
	const t = 1 - c;
	const a00 = a[0];
	const a01 = a[1];
	const a02 = a[2];
	const a03 = a[3];
	const a10 = a[4];
	const a11 = a[5];
	const a12 = a[6];
	const a13 = a[7];
	const a20 = a[8];
	const a21 = a[9];
	const a22 = a[10];
	const a23 = a[11];
	const b00 = x * x * t + c;
	const b01 = y * x * t + z * s;
	const b02 = z * x * t - y * s;
	const b10 = x * y * t - z * s;
	const b11 = y * y * t + c;
	const b12 = z * y * t + x * s;
	const b20 = x * z * t + y * s;
	const b21 = y * z * t - x * s;
	const b22 = z * z * t + c;
	a[0] = a00 * b00 + a10 * b01 + a20 * b02;
	a[1] = a01 * b00 + a11 * b01 + a21 * b02;
	a[2] = a02 * b00 + a12 * b01 + a22 * b02;
	a[3] = a03 * b00 + a13 * b01 + a23 * b02;
	a[4] = a00 * b10 + a10 * b11 + a20 * b12;
	a[5] = a01 * b10 + a11 * b11 + a21 * b12;
	a[6] = a02 * b10 + a12 * b11 + a22 * b12;
	a[7] = a03 * b10 + a13 * b11 + a23 * b12;
	a[8] = a00 * b20 + a10 * b21 + a20 * b22;
	a[9] = a01 * b20 + a11 * b21 + a21 * b22;
	a[10] = a02 * b20 + a12 * b21 + a22 * b22;
	a[11] = a03 * b20 + a13 * b21 + a23 * b22;
	return a;
}
/**
* Scales a matrix by a vector.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Vec3} v
* @returns {import("./types.js").Mat4}
*/
function scale$6(a, [x, y, z]) {
	a[0] *= x;
	a[1] *= x;
	a[2] *= x;
	a[3] *= x;
	a[4] *= y;
	a[5] *= y;
	a[6] *= y;
	a[7] *= y;
	a[8] *= z;
	a[9] *= z;
	a[10] *= z;
	a[11] *= z;
	return a;
}
/**
* Sets a matrix to a quaternion.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Quat} q
* @returns {import("./types.js").Mat4}
*/
function fromQuat$1(a, q) {
	const x = q[0];
	const y = q[1];
	const z = q[2];
	const w = q[3];
	const x2 = x + x;
	const y2 = y + y;
	const z2 = z + z;
	const xx = x * x2;
	const xy = x * y2;
	const xz = x * z2;
	const yy = y * y2;
	const yz = y * z2;
	const zz = z * z2;
	const wx = w * x2;
	const wy = w * y2;
	const wz = w * z2;
	a[0] = 1 - (yy + zz);
	a[4] = xy - wz;
	a[8] = xz + wy;
	a[1] = xy + wz;
	a[5] = 1 - (xx + zz);
	a[9] = yz - wx;
	a[2] = xz - wy;
	a[6] = yz + wx;
	a[10] = 1 - (xx + yy);
	a[3] = a[7] = a[11] = a[12] = a[13] = a[14] = 0;
	a[15] = 1;
	return a;
}
/**
* Sets a matrix to the TRS matrix.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Vec3} v
* @param {import("./types.js").Quat} q
* @param {import("./types.js").Vec3} s
* @returns {import("./types.js").Mat4}
*/
function fromTranslationRotationScale(a, v, q, s) {
	const x = q[0];
	const y = q[1];
	const z = q[2];
	const w = q[3];
	const x2 = x + x;
	const y2 = y + y;
	const z2 = z + z;
	const xx = x * x2;
	const xy = x * y2;
	const xz = x * z2;
	const yy = y * y2;
	const yz = y * z2;
	const zz = z * z2;
	const wx = w * x2;
	const wy = w * y2;
	const wz = w * z2;
	a[3] = a[7] = a[11] = 0;
	a[15] = 1;
	a[0] = (1 - (yy + zz)) * s[0];
	a[1] = (xy + wz) * s[0];
	a[2] = (xz - wy) * s[0];
	a[4] = (xy - wz) * s[1];
	a[5] = (1 - (xx + zz)) * s[1];
	a[6] = (yz + wx) * s[1];
	a[8] = (xz + wy) * s[2];
	a[9] = (yz - wx) * s[2];
	a[10] = (1 - (xx + yy)) * s[2];
	a[12] = v[0];
	a[13] = v[1];
	a[14] = v[2];
	return a;
}
/**
* Sets a 4x4 matrix to a 3x3 matrix.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Mat3} b
* @returns {import("./types.js").Mat4}
*/
function fromMat3$1(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[4] = b[3];
	a[5] = b[4];
	a[6] = b[5];
	a[8] = b[6];
	a[9] = b[7];
	a[10] = b[8];
	a[3] = a[7] = a[11] = a[12] = a[13] = a[14] = 0;
	a[15] = 1;
	return a;
}
/**
* Creates a frustum matrix with depth mapped to [-1, 1] (WebGL/OpenGL).
*
* @param {import("./types.js").Mat4} a
* @param {number} left
* @param {number} right
* @param {number} bottom
* @param {number} top
* @param {number} near
* @param {number} far
* @returns {import("./types.js").Mat4}
*/
function frustum(a, left, right, bottom, top, near, far) {
	const rl = 1 / (right - left);
	const tb = 1 / (top - bottom);
	const nf = 1 / (near - far);
	const near2 = near * 2;
	a[0] = near2 * rl;
	a[1] = a[2] = 0;
	a[3] = 0;
	a[4] = 0;
	a[5] = near2 * tb;
	a[6] = 0;
	a[7] = 0;
	a[8] = (right + left) * rl;
	a[9] = (top + bottom) * tb;
	a[10] = (far + near) * nf;
	a[11] = -1;
	a[12] = 0;
	a[13] = 0;
	a[14] = far * near2 * nf;
	a[15] = 0;
	return a;
}
/**
* Creates a frustum matrix with depth mapped to [0, 1]
* (WebGPU/DirectX/Metal/Vulkan).
*
* @param {import("./types.js").Mat4} a
* @param {number} left
* @param {number} right
* @param {number} bottom
* @param {number} top
* @param {number} near
* @param {number} far
* @returns {import("./types.js").Mat4}
*/
function frustumZO(a, left, right, bottom, top, near, far) {
	const rl = 1 / (right - left);
	const tb = 1 / (top - bottom);
	const nf = 1 / (near - far);
	const near2 = near * 2;
	a[0] = near2 * rl;
	a[1] = a[2] = 0;
	a[3] = 0;
	a[4] = 0;
	a[5] = near2 * tb;
	a[6] = 0;
	a[7] = 0;
	a[8] = (right + left) * rl;
	a[9] = (top + bottom) * tb;
	a[10] = far * nf;
	a[11] = -1;
	a[12] = 0;
	a[13] = 0;
	a[14] = far * near * nf;
	a[15] = 0;
	return a;
}
/**
* Creates a perspective matrix with depth mapped to [-1, 1] (WebGL/OpenGL).
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Radians} fovy
* @param {number} aspectRatio
* @param {number} near
* @param {number} far
* @returns {import("./types.js").Mat4}
*/
function perspective(a, fovy, aspectRatio, near, far) {
	const f = 1 / Math.tan(fovy / 2);
	const nf = 1 / (near - far);
	a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;
	a[0] = f / aspectRatio;
	a[5] = f;
	a[10] = (far + near) * nf;
	a[11] = -1;
	a[14] = 2 * far * near * nf;
	return a;
}
/**
* Creates a perspective matrix with depth mapped to [0, 1]
* (WebGPU/DirectX/Metal/Vulkan).
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Radians} fovy
* @param {number} aspectRatio
* @param {number} near
* @param {number} far
* @returns {import("./types.js").Mat4}
*/
function perspectiveZO(a, fovy, aspectRatio, near, far) {
	const f = 1 / Math.tan(fovy / 2);
	const nf = 1 / (near - far);
	a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;
	a[0] = f / aspectRatio;
	a[5] = f;
	a[10] = far * nf;
	a[11] = -1;
	a[14] = far * near * nf;
	return a;
}
/**
* Creates an orthographic matrix with depth mapped to [-1, 1] (WebGL/OpenGL).
*
* @param {import("./types.js").Mat4} a
* @param {number} left
* @param {number} right
* @param {number} bottom
* @param {number} top
* @param {number} near
* @param {number} far
* @returns {import("./types.js").Mat4}
*/
function ortho(a, left, right, bottom, top, near, far) {
	const lr = left - right;
	const bt = bottom - top;
	const nf = near - far;
	a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = 0;
	a[0] = -2 / lr;
	a[5] = -2 / bt;
	a[10] = 2 / nf;
	a[12] = (left + right) / lr;
	a[13] = (top + bottom) / bt;
	a[14] = (far + near) / nf;
	a[15] = 1;
	return a;
}
/**
* Creates an orthographic matrix with depth mapped to [0, 1]
* (WebGPU/DirectX/Metal/Vulkan).
*
* @param {import("./types.js").Mat4} a
* @param {number} left
* @param {number} right
* @param {number} bottom
* @param {number} top
* @param {number} near
* @param {number} far
* @returns {import("./types.js").Mat4}
*/
function orthoZO(a, left, right, bottom, top, near, far) {
	const lr = left - right;
	const bt = bottom - top;
	const nf = near - far;
	a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = 0;
	a[0] = -2 / lr;
	a[5] = -2 / bt;
	a[10] = 1 / nf;
	a[12] = (left + right) / lr;
	a[13] = (top + bottom) / bt;
	a[14] = near / nf;
	a[15] = 1;
	return a;
}
/**
* Calculates a lookAt matrix from position, target and up vectors.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Vec3} from
* @param {import("./types.js").Vec3} to
* @param {import("./types.js").Vec3} [up=Y_UP]
* @returns {import("./types.js").Mat4}
*/
function lookAt(a, [eyex, eyey, eyez], [targetx, targety, targetz], [upx, upy, upz] = Y_UP) {
	if (Math.abs(eyex - targetx) < 1e-6 && Math.abs(eyey - targety) < 1e-6 && Math.abs(eyez - targetz) < 1e-6) return identity$1(a);
	let z0 = eyex - targetx;
	let z1 = eyey - targety;
	let z2 = eyez - targetz;
	let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;
	let x0 = upy * z2 - upz * z1;
	let x1 = upz * z0 - upx * z2;
	let x2 = upx * z1 - upy * z0;
	len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	if (len) {
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}
	let y0 = z1 * x2 - z2 * x1;
	let y1 = z2 * x0 - z0 * x2;
	let y2 = z0 * x1 - z1 * x0;
	len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	if (len) {
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}
	a[0] = x0;
	a[1] = y0;
	a[2] = z0;
	a[3] = 0;
	a[4] = x1;
	a[5] = y1;
	a[6] = z1;
	a[7] = 0;
	a[8] = x2;
	a[9] = y2;
	a[10] = z2;
	a[11] = 0;
	a[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	a[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	a[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	a[15] = 1;
	return a;
}
/**
* Sets a matrix from a direction. Note: we assume +Z facing models.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Vec3} direction
* @param {import("./types.js").Vec3} [up=Y_UP]
* @returns {import("./types.js").Mat4}
*/
function fromDirection$1(a, [dir0, dir1, dir2], [upx, upy, upz] = Y_UP) {
	let len = dir0 * dir0 + dir1 * dir1 + dir2 * dir2;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		dir0 *= len;
		dir1 *= len;
		dir2 *= len;
	}
	let x0 = upy * dir2 - upz * dir1;
	let x1 = upz * dir0 - upx * dir2;
	let x2 = upx * dir1 - upy * dir0;
	len = x0 * x0 + x1 * x1 + x2 * x2;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}
	upx = dir1 * x2 - dir2 * x1;
	upy = dir2 * x0 - dir0 * x2;
	upz = dir0 * x1 - dir1 * x0;
	len = upx * upx + upy * upy + upz * upz;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		upx *= len;
		upy *= len;
		upz *= len;
	}
	a[0] = x0;
	a[1] = x1;
	a[2] = x2;
	a[3] = 0;
	a[4] = upx;
	a[5] = upy;
	a[6] = upz;
	a[7] = 0;
	a[8] = dir0;
	a[9] = dir1;
	a[10] = dir2;
	a[11] = 0;
	a[12] = 0;
	a[13] = 0;
	a[14] = 0;
	a[15] = 1;
	return a;
}
/**
* Sets a matrix from a point to another.
*
* @param {import("./types.js").Mat4} a
* @param {import("./types.js").Vec3} from
* @param {import("./types.js").Vec3} to
* @param {import("./types.js").Vec3} [up=Y_UP]
* @returns {import("./types.js").Mat4}
*/
function fromPointToPoint$1(a, [fromX, fromY, fromZ], [toX, toY, toZ], up) {
	return fromDirection$1(a, [
		toX - fromX,
		toY - fromY,
		toZ - fromZ
	], up);
}

var vec2_exports = /* @__PURE__ */ __exportAll({
	add: () => add$5,
	addScaled: () => addScaled$5,
	copy: () => copy$3,
	create: () => create$4,
	distance: () => distance$3,
	distanceSq: () => distanceSq$3,
	dot: () => dot$4,
	equals: () => equals$6,
	length: () => length$4,
	lengthSq: () => lengthSq$3,
	lerp: () => lerp$5,
	limit: () => limit$3,
	normalize: () => normalize$4,
	scale: () => scale$5,
	set: () => set$6,
	sub: () => sub$5,
	toString: () => toString$6
});
/** @module vec2 */
/**
* Returns a new vec2 at 0, 0.
*
* @returns {import("./types.js").Vec2}
*/
function create$4() {
	return [0, 0];
}
/**
* Returns a copy of a vector.
*
* @param {import("./types.js").Vec2} a
* @returns {import("./types.js").Vec2}
*/
function copy$3(a) {
	return a.slice();
}
/**
* Sets a vector to another vector.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {import("./types.js").Vec2}
*/
function set$6(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	return a;
}
/**
* Compares two vectors.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {boolean}
*/
function equals$6(a, b) {
	return a[0] === b[0] && a[1] === b[1];
}
/**
* Add a vector to another.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {import("./types.js").Vec2}
*/
function add$5(a, b) {
	a[0] += b[0];
	a[1] += b[1];
	return a;
}
/**
* Subtracts a vector from another.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {import("./types.js").Vec2}
*/
function sub$5(a, b) {
	a[0] -= b[0];
	a[1] -= b[1];
	return a;
}
/**
* Scales a vector by a number.
*
* @param {import("./types.js").Vec2} a
* @param {number} s
* @returns {import("./types.js").Vec2}
*/
function scale$5(a, s) {
	a[0] *= s;
	a[1] *= s;
	return a;
}
/**
* Adds two vectors after scaling the second one.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @param {number} s
* @returns {import("./types.js").Vec2}
*/
function addScaled$5(a, b, s) {
	a[0] += b[0] * s;
	a[1] += b[1] * s;
	return a;
}
/**
* Calculates the dot product of two vectors.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {number}
*/
function dot$4(a, b) {
	return a[0] * b[0] + a[1] * b[1];
}
/**
* Calculates the length of a vector.
*
* @param {import("./types.js").Vec2} a
* @returns {number}
*/
function length$4(a) {
	const x = a[0];
	const y = a[1];
	return Math.sqrt(x * x + y * y);
}
/**
* Calculates the squared length of a vector.
*
* @param {import("./types.js").Vec2} a
* @returns {number}
*/
function lengthSq$3(a) {
	const x = a[0];
	const y = a[1];
	return x * x + y * y;
}
/**
* Normalises a vector.
*
* @param {import("./types.js").Vec2} a
* @returns {import("./types.js").Vec2}
*/
function normalize$4(a) {
	const x = a[0];
	const y = a[1];
	let l = Math.sqrt(x * x + y * y);
	l = 1 / (l || 1);
	a[0] *= l;
	a[1] *= l;
	return a;
}
/**
* Calculates the distance between two vectors.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {number}
*/
function distance$3(a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	return Math.sqrt(dx * dx + dy * dy);
}
/**
* Calculates the squared distance between two vectors.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @returns {number}
*/
function distanceSq$3(a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	return dx * dx + dy * dy;
}
/**
* Limits a vector to a length.
*
* @param {import("./types.js").Vec2} a
* @param {number} len
* @returns {import("./types.js").Vec2}
*/
function limit$3(a, len) {
	const x = a[0];
	const y = a[1];
	const dsq = x * x + y * y;
	const lsq = len * len;
	if (lsq > 0 && dsq > lsq) {
		const nd = len / Math.sqrt(dsq);
		a[0] *= nd;
		a[1] *= nd;
	}
	return a;
}
/**
* Linearly interpolates between two vectors.
*
* @param {import("./types.js").Vec2} a
* @param {import("./types.js").Vec2} b
* @param {number} t
* @returns {import("./types.js").Vec2}
*/
function lerp$5(a, b, t) {
	const x = a[0];
	const y = a[1];
	a[0] = x + (b[0] - x) * t;
	a[1] = y + (b[1] - y) * t;
	return a;
}
/**
* Prints a vector to a string.
*
* @param {import("./types.js").Vec2} a
* @param {number} [precision=4]
* @returns {string}
*/
function toString$6(a, precision = 4) {
	const scale = 10 ** precision;
	return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}]`;
}

var vec3_exports = /* @__PURE__ */ __exportAll({
	add: () => add$4,
	addScaled: () => addScaled$4,
	copy: () => copy$2,
	create: () => create$3,
	cross: () => cross$1,
	distance: () => distance$2,
	distanceSq: () => distanceSq$2,
	dot: () => dot$3,
	equals: () => equals$5,
	length: () => length$3,
	lengthSq: () => lengthSq$2,
	lerp: () => lerp$4,
	limit: () => limit$2,
	multMat4: () => multMat4$3,
	multQuat: () => multQuat$1,
	normalize: () => normalize$3,
	scale: () => scale$4,
	set: () => set$5,
	sub: () => sub$4,
	toString: () => toString$5
});
/** @module vec3 */
/**
* Returns a new vec3 at 0, 0, 0.
*
* @returns {import("./types.js").Vec3}
*/
function create$3() {
	return [
		0,
		0,
		0
	];
}
/**
* Returns a copy of a vector.
*
* @param {import("./types.js").Vec3} a
* @returns {import("./types.js").Vec3}
*/
function copy$2(a) {
	return a.slice();
}
/**
* Sets a vector to another vector.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {import("./types.js").Vec3}
*/
function set$5(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	return a;
}
/**
* Compares two vectors.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {boolean}
*/
function equals$5(a, b) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
/**
* Adds a vector to another.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {import("./types.js").Vec3}
*/
function add$4(a, b) {
	a[0] += b[0];
	a[1] += b[1];
	a[2] += b[2];
	return a;
}
/**
* Subtracts a vector from another.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {import("./types.js").Vec3}
*/
function sub$4(a, b) {
	a[0] -= b[0];
	a[1] -= b[1];
	a[2] -= b[2];
	return a;
}
/**
* Scales a vector by a number.
*
* @param {import("./types.js").Vec3} a
* @param {number} s
* @returns {import("./types.js").Vec3}
*/
function scale$4(a, s) {
	a[0] *= s;
	a[1] *= s;
	a[2] *= s;
	return a;
}
/**
* Adds two vectors after scaling the second one.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @param {number} s
* @returns {import("./types.js").Vec3}
*/
function addScaled$4(a, b, s) {
	a[0] += b[0] * s;
	a[1] += b[1] * s;
	a[2] += b[2] * s;
	return a;
}
/**
* Multiplies a vector by a matrix.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Mat4} m
* @returns {import("./types.js").Vec3}
*/
function multMat4$3(a, m) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	a[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
	a[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
	a[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
	return a;
}
/**
* Multiplies a vector by a quaternion.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Quat} q
* @returns {import("./types.js").Vec3}
*/
function multQuat$1(a, q) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const qx = q[0];
	const qy = q[1];
	const qz = q[2];
	const qw = q[3];
	const ix = qw * x + qy * z - qz * y;
	const iy = qw * y + qz * x - qx * z;
	const iz = qw * z + qx * y - qy * x;
	const iw = -qx * x - qy * y - qz * z;
	a[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	a[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	a[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	return a;
}
/**
* Calculates the dot product of two vectors.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {number}
*/
function dot$3(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
* Calculates the cross product of two vectors.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {import("./types.js").Vec3}
*/
function cross$1(a, b) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const vx = b[0];
	const vy = b[1];
	const vz = b[2];
	a[0] = y * vz - vy * z;
	a[1] = z * vx - vz * x;
	a[2] = x * vy - vx * y;
	return a;
}
/**
* Calculates the length of a vector.
*
* @param {import("./types.js").Vec3} a
* @returns {number}
*/
function length$3(a) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	return Math.sqrt(x * x + y * y + z * z);
}
/**
* Calculates the squared length of a vector.
*
* @param {import("./types.js").Vec3} a
* @returns {number}
*/
function lengthSq$2(a) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	return x * x + y * y + z * z;
}
/**
* Normalises a vector.
*
* @param {import("./types.js").Vec3} a
* @returns {import("./types.js").Vec3}
*/
function normalize$3(a) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	let l = Math.sqrt(x * x + y * y + z * z);
	l = 1 / (l || 1);
	a[0] *= l;
	a[1] *= l;
	a[2] *= l;
	return a;
}
/**
* Calculates the distance between two vectors.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {number}
*/
function distance$2(a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const dz = b[2] - a[2];
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/**
* Calculates the squared distance between two vectors.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @returns {number}
*/
function distanceSq$2(a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const dz = b[2] - a[2];
	return dx * dx + dy * dy + dz * dz;
}
/**
* Limits a vector to a length.
*
* @param {import("./types.js").Vec3} a
* @param {number} len
* @returns {import("./types.js").Vec3}
*/
function limit$2(a, len) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const dsq = x * x + y * y + z * z;
	const lsq = len * len;
	if (lsq > 0 && dsq > lsq) {
		const nd = len / Math.sqrt(dsq);
		a[0] *= nd;
		a[1] *= nd;
		a[2] *= nd;
	}
	return a;
}
/**
* Linearly interpolates between two vectors.
*
* @param {import("./types.js").Vec3} a
* @param {import("./types.js").Vec3} b
* @param {number} t
* @returns {import("./types.js").Vec3}
*/
function lerp$4(a, b, t) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	a[0] = x + (b[0] - x) * t;
	a[1] = y + (b[1] - y) * t;
	a[2] = z + (b[2] - z) * t;
	return a;
}
/**
* Prints a vector to a string.
*
* @param {import("./types.js").Vec3} a
* @param {number} [precision=4]
* @returns {string}
*/
function toString$5(a, precision = 4) {
	const scale = 10 ** precision;
	return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}, ${Math.floor(a[2] * scale) / scale}]`;
}

var vec4_exports = /* @__PURE__ */ __exportAll({
	add: () => add$3,
	addScaled: () => addScaled$3,
	copy: () => copy$1,
	create: () => create$2,
	equals: () => equals$4,
	fromVec3: () => fromVec3,
	lerp: () => lerp$3,
	multMat4: () => multMat4$2,
	scale: () => scale$3,
	set: () => set$4,
	sub: () => sub$3,
	toString: () => toString$4
});
/** @module vec4 */
/**
* Returns a new vec4 at 0, 0, 0, 1.
*
* @returns {import("./types.js").Vec4}
*/
function create$2() {
	return [
		0,
		0,
		0,
		1
	];
}
/**
* Returns a copy of a vector.
*
* @param {import("./types.js").Vec4} a
* @returns {import("./types.js").Vec4}
*/
function copy$1(a) {
	return a.slice();
}
/**
* Sets a vector to another vector.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec4} b
* @returns {import("./types.js").Vec4}
*/
function set$4(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[3] = b[3];
	return a;
}
/**
* Compares two vectors.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec4} b
* @returns {boolean}
*/
function equals$4(a, b) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
* Adds a vector to another.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec4} b
* @returns {import("./types.js").Vec4}
*/
function add$3(a, b) {
	a[0] += b[0];
	a[1] += b[1];
	a[2] += b[2];
	a[3] += b[3];
	return a;
}
/**
* Subtracts a vector from another.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec4} b
* @returns {import("./types.js").Vec4}
*/
function sub$3(a, b) {
	a[0] -= b[0];
	a[1] -= b[1];
	a[2] -= b[2];
	a[3] -= b[3];
	return a;
}
/**
* Scales a vector by a number.
*
* @param {import("./types.js").Vec4} a
* @param {number} s
* @returns {import("./types.js").Vec4}
*/
function scale$3(a, s) {
	a[0] *= s;
	a[1] *= s;
	a[2] *= s;
	a[3] *= s;
	return a;
}
/**
* Adds two vectors after scaling the second one.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec4} b
* @param {number} s
* @returns {import("./types.js").Vec4}
*/
function addScaled$3(a, b, s) {
	a[0] += b[0] * s;
	a[1] += b[1] * s;
	a[2] += b[2] * s;
	a[3] += b[3] * s;
	return a;
}
/**
* Create a vec4 from vec3.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec3} b
* @returns {import("./types.js").Vec4}
*/
function fromVec3(a, b) {
	a[0] = b[0];
	a[1] = b[1];
	a[2] = b[2];
	a[3] = 1;
	return a;
}
/**
* Multiplies a vector with a matrix.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Mat4} m
* @returns {import("./types.js").Vec4}
*/
function multMat4$2(a, m) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const w = a[3];
	a[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	a[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	a[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	a[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	return a;
}
/**
* Linearly interpolates between two vectors.
*
* @param {import("./types.js").Vec4} a
* @param {import("./types.js").Vec4} b
* @param {number} t
* @returns {import("./types.js").Vec4}
*/
function lerp$3(a, b, t) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const w = a[3];
	a[0] = x + (b[0] - x) * t;
	a[1] = y + (b[1] - y) * t;
	a[2] = z + (b[2] - z) * t;
	a[3] = w + (b[3] - w) * t;
	return a;
}
/**
* Prints a vector to a string.
*
* @param {import("./types.js").Vec4} a
* @param {number} [precision=4]
* @returns {string}
*/
function toString$4(a, precision = 4) {
	const scale = 10 ** precision;
	return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}, ${Math.floor(a[2] * scale) / scale}, ${Math.floor(a[3] * scale) / scale}]`;
}

/** @module avec2 */
var avec2_exports = /* @__PURE__ */ __exportAll({
	add: () => add$2,
	addScaled: () => addScaled$2,
	distance: () => distance$1,
	distanceSq: () => distanceSq$1,
	dot: () => dot$2,
	equals: () => equals$3,
	forEach: () => forEach$2,
	length: () => length$2,
	lengthSq: () => lengthSq$1,
	lerp: () => lerp$2,
	limit: () => limit$1,
	map: () => map$2,
	normalize: () => normalize$2,
	scale: () => scale$2,
	set: () => set$3,
	set2: () => set2,
	sub: () => sub$2,
	toString: () => toString$3
});
const TEMP_VEC2 = create$4();
/**
* Sets a vector components.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {number} x
* @param {number} y
*/
function set2(a, i, x, y) {
	a[i * 2] = x;
	a[i * 2 + 1] = y;
}
/**
* Sets a vector to another vector.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
*/
function set$3(a, i, b, j) {
	a[i * 2] = b[j * 2];
	a[i * 2 + 1] = b[j * 2 + 1];
}
/**
* Compares two vectors.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
* @returns {boolean}
*/
function equals$3(a, i, b, j) {
	return a[i * 2] === b[j * 2] && a[i * 2 + 1] === b[j * 2 + 1];
}
/**
* Adds a vector to another.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
*/
function add$2(a, i, b, j) {
	a[i * 2] += b[j * 2];
	a[i * 2 + 1] += b[j * 2 + 1];
}
/**
* Subtracts a vector from another.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
*/
function sub$2(a, i, b, j) {
	a[i * 2] -= b[j * 2];
	a[i * 2 + 1] -= b[j * 2 + 1];
}
/**
* Scales a vector by a number.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {number} s
*/
function scale$2(a, i, s) {
	a[i * 2] *= s;
	a[i * 2 + 1] *= s;
}
/**
* Adds two vectors after scaling the second one.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
* @param {number} s
*/
function addScaled$2(a, i, b, j, s) {
	a[i * 2] += b[j * 2] * s;
	a[i * 2 + 1] += b[j * 2 + 1] * s;
}
/**
* Calculates the dot product of two vectors.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
* @returns {number}
*/
function dot$2(a, i, b, j) {
	return a[i * 2] * b[j * 2] + a[i * 2 + 1] * b[j * 2 + 1];
}
/**
* Calculates the length of a vector.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @returns {number}
*/
function length$2(a, i) {
	const x = a[i * 2];
	const y = a[i * 2 + 1];
	return Math.sqrt(x * x + y * y);
}
/**
* Calculates the squared length of a vector.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @returns {number}
*/
function lengthSq$1(a, i) {
	const x = a[i * 2];
	const y = a[i * 2 + 1];
	return x * x + y * y;
}
/**
* Normalises a vector.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
*/
function normalize$2(a, i) {
	const lenSq = a[i * 2] * a[i * 2] + a[i * 2 + 1] * a[i * 2 + 1];
	if (lenSq > 0) {
		const len = Math.sqrt(lenSq);
		a[i * 2] /= len;
		a[i * 2 + 1] /= len;
	}
}
/**
* Calculates the distance between two vectors.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
* @returns {number}
*/
function distance$1(a, i, b, j) {
	const dx = b[j * 2] - a[i * 2];
	const dy = b[j * 2 + 1] - a[i * 2 + 1];
	return Math.sqrt(dx * dx + dy * dy);
}
/**
* Calculates the squared distance between two vectors.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
* @returns {number}
*/
function distanceSq$1(a, i, b, j) {
	const dx = b[j * 2] - a[i * 2];
	const dy = b[j * 2 + 1] - a[i * 2 + 1];
	return dx * dx + dy * dy;
}
/**
* Limits a vector to a length.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {number} len
*/
function limit$1(a, i, len) {
	const x = a[i * 2];
	const y = a[i * 2 + 1];
	const dsq = x * x + y * y;
	const lsq = len * len;
	if (lsq > 0 && dsq > lsq) {
		const nd = len / Math.sqrt(dsq);
		a[i * 2] *= nd;
		a[i * 2 + 1] *= nd;
	}
}
/**
* Linearly interpolates between two vectors.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {import("./types.js").AVec2} b
* @param {number} j
* @param {number} t
*/
function lerp$2(a, i, b, j, t) {
	const x = a[i * 2];
	const y = a[i * 2 + 1];
	a[i * 2] = x + (b[j * 2] - x) * t;
	a[i * 2 + 1] = y + (b[j * 2 + 1] - y) * t;
}
/**
* Executes a function once for each array element.
*
* @param {import("./types.js").AVec2} a
* @param {import("./types.js").iterativeCallback} callbackFn
*/
function forEach$2(a, callbackFn) {
	for (let i = 0; i < a.length / 2; i++) {
		TEMP_VEC2[0] = a[i * 2];
		TEMP_VEC2[1] = a[i * 2 + 1];
		callbackFn(TEMP_VEC2, i, a);
		a[i * 2] = TEMP_VEC2[0];
		a[i * 2 + 1] = TEMP_VEC2[1];
	}
}
/**
* Creates a new array populated with the results of calling a provided function
* on every element in the calling array.
*
* @param {import("./types.js").AVec2} a
* @param {import("./types.js").iterativeCallback} callbackFn
* @returns {import("./types.js").AVec2}
*/
function map$2(a, callbackFn) {
	const b = new a.constructor(a.length);
	const element = new a.constructor(2);
	for (let i = 0; i < a.length / 2; i++) {
		element[0] = a[i * 2];
		element[1] = a[i * 2 + 1];
		const returnValue = callbackFn(element, i, a);
		b[i * 2] = returnValue[0];
		b[i * 2 + 1] = returnValue[1];
	}
	return b;
}
/**
* Prints a vector to a string.
*
* @param {import("./types.js").AVec2} a
* @param {number} i
* @param {number} [precision=4]
* @returns {string}
*/
function toString$3(a, i, precision = 4) {
	const scale = 10 ** precision;
	return `[${Math.floor(a[i * 2] * scale) / scale}, ${Math.floor(a[i * 2 + 1] * scale) / scale}]`;
}

/** @module avec3 */
var avec3_exports = /* @__PURE__ */ __exportAll({
	add: () => add$1,
	addScaled: () => addScaled$1,
	cross: () => cross,
	distance: () => distance,
	distanceSq: () => distanceSq,
	dot: () => dot$1,
	equals: () => equals$2,
	forEach: () => forEach$1,
	length: () => length$1,
	lengthSq: () => lengthSq,
	lerp: () => lerp$1,
	limit: () => limit,
	map: () => map$1,
	multMat4: () => multMat4$1,
	multQuat: () => multQuat,
	normalize: () => normalize$1,
	scale: () => scale$1,
	set: () => set$2,
	set3: () => set3,
	sub: () => sub$1,
	toString: () => toString$2
});
const TEMP_VEC3 = create$3();
/**
* Sets a vector components.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {number} x
* @param {number} y
* @param {number} z
*/
function set3(a, i, x, y, z) {
	a[i * 3] = x;
	a[i * 3 + 1] = y;
	a[i * 3 + 2] = z;
}
/**
* Sets a vector to another vector.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
*/
function set$2(a, i, b, j) {
	a[i * 3] = b[j * 3];
	a[i * 3 + 1] = b[j * 3 + 1];
	a[i * 3 + 2] = b[j * 3 + 2];
}
/**
* Compares two vectors.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
* @returns {boolean}
*/
function equals$2(a, i, b, j) {
	return a[i * 3] === b[j * 3] && a[i * 3 + 1] === b[j * 3 + 1] && a[i * 3 + 2] === b[j * 3 + 2];
}
/**
* Adds a vector to another.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
*/
function add$1(a, i, b, j) {
	a[i * 3] += b[j * 3];
	a[i * 3 + 1] += b[j * 3 + 1];
	a[i * 3 + 2] += b[j * 3 + 2];
}
/**
* Subtracts a vector from another.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
*/
function sub$1(a, i, b, j) {
	a[i * 3] -= b[j * 3];
	a[i * 3 + 1] -= b[j * 3 + 1];
	a[i * 3 + 2] -= b[j * 3 + 2];
}
/**
* Scales a vector by a number.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {number} s
*/
function scale$1(a, i, s) {
	a[i * 3] *= s;
	a[i * 3 + 1] *= s;
	a[i * 3 + 2] *= s;
}
/**
* Adds two vectors after scaling the second one.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
* @param {number} s
*/
function addScaled$1(a, i, b, j, s) {
	a[i * 3] += b[j * 3] * s;
	a[i * 3 + 1] += b[j * 3 + 1] * s;
	a[i * 3 + 2] += b[j * 3 + 2] * s;
}
/**
* Multiplies a vector by a matrix.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AMat4} m
* @param {number} j
*/
function multMat4$1(a, i, m, j) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	a[i * 3] = m[j * 16] * x + m[j * 16 + 4] * y + m[j * 16 + 8] * z + m[j * 16 + 12];
	a[i * 3 + 1] = m[j * 16 + 1] * x + m[j * 16 + 5] * y + m[j * 16 + 9] * z + m[j * 16 + 13];
	a[i * 3 + 2] = m[j * 16 + 2] * x + m[j * 16 + 6] * y + m[j * 16 + 10] * z + m[j * 16 + 14];
}
/**
* Multiplies a vector by a quaternion.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AQuat} q
* @param {number} j
*/
function multQuat(a, i, q, j) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	const qx = q[j * 4];
	const qy = q[j * 4 + 1];
	const qz = q[j * 4 + 2];
	const qw = q[j * 4 + 3];
	const ix = qw * x + qy * z - qz * y;
	const iy = qw * y + qz * x - qx * z;
	const iz = qw * z + qx * y - qy * x;
	const iw = -qx * x - qy * y - qz * z;
	a[i * 3] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	a[i * 3 + 1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	a[i * 3 + 2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
}
/**
* Calculates the dot product of two vectors.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
* @returns {number}
*/
function dot$1(a, i, b, j) {
	return a[i * 3] * b[j * 3] + a[i * 3 + 1] * b[j * 3 + 1] + a[i * 3 + 2] * b[j * 3 + 2];
}
/**
* Calculates the cross product of two vectors.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
*/
function cross(a, i, b, j) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	const vx = b[j * 3];
	const vy = b[j * 3 + 1];
	const vz = b[j * 3 + 2];
	a[i * 3] = y * vz - vy * z;
	a[i * 3 + 1] = z * vx - vz * x;
	a[i * 3 + 2] = x * vy - vx * y;
}
/**
* Calculates the length of a vector.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @returns {number}
*/
function length$1(a, i) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	return Math.sqrt(x * x + y * y + z * z);
}
/**
* Calculates the squared length of a vector.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @returns {number}
*/
function lengthSq(a, i) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	return x * x + y * y + z * z;
}
/**
* Normalises a vector.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
*/
function normalize$1(a, i) {
	const lenSq = a[i * 3] * a[i * 3] + a[i * 3 + 1] * a[i * 3 + 1] + a[i * 3 + 2] * a[i * 3 + 2];
	if (lenSq > 0) {
		const len = Math.sqrt(lenSq);
		a[i * 3] /= len;
		a[i * 3 + 1] /= len;
		a[i * 3 + 2] /= len;
	}
}
/**
* Calculates the distance between two vectors.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
* @returns {number}
*/
function distance(a, i, b, j) {
	const dx = b[j * 3] - a[i * 3];
	const dy = b[j * 3 + 1] - a[i * 3 + 1];
	const dz = b[j * 3 + 2] - a[i * 3 + 2];
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/**
* Calculates the squared distance between two vectors.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
* @returns {number}
*/
function distanceSq(a, i, b, j) {
	const dx = b[j * 3] - a[i * 3];
	const dy = b[j * 3 + 1] - a[i * 3 + 1];
	const dz = b[j * 3 + 2] - a[i * 3 + 2];
	return dx * dx + dy * dy + dz * dz;
}
/**
* Limits a vector to a length.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {number} len
*/
function limit(a, i, len) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	const dsq = x * x + y * y + z * z;
	const lsq = len * len;
	if (lsq > 0 && dsq > lsq) {
		const nd = len / Math.sqrt(dsq);
		a[i * 3] *= nd;
		a[i * 3 + 1] *= nd;
		a[i * 3 + 2] *= nd;
	}
}
/**
* Linearly interpolates between two vectors.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {import("./types.js").AVec3} b
* @param {number} j
* @param {number} t
*/
function lerp$1(a, i, b, j, t) {
	const x = a[i * 3];
	const y = a[i * 3 + 1];
	const z = a[i * 3 + 2];
	a[i * 3] = x + (b[j * 3] - x) * t;
	a[i * 3 + 1] = y + (b[j * 3 + 1] - y) * t;
	a[i * 3 + 2] = z + (b[j * 3 + 2] - z) * t;
}
/**
* Executes a function once for each array element.
*
* @param {import("./types.js").AVec3} a
* @param {import("./types.js").iterativeCallback} callbackFn
*/
function forEach$1(a, callbackFn) {
	for (let i = 0; i < a.length / 3; i++) {
		TEMP_VEC3[0] = a[i * 3];
		TEMP_VEC3[1] = a[i * 3 + 1];
		TEMP_VEC3[2] = a[i * 3 + 2];
		callbackFn(TEMP_VEC3, i, a);
		a[i * 3] = TEMP_VEC3[0];
		a[i * 3 + 1] = TEMP_VEC3[1];
		a[i * 3 + 2] = TEMP_VEC3[2];
	}
}
/**
* Creates a new array populated with the results of calling a provided function
* on every element in the calling array.
*
* @param {import("./types.js").AVec3} a
* @param {import("./types.js").iterativeCallback} callbackFn
* @returns {import("./types.js").AVec3}
*/
function map$1(a, callbackFn) {
	const b = new a.constructor(a.length);
	const element = new a.constructor(3);
	for (let i = 0; i < a.length / 3; i++) {
		element[0] = a[i * 3];
		element[1] = a[i * 3 + 1];
		element[2] = a[i * 3 + 2];
		const returnValue = callbackFn(element, i, a);
		b[i * 3] = returnValue[0];
		b[i * 3 + 1] = returnValue[1];
		b[i * 3 + 2] = returnValue[2];
	}
	return b;
}
/**
* Prints a vector to a string.
*
* @param {import("./types.js").AVec3} a
* @param {number} i
* @param {number} [precision=4]
* @returns {string}
*/
function toString$2(a, i, precision = 4) {
	const scale = 10 ** precision;
	return `[${Math.floor(a[i * 3] * scale) / scale}, ${Math.floor(a[i * 3 + 1] * scale) / scale}, ${Math.floor(a[i * 3 + 2] * scale) / scale}]`;
}

/** @module avec4 */
var avec4_exports = /* @__PURE__ */ __exportAll({
	add: () => add,
	addScaled: () => addScaled,
	equals: () => equals$1,
	forEach: () => forEach,
	lerp: () => lerp,
	map: () => map,
	multMat4: () => multMat4,
	scale: () => scale,
	set: () => set$1,
	set4: () => set4,
	sub: () => sub,
	toString: () => toString$1
});
const TEMP_VEC4 = create$2();
/**
* Sets a vector components.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {number} x
* @param {number} y
* @param {number} z
* @param {number} w
*/
function set4(a, i, x, y, z, w) {
	a[i * 4] = x;
	a[i * 4 + 1] = y;
	a[i * 4 + 2] = z;
	a[i * 4 + 3] = w;
}
/**
* Sets a vector to another vector.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AVec4} b
* @param {number} j
*/
function set$1(a, i, b, j) {
	a[i * 4] = b[j * 4];
	a[i * 4 + 1] = b[j * 4 + 1];
	a[i * 4 + 2] = b[j * 4 + 2];
	a[i * 4 + 3] = b[j * 4 + 3];
}
/**
* Compares two vectors.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AVec4} b
* @param {number} j
* @returns {boolean}
*/
function equals$1(a, i, b, j) {
	return a[i * 4] === b[j * 4] && a[i * 4 + 1] === b[j * 4 + 1] && a[i * 4 + 2] === b[j * 4 + 2] && a[i * 4 + 3] === b[j * 4 + 3];
}
/**
* Adds a vector to another.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AVec4} b
* @param {number} j
*/
function add(a, i, b, j) {
	a[i * 4] += b[j * 4];
	a[i * 4 + 1] += b[j * 4 + 1];
	a[i * 4 + 2] += b[j * 4 + 2];
	a[i * 4 + 3] += b[j * 4 + 3];
}
/**
* Subtracts a vector from another.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AVec4} b
* @param {number} j
*/
function sub(a, i, b, j) {
	a[i * 4] -= b[j * 4];
	a[i * 4 + 1] -= b[j * 4 + 1];
	a[i * 4 + 2] -= b[j * 4 + 2];
	a[i * 4 + 3] -= b[j * 4 + 3];
}
/**
* Scales a vector by a number.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {number} s
*/
function scale(a, i, s) {
	a[i * 4] *= s;
	a[i * 4 + 1] *= s;
	a[i * 4 + 2] *= s;
	a[i * 4 + 3] *= s;
}
/**
* Adds two vectors after scaling the second one.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AVec4} b
* @param {number} j
* @param {number} s
*/
function addScaled(a, i, b, j, s) {
	a[i * 4] += b[j * 4] * s;
	a[i * 4 + 1] += b[j * 4 + 1] * s;
	a[i * 4 + 2] += b[j * 4 + 2] * s;
	a[i * 4 + 3] += b[j * 4 + 3] * s;
}
/**
* Multiplies a vector with a matrix.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AMat4} m
* @param {number} j
*/
function multMat4(a, i, m, j) {
	const x = a[i * 4];
	const y = a[i * 4 + 1];
	const z = a[i * 4 + 2];
	const w = a[i * 4 + 3];
	a[i * 4] = m[j * 16] * x + m[j * 16 + 4] * y + m[j * 16 + 8] * z + m[j * 16 + 12] * w;
	a[i * 4 + 1] = m[j * 16 + 1] * x + m[j * 16 + 5] * y + m[j * 16 + 9] * z + m[j * 16 + 13] * w;
	a[i * 4 + 2] = m[j * 16 + 2] * x + m[j * 16 + 6] * y + m[j * 16 + 10] * z + m[j * 16 + 14] * w;
	a[i * 4 + 3] = m[j * 16 + 3] * x + m[j * 16 + 7] * y + m[j * 16 + 11] * z + m[j * 16 + 15] * w;
}
/**
* Linearly interpolates between two vectors.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {import("./types.js").AVec4} b
* @param {number} j
* @param {number} t
*/
function lerp(a, i, b, j, t) {
	const x = a[i * 4];
	const y = a[i * 4 + 1];
	const z = a[i * 4 + 2];
	const w = a[i * 4 + 3];
	a[i * 4] = x + (b[j * 4] - x) * t;
	a[i * 4 + 1] = y + (b[j * 4 + 1] - y) * t;
	a[i * 4 + 2] = z + (b[j * 4 + 2] - z) * t;
	a[i * 4 + 3] = w + (b[j * 4 + 3] - w) * t;
}
/**
* Executes a function once for each array element.
*
* @param {import("./types.js").AVec4} a
* @param {import("./types.js").iterativeCallback} callbackFn
*/
function forEach(a, callbackFn) {
	for (let i = 0; i < a.length / 4; i++) {
		TEMP_VEC4[0] = a[i * 4];
		TEMP_VEC4[1] = a[i * 4 + 1];
		TEMP_VEC4[2] = a[i * 4 + 2];
		TEMP_VEC4[3] = a[i * 4 + 3];
		callbackFn(TEMP_VEC4, i, a);
		a[i * 4] = TEMP_VEC4[0];
		a[i * 4 + 1] = TEMP_VEC4[1];
		a[i * 4 + 2] = TEMP_VEC4[2];
		a[i * 4 + 3] = TEMP_VEC4[3];
	}
}
/**
* Creates a new array populated with the results of calling a provided function
* on every element in the calling array.
*
* @param {import("./types.js").AVec4} a
* @param {import("./types.js").iterativeCallback} callbackFn
* @returns {import("./types.js").AVec4}
*/
function map(a, callbackFn) {
	const b = new a.constructor(a.length);
	const element = new a.constructor(4);
	for (let i = 0; i < a.length / 4; i++) {
		element[0] = a[i * 4];
		element[1] = a[i * 4 + 1];
		element[2] = a[i * 4 + 2];
		element[3] = a[i * 4 + 3];
		const returnValue = callbackFn(element, i, a);
		b[i * 4] = returnValue[0];
		b[i * 4 + 1] = returnValue[1];
		b[i * 4 + 2] = returnValue[2];
		b[i * 4 + 3] = returnValue[3];
	}
	return b;
}
/**
* Prints a vector to a string.
*
* @param {import("./types.js").AVec4} a
* @param {number} i
* @param {number} [precision=4]
* @returns {string}
*/
function toString$1(a, i, precision = 4) {
	const scale = 10 ** precision;
	return `[${Math.floor(a[i * 4] * scale) / scale}, ${Math.floor(a[i * 4 + 1] * scale) / scale}, ${Math.floor(a[i * 4 + 2] * scale) / scale}, ${Math.floor(a[i * 4 + 3] * scale) / scale}]`;
}

/** @module quat */
var quat_exports = /* @__PURE__ */ __exportAll({
	_fromMat39: () => _fromMat39,
	conjugate: () => conjugate,
	copy: () => copy,
	create: () => create$1,
	dot: () => dot,
	equals: () => equals,
	fromAxes: () => fromAxes,
	fromAxisAngle: () => fromAxisAngle,
	fromDirection: () => fromDirection,
	fromEuler: () => fromEuler,
	fromMat3: () => fromMat3,
	fromMat4: () => fromMat4,
	fromPointToPoint: () => fromPointToPoint,
	identity: () => identity,
	invert: () => invert,
	length: () => length,
	mult: () => mult,
	normalize: () => normalize,
	set: () => set,
	slerp: () => slerp,
	toString: () => toString
});
const TEMP_MAT4 = create$5();
/**
* Returns a new quat at 0, 0, 0, 1.
*
* @returns {import("./types.js").Quat}
*/
function create$1() {
	return [
		0,
		0,
		0,
		1
	];
}
/**
* Sets a quaternion to the identity quaternion.
*
* @param {import("./types.js").Quat} a
* @returns {import("./types.js").Quat}
*/
function identity(a) {
	a[0] = a[1] = a[2] = 0;
	a[3] = 1;
	return a;
}
/**
* Returns a copy of a quaternion.
*
* @param {import("./types.js").Quat} a
* @returns {import("./types.js").Quat}
*/
function copy(a) {
	return a.slice();
}
/**
* Sets a quaternion to another quaternion.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Quat} b
* @returns {import("./types.js").Quat}
*/
const set = set$4;
/**
* Compares two quaternions.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Quat} b
* @returns {boolean}
*/
const equals = equals$4;
/**
* Multiplies one quaternion by another.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Quat} b
* @returns {import("./types.js").Quat}
*/
function mult(a, b) {
	const ax = a[0];
	const ay = a[1];
	const az = a[2];
	const aw = a[3];
	const bx = b[0];
	const by = b[1];
	const bz = b[2];
	const bw = b[3];
	a[0] = aw * bx + ax * bw + ay * bz - az * by;
	a[1] = aw * by + ay * bw + az * bx - ax * bz;
	a[2] = aw * bz + az * bw + ax * by - ay * bx;
	a[3] = aw * bw - ax * bx - ay * by - az * bz;
	return a;
}
/**
* Inverts a quaternion.
*
* @param {import("./types.js").Quat} a
* @returns {import("./types.js").Quat}
*/
function invert(a) {
	let l = dot(a, a);
	l = l ? 1 / l : 0;
	a[0] *= -l;
	a[1] *= -l;
	a[2] *= -l;
	a[3] *= l;
	return a;
}
/**
* Conjugates a quaternion.
*
* @param {import("./types.js").Quat} a
* @returns {import("./types.js").Quat}
*/
function conjugate(a) {
	a[0] *= -1;
	a[1] *= -1;
	a[2] *= -1;
	return a;
}
/**
* Calculates the length of a quaternion.
*
* @param {import("./types.js").Quat} a
* @returns {import("./types.js").Quat}
*/
function length(a) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const w = a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
}
/**
* Normalizes a quaternion.
*
* @param {import("./types.js").Quat} a
* @returns {import("./types.js").Quat}
*/
function normalize(a) {
	const x = a[0];
	const y = a[1];
	const z = a[2];
	const w = a[3];
	const l = 1 / (Math.sqrt(x * x + y * y + z * z + w * w) || 1);
	a[0] *= l;
	a[1] *= l;
	a[2] *= l;
	a[3] *= l;
	return a;
}
/**
* Calculates the dot product of two quaternions.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Quat} b
* @returns {import("./types.js").Quat}
*/
function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
* Set euler angles to a quaternion. Assumes XYZ rotation order.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Euler} e
* @returns {import("./types.js").Quat}
*/
function fromEuler(a, e) {
	const x = e[0];
	const y = e[1];
	const z = e[2];
	const cx = Math.cos(x / 2);
	const cy = Math.cos(y / 2);
	const cz = Math.cos(z / 2);
	const sx = Math.sin(x / 2);
	const sy = Math.sin(y / 2);
	const sz = Math.sin(z / 2);
	a[0] = sx * cy * cz + cx * sy * sz;
	a[1] = cx * sy * cz - sx * cy * sz;
	a[2] = cx * cy * sz + sx * sy * cz;
	a[3] = cx * cy * cz - sx * sy * sz;
	return a;
}
/**
* Set the angle at an axis of a quaternion.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Vec3} v
* @param {import("./types.js").Radians} r
* @returns {import("./types.js").Quat}
*/
function fromAxisAngle(a, v, r) {
	const angle2 = r / 2;
	const sin2 = Math.sin(angle2);
	a[0] = v[0] * sin2;
	a[1] = v[1] * sin2;
	a[2] = v[2] * sin2;
	a[3] = Math.cos(angle2);
	return normalize(a);
}
/** @private */
function _fromMat39(a, m0, m1, m2, m3, m4, m5, m6, m7, m8) {
	const trace = m0 + m4 + m8;
	let s;
	if (trace >= 0) {
		s = Math.sqrt(trace + 1);
		a[3] = s / 2;
		s = .5 / s;
		a[0] = (m5 - m7) * s;
		a[1] = (m6 - m2) * s;
		a[2] = (m1 - m3) * s;
	} else if (m0 > m4 && m0 > m8) {
		s = Math.sqrt(1 + m0 - m4 - m8);
		a[0] = s / 2;
		s = .5 / s;
		a[1] = (m1 + m3) * s;
		a[2] = (m6 + m2) * s;
		a[3] = (m5 - m7) * s;
	} else if (m4 > m8) {
		s = Math.sqrt(1 + m4 - m0 - m8);
		a[1] = s / 2;
		s = .5 / s;
		a[0] = (m1 + m3) * s;
		a[2] = (m5 + m7) * s;
		a[3] = (m6 - m2) * s;
	} else {
		s = Math.sqrt(1 + m8 - m0 - m4);
		a[2] = s / 2;
		s = .5 / s;
		a[0] = (m6 + m2) * s;
		a[1] = (m5 + m7) * s;
		a[3] = (m1 - m3) * s;
	}
	return a;
}
/**
* Sets a quaternion from orthonormal base xyz.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Vec3} x
* @param {import("./types.js").Vec3} y
* @param {import("./types.js").Vec3} z
* @returns {import("./types.js").Quat}
*/
function fromAxes(a, x, y, z) {
	return _fromMat39(a, x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]);
}
/**
* Sets a quaternion to a 3x3 matrix.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Mat3} m
* @returns {import("./types.js").Quat}
*/
function fromMat3(a, m) {
	return _fromMat39(a, m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
}
/**
* Sets a quaternion to a 4x4 matrix.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Mat4} m
* @returns {import("./types.js").Quat}
*/
function fromMat4(a, m) {
	return _fromMat39(a, m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]);
}
/**
* Sets a quaternion from a direction Note: we assume +Z facing models.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Vec3} direction
* @param {import("./types.js").Vec3} [up=Y_UP]
* @returns {import("./types.js").Quat}
*/
function fromDirection(a, direction, up) {
	return fromMat4(a, fromDirection$1(TEMP_MAT4, direction, up));
}
/**
* Sets a quaternion from a point to another.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Vec3} from
* @param {import("./types.js").Vec3} to
* @param {import("./types.js").Vec3} [up=Y_UP]
* @returns {import("./types.js").Quat}
*/
function fromPointToPoint(a, from, to, up) {
	return fromMat4(a, fromPointToPoint$1(TEMP_MAT4, from, to, up));
}
/**
* Spherical linear interpolates between two quaternions.
*
* @param {import("./types.js").Quat} a
* @param {import("./types.js").Quat} b
* @param {number} t
* @returns {import("./types.js").Quat}
*/
function slerp(a, b, t) {
	const ax = a[0];
	const ay = a[1];
	const az = a[2];
	const aw = a[3];
	const bx = b[0];
	const by = b[1];
	const bz = b[2];
	const bw = b[3];
	let omega;
	let cosom;
	let sinom;
	let scale0;
	let scale1;
	cosom = dot(a, b);
	if (cosom < 0) {
		cosom = -cosom;
		a[0] = -bx;
		a[1] = -by;
		a[2] = -bz;
		a[3] = -bw;
	} else {
		a[0] = bx;
		a[1] = by;
		a[2] = bz;
		a[3] = bw;
	}
	if (1 - cosom > 1e-6) {
		omega = Math.acos(cosom);
		sinom = Math.sin(omega);
		scale0 = Math.sin((1 - t) * omega) / sinom;
		scale1 = Math.sin(t * omega) / sinom;
	} else {
		scale0 = 1 - t;
		scale1 = t;
	}
	a[0] = scale0 * ax + scale1 * a[0];
	a[1] = scale0 * ay + scale1 * a[1];
	a[2] = scale0 * az + scale1 * a[2];
	a[3] = scale0 * aw + scale1 * a[3];
	return a;
}
/**
* Prints a quaternion to a string.
*
* @param {import("./types.js").Quat} a
* @param {number} precision
* @returns {import("./types.js").Quat}
*/
const toString = toString$4;

/** @module euler */
var euler_exports = /* @__PURE__ */ __exportAll({
	create: () => create,
	fromQuat: () => fromQuat
});
/**
* Create a new euler angles [0, 0, 0]: vec3 array of [x, y, z] rotation [yaw,
* pitch, roll] in radians.
*
* @returns {import("./types.js").Euler}
*/
function create() {
	return [
		0,
		0,
		0
	];
}
/**
* Creates euler angles from quaternion. Assumes XYZ order of rotations.
*
* @param {import("./types.js").Euler} a
* @param {import("./types.js").Quat} q
* @returns {import("./types.js").Euler}
*/
function fromQuat(a, q) {
	const sqx = q[0] * q[0];
	const sqy = q[1] * q[1];
	const sqz = q[2] * q[2];
	const sqw = q[3] * q[3];
	a[0] = Math.atan2(2 * (q[0] * q[3] - q[1] * q[2]), sqw - sqx - sqy + sqz);
	a[1] = Math.asin(clamp(2 * (q[0] * q[2] + q[1] * q[3]), -1, 1));
	a[2] = Math.atan2(2 * (q[2] * q[3] - q[0] * q[1]), sqw + sqx - sqy - sqz);
	return a;
}

/** @module eases */
var eases_exports = /* @__PURE__ */ __exportAll({
	backIn: () => backIn,
	backInOut: () => backInOut,
	backOut: () => backOut,
	bounceIn: () => bounceIn,
	bounceInOut: () => bounceInOut,
	bounceOut: () => bounceOut,
	circIn: () => circIn,
	circInOut: () => circInOut,
	circOut: () => circOut,
	cubicIn: () => cubicIn,
	cubicInOut: () => cubicInOut,
	cubicOut: () => cubicOut,
	elasticIn: () => elasticIn,
	elasticInOut: () => elasticInOut,
	elasticOut: () => elasticOut,
	expoIn: () => expoIn,
	expoInOut: () => expoInOut,
	expoOut: () => expoOut,
	linear: () => linear,
	quadIn: () => quadIn,
	quadInOut: () => quadInOut,
	quadOut: () => quadOut,
	quartIn: () => quartIn,
	quartInOut: () => quartInOut,
	quartOut: () => quartOut,
	quintIn: () => quintIn,
	quintInOut: () => quintInOut,
	quintOut: () => quintOut,
	sineIn: () => sineIn,
	sineInOut: () => sineInOut,
	sineOut: () => sineOut,
	stepBoth: () => stepBoth,
	stepEnd: () => stepEnd,
	stepNone: () => stepNone,
	stepStart: () => stepStart
});
const out = (easeIn) => (t, ...rest) => 1 - easeIn(1 - t, ...rest);
const inOut = (easeIn) => (t, ...rest) => t < .5 ? easeIn(t * 2, ...rest) * .5 : 1 - easeIn((1 - t) * 2, ...rest) * .5;
const linear = (t) => t;
const sineIn = (t) => 1 - Math.cos(t * HALF_PI);
const sineOut = (t) => Math.sin(t * HALF_PI);
const sineInOut = (t) => -.5 * (Math.cos(Math.PI * t) - 1);
const quadIn = (t) => t ** 2;
const quadOut = out(quadIn);
const quadInOut = inOut(quadIn);
const cubicIn = (t) => t ** 3;
const cubicOut = out(cubicIn);
const cubicInOut = inOut(cubicIn);
const quartIn = (t) => t ** 4;
const quartOut = out(quartIn);
const quartInOut = inOut(quartIn);
const quintIn = (t) => t ** 5;
const quintOut = out(quintIn);
const quintInOut = inOut(quintIn);
const boundZero = (t) => {
	if (t === 0) return 0;
};
const expoIn = (t) => boundZero(t) ?? 2 ** (10 * t - 10);
const expoOut = out(expoIn);
const expoInOut = inOut(expoIn);
const circIn = (t) => 1 - Math.sqrt(1 - t ** 2);
const circOut = out(circIn);
const circInOut = inOut(circIn);
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = 2.70158;
const c4 = 3.5949095;
const backIn = (t) => t ** 2 * (c3 * t - c1);
const backOut = out(backIn);
const backInOut = (t) => {
	const t2 = t * 2;
	if (t2 < 1) return .5 * (t2 ** 2 * (c4 * t2 - c2));
	return .5 * ((t2 - 2) ** 2 * (c4 * (t2 - 2) + c2) + 2);
};
const elasticIn = (t) => Math.sin(13 * t * HALF_PI) * expoIn(t);
const elasticOut = out(elasticIn);
const elasticInOut = inOut(elasticIn);
const n1 = 7.5625;
const d1 = 2.75;
const d1_1 = 1 / d1;
const d1_2 = 2 / d1;
const d1_1_5 = 1.5 / d1;
const d1_2_5 = 2.5 / d1;
const d1_2_25 = 2.25 / d1;
const d1_2_625 = 2.625 / d1;
const bounceOut = (t) => {
	if (t < d1_1) return n1 * t ** 2;
	if (t < d1_2) return n1 * (t - d1_1_5) ** 2 + .75;
	if (t < d1_2_5) return n1 * (t - d1_2_25) ** 2 + .9375;
	return n1 * (t - d1_2_625) ** 2 + .984375;
};
const bounceIn = (t) => 1 - bounceOut(1 - t);
const bounceInOut = (t) => t < .5 ? .5 * (1 - bounceOut(1 - 2 * t)) : .5 + .5 * bounceOut(2 * t - 1);
const stepEdges = (t) => {
	if (t <= 0) return 0;
	if (t >= 1) return 1;
};
const stepStart = (t, n = 1) => stepEdges(t) ?? Math.ceil(t * n) / n;
const stepEnd = (t, n = 1) => stepEdges(t) ?? Math.floor(t * n) / n;
const stepNone = (t, n = 1) => stepEdges(t) ?? Math.floor(t * n) / (n - 1);
const stepBoth = (t, n = 1) => stepEdges(t) ?? (Math.floor(t * n) + .5) / n;

export { frustum as A, toRadians as B, scale$4 as C, distance$3 as D, vec3_exports as E, perspective as F, mat3_exports as H, set$7 as I, clamp as L, lookAt as M, mat4_exports as N, vec2_exports as O, ortho as P, lerp$6 as R, normalize$3 as S, sub$4 as T, mat2x3_exports as U, utils_exports as V, create$3 as _, addScaled$1 as a, length$3 as b, length$1 as c, set$2 as d, sub$1 as f, copy$2 as g, add$4 as h, avec4_exports as i, invert$1 as j, create$5 as k, normalize$1 as l, vec4_exports as m, euler_exports as n, avec3_exports as o, avec2_exports as p, quat_exports as r, distanceSq as s, eases_exports as t, scale$1 as u, distance$2 as v, set$5 as w, multMat4$3 as x, dot$3 as y, toDegrees as z };