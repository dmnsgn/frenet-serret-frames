import { a as assert_1 } from './common/assert-3c9665cb.js';
import { r as raf_1 } from './common/index-1eec4427.js';
import './common/esnext.set.union-8fae8fd1.js';
import './common/to-object-b740b57d.js';
import './common/es.typed-array.uint32-array-f3332013.js';
import './common/es.typed-array.float32-array-cc8d9a55.js';

function create() {
  return [0, 0, 0];
}

function equals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function set(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  return a;
}

function add(a, b) {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
  return a;
}

function sub(a, b) {
  a[0] -= b[0];
  a[1] -= b[1];
  a[2] -= b[2];
  return a;
}

function scale(a, n) {
  a[0] *= n;
  a[1] *= n;
  a[2] *= n;
  return a;
}

function multMat4(a, m) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  a[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
  a[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
  a[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  return a;
}

function multQuat(a, q) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var qx = q[0];
  var qy = q[1];
  var qz = q[2];
  var qw = q[3];
  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;
  a[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  a[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  a[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return a;
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var vx = b[0];
  var vy = b[1];
  var vz = b[2];
  a[0] = y * vz - vy * z;
  a[1] = z * vx - vz * x;
  a[2] = x * vy - vx * y;
  return a;
}

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

function lengthSq(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}

function normalize(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var l = Math.sqrt(x * x + y * y + z * z);
  l = 1.0 / (l || 1);
  a[0] *= l;
  a[1] *= l;
  a[2] *= l;
  return a;
}

function distance(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distanceSq(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz;
}

function limit(a, n) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var dsq = x * x + y * y + z * z;
  var lsq = n * n;

  if (lsq > 0 && dsq > lsq) {
    var nd = n / Math.sqrt(dsq);
    a[0] *= nd;
    a[1] *= nd;
    a[2] *= nd;
  }

  return a;
}

function lerp(a, b, n) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  a[0] = x + (b[0] - x) * n;
  a[1] = y + (b[1] - y) * n;
  a[2] = z + (b[2] - z) * n;
  return a;
}

function toString(a, precision) {
  var scale = Math.pow(10, precision !== undefined ? precision : 4);
  var s = '[';
  s += Math.floor(a[0] * scale) / scale + ', ';
  s += Math.floor(a[1] * scale) / scale + ', ';
  s += Math.floor(a[2] * scale) / scale + ']';
  return s;
}

function copy(a) {
  return a.slice(0);
}

function addScaled(v, w, n) {
  v[0] += w[0] * n;
  v[1] += w[1] * n;
  v[2] += w[2] * n;
  return v;
}

var Vec3 = {
  create: create,
  set: set,
  copy: copy,
  equals: equals,
  add: add,
  addScaled: addScaled,
  sub: sub,
  scale: scale,
  multMat4: multMat4,
  multQuat: multQuat,
  dot: dot,
  cross: cross,
  length: length,
  lengthSq: lengthSq,
  normalize: normalize,
  distance: distance,
  distanceSq: distanceSq,
  limit: limit,
  lerp: lerp,
  toString: toString
};
var vec3 = Vec3;

function create$1() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function set$1(a, b) {
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

function equals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}

function copy$1(a) {
  return a.slice(0);
}

function _mult16(a, b00, b01, b02, b03, b10, b11, b12, b13, b20, b21, b22, b23, b30, b31, b32, b33) {
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  var a30 = a[12];
  var a31 = a[13];
  var a32 = a[14];
  var a33 = a[15];
  a[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  a[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  a[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  a[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
  a[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  a[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  a[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  a[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
  a[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  a[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  a[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  a[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
  a[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  a[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  a[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  a[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
  return a;
}

function mult(a, b) {
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  var a30 = a[12];
  var a31 = a[13];
  var a32 = a[14];
  var a33 = a[15];
  var b00 = b[0];
  var b01 = b[1];
  var b02 = b[2];
  var b03 = b[3];
  var b10 = b[4];
  var b11 = b[5];
  var b12 = b[6];
  var b13 = b[7];
  var b20 = b[8];
  var b21 = b[9];
  var b22 = b[10];
  var b23 = b[11];
  var b30 = b[12];
  var b31 = b[13];
  var b32 = b[14];
  var b33 = b[15];
  a[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  a[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  a[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  a[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
  a[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  a[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  a[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  a[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
  a[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  a[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  a[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  a[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
  a[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  a[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  a[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  a[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
  return a;
}

function invert(a) {
  var a00 = a[0];
  var a10 = a[1];
  var a20 = a[2];
  var a30 = a[3];
  var a01 = a[4];
  var a11 = a[5];
  var a21 = a[6];
  var a31 = a[7];
  var a02 = a[8];
  var a12 = a[9];
  var a22 = a[10];
  var a32 = a[11];
  var a03 = a[12];
  var a13 = a[13];
  var a23 = a[14];
  var a33 = a[15]; // TODO: add caching

  a[0] = a11 * a22 * a33 - a11 * a32 * a23 - a12 * a21 * a33 + a12 * a31 * a23 + a13 * a21 * a32 - a13 * a31 * a22;
  a[4] = -a01 * a22 * a33 + a01 * a32 * a23 + a02 * a21 * a33 - a02 * a31 * a23 - a03 * a21 * a32 + a03 * a31 * a22;
  a[8] = a01 * a12 * a33 - a01 * a32 * a13 - a02 * a11 * a33 + a02 * a31 * a13 + a03 * a11 * a32 - a03 * a31 * a12;
  a[12] = -a01 * a12 * a23 + a01 * a22 * a13 + a02 * a11 * a23 - a02 * a21 * a13 - a03 * a11 * a22 + a03 * a21 * a12;
  a[1] = -a10 * a22 * a33 + a10 * a32 * a23 + a12 * a20 * a33 - a12 * a30 * a23 - a13 * a20 * a32 + a13 * a30 * a22;
  a[5] = a00 * a22 * a33 - a00 * a32 * a23 - a02 * a20 * a33 + a02 * a30 * a23 + a03 * a20 * a32 - a03 * a30 * a22;
  a[9] = -a00 * a12 * a33 + a00 * a32 * a13 + a02 * a10 * a33 - a02 * a30 * a13 - a03 * a10 * a32 + a03 * a30 * a12;
  a[13] = a00 * a12 * a23 - a00 * a22 * a13 - a02 * a10 * a23 + a02 * a20 * a13 + a03 * a10 * a22 - a03 * a20 * a12;
  a[2] = a10 * a21 * a33 - a10 * a31 * a23 - a11 * a20 * a33 + a11 * a30 * a23 + a13 * a20 * a31 - a13 * a30 * a21;
  a[6] = -a00 * a21 * a33 + a00 * a31 * a23 + a01 * a20 * a33 - a01 * a30 * a23 - a03 * a20 * a31 + a03 * a30 * a21;
  a[10] = a00 * a11 * a33 - a00 * a31 * a13 - a01 * a10 * a33 + a01 * a30 * a13 + a03 * a10 * a31 - a03 * a30 * a11;
  a[14] = -a00 * a11 * a23 + a00 * a21 * a13 + a01 * a10 * a23 - a01 * a20 * a13 - a03 * a10 * a21 + a03 * a20 * a11;
  a[3] = -a10 * a21 * a32 + a10 * a31 * a22 + a11 * a20 * a32 - a11 * a30 * a22 - a12 * a20 * a31 + a12 * a30 * a21;
  a[7] = a00 * a21 * a32 - a00 * a31 * a22 - a01 * a20 * a32 + a01 * a30 * a22 + a02 * a20 * a31 - a02 * a30 * a21;
  a[11] = -a00 * a11 * a32 + a00 * a31 * a12 + a01 * a10 * a32 - a01 * a30 * a12 - a02 * a10 * a31 + a02 * a30 * a11;
  a[15] = a00 * a11 * a22 - a00 * a21 * a12 - a01 * a10 * a22 + a01 * a20 * a12 + a02 * a10 * a21 - a02 * a20 * a11;
  var det = a00 * a[0] + a10 * a[4] + a20 * a[8] + a30 * a[12];

  if (det === 0) {
    return null;
  }

  det = 1.0 / det;
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

function transpose(a) {
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a23 = a[11];
  var a30 = a[12];
  var a31 = a[13];
  var a32 = a[14]; // 1st row - keeping a00

  a[1] = a[4];
  a[2] = a20;
  a[3] = a30; // 2nd row - keeping a11

  a[4] = a01;
  a[6] = a21;
  a[7] = a31; // 3rd row - keeping a22

  a[8] = a02;
  a[9] = a12;
  a[11] = a32; // 4th row - keeping a33

  a[12] = a03;
  a[13] = a13;
  a[14] = a23;
  return a;
}

function identity(a) {
  a[0] = a[5] = a[10] = a[15] = 1;
  a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
  return a;
}

function _scale3(a, x, y, z) {
  return _mult16(a, x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
}

function scale$1(a, v) {
  return _scale3(a, v[0], v[1], v[2]);
}

function _translate3(a, x, y, z) {
  return _mult16(a, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
}

function translate(a, v) {
  return _translate3(a, v[0], v[1], v[2]);
}

function _rotate3(a, r, x, y, z) {
  var len = Math.sqrt(x * x + y * y + z * z);

  if (len < 0.0001) {
    return null;
  }

  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(r);
  c = Math.cos(r);
  t = 1 - c;
  a00 = a11 = a22 = 1;
  a01 = a02 = a03 = a10 = a12 = a13 = a20 = a21 = a23 = 0;
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;

  var _a00 = a00 * b00 + a10 * b01 + a20 * b02;

  var _a01 = a01 * b00 + a11 * b01 + a21 * b02;

  var _a02 = a02 * b00 + a12 * b01 + a22 * b02;

  var _a03 = a03 * b00 + a13 * b01 + a23 * b02;

  var _a10 = a00 * b10 + a10 * b11 + a20 * b12;

  var _a11 = a01 * b10 + a11 * b11 + a21 * b12;

  var _a12 = a02 * b10 + a12 * b11 + a22 * b12;

  var _a13 = a03 * b10 + a13 * b11 + a23 * b12;

  var _a20 = a00 * b20 + a10 * b21 + a20 * b22;

  var _a21 = a01 * b20 + a11 * b21 + a21 * b22;

  var _a22 = a02 * b20 + a12 * b21 + a22 * b22;

  var _a23 = a03 * b20 + a13 * b21 + a23 * b22;

  return _mult16(a, _a00, _a01, _a02, _a03, _a10, _a11, _a12, _a13, _a20, _a21, _a22, _a23, 0, 0, 0, 1);
}

function rotate(a, r, v) {
  return _rotate3(a, r, v[0], v[1], v[2]);
}

function fromQuat(a, b) {
  var x = b[0];
  var y = b[1];
  var z = b[2];
  var w = b[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
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

function fromMat3(a, b) {
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
  a[15] = 1.0;
  return a;
}

function frustum(a, left, right, bottom, top, near, far) {
  var rl = 1.0 / (right - left);
  var tb = 1.0 / (top - bottom);
  var nf = 1.0 / (near - far);
  var near2 = near * 2;
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

function perspective(a, fovy, aspectRatio, near, far) {
  assert_1(fovy < Math.PI, 'mat4.perpsective: vertical field of view should be in radians (0 to PI)');
  var f = 1.0 / Math.tan(fovy * 0.5);
  var nf = 1.0 / (near - far);
  a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;
  a[0] = f / aspectRatio;
  a[5] = f;
  a[10] = (far + near) * nf;
  a[11] = -1;
  a[14] = 2 * far * near * nf;
  return a;
}

function ortho(a, left, right, bottom, top, near, far) {
  var lr = left - right;
  var bt = bottom - top;
  var nf = near - far;
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

function _lookAt9(a, eyex, eyey, eyez, targetx, targety, targetz, upx, upy, upz) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

  if (Math.abs(eyex - targetx) < 0.000001 && Math.abs(eyey - targety) < 0.000001 && Math.abs(eyez - targetz) < 0.000001) {
    a[0] = 1;
    a[1] = a[2] = a[3] = 0;
    a[5] = 1;
    a[4] = a[6] = a[7] = 0;
    a[10] = 1;
    a[8] = a[9] = a[11] = 0;
    a[15] = 1;
    a[12] = a[13] = a[14] = 0;
    return a;
  }

  z0 = eyex - targetx;
  z1 = eyey - targety;
  z2 = eyez - targetz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

  if (len) {
    len = 1.0 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

  if (len) {
    len = 1.0 / len;
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

function lookAt(a, from, to, up) {
  var eyex = from[0];
  var eyey = from[1];
  var eyez = from[2];
  var targetx = to[0];
  var targety = to[1];
  var targetz = to[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

  if (Math.abs(eyex - targetx) < 0.000001 && Math.abs(eyey - targety) < 0.000001 && Math.abs(eyez - targetz) < 0.000001) {
    a[0] = 1;
    a[1] = a[2] = a[3] = 0;
    a[5] = 1;
    a[4] = a[6] = a[7] = 0;
    a[10] = 1;
    a[8] = a[9] = a[11] = 0;
    a[15] = 1;
    a[12] = a[13] = a[14] = 0;
    return a;
  }

  z0 = eyex - targetx;
  z1 = eyey - targety;
  z2 = eyez - targetz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

  if (len) {
    len = 1.0 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

  if (len) {
    len = 1.0 / len;
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

var Mat4 = {
  _mult16: _mult16,
  _scale3: _scale3,
  _translate3: _translate3,
  _rotate3: _rotate3,
  _lookAt9: _lookAt9,
  // documented
  fromMat3: fromMat3,
  fromQuat: fromQuat,
  translate: translate,
  scale: scale$1,
  rotate: rotate,
  identity: identity,
  mult: mult,
  invert: invert,
  transpose: transpose,
  equals: equals$1,
  copy: copy$1,
  create: create$1,
  set: set$1,
  frustum: frustum,
  perspective: perspective,
  ortho: ortho,
  lookAt: lookAt
};
var mat4 = Mat4;

var TEMP_VEC3_0 = vec3.create();
var TEMP_VEC3_1 = vec3.create();
var TEMP_VEC3_2 = vec3.create();
var TEMP_VEC3_3 = vec3.create();
var TEMP_VEC3_4 = vec3.create();
var TEMP_VEC3_5 = vec3.create();
var TEMP_VEC3_6 = vec3.create();
var TEMP_VEC3_7 = vec3.create();
var EPSILON = 0.000001;

function create$2() {
  return [[0, 0, 0], [0, 0, 1]];
}

function hitTestTriangle(a, triangle, out) {
  var p0 = triangle[0];
  var p1 = triangle[1];
  var p2 = triangle[2];
  var origin = a[0];
  var direction = a[1];
  var u = vec3.sub(vec3.set(TEMP_VEC3_0, p1), p0);
  var v = vec3.sub(vec3.set(TEMP_VEC3_1, p2), p0);
  var n = vec3.cross(vec3.set(TEMP_VEC3_2, u), v);

  if (vec3.length(n) < EPSILON) {
    return -1;
  }

  var w0 = vec3.sub(vec3.set(TEMP_VEC3_3, origin), p0);
  var a_ = -vec3.dot(n, w0);
  var b = vec3.dot(n, direction);

  if (Math.abs(b) < EPSILON) {
    if (a_ === 0) {
      return -2;
    }

    return -3;
  }

  var r = a_ / b;

  if (r < -EPSILON) {
    return -4;
  }

  var I = vec3.add(vec3.set(TEMP_VEC3_4, origin), vec3.scale(vec3.set(TEMP_VEC3_5, direction), r));
  var uu = vec3.dot(u, u);
  var uv = vec3.dot(u, v);
  var vv = vec3.dot(v, v);
  var w = vec3.sub(vec3.set(TEMP_VEC3_6, I), p0);
  var wu = vec3.dot(w, u);
  var wv = vec3.dot(w, v);
  var D = uv * uv - uu * vv;
  var s = (uv * wv - vv * wu) / D;

  if (s < -EPSILON || s > 1.0 + EPSILON) {
    return -5;
  }

  var t = (uv * wu - uu * wv) / D;

  if (t < -EPSILON || s + t > 1.0 + EPSILON) {
    return -6;
  }

  out = out === undefined ? vec3.create() : out;
  vec3.set(out, u);
  vec3.scale(out, s);
  vec3.add(out, vec3.scale(vec3.set(TEMP_VEC3_7, v), t));
  vec3.add(out, p0);
  return 1;
}

function hitTestPlane(a, point, normal, out) {
  var origin = vec3.set(TEMP_VEC3_0, a[0]);
  var direction = vec3.set(TEMP_VEC3_1, a[1]);
  point = vec3.set(TEMP_VEC3_2, point);
  var dotDirectionNormal = vec3.dot(direction, normal);

  if (dotDirectionNormal === 0) {
    return -1;
  }

  var t = vec3.dot(vec3.sub(point, origin), normal) / dotDirectionNormal;

  if (t < 0) {
    return -2;
  }

  out = out === undefined ? vec3.create() : out;
  vec3.set(out, vec3.add(origin, vec3.scale(direction, t)));
  return 1;
} // http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms


function intersectsAABB(a, aabb) {
  var origin = a[0];
  var direction = a[1];
  var dirFracx = 1.0 / direction[0];
  var dirFracy = 1.0 / direction[1];
  var dirFracz = 1.0 / direction[2];
  var min = aabb[0];
  var max = aabb[1];
  var minx = min[0];
  var miny = min[1];
  var minz = min[2];
  var maxx = max[0];
  var maxy = max[1];
  var maxz = max[2];
  var t1 = (minx - origin[0]) * dirFracx;
  var t2 = (maxx - origin[0]) * dirFracx;
  var t3 = (miny - origin[1]) * dirFracy;
  var t4 = (maxy - origin[1]) * dirFracy;
  var t5 = (minz - origin[2]) * dirFracz;
  var t6 = (maxz - origin[2]) * dirFracz;
  var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
  var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
  return !(tmax < 0 || tmin > tmax);
}

var ray = {
  create: create$2,
  hitTestTriangle: hitTestTriangle,
  hitTestPlane: hitTestPlane,
  intersectsAABB: intersectsAABB
};

function lerp$1(a, b, n) {
  return a + (b - a) * n;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

function smoothstep(n, min, max) {
  n = clamp((n - min) / (max - min), 0.0, 1.0);
  return n * n * (3 - 2 * n);
}

function map(n, inStart, inEnd, outStart, outEnd) {
  return outStart + (outEnd - outStart) * (n - inStart) / (inEnd - inStart);
}

function toRadians(degrees) {
  return degrees * Math.PI / 180.0;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

function sign(n) {
  return n / Math.abs(n);
}

function isPowerOfTwo(a) {
  return (a & a - 1) === 0;
}

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

var Utils = {
  lerp: lerp$1,
  clamp: clamp,
  smoothstep: smoothstep,
  map: map,
  toRadians: toRadians,
  toDegrees: toDegrees,
  sign: sign,
  isPowerOfTwo: isPowerOfTwo,
  nextPowerOfTwo: nextPowerOfTwo
};
var utils = Utils;

function lerp$2(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

var lerp_1 = lerp$2;

var PI = Math.PI;
var TWO_PI = Math.PI * 2;

function interpolateAngle(fromAngle, toAngle, t) {
  fromAngle = (fromAngle + TWO_PI) % TWO_PI;
  toAngle = (toAngle + TWO_PI) % TWO_PI;
  var diff = Math.abs(fromAngle - toAngle);

  if (diff < PI) {
    return lerp_1(fromAngle, toAngle, t);
  } else {
    if (fromAngle > toAngle) {
      fromAngle = fromAngle - TWO_PI;
      return lerp_1(fromAngle, toAngle, t);
    } else if (toAngle > fromAngle) {
      toAngle = toAngle - TWO_PI;
      return lerp_1(fromAngle, toAngle, t);
    }
  }
}

var interpolateAngle_1 = interpolateAngle;

function latLonToXyz(lat, lon, out) {
  out = out || [0, 0, 0];
  const phi = (lon + 90) / 180 * Math.PI;
  const theta = (90 - lat) / 180 * Math.PI;
  out[0] = Math.sin(theta) * Math.sin(phi);
  out[1] = Math.cos(theta);
  out[2] = Math.sin(theta) * Math.cos(phi);
  return out;
}

var latlonToXyz = latLonToXyz;

function xyzToLatLon(normalizedPosition, out) {
  out = out || [0, 0];
  out[0] = 90 - Math.acos(normalizedPosition[1]) / Math.PI * 180;
  out[1] = -Math.atan2(normalizedPosition[2], normalizedPosition[0]) / Math.PI * 180;
  return out;
}

var xyzToLatlon = xyzToLatLon;

var rootPosition = {
  left: 0,
  top: 0
};
var mouseEventOffset_1 = mouseEventOffset;

function mouseEventOffset(ev, target, out) {
  target = target || ev.currentTarget || ev.srcElement;

  if (!Array.isArray(out)) {
    out = [0, 0];
  }

  var cx = ev.clientX || 0;
  var cy = ev.clientY || 0;
  var rect = getBoundingClientOffset(target);
  out[0] = cx - rect.left;
  out[1] = cy - rect.top;
  return out;
}

function getBoundingClientOffset(element) {
  if (element === window || element === document || element === document.body) {
    return rootPosition;
  } else {
    return element.getBoundingClientRect();
  }
}

const clamp$1 = utils.clamp;
const lerp$3 = utils.lerp;
const toRadians$1 = utils.toRadians;
const toDegrees$1 = utils.toDegrees;

function offset(e, target) {
  if (e.touches) return mouseEventOffset_1(e.touches[0], target);else return mouseEventOffset_1(e, target);
}

function Orbiter(opts) {
  // TODO: split into internal state and public state
  const initialState = {
    camera: opts.camera,
    invViewMatrix: mat4.create(),
    dragging: false,
    lat: 0,
    // Y
    minLat: -89.5,
    maxLat: 89.5,
    lon: 0,
    // XZ
    minLon: -Infinity,
    maxLon: Infinity,
    currentLat: 0,
    currentLon: 0,
    easing: 1,
    element: opts.element || window,
    width: 0,
    height: 0,
    clickPosWindow: [0, 0],
    dragPos: [0, 0, 0],
    dragPosWindow: [0, 0],
    distance: 1,
    currentDistance: 1,
    minDistance: 1,
    maxDistance: 1,
    zoomSlowdown: 400,
    zoom: true,
    pan: true,
    drag: true,
    dragSlowdown: 4,
    clickTarget: [0, 0, 0],
    clickPosPlane: [0, 0, 0],
    dragPosPlane: [0, 0, 0],
    clickPosWorld: [0, 0, 0],
    dragPosWorld: [0, 0, 0],
    panPlane: null,
    autoUpdate: true
  };
  this.set(initialState);
  this.set(opts);
  this.setup();
}

Orbiter.prototype.set = function (opts) {
  if (opts.camera) {
    const distance = vec3.distance(opts.camera.position, opts.camera.target);
    const latLon = xyzToLatlon(vec3.normalize(vec3.sub(vec3.copy(opts.camera.position), opts.camera.target)));
    this.lat = latLon[0];
    this.lon = latLon[1];
    this.currentLat = this.lat;
    this.currentLon = this.lon;
    this.distance = distance;
    this.currentDistance = this.distance;
    this.minDistance = opts.minDistance || distance / 10;
    this.maxDistance = opts.maxDistance || distance * 10;
  }

  Object.assign(this, opts);
};

Orbiter.prototype.updateWindowSize = function () {
  const width = this.element.clientWidth || this.element.innerWidth;
  const height = this.element.clientHeight || this.element.innerHeight;

  if (width !== this.width) {
    this.width = width;
    this.height = height;
    this.radius = Math.min(this.width / 2, this.height / 2);
  }
};

Orbiter.prototype.updateCamera = function () {
  // instad of rotating the object we want to move camera around it
  // state.currRot[3] *= -1
  if (!this.camera) return;
  const position = this.camera.position;
  const target = this.camera.target;
  this.lat = clamp$1(this.lat, this.minLat, this.maxLat);
  this.lon = clamp$1(this.lon, this.minLon, this.maxLon) % 360;
  this.currentLat = toDegrees$1(interpolateAngle_1((toRadians$1(this.currentLat) + 2 * Math.PI) % (2 * Math.PI), (toRadians$1(this.lat) + 2 * Math.PI) % (2 * Math.PI), this.easing));
  this.currentLon = toDegrees$1(interpolateAngle_1((toRadians$1(this.currentLon) + 2 * Math.PI) % (2 * Math.PI), (toRadians$1(this.lon) + 2 * Math.PI) % (2 * Math.PI), this.easing));
  this.currentDistance = lerp$3(this.currentDistance, this.distance, this.easing); // set new camera position according to the current
  // rotation at distance relative to target

  latlonToXyz(this.currentLat, this.currentLon, position);
  vec3.scale(position, this.currentDistance);
  vec3.add(position, target);
  this.camera.set({
    position: position
  });
};

Orbiter.prototype.setup = function () {
  var orbiter = this;

  function down(x, y, shift) {
    orbiter.dragging = true;
    orbiter.dragPos[0] = x;
    orbiter.dragPos[1] = y;

    if (shift && orbiter.pan) {
      orbiter.clickPosWindow[0] = x;
      orbiter.clickPosWindow[1] = y;
      vec3.set(orbiter.clickTarget, orbiter.camera.target);
      const targetInViewSpace = vec3.multMat4(vec3.copy(orbiter.clickTarget), orbiter.camera.viewMatrix);
      orbiter.panPlane = [targetInViewSpace, [0, 0, 1]];
      ray.hitTestPlane(orbiter.camera.getViewRay(orbiter.clickPosWindow[0], orbiter.clickPosWindow[1], orbiter.width, orbiter.height), orbiter.panPlane[0], orbiter.panPlane[1], orbiter.clickPosPlane);
      ray.hitTestPlane(orbiter.camera.getViewRay(orbiter.dragPosWindow[0], orbiter.dragPosWindow[1], orbiter.width, orbiter.height), orbiter.panPlane[0], orbiter.panPlane[1], orbiter.dragPosPlane);
    } else {
      orbiter.panPlane = null;
    }
  }

  function move(x, y, shift) {
    if (!orbiter.dragging) {
      return;
    }

    if (shift && orbiter.panPlane) {
      orbiter.dragPosWindow[0] = x;
      orbiter.dragPosWindow[1] = y;
      ray.hitTestPlane(orbiter.camera.getViewRay(orbiter.clickPosWindow[0], orbiter.clickPosWindow[1], orbiter.width, orbiter.height), orbiter.panPlane[0], orbiter.panPlane[1], orbiter.clickPosPlane);
      ray.hitTestPlane(orbiter.camera.getViewRay(orbiter.dragPosWindow[0], orbiter.dragPosWindow[1], orbiter.width, orbiter.height), orbiter.panPlane[0], orbiter.panPlane[1], orbiter.dragPosPlane);
      mat4.set(orbiter.invViewMatrix, orbiter.camera.viewMatrix);
      mat4.invert(orbiter.invViewMatrix);
      vec3.multMat4(vec3.set(orbiter.clickPosWorld, orbiter.clickPosPlane), orbiter.invViewMatrix);
      vec3.multMat4(vec3.set(orbiter.dragPosWorld, orbiter.dragPosPlane), orbiter.invViewMatrix);
      const diffWorld = vec3.sub(vec3.copy(orbiter.dragPosWorld), orbiter.clickPosWorld);
      const target = vec3.sub(vec3.copy(orbiter.clickTarget), diffWorld);
      orbiter.camera.set({
        target: target
      });
      orbiter.updateCamera();
    } else if (orbiter.drag) {
      const dx = x - orbiter.dragPos[0];
      const dy = y - orbiter.dragPos[1];
      orbiter.dragPos[0] = x;
      orbiter.dragPos[1] = y;
      orbiter.lat += dy / orbiter.dragSlowdown;
      orbiter.lon -= dx / orbiter.dragSlowdown; // TODO: how to have resolution independed scaling? will this code behave differently with retina/pixelRatio=2?

      orbiter.updateCamera();
    }
  }

  function up() {
    orbiter.dragging = false;
    orbiter.panPlane = null;
  }

  function scroll(dy) {
    if (!orbiter.zoom) {
      return false;
    }

    orbiter.distance *= 1 + dy / orbiter.zoomSlowdown;
    orbiter.distance = clamp$1(orbiter.distance, orbiter.minDistance, orbiter.maxDistance);
    orbiter.updateCamera();
    return true;
  }

  function onMouseDown(e) {
    orbiter.updateWindowSize();
    const pos = offset(e, orbiter.element);
    down(pos[0], pos[1], e.shiftKey || e.touches && e.touches.length === 2);
  }

  function onMouseMove(e) {
    const pos = offset(e, orbiter.element);
    move(pos[0], pos[1], e.shiftKey || e.touches && e.touches.length === 2);
  }

  function onMouseUp(e) {
    up();
  }

  function onWheel(e) {
    if (scroll(e.deltaY) === true) {
      e.preventDefault();
      return false;
    }
  }

  function onTouchStart(e) {
    e.preventDefault();
    onMouseDown(e);
  }

  this._onMouseDown = onMouseDown;
  this._onTouchStart = onTouchStart;
  this._onMouseMove = onMouseMove;
  this._onMouseUp = onMouseUp;
  this._onWheel = onWheel;
  this.element.addEventListener('mousedown', onMouseDown);
  this.element.addEventListener('touchstart', onTouchStart);
  this.element.addEventListener('wheel', onWheel);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onMouseMove, {
    passive: false
  });
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchend', onMouseUp);
  this.updateCamera();

  if (this.autoUpdate) {
    const self = this;
    this._rafHandle = raf_1(function tick() {
      orbiter.updateCamera();
      self._rafHandle = raf_1(tick);
    });
  }
};

Orbiter.prototype.dispose = function () {
  this.element.removeEventListener('mousedown', this._onMouseDown);
  this.element.removeEventListener('touchstart', this._onTouchStart);
  this.element.removeEventListener('wheel', this._onWheel);
  window.removeEventListener('mousemove', this._onMouseMove);
  window.removeEventListener('touchmove', this._onMouseMove);
  window.removeEventListener('mouseup', this._onMouseUp);
  window.removeEventListener('touchend', this._onMouseUp);
  raf_1.cancel(this._rafHandle);
  this.camera = null;
};

var orbiter = function createOrbiter(opts) {
  return new Orbiter(opts);
};

function setFrustumOffset(camera, x, y, width, height, widthTotal, heightTotal) {
  // console.log('frustum', x, y, width, height, widthTotal, heightTotal)
  widthTotal = widthTotal === undefined ? width : widthTotal;
  heightTotal = heightTotal === undefined ? height : heightTotal;
  var near = camera.near;
  var far = camera.far;
  var fov = camera.fov;
  var aspectRatio = widthTotal / heightTotal;
  var top = Math.tan(fov * 0.5) * near;
  var bottom = -top;
  var left = aspectRatio * bottom;
  var right = aspectRatio * top;
  var width_ = Math.abs(right - left);
  var height_ = Math.abs(top - bottom);
  var widthNormalized = width_ / widthTotal;
  var heightNormalized = height_ / heightTotal;
  var l = left + x * widthNormalized;
  var r = left + (x + width) * widthNormalized;
  var b = top - (y + height) * heightNormalized;
  var t = top - y * heightNormalized;
  camera.aspect = aspectRatio;
  mat4.frustum(camera.projectionMatrix, l, r, b, t, near, far);
}

function PerspectiveCamera(opts) {
  this.set({
    projectionMatrix: mat4.create(),
    invViewMatrix: mat4.create(),
    viewMatrix: mat4.create(),
    position: [0, 0, 3],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: Math.PI / 3,
    aspect: 1,
    near: 0.1,
    far: 100
  });
  this.set(opts);
}

PerspectiveCamera.prototype.set = function (opts) {
  Object.assign(this, opts);

  if (opts.position || opts.target || opts.up) {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    mat4.set(this.invViewMatrix, this.viewMatrix);
    mat4.invert(this.invViewMatrix);
  }

  if (opts.fov || opts.aspect || opts.near || opts.far) {
    mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
  }

  if (this.frustum) {
    setFrustumOffset(this, this.frustum.offset[0], this.frustum.offset[1], this.frustum.size[0], this.frustum.size[1], this.frustum.totalSize[0], this.frustum.totalSize[1]);
  }
};

PerspectiveCamera.prototype.getViewRay = function (x, y, windowWidth, windowHeight) {
  if (this.frustum) {
    x += this.frustum.offset[0];
    y += this.frustum.offset[1];
    windowWidth = this.frustum.totalSize[0];
    windowHeight = this.frustum.totalSize[1];
  }

  let nx = 2 * x / windowWidth - 1;
  let ny = 1 - 2 * y / windowHeight;
  let hNear = 2 * Math.tan(this.fov / 2) * this.near;
  let wNear = hNear * this.aspect;
  nx *= wNear * 0.5;
  ny *= hNear * 0.5;
  let origin = [0, 0, 0];
  let direction = vec3.normalize([nx, ny, -this.near]);
  let ray = [origin, direction];
  return ray;
};

PerspectiveCamera.prototype.getWorldRay = function (x, y, windowWidth, windowHeight) {
  let ray = this.getViewRay(x, y, windowWidth, windowHeight);
  let origin = ray[0];
  let direction = ray[1];
  vec3.multMat4(origin, this.invViewMatrix); // this is correct as origin is [0, 0, 0] so direction is also a point

  vec3.multMat4(direction, this.invViewMatrix); // is this necessary?

  vec3.normalize(vec3.sub(direction, origin));
  return ray;
};

var perspective$1 = function createPerspectiveCamera(opts) {
  return new PerspectiveCamera(opts);
};

var pexCam = {
  orbiter: orbiter,
  perspective: perspective$1
};

export default pexCam;
var orbiter$1 = pexCam.orbiter;
export { pexCam as __moduleExports, orbiter$1 as orbiter };
