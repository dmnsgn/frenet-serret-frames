import { r as __exportAll } from "./_chunks/rolldown-runtime-ppdSCyCg.js";

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} QuadGridOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [nx=10]
* @property {number} [ny=nx]
*/
/**
* Regular grid
*
* @param {QuadGridOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPolygon}
*/
function quadGrid({ sx = 1, sy = sx, nx = 10, ny = nx } = {}) {
	const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
	const cells = [];
	let vertexIndex = 0;
	for (let row = 0; row <= ny; row++) {
		const y = -sy / 2 + row * sy / ny;
		for (let col = 0; col <= nx; col++) {
			const x = -sx / 2 + col * sx / nx;
			positions[vertexIndex * 3] = x;
			positions[vertexIndex * 3 + 1] = y;
			if (row < ny && col < nx) {
				const o = vertexIndex + nx + 1;
				cells.push([
					vertexIndex,
					vertexIndex + 1,
					o + 1,
					o
				]);
			}
			vertexIndex++;
		}
	}
	return {
		positions,
		cells
	};
}

/**
* @module utils
* @ignore
*/
/**
* Two times PI.
*
* @constant {number}
*/
const TAU = Math.PI * 2;
/**
* Half of PI.
*
* @constant {number}
*/
const HALF_PI = Math.PI / 2;
/**
* Square root of 2.
*
* @constant {number}
*/
const SQRT2 = Math.sqrt(2);
/**
* Square root of 3.
*
* @constant {number}
*/
const SQRT3 = Math.sqrt(3);
/**
* Square root of 6.
*
* @constant {number}
*/
const SQRT6 = Math.sqrt(6);
/**
* Golden ratio: (1 + √5) / 2.
*
* @constant {number}
*/
const PHI = (1 + Math.sqrt(5)) / 2;
/**
* Ratio of a regular star polygon {points/density}'s inner (notch) radius to
* its outer (tip) radius, ie. cos(density * PI / points) / cos((density - 1)
*
* - PI / points). `computeStarRatio(5, 2)` is `1 / PHI ** 2`, the pentagram's
*   fixed ratio.
*
* @private
* @param {number} points
* @param {number} [density=2] Default is `2`
* @returns {number}
* @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
*/
function computeStarRatio(points, density = 2) {
	return Math.cos(density * Math.PI / points) / Math.cos((density - 1) * Math.PI / points);
}
/**
* Normalize a vector 3.
*
* @private
* @param {number[]} v Vector 3 array
* @returns {number[]} Normalized vector
*/
function normalize(v) {
	const l = 1 / (Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1);
	v[0] *= l;
	v[1] *= l;
	v[2] *= l;
	return v;
}
/**
* Restrict a value to [min, max].
*
* @private
* @param {number} value
* @param {number} min
* @param {number} max
* @returns {number}
*/
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
/**
* Clamp a theta/thetaOffset meridian sweep to [0, PI]: thetaOffset first (0 =
* north pole), then theta to whatever range keeps thetaOffset + theta inside
* [0, PI] too. Shared by every meridian-based revolution shape (ellipsoid,
* superellipsoid, superegg, hollowSphere's cut caps): a pole can only sit at
* the sweep's own start or end, never partway through.
*
* @private
* @param {number} theta
* @param {number} thetaOffset
* @returns {[number, number] | undefined} ClampedTheta, clampedThetaOffset
*/
function clampMeridianSweep(theta, thetaOffset) {
	const clampedThetaOffset = clamp(thetaOffset, 0, Math.PI);
	return [clamp(theta, -clampedThetaOffset, Math.PI - clampedThetaOffset), clampedThetaOffset];
}
/**
* Linear interpolation between a and b at t.
*
* @private
* @param {number} a
* @param {number} b
* @param {number} t
* @returns {number}
*/
function lerp(a, b, t) {
	return a + (b - a) * t;
}
/**
* Snap a near-zero value to exact 0. Math.cos/sin of an exact multiple of PI/2
* aren't bit-exact (eg. Math.cos(Math.PI / 2) is ~6e-17) - left as-is, that
* residual can make two vertices meant to be identical (a pole, a wrap seam)
* compare as distinct and read as a crack, or - raised to a negative signedPow
* exponent - explode into a huge, effectively-random-signed value.
*
* @private
* @param {number} x
* @returns {number}
*/
function snapToZero(x) {
	return Math.abs(x) < 1e-9 ? 0 : x;
}
/**
* X raised to a signed power: sign(x) * |x|^e. Used for superquadric/
* superellipse curves, where e can be a fraction (even < 1, a pinched cusp) and
* x negative - plain `x ** e` is only defined for non-negative x. x = 0
* short-circuits to 0, avoiding both `0 ** negative` (Infinity) and JS's `0 **
* 0 = 1` quirk; the true tangent at a pinched pole is a genuine cusp with no
* well-defined direction anyway, so 0 is as good a fallback as any.
*
* @private
* @param {number} x
* @param {number} e
* @returns {number}
*/
function signedPow(x, e) {
	return x === 0 ? 0 : Math.sign(x) * Math.abs(x) ** e;
}
/** @private */
function cross$1(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}
/** @private */
function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
const SLERP_MIN_ANGLE = 1e-6;
const BARYCENTRIC_MIN_WEIGHT = 1e-9;
/**
* Point on the great circle between unit vectors p and q, at fraction t.
*
* @private
*/
function slerp(p, q, t) {
	const cosTheta = Math.min(1, Math.max(-1, dot(p, q)));
	const theta = Math.acos(cosTheta);
	if (theta < SLERP_MIN_ANGLE) return normalize([...p]);
	const sinTheta = Math.sin(theta);
	const wp = Math.sin((1 - t) * theta) / sinTheta;
	const wq = Math.sin(t * theta) / sinTheta;
	return [
		p[0] * wp + q[0] * wq,
		p[1] * wp + q[1] * wq,
		p[2] * wp + q[2] * wq
	];
}
/**
* Barycentric point (weight v toward uB, w toward uC) on a spherical triangle
* of unit vectors, via nested slerp along BC then A to that point.
*
* @private
*/
function slerpTriangle(uA, uB, uC, v, w) {
	return v + w < BARYCENTRIC_MIN_WEIGHT ? normalize([...uA]) : slerp(uA, slerp(uB, uC, w / (v + w)), v + w);
}
/**
* A single triangle, 3x oversized so its 3 vertices land past every edge of the
* [-1, 1] clip-space square: the standard vertex-shader trick for a fullscreen
* pass (rasterizes to exactly the viewport once clipped, with no diagonal seam
* and no overdraw compared to a quad split into 2 triangles). xy positions
* only
*
* - No z, no normals/uvs, no cells - since a fullscreen pass reads screen-space
*   data directly (`gl_FragCoord`, or a uv derived from the clip position
*   in-shader) rather than interpolated vertex attributes, and needs no index
*   buffer for a single triangle.
*
* @returns {{ positions: Float32Array }}
*/
function fullscreenTriangle() {
	return { positions: Float32Array.of(-1, -1, 3, -1, -1, 3) };
}
/** @private */
let TYPED_ARRAY_TYPE;
/**
* Enforce a typed array constructor for cells
*
* @param {Class<Uint8Array> | Class<Uint16Array> | Class<Uint32Array>} type
*/
function setTypedArrayType(type) {
	TYPED_ARRAY_TYPE = type;
}
/**
* Select cells typed array from a size determined by amount of vertices.
*
* @param {number} size The max value expected
* @returns {Uint8Array | Uint16Array | Uint32Array}
* @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
*/
const getCellsTypedArray = (size) => TYPED_ARRAY_TYPE || (size <= 255 ? Uint8Array : size <= 65535 ? Uint16Array : Uint32Array);
/**
* Fan-triangulate a list of closed n-gon faces (a `SimplicialComplexPolygon`'s
* `cells`, e.g. `[0, 1, 2, 3]`) from each face's last corner into a flat,
* stride-3 `SimplicialComplex`-style typed array (e.g. `[3, 0, 1, 3, 1, 2]`).
* Anchoring on the last corner rather than the first is deliberate for quads:
* for the BL/BR/TR/TL winding used by eg. `rectanglePath`, it splits the quad
* along the same diagonal a row-major `TRIANGLE_STRIP` produces (and that
* `computePlane`/`computePolarGeometry`/ `computeRevolutionGeometry` already
* use), so displacement in a vertex shader creases consistently across every
* primitive in this library. Only valid for convex, planar faces.
*
* @param {import("../../types.js").TypedArrayLike[]} cells
* @param {number} numVertices Used to pick the returned typed array's element
*   size
* @returns {Uint8Array | Uint16Array | Uint32Array}
*/
function triangulateFaces(cells, numVertices) {
	let numTriangles = 0;
	for (const face of cells) numTriangles += face.length - 2;
	const triangles = new (getCellsTypedArray(numVertices))(numTriangles * 3);
	let index = 0;
	for (const face of cells) {
		const anchor = face.at(-1);
		for (let i = 0; i < face.length - 2; i++) {
			triangles[index] = anchor;
			triangles[index + 1] = face[i];
			triangles[index + 2] = face[i + 1];
			index += 3;
		}
	}
	return triangles;
}
/**
* Concatenate SimplicialComplex geometries into one, offsetting each one's cell
* indices by the running vertex count. Positions coincident across inputs (eg.
* two bands sharing a seam) stay as separate, unwelded vertices.
*
* @param {import("../../types.js").SimplicialComplex[]} geometries
* @returns {import("../../types.js").SimplicialComplex}
*/
function concatGeometries(geometries) {
	let vertexCount = 0;
	let cellCount = 0;
	for (const { positions, cells } of geometries) {
		vertexCount += positions.length / 3;
		cellCount += cells.length;
	}
	const positions = new Float32Array(vertexCount * 3);
	const normals = new Float32Array(vertexCount * 3);
	const uvs = new Float32Array(vertexCount * 2);
	const cells = new (getCellsTypedArray(vertexCount))(cellCount);
	let vertexOffset = 0;
	let cellIndex = 0;
	for (const geometry of geometries) {
		positions.set(geometry.positions, vertexOffset * 3);
		normals.set(geometry.normals, vertexOffset * 3);
		uvs.set(geometry.uvs, vertexOffset * 2);
		for (let i = 0; i < geometry.cells.length; i++, cellIndex++) cells[cellIndex] = geometry.cells[i] + vertexOffset;
		vertexOffset += geometry.positions.length / 3;
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* Flip a geometry inside-out: negate every normal and swap 2 of each triangle's
* 3 indices so winding stays consistent with the flipped normal. Used to turn
* an outward-facing surface (eg. a standalone sphere or cylinder) into the
* inward-facing wall of a shell around it.
*
* @param {import("../../types.js").SimplicialComplex} geometry
* @returns {import("../../types.js").SimplicialComplex}
*/
function invert({ positions, normals, uvs, cells }) {
	const invertedNormals = new Float32Array(normals.length);
	for (let i = 0; i < normals.length; i++) invertedNormals[i] = -normals[i];
	const invertedCells = cells.slice();
	for (let i = 0; i < invertedCells.length; i += 3) {
		const tmp = invertedCells[i + 1];
		invertedCells[i + 1] = invertedCells[i + 2];
		invertedCells[i + 2] = tmp;
	}
	return {
		positions,
		normals: invertedNormals,
		uvs,
		cells: invertedCells
	};
}
/** @private */
function point(positions, index) {
	return [
		positions[index * 3],
		positions[index * 3 + 1],
		positions[index * 3 + 2]
	];
}
/** @private */
function subtract(positions, a, b) {
	return [
		positions[a * 3] - positions[b * 3],
		positions[a * 3 + 1] - positions[b * 3 + 1],
		positions[a * 3 + 2] - positions[b * 3 + 2]
	];
}
/**
* Per-face constants: a flat normal and a tangent basis (+ extent) used for the
* default per-face planar uv unwrap. The normal is summed via Newell's method
* over every edge, so it stays correct for faces with (nearly) collinear
* corners and averages out slightly non-planar faces.
*
* @private
*/
function computeFaceContext(seedPositions, face) {
	const normal = [
		0,
		0,
		0
	];
	for (let i = 0; i < face.length; i++) {
		const a = point(seedPositions, face[i]);
		const b = point(seedPositions, face[(i + 1) % face.length]);
		normal[0] += (a[1] - b[1]) * (a[2] + b[2]);
		normal[1] += (a[2] - b[2]) * (a[0] + b[0]);
		normal[2] += (a[0] - b[0]) * (a[1] + b[1]);
	}
	normalize(normal);
	const v = normalize(subtract(seedPositions, face[0], face[1]));
	const u = cross$1(v, normal);
	const centroid = [
		0,
		0,
		0
	];
	for (const index of face) {
		centroid[0] += seedPositions[index * 3];
		centroid[1] += seedPositions[index * 3 + 1];
		centroid[2] += seedPositions[index * 3 + 2];
	}
	centroid[0] /= face.length;
	centroid[1] /= face.length;
	centroid[2] /= face.length;
	let extent = 0;
	for (const index of face) {
		const p = [
			seedPositions[index * 3] - centroid[0],
			seedPositions[index * 3 + 1] - centroid[1],
			seedPositions[index * 3 + 2] - centroid[2]
		];
		extent = Math.max(extent, Math.abs(dot(p, u)), Math.abs(dot(p, v)));
	}
	return {
		normal,
		u,
		v,
		centroid,
		extent: extent || 1
	};
}
/**
* Point on edge (a, b) at k/S from a to b, canonicalized on min(a, b) so two
* faces sharing this edge compute bit-identical floats regardless of winding.
*
* @private
*/
function edgePoint(seedPositions, a, b, k, S, slerped) {
	const lo = Math.min(a, b);
	const hi = Math.max(a, b);
	const t = (a < b ? k : S - k) / S;
	const p = [
		seedPositions[lo * 3],
		seedPositions[lo * 3 + 1],
		seedPositions[lo * 3 + 2]
	];
	const q = [
		seedPositions[hi * 3],
		seedPositions[hi * 3 + 1],
		seedPositions[hi * 3 + 2]
	];
	if (slerped) return slerp(normalize(p), normalize(q), t);
	const t1 = 1 - t;
	return [
		p[0] * t1 + q[0] * t,
		p[1] * t1 + q[1] * t,
		p[2] * t1 + q[2] * t
	];
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TriangularGridOptions
* @property {number} [sx=1]
* @property {number} [nx=10]
* @property {number} [ny=10]
* @property {boolean} [inscribed=true]
*/
/**
* Isometric grid tiling equilateral triangles
*
* @param {TriangularGridOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPolygon}
*/
function triangularGrid({ sx = 1, nx = 10, ny = 10, inscribed = true } = {}) {
	const dx = sx / nx;
	const dy = dx * SQRT3 / 2;
	const halfHeight = ny * dy / 2;
	const positions = [];
	const cells = [];
	const rowStart = [];
	const addRow = (row) => {
		const odd = row % 2 === 1;
		const y = row * dy - halfHeight;
		const offset = odd ? dx / 2 : 0;
		const count = odd ? nx : nx + 1;
		rowStart.push(positions.length / 3);
		for (let col = 0; col < count; col++) positions.push(-sx / 2 + offset + col * dx, y, 0);
	};
	const addRowCells = (smallStart, bigStart, offsetIsLower) => {
		for (let col = 0; col < nx; col++) {
			const s = smallStart + col;
			const b0 = bigStart + col;
			const b1 = bigStart + col + 1;
			cells.push(offsetIsLower ? [
				s,
				b1,
				b0
			] : [
				s,
				b0,
				b1
			]);
		}
		for (let col = 0; col < nx - 1; col++) {
			const s0 = smallStart + col;
			const s1 = smallStart + col + 1;
			const b1 = bigStart + col + 1;
			cells.push(offsetIsLower ? [
				s0,
				s1,
				b1
			] : [
				s1,
				s0,
				b1
			]);
		}
	};
	const addInscribedEdges = () => {
		for (let row = 1; row < ny; row += 2) cells.push([
			rowStart[row - 1],
			rowStart[row],
			rowStart[row + 1]
		], [
			rowStart[row - 1] + nx,
			rowStart[row + 1] + nx,
			rowStart[row] + nx - 1
		]);
		if (ny % 2 !== 1) return;
		const topLeft = positions.length / 3;
		positions.push(-sx / 2, halfHeight, 0);
		const topRight = topLeft + 1;
		positions.push(sx / 2, halfHeight, 0);
		cells.push([
			rowStart[ny - 1],
			rowStart[ny],
			topLeft
		], [
			rowStart[ny - 1] + nx,
			topRight,
			rowStart[ny] + nx - 1
		]);
	};
	for (let row = 0; row <= ny; row++) addRow(row);
	for (let row = 0; row < ny; row++) {
		const offsetIsLower = row % 2 === 1;
		addRowCells(rowStart[offsetIsLower ? row : row + 1], rowStart[offsetIsLower ? row + 1 : row], offsetIsLower);
	}
	if (inscribed) addInscribedEdges();
	return {
		positions: Float32Array.from(positions),
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
const WELD_KEY_SCALE = 1e9;
/**
* @typedef {object} HexagonalGridOptions
* @property {number} [sx=1]
* @property {number} [nx=10]
* @property {number} [ny=10]
* @property {boolean} [inscribed=true]
*/
/**
* Hexagonal grid tiling regular hexagons
*
* @param {HexagonalGridOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPolygon}
*/
function hexagonalGrid({ sx = 1, nx = 10, ny = 10, inscribed = true } = {}) {
	const dx = sx / nx;
	const r = dx / SQRT3;
	const dy = 1.5 * r;
	const leftBound = -dx / 2;
	const rightBound = (nx - 1) * dx + dx / 2;
	const topBound = (ny - 1) * dy + r / 2;
	const bottomBound = -r / 2;
	const cornerOffsets = [
		[0, r],
		[-dx / 2, r / 2],
		[-dx / 2, -r / 2],
		[0, -r],
		[dx / 2, -r / 2],
		[dx / 2, r / 2]
	];
	const centerX = (leftBound + rightBound + (inscribed || ny === 1 ? 0 : dx / 2)) / 2;
	const centerY = (bottomBound + topBound) / 2;
	const cache = /* @__PURE__ */ new Map();
	const positions = [];
	const cells = [];
	const getVertex = (x, y) => {
		const key = `${Math.round(x / dx * WELD_KEY_SCALE)}_${Math.round(y / dx * WELD_KEY_SCALE)}`;
		let index = cache.get(key);
		if (index === void 0) {
			index = positions.length / 3;
			positions.push(x - centerX, y - centerY, 0);
			cache.set(key, index);
		}
		return index;
	};
	const corner = (row, col, k) => {
		const rowOffset = row % 2 * (dx / 2);
		let x = col * dx + rowOffset + cornerOffsets[k][0];
		let y = row * dy + cornerOffsets[k][1];
		if (inscribed) {
			if (rowOffset > 0 && col === nx - 1 && (k === 4 || k === 5)) x = rightBound;
			if (row === ny - 1 && k === 0) y = topBound;
			else if (row === 0 && k === 3) y = bottomBound;
		}
		return getVertex(x, y);
	};
	for (let row = 0; row < ny; row++) {
		const rowOffset = row % 2 * (dx / 2);
		for (let col = 0; col < nx; col++) {
			const face = [];
			for (let k = 0; k < 6; k++) face.push(corner(row, col, k));
			cells.push(face);
		}
		if (inscribed && rowOffset > 0) {
			if (row <= ny - 2) cells.push([
				corner(row - 1, 0, 1),
				corner(row - 1, 0, 0),
				corner(row, 0, 1),
				corner(row + 1, 0, 2)
			]);
			else cells.push([
				corner(row - 1, 0, 1),
				corner(row - 1, 0, 0),
				corner(row, 0, 1),
				getVertex(leftBound, topBound)
			]);
		}
	}
	return {
		positions: Float32Array.from(positions),
		cells
	};
}

/** @module mappings */
var mappings_exports = /* @__PURE__ */ __exportAll({
	concentric: () => concentric,
	cornerificTapered2: () => cornerificTapered2,
	elliptical: () => elliptical,
	fgSquircular: () => fgSquircular,
	lamé: () => lamé,
	nonAxial2Pinch: () => nonAxial2Pinch,
	nonAxialHalfPinch: () => nonAxialHalfPinch,
	polar: () => polar,
	radial: () => radial,
	rectangular: () => rectangular,
	spherical: () => spherical,
	squelched: () => squelched,
	squelchedHorizontal: () => squelchedHorizontal,
	squelchedVertical: () => squelchedVertical,
	tapered4: () => tapered4,
	threeSquircular: () => threeSquircular,
	twoSquircular: () => twoSquircular
});
/**
* @callback MappingFn
* @param {object} mappingOptions
* @param {Float32Array} [mappingOptions.uvs]
* @param {number} [mappingOptions.index]
* @param {number} [mappingOptions.x]
* @param {number} [mappingOptions.y]
* @param {number} [mappingOptions.radius]
* @param {number} [mappingOptions.nx]
* @param {number} [mappingOptions.ny]
* @param {number} [mappingOptions.nz]
* @param {number} [mappingOptions.sx]
* @param {number} [mappingOptions.sy]
* @param {number} [mappingOptions.t]
* @param {number} [mappingOptions.radiusRatio]
* @param {number} [mappingOptions.thetaRatio]
*/
const safeSqrt = (x) => Math.sqrt(Math.max(x, 0));
const safeDivide = (x, y) => x / (y + Number.EPSILON);
const isNegligeable = (x) => Math.abs(x) < Number.EPSILON * 2;
const remapRectangular = (x, radius) => (x / radius + 1) / 2;
const remap = (x) => (x + 1) / 2;
/** @type {MappingsFn} */
function rectangular({ uvs, index, x, y, radius, sx = 1, sy = 1 }) {
	uvs[index] = remapRectangular(x, radius * sx);
	uvs[index + 1] = remapRectangular(y, radius * sy);
}
/** @type {MappingsFn} */
function polar({ uvs, index, radiusRatio, thetaRatio }) {
	uvs[index] = radiusRatio;
	uvs[index + 1] = thetaRatio;
}
/** @type {MappingsFn} */
function spherical({ uvs, index, nx, ny, nz }) {
	uvs[index] = -Math.atan2(nz, nx) / TAU + .5;
	uvs[index + 1] = Math.asin(Math.min(1, Math.max(-1, ny))) / Math.PI + .5;
}
/** @type {MappingsFn} */
function radial({ uvs, index, u, v }) {
	const x = safeDivide(Math.sqrt(u ** 2 + v ** 2), Math.max(Math.abs(u), Math.abs(v)));
	uvs[index] = remap(x * u);
	uvs[index + 1] = remap(x * v);
}
const FOUR_OVER_PI = 4 / Math.PI;
/** @type {MappingsFn} */
function concentric({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	const x = Math.sqrt(u2 + v2);
	if (u2 > v2) {
		uvs[index] = remap(x * Math.sign(u));
		uvs[index + 1] = remap(x * (FOUR_OVER_PI * Math.atan(safeDivide(v, Math.abs(u)))));
	} else {
		uvs[index] = remap(x * (FOUR_OVER_PI * Math.atan(safeDivide(u, Math.abs(v)))));
		uvs[index + 1] = remap(x * Math.sign(v));
	}
}
/** @type {MappingsFn} */
function lamé({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	uvs[index] = remap(Math.sign(u) * Math.abs(u) ** (1 - u2 - v2));
	uvs[index + 1] = remap(Math.sign(v) * Math.abs(v) ** (1 - u2 - v2));
}
/** @type {MappingsFn} */
function elliptical({ uvs, index, u, v }) {
	const t = u ** 2 - v ** 2;
	const pu1 = .5 * safeSqrt(2 + t + 2 * SQRT2 * u);
	const pu2 = .5 * safeSqrt(2 + t - 2 * SQRT2 * u);
	const pv1 = .5 * safeSqrt(2 - t + 2 * SQRT2 * v);
	const pv2 = .5 * safeSqrt(2 - t - 2 * SQRT2 * v);
	uvs[index] = remap(pu1 - pu2);
	uvs[index + 1] = remap(pv1 - pv2);
}
function fixFGSingularities(uvs, index, u, v) {
	if (isNegligeable(u) || isNegligeable(v)) {
		uvs[index] = remap(u);
		uvs[index + 1] = remap(v);
	} else return true;
}
/** @type {MappingsFn} */
function fgSquircular({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = Math.sqrt(uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 4 * u2 * v2)));
	uvs[index] = remap(sign / (v * SQRT2) * sqrtUV);
	uvs[index + 1] = remap(sign / (u * SQRT2) * sqrtUV);
}
/** @type {MappingsFn} */
function twoSquircular({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const sign = Math.sign(u * v);
	const sqrtUV = Math.sqrt(1 - safeSqrt(1 - 4 * u ** 2 * v ** 2));
	uvs[index] = remap(sign / (v * SQRT2) * sqrtUV);
	uvs[index + 1] = remap(sign / (u * SQRT2) * sqrtUV);
}
/** @type {MappingsFn} */
function threeSquircular({ uvs, index, u, v }) {
	if (fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const sqrtUV = Math.sqrt((1 - safeSqrt(1 - 4 * u ** 4 * v2 - 4 * u2 * v ** 4)) / (2 * (u2 + v2)));
	uvs[index] = remap(sign / v * sqrtUV);
	uvs[index + 1] = remap(sign / u * sqrtUV);
}
/** @type {MappingsFn} */
function cornerificTapered2({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = Math.sqrt((uv2Sum - Math.sqrt(uv2Sum * (uv2Sum - 4 * u2 * v2 * (2 - u2 - v2)))) / (2 * (2 - u2 - v2)));
	uvs[index] = remap(sign / v * sqrtUV);
	uvs[index + 1] = remap(sign / u * sqrtUV);
}
/** @type {MappingsFn} */
function tapered4({ uvs, index, u, v }) {
	if (!fixFGSingularities(uvs, index, u, v)) return;
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const divider = 3 - u ** 4 - 2 * u2 * v2 - v ** 4;
	const sqrtUV = Math.sqrt((uv2Sum - safeSqrt(uv2Sum * (uv2Sum - 2 * u2 * v2 * divider))) / divider);
	uvs[index] = remap(sign / v * sqrtUV);
	uvs[index + 1] = remap(sign / u * sqrtUV);
}
const FOURTH_SQRT2 = 2 ** (1 / 4);
/** @type {MappingsFn} */
function nonAxial2Pinch({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = (uv2Sum - 2 * u2 * v2 - safeSqrt((uv2Sum - 4 * u2 * v2) * uv2Sum)) ** (1 / 4);
	if (isNegligeable(v)) {
		uvs[index] = remap(Math.sign(u) * Math.sqrt(Math.abs(u)));
		uvs[index + 1] = remap(safeDivide(sign, u * FOURTH_SQRT2) * sqrtUV);
	} else {
		uvs[index] = remap(safeDivide(sign, v * FOURTH_SQRT2) * sqrtUV);
		uvs[index + 1] = remap(isNegligeable(u) ? Math.sign(v) * Math.sqrt(Math.abs(v)) : safeDivide(sign, u * FOURTH_SQRT2) * sqrtUV);
	}
}
/** @type {MappingsFn} */
function nonAxialHalfPinch({ uvs, index, u, v }) {
	const u2 = u ** 2;
	const v2 = v ** 2;
	const sign = Math.sign(u * v);
	const uv2Sum = u2 + v2;
	const sqrtUV = Math.sqrt(safeDivide(1 - safeSqrt(1 - 4 * u2 * v2 * uv2Sum ** 2), 2 * uv2Sum));
	if (isNegligeable(v)) {
		uvs[index] = remap(Math.sign(u) * u2);
		uvs[index + 1] = remap(safeDivide(sign, u) * sqrtUV);
	} else {
		uvs[index] = remap(safeDivide(sign, v) * sqrtUV);
		uvs[index + 1] = remap(isNegligeable(u) ? Math.sign(v) * v2 : safeDivide(sign, u) * sqrtUV);
	}
}
/** @type {MappingsFn} */
function squelched({ uvs, index, u, v, t }) {
	uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t) ? .5 : remap(u / Math.sqrt(1 - v ** 2));
	uvs[index + 1] = [
		0,
		TAU,
		Math.PI
	].includes(t) ? .5 : remap(v / Math.sqrt(1 - u ** 2));
}
/** @type {MappingsFn} */
function squelchedVertical({ uvs, index, u, v, t }) {
	uvs[index] = remap(u);
	uvs[index + 1] = [
		0,
		TAU,
		Math.PI
	].includes(t) ? .5 : remap(v / Math.sqrt(1 - u ** 2));
}
/** @type {MappingsFn} */
function squelchedHorizontal({ uvs, index, u, v, t }) {
	uvs[index] = [HALF_PI, TAU - HALF_PI].includes(t) ? .5 : remap(u / Math.sqrt(1 - v ** 2));
	uvs[index + 1] = remap(v);
}

/**
* @module utils
* @ignore
*/
/**
* @private
* @typedef {object} CenteredCorners
* @property {number[][]} centeredCorners
* @property {number} cx
* @property {number} cy
*/
/**
* Center a closed corner list on its own vertex average, returning the centered
* corners alongside that average (cx, cy) so a caller can translate a shape
* built around them back afterward. Shared by trapezoid/triangle: their radial
* fan (via computePolarGeometry) or outline (via computeOutlineEdge) must be
* centered on the shape's own centroid, not world origin, or an off-center
* corner (eg. trapezoid's topOffset, triangle's apexOffset) bunches rings tight
* on one side.
*
* @private
* @param {number[][]} corners
* @returns {CenteredCorners}
*/
function centerCorners(corners) {
	const [cx, cy] = corners.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0]).map((sum) => sum / corners.length);
	return {
		centeredCorners: corners.map(([x, y]) => [x - cx, y - cy]),
		cx,
		cy
	};
}
/**
* Translate a geometry's positions in place by (dx, dy), z untouched. The
* inverse of the recentering `centerCorners` sets up - applied after building
* around the recentered origin, so the shape lands back at its documented,
* caller-relative position.
*
* @private
* @param {Float32Array} positions
* @param {number} dx
* @param {number} dy
*/
function translatePositions(positions, dx, dy) {
	for (let i = 0; i < positions.length; i += 3) {
		positions[i] += dx;
		positions[i + 1] += dy;
	}
}
/**
* A point on a closed, explicit-corner outline at angle t: splits the outline
* into corners.length equal sectors starting at thetaOffset, finds which one t
* falls in, and linearly interpolates between its two corners. Unlike
* computePolygonEdge (a regular polygon, corners derived from rx/ry), corners
* are arbitrary [x, y] pairs supplied by the caller (eg. cross's dodecagon,
* trapezoid's quad) - shared so the two don't duplicate the same sector-lookup
* arithmetic. Assumes theta >= 0 (t - thetaOffset never negative): a negative
* theta makes local negative, and JS's `%` keeps a negative dividend's sign, so
* `corners[corner]` would index before the array's start.
*
* @private
* @param {number[][]} corners
* @param {number} thetaOffset
* @param {number} t
* @returns {[number, number]}
*/
function computeOutlineEdge(corners, thetaOffset, t) {
	const cornerCount = corners.length;
	const sector = TAU / cornerCount;
	const local = (t - thetaOffset) / sector;
	const corner = Math.floor(local) % cornerCount;
	const frac = local - Math.floor(local);
	const [x0, y0] = corners[corner];
	const [x1, y1] = corners[(corner + 1) % cornerCount];
	return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
function computeColumnCount(segments, theta) {
	return segments + (theta !== 0 && theta % TAU === 0 ? 0 : 1);
}
/**
* A grid of concentric rings (innerSegments, radiusRatio 0..1 from innerRadius
* to radius) sampled at evenly-spaced angular columns (segments, closed for a
* full revolution when theta is a multiple of TAU - the last column then shares
* its vertices with the first so the wrap edge is welded), fan-triangulated
* between rings. equation maps each (radiusRatio, angle) sample to its [x, y]
* position, defaulting to an ellipse's arc; mapping computes its uv and has no
* default, so it must always be supplied.
*
* @private
*/
function computePolarGeometry({ sx = 1, sy = 1, radius = .5, segments = 32, innerSegments = 16, theta = TAU, thetaOffset = 0, innerRadius = 0, mergeCentroid = true, mapping, equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta] } = {}) {
	const cols = computeColumnCount(segments, theta);
	const size = mergeCentroid ? 1 + innerSegments * cols : (innerSegments + 1) * cols;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(mergeCentroid ? segments * 3 + (innerSegments - 1) * segments * 6 : innerSegments * segments * 6);
	if (mergeCentroid) {
		normals[2] = 1;
		uvs[0] = .5;
		uvs[1] = .5;
	}
	let vertexIndex = mergeCentroid ? 1 : 0;
	let cellIndex = 0;
	const writeCells = (j, ringOffset, i, i1) => {
		if (mergeCentroid && j === 1) {
			cells[cellIndex] = ringOffset + i;
			cells[cellIndex + 1] = ringOffset + i1;
			cellIndex += 3;
		} else if (j > (mergeCentroid ? 1 : 0)) {
			const a = ringOffset - cols + i;
			const b = ringOffset + i;
			const c = ringOffset + i1;
			const d = ringOffset - cols + i1;
			cells[cellIndex] = a;
			cells[cellIndex + 1] = b;
			cells[cellIndex + 2] = d;
			cells[cellIndex + 3] = b;
			cells[cellIndex + 4] = c;
			cells[cellIndex + 5] = d;
			cellIndex += 6;
		}
	};
	for (let j = mergeCentroid ? 1 : 0; j <= innerSegments; j++) {
		const radiusRatio = j / innerSegments;
		const r = innerRadius + (radius - innerRadius) * radiusRatio;
		const ringOffset = vertexIndex;
		for (let i = 0; i < cols; i++, vertexIndex++) {
			const thetaRatio = i / segments;
			const t = thetaOffset + thetaRatio * theta;
			const cosTheta = Math.cos(t);
			const sinTheta = Math.sin(t);
			const [x, y] = equation({
				rx: sx * r,
				ry: sy * r,
				cosTheta,
				sinTheta,
				s: radiusRatio,
				t
			});
			positions[vertexIndex * 3] = x;
			positions[vertexIndex * 3 + 1] = y;
			normals[vertexIndex * 3 + 2] = 1;
			mapping({
				uvs,
				index: vertexIndex * 2,
				u: radiusRatio * cosTheta,
				v: radiusRatio * sinTheta,
				radius,
				radiusRatio,
				thetaRatio,
				t,
				x,
				y,
				sx,
				sy
			});
			if (i < segments) writeCells(j, ringOffset, i, (i + 1) % cols);
		}
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* A single ring of `segments` points swept across `theta` (`thetaOffset` start)
*
* - The path-only counterpart of `computePolarGeometry`'s angular dimension, with
*   no radial rings or fan-triangulation: just the boundary loop `equation(t)`
*   maps each angle to. `closed` repeats index `0` to explicitly close the
*   loop; open (the default) leaves the last vertex unconnected to the first,
*   matching every other path primitive's convention.
*
* @private
*/
function computePolarPathGeometry({ segments, theta, thetaOffset, closed, equation }) {
	const cols = computeColumnCount(segments, theta);
	const positions = new Float32Array(cols * 3);
	const path = Array.from({ length: cols + (closed ? 1 : 0) });
	for (let i = 0; i < cols; i++) {
		const [x, y] = equation(i / segments * theta + thetaOffset);
		positions[i * 3] = x;
		positions[i * 3 + 1] = y;
		path[i] = i;
	}
	if (closed) path[cols] = 0;
	return {
		positions,
		cells: [path]
	};
}
/**
* A point on a straight-edged polygon's boundary at angle t: splits the circle
* into cornerCount equal sectors starting at thetaOffset, finds which one t
* falls in, and linearly interpolates between its two corners. Each corner sits
* at (rx * cos(angle), ry * sin(angle)), independently scaled by
* xFactor/negativeXFactor (cos positive/negative) and yFactor/ negativeYFactor
* (sin positive/negative) - all default to 1, a regular polygon.
*
* @private
*/
function computePolygonEdge(thetaOffset, cornerCount, rx, ry, t, xFactor = 1, negativeXFactor = 1, yFactor = 1, negativeYFactor = 1) {
	const sector = TAU / cornerCount;
	const local = (t - thetaOffset) / sector;
	const corner = Math.floor(local);
	const frac = local - corner;
	const angle0 = thetaOffset + corner * sector;
	const angle1 = angle0 + sector;
	const x0 = rx * (Math.cos(angle0) >= 0 ? xFactor : negativeXFactor) * Math.cos(angle0);
	const x1 = rx * (Math.cos(angle1) >= 0 ? xFactor : negativeXFactor) * Math.cos(angle1);
	const y0 = ry * (Math.sin(angle0) >= 0 ? yFactor : negativeYFactor) * Math.sin(angle0);
	const y1 = ry * (Math.sin(angle1) >= 0 ? yFactor : negativeYFactor) * Math.sin(angle1);
	return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
const COLLAPSE_EPSILON = 1e-6;
/**
* Chebyshev-spaced sample of `[uMin, uMax]` at column `i` of `segments + 1`:
* denser near `uMin`/`uMax` than an even split, matching a sweep that pinches
* at both ends, where a boundary curve is steepest. `uMin`/`uMax`/ midpoint are
* special-cased to their exact values: floating point doesn't guarantee `uMin +
* t * (uMax - uMin)` reconstructs `uMax` at t=1, nor that `Math.cos(Math.PI /
* 2)` is bit-exact 0 at the midpoint.
*
* @private
*/
function computeChebyshevColumn(i, segments, uMin, uMax) {
	return i === 0 ? uMin : i === segments ? uMax : 2 * i === segments ? (uMin + uMax) / 2 : uMin + (1 - Math.cos(Math.PI * i / segments)) / 2 * (uMax - uMin);
}
/**
* Fills the region between two boundary curves swept along a parameter `u`: for
* each of `segments + 1` columns spanning `[uMin, uMax]`, `bounds(u)` gives
* `[vMin, vMax]`, and `point(u, v)` maps to an `(x, y)` position as `v` sweeps
* `[0, 1]` across `innerSegments + 1` rows.
*
* Quirks:
*
* - A column where `vMin === vMax` collapses to one vertex and fan-connects to
*   its neighboring column, instead of a zero-area quad.
* - `point`'s `(u, v)` must be right-handed (increasing `v` turns 90deg CCW from
*   increasing `u`) for CCW winding; pass `flip: true` otherwise.
* - Columns are Chebyshev-spaced (denser near `uMin`/`uMax`) rather than evenly
*   spaced, since a sweep pinches at both ends and a boundary curve is steepest
*   right there.
* - `uvs` default to `(uRatio, vRatio)`, following the arcs. Pass `mapping` for a
*   flat unwrap instead: it receives `(x, y)` shifted by `center` and scaled by
*   `radius`/`sx`/`sy`.
*
* @private
*/
function computeSweptArc({ segments, innerSegments, uMin, uMax, bounds, point, flip = false, mapping, center = [0, 0], radius = 1, sx = 1, sy = 1 }) {
	const cols = segments + 1;
	const rows = innerSegments + 1;
	const columnBounds = Array.from({ length: cols });
	const collapsed = new Uint8Array(cols);
	let vertexCount = 0;
	for (let i = 0; i < cols; i++) {
		const u = computeChebyshevColumn(i, segments, uMin, uMax);
		const [vMin, vMax] = bounds(u);
		columnBounds[i] = [
			u,
			vMin,
			vMax
		];
		collapsed[i] = Math.abs(vMax - vMin) < COLLAPSE_EPSILON ? 1 : 0;
		vertexCount += collapsed[i] ? 1 : rows;
	}
	const stripCellCount = (i) => collapsed[i] && collapsed[i + 1] ? 0 : collapsed[i] || collapsed[i + 1] ? (rows - 1) * 3 : (rows - 1) * 6;
	let cellCount = 0;
	for (let i = 0; i < segments; i++) cellCount += stripCellCount(i);
	const positions = new Float32Array(vertexCount * 3);
	const normals = new Float32Array(vertexCount * 3);
	const uvs = new Float32Array(vertexCount * 2);
	const cells = new (getCellsTypedArray(vertexCount))(cellCount);
	const columnOffsets = new Int32Array(cols);
	let vertexIndex = 0;
	let cellIndex = 0;
	const writeColumn = (i) => {
		const [u, vMin, vMax] = columnBounds[i];
		const uRatio = i / segments;
		const rowCount = collapsed[i] ? 1 : rows;
		for (let j = 0; j < rowCount; j++, vertexIndex++) {
			const vRatio = collapsed[i] ? .5 : j / innerSegments;
			const v = vMin + (collapsed[i] ? 0 : vRatio) * (vMax - vMin);
			const [x, y] = point(u, v);
			positions[vertexIndex * 3] = x;
			positions[vertexIndex * 3 + 1] = y;
			normals[vertexIndex * 3 + 2] = 1;
			if (mapping) mapping({
				uvs,
				index: vertexIndex * 2,
				x: x - center[0],
				y: y - center[1],
				radius,
				sx,
				sy,
				u,
				v,
				uRatio,
				vRatio
			});
			else {
				uvs[vertexIndex * 2] = uRatio;
				uvs[vertexIndex * 2 + 1] = vRatio;
			}
		}
	};
	for (let i = 0; i < cols; i++) {
		columnOffsets[i] = vertexIndex;
		writeColumn(i);
	}
	const [rim0, rim1] = flip ? [2, 1] : [1, 2];
	const [end0, end1] = flip ? [2, 0] : [0, 2];
	const writeStrip = (i) => {
		if (collapsed[i] && collapsed[i + 1]) return;
		const a = columnOffsets[i];
		const b = columnOffsets[i + 1];
		if (collapsed[i]) {
			for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
				cells[cellIndex] = a;
				cells[cellIndex + rim0] = b + j;
				cells[cellIndex + rim1] = b + j + 1;
			}
			return;
		}
		if (collapsed[i + 1]) {
			for (let j = 0; j < rows - 1; j++, cellIndex += 3) {
				cells[cellIndex + end0] = a + j;
				cells[cellIndex + 1] = b;
				cells[cellIndex + end1] = a + j + 1;
			}
			return;
		}
		for (let j = 0; j < rows - 1; j++, cellIndex += 6) {
			const p = a + j;
			const q = b + j;
			cells[cellIndex] = p;
			cells[cellIndex + rim0] = q;
			cells[cellIndex + rim1] = q + 1;
			cells[cellIndex + 3] = p;
			cells[cellIndex + 3 + rim0] = q + 1;
			cells[cellIndex + 3 + rim1] = p + 1;
		}
	};
	for (let i = 0; i < segments; i++) writeStrip(i);
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
const CORNER_COUNT$2 = 3;
function computeTriangleCorners(sx, sy, apexOffset) {
	return centerCorners([
		[-sx, -sy],
		[sx, -sy],
		[apexOffset, sy]
	]);
}
/**
* @typedef {object} TriangleOptions
* @property {number} [sx=1] Base half-width: the base corners sit at `x =
*   -sx`/`x = sx`.
* @property {number} [sy=1] Half-height: the base sits at `y = -sy`, the apex
*   at `y = sy`.
* @property {number} [apexOffset=0] Horizontal shift of the apex, in the same
*   units as `sx`. `0` (default) keeps it centered (an isosceles triangle);
*   `±sx` lands it directly above a base corner (a right triangle); anything
*   else gives a scalene triangle.
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU] Negative values aren't supported: the corner
*   lookup assumes `t - thetaOffset` stays non-negative.
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.
*/
/**
* A triangle: a horizontal base with the apex placed anywhere above it via
* `apexOffset`. `thetaOffset=0` starts at the bottom-left corner and sweeps CCW
* through bottom-right, apex.
*
* @param {TriangleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Triangle]{@link https://mathworld.wolfram.com/Triangle.html}
*/
function triangle({ sx = 1, sy = 1, apexOffset = 0, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = rectangular } = {}) {
	const { centeredCorners, cx, cy } = computeTriangleCorners(sx, sy, apexOffset);
	const geometry = computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments: edgeSegments * CORNER_COUNT$2,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, t }) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [rx * x, rx * y];
		}
	});
	if (cx !== 0 || cy !== 0) translatePositions(geometry.positions, radius * cx, radius * cy);
	return geometry;
}
/**
* @typedef {object} TrianglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [apexOffset=0]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `triangle`: the same 3 corners, walked directly instead of
* fanned.
*
* @param {TrianglePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function trianglePath({ sx = 1, sy = 1, apexOffset = 0, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	const { centeredCorners, cx, cy } = computeTriangleCorners(sx, sy, apexOffset);
	const dx = radius * cx;
	const dy = radius * cy;
	return computePolarPathGeometry({
		segments: edgeSegments * CORNER_COUNT$2,
		theta,
		thetaOffset,
		closed,
		equation: (t) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [radius * x + dx, radius * y + dy];
		}
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} RightTriangleOptions
* @property {number} [sx=1] Horizontal leg half-length: the leg itself runs the
*   full `2 * sx`, from the right-angle corner to the opposite base corner.
* @property {number} [sy=1] Vertical leg half-length, likewise doubled.
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A right triangle: `triangle` with its apex pulled directly above the
* bottom-left corner (`apexOffset = -sx`), landing the right angle there.
*
* @param {RightTriangleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function rightTriangle({ sx = 1, sy = 1, radius, edgeSegments, innerSegments, innerRadius, theta, thetaOffset, mergeCentroid, mapping } = {}) {
	return triangle({
		sx,
		sy,
		apexOffset: -sx,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping
	});
}
/**
* @typedef {object} RightTrianglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `rightTriangle`: `trianglePath` with `apexOffset` fixed to
* `-sx`.
*
* @param {RightTrianglePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function rightTrianglePath({ sx = 1, sy = 1, radius, edgeSegments, theta, thetaOffset, closed } = {}) {
	return trianglePath({
		sx,
		sy,
		apexOffset: -sx,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module utils
* @ignore
*/
/** @private */
const PLANE_DIRECTIONS = {
	z: [
		0,
		1,
		2,
		1,
		-1,
		1
	],
	"-z": [
		0,
		1,
		2,
		-1,
		-1,
		-1
	],
	"-x": [
		2,
		1,
		0,
		1,
		-1,
		-1
	],
	x: [
		2,
		1,
		0,
		-1,
		-1,
		1
	],
	y: [
		0,
		2,
		1,
		1,
		1,
		1
	],
	"-y": [
		0,
		2,
		1,
		1,
		-1,
		-1
	]
};
/**
* Piecewise sampling so region boundaries are computed once and bit-exact. n =
* 0 collapses the straight section to a single column; cornerSegments = 0
* collapses to a plain -size/2 + index * size/n grid.
*
* @private
*/
function getPlaneCoordinate(index, n, size, cornerRadius, cornerSegments) {
	return index < cornerSegments ? -size / 2 - cornerRadius + index * cornerRadius / cornerSegments : index <= cornerSegments + n ? -size / 2 + (n ? (index - cornerSegments) * size / n : 0) : size / 2 + (index - cornerSegments - n) * cornerRadius / cornerSegments;
}
/**
* Remap a 2D offset from a corner reference point onto the true circular arc of
* the same radius: preserves the offset's angle and rescales its distance from
* Chebyshev (the flat square grid extension) to Euclidean (the circle).
*
* @private
* @param {number} dx
* @param {number} dy
* @returns {[number, number]}
*/
function remapCornerOffset(dx, dy) {
	const scale = Math.max(Math.abs(dx), Math.abs(dy)) / Math.hypot(dx, dy);
	return [dx * scale, dy * scale];
}
/**
* Whether a plane grid index falls in the rounded-corner range (before 0 or
* after n), given cornerSegments straight-section columns/rows on each side.
*
* @private
*/
function isPlaneCorner(index, n, cornerSegments) {
	return index < cornerSegments || index >= cornerSegments + n;
}
/**
* Reference corner coordinate a rounded value is beyond, or null when it sits
* within the straight [-half, half] span (no rounding needed there).
*
* @private
*/
function getPlaneCornerReference(value, half) {
	return value < -half ? -half : value > half ? half : null;
}
/**
* Whether the corner a value pair [cx, cy] sits in (relative to plane center,
* by sign) is selected by roundCorners: a uniform true/false, or a 4-item
* boolean array indexing [-u-v, +u-v, +u+v, -u+v]. False when either is null
* (getPlaneCornerReference's sentinel for "not in a corner").
*
* @private
*/
function isPlaneCornerRounded(cx, cy, roundCorners) {
	if (cx === null || cy === null) return false;
	if (roundCorners === true || roundCorners === false) return roundCorners;
	return roundCorners[cx < 0 ? cy < 0 ? 0 : 3 : cy < 0 ? 1 : 2];
}
/**
* Plane as a single welded grid, optionally with rounded corners
* (cornerRadius/cornerSegments > 0): [cornerSegments|nu|cornerSegments] x
* [cornerSegments|nv|cornerSegments], so face, edges and corners share their
* boundary vertices, with radial diagonals in the corner quads. su/sv are the
* inner face sizes (full size minus 2 * cornerRadius); they collapse to the
* plain su/sv grid when cornerRadius/cornerSegments are 0. roundCorners is
* false (none rounded), true (all 4 rounded), or a 4-item boolean array
* selecting which of [-u-v, +u-v, +u+v, -u+v] round. Unselected corners stay
* flat/square - their raw grid extension left as-is.
*
* @private
*/
function computePlane(geometry, indices, su, sv, nu, nv, direction = "z", pw = 0, uvScale = [1, 1], uvOffset = [0, 0], center = [
	0,
	0,
	0
], ccw = true, cornerRadius = 0, cornerSegments = 0, roundCorners = false) {
	const { positions, normals, uvs, cells } = geometry;
	const [u, v, w, flipU, flipV, normal] = PLANE_DIRECTIONS[direction];
	const cols = 2 * cornerSegments + nu;
	const rows = 2 * cornerSegments + nv;
	const width = su + 2 * cornerRadius;
	const height = sv + 2 * cornerRadius;
	const vertexOffset = indices.vertex;
	const [s1, s2, s4, s5] = ccw ? [
		1,
		2,
		4,
		5
	] : [
		2,
		1,
		5,
		4
	];
	const writeVertex = (x0, y0) => {
		let x = x0;
		let y = y0;
		if (cornerRadius > 0) {
			const cx = getPlaneCornerReference(x0, su / 2);
			const cy = getPlaneCornerReference(y0, sv / 2);
			if (isPlaneCornerRounded(cx, cy, roundCorners)) {
				const [dx, dy] = remapCornerOffset(x0 - cx, y0 - cy);
				x = cx + dx;
				y = cy + dy;
			}
		}
		positions[indices.vertex * 3 + u] = x * flipU + center[u];
		positions[indices.vertex * 3 + v] = y * flipV + center[v];
		positions[indices.vertex * 3 + w] = pw + center[w];
		normals[indices.vertex * 3 + w] = normal;
		uvs[indices.vertex * 2] = (x0 + width / 2) / width * uvScale[0] + uvOffset[0];
		uvs[indices.vertex * 2 + 1] = (1 - (y0 + height / 2) / height) * uvScale[1] + uvOffset[1];
		indices.vertex++;
	};
	const writeQuad = (i, j, radial) => {
		const n = vertexOffset + j * (cols + 1) + i;
		const o = n + cols + 1;
		if (radial) {
			cells[indices.cell] = n + 1;
			cells[indices.cell + s1] = n;
			cells[indices.cell + s2] = o;
			cells[indices.cell + 3] = n + 1;
			cells[indices.cell + s4] = o;
			cells[indices.cell + s5] = o + 1;
		} else {
			cells[indices.cell] = n;
			cells[indices.cell + s1] = o;
			cells[indices.cell + s2] = o + 1;
			cells[indices.cell + 3] = n;
			cells[indices.cell + s4] = o + 1;
			cells[indices.cell + s5] = n + 1;
		}
		indices.cell += 6;
	};
	for (let j = 0; j <= rows; j++) {
		const y0 = getPlaneCoordinate(j, nv, sv, cornerRadius, cornerSegments);
		const cornerV = isPlaneCorner(j, nv, cornerSegments);
		for (let i = 0; i <= cols; i++) {
			const x0 = getPlaneCoordinate(i, nu, su, cornerRadius, cornerSegments);
			const cornerU = isPlaneCorner(i, nu, cornerSegments);
			writeVertex(x0, y0);
			if (j < rows && i < cols) writeQuad(i, j, cornerU && cornerV && i < cornerSegments !== j < cornerSegments);
		}
	}
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} PlaneOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [nx=1]
* @property {number} [ny=nx]
* @property {PlaneDirection} [direction="z"]
*/
/** @typedef {"x" | "-x" | "y" | "-y" | "z" | "-z"} PlaneDirection */
/**
* A flat rectangular grid, facing `direction`.
*
* @param {PlaneOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function plane({ sx = 1, sy = sx, nx = 1, ny = nx, direction = "z" } = {}) {
	const size = (nx + 1) * (ny + 1);
	return computePlane({
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))(nx * ny * 6)
	}, {
		vertex: 0,
		cell: 0
	}, sx, sy, nx, ny, direction, 0);
}
/**
* @typedef {object} RectanglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [nx=1] Segments along the bottom/top edges
* @property {number} [ny=nx] Segments along the left/right edges
*/
/**
* Outline dual of `plane`: just its `z`-facing boundary loop, walked directly
* (bottom-left → bottom-right → top-right → top-left) rather than extracted
* from the full grid.
*
* @param {RectanglePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function rectanglePath({ sx = 1, sy = .5, nx = 1, ny = nx } = {}) {
	const x = sx * .5;
	const y = sy * .5;
	const corners = [
		[-x, -y],
		[x, -y],
		[x, y],
		[-x, y]
	];
	const segments = [
		nx,
		ny,
		nx,
		ny
	];
	const size = 2 * (nx + ny);
	const positions = new Float32Array(size * 3);
	const path = Array.from({ length: size });
	let vertexIndex = 0;
	for (let edge = 0; edge < 4; edge++) {
		const [x0, y0] = corners[edge];
		const [x1, y1] = corners[(edge + 1) % 4];
		const n = segments[edge];
		for (let i = 0; i < n; i++) {
			const t = i / n;
			positions[vertexIndex * 3] = x0 + (x1 - x0) * t;
			positions[vertexIndex * 3 + 1] = y0 + (y1 - y0) * t;
			path[vertexIndex] = vertexIndex;
			vertexIndex++;
		}
	}
	return {
		positions,
		cells: [path]
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} QuadOptions
* @property {number} [scale=1] Side length.
*/
/**
* A square, filled with 2 triangles.
*
* @param {QuadOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function quad({ scale = 1 } = {}) {
	const { positions, cells } = squarePath({ scale });
	return {
		positions,
		normals: Float32Array.of(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1),
		uvs: Float32Array.of(0, 0, 1, 0, 1, 1, 0, 1),
		cells: triangulateFaces(cells, 4)
	};
}
/**
* @typedef {object} SquarePathOptions
* @property {number} [scale=1] Side length.
* @property {number} [nx=1] Segments along the bottom/top edges
* @property {number} [ny=nx] Segments along the left/right edges
*/
/**
* Outline dual of `quad`: `rectanglePath` with `sx = sy = scale`, same as
* `quad` itself is built from it.
*
* @param {SquarePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function squarePath({ scale = 1, nx = 1, ny = nx } = {}) {
	return rectanglePath({
		sx: scale,
		sy: scale,
		nx,
		ny
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/** @typedef {"top-left" | "top-right" | "bottom-right" | "bottom-left"} RoundedRectangleCorner */
/**
* @typedef {object} RoundedRectangleOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [radius=sx * 0.25]
* @property {number} [roundSegments=8]
* @property {number} [nx=1] Segments along the straight top/bottom sections.
* @property {number} [ny=nx] Segments along the straight left/right sections.
* @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
*/
const CORNER_ORDER = [
	"top-left",
	"top-right",
	"bottom-right",
	"bottom-left"
];
/**
* A rectangle with rounded corners.
*
* @param {RoundedRectangleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function roundedRectangle({ sx = 1, sy = sx, radius = sx * .25, roundSegments = 8, nx = 1, ny = nx, roundedCorners = CORNER_ORDER } = {}) {
	const r2 = radius * 2;
	const widthX = sx - r2;
	const widthY = sy - r2;
	if (widthX === 0) nx = 0;
	if (widthY === 0) ny = 0;
	const cols = 2 * roundSegments + nx;
	const rows = 2 * roundSegments + ny;
	const size = (cols + 1) * (rows + 1);
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))(cols * rows * 6)
	};
	computePlane(geometry, {
		vertex: 0,
		cell: 0
	}, widthX, widthY, nx, ny, "z", 0, [1, 1], [0, 0], [
		0,
		0,
		0
	], true, radius, roundSegments, CORNER_ORDER.map((corner) => roundedCorners.includes(corner)));
	return geometry;
}
const PATH_CORNERS = [
	{
		name: "bottom-left",
		signX: -1,
		signY: -1,
		angleStart: Math.PI
	},
	{
		name: "bottom-right",
		signX: 1,
		signY: -1,
		angleStart: 1.5 * Math.PI
	},
	{
		name: "top-right",
		signX: 1,
		signY: 1,
		angleStart: 0
	},
	{
		name: "top-left",
		signX: -1,
		signY: 1,
		angleStart: HALF_PI
	}
];
/**
* @typedef {object} RoundedRectanglePathOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [radius=sx * 0.25]
* @property {number} [roundSegments=8]
* @property {number} [nx=1]
* @property {number} [ny=nx]
* @property {RoundedRectangleCorner[]} [roundedCorners=["top-left", "top-right", "bottom-right", "bottom-left"]]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `roundedRectangle`: same radius/segment/roundedCorners
* conventions, walked directly (bottom-left → bottom-right → top-right →
* top-left). A rounded corner contributes `roundSegments` samples along its
* quarter-circle arc; a sharp one contributes its single corner point. Produces
* identical output to `rectanglePath` when `radius` is `0`.
*
* @param {RoundedRectanglePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function roundedRectanglePath({ sx = 1, sy = sx, radius = sx * .25, roundSegments = 8, nx = 1, ny = nx, roundedCorners = CORNER_ORDER, closed = false } = {}) {
	const x = sx * .5;
	const y = sy * .5;
	if (sx === radius * 2) nx = 0;
	if (sy === radius * 2) ny = 0;
	const isRounded = PATH_CORNERS.map(({ name }) => radius > 0 && roundedCorners.includes(name));
	const cornerCounts = isRounded.map((rounded) => rounded ? roundSegments : 1);
	const edgeCounts = [
		nx,
		ny,
		nx,
		ny
	].map((n, c) => n > 0 && !isRounded[c] ? n - 1 : n);
	const point = (c, sweep) => {
		const { signX, signY, angleStart } = PATH_CORNERS[c];
		if (!isRounded[c]) return [signX * x, signY * y];
		const cx = signX * (x - radius);
		const cy = signY * (y - radius);
		const angle = angleStart + sweep;
		return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
	};
	const size = cornerCounts.reduce((a, b) => a + b, 0) + edgeCounts.reduce((a, b) => a + b, 0);
	const positions = new Float32Array(size * 3);
	const path = Array.from({ length: size + (closed ? 1 : 0) });
	let vertexIndex = 0;
	const writeVertex = (px, py) => {
		positions[vertexIndex * 3] = px;
		positions[vertexIndex * 3 + 1] = py;
		path[vertexIndex] = vertexIndex;
		vertexIndex++;
	};
	const writeCorner = (c) => {
		for (let s = 0; s < cornerCounts[c]; s++) {
			const [px, py] = point(c, isRounded[c] ? s / roundSegments * HALF_PI : 0);
			writeVertex(px, py);
		}
	};
	const writeEdge = (c) => {
		const n = [
			nx,
			ny,
			nx,
			ny
		][c];
		if (n <= 0) return;
		const [x0, y0] = point(c, HALF_PI);
		const [x1, y1] = point((c + 1) % 4, 0);
		const start = isRounded[c] ? 0 : 1;
		for (let i = start; i < n; i++) {
			const t = i / n;
			writeVertex(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
		}
	};
	for (let c = 0; c < 4; c++) {
		writeCorner(c);
		writeEdge(c);
	}
	if (closed) path[size] = 0;
	return {
		positions,
		cells: [path]
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} StadiumOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [nx=1]
* @property {number} [ny=nx]
* @property {number} [roundSegments=8]
*/
/**
* A stadium (discorectangle): `roundedRectangle` with `radius` fixed to half
* the shorter side.
*
* @param {StadiumOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function stadium({ sx = 1, sy = .5, nx, ny, roundSegments } = {}) {
	return roundedRectangle({
		sx,
		sy,
		nx,
		ny,
		radius: Math.min(sx, sy) * .5,
		roundSegments
	});
}
/**
* @typedef {object} StadiumPathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [nx=1]
* @property {number} [ny=nx]
* @property {number} [roundSegments=8]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `stadium`: `roundedRectanglePath` with `radius` fixed to half
* the shorter side, collapsing that axis's straight section to 0 (two
* semicircular caps joined by straight edges).
*
* @param {StadiumPathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function stadiumPath({ sx = 1, sy = .5, nx, ny, roundSegments, closed } = {}) {
	return roundedRectanglePath({
		sx,
		sy,
		nx,
		ny,
		radius: Math.min(sx, sy) * .5,
		roundSegments,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} KiteOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [ratio=0.5] Bottom vertex distance from center, as a
*   fraction of the top vertex's (sy). `ratio=1` is a rhombus, `ratio=0`
*   collapses the bottom to the center.
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=HALF_PI]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A kite: a rhombus with its bottom vertex pulled toward the center (by ratio)
* while the top, left and right vertices stay put.
*
* @param {KiteOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function kite({ sx = 1, sy = 1, ratio = .5, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = HALF_PI, mergeCentroid = innerRadius === 0, mapping = concentric } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments: edgeSegments * 4,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, ry, t }) => computePolygonEdge(thetaOffset, 4, rx, ry, t, 1, 1, 1, ratio)
	});
}
/**
* @typedef {object} KitePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [ratio=0.5]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=HALF_PI]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `kite`: same shape, `ratio` pulling the bottom vertex toward
* the center.
*
* @param {KitePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function kitePath({ sx = 1, sy = 1, ratio = .5, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = HALF_PI, closed = false } = {}) {
	return computePolarPathGeometry({
		segments: edgeSegments * 4,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computePolygonEdge(thetaOffset, 4, sx * radius, sy * radius, t, 1, 1, 1, ratio)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} PolygonOptions
* @property {number} [sides=6]
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A regular polygon: sides corners evenly spaced around a circle, connected by
* straight edges rather than ellipse's elliptical arc (rhombus is this shape's
* sides=4 case). sx/sy independently scale the two axes; equal values keep it
* regular, different values stretch it into an ellipse-inscribed polygon.
*
* @param {PolygonOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
*/
function polygon({ sides = 6, sx = 1, sy = 1, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = concentric } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments: edgeSegments * sides,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, ry, t }) => computePolygonEdge(thetaOffset, sides, rx, ry, t)
	});
}
/**
* @typedef {object} PolygonPathOptions
* @property {number} [sides=6]
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `polygon`: sides corners evenly spaced around a circle,
* connected by straight edges (rhombus is this shape's sides=4 case).
*
* @param {PolygonPathOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplexPath} `edgeSegments *
*   sides` positions (`+ 1` for a partial `theta`) and a single path cell of
*   that many indices (`+ 1`, repeating index `0`, when `closed`)
*/
function polygonPath({ sides = 6, sx = 1, sy = 1, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return computePolarPathGeometry({
		segments: edgeSegments * sides,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computePolygonEdge(thetaOffset, sides, sx * radius, sy * radius, t)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} RhombusOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=HALF_PI]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A rhombus: a diamond with vertices at top/right/bottom/left, sx and sy
* independently scaling the horizontal and vertical diagonals. Equal sx/sy
* gives a square rotated 45°.
*
* @param {RhombusOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function rhombus({ sx = 1, sy = 1, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = HALF_PI, mergeCentroid = innerRadius === 0, mapping = concentric } = {}) {
	return polygon({
		sides: 4,
		sx,
		sy,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping
	});
}
/**
* @typedef {object} RhombusPathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=HALF_PI]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `rhombus`: `polygonPath` with sides fixed to `4`.
*
* @param {RhombusPathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function rhombusPath({ sx = 1, sy = 1, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = HALF_PI, closed = false } = {}) {
	return polygonPath({
		sides: 4,
		sx,
		sy,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LozengeOptions
* @property {number} [sx=0.5]
* @property {number} [sy=sx*2]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=HALF_PI]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A rhombus elongated along its vertical diagonal by default (sy = sx * 2), the
* classic narrow diamond look.
*
* @param {LozengeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function lozenge({ sx = .5, sy = sx * 2, radius, edgeSegments, innerSegments, innerRadius, theta, thetaOffset, mergeCentroid, mapping } = {}) {
	return rhombus({
		sx,
		sy,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping
	});
}
/**
* @typedef {object} LozengePathOptions
* @property {number} [sx=0.5]
* @property {number} [sy=sx*2]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=HALF_PI]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `lozenge`: `rhombusPath` elongated along its vertical
* diagonal by default (sy = sx * 2).
*
* @param {LozengePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function lozengePath({ sx = .5, sy = sx * 2, radius, edgeSegments, theta, thetaOffset, closed } = {}) {
	return rhombusPath({
		sx,
		sy,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
const CORNER_COUNT$1 = 4;
function computeTrapezoidCorners(sx, sy, topRatio, topOffset) {
	return centerCorners([
		[-sx, -sy],
		[sx, -sy],
		[topOffset + sx * topRatio, sy],
		[topOffset - sx * topRatio, sy]
	]);
}
/**
* @typedef {object} TrapezoidOptions
* @property {number} [sx=1] Bottom edge half-width.
* @property {number} [sy=1] Half-height: the bottom/top edges sit at `y =
*   -sy`/`y = sy`.
* @property {number} [topRatio=0.5] Top edge half-width, as a fraction of `sx`.
*   `1` matches the bottom edge's width (a parallelogram once `topOffset`
*   shifts it off-center); `0` collapses the top edge to a point (a triangle).
* @property {number} [topOffset=0] Horizontal shift of the top edge's center,
*   in the same units as `sx`. `0` (default) keeps both legs symmetric (an
*   isosceles trapezoid); a non-zero shift skews it into a right/scalene
*   trapezoid.
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU] Negative values aren't supported: the corner
*   lookup assumes `t - thetaOffset` stays non-negative.
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.
*/
/**
* A trapezoid: a quad with horizontal top/bottom edges, the top narrowed to
* `topRatio` of the bottom's width and optionally shifted by `topOffset`. The
* default `thetaOffset=0` starts at the bottom-left corner and sweeps CCW
* through bottom-right, top-right, top-left.
*
* @param {TrapezoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Trapezoid]{@link https://mathworld.wolfram.com/Trapezoid.html}
*/
function trapezoid({ sx = 1, sy = 1, topRatio = .5, topOffset = 0, radius = .5, edgeSegments = 1, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = rectangular } = {}) {
	const { centeredCorners, cx, cy } = computeTrapezoidCorners(sx, sy, topRatio, topOffset);
	const geometry = computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments: edgeSegments * CORNER_COUNT$1,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, t }) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [rx * x, rx * y];
		}
	});
	if (cx !== 0 || cy !== 0) translatePositions(geometry.positions, radius * cx, radius * cy);
	return geometry;
}
/**
* @typedef {object} TrapezoidPathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [topRatio=0.5]
* @property {number} [topOffset=0]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `trapezoid`: the same 4 corners, walked directly instead of
* fanned.
*
* @param {TrapezoidPathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function trapezoidPath({ sx = 1, sy = 1, topRatio = .5, topOffset = 0, radius = .5, edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	const { centeredCorners, cx, cy } = computeTrapezoidCorners(sx, sy, topRatio, topOffset);
	const dx = radius * cx;
	const dy = radius * cy;
	return computePolarPathGeometry({
		segments: edgeSegments * CORNER_COUNT$1,
		theta,
		thetaOffset,
		closed,
		equation: (t) => {
			const [x, y] = computeOutlineEdge(centeredCorners, thetaOffset, t);
			return [radius * x + dx, radius * y + dy];
		}
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ParallelogramOptions
* @property {number} [sx=0.5] Narrower than `trapezoid`'s default so the
*   sheared top edge still fits the unit box.
* @property {number} [sy=1]
* @property {number} [shear=0.3] Horizontal shift of the top edge's center, in
*   the same units as `sx`.
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* A parallelogram: `trapezoid` with `topRatio` fixed to `1` (top and bottom
* edges the same width) and shifted sideways by `shear`.
*
* @param {ParallelogramOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function parallelogram({ sx = .5, sy = 1, shear = .3, radius, edgeSegments, innerSegments, innerRadius, theta, thetaOffset, mergeCentroid, mapping } = {}) {
	return trapezoid({
		sx,
		sy,
		topRatio: 1,
		topOffset: shear,
		radius,
		edgeSegments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping
	});
}
/**
* @typedef {object} ParallelogramPathOptions
* @property {number} [sx=0.5]
* @property {number} [sy=1]
* @property {number} [shear=0.3]
* @property {number} [radius=0.5]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `parallelogram`: `trapezoidPath` with `topRatio` fixed to
* `1`, shifted sideways by `shear`.
*
* @param {ParallelogramPathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function parallelogramPath({ sx = .5, sy = 1, shear = .3, radius, edgeSegments, theta, thetaOffset, closed } = {}) {
	return trapezoidPath({
		sx,
		sy,
		topRatio: 1,
		topOffset: shear,
		radius,
		edgeSegments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ArbelosOptions
* @property {number} [radius=0.5] Outer (enclosing) semicircle's radius: half
*   the total baseline width.
* @property {number} [innerRadius=radius*0.25] Radius of the left of the 2
*   inner semicircles, both bulging the _same_ way as the enclosing one (up,
*   above the baseline) and tangent to each other where they meet it:
*   `innerRadius` and `radius - innerRadius` apart from the enclosing
*   semicircle's left/right ends, respectively.
* @property {number} [segments=32] Column count, swept left to right.
* @property {number} [innerSegments=16] Row count between the bottom and top
*   boundary at each column.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a
*   function using `uRatio`/`vRatio` (the swept parametrization) to follow the
*   arcs instead.
*/
/**
* Arbelos ("shoemaker's knife"): the region inside a big semicircle and outside
* 2 smaller ones sharing its baseline, tangent where their diameters meet.
* Area: `pi * innerRadius * (radius - innerRadius)`.
*
* @param {ArbelosOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Arbelos]{@link https://mathworld.wolfram.com/Arbelos.html}
*/
function arbelos({ radius = .5, innerRadius = radius * .25, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const R = radius;
	const r1 = innerRadius;
	const r2 = R - r1;
	const leftCenter = -R + r1;
	const rightCenter = r1;
	const splitX = leftCenter + r1;
	const outer = (x) => Math.sqrt(Math.max(R * R - x * x, 0));
	const leftInner = (x) => x === splitX ? 0 : Math.sqrt(Math.max(r1 * r1 - (x - leftCenter) ** 2, 0));
	const rightInner = (x) => x === splitX ? 0 : Math.sqrt(Math.max(r2 * r2 - (x - rightCenter) ** 2, 0));
	const center = [0, R / 2];
	const sx = R;
	const sy = R / 2;
	const point = (x, y) => [x, y];
	return concatGeometries([computeSweptArc({
		segments,
		innerSegments,
		uMin: -R,
		uMax: splitX,
		mapping,
		center,
		sx,
		sy,
		bounds: (x) => [leftInner(x), outer(x)],
		point
	}), computeSweptArc({
		segments,
		innerSegments,
		uMin: splitX,
		uMax: R,
		mapping,
		center,
		sx,
		sy,
		bounds: (x) => [rightInner(x), outer(x)],
		point
	})]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LensOptions
* @property {number} [radius=0.5] Radius of the first circle, centered at
*   `-distance / 2`.
* @property {number} [radius2=radius] Radius of the second circle, centered at
*   `distance / 2`. Equal to `radius` (a symmetric lens) by default.
* @property {number} [distance=radius] Distance between the two circles'
*   centers.
* @property {number} [segments=32] Column count, swept left to right.
* @property {number} [innerSegments=16] Row count between the bottom and top
*   boundary at each column.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a
*   function using `uRatio`/`vRatio` (the swept parametrization) to follow the
*   arcs instead.
*/
/**
* Lens: the convex region where two circles overlap, centered on the x axis and
* offset symmetrically by `distance`. Defaults to a Vesica Piscis.
*
* @param {LensOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Lens]{@link https://mathworld.wolfram.com/Lens.html}
* @see [Wolfram MathWorld – Vesica Piscis]{@link https://mathworld.wolfram.com/VesicaPiscis.html}
*/
function lens({ radius = .5, radius2 = radius, distance = radius, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const r1 = radius;
	const r2 = radius2;
	const c1 = -distance / 2;
	const c2 = distance / 2;
	const uMin = Math.max(c1 - r1, c2 - r2);
	const uMax = Math.min(c1 + r1, c2 + r2);
	const height = (x) => Math.min(Math.sqrt(Math.max(r1 * r1 - (x - c1) ** 2, 0)), Math.sqrt(Math.max(r2 * r2 - (x - c2) ** 2, 0)));
	const centerX = (uMin + uMax) / 2;
	return computeSweptArc({
		segments,
		innerSegments,
		uMin,
		uMax,
		mapping,
		center: [centerX, 0],
		sx: (uMax - uMin) / 2,
		sy: height(centerX),
		bounds: (x) => {
			const h = height(x);
			return [-h, h];
		},
		point: (x, y) => [x, y]
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LuneOptions
* @property {number} [radius=0.5] Radius of the big circle (`b` in MathWorld's
*   notation), centered at the origin.
* @property {number} [innerRadius=radius] Radius of the small circle (`a`),
*   whose disk is subtracted from the big one. Must be `< radius`.
* @property {number} [distance=radius*0.5] Offset of the small circle's center
*   from the origin, along +x (`c`). For a proper crescent (both arcs
*   contributing to the boundary) `distance + innerRadius` must exceed
*   `radius`, ie. the small circle actually pokes through the big one's edge
*   rather than sitting fully inside it.
* @property {number} [segments=32] Column count, swept left to right.
* @property {number} [innerSegments=16] Row count between the two halves'
*   near/far boundary at each column.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a
*   function using `uRatio`/`vRatio` (the swept parametrization) to follow the
*   arcs instead.
*/
/**
* Lune: a crescent, the region inside the big circle and outside the offset
* small one.
*
* @param {LuneOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Lune]{@link https://mathworld.wolfram.com/Lune.html}
*/
function lune({ radius = .5, innerRadius = radius, distance = radius * .5, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const b = radius;
	const a = innerRadius;
	const d = distance;
	const uMin = -b;
	const uMax = (b * b - a * a + d * d) / (2 * d);
	const kink = d - a;
	const outerBound = (x) => Math.sqrt(Math.max(b * b - x * x, 0));
	const innerBound = (x) => Math.sqrt(Math.max(a * a - (x - d) ** 2, 0));
	const center = [(uMin + uMax) / 2, 0];
	const sx = (uMax - uMin) / 2;
	const sy = outerBound(Math.min(Math.max(0, uMin), uMax));
	function sweepBand(mirror) {
		const pieces = [];
		const flat = (x) => mirror ? [-outerBound(x), 0] : [0, outerBound(x)];
		const curved = (x) => mirror ? [-outerBound(x), -innerBound(x)] : [innerBound(x), outerBound(x)];
		const capEnd = Math.min(kink, uMax);
		if (capEnd > uMin) pieces.push(computeSweptArc({
			segments,
			innerSegments,
			uMin,
			uMax: capEnd,
			mapping,
			center,
			sx,
			sy,
			bounds: flat,
			point: (x, y) => [x, y]
		}));
		const hornStart = Math.max(kink, uMin);
		if (hornStart < uMax) pieces.push(computeSweptArc({
			segments,
			innerSegments,
			uMin: hornStart,
			uMax,
			mapping,
			center,
			sx,
			sy,
			bounds: curved,
			point: (x, y) => [x, y]
		}));
		return pieces;
	}
	return concatGeometries([...sweepBand(false), ...sweepBand(true)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SalinonOptions
* @property {number} [radius=0.5] Outer (enclosing) radius: half the total
*   width, and the radius of the semicircle forming the bottom boundary.
* @property {number} [innerRadius=radius*0.25] Radius of the central
*   semicircle, bulging _opposite_ the enclosing one (up, above the baseline)
*   over the middle third. The two flanking "ear" semicircles bulge the _same_
*   way as the enclosing one (down, a shallower dip below the baseline) over
*   the outer two thirds, sized to meet it at the baseline: `(radius -
*   innerRadius) / 2` each.
* @property {number} [segments=32] Column count, swept left to right.
* @property {number} [innerSegments=16] Row count between the bottom and top
*   boundary at each column.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a
*   function using `uRatio`/`vRatio` (the swept parametrization) to follow the
*   arcs instead.
*/
/**
* Archimedes' salinon: a "salt cellar" bounded by four semicircles - one
* full-width on the bottom, a smaller one opposite it on top, and two "ear"
* semicircles filling the remaining top thirds. Area: `pi/4 * (radius +
* innerRadius) ** 2` (Archimedes' theorem).
*
* @param {SalinonOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Salinon]{@link https://mathworld.wolfram.com/Salinon.html}
*/
function salinon({ radius = .5, innerRadius = radius * .25, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const R = radius;
	const r = innerRadius;
	const earRadius = (R - r) / 2;
	const earCenter = (R + r) / 2;
	return computeSweptArc({
		segments,
		innerSegments,
		uMin: -R,
		uMax: R,
		mapping,
		center: [0, (r - R) / 2],
		sx: R,
		sy: (R + r) / 2,
		bounds: (x) => {
			return [-Math.sqrt(Math.max(R * R - x * x, 0)), Math.abs(x) <= r ? Math.sqrt(Math.max(r * r - x * x, 0)) : -Math.sqrt(Math.max(earRadius * earRadius - (x - Math.sign(x) * earCenter) ** 2, 0))];
		},
		point: (x, y) => [x, y]
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TriquetraOptions
* @property {number} [radius=0.5] Radius of each of the 3 circles, and the side
*   length of the equilateral triangle formed by their centers - a canonical
*   Triquetra has no separate spacing parameter.
* @property {number} [segments=32] Column count, swept angularly per wedge, for
*   both the core and the petals.
* @property {number} [innerSegments=16] Row count between the two boundaries at
*   each column.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a
*   function using `uRatio`/`vRatio` (the swept parametrization) to follow the
*   arcs instead.
*/
/**
* Triquetra: three mutually intersecting vesica piscis lenses, centered at the
* vertices of an equilateral triangle of side `radius`.
*
* @param {TriquetraOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Triquetra]{@link https://mathworld.wolfram.com/Triquetra.html}
*/
function triquetra({ radius = .5, segments = 32, innerSegments = 16, mapping = rectangular } = {}) {
	const r = radius;
	const R = radius / Math.sqrt(3);
	const angleC0 = 7 * Math.PI / 6;
	const angleC1 = 11 * Math.PI / 6;
	const angleC2 = Math.PI / 2;
	const vertices = [
		angleC0,
		angleC1,
		angleC2
	].map((angle) => [R * Math.cos(angle), R * Math.sin(angle)]);
	const offsets = [
		0,
		TAU / 3,
		2 * TAU / 3
	];
	const ray = (alpha, theta) => {
		const d = theta - alpha;
		return R * Math.cos(d) + Math.sqrt(Math.max(r * r - R * R * Math.sin(d) ** 2, 0));
	};
	const seam = (theta) => ray(angleC2, theta);
	const outer = (theta) => Math.min(ray(angleC0, theta), ray(angleC1, theta));
	const uMin = angleC0;
	const uMax = angleC1;
	const cols = segments + 1;
	const center = [0, 0];
	const sx = r;
	const sy = 2 * R;
	const petal = (k) => {
		const offset = offsets[k];
		const start = vertices[k];
		const end = vertices[(k + 1) % 3];
		return computeSweptArc({
			segments,
			innerSegments,
			uMin,
			uMax,
			mapping,
			center,
			sx,
			sy,
			flip: true,
			bounds: (theta) => [seam(theta), outer(theta)],
			point: (theta, v) => theta === uMin ? start : theta === uMax ? end : [v * Math.cos(theta + offset), v * Math.sin(theta + offset)]
		});
	};
	const columnAngle = (i) => computeChebyshevColumn(i, segments, uMin, uMax);
	const coreColumn = (k, i, j) => {
		const theta = columnAngle(i);
		const isEnd = i === 0 || i === segments;
		const v = (isEnd ? R : seam(theta)) * (j / innerSegments);
		if (isEnd && j === innerSegments) return [
			theta,
			v,
			vertices[(i === 0 ? k : k + 1) % 3]
		];
		const angle = theta + offsets[k];
		return [
			theta,
			v,
			[v * Math.cos(angle), v * Math.sin(angle)]
		];
	};
	const writeCoreCells = (cells, cellIndex, ringOffset, isFirstRing) => {
		if (isFirstRing) {
			for (let i = 0; i < segments; i++, cellIndex += 3) cells.set([
				0,
				ringOffset + i,
				ringOffset + i + 1
			], cellIndex);
			return cellIndex;
		}
		const prevRingOffset = ringOffset - cols;
		for (let i = 0; i < segments; i++, cellIndex += 6) {
			const a = prevRingOffset + i;
			const b = ringOffset + i;
			const c = ringOffset + i + 1;
			const d = prevRingOffset + i + 1;
			cells.set([
				a,
				b,
				d,
				b,
				c,
				d
			], cellIndex);
		}
		return cellIndex;
	};
	const core = (k) => {
		const size = 1 + innerSegments * cols;
		const positions = new Float32Array(size * 3);
		const normals = new Float32Array(size * 3);
		const uvs = new Float32Array(size * 2);
		const cells = new (getCellsTypedArray(size))(segments * 3 + (innerSegments - 1) * segments * 6);
		normals[2] = 1;
		mapping({
			uvs,
			index: 0,
			x: 0,
			y: 0,
			radius: 1,
			sx,
			sy,
			u: uMin,
			v: 0,
			uRatio: 0,
			vRatio: 0
		});
		let vertexIndex = 1;
		let cellIndex = 0;
		for (let j = 1; j <= innerSegments; j++) {
			const ringOffset = vertexIndex;
			for (let i = 0; i <= segments; i++, vertexIndex++) {
				const [theta, v, [x, y]] = coreColumn(k, i, j);
				positions[vertexIndex * 3] = x;
				positions[vertexIndex * 3 + 1] = y;
				normals[vertexIndex * 3 + 2] = 1;
				mapping({
					uvs,
					index: vertexIndex * 2,
					x,
					y,
					radius: 1,
					sx,
					sy,
					u: theta,
					v,
					uRatio: i / segments,
					vRatio: j / innerSegments
				});
			}
			cellIndex = writeCoreCells(cells, cellIndex, ringOffset, j === 1);
		}
		return {
			positions,
			normals,
			uvs,
			cells
		};
	};
	return concatGeometries([
		core(0),
		core(1),
		core(2),
		petal(0),
		petal(1),
		petal(2)
	]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} YinYangOptions
* @property {number} [radius=0.5] Radius of the enclosing circle.
* @property {number} [dotRadius=radius/6] Radius of the hole cut at each
*   returned half's own dot position. `0` omits the hole(s).
* @property {"yin" | "yang" | "yin-yang"} [part="yin-yang"] `"yin"`/`"yang"`
*   return one S-curve-divided half (bounded by half the outer circle and the
*   S-curve), with its dot hole centered at the other half's bulge (`(0,
*   -radius/2)` for yang, `(0, radius/2)` for yin). `"yin-yang"` merges both
*   into one mesh; without per-face material/color the S-curve seam is then
*   invisible (indistinguishable from a disc with two holes).
* @property {number} [segments=32] Row count for the outer circle/S-curve
*   boundary, swept bottom to top.
* @property {number} [holeSegments=16] Row count for a dot hole's own boundary,
*   independent of the outer boundary's `segments`.
* @property {number} [innerSegments=16] Column count spanning each side of a
*   dot hole (or the whole half, where the hole doesn't reach) at each row.
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap; pass a
*   function using `uRatio`/`vRatio` (the swept parametrization) to follow the
*   arcs instead.
*/
/**
* Yin-Yang (taijitu): a circle divided by an S-shaped seam of two opposing
* semicircles, each side holed by a dot at the other's bulge.
*
* @param {YinYangOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Yin-Yang]{@link https://mathworld.wolfram.com/Yin-Yang.html}
*/
function yinYang({ radius = .5, dotRadius = radius / 6, part = "yin-yang", segments = 32, holeSegments = 16, innerSegments = 16, mapping = rectangular } = {}) {
	const R = radius;
	const curve = (y) => y >= 0 ? Math.sqrt(Math.max((R / 2) ** 2 - (y - R / 2) ** 2, 0)) : -Math.sqrt(Math.max((R / 2) ** 2 - (y + R / 2) ** 2, 0));
	const diskEdge = (y) => Math.sqrt(Math.max(R * R - y * y, 0));
	const yangDotBottom = -R / 2 - dotRadius;
	const yangDotTop = -R / 2 + dotRadius;
	const yinDotBottom = R / 2 - dotRadius;
	const yinDotTop = R / 2 + dotRadius;
	const schedule = dotRadius <= 0 ? [[
		-R,
		R,
		segments
	]] : [
		[
			-R,
			yangDotBottom,
			segments
		],
		[
			yangDotBottom,
			yangDotTop,
			holeSegments
		],
		[
			yangDotTop,
			yinDotBottom,
			segments
		],
		[
			yinDotBottom,
			yinDotTop,
			holeSegments
		],
		[
			yinDotTop,
			R,
			segments
		]
	];
	function buildHalf(isYin, center, sx, sy) {
		const outerMin = (y) => isYin ? -diskEdge(y) : curve(y);
		const outerMax = (y) => isYin ? curve(y) : diskEdge(y);
		const dotCenterY = (isYin ? R : -R) / 2;
		const dotBottom = isYin ? yinDotBottom : yangDotBottom;
		const dotTop = isYin ? yinDotTop : yangDotTop;
		const holeHalfWidth = (y) => y <= dotBottom || y >= dotTop ? 0 : Math.sqrt(Math.max(dotRadius * dotRadius - (y - dotCenterY) ** 2, 0));
		const leftBounds = (y) => {
			const lo = outerMin(y);
			const hi = outerMax(y);
			return [lo, clamp(-holeHalfWidth(y), lo, hi)];
		};
		const rightBounds = (y) => {
			const lo = outerMin(y);
			const hi = outerMax(y);
			return [clamp(holeHalfWidth(y), lo, hi), hi];
		};
		const sweep = (uMin, uMax, rows, bounds) => computeSweptArc({
			segments: rows,
			innerSegments,
			uMin,
			uMax,
			mapping,
			center,
			sx,
			sy,
			bounds,
			point: (y, x) => [x, y],
			flip: true
		});
		return concatGeometries([...schedule.map(([uMin, uMax, rows]) => sweep(uMin, uMax, rows, leftBounds)), ...schedule.map(([uMin, uMax, rows]) => sweep(uMin, uMax, rows, rightBounds))]);
	}
	if (part !== "yin-yang") {
		const isYin = part === "yin";
		return buildHalf(isYin, [(isYin ? -R : R) / 4, 0], 3 * R / 4, R);
	}
	const wholeCenter = [0, 0];
	return concatGeometries([buildHalf(false, wholeCenter, R, R), buildHalf(true, wholeCenter, R, R)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} EllipseOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [innerSegments=16]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {number} [innerRadius=0] Like `annulus`'s: a hole radius the fill
*   stops at instead of reaching the center. `0` (default): no hole, fill
*   reaches the center (subject to `mergeCentroid`).
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.elliptical]
* @property {EllipseEquationFn} [equation] Maps each (rx, ry, cosTheta,
*   sinTheta) sample to its [x, y] position, defaulting to an ellipse's arc.
*/
/**
* @callback EllipseEquationFn
* @param {object} sample
* @param {number} sample.rx Scaled ring radius along x
* @param {number} sample.ry Scaled ring radius along y
* @param {number} sample.cosTheta
* @param {number} sample.sinTheta
* @param {number} sample.s Radius ratio (0..1, innerRadius to radius)
* @param {number} sample.t Angle
* @returns {[x, y]}
*/
/**
* An ellipse (or circle when `sx = sy`).
*
* @param {EllipseOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function ellipse({ sx = 1, sy = .5, radius = .5, segments = 32, innerSegments = 16, theta = TAU, thetaOffset = 0, innerRadius = 0, mergeCentroid = innerRadius === 0, mapping = elliptical, equation = ({ rx, ry, cosTheta, sinTheta }) => [rx * cosTheta, ry * sinTheta] } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		theta,
		thetaOffset,
		innerRadius,
		mergeCentroid,
		mapping,
		equation
	});
}
/**
* @typedef {object} EllipsePathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `ellipse`: sx/sy independently scale the two axes, same as
* `circlePath` with sx = sy = 1.
*
* @param {EllipsePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath} `segments`
*   positions (`+ 1` for a partial `theta`) and a single path cell of that many
*   indices (`+ 1`, repeating index `0`, when `closed`)
*/
function ellipsePath({ sx = 1, sy = .5, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => [sx * radius * Math.cos(t), sy * radius * Math.sin(t)]
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DiscOptions
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* A disc: `ellipse` with sx = sy = 1.
*
* @param {DiscOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function disc({ radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = concentric } = {}) {
	return ellipse({
		sx: 1,
		sy: 1,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping
	});
}
/**
* @typedef {object} CirclePathOptions
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `disc`: `ellipsePath` with sx = sy = 1.
*
* @param {CirclePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath} `segments`
*   positions (`+ 1` for a partial `theta`) and a single path cell of that many
*   indices (`+ 1`, repeating index `0`, when `closed`)
*/
function circlePath({ radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return ellipsePath({
		sx: 1,
		sy: 1,
		radius,
		segments,
		theta,
		thetaOffset,
		closed
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
function computeSuperellipseEdge(rx, ry, cosTheta, sinTheta, m, n) {
	return [rx * Math.abs(cosTheta) ** (2 / m) * Math.sign(cosTheta), ry * Math.abs(sinTheta) ** (2 / n) * Math.sign(sinTheta)];
}
/**
* @typedef {object} SuperellipseOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.lamé]
* @property {number} [m=2]
* @property {number} [n=m]
*/
/**
* Lamé curve See elliptical-mapping example for a few special cases
*
* @param {SuperellipseOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Superellipse]{@link https://mathworld.wolfram.com/Superellipse.html}
* @see [Wikipedia – Superellipse]{@link https://en.wikipedia.org/wiki/Superellipse}
*/
function superellipse({ sx = 1, sy = .5, radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = lamé, m = 2, n = m } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, ry, cosTheta, sinTheta }) => computeSuperellipseEdge(rx, ry, cosTheta, sinTheta, m, n)
	});
}
/**
* @typedef {object} SuperellipsePathOptions
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {number} [m=2]
* @property {number} [n=m]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `superellipse`: the same Lamé curve, sampled directly with no
* radial fill.
*
* @param {SuperellipsePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function superellipsePath({ sx = 1, sy = .5, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, m = 2, n = m, closed = false } = {}) {
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computeSuperellipseEdge(sx * radius, sy * radius, Math.cos(t), Math.sin(t), m, n)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
function computeSquircleEdge(rx, ry, cosTheta, sinTheta, t, squareness) {
	switch (t) {
		case 0:
		case TAU: return [rx, 0];
		case HALF_PI: return [0, ry];
		case Math.PI: return [-rx, 0];
		case TAU - HALF_PI: return [0, -ry];
		default: {
			const sqrt = Math.sqrt(1 - Math.sqrt(1 - squareness ** 2 * Math.sin(2 * t) ** 2));
			return [rx * Math.sign(cosTheta) / (squareness * SQRT2 * Math.abs(sinTheta)) * sqrt, ry * Math.sign(sinTheta) / (squareness * SQRT2 * Math.abs(cosTheta)) * sqrt];
		}
	}
}
/**
* @typedef {object} SquircleOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [segments=128]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.fgSquircular]
* @property {number} [squareness=0.95] Squareness (0 < s <= 1)
*/
/**
* Fernández-Guasti squircle
*
* @param {SquircleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Squircular Calculations – Chamberlain Fong]{@link https://arxiv.org/vc/arxiv/papers/1604/1604.02174v1.pdf}
*/
function squircle({ sx = 1, sy = 1, radius = .5, segments = 128, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = fgSquircular, squareness = .95 } = {}) {
	return computePolarGeometry({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, ry, cosTheta, sinTheta, t }) => computeSquircleEdge(rx, ry, cosTheta, sinTheta, t, squareness)
	});
}
/**
* @typedef {object} SquirclePathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [segments=128]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {number} [squareness=0.95]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `squircle`: the same Fernández-Guasti curve, sampled directly
* with no radial fill.
*
* @param {SquirclePathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function squirclePath({ sx = 1, sy = 1, radius = .5, segments = 128, theta = TAU, thetaOffset = 0, squareness = .95, closed = false } = {}) {
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computeSquircleEdge(sx * radius, sy * radius, Math.cos(t), Math.sin(t), t, squareness)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AstroidOptions
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.lamé]
*/
/**
* Hypocycloid with 4 cusps: a superellipse special case (m = n = 2/3).
*
* @param {AstroidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Astroid]{@link https://mathworld.wolfram.com/Astroid.html}
*/
function astroid({ radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = lamé } = {}) {
	return superellipse({
		sx: 1,
		sy: 1,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		m: 2 / 3,
		n: 2 / 3
	});
}
/**
* @typedef {object} AstroidPathOptions
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `astroid`: `superellipsePath` with `m = n = 2 / 3`.
*
* @param {AstroidPathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function astroidPath({ radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return superellipsePath({
		sx: 1,
		sy: 1,
		radius,
		segments,
		theta,
		thetaOffset,
		closed,
		m: 2 / 3,
		n: 2 / 3
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AnnulusOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [innerSegments=16]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {number} [innerRadius=radius * 0.5]
* @property {import("../../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* An annulus (ring): the region between two concentric circles.
*
* @param {AnnulusOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function annulus({ sx = 1, sy = 1, radius = .5, segments = 32, innerSegments = 16, theta = TAU, thetaOffset = 0, innerRadius = radius * .5, mapping = concentric } = {}) {
	return ellipse({
		sx,
		sy,
		radius,
		segments,
		innerSegments,
		theta,
		thetaOffset,
		innerRadius,
		mergeCentroid: false,
		mapping
	});
}
/**
* @typedef {object} AnnulusPathOptions
* @property {number} [sx=1]
* @property {number} [sy=1]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {number} [innerRadius=radius * 0.5]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `annulus`: unlike every other path in this module, an
* annulus's boundary is 2 disjoint loops, not one - 2 path cells (outer loop
* first, inner second).
*
* @param {AnnulusPathOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPath}
*/
function annulusPath({ sx = 1, sy = 1, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, innerRadius = radius * .5, closed = false } = {}) {
	const outer = ellipsePath({
		sx,
		sy,
		radius,
		segments,
		theta,
		thetaOffset,
		closed
	});
	const inner = ellipsePath({
		sx,
		sy,
		radius: innerRadius,
		segments,
		theta,
		thetaOffset,
		closed
	});
	const outerCount = outer.positions.length / 3;
	const positions = new Float32Array(outer.positions.length + inner.positions.length);
	positions.set(outer.positions, 0);
	positions.set(inner.positions, outer.positions.length);
	const innerCell = inner.cells[0].map((i) => i + outerCount);
	return {
		positions,
		cells: [outer.cells[0], innerCell]
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ReuleauxOptions
* @property {number} [sides=3]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [innerSegments=16]
* @property {number} [innerRadius=0]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
function computeReuleauxEdge(sides, cosSides, PIoverSides, thetaOffset, cosOffset, sinOffset, t) {
	const s = t - thetaOffset;
	const phi = PIoverSides * (2 * Math.floor(sides * s / TAU) + 1);
	const px = cosSides * Math.cos(.5 * (s + phi)) - Math.cos(phi);
	const py = cosSides * Math.sin(.5 * (s + phi)) - Math.sin(phi);
	return [px * cosOffset - py * sinOffset, px * sinOffset + py * cosOffset];
}
/**
* A Reuleaux polygon: a constant-width curve built from `sides` circular arcs,
* each centered on the opposite vertex.
*
* @param {ReuleauxOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
* @see [Parametric equations for regular and Reuleaux polygons]{@link https://tpfto.wordpress.com/2011/09/15/parametric-equations-for-regular-and-reuleaux-polygons/}
*/
function reuleaux({ sides = 3, radius = .5, segments = 32, innerSegments = 16, innerRadius = 0, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = concentric } = {}) {
	const cosSides = 2 * Math.cos(Math.PI / (2 * sides));
	const PIoverSides = Math.PI / sides;
	const cosOffset = Math.cos(thetaOffset);
	const sinOffset = Math.sin(thetaOffset);
	return computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments,
		innerSegments,
		innerRadius,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ rx, t }) => {
			const [x, y] = computeReuleauxEdge(sides, cosSides, PIoverSides, thetaOffset, cosOffset, sinOffset, t);
			return [rx * x, rx * y];
		}
	});
}
/**
* @typedef {object} ReuleauxPathOptions
* @property {number} [sides=3]
* @property {number} [radius=0.5]
* @property {number} [segments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `reuleaux`: same parametric boundary, sampled directly with
* no radial fill.
*
* @param {ReuleauxPathOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplexPath}
*/
function reuleauxPath({ sides = 3, radius = .5, segments = 32, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	const cosSides = 2 * Math.cos(Math.PI / (2 * sides));
	const PIoverSides = Math.PI / sides;
	const cosOffset = Math.cos(thetaOffset);
	const sinOffset = Math.sin(thetaOffset);
	return computePolarPathGeometry({
		segments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => {
			const [x, y] = computeReuleauxEdge(sides, cosSides, PIoverSides, thetaOffset, cosOffset, sinOffset, t);
			return [radius * x, radius * y];
		}
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
function computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t) {
	const cornerCount = points * 2;
	const local = (t - thetaOffset) / theta * cornerCount;
	const corner = Math.floor(local);
	const frac = local - corner;
	const cornerPoint = (k) => {
		const r = k % 2 === 0 ? radius : notchRadius;
		const angle = thetaOffset + k / cornerCount * theta;
		return [r * Math.cos(angle), r * Math.sin(angle)];
	};
	const [x0, y0] = cornerPoint(corner);
	const [x1, y1] = cornerPoint(corner + 1);
	return [x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac];
}
/**
* @typedef {object} StarOptions
* @property {number} [points=5]
* @property {number} [density=2] Schläfli "skip" factor: must be `< points / 2`
*   (and coprime with `points` for a genuine, non-compound star polygon) or the
*   auto-computed `notchRadius` degenerates.
* @property {number} [radius=0.5]
* @property {number} [notchRadius=radius*computeStarRatio(points,density)]
*   Radius of the points/tips' flanking concave vertices, ie. how deep the star's
*   notches cut in.
* @property {number} [innerRadius=0] Like `annulus`'s: a hole radius the fill
*   stops at instead of reaching the center. `0` (default): no hole, fill
*   reaches the center (subject to `mergeCentroid`).
* @property {boolean} [circularHole=false] Only relevant when `innerRadius` is
*   non-zero: `false` (default) traces the hole as a smaller, self-similar copy
*   of the outer star; `true` traces it as a plain circle.
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../mappings.js").MappingFn} [mapping=mappings.concentric]
*/
/**
* Regular {points/density} star polygon: `points` outer tips alternating with
* `points` inner notches. `notchRadius` defaults to the tips' own
* `{points/density}` ratio, so e.g. the default `star()` traces a regular
* pentagram.
*
* @param {StarOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Star Polygon]{@link https://mathworld.wolfram.com/StarPolygon.html}
*/
function star({ points = 5, density = 2, radius = .5, notchRadius = radius * computeStarRatio(points, density), innerRadius = 0, circularHole = false, edgeSegments = 1, innerSegments = 16, theta = TAU, thetaOffset = 0, mergeCentroid = innerRadius === 0, mapping = concentric } = {}) {
	const holeScale = radius === 0 ? 0 : innerRadius / radius;
	return computePolarGeometry({
		sx: 1,
		sy: 1,
		radius,
		segments: points * 2 * edgeSegments,
		innerSegments,
		theta,
		thetaOffset,
		mergeCentroid,
		mapping,
		equation: ({ cosTheta, sinTheta, s, t }) => {
			const [x, y] = computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t);
			const [hx, hy] = circularHole ? [innerRadius * cosTheta, innerRadius * sinTheta] : [x * holeScale, y * holeScale];
			return [hx + (x - hx) * s, hy + (y - hy) * s];
		}
	});
}
/**
* @typedef {object} StarPathOptions
* @property {number} [points=5]
* @property {number} [density=2]
* @property {number} [radius=0.5]
* @property {number} [notchRadius=radius*computeStarRatio(points,density)]
* @property {number} [edgeSegments=1]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `star`: `points` outer tips alternating with `points` inner
* notches, connected by straight edges.
*
* @param {StarPathOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplexPath} `edgeSegments *
*   points * 2` positions (`+ 1` for a partial `theta`) and a single path cell
*   of that many indices (`+ 1`, repeating index `0`, when `closed`)
*/
function starPath({ points = 5, density = 2, radius = .5, notchRadius = radius * computeStarRatio(points, density), edgeSegments = 1, theta = TAU, thetaOffset = 0, closed = false } = {}) {
	return computePolarPathGeometry({
		segments: points * 2 * edgeSegments,
		theta,
		thetaOffset,
		closed,
		equation: (t) => computeStarEdge(points, radius, notchRadius, theta, thetaOffset, t)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
const CORNER_COUNT = 12;
function computeCrossOutline(r, w) {
	return [
		[r, -w],
		[r, w],
		[w, w],
		[w, r],
		[-w, r],
		[-w, w],
		[-r, w],
		[-r, -w],
		[-w, -w],
		[-w, -r],
		[w, -r],
		[w, -w]
	];
}
/**
* @typedef {object} CrossOptions
* @property {number} [radius=0.5] Distance from the center to each arm's tip.
* @property {number} [armWidth=radius/3] Half-width of each arm. Defaults to a
*   third of `radius`, the classic Greek cross made of 5 equal squares.
* @property {number} [edgeSegments=1]
* @property {number} [innerSegments=16] Row count between the center and the
*   outline at each column.
* @property {number} [innerRadius=0] Like `star`'s: a hole radius the fill
*   stops at instead of reaching the center, traced as a smaller, self- similar
*   copy of the outer cross. `0` (default): no hole, fill reaches the center.
* @property {boolean} [mergeCentroid="innerRadius === 0"]
* @property {import("../mappings.js").MappingFn} [mapping=mappings.rectangular]
*   Uv mapping function. Defaults to a flat, bounding-box-relative unwrap.
*/
/**
* Greek cross: a plus-sign shaped non-regular dodecagon - 4 equal arms
* extending from a square center, filled with a fan from the center.
*
* @param {CrossOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Greek Cross]{@link https://mathworld.wolfram.com/GreekCross.html}
*/
function cross({ radius = .5, armWidth = radius / 3, edgeSegments = 1, innerSegments = 16, innerRadius = 0, mergeCentroid = innerRadius === 0, mapping = rectangular } = {}) {
	const r = radius;
	const outline = computeCrossOutline(r, armWidth);
	return computePolarGeometry({
		sx: 1,
		sy: 1,
		radius: r,
		segments: CORNER_COUNT * edgeSegments,
		innerSegments,
		innerRadius,
		mergeCentroid,
		mapping,
		equation: ({ rx, t }) => {
			const scale = rx / r;
			const [x, y] = computeOutlineEdge(outline, 0, t);
			return [scale * x, scale * y];
		}
	});
}
/**
* @typedef {object} CrossPathOptions
* @property {number} [radius=0.5]
* @property {number} [armWidth=radius/3]
* @property {number} [edgeSegments=1]
* @property {boolean} [closed=false]
*/
/**
* Outline dual of `cross`: the same 12-corner outline, walked directly instead
* of fanned from the center.
*
* @param {CrossPathOptions} [options={}]
* @returns {import("../../types.js").SimplicialComplexPath}
*/
function crossPath({ radius = .5, armWidth = radius / 3, edgeSegments = 1, closed = false } = {}) {
	const outline = computeCrossOutline(radius, armWidth);
	return computePolarPathGeometry({
		segments: CORNER_COUNT * edgeSegments,
		theta: TAU,
		thetaOffset: 0,
		closed,
		equation: (t) => computeOutlineEdge(outline, 0, t)
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} CubeFacesOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
*/
/**
* Cuboid faces: 8 positions and 6 quad faces (indices into positions). Cells
* order: +x, -x, +y, -y, +z, -z.
*
* @param {CubeFacesOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPolygon}
*/
function cubeFaces({ sx = 1, sy = sx, sz = sx } = {}) {
	const x = sx / 2;
	const y = sy / 2;
	const z = sz / 2;
	return {
		positions: Float32Array.of(-x, y, z, -x, -y, z, x, -y, z, x, y, z, x, y, -z, x, -y, -z, -x, -y, -z, -x, y, -z),
		cells: [
			[
				3,
				2,
				5,
				4
			],
			[
				7,
				6,
				1,
				0
			],
			[
				7,
				0,
				3,
				4
			],
			[
				1,
				6,
				5,
				2
			],
			[
				0,
				1,
				2,
				3
			],
			[
				4,
				5,
				6,
				7
			]
		]
	};
}
/**
* @typedef {object} BoxOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
*/
/**
* A cuboid, as raw quad faces rather than a triangulated mesh - see
* `cubeFaces`.
*
* @param {BoxOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplexPolygon}
*/
function box({ sx = 1, sy = sx, sz = sx } = {}) {
	return cubeFaces({
		sx,
		sy,
		sz
	});
}
/**
* @typedef {object} CubeOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
* @property {number} [nx=1]
* @property {number} [ny=nx]
* @property {number} [nz=nx]
*/
/**
* A cuboid (rectangular box).
*
* @param {CubeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function cube({ sx = 1, sy = sx, sz = sx, nx = 1, ny = nx, nz = nx } = {}) {
	const size = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))((nx * ny * 2 + nx * nz * 2 + nz * ny * 2) * 6)
	};
	const halfSX = sx * .5;
	const halfSY = sy * .5;
	const halfSZ = sz * .5;
	const indices = {
		vertex: 0,
		cell: 0
	};
	computePlane(geometry, indices, sz, sy, nz, ny, "x", halfSX);
	computePlane(geometry, indices, sz, sy, nz, ny, "-x", -halfSX);
	computePlane(geometry, indices, sx, sz, nx, nz, "y", halfSY);
	computePlane(geometry, indices, sx, sz, nx, nz, "-y", -halfSY);
	computePlane(geometry, indices, sx, sy, nx, ny, "z", halfSZ);
	computePlane(geometry, indices, sx, sy, nx, ny, "-z", -halfSZ);
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
const DIRECTIONS = [
	"x",
	"-x",
	"y",
	"-y",
	"z",
	"-z"
];
/**
* Emit one box's 6 faces (`cube`'s own per-face computePlane calls, generalized
* to an off-center box). Each face's uvScale/uvOffset is remapped so it lands
* exactly where it'd fall within a _single_ computePlane call spanning the
* whole hollow cube's face (fullSize) - ie. every piece's outer face tiles into
* one continuous 0-1 UV square per direction, like a plain `cube`'s, instead of
* each small piece getting its own independent 0-1 range. This applies
* uniformly to every face, not just the ones that end up on the outer boundary:
* interior/tunnel-facing faces get a well-defined, harmless UV this way too,
* since they're never visible.
*
* @private
*/
function computeBox(geometry, indices, dims, center, fullSize) {
	for (const direction of DIRECTIONS) {
		const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];
		const su = dims[u];
		const sv = dims[v];
		const pw = (direction[0] === "-" ? -.5 : .5) * dims[w];
		const uvScale = [su / fullSize[u], sv / fullSize[v]];
		const uvOffset = [(1 - uvScale[0]) / 2 + center[u] * flipU / fullSize[u], (1 - uvScale[1]) / 2 - center[v] * flipV / fullSize[v]];
		computePlane(geometry, indices, su, sv, 1, 1, direction, pw, uvScale, uvOffset, center);
	}
}
/**
* @typedef {object} HollowCubeOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
* @property {number} [thickness=sx*0.2] Uniform beam/wall size (must stay <
*   half of the smallest of sx/sy/sz for positive-length beams)
*/
/**
* A cube with a square hole through the center of each face, like a single cell
* of a Menger sponge: the 8 corners stay solid (t x t x t blocks) and the 12
* edges become beams of the same cross-section running between them.
*
* @param {HollowCubeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function hollowCube({ sx = 1, sy = sx, sz = sx, thickness = sx * .2 } = {}) {
	const fullSize = [
		sx,
		sy,
		sz
	];
	const half = [
		sx * .5,
		sy * .5,
		sz * .5
	];
	const t = thickness;
	const boxes = [];
	for (const su of [-1, 1]) for (const sv of [-1, 1]) for (const sw of [-1, 1]) boxes.push({
		dims: [
			t,
			t,
			t
		],
		center: [
			su * (half[0] - t / 2),
			sv * (half[1] - t / 2),
			sw * (half[2] - t / 2)
		]
	});
	for (let axis = 0; axis < 3; axis++) {
		const [u, v] = [
			0,
			1,
			2
		].filter((i) => i !== axis);
		for (const su of [-1, 1]) for (const sv of [-1, 1]) {
			const dims = [
				t,
				t,
				t
			];
			dims[axis] = fullSize[axis] - 2 * t;
			const center = [
				0,
				0,
				0
			];
			center[u] = su * (half[u] - t / 2);
			center[v] = sv * (half[v] - t / 2);
			boxes.push({
				dims,
				center
			});
		}
	}
	const size = boxes.length * 6 * 4;
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))(boxes.length * 6 * 2 * 3)
	};
	const indices = {
		vertex: 0,
		cell: 0
	};
	for (const { dims, center } of boxes) computeBox(geometry, indices, dims, center, fullSize);
	return geometry;
}

/**
* @module utils
* @ignore
*/
/**
* @callback DistributionFn
* @param {number} t
* @returns {number}
*/
/**
* Uniform spacing: v maps to itself. The default `vDistribution` for every
* `computeRevolutionGeometry`-based solid.
*
* @type {DistributionFn}
*/
function linear(t) {
	return t;
}
/**
* Chebyshev-node-like spacing: clusters rows toward both ends of the meridian
* sweep (t = 0 and t = 1), sparser through the middle - the classic fix for a
* pole/cusp at each end whose radius shrinks faster than the sweep parameter
* grows (eg. `ellipsoid`'s poles, `apple`/`lemon`'s cusps).
*
* @type {DistributionFn}
*/
function chebyshev(t) {
	return (1 - Math.cos(Math.PI * t)) / 2;
}
/**
* Smoothstep (Hermite ease-in-out) spacing: same both-ends clustering as
* `chebyshev`, as a cheap polynomial instead of a cosine - the standard
* "smoothstep" curve used throughout computer graphics.
*
* @type {DistributionFn}
*/
function smoothstep(t) {
	return t * t * (3 - 2 * t);
}
/**
* Power/ease-out spacing: clusters rows toward t = 1 only, leaving t = 0 as
* sparse as `linear` - unlike `chebyshev`/`smoothstep`'s symmetric, both-ends
* clustering. `exponent = 2` exactly cancels a sqrt radius law (eg.
* `paraboloid`'s apex, where r = radius·sqrt(1 - v)); `exponent = 1` is
* `linear`.
*
* @param {number} [exponent=2]
* @returns {function(number): number}
*/
function power(exponent = 2) {
	return (t) => 1 - (1 - t) ** exponent;
}

/**
* @module utils
* @ignore
*/
/** @private */
const TMP = [
	0,
	0,
	0
];
/**
* Fan-triangulated flat disk cap shared by revolution solids (cylinder/cone,
* torus): capSegments concentric rings sampled at ringSegments + 1 angular
* positions. The innermost ring collapses to a point and fans with a single
* triangle per quad instead of two, skipping the degenerate one.
*
* The disk is defined in the caller's own local 2D coordinates: x along the
* angular sample's cosine, y along its sine, both scaled by capRadius *
* radiusRatio, then independently by sx/sy for an elliptical cap. `point(x, y)`
* embeds those into the solid's 3D space; `normal` is that embedding's flat
* outward normal. Both are the caller's responsibility, since the two solids
* embed their cap plane differently (cylinder: axis-aligned; torus: offset and
* rotated by its phi angle). A flat disk's normal only depends on the plane it
* sits in, not its in-plane shape - so sx/sy don't affect `normal`, only the
* position/uv scale.
*
* `flip` (1 or -1) selects which of a cap pair (base/apex, start/end) this is,
* driving winding order. `normal` must already have flip folded in, so it
* points outward, ie. away from the solid.
*
* @private
*/
function computeCap(geometry, indices, { ringSegments, capSegments, capRadius, sx = 1, sy = 1, flip, angleAt, point, normal, mapping }) {
	const { positions, normals, uvs, cells } = geometry;
	const ringVertexOffset = indices.vertex;
	const writeVertex = (radiusRatio, cos, sin, t, thetaRatio) => {
		const x = capRadius * sx * radiusRatio * cos;
		const y = capRadius * sy * radiusRatio * sin;
		const [px, py, pz] = point(x, y);
		const i = indices.vertex;
		positions[i * 3] = px;
		positions[i * 3 + 1] = py;
		positions[i * 3 + 2] = pz;
		normals[i * 3] = normal[0];
		normals[i * 3 + 1] = normal[1];
		normals[i * 3 + 2] = normal[2];
		mapping({
			uvs,
			index: i * 2,
			u: radiusRatio * cos,
			v: radiusRatio * sin,
			radius: capRadius,
			sx,
			sy,
			radiusRatio,
			thetaRatio,
			t,
			x,
			y
		});
		indices.vertex++;
	};
	for (let r = 0; r < capSegments; r++) for (let j = 0; j <= ringSegments; j++) {
		const { cos, sin, t } = angleAt(j);
		const thetaRatio = j / ringSegments;
		writeVertex(r / capSegments, cos, sin, t, thetaRatio);
		writeVertex((r + 1) / capSegments, cos, sin, t, thetaRatio);
	}
	const [second, third] = flip === 1 ? [1, 2] : [2, 1];
	const writeTriangle = (a, b, c) => {
		cells[indices.cell] = a;
		cells[indices.cell + second] = b;
		cells[indices.cell + third] = c;
		indices.cell += 3;
	};
	const m = ringSegments + 1;
	for (let r = 0; r < capSegments; r++) for (let j = 0; j < ringSegments; j++) {
		const n = ringVertexOffset + r * m * 2 + j * 2;
		const a = n;
		const b = n + 1;
		const c = n + 2;
		const d = n + 3;
		if (r > 0) writeTriangle(a, c, d);
		writeTriangle(a, d, b);
	}
}
/**
* Triangulate one quad of a (rows+1) x (cols+1) vertex grid already written in
* row-major order (cols vertices per row), for the vertex just written at
* `indices.vertex` - the quad's own corner d. a/b/c are the 3 already-written
* corners, at vertexIndex - cols - 1/- cols/- 1. Called whenever a full quad is
* available (row > 0 && col > 0).
*
* Splits along the b-c diagonal, matching `computePlane`/
* `computePolarGeometry`/`computeRevolutionGeometry`, so displacement in a
* vertex shader creases consistently across the library. flip (1 or -1) picks
* the winding, same convention as `computeCap`. Which value maps to "outward"
* depends on how the caller's row/col axes relate to its own surface normal -
* callers work that out for themselves (see torus.js/hollow-sphere.js).
*
* @private
*/
function computeGridQuad(cells, indices, cols, flip) {
	const vertexIndex = indices.vertex;
	const a = vertexIndex - cols - 1;
	const b = vertexIndex - cols;
	const c = vertexIndex - 1;
	const d = vertexIndex;
	if (flip === 1) {
		cells[indices.cell] = a;
		cells[indices.cell + 1] = c;
		cells[indices.cell + 2] = b;
		cells[indices.cell + 3] = b;
		cells[indices.cell + 4] = c;
		cells[indices.cell + 5] = d;
	} else {
		cells[indices.cell] = a;
		cells[indices.cell + 1] = b;
		cells[indices.cell + 2] = c;
		cells[indices.cell + 3] = b;
		cells[indices.cell + 4] = d;
		cells[indices.cell + 5] = c;
	}
	indices.cell += 6;
}
/**
* A grid of meridian rings (v = 0..1, row-major/outer) by nx + 1 angular
* columns (phi, inner), revolved around the y-axis. The last column wraps and
* welds to the first when phi is a multiple of TAU, same rule as every other
* revolution solid.
*
* `equation({ v, cosPhi, sinPhi })` computes one vertex's analytic
* position/normal, already embedding whatever axis-scale or ellipse the caller
* needs (eg. cylinder's per-end sx/sz, ellipsoid's rx/ry/rz), plus whether the
* whole v-ring is pinched to a point on the axis (a pole or an apex).
* `collapsed` must depend on v only: it's probed once per row (at cosPhi = 1,
* sinPhi = 0) to size and fan-triangulate the mesh before the main fill. This
* generalizes ellipsoid's original pole handling to any meridian curve, not
* just an ellipse's sin/cos one. A pole is only supported at v = 0 or v = 1 -
* the meridian curve must not cross the axis anywhere in between - so callers
* with a bounded theta/thetaOffset (eg. ellipsoid) clamp them so their sweep
* can't.
*
* `vDistribution(t)` remaps the row's linear index fraction `t` (0..1, evenly
* spaced) to the actual `v` fed into `equation` - `linear` (the default) is the
* identity, `chebyshev` clusters rows toward both ends of the sweep. This
* changes vertex positions, not just texturing: a row's `v` drives its position
* through `equation`, so redistributing `v` moves where rows actually sit along
* the meridian (see distribution.js).
*
* The uv v-coordinate defaults to `t`, not the (possibly redistributed) `v`, so
* texture coordinates stay linear regardless of `vDistribution` unless a caller
* allocates rows non-uniformly across the meridian for its own reasons (eg.
* capsule.js packing more/fewer rows into its hemispheres than its cylindrical
* body): the texture would stretch across whichever section got more rows,
* instead of following actual surface position. `equation` may return its own
* `v` to override just the uv; structural v (row spacing, pole detection) is
* unaffected, since it's only ever read from the input parameter, never the
* return value.
*
* CapBase/capApex add a flat disk at v = 0/v = 1, skipped when that end is
* already collapsed to a true point apex (same convention cylinder/cone use
* today). position.x/z are always linear in (cosPhi, sinPhi) with no cross
* term, for an axis-aligned surface of revolution (the defining property of
* this whole family). So each cap's radius/ellipse-scale is reconstructed by
* probing `equation` at that end rather than requiring the caller to pass it
* separately: `equation(v, 1, 0).position` and `equation(v, 0, 1).position`
* give the rim's x/z extent directly, positive or negative depending on the
* shape's own sign convention (eg. cylinder's cosPhi = -cos(p)). capRadius is
* fixed at 1, and the sign is folded into a per-cap cos/sin flip instead of
* `Math.abs`-ing it away blindly - so the reconstructed rim still lands exactly
* on the body's own boundary ring (bit-identical, the same "seam" convention as
* every other welded boundary here), while keeping the cap's sx/sy positive for
* mapping functions that divide by them (eg. `rectangular`).
*
* @private
*/
function computeRevolutionGeometry({ nx = 32, ny = 16, phi = TAU, phiOffset = 0, capBase = false, capApex = false, capSegments = 1, capBaseSegments = capSegments, capApexSegments = capSegments, capMapping, vDistribution = linear, equation } = {}) {
	const wrap = phi % TAU === 0;
	const collapsedAt = Array.from({ length: ny + 1 }, (_, y) => equation({
		v: vDistribution(y / ny),
		cosPhi: 1,
		sinPhi: 0
	}).collapsed);
	const fans = collapsedAt.reduce((sum, collapsed, y) => sum + (collapsed ? y === 0 || y === ny ? 1 : 2 : 0), 0);
	const hasCapBase = capBase && !collapsedAt[0];
	const hasCapApex = capApex && !collapsedAt[ny];
	const capBaseCount = hasCapBase ? capBaseSegments : 0;
	const capApexCount = hasCapApex ? capApexSegments : 0;
	const capFans = (capBaseCount > 0 ? 1 : 0) + (capApexCount > 0 ? 1 : 0);
	const size = (ny + 1) * (nx + 1) + (nx + 1) * 2 * (capBaseCount + capApexCount);
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(ny * nx * 6 - fans * nx * 3 + (capBaseCount + capApexCount) * nx * 6 - capFans * nx * 3);
	let vertexIndex = 0;
	let cellIndex = 0;
	const phiAt = (x) => (wrap && x === nx ? 0 : x / nx) * phi + phiOffset;
	const writeVertex = (x, v, t) => {
		const p = phiAt(x);
		const { position, normal, v: uvV = t } = equation({
			v,
			cosPhi: Math.cos(p),
			sinPhi: Math.sin(p)
		});
		positions[vertexIndex * 3] = position[0];
		positions[vertexIndex * 3 + 1] = position[1];
		positions[vertexIndex * 3 + 2] = position[2];
		TMP[0] = normal[0];
		TMP[1] = normal[1];
		TMP[2] = normal[2];
		normalize(TMP);
		normals[vertexIndex * 3] = TMP[0];
		normals[vertexIndex * 3 + 1] = TMP[1];
		normals[vertexIndex * 3 + 2] = TMP[2];
		uvs[vertexIndex * 2] = x / nx;
		uvs[vertexIndex * 2 + 1] = uvV;
	};
	const writeRowQuads = (y) => {
		const rowOffset = vertexIndex - 2 * (nx + 1);
		for (let x = 0; x < nx; x++) {
			const a = rowOffset + x;
			const b = a + 1;
			const c = a + nx + 1;
			const d = a + nx + 2;
			if (!collapsedAt[y - 1]) {
				cells[cellIndex] = a;
				cells[cellIndex + 1] = b;
				cells[cellIndex + 2] = c;
				cellIndex += 3;
			}
			if (!collapsedAt[y]) {
				cells[cellIndex] = c;
				cells[cellIndex + 1] = b;
				cells[cellIndex + 2] = d;
				cellIndex += 3;
			}
		}
	};
	for (let y = 0; y <= ny; y++) {
		const t = y / ny;
		const v = vDistribution(t);
		for (let x = 0; x <= nx; x++, vertexIndex++) writeVertex(x, v, t);
		if (y > 0) writeRowQuads(y);
	}
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	const indices = {
		vertex: vertexIndex,
		cell: cellIndex
	};
	const addCap = (v, capSegments, flip, normalY) => {
		const atCos = equation({
			v,
			cosPhi: 1,
			sinPhi: 0
		});
		const atSin = equation({
			v,
			cosPhi: 0,
			sinPhi: 1
		});
		const xSign = atCos.position[0] < 0 ? -1 : 1;
		const zSign = atSin.position[2] < 0 ? -1 : 1;
		computeCap(geometry, indices, {
			ringSegments: nx,
			capSegments,
			capRadius: 1,
			sx: xSign * atCos.position[0],
			sy: zSign * atSin.position[2],
			flip,
			angleAt: (i) => {
				const p = phiAt(i);
				return {
					cos: xSign * Math.cos(p),
					sin: zSign * Math.sin(p),
					t: p
				};
			},
			point: (x, y) => [
				x,
				atCos.position[1],
				y
			],
			normal: [
				0,
				normalY,
				0
			],
			mapping: capMapping
		});
	};
	if (hasCapBase) addCap(0, capBaseSegments, 1, -1);
	if (hasCapApex) addCap(1, capApexSegments, -1, 1);
	return {
		positions,
		normals,
		uvs,
		cells,
		indices
	};
}
/**
* A point on a regular sides-gon ring at the given angle/radius/height - same
* x/z sign convention as `cylinder`'s own `equation()`, so a prism, antiprism
* and cylinder built with the same radius/phiOffset share a corner. Shared by
* prism/antiprism's own wall corners and cap rims (see `computePolygonCap`), so
* a wall corner's position is computed by the exact same expression as its
* coincident cap vertex - required for them to weld bit-identically
* (`analyze()`'s crack check), not just approximately.
*
* @private
*/
function computePolygonCorner(angle, radius, y) {
	return [
		-radius * Math.cos(angle),
		y,
		radius * Math.sin(angle)
	];
}
/**
* A prism/antiprism's flat sides-gon cap: `computeCap`'s own `sides + 1` angle
* samples with no further interpolation between them trace a straight sides-gon
* boundary, not an arc (see `prism.js`'s own doc comment for why). Shared by
* `prism` (whose bottom/top ends sample the same `angleAt`) and `antiprism`
* (whose top ring is rotated by half a sector, so each end supplies its own).
*
* @private
*/
function computePolygonCap(geometry, indices, { sides, radius, y, flip, normalY, angleAt, mapping }) {
	computeCap(geometry, indices, {
		ringSegments: sides,
		capSegments: 1,
		capRadius: radius,
		flip,
		angleAt: (i) => {
			const p = angleAt(i);
			return {
				cos: -Math.cos(p),
				sin: Math.sin(p),
				t: p
			};
		},
		point: (x, z) => [
			x,
			y,
			z
		],
		normal: [
			0,
			normalY,
			0
		],
		mapping
	});
}
/**
* A spindle-torus generating-circle revolution: the meridian is an arc of a
* circle (radius `a`, offset from the axis) that crosses the revolution axis at
* its own two endpoints. This produces cusped poles - not smooth tangent points
* like a sphere's - each with its own per-column normal. Shared by `apple` (the
* major, more-than-half-circle arc) and `lemon` (the minor,
* less-than-half-circle arc of the same construction, opposite sign
* convention); see each file's own doc comment for the halfHeight domain that
* distinguishes them. This helper takes `a`/`thetaCross`/
* `poleCosTheta`/`radiusAt` as given rather than re-deriving them, since the
* two files' sign conventions for the circle's own axis offset are mirrored.
*
* `radiusAt(cosTheta)` computes the meridian's radius away from the poles.
* `poleCosTheta` is the same circle's cosTheta at r = 0, used for the pole's
* own normal. It's kept separate from `radiusAt`, since deriving it via
* `radiusAt`'s own formula wouldn't reliably round-trip to exactly 0 in
* floating point - leaving the pole undetected as collapsed (see apple.js's own
* comment on its equation for the full reasoning).
*
* @private
*/
function computeSpindleArcRevolution({ a, halfHeight, thetaCross, poleCosTheta, radiusAt, nx, ny, phi, phiOffset, vDistribution }) {
	function equation({ v, cosPhi: rawCosPhi, sinPhi: rawSinPhi }) {
		const cosPhi = snapToZero(rawCosPhi);
		const sinPhi = snapToZero(rawSinPhi);
		let cosTheta, sinTheta, r, y;
		if (v === 0 || v === 1) {
			cosTheta = poleCosTheta;
			sinTheta = (v === 0 ? -halfHeight : halfHeight) / a;
			r = 0;
			y = v === 0 ? -halfHeight : halfHeight;
		} else {
			const theta = -thetaCross + v * 2 * thetaCross;
			cosTheta = snapToZero(Math.cos(theta));
			sinTheta = snapToZero(Math.sin(theta));
			r = radiusAt(cosTheta);
			y = a * sinTheta;
		}
		return {
			position: [
				-cosPhi * r,
				y,
				sinPhi * r
			],
			normal: [
				-cosPhi * cosTheta,
				sinTheta,
				sinPhi * cosTheta
			],
			collapsed: r === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution,
		equation
	});
}
/**
* A flat-ended surface of revolution around the y axis, both ends open rings
* cappable exactly like `cylinder`'s. Shared plumbing for
* `barrel`/`funnel`/`hyperboloid`, which only differ in their own radius law
* (parabolic/exponential/hyperbolic). `profile(y, v)` returns `[r, normalY]`:
* the meridian's radius at that height, and the y-component of the implicit
* surface's gradient there (x/z components are always `x`/`z` themselves for
* this whole family, since none of their defining equations has an x/y or z/y
* cross term). Both `y` and the raw sweep parameter `v` are passed through, so
* a caller whose own radius law is naturally written in terms of one or the
* other (eg. funnel's exponential, in `v`) doesn't have to round-trip through
* the other and risk a 1-ULP drift.
*
* @private
*/
function computeFlatRevolutionGeometry({ height, nx, ny, phi, phiOffset, capApex, capBase, capSegments, capMapping, vDistribution, profile }) {
	const halfHeight = height / 2;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const y = height * v - halfHeight;
		const [r, normalY] = profile(y, v);
		const x = r * cosPhi;
		const z = r * sinPhi;
		return {
			position: [
				x,
				y,
				z
			],
			normal: [
				x,
				normalY,
				z
			],
			collapsed: false
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		capApex,
		capBase,
		capApexSegments: capSegments,
		capBaseSegments: capSegments,
		capMapping,
		vDistribution,
		equation
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/** @typedef {"all" | "x" | "y" | "z"} RoundedCubeDirection */
/**
* @typedef {object} RoundedCubeOptions
* @property {number} [sx=1]
* @property {number} [sy=sx]
* @property {number} [sz=sx]
* @property {number} [radius=sx * 0.25]
* @property {number} [roundSegments=8]
* @property {number} [nx=1] Segments along the straight x sections.
* @property {number} [ny=nx] Segments along the straight y sections.
* @property {number} [nz=nx] Segments along the straight z sections.
* @property {RoundedCubeDirection} [roundDirection="all"]
*/
/**
* A cuboid with rounded edges and corners.
*
* @param {RoundedCubeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function roundedCube({ sx = 1, sy = sx, sz = sx, radius = sx * .25, roundSegments = 8, nx = 1, ny = nx, nz = nx, roundDirection = "all" } = {}) {
	const r2 = radius * 2;
	const widthX = sx - r2;
	const widthY = sy - r2;
	const widthZ = sz - r2;
	if (widthX === 0) nx = 0;
	if (widthY === 0) ny = 0;
	if (widthZ === 0) nz = 0;
	const colsX = 2 * roundSegments + nx;
	const colsY = 2 * roundSegments + ny;
	const colsZ = 2 * roundSegments + nz;
	const size = ((colsX + 1) * (colsY + 1) + (colsZ + 1) * (colsY + 1) + (colsX + 1) * (colsZ + 1)) * 2;
	const geometry = {
		positions: new Float32Array(size * 3),
		normals: new Float32Array(size * 3),
		uvs: new Float32Array(size * 2),
		cells: new (getCellsTypedArray(size))((colsX * colsY + colsZ * colsY + colsX * colsZ) * 2 * 6)
	};
	const halfSX = sx * .5;
	const halfSY = sy * .5;
	const halfSZ = sz * .5;
	const indices = {
		vertex: 0,
		cell: 0
	};
	const excludedAxis = roundDirection === "all" ? -1 : "xyz".indexOf(roundDirection);
	const bounds = [
		widthX * .5,
		widthY * .5,
		widthZ * .5
	];
	const PLANES = [
		[
			widthZ,
			widthY,
			nz,
			ny,
			"x",
			halfSX
		],
		[
			widthZ,
			widthY,
			nz,
			ny,
			"-x",
			-halfSX
		],
		[
			widthX,
			widthZ,
			nx,
			nz,
			"y",
			halfSY
		],
		[
			widthX,
			widthZ,
			nx,
			nz,
			"-y",
			-halfSY
		],
		[
			widthX,
			widthY,
			nx,
			ny,
			"z",
			halfSZ
		],
		[
			widthX,
			widthY,
			nx,
			ny,
			"-z",
			-halfSZ
		]
	];
	const roundVertex = (vertexIndex, position) => {
		TMP[0] = position[0];
		TMP[1] = position[1];
		TMP[2] = position[2];
		for (let k = 0; k < 3; k++) {
			if (k === excludedAxis) continue;
			const bound = bounds[k];
			if (position[k] < -bound) position[k] = -bound;
			else if (position[k] > bound) position[k] = bound;
		}
		for (let k = 0; k < 3; k++) TMP[k] = k === excludedAxis ? 0 : TMP[k] - position[k];
		normalize(TMP);
		geometry.normals[vertexIndex] = TMP[0];
		geometry.normals[vertexIndex + 1] = TMP[1];
		geometry.normals[vertexIndex + 2] = TMP[2];
		geometry.positions[vertexIndex] = position[0] + radius * TMP[0];
		geometry.positions[vertexIndex + 1] = position[1] + radius * TMP[1];
		geometry.positions[vertexIndex + 2] = position[2] + radius * TMP[2];
	};
	const roundFace = (plane, startVertex) => {
		const [su, sv, nu, nv, direction, pw] = plane;
		const [u, v, w, flipU, flipV] = PLANE_DIRECTIONS[direction];
		const cols = 2 * roundSegments + nu;
		const rows = 2 * roundSegments + nv;
		for (let j = 0; j <= rows; j++) {
			const y0 = getPlaneCoordinate(j, nv, sv, radius, roundSegments);
			for (let x = 0; x <= cols; x++) {
				const x0 = getPlaneCoordinate(x, nu, su, radius, roundSegments);
				const position = [
					0,
					0,
					0
				];
				position[u] = x0 * flipU;
				position[v] = y0 * flipV;
				position[w] = pw;
				roundVertex((startVertex + j * (cols + 1) + x) * 3, position);
			}
		}
	};
	for (const plane of PLANES) {
		const [su, sv, nu, nv, direction, pw] = plane;
		const outOfPlaneAxis = PLANE_DIRECTIONS[direction][2];
		const startVertex = indices.vertex;
		const axisActive = outOfPlaneAxis !== excludedAxis;
		computePlane(geometry, indices, su, sv, nu, nv, direction, pw, [1, 1], [0, 0], [
			0,
			0,
			0
		], true, radius, roundSegments, !axisActive);
		if (axisActive) roundFace(plane, startVertex);
	}
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} EllipsoidOptions
* @property {number} [radius=0.5]
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [sz=sy]
* @property {number} [theta=Math.PI] Meridian sweep length, silently clamped to
*   [-thetaOffset, PI - thetaOffset]: a pole can only sit at the sweep's own
*   start or end, never partway through.
* @property {number} [thetaOffset=0] Meridian sweep start (0 = north pole),
*   silently clamped to [0, PI] - see theta.
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Unit-sphere direction cosines for a given meridian angle t (0 = north pole)
* and (already computed) equatorial cosPhi/sinPhi: the [dx, dy, dz] this
* module's own `equation` scales by radius/sx/sy/sz for position, and by
* 1/sx/1/sy/1/sz for its gradient-based normal. Exported so other spherical
* shapes (eg. `hollowSphere`'s theta/phi cut caps) can place a point on - or a
* direction from - the exact same sphere without re-deriving the formula. This
* guarantees bit-identical positions where they must weld to an
* `ellipsoid`/`sphere` surface.
*
* @private
* @param {number} t Meridian angle, 0 at the north pole
* @param {number} cosPhi
* @param {number} sinPhi
* @returns {[number, number, number]}
*/
function sphereDirection(t, cosPhi, sinPhi) {
	const cosTheta = snapToZero(Math.cos(t));
	const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
	cosPhi = snapToZero(cosPhi);
	sinPhi = snapToZero(sinPhi);
	return [
		-cosPhi * sinTheta,
		-cosTheta,
		sinPhi * sinTheta
	];
}
/**
* Default to an oblate spheroid.
*
* @param {EllipsoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function ellipsoid({ radius = .5, nx = 32, ny = 16, sx = 1, sy = .5, sz = sy, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	function equation({ v, cosPhi, sinPhi }) {
		const t = v * clampedTheta + clampedThetaOffset;
		const [dx, dy, dz] = sphereDirection(t, cosPhi, sinPhi);
		return {
			position: [
				radius * sx * dx,
				radius * sy * dy,
				radius * sz * dz
			],
			normal: [
				dx / sx,
				dy / sy,
				dz / sz
			],
			collapsed: t % Math.PI === 0
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SphereOptions
* @property {number} [radius=0.5]
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [theta=Math.PI]
* @property {number} [thetaOffset=0]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
*/
/**
* A sphere: `ellipsoid` with sx = sy = 1.
*
* @param {SphereOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function sphere({ radius = .5, nx = 32, ny = 16, theta, thetaOffset, phi, phiOffset } = {}) {
	return ellipsoid({
		radius,
		nx,
		ny,
		theta,
		thetaOffset,
		phi,
		phiOffset,
		sx: 1,
		sy: 1
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* Flat annular wall at a fixed meridian angle t (a theta cut, ie. where the
* theta sweep stops short of a pole): r sweeps innerRadius -> radius, phi
* sweeps the same phiOffset/phi range as the outer/inner bands, sampled on the
* exact same nx grid so its rim welds bit-identically to theirs. flip (1 or -1)
* picks which of the 2 possible caps this is (t = the sweep's start or end),
* driving both the outward normal (the +-theta tangent of `sphereDirection`)
* and winding.
*
* @private
*/
function thetaCap({ t, phi, phiOffset, nx, capSegments, radius, innerRadius, flip }) {
	const wrap = phi % TAU === 0;
	const cols = nx + 1;
	const size = (capSegments + 1) * cols;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(capSegments * nx * 6);
	const cosT = Math.cos(t);
	const sinT = Math.sin(t);
	const indices = {
		vertex: 0,
		cell: 0
	};
	for (let j = 0; j <= capSegments; j++) {
		const r = innerRadius + (radius - innerRadius) * (j / capSegments);
		for (let i = 0; i <= nx; i++, indices.vertex++) {
			const u = i / nx;
			const p = (wrap && i === nx ? 0 : u) * phi + phiOffset;
			const cosPhi = Math.cos(p);
			const sinPhi = Math.sin(p);
			const [dx, dy, dz] = sphereDirection(t, cosPhi, sinPhi);
			positions[indices.vertex * 3] = r * dx;
			positions[indices.vertex * 3 + 1] = r * dy;
			positions[indices.vertex * 3 + 2] = r * dz;
			TMP[0] = flip * -cosPhi * cosT;
			TMP[1] = flip * sinT;
			TMP[2] = flip * sinPhi * cosT;
			normalize(TMP);
			normals[indices.vertex * 3] = TMP[0];
			normals[indices.vertex * 3 + 1] = TMP[1];
			normals[indices.vertex * 3 + 2] = TMP[2];
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = j / capSegments;
			if (j > 0 && i > 0) computeGridQuad(cells, indices, cols, flip);
		}
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* Flat annular wall at a fixed equatorial angle p (a phi cut, ie. where the phi
* sweep is a partial revolution): r sweeps innerRadius -> radius, theta sweeps
* the same clamped thetaOffset/theta range as the outer/inner bands, sampled on
* the exact same ny grid so its rim welds bit-identically to theirs. flip (1 or
* -1) picks which of the 2 possible caps this is (p = the sweep's start or
* end), driving both the outward normal (the +-phi tangent of
* `sphereDirection`) and winding.
*
* @private
*/
function phiCap({ p, theta, thetaOffset, ny, capSegments, radius, innerRadius, flip }) {
	const rows = ny + 1;
	const size = (capSegments + 1) * rows;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(capSegments * ny * 6);
	const cosP = Math.cos(p);
	const sinP = Math.sin(p);
	const indices = {
		vertex: 0,
		cell: 0
	};
	for (let j = 0; j <= capSegments; j++) {
		const r = innerRadius + (radius - innerRadius) * (j / capSegments);
		for (let i = 0; i <= ny; i++, indices.vertex++) {
			const v = i / ny;
			const t = thetaOffset + theta * v;
			const sinT = Math.sin(t);
			const [dx, dy, dz] = sphereDirection(t, cosP, sinP);
			positions[indices.vertex * 3] = r * dx;
			positions[indices.vertex * 3 + 1] = r * dy;
			positions[indices.vertex * 3 + 2] = r * dz;
			TMP[0] = flip * sinP * sinT;
			TMP[1] = 0;
			TMP[2] = flip * cosP * sinT;
			normalize(TMP);
			normals[indices.vertex * 3] = TMP[0];
			normals[indices.vertex * 3 + 1] = TMP[1];
			normals[indices.vertex * 3 + 2] = TMP[2];
			uvs[indices.vertex * 2] = v;
			uvs[indices.vertex * 2 + 1] = j / capSegments;
			if (j > 0 && i > 0) computeGridQuad(cells, indices, rows, -flip);
		}
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}
/**
* @typedef {object} HollowSphereOptions
* @property {number} [radius=0.5]
* @property {number} [innerRadius=radius*0.5]
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [capSegments=1] Radial segments of each cut cap
* @property {number} [theta=Math.PI / 2] Meridian sweep length, silently
*   clamped like `ellipsoid`'s
* @property {number} [thetaOffset=Math.PI / 4] Meridian sweep start, silently
*   clamped like `ellipsoid`'s
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
*/
/**
* A sphere with a smaller, concentric sphere hollowed out of it: a shell of
* uniform wall thickness. Defaults to a quarter band (theta/thetaOffset) rather
* than a full sphere, since a closed hollow sphere looks identical to a plain
* `sphere` from outside - the partial default exposes the cavity and cut caps
* immediately.
*
* @param {HollowSphereOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function hollowSphere({ radius = .5, innerRadius = radius * .5, nx = 32, ny = 16, capSegments = 1, theta = Math.PI / 2, thetaOffset = Math.PI / 4, phi = TAU, phiOffset = 0 } = {}) {
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	const thetaStart = clampedThetaOffset;
	const thetaEnd = clampedThetaOffset + clampedTheta;
	const pieces = [sphere({
		radius,
		nx,
		ny,
		theta,
		thetaOffset,
		phi,
		phiOffset
	}), invert(sphere({
		radius: innerRadius,
		nx,
		ny,
		theta,
		thetaOffset,
		phi,
		phiOffset
	}))];
	if (thetaStart % Math.PI !== 0) pieces.push(thetaCap({
		t: thetaStart,
		phi,
		phiOffset,
		nx,
		capSegments,
		radius,
		innerRadius,
		flip: -1
	}));
	if (thetaEnd % Math.PI !== 0) pieces.push(thetaCap({
		t: thetaEnd,
		phi,
		phiOffset,
		nx,
		capSegments,
		radius,
		innerRadius,
		flip: 1
	}));
	if (phi % TAU !== 0) pieces.push(phiCap({
		p: phiOffset,
		theta: clampedTheta,
		thetaOffset: clampedThetaOffset,
		ny,
		capSegments,
		radius,
		innerRadius,
		flip: -1
	}), phiCap({
		p: phiOffset + phi,
		theta: clampedTheta,
		thetaOffset: clampedThetaOffset,
		ny,
		capSegments,
		radius,
		innerRadius,
		flip: 1
	}));
	return concatGeometries(pieces);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SuperellipsoidOptions
* @property {number} [radius=0.5]
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [sz=sy]
* @property {number} [n1=3] North-south (meridian) roundness exponent
* @property {number} [n2=n1] East-west (cross-section) roundness exponent
* @property {number} [theta=Math.PI] Meridian sweep length, silently clamped to
*   [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for
*   why.
* @property {number} [thetaOffset=0] Meridian sweep start, silently clamped to
*   [0, PI] - see theta.
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Superquadric ellipsoid (Barr 1981): generalizes ellipsoid by raising its
* meridian (n1) and cross-section (n2) sin/cos terms to signed powers - n = 2
* is a plain ellipsoid, n < 2 rounds toward a box, n > 2 (the default, n1 = n2
* = 3) pinches toward a star/octahedron. See superegg for the n2 = 2 (circular
* cross-section) special case.
*
* @param {SuperellipsoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Superellipsoid]{@link https://mathworld.wolfram.com/Superellipsoid.html}
* @see [Wikipedia – Superellipsoid]{@link https://en.wikipedia.org/wiki/Superellipsoid}
*/
function superellipsoid({ radius = .5, nx = 32, ny = 16, sx = 1, sy = .5, sz = sy, n1 = 3, n2 = n1, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const e1 = 2 / n1;
	const e2 = 2 / n2;
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	function equation({ v, cosPhi, sinPhi }) {
		const t = v * clampedTheta + clampedThetaOffset;
		const cosTheta = snapToZero(Math.cos(t));
		const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
		cosPhi = snapToZero(cosPhi);
		sinPhi = snapToZero(sinPhi);
		const dx = -signedPow(cosPhi, e2) * signedPow(sinTheta, e1);
		const dy = -signedPow(cosTheta, e1);
		const dz = signedPow(sinPhi, e2) * signedPow(sinTheta, e1);
		return {
			position: [
				radius * sx * dx,
				radius * sy * dy,
				radius * sz * dz
			],
			normal: [
				-signedPow(cosPhi, 2 - e2) * signedPow(sinTheta, 2 - e1) / sx,
				-signedPow(cosTheta, 2 - e1) / sy,
				signedPow(sinPhi, 2 - e2) * signedPow(sinTheta, 2 - e1) / sz
			],
			collapsed: sinTheta === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution,
		equation
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AstroidalEllipsoidOptions
* @property {number} [radius=0.5]
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [sx=1]
* @property {number} [sy=0.5]
* @property {number} [sz=sy]
* @property {number} [theta=Math.PI] Meridian sweep length, silently clamped to
*   [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for
*   why.
* @property {number} [thetaOffset=0] Meridian sweep start, silently clamped to
*   [0, PI] - see theta.
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
*/
/**
* A superellipsoid special case (n1 = n2 = 2/3): the surface
*
* |x/a|^(2/3) + |y/b|^(2/3) + |z/c|^(2/3) = 1, pinched to 6 cusps along
*
* The axes.
*
* @param {AstroidalEllipsoidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Astroidal Ellipsoid]{@link https://mathworld.wolfram.com/AstroidalEllipsoid.html}
*/
function astroidalEllipsoid({ radius = .5, nx = 32, ny = 16, sx = 1, sy = .5, sz = sy, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0 } = {}) {
	return superellipsoid({
		radius,
		nx,
		ny,
		sx,
		sy,
		sz,
		n1: 2 / 3,
		n2: 2 / 3,
		theta,
		thetaOffset,
		phi,
		phiOffset
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SupereggOptions
* @property {number} [radius=0.5] Equatorial radius
* @property {number} [sy=5/6] Vertical (polar) scale
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [n=2.5] Roundness exponent - Piet Hein's original; n > 2
*   gives a "true" superegg, n = 2 is a spheroid, n < 2 rounds toward a
*   cylinder-capped-with-cones shape
* @property {number} [theta=Math.PI] Meridian sweep length, silently clamped to
*   [-thetaOffset, PI - thetaOffset] - see ellipsoid.js's EllipsoidOptions for
*   why.
* @property {number} [thetaOffset=0] Meridian sweep start, silently clamped to
*   [0, PI] - see theta.
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Piet Hein's superegg: a superellipsoid special case (n2 = 2, sx = sz) with a
* circular cross-section at every height, ie. an actual surface of revolution -
* unlike the general superellipsoid, whose cross-sections are themselves
* superelliptical.
*
* @param {SupereggOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Superegg]{@link https://mathworld.wolfram.com/Superegg.html}
* @see [Wikipedia – Superegg]{@link https://en.wikipedia.org/wiki/Superegg}
*/
function superegg({ radius = .5, sy = 5 / 6, nx = 32, ny = 16, n = 2.5, theta = Math.PI, thetaOffset = 0, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const e = 2 / n;
	const [clampedTheta, clampedThetaOffset] = clampMeridianSweep(theta, thetaOffset);
	function equation({ v, cosPhi, sinPhi }) {
		const t = v * clampedTheta + clampedThetaOffset;
		const cosTheta = snapToZero(Math.cos(t));
		const sinTheta = t % Math.PI === 0 ? 0 : snapToZero(Math.sin(t));
		cosPhi = snapToZero(cosPhi);
		sinPhi = snapToZero(sinPhi);
		const s = signedPow(sinTheta, e);
		return {
			position: [
				radius * -cosPhi * s,
				radius * sy * -signedPow(cosTheta, e),
				radius * sinPhi * s
			],
			normal: [
				-cosPhi * signedPow(sinTheta, 2 - e) / radius,
				-signedPow(cosTheta, 2 - e) / (radius * sy),
				sinPhi * signedPow(sinTheta, 2 - e) / radius
			],
			collapsed: sinTheta === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution,
		equation
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} CylinderOptions
* @property {number} [height=1]
* @property {number} [radius=0.25]
* @property {number} [nx=16]
* @property {number} [ny=1]
* @property {number} [radiusApex=radius]
* @property {number} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {number} [capBaseSegments=capSegments]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] Base ring x scale, elliptical when != sz
* @property {number} [sz=1] Base ring z scale, elliptical when != sx
* @property {number} [sxApex=sx] Apex ring x scale, independent of the base
* @property {number} [szApex=sz] Apex ring z scale, independent of the base
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Right circular cylinder by default. Other shapes fall out of the same
* parameters: a tube (capBase/capApex false, any radii), a frustum/cone
* (radiusApex != radius, 0 for a true cone apex), and an elliptical cylinder or
* frustum (sx != sz, optionally different per end via sxApex/szApex).
*
* @param {CylinderOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function cylinder({ height = 1, radius = .25, nx = 16, ny = 1, radiusApex = radius, capSegments = 1, capApex = true, capBase = true, capBaseSegments = capSegments, phi = TAU, phiOffset = 0, capMapping = rectangular, sx = 1, sz = 1, sxApex = sx, szApex = sz, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const rPrime = radiusApex - radius;
	const sxPrime = sxApex - sx;
	const szPrime = szApex - sz;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const r = lerp(radius, radiusApex, v);
		const sxV = lerp(sx, sxApex, v);
		const szV = lerp(sz, szApex, v);
		return {
			position: [
				r * sxV * cosPhi,
				height * v - halfHeight,
				r * szV * sinPhi
			],
			normal: [
				height * szV * cosPhi,
				-(rPrime * sxV * szV + r * (sxPrime * szV * cosPhi * cosPhi + sxV * szPrime * sinPhi * sinPhi)),
				height * sxV * sinPhi
			],
			collapsed: r === 0
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		capBase,
		capApex,
		capBaseSegments,
		capApexSegments: capSegments,
		capMapping,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* A single right-circular-cone-frustum segment of a meridian sweep between two
* arbitrary y's. It's cylinder.js's elliptical-frustum case, minus the per-end
* ellipse (sx/sz are constant across the segment, since a frustum end that
* isn't a single point never occurs here), generalized from a
* height/halfHeight-centered span to an arbitrary yFrom/yTo. `cone` below is
* one such segment (apex at one end); bicone.js and doubleCone.js each
* concatenate two others at their shared seam, instead of using a single
* function with a v = 0.5 kink - see bicone.js for why that shared-row approach
* can't be wound correctly on both sides.
*
* @private
*/
function computeConeSegment({ yFrom, yTo, rFrom, rTo, nx, ny, phi, phiOffset, sx = 1, sz = 1, vDistribution, capOptions }) {
	const rPrime = rTo - rFrom;
	const yPrime = yTo - yFrom;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const r = rFrom + rPrime * v;
		return {
			position: [
				r * sx * cosPhi,
				yFrom + yPrime * v,
				r * sz * sinPhi
			],
			normal: [
				yPrime * sz * cosPhi,
				-(rPrime * sx * sz),
				yPrime * sx * sinPhi
			],
			collapsed: r === 0
		};
	}
	return computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution,
		equation,
		...capOptions
	});
}
/**
* @typedef {object} ConeOptions
* @property {number} [height=1]
* @property {number} [radius=0.25]
* @property {number} [nx=16]
* @property {number} [ny=1]
* @property {number} [capSegments=1]
* @property {boolean} [capBase=true]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] Base ring x scale, elliptical when != sz
* @property {number} [sz=1] Base ring z scale, elliptical when != sx
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Right circular cone by default. Other shapes fall out of the same parameters:
* an open cone/funnel (capBase false) and an elliptical cone (sx != sz).
* There's no apex-side ellipse - the apex is always a single point, so any apex
* scale would be a no-op.
*
* @param {ConeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function cone({ height = 1, radius = .25, nx = 16, ny = 1, capSegments = 1, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, sx = 1, sz = 1, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const { positions, normals, uvs, cells } = computeConeSegment({
		yFrom: -halfHeight,
		yTo: halfHeight,
		rFrom: radius,
		rTo: 0,
		nx,
		ny,
		phi,
		phiOffset,
		sx,
		sz,
		vDistribution,
		capOptions: {
			capBase,
			capBaseSegments: capSegments,
			capMapping
		}
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HollowCylinderOptions
* @property {number} [height=1]
* @property {number} [radius=0.5]
* @property {number} [innerRadius=radius*0.5] Bore radius
* @property {number} [nx=32]
* @property {number} [ny=1]
* @property {number} [capSegments=1] Radial segments of each annular cap
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
*/
/**
* A cylinder with a concentric cylindrical bore through it - a washer/pipe
* extruded to a given height. Doesn't close the `phi < TAU` wedge cut (no wall
* between the outer/inner walls or the 2 caps there) - same limitation as a
* plain `cylinder({ phi: <TAU })`.
*
* @param {HollowCylinderOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function hollowCylinder({ height = 1, radius = .5, innerRadius = radius * .5, nx = 32, ny = 1, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0 } = {}) {
	const halfHeight = height / 2;
	const annularCap = (y, rFrom, rTo) => computeConeSegment({
		yFrom: y,
		yTo: y,
		rFrom,
		rTo,
		nx,
		ny: capSegments,
		phi,
		phiOffset
	});
	const pieces = [cylinder({
		height,
		radius,
		nx,
		ny,
		phi,
		phiOffset,
		capBase: false,
		capApex: false
	}), invert(cylinder({
		height,
		radius: innerRadius,
		nx,
		ny,
		phi,
		phiOffset,
		capBase: false,
		capApex: false
	}))];
	if (capApex) pieces.push(annularCap(halfHeight, radius, innerRadius));
	if (capBase) pieces.push(annularCap(-halfHeight, innerRadius, radius));
	return concatGeometries(pieces);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} RoundedCylinderOptions
* @property {number} [height=1]
* @property {number} [radius=0.25]
* @property {number} [roundRadius=radius*0.3] Fillet radius at the top/bottom
*   rim, silently clamped to [0, min(radius, height/2)] - the fillet can
*   neither exceed the body's own radius nor meet itself across the height
* @property {number} [nx=16]
* @property {number} [ny=1] Straight side segments
* @property {number} [roundSegments=8] Fillet segments (each end)
* @property {number} [capSegments=1] Flat cap segments (each end)
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* A cylinder with its top/bottom rim edges filleted instead of sharp - a flat
* cap blended into the straight side by a quarter-circle fillet, both ends
* symmetric. `roundRadius = 0` gives a plain flat-capped `cylinder`;
* `roundRadius = radius = height / 2` pinches the flat cap away entirely,
* becoming `capsule`'s hemisphere.
*
* @param {RoundedCylinderOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function roundedCylinder({ height = 1, radius = .25, roundRadius = radius * .3, nx = 16, ny = 1, roundSegments = 8, capSegments = 1, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const clampedRoundRadius = clamp(roundRadius, 0, Math.min(radius, halfHeight));
	const hasFillet = clampedRoundRadius > 0;
	const activeRoundSegments = hasFillet ? roundSegments : 0;
	const flatRadius = radius - clampedRoundRadius;
	const activeCapSegments = flatRadius > 0 ? capSegments : 0;
	const sideHalfHeight = halfHeight - clampedRoundRadius;
	const activeNy = sideHalfHeight > 0 ? ny : 0;
	const halfPi = Math.PI / 2;
	const nyTotal = 2 * activeCapSegments + 2 * activeRoundSegments + activeNy;
	const v1 = activeCapSegments / nyTotal;
	const v2 = (activeCapSegments + activeRoundSegments) / nyTotal;
	const v3 = (activeCapSegments + activeRoundSegments + activeNy) / nyTotal;
	const v4 = (activeCapSegments + 2 * activeRoundSegments + activeNy) / nyTotal;
	const capLength = flatRadius;
	const filletLength = halfPi * clampedRoundRadius;
	const sideLength = 2 * sideHalfHeight;
	const totalLength = 2 * capLength + 2 * filletLength + sideLength;
	const cap1End = capLength;
	const fillet1End = cap1End + filletLength;
	const sideEnd = fillet1End + sideLength;
	const fillet2End = sideEnd + filletLength;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		let r, y, normalRadial, normalY, uvV;
		if (v <= v1) {
			const localFraction = v1 === 0 ? 0 : v / v1;
			r = flatRadius * localFraction;
			y = -halfHeight;
			normalRadial = 0;
			normalY = -1;
			uvV = localFraction * capLength / totalLength;
		} else if (hasFillet && v <= v2) {
			const localFraction = (v - v1) / (v2 - v1);
			const a = localFraction * halfPi;
			const sinA = snapToZero(Math.sin(a));
			const cosA = snapToZero(Math.cos(a));
			r = flatRadius + clampedRoundRadius * sinA;
			y = -sideHalfHeight - clampedRoundRadius * cosA;
			normalRadial = sinA;
			normalY = -cosA;
			uvV = (cap1End + localFraction * filletLength) / totalLength;
		} else if (v <= v3) {
			const localFraction = v3 > v2 ? (v - v2) / (v3 - v2) : 0;
			r = radius;
			y = -sideHalfHeight + 2 * sideHalfHeight * localFraction;
			normalRadial = 1;
			normalY = 0;
			uvV = (fillet1End + localFraction * sideLength) / totalLength;
		} else if (hasFillet && v <= v4) {
			const localFraction = (v - v3) / (v4 - v3);
			const a = localFraction * halfPi;
			const sinA = snapToZero(Math.sin(halfPi - a));
			const cosA = snapToZero(Math.cos(halfPi - a));
			r = flatRadius + clampedRoundRadius * sinA;
			y = sideHalfHeight + clampedRoundRadius * cosA;
			normalRadial = sinA;
			normalY = cosA;
			uvV = (sideEnd + localFraction * filletLength) / totalLength;
		} else {
			const localFraction = v4 === 1 ? 0 : (v - v4) / (1 - v4);
			r = flatRadius * (1 - localFraction);
			y = halfHeight;
			normalRadial = 0;
			normalY = 1;
			uvV = (fillet2End + localFraction * capLength) / totalLength;
		}
		return {
			position: [
				r * cosPhi,
				y,
				r * sinPhi
			],
			normal: [
				normalRadial * cosPhi,
				normalY,
				normalRadial * sinPhi
			],
			collapsed: r === 0,
			v: uvV
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny: nyTotal,
		phi,
		phiOffset,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} BiconeOptions
* @property {number} [height=1]
* @property {number} [radius=0.5]
* @property {number} [nx=16]
* @property {number} [ny=1] Meridian segments per half (top/bottom cone)
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {number} [sx=1] Equator x scale, elliptical when != sz
* @property {number} [sz=1] Equator z scale, elliptical when != sx
*/
/**
* Two right circular cones joined base-to-base at the equator (a bipyramid of
* revolution/spinning-top shape) - both ends come to a point, so unlike
* `cylinder`/`doubleCone` there are no cap options.
*
* @param {BiconeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function bicone({ height = 1, radius = .5, nx = 16, ny = 1, phi = TAU, phiOffset = 0, sx = 1, sz = 1 } = {}) {
	const halfHeight = height / 2;
	const segment = (yFrom, yTo, rFrom, rTo) => computeConeSegment({
		yFrom,
		yTo,
		rFrom,
		rTo,
		nx,
		ny,
		phi,
		phiOffset,
		sx,
		sz
	});
	return concatGeometries([segment(-halfHeight, 0, 0, radius), segment(0, halfHeight, radius, 0)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* `computeConeSegment`'s phi = PI boundary column hits Math.sin(PI) (~1e-16,
* not exact 0): harmless on its own, but `twist` below moves that residual into
* a different coordinate slot, where it collides with an apex point that's
* exactly 0 there (r = 0 forces it). Snapping before twisting keeps both copies
* bit-identical.
*
* @private
*/
function snapZeros(array) {
	for (let i = 0; i < array.length; i++) array[i] = snapToZero(array[i]);
}
/**
* Rotate a geometry's positions/normals by (x, y, z) -> (-y, -x, -z): the
* rigid, orientation-preserving map that carries `half` (apex N = (0, r, 0),
* shared equator rim through W = (-r, 0, 0), (0, 0, r), E = (r, 0, 0)) onto the
* other two quarter-cones (apex W, shared rim through N, (0, 0, -r), S = (0,
* -r, 0)). This is the 90°-twisted reattachment that makes a sphericon a
* sphericon rather than a plain bicone. Since it's a proper rotation (not a
* reflection), normals carry over unchanged in direction - no inverse-transpose
* needed, and winding stays correct.
*
* @private
*/
function twist({ positions, normals, uvs, cells }) {
	const twistedPositions = new Float32Array(positions.length);
	const twistedNormals = new Float32Array(normals.length);
	for (let i = 0; i < positions.length; i += 3) {
		twistedPositions[i] = -positions[i + 1];
		twistedPositions[i + 1] = -positions[i];
		twistedPositions[i + 2] = -positions[i + 2];
		twistedNormals[i] = -normals[i + 1];
		twistedNormals[i + 1] = -normals[i];
		twistedNormals[i + 2] = -normals[i + 2];
	}
	return {
		positions: twistedPositions,
		normals: twistedNormals,
		uvs,
		cells
	};
}
/**
* @typedef {object} SphericonOptions
* @property {number} [radius=0.5]
* @property {number} [nx=16] Segments per quarter-cone's half-turn sweep
* @property {number} [ny=1] Meridian segments per quarter-cone (its meridian is
*   a straight cone slant, so ny > 1 buys nothing by default, same as
*   cone/bicone/doubleCone)
*/
/**
* A right-circular bicone with a 90° apex angle, split along the plane through
* both apexes and reattached with one half rotated 90° - the classic
* 4-quarter-cone rolling solid. No flat faces: a single continuous developable
* surface that rolls by wobbling in a straight line.
*
* @param {SphericonOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Sphericon]{@link https://mathworld.wolfram.com/Sphericon.html}
*/
function sphericon({ radius = .5, nx = 16, ny = 1 } = {}) {
	const segment = (yFrom, yTo, rFrom, rTo) => computeConeSegment({
		yFrom,
		yTo,
		rFrom,
		rTo,
		nx,
		ny,
		phi: Math.PI,
		phiOffset: 0
	});
	const half = concatGeometries([segment(-radius, 0, 0, radius), segment(0, radius, radius, 0)]);
	snapZeros(half.positions);
	snapZeros(half.normals);
	return concatGeometries([half, twist(half)]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DoubleConeOptions
* @property {number} [height=1]
* @property {number} [radius=0.5]
* @property {number} [nx=16]
* @property {number} [ny=1] Meridian segments per half (top/bottom cone)
* @property {number} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {number} [capBaseSegments=capSegments]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] End ring x scale, elliptical when != sz
* @property {number} [sz=1] End ring z scale, elliptical when != sx
*/
/**
* Two right circular cones joined apex-to-apex at the waist (an hourglass of
* revolution) - the wide top/bottom ends are flat, so unlike `bicone` it takes
* the same capBase/capApex/capSegments/capMapping options as `cylinder`.
*
* @param {DoubleConeOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function doubleCone({ height = 1, radius = .5, nx = 16, ny = 1, capSegments = 1, capApex = true, capBase = true, capBaseSegments = capSegments, phi = TAU, phiOffset = 0, capMapping = rectangular, sx = 1, sz = 1 } = {}) {
	const halfHeight = height / 2;
	const segment = (yFrom, yTo, rFrom, rTo, capOptions) => computeConeSegment({
		yFrom,
		yTo,
		rFrom,
		rTo,
		nx,
		ny,
		phi,
		phiOffset,
		sx,
		sz,
		capOptions
	});
	return concatGeometries([segment(-halfHeight, 0, radius, 0, {
		capBase,
		capBaseSegments,
		capMapping
	}), segment(0, halfHeight, 0, radius, {
		capApex,
		capApexSegments: capSegments,
		capMapping
	})]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} CapsuleOptions
* @property {number} [height=0.5]
* @property {number} [radius=0.25]
* @property {number} [nx=16]
* @property {number} [ny=1]
* @property {number} [roundSegments=16] `0` collapses both hemispheres away,
*   leaving an open tube.
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* A cylindrical body capped with two hemispheres (a "pill" shape).
*
* @param {CapsuleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function capsule({ height = .5, radius = .25, nx = 16, ny = 1, roundSegments = 16, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const halfPi = Math.PI / 2;
	const nyTotal = 2 * roundSegments + ny;
	const bodyStart = roundSegments / nyTotal;
	const bodyEnd = (roundSegments + ny) / nyTotal;
	const axisExtent = 2 * radius + height;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		let r, y, normalRadial, normalY;
		if (roundSegments > 0 && v <= bodyStart) {
			const a = v / bodyStart * halfPi;
			const sinA = snapToZero(Math.sin(a));
			const cosA = snapToZero(Math.cos(a));
			r = radius * sinA;
			y = -halfHeight - radius * cosA;
			normalRadial = sinA;
			normalY = -cosA;
		} else if (roundSegments > 0 && v >= bodyEnd) {
			const a = (1 - (v - bodyEnd) / (1 - bodyEnd)) * halfPi;
			const sinA = snapToZero(Math.sin(a));
			const cosA = snapToZero(Math.cos(a));
			r = radius * sinA;
			y = halfHeight + radius * cosA;
			normalRadial = sinA;
			normalY = cosA;
		} else {
			const s = (v - bodyStart) / (bodyEnd - bodyStart);
			r = radius;
			y = -halfHeight + height * s;
			normalRadial = 1;
			normalY = 0;
		}
		return {
			position: [
				r * cosPhi,
				y,
				r * sinPhi
			],
			normal: [
				normalRadial * cosPhi,
				normalY,
				normalRadial * sinPhi
			],
			collapsed: r === 0,
			v: .5 + y / axisExtent
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny: nyTotal,
		phi,
		phiOffset,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TorusOptions
* @property {number} [radius=0.4]
* @property {number} [segments=64]
* @property {number} [minorRadius=0.1]
* @property {number} [minorSegments=32]
* @property {number} [theta=TAU]
* @property {number} [thetaOffset=0]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {number} [capSegments=1]
* @property {boolean} [capStart=true]
* @property {boolean} [capEnd=true]
* @property {number} [capStartSegments=capSegments]
* @property {number} [capEndSegments=capSegments]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {number} [sx=1] Major sweep x scale (footprint), elliptical when !=
*   sy
* @property {number} [sy=1] Major sweep y scale (footprint), elliptical when !=
*   sx
* @property {number} [minorSx=1] Tube radial scale (meridian cross-section),
*   elliptical when != minorSy
* @property {number} [minorSy=1] Tube z scale (meridian cross-section),
*   elliptical when != minorSx
*/
/**
* Ring torus by default. Other shapes fall out of the same parameters: a
* partial/open torus (phi < TAU, optionally capped via capStart/capEnd), an
* elliptical torus (sx != sy, an oval/racetrack footprint), and a tube with an
* elliptical cross-section (minorSx != minorSy, like a flattened or
* spindle-shaped bagel).
*
* @param {TorusOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function torus({ radius = .4, segments = 64, minorRadius = .1, minorSegments = 32, theta = TAU, thetaOffset = 0, phi = TAU, phiOffset = 0, capSegments = 1, capStart = true, capEnd = true, capStartSegments = capSegments, capEndSegments = capSegments, capMapping = rectangular, sx = 1, sy = 1, minorSx = 1, minorSy = 1 } = {}) {
	const wrapPhi = phi % TAU === 0;
	const wrapTheta = theta % TAU === 0;
	const hasCapStart = capStart && !wrapPhi && capStartSegments > 0;
	const hasCapEnd = capEnd && !wrapPhi && capEndSegments > 0;
	const m = minorSegments + 1;
	const capCount = (hasCapStart ? capStartSegments : 0) + (hasCapEnd ? capEndSegments : 0);
	const size = m * (segments + 1) + m * 2 * capCount;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const capFans = (hasCapStart ? 1 : 0) + (hasCapEnd ? 1 : 0);
	const cells = new (getCellsTypedArray(size))(minorSegments * segments * 6 + minorSegments * capCount * 6 - minorSegments * capFans * 3);
	const indices = {
		vertex: 0,
		cell: 0
	};
	const angleAt = (j) => {
		const v = j / minorSegments;
		const t = (wrapTheta && j === minorSegments ? 0 : v) * theta + thetaOffset;
		return {
			cos: -Math.cos(t),
			sin: Math.sin(t),
			t
		};
	};
	const phiAngleAt = (i) => (wrapPhi && i === segments ? 0 : i / segments) * phi + phiOffset;
	for (let j = 0; j <= minorSegments; j++) {
		const v = j / minorSegments;
		const { cos: cosTheta, sin: sinTheta } = angleAt(j);
		for (let i = 0; i <= segments; i++, indices.vertex++) {
			const u = i / segments;
			const p = phiAngleAt(i);
			const cosPhi = -Math.cos(p);
			const sinPhi = Math.sin(p);
			const radial = radius + minorRadius * minorSx * cosTheta;
			positions[indices.vertex * 3] = sx * radial * cosPhi;
			positions[indices.vertex * 3 + 1] = sy * radial * sinPhi;
			positions[indices.vertex * 3 + 2] = minorRadius * minorSy * sinTheta;
			TMP[0] = sy * minorSy * cosTheta * cosPhi;
			TMP[1] = sx * minorSy * cosTheta * sinPhi;
			TMP[2] = sx * sy * minorSx * sinTheta;
			normalize(TMP);
			normals[indices.vertex * 3] = TMP[0];
			normals[indices.vertex * 3 + 1] = TMP[1];
			normals[indices.vertex * 3 + 2] = TMP[2];
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = v;
			if (j > 0 && i > 0) computeGridQuad(cells, indices, segments + 1, -1);
		}
	}
	const capPoint = (pAngle) => {
		const cosPhi = -Math.cos(pAngle);
		const sinPhi = Math.sin(pAngle);
		return {
			point: (x, y) => [
				sx * (radius + x) * cosPhi,
				sy * (radius + x) * sinPhi,
				y
			],
			normalFor: (flip) => [
				sy * sinPhi * flip,
				-sx * cosPhi * flip,
				0
			]
		};
	};
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	if (hasCapStart) {
		const { point, normalFor } = capPoint(phiOffset);
		computeCap(geometry, indices, {
			ringSegments: minorSegments,
			capSegments: capStartSegments,
			capRadius: minorRadius,
			sx: minorSx,
			sy: minorSy,
			flip: -1,
			angleAt,
			point,
			normal: normalFor(-1),
			mapping: capMapping
		});
	}
	if (hasCapEnd) {
		const { point, normalFor } = capPoint(phiOffset + phi);
		computeCap(geometry, indices, {
			ringSegments: minorSegments,
			capSegments: capEndSegments,
			capRadius: minorRadius,
			sx: minorSx,
			sy: minorSy,
			flip: 1,
			angleAt,
			point,
			normal: normalFor(1),
			mapping: capMapping
		});
	}
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AppleOptions
* @property {number} [radius=0.5] Equatorial (belly) radius
* @property {number} [height=radius] Full height between the two dimple points,
*   silently clamped to (0, radius*2] - the generating circle's own radius must
*   exceed its offset from the axis (see below), which fails past that bound
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* MathWorld's Apple Surface: "more than half of a circular arc rotated about an
* axis passing through the [arc's] endpoints" - the outer lobe of a spindle
* torus. Poles are true cusps (dimples), not smooth tangent points like a
* sphere's - each pole's normal varies per column, same as `cone`'s apex.
*
* @param {AppleOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Apple Surface]{@link https://mathworld.wolfram.com/AppleSurface.html}
*/
function apple({ radius = .5, height = radius, nx = 32, ny = 16, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const halfHeight = clamp(height, 0, radius * 2) / 2;
	const a = (radius + halfHeight * halfHeight / radius) / 2;
	const d = radius - a;
	const thetaCross = Math.acos(-d / a);
	const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
		a,
		halfHeight,
		thetaCross,
		poleCosTheta: -d / a,
		radiusAt: (cosTheta) => d + a * cosTheta,
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} LemonOptions
* @property {number} [radius=0.3] Equatorial (widest) radius
* @property {number} [height=1] Full height between the two pointed ends,
*   silently raised to at least radius_2 - below that the generating circle's
*   center offset would go negative, no longer tracing the lemon's own (minor,
*   less-than-half-circle) arc; height = radius_2 exactly degenerates to a
*   plain sphere (the offset hits 0)
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Lemon (geometry): "a circular arc of angle less than half of a full circle"
* rotated about the chord through its own endpoints - `apple`'s exact
* complementary half. Unlike apple, the meridian is plain y-monotonic: no
* dimple, just a smooth convex taper to a point (still a cusp, not a tangent
* point, at each pole).
*
* @param {LemonOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wikipedia – Lemon (geometry)]{@link https://en.wikipedia.org/wiki/Lemon_(geometry)}
*/
function lemon({ radius = .3, height = 1, nx = 32, ny = 16, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const halfHeight = Math.max(height, radius * 2) / 2;
	const aPlusD = halfHeight * halfHeight / radius;
	const a = (radius + aPlusD) / 2;
	const d = aPlusD - a;
	const thetaLemon = Math.acos(d / a);
	const { positions, normals, uvs, cells } = computeSpindleArcRevolution({
		a,
		halfHeight,
		thetaCross: thetaLemon,
		poleCosTheta: d / a,
		radiusAt: (cosTheta) => a * cosTheta - d,
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SphericalRingOptions
* @property {number} [radius=0.5] Sphere radius
* @property {number} [innerRadius=radius*0.5] Cylindrical bore radius, silently
*   clamped to [0, radius] - a bore wider than the sphere has no sensible rim
*   to meet
* @property {number} [nx=32]
* @property {number} [ny=16] Outer spherical band meridian segments
* @property {number} [holeSegments=1] Inner bore wall segments
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*   Applies to the outer spherical band only - the inner bore wall is a plain
*   cylinder.
*/
/**
* A sphere with a cylindrical hole drilled through its center - MathWorld's
* Spherical Ring, aka a napkin ring. Unlike what "ring" might suggest, there's
* no flat annulus at either end: at the rim (height `sqrt(radius² -
* innerRadius²)`), the sphere's and bore's surfaces meet directly, so the
* meridian cross-section is a single closed loop - topologically a torus with a
* lens-shaped minor curve instead of a circular one.
*
* @param {SphericalRingOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Spherical Ring]{@link https://mathworld.wolfram.com/SphericalRing.html}
*/
function sphericalRing({ radius = .5, innerRadius = radius * .5, nx = 32, ny = 16, holeSegments = 1, phi = TAU, phiOffset = 0, vDistribution = linear } = {}) {
	const clampedInnerRadius = clamp(innerRadius, 0, radius);
	const thetaRim = Math.asin(clampedInnerRadius / radius);
	const theta = Math.PI - 2 * thetaRim;
	function outerEquation({ v, cosPhi, sinPhi }) {
		const t = v * theta + thetaRim;
		const cosTheta = snapToZero(Math.cos(t));
		const sinTheta = snapToZero(Math.sin(t));
		cosPhi = snapToZero(cosPhi);
		sinPhi = snapToZero(sinPhi);
		const dx = -cosPhi * sinTheta;
		const dy = -cosTheta;
		const dz = sinPhi * sinTheta;
		return {
			position: [
				radius * dx,
				radius * dy,
				radius * dz
			],
			normal: [
				dx,
				dy,
				dz
			],
			collapsed: false
		};
	}
	const outer = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		vDistribution,
		equation: outerEquation
	});
	const bottomRim = outerEquation({
		v: 0,
		cosPhi: 1,
		sinPhi: 0
	}).position;
	const topRim = outerEquation({
		v: 1,
		cosPhi: 1,
		sinPhi: 0
	}).position;
	const yBottom = bottomRim[1];
	const yTop = topRim[1];
	function innerEquation({ v, cosPhi, sinPhi }) {
		const { position: rim } = outerEquation({
			v: 0,
			cosPhi,
			sinPhi
		});
		return {
			position: [
				rim[0],
				yBottom + (yTop - yBottom) * v,
				rim[2]
			],
			normal: [
				rim[0],
				0,
				rim[2]
			],
			collapsed: false
		};
	}
	const inner = invert(computeRevolutionGeometry({
		nx,
		ny: holeSegments,
		phi,
		phiOffset,
		equation: innerEquation
	}));
	return concatGeometries([outer, inner]);
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} PrismOptions
* @property {number} [radius=0.25]
* @property {number} [height=1]
* @property {number} [sides=6]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
*/
/**
* Right prism: a regular sides-gon extruded into sides flat rectangular side
* faces, each with its own hard-edged normal - unlike `cylinder`'s smooth
* per-vertex normal, which just makes a large-nx cylinder look faceted rather
* than actually being one.
*
* @param {PrismOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function prism({ radius = .25, height = 1, sides = 6, phiOffset = 0, capMapping = rectangular } = {}) {
	const halfHeight = height / 2;
	const angleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;
	const size = sides * 4 + (sides + 1) * 2 * 2;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(sides * 4 * 3);
	const indices = {
		vertex: 0,
		cell: 0
	};
	const sector = TAU / sides;
	for (let i = 0; i < sides; i++) {
		const angle0 = angleAt(i);
		const angle1 = angleAt(i + 1);
		const midAngle = angle0 + sector / 2;
		const [x0, , z0] = computePolygonCorner(angle0, radius, 0);
		const [x1, , z1] = computePolygonCorner(angle1, radius, 0);
		const nx = -Math.cos(midAngle);
		const nz = Math.sin(midAngle);
		const base = indices.vertex;
		const u0 = i / sides;
		const u1 = (i + 1) / sides;
		for (const [px, py, pz, u, v] of [
			[
				x0,
				-halfHeight,
				z0,
				u0,
				0
			],
			[
				x1,
				-halfHeight,
				z1,
				u1,
				0
			],
			[
				x1,
				halfHeight,
				z1,
				u1,
				1
			],
			[
				x0,
				halfHeight,
				z0,
				u0,
				1
			]
		]) {
			positions[indices.vertex * 3] = px;
			positions[indices.vertex * 3 + 1] = py;
			positions[indices.vertex * 3 + 2] = pz;
			normals[indices.vertex * 3] = nx;
			normals[indices.vertex * 3 + 2] = nz;
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = v;
			indices.vertex++;
		}
		cells[indices.cell] = base + 3;
		cells[indices.cell + 1] = base;
		cells[indices.cell + 2] = base + 1;
		cells[indices.cell + 3] = base + 3;
		cells[indices.cell + 4] = base + 1;
		cells[indices.cell + 5] = base + 2;
		indices.cell += 6;
	}
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: -halfHeight,
		flip: 1,
		normalY: -1,
		angleAt,
		mapping: capMapping
	});
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: halfHeight,
		flip: -1,
		normalY: 1,
		angleAt,
		mapping: capMapping
	});
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} AntiprismOptions
* @property {number} [radius=0.25]
* @property {number} [height=1]
* @property {number} [sides=6]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
*/
/**
* Antiprism: like `prism`, but the top sides-gon is rotated by half a sector
* relative to the bottom one, so the two rings connect through a zigzag band of
* 2 * sides flat triangles (each with its own hard-edged normal) instead of
* prism's sides flat rectangles. The 2 end caps are otherwise identical to
* prism's own, just with the top one rotated to match its own ring.
*
* @param {AntiprismOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function antiprism({ radius = .25, height = 1, sides = 6, phiOffset = 0, capMapping = rectangular } = {}) {
	const halfHeight = height / 2;
	const topOffset = phiOffset + TAU / sides / 2;
	const bottomAngleAt = (i) => (i === sides ? 0 : i / sides) * TAU + phiOffset;
	const topAngleAt = (i) => (i === sides ? 0 : i / sides) * TAU + topOffset;
	const size = sides * 2 * 3 + (sides + 1) * 2 * 2;
	const positions = new Float32Array(size * 3);
	const normals = new Float32Array(size * 3);
	const uvs = new Float32Array(size * 2);
	const cells = new (getCellsTypedArray(size))(sides * 4 * 3);
	const indices = {
		vertex: 0,
		cell: 0
	};
	const writeTriangle = (a, b, c, uvA, uvB, uvC) => {
		const ux = b[0] - a[0];
		const uy = b[1] - a[1];
		const uz = b[2] - a[2];
		const vx = c[0] - a[0];
		const vy = c[1] - a[1];
		const vz = c[2] - a[2];
		const nx = uy * vz - uz * vy;
		const ny = uz * vx - ux * vz;
		const nz = ux * vy - uy * vx;
		const length = Math.hypot(nx, ny, nz);
		const base = indices.vertex;
		for (const [[px, py, pz], [u, v]] of [
			[a, uvA],
			[b, uvB],
			[c, uvC]
		]) {
			positions[indices.vertex * 3] = px;
			positions[indices.vertex * 3 + 1] = py;
			positions[indices.vertex * 3 + 2] = pz;
			normals[indices.vertex * 3] = nx / length;
			normals[indices.vertex * 3 + 1] = ny / length;
			normals[indices.vertex * 3 + 2] = nz / length;
			uvs[indices.vertex * 2] = u;
			uvs[indices.vertex * 2 + 1] = v;
			indices.vertex++;
		}
		cells[indices.cell] = base;
		cells[indices.cell + 1] = base + 1;
		cells[indices.cell + 2] = base + 2;
		indices.cell += 3;
	};
	for (let i = 0; i < sides; i++) {
		const bottomA = computePolygonCorner(bottomAngleAt(i), radius, -halfHeight);
		const bottomB = computePolygonCorner(bottomAngleAt(i + 1), radius, -halfHeight);
		const topA = computePolygonCorner(topAngleAt(i), radius, halfHeight);
		const topB = computePolygonCorner(topAngleAt(i + 1), radius, halfHeight);
		const u0 = i / sides;
		const u1 = (i + 1) / sides;
		const uMid = (u0 + u1) / 2;
		writeTriangle(bottomA, bottomB, topA, [u0, 0], [u1, 0], [uMid, 1]);
		writeTriangle(topB, topA, bottomB, [u1, 1], [u0, 1], [u1, 0]);
	}
	const geometry = {
		positions,
		normals,
		uvs,
		cells
	};
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: -halfHeight,
		flip: 1,
		normalY: -1,
		angleAt: bottomAngleAt,
		mapping: capMapping
	});
	computePolygonCap(geometry, indices, {
		sides,
		radius,
		y: halfHeight,
		flip: -1,
		normalY: 1,
		angleAt: topAngleAt,
		mapping: capMapping
	});
	return geometry;
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} ParaboloidOptions
* @property {number} [height=1]
* @property {number} [radius=0.5] Rim radius, at the open (base) end
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [capSegments=1]
* @property {boolean} [capBase=true]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Circular paraboloid (revolution of x² + z² = k·(apexY - y), the classic
* satellite-dish/reflector shape) - apex up, rim down, same orientation as
* `cone`, and like `cone` only the rim end takes a cap option. Unlike a cone's
* apex, the surface here is smooth at the apex (no crease), with a single
* well-defined normal there.
*
* @param {ParaboloidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Paraboloid]{@link https://mathworld.wolfram.com/Paraboloid.html}
*/
function paraboloid({ height = 1, radius = .5, nx = 32, ny = 16, capSegments = 1, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const k = radius * radius / height;
	function equation({ v, cosPhi: rawCosPhi, sinPhi }) {
		const cosPhi = -rawCosPhi;
		const r = radius * Math.sqrt(1 - v);
		const x = r * cosPhi;
		const z = r * sinPhi;
		return {
			position: [
				x,
				-halfHeight + height * v,
				z
			],
			normal: [
				x,
				k / 2,
				z
			],
			collapsed: r === 0
		};
	}
	const { positions, normals, uvs, cells } = computeRevolutionGeometry({
		nx,
		ny,
		phi,
		phiOffset,
		capBase,
		capBaseSegments: capSegments,
		capMapping,
		vDistribution,
		equation
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HyperboloidOptions
* @property {number} [height=1]
* @property {number} [radius=0.25] Waist radius, at y = 0
* @property {number} [endRadius=radius*2] Rim radius, at y = ±height/2 (both
*   ends, symmetric) - the classic one-sheet shape needs endRadius > radius
*   (pinched waist flaring to both rims); endRadius = radius degenerates to a
*   plain cylinder, and endRadius < radius traces an oblate-spheroid-like
*   profile instead (still a valid, NaN-free surface, just not a hyperbola)
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Hyperboloid of one sheet (revolution of x² + z² = radius² + k·y², a
* pinched-waist, flared-both-ends shape - cooling towers, gear/skew-roller
* profiles). Both ends are flat rings, not points, cappable like `cylinder`'s
* frustum.
*
* @param {HyperboloidOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – One-Sheeted Hyperboloid]{@link https://mathworld.wolfram.com/One-SheetedHyperboloid.html}
*/
function hyperboloid({ height = 1, radius = .25, endRadius = radius * 2, nx = 32, ny = 16, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const k = (endRadius * endRadius - radius * radius) / (halfHeight * halfHeight);
	const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
		height,
		nx,
		ny,
		phi,
		phiOffset,
		capApex,
		capBase,
		capSegments,
		capMapping,
		vDistribution,
		profile: (y) => [Math.sqrt(radius * radius + k * y * y), -k * y]
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} BarrelOptions
* @property {number} [height=1]
* @property {number} [radius=0.5] Belly radius, at the equator (y = 0)
* @property {number} [endRadius=radius*0.7] Rim radius, at y = ±height/2 (both
*   ends, symmetric) - must be < radius for an actual outward bulge; endRadius
*   = radius degenerates to a plain cylinder, endRadius > radius pinches inward
*   instead (a barrel held together the wrong way round, still a valid NaN-free
*   surface)
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Barrel/cask: a cylinder that bulges outward at the equator and tapers back to
* a narrower flat rim at both ends. Unlike `superegg` (which also bulges but
* tapers all the way to a point at each pole), both ends here stay flat, open
* rings, cappable like `cylinder`'s.
*
* @param {BarrelOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
*/
function barrel({ height = 1, radius = .5, endRadius = radius * .7, nx = 32, ny = 16, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear } = {}) {
	const halfHeight = height / 2;
	const k = (radius - endRadius) / (halfHeight * halfHeight);
	const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
		height,
		nx,
		ny,
		phi,
		phiOffset,
		capApex,
		capBase,
		capSegments,
		capMapping,
		vDistribution,
		profile: (y) => [radius - k * y * y, k * y]
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} FunnelOptions
* @property {number} [height=1]
* @property {number} [radius=0.1] Spout radius, at y = -height/2
* @property {number} [radiusApex=radius*5] Mouth radius, at y = height/2 - must
*   be > radius for the usual flared-outward shape; radiusApex = radius
*   degenerates to a plain cylinder, radiusApex < radius flips the taper (still
*   a valid, NaN-free surface, just narrowing toward the top instead)
* @property {number} [nx=32]
* @property {number} [ny=16]
* @property {number} [capSegments=1]
* @property {boolean} [capApex=true]
* @property {boolean} [capBase=true]
* @property {number} [phi=TAU]
* @property {number} [phiOffset=0]
* @property {import("../../mappings.js").MappingFn} [capMapping=mappings.rectangular]
* @property {import("../../utils/distribution.js").DistributionFn} [vDistribution=utils.linear]
*/
/**
* Revolution of y = a·ln(r) (equivalently r = radius·e^(k·(y+height/2)), an
* exponential - not linear (`cone`) or hyperbolic (`hyperboloid`) - radius law)
* between a narrow spout and a wide mouth. Both ends stay flat, open rings,
* cappable exactly like `hyperboloid`'s.
*
* @param {FunnelOptions} [options={}]
* @returns {import("../../../types.js").SimplicialComplex}
* @see [Wolfram MathWorld – Funnel]{@link https://mathworld.wolfram.com/Funnel.html}
*/
function funnel({ height = 1, radius = .1, radiusApex = radius * 5, nx = 32, ny = 16, capSegments = 1, capApex = true, capBase = true, phi = TAU, phiOffset = 0, capMapping = rectangular, vDistribution = linear } = {}) {
	const k = Math.log(radiusApex / radius) / height;
	const { positions, normals, uvs, cells } = computeFlatRevolutionGeometry({
		height,
		nx,
		ny,
		phi,
		phiOffset,
		capApex,
		capBase,
		capSegments,
		capMapping,
		vDistribution,
		profile: (_, v) => {
			const r = radius * (radiusApex / radius) ** v;
			return [r, -k * (r * r)];
		}
	});
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module utils
* @ignore
*/
const MAX_VERTICES = 1e7;
const POLE_EPSILON = 1e-5;
const SEAM_WRAP_THRESHOLD = .5;
const POLE_KEY_U_SCALE = 1e6;
const POLE_KEY_CORNER_STRIDE = 3 * POLE_KEY_U_SCALE;
const POLE_KEY_BASE = MAX_VERTICES;
/**
* Undirected seed edge key, stable whichever way the edge is walked
*
* @private
*/
const edgeKey = (a, b, numSeedVertices) => a < b ? a * numSeedVertices + b : b * numSeedVertices + a;
const isPole = (v) => v < POLE_EPSILON || v > .99999;
/**
* Vertex and triangle counts for a seed polyhedron, from face lengths only (no
* vertex math): projecting welds seed corners and seed-edge points across
* faces, so those are counted once; diagonal and strictly-interior points never
* are.
*
* @private
*/
function computePolyhedronSize(seedCells, numSeedVertices, S, project) {
	let numTriangles = 0;
	let unsharedTerm = 0;
	const edgeKeys = project ? /* @__PURE__ */ new Set() : null;
	for (const face of seedCells) {
		const n = face.length;
		const fanTriangles = n - 2;
		const diagonals = Math.max(0, n - 3);
		numTriangles += fanTriangles * S * S;
		unsharedTerm += diagonals * (S - 1) + fanTriangles * (S - 1) * (S - 2) / 2;
		if (project) for (let i = 0; i < n; i++) edgeKeys.add(edgeKey(face[i], face[(i + 1) % n], numSeedVertices));
	}
	let numVertices = unsharedTerm;
	if (project) numVertices += numSeedVertices + edgeKeys.size * (S - 1);
	else for (const face of seedCells) numVertices += face.length * S;
	return {
		numTriangles,
		numVertices
	};
}
/**
* Flat barycentric grid point of a seed triangle: weights i toward b, j toward
* c, and the remaining S - i - j toward a.
*
* @private
*/
function barycentricPoint(seedPositions, a, b, c, i, j, S) {
	const k = S - i - j;
	return [
		(k * seedPositions[a * 3] + i * seedPositions[b * 3] + j * seedPositions[c * 3]) / S,
		(k * seedPositions[a * 3 + 1] + i * seedPositions[b * 3 + 1] + j * seedPositions[c * 3 + 1]) / S,
		(k * seedPositions[a * 3 + 2] + i * seedPositions[b * 3 + 2] + j * seedPositions[c * 3 + 2]) / S
	];
}
/**
* Shift one triangle's corners onto a single local u window, in place: cut the
* circle at its widest empty gap and shift every corner before the cut up by
* +1, which minimizes the maximum pairwise u difference. A pole corner has no
* longitude of its own, so it lands midway between the other two.
*
* @private
*/
function unwrapTriangleUs(u, pole) {
	const order = [
		0,
		1,
		2
	].filter((k) => !pole[k]).toSorted((a, b) => u[a] - u[b]);
	const count = order.length;
	let widestGap = -1;
	let cutAt = -1;
	for (let m = 0; m < count; m++) {
		const gap = m < count - 1 ? u[order[m + 1]] - u[order[m]] : u[order[0]] + 1 - u[order[count - 1]];
		if (gap > widestGap) {
			widestGap = gap;
			cutAt = m;
		}
	}
	if (cutAt < count - 1) for (let m = 0; m <= cutAt; m++) u[order[m]] += 1;
	for (let k = 0; k < 3; k++) {
		if (!pole[k]) continue;
		const [m, n] = [
			0,
			1,
			2
		].filter((o) => o !== k);
		u[k] = (u[m] + u[n]) / 2;
	}
}
/**
* Welding (project) shares one uv per vertex, but the spherical mapping's
* longitude wraps at u = 0/1 and is undefined at the poles, so a shared vertex
* can't hold a uv correct for every triangle that touches it. Zipper it by
* duplicating the affected corner(s) per triangle with a locally-consistent uv,
* returning a new geometry, or null when nothing needed fixing.
*
* This can't help a triangle whose 3 corners are already ~120deg apart in
* longitude before subdivision (eg. tetraSphere's 4 huge faces at low
* subdivisions): no per-vertex uv choice keeps such a triangle non-wrapping,
* only splitting it would, which this does not do.
*
* @private
*/
function zipSphericalUvSeams({ positions, normals, uvs, cells }, numVertices) {
	const extraPositions = [];
	const extraNormals = [];
	const extraUvs = [];
	const duplicateCache = /* @__PURE__ */ new Map();
	let nextIndex = numVertices;
	const duplicate = (key, index, u, v) => {
		let dup = duplicateCache.get(key);
		if (dup === void 0) {
			extraPositions.push(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
			extraNormals.push(normals[index * 3], normals[index * 3 + 1], normals[index * 3 + 2]);
			extraUvs.push(u, v);
			dup = nextIndex++;
			duplicateCache.set(key, dup);
		}
		return dup;
	};
	const patchAt = [];
	const patchTo = [];
	const patchTriangle = (i, corners, u, pole) => {
		for (let k = 0; k < 3; k++) {
			if (u[k] === uvs[corners[k] * 2]) continue;
			const key = pole[k] ? POLE_KEY_BASE + corners[k] * POLE_KEY_CORNER_STRIDE + Math.round(u[k] * POLE_KEY_U_SCALE) : corners[k];
			patchAt.push(i + k);
			patchTo.push(duplicate(key, corners[k], u[k], uvs[corners[k] * 2 + 1]));
		}
	};
	for (let i = 0; i < cells.length; i += 3) {
		const corners = [
			cells[i],
			cells[i + 1],
			cells[i + 2]
		];
		const pole = corners.map((c) => isPole(uvs[c * 2 + 1]));
		if (pole[0] + pole[1] + pole[2] > 1) continue;
		const u = corners.map((c) => uvs[c * 2]);
		if (!pole[0] && !pole[1] && !pole[2]) {
			const lo = Math.min(u[0], u[1], u[2]);
			if (Math.max(u[0], u[1], u[2]) - lo <= SEAM_WRAP_THRESHOLD) continue;
		}
		unwrapTriangleUs(u, pole);
		patchTriangle(i, corners, u, pole);
	}
	if (!extraPositions.length) return null;
	const finalCount = nextIndex;
	const finalPositions = new Float32Array(finalCount * 3);
	finalPositions.set(positions);
	finalPositions.set(extraPositions, positions.length);
	const finalNormals = new Float32Array(finalCount * 3);
	finalNormals.set(normals);
	finalNormals.set(extraNormals, normals.length);
	const finalUvs = new Float32Array(finalCount * 2);
	finalUvs.set(uvs);
	finalUvs.set(extraUvs, uvs.length);
	const finalCells = new (getCellsTypedArray(finalCount))(cells.length);
	finalCells.set(cells);
	for (let p = 0; p < patchAt.length; p++) finalCells[patchAt[p]] = patchTo[p];
	return {
		positions: finalPositions,
		normals: finalNormals,
		uvs: finalUvs,
		cells: finalCells
	};
}
/**
* Build a flat-shaded (or, with `project`, smooth) triangle mesh from a seed
* polyhedron: n-gon faces are fan-triangulated, each triangle optionally
* subdivided into a barycentric grid. By default each face keeps its own
* vertices for flat per-face normals. `project` instead normalizes vertices
* onto `radius` and welds them across faces into a geodesic sphere.
*
* @private
* @param {import("../../types.js").SimplicialComplexPolygon} seed Seed
*   polyhedron: flat xyz positions (radius already baked in by the caller) and
*   CCW n-gon faces (indices into positions)
* @param {object} [options={}]
* @param {number} [options.radius=0.5] Only used to re-normalize when project
*   is true
* @param {number} [options.subdivisions=0] Barycentric grid subdivisions per
*   fan triangle
* @param {boolean} [options.project=false] Radially project and weld across
*   faces
* @param {"gnomonic" | "spherical"} [options.projection="gnomonic"] How
*   subdivided points are placed when project is true: "gnomonic" subdivides
*   flat then projects (denser near seed vertices); "spherical" interpolates
*   along great circles instead
* @param {import("../mappings.js").MappingFn} [options.mapping] Defaults to
*   mappings.spherical when project, mappings.rectangular otherwise
* @returns {import("../../types.js").SimplicialComplex}
* @throws {Error} If subdivisions would produce more than 1e7 vertices
*/
function computePolyhedron({ positions: seedPositions, cells: seedCells }, { radius = .5, subdivisions = 0, project = false, projection = "gnomonic", mapping = project ? spherical : rectangular } = {}) {
	const S = subdivisions + 1;
	const slerped = project && projection === "spherical";
	const numSeedVertices = seedPositions.length / 3;
	const { numTriangles, numVertices } = computePolyhedronSize(seedCells, numSeedVertices, S, project);
	if (numVertices > MAX_VERTICES) throw new Error(`subdivisions ${subdivisions} would produce ${numVertices} vertices; reduce subdivisions.`);
	const positions = new Float32Array(numVertices * 3);
	const normals = new Float32Array(numVertices * 3);
	const uvs = new Float32Array(numVertices * 2);
	const cells = new (getCellsTypedArray(numVertices))(numTriangles * 3);
	let vertexIndex = 0;
	let cellIndex = 0;
	const cornerCache = project ? /* @__PURE__ */ new Map() : null;
	const edgeCache = project ? /* @__PURE__ */ new Map() : null;
	function addVertex(px, py, pz, context) {
		const i3 = vertexIndex * 3;
		const i2 = vertexIndex * 2;
		const l = Math.hypot(px, py, pz) || 1;
		const dx = px / l;
		const dy = py / l;
		const dz = pz / l;
		if (project) {
			positions[i3] = dx * radius;
			positions[i3 + 1] = dy * radius;
			positions[i3 + 2] = dz * radius;
			normals[i3] = dx;
			normals[i3 + 1] = dy;
			normals[i3 + 2] = dz;
		} else {
			positions[i3] = px;
			positions[i3 + 1] = py;
			positions[i3 + 2] = pz;
			normals[i3] = context.normal[0];
			normals[i3 + 1] = context.normal[1];
			normals[i3 + 2] = context.normal[2];
		}
		const rx = px - context.centroid[0];
		const ry = py - context.centroid[1];
		const rz = pz - context.centroid[2];
		mapping({
			uvs,
			index: i2,
			x: rx * context.u[0] + ry * context.u[1] + rz * context.u[2],
			y: rx * context.v[0] + ry * context.v[1] + rz * context.v[2],
			radius: context.extent,
			nx: dx,
			ny: dy,
			nz: dz
		});
		return vertexIndex++;
	}
	const unitPoint = (index) => slerped ? normalize(point(seedPositions, index)) : null;
	const emitGrid = (idx) => {
		for (let i = 0; i < S; i++) for (let j = 0; j <= S - 1 - i; j++) {
			cells[cellIndex] = idx(i, j);
			cells[cellIndex + 1] = idx(i + 1, j);
			cells[cellIndex + 2] = idx(i, j + 1);
			cellIndex += 3;
			if (i + j < S - 1) {
				cells[cellIndex] = idx(i + 1, j);
				cells[cellIndex + 1] = idx(i + 1, j + 1);
				cells[cellIndex + 2] = idx(i, j + 1);
				cellIndex += 3;
			}
		}
	};
	const buildFace = (face) => {
		const n = face.length;
		const context = computeFaceContext(seedPositions, face);
		const cornerIndex = Array.from({ length: n });
		for (let k = 0; k < n; k++) {
			const seed = face[k];
			if (project && cornerCache.has(seed)) cornerIndex[k] = cornerCache.get(seed);
			else {
				const index = addVertex(seedPositions[seed * 3], seedPositions[seed * 3 + 1], seedPositions[seed * 3 + 2], context);
				cornerIndex[k] = index;
				if (project) cornerCache.set(seed, index);
			}
		}
		function boundaryEdge(k) {
			const a = face[k];
			const b = face[(k + 1) % n];
			const points = Array.from({ length: S - 1 });
			for (let i = 1; i < S; i++) if (project) {
				const m = a < b ? i : S - i;
				const key = edgeKey(a, b, numSeedVertices) * S + m;
				const cached = edgeCache.get(key);
				if (cached !== void 0) {
					points[i - 1] = cached;
					continue;
				}
				const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
				const index = addVertex(px, py, pz, context);
				edgeCache.set(key, index);
				points[i - 1] = index;
			} else {
				const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
				points[i - 1] = addVertex(px, py, pz, context);
			}
			return points;
		}
		const diagonalCache = Array.from({ length: n });
		function diagonal(k) {
			if (diagonalCache[k]) return diagonalCache[k];
			const a = face[0];
			const b = face[k];
			const points = Array.from({ length: S - 1 });
			for (let i = 1; i < S; i++) {
				const [px, py, pz] = edgePoint(seedPositions, a, b, i, S, slerped);
				points[i - 1] = addVertex(px, py, pz, context);
			}
			diagonalCache[k] = points;
			return points;
		}
		for (let t = 0; t < n - 2; t++) {
			const kB = t + 1;
			const kC = t + 2;
			const sideAB = t === 0 ? boundaryEdge(0) : diagonal(kB);
			const sideAC = t === n - 3 ? boundaryEdge(n - 1).toReversed() : diagonal(kC);
			const sideBC = boundaryEdge(kB);
			const a = face[0];
			const b = face[kB];
			const c = face[kC];
			const uA = unitPoint(a);
			const uB = unitPoint(b);
			const uC = unitPoint(c);
			const interiorCache = /* @__PURE__ */ new Map();
			function idx(i, j) {
				if (i === 0 && j === 0) return cornerIndex[0];
				if (i === S && j === 0) return cornerIndex[kB];
				if (i === 0 && j === S) return cornerIndex[kC];
				if (j === 0) return sideAB[i - 1];
				if (i === 0) return sideAC[j - 1];
				if (i + j === S) return sideBC[S - i - 1];
				const key = i * (S + 1) + j;
				const cached = interiorCache.get(key);
				if (cached !== void 0) return cached;
				const [px, py, pz] = slerped ? slerpTriangle(uA, uB, uC, i / S, j / S) : barycentricPoint(seedPositions, a, b, c, i, j, S);
				const index = addVertex(px, py, pz, context);
				interiorCache.set(key, index);
				return index;
			}
			emitGrid(idx);
		}
	};
	for (const face of seedCells) buildFace(face);
	if (project && mapping === spherical) {
		const zipped = zipSphericalUvSeams({
			positions,
			normals,
			uvs,
			cells
		}, numVertices);
		if (zipped) return zipped;
	}
	return {
		positions,
		normals,
		uvs,
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TetrahedronFacesOptions
* @property {number} [radius=0.5]
* @property {boolean} [center=true] Center the bounding box at the origin. Set
*   to false to keep every vertex at exactly the circumradius from the origin -
*   needed as-is wherever radial projection applies.
*/
/**
* Regular tetrahedron, apex-up, bounding box centered at the origin.
*
* @param {TetrahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function tetrahedronFaces({ radius = .5, center = true } = {}) {
	const circumradius = radius * SQRT6 / 2;
	const r0 = circumradius * 2 * SQRT2 / 3;
	const positions = Float32Array.of(0, circumradius, 0, r0, -circumradius / 3, 0, -r0 / 2, -circumradius / 3, r0 * SQRT3 / 2, -r0 / 2, -circumradius / 3, -(r0 * SQRT3) / 2);
	if (center) {
		const shiftX = positions[3] / 4;
		const shiftY = (positions[1] + positions[4]) / 2;
		for (let i = 0; i < positions.length; i += 3) {
			positions[i] -= shiftX;
			positions[i + 1] -= shiftY;
		}
	}
	return {
		positions,
		cells: [
			[
				0,
				2,
				1
			],
			[
				0,
				3,
				2
			],
			[
				0,
				1,
				3
			],
			[
				1,
				2,
				3
			]
		]
	};
}
/**
* @typedef {object} TetrahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular tetrahedron.
*
* @param {TetrahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function tetrahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(tetrahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HexahedronFacesOptions
* @property {number} [radius=0.5]
*/
/**
* Regular hexahedron (cube) faces: 8 corners, cells order +x, -x, +y, -y, +z,
* -z - `cubeFaces`'s own layout, since a regular hexahedron is exactly a cube
* whose half-extent (`radius`) is the same on all 3 axes.
*
* @param {HexahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function hexahedronFaces({ radius = .5 } = {}) {
	return cubeFaces({
		sx: radius * 2,
		sy: radius * 2,
		sz: radius * 2
	});
}
/**
* @typedef {object} HexahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular hexahedron (cube).
*
* @param {HexahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function hexahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(hexahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} OctahedronFacesOptions
* @property {number} [radius=0.5]
*/
/**
* Regular octahedron.
*
* @param {OctahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function octahedronFaces({ radius = .5 } = {}) {
	return {
		positions: Float32Array.of(radius, 0, 0, -radius, 0, 0, 0, radius, 0, 0, -radius, 0, 0, 0, radius, 0, 0, -radius),
		cells: [
			[
				0,
				2,
				4
			],
			[
				2,
				1,
				4
			],
			[
				1,
				3,
				4
			],
			[
				3,
				0,
				4
			],
			[
				2,
				0,
				5
			],
			[
				1,
				2,
				5
			],
			[
				3,
				1,
				5
			],
			[
				0,
				3,
				5
			]
		]
	};
}
/**
* @typedef {object} OctahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular octahedron.
*
* @param {OctahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function octahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(octahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DodecahedronFacesOptions
* @property {number} [radius=0.5]
*/
/**
* Regular dodecahedron.
*
* @param {DodecahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function dodecahedronFaces({ radius = .5 } = {}) {
	const a = radius;
	const b = radius / PHI;
	const c = radius * (2 - PHI);
	return {
		positions: Float32Array.of(c, 0, a, -c, 0, a, -b, b, b, 0, a, c, b, b, b, b, -b, b, 0, -a, c, -b, -b, b, c, 0, -a, -c, 0, -a, -b, -b, -b, 0, -a, -c, b, -b, -b, b, b, -b, 0, a, -c, -b, b, -b, a, c, 0, -a, c, 0, -a, -c, 0, a, -c, 0),
		cells: [
			[
				4,
				3,
				2,
				1,
				0
			],
			[
				7,
				6,
				5,
				0,
				1
			],
			[
				12,
				11,
				10,
				9,
				8
			],
			[
				15,
				14,
				13,
				8,
				9
			],
			[
				14,
				3,
				4,
				16,
				13
			],
			[
				3,
				14,
				15,
				17,
				2
			],
			[
				11,
				6,
				7,
				18,
				10
			],
			[
				6,
				11,
				12,
				19,
				5
			],
			[
				4,
				0,
				5,
				19,
				16
			],
			[
				12,
				8,
				13,
				16,
				19
			],
			[
				15,
				9,
				10,
				18,
				17
			],
			[
				7,
				1,
				2,
				17,
				18
			]
		]
	};
}
/**
* @typedef {object} DodecahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular dodecahedron.
*
* @param {DodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function dodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(dodecahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} IcosahedronFacesOptions
* @property {number} [radius=0.5]
*/
/**
* Regular icosahedron.
*
* @param {IcosahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function icosahedronFaces({ radius = .5 } = {}) {
	const s = radius / PHI;
	const f = PHI * s;
	return {
		positions: Float32Array.of(-s, f, 0, s, f, 0, -s, -f, 0, s, -f, 0, 0, -s, f, 0, s, f, 0, -s, -f, 0, s, -f, f, 0, -s, f, 0, s, -f, 0, -s, -f, 0, s),
		cells: [
			[
				0,
				11,
				5
			],
			[
				0,
				5,
				1
			],
			[
				0,
				1,
				7
			],
			[
				0,
				7,
				10
			],
			[
				0,
				10,
				11
			],
			[
				11,
				10,
				2
			],
			[
				5,
				11,
				4
			],
			[
				1,
				5,
				9
			],
			[
				7,
				1,
				8
			],
			[
				10,
				7,
				6
			],
			[
				3,
				9,
				4
			],
			[
				3,
				4,
				2
			],
			[
				3,
				2,
				6
			],
			[
				3,
				6,
				8
			],
			[
				3,
				8,
				9
			],
			[
				9,
				8,
				1
			],
			[
				4,
				9,
				5
			],
			[
				2,
				4,
				11
			],
			[
				6,
				2,
				10
			],
			[
				8,
				6,
				7
			]
		]
	};
}
/**
* @typedef {object} IcosahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Regular icosahedron.
*
* @param {IcosahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function icosahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(icosahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} GreatDodecahedronFacesOptions
* @property {number} [radius=0.5]
*/
/**
* Great dodecahedron, sharing the icosahedron's 12 vertices; each of its 12
* pentagonal faces is the convex pentagon formed by one vertex's 5 neighbors,
* deeply interpenetrating the other 11 faces.
*
* @param {GreatDodecahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function greatDodecahedronFaces({ radius = .5 } = {}) {
	const { positions } = icosahedronFaces({ radius });
	return {
		positions,
		cells: [
			[
				11,
				5,
				1,
				7,
				10
			],
			[
				0,
				5,
				9,
				8,
				7
			],
			[
				11,
				10,
				6,
				3,
				4
			],
			[
				9,
				4,
				2,
				6,
				8
			],
			[
				5,
				11,
				2,
				3,
				9
			],
			[
				0,
				11,
				4,
				9,
				1
			],
			[
				10,
				7,
				8,
				3,
				2
			],
			[
				0,
				1,
				8,
				6,
				10
			],
			[
				7,
				1,
				9,
				3,
				6
			],
			[
				1,
				5,
				4,
				3,
				8
			],
			[
				0,
				7,
				6,
				2,
				11
			],
			[
				5,
				0,
				10,
				2,
				4
			]
		]
	};
}
/**
* @typedef {object} GreatDodecahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Great dodecahedron.
*
* @param {GreatDodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function greatDodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(greatDodecahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} GreatIcosahedronFacesOptions
* @property {number} [radius=0.5] Radius of the shared icosahedron vertices
*/
/**
* Great icosahedron, sharing the icosahedron's 12 vertices; each of its 20
* triangular faces connects a vertex to two of its "second-shell" neighbors
* (rather than its 5 immediate ones), deeply interpenetrating the rest.
*
* @param {GreatIcosahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function greatIcosahedronFaces({ radius = .5 } = {}) {
	const { positions } = icosahedronFaces({ radius });
	return {
		positions,
		cells: [
			[
				5,
				4,
				9
			],
			[
				5,
				11,
				4
			],
			[
				5,
				0,
				11
			],
			[
				5,
				1,
				0
			],
			[
				5,
				9,
				1
			],
			[
				4,
				3,
				9
			],
			[
				4,
				2,
				3
			],
			[
				4,
				11,
				2
			],
			[
				6,
				7,
				8
			],
			[
				6,
				10,
				7
			],
			[
				6,
				2,
				10
			],
			[
				6,
				3,
				2
			],
			[
				6,
				8,
				3
			],
			[
				7,
				1,
				8
			],
			[
				7,
				0,
				1
			],
			[
				7,
				10,
				0
			],
			[
				1,
				9,
				8
			],
			[
				0,
				10,
				11
			],
			[
				2,
				11,
				10
			],
			[
				3,
				8,
				9
			]
		]
	};
}
/**
* @typedef {object} GreatIcosahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Great icosahedron.
*
* @param {GreatIcosahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function greatIcosahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(greatIcosahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* The regular pentagram ({5/2} star polygon)'s inner (reflex) to outer (tip)
* radius ratio, `1 / PHI ** 2`. Also used by great-stellated-dodecahedron.js,
* whose own depth-1 notches sit at the same ratio's reciprocal.
*
* @private
*/
const PENTAGRAM_RATIO = computeStarRatio(5, 2);
/**
* The 5 points of a regular pentagon's "other" star layer: point i sits between
* the given points i and i + 1, along their bisector (the sum of the two
* centroid-relative vectors, since they're 72° apart), at `ratio` times the
* given points' distance from their centroid. `PENTAGRAM_RATIO` (the {5/2} star
* polygon's inner/outer radius ratio, `1 / PHI ** 2`) yields the inner (reflex)
* pentagon of a pentagram whose tips are given; its reciprocal (`PHI ** 2`)
* yields the tips reached by extending the given pentagon's own edges until
* they meet (one stellation step).
*
* @private
* @param {number[][]} points 5 coplanar, equidistant-from-centroid points, in
*   consecutive (not skip-2/star-path) cyclic order
* @param {number} ratio
* @returns {number[][]}
*/
function computeStarLayer(points, ratio) {
	const centroid = [
		0,
		0,
		0
	];
	for (const p of points) {
		centroid[0] += p[0];
		centroid[1] += p[1];
		centroid[2] += p[2];
	}
	centroid[0] /= 5;
	centroid[1] /= 5;
	centroid[2] /= 5;
	const vectors = points.map((p) => [
		p[0] - centroid[0],
		p[1] - centroid[1],
		p[2] - centroid[2]
	]);
	const radius = Math.hypot(...vectors[0]) * ratio;
	return vectors.map((v, i) => {
		const w = vectors[(i + 1) % 5];
		const bx = v[0] + w[0];
		const by = v[1] + w[1];
		const bz = v[2] + w[2];
		const scale = radius / (Math.hypot(bx, by, bz) || 1);
		return [
			centroid[0] + bx * scale,
			centroid[1] + by * scale,
			centroid[2] + bz * scale
		];
	});
}
/**
* Decompose a regular pentagram (5-pointed star) face into 8 filled triangles:
* 5 "point" triangles plus a 3-triangle fan across the inner pentagon where its
* edges cross. The 5 vertices not given are new points, not shared with any
* other face - two star faces only ever share the given, non-computed layer.
*
* @private
* @param {number[][]} points 5 coplanar, equidistant-from-centroid points, in
*   consecutive (not skip-2/star-path) cyclic order
* @param {object} [options={}]
* @param {boolean} [options.stellate=false] `false` (default): `points` are the
*   star's outer tips, and the inner (reflex) pentagon - where the star's edges
*   cross - is computed at the regular pentagram's fixed inner/outer radius
*   ratio `1/phi^2`. `true`: `points` are instead the _inner_ pentagon (e.g. a
*   convex polyhedron's own face corners), and new outer tips are computed at
*   `phi^2` - the genuine "extend a regular pentagon's edges until they meet"
*   stellation, which needs `points`' own radius scaled up rather than a fresh
*   smaller pentagon scaled down.
* @returns {import("../../../../types.js").SimplicialComplexPolygon} 10
*   positions (tips followed by inner points, regardless of which one was
*   `points`) and 8 triangles, local indices
*/
function computePentagram(points, { stellate = false } = {}) {
	const other = computeStarLayer(points, stellate ? 1 / PENTAGRAM_RATIO : PENTAGRAM_RATIO);
	const cells = [];
	for (let i = 0; i < 5; i++) cells.push(stellate ? [
		i,
		5 + (i + 1) % 5,
		5 + i
	] : [
		i,
		5 + i,
		5 + (i + 4) % 5
	]);
	cells.push([
		5,
		6,
		7
	], [
		5,
		7,
		8
	], [
		5,
		8,
		9
	]);
	return {
		positions: stellate ? [...other, ...points] : [...points, ...other],
		cells
	};
}
/**
* Snap near-duplicate positions (mathematically identical points that ended up
* computed independently, from different local contexts, and so agree only to
* within float precision rather than bit-for-bit) onto one shared
* representative, so they weld into exact seams instead of showing up as
* cracks. Mutates each position array in place. The tolerance is relative to
* the largest coordinate so any `radius` welds equally well, and each point is
* compared against the representatives found so far (no spatial hashing, so no
* grid-boundary misses). A linear scan meant for seed-sized point sets, not
* arbitrary meshes.
*
* @private
* @param {number[][]} positions
* @param {number} [epsilon=1e-5] Relative tolerance
*/
function weldNearDuplicates(positions, epsilon = 1e-5) {
	let scale = 0;
	for (const p of positions) scale = Math.max(scale, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
	const tolerance = (scale || 1) * epsilon;
	const canonical = [];
	for (const p of positions) {
		const match = canonical.find((q) => Math.abs(p[0] - q[0]) <= tolerance && Math.abs(p[1] - q[1]) <= tolerance && Math.abs(p[2] - q[2]) <= tolerance);
		if (match === void 0) canonical.push(p);
		else {
			p[0] = match[0];
			p[1] = match[1];
			p[2] = match[2];
		}
	}
}
/**
* @private
* @callback ComputeFaceFn
* @param {number[][]} points The face's xyz vertices
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
/**
* Assemble per-face geometry fragments into one seed: each face is a group of
* indices into `vertexPositions`, handed as points to `computeFace`, whose
* local positions/cells are offset into the shared arrays. Positions that
* coincide across faces are then welded (see above) so the seed is watertight.
*
* @private
* @param {Float32Array | number[]} vertexPositions Flat xyz positions
* @param {number[][]} faces Vertex index groups
* @param {ComputeFaceFn} computeFace
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function assembleFaces(vertexPositions, faces, computeFace) {
	const point = (i) => [
		vertexPositions[i * 3],
		vertexPositions[i * 3 + 1],
		vertexPositions[i * 3 + 2]
	];
	const positions = [];
	const cells = [];
	for (const face of faces) {
		const fragment = computeFace(face.map(point));
		const offset = positions.length;
		positions.push(...fragment.positions);
		for (const cell of fragment.cells) cells.push(cell.map((i) => i + offset));
	}
	weldNearDuplicates(positions);
	return {
		positions: Float32Array.of(...positions.flat()),
		cells
	};
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} SmallStellatedDodecahedronFacesOptions
* @property {number} [radius=0.5] Radius of the shared icosahedron vertices
*/
/**
* Small stellated dodecahedron: the same 12 vertices and pentagon groupings as
* the great dodecahedron, with each face's 5 corners connected as a pentagram
* (skip-one star) instead of a convex pentagon.
*
* @param {SmallStellatedDodecahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function smallStellatedDodecahedronFaces({ radius = .5 } = {}) {
	const { positions, cells: pentagons } = greatDodecahedronFaces({ radius });
	return assembleFaces(positions, pentagons, (points) => computePentagram(points));
}
/**
* @typedef {object} SmallStellatedDodecahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Small stellated dodecahedron.
*
* @param {SmallStellatedDodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function smallStellatedDodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(smallStellatedDodecahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} GreatStellatedDodecahedronFacesOptions
* @property {number} [radius=0.5] Radius the star's tips touch (box
*   half-extent)
*/
/**
* Great stellated dodecahedron: the 3rd (outermost) stellation of the
* dodecahedron. Each face's 5 edges, extended within its own plane, first cross
* at a "depth 1" ring (exactly the icosahedron's vertex positions - small
* stellated dodecahedron's own tips) before crossing a second, further ring at
* "depth 2" - the true tips here, a plain radial scale of the dodecahedron's
* own vertices by `phi^3`.
*
* @param {GreatStellatedDodecahedronFacesOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplexPolygon}
*/
function greatStellatedDodecahedronFaces({ radius = .5 } = {}) {
	const { positions, cells: pentagons } = dodecahedronFaces({ radius: radius / PHI ** 3 });
	return assembleFaces(positions, pentagons, (vertices) => {
		const tips = vertices.map((v) => v.map((x) => x * PHI ** 3));
		const notches = computeStarLayer(vertices, 1 / PENTAGRAM_RATIO);
		const cells = [];
		for (let i = 0; i < 5; i++) cells.push([
			i,
			5 + (i + 4) % 5,
			5 + i
		]);
		cells.push([
			5,
			6,
			7
		], [
			5,
			7,
			8
		], [
			5,
			8,
			9
		]);
		return {
			positions: [...tips, ...notches],
			cells
		};
	});
}
/**
* @typedef {object} GreatStellatedDodecahedronOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=0] Barycentric grid subdivisions per
*   triangle
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.rectangular]
*/
/**
* Great stellated dodecahedron.
*
* @param {GreatStellatedDodecahedronOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function greatStellatedDodecahedron({ radius = .5, subdivisions = 0, mapping } = {}) {
	return computePolyhedron(greatStellatedDodecahedronFaces({ radius }), {
		radius,
		subdivisions,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} TetrasphereOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere built by radially projecting and welding a subdivided
* tetrahedron.
*
* @param {TetrasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function tetrasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(tetrahedronFaces({
		radius,
		center: false
	}), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} HexasphereOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere built by radially projecting and welding a subdivided
* hexahedron (cube) - an alternative to icosphere's topology, with
* cubemap-friendly UVs.
*
* @param {HexasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function hexasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(hexahedronFaces({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} OctasphereOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere built by radially projecting and welding a subdivided
* octahedron.
*
* @param {OctasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function octasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(octahedronFaces({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} DodecasphereOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere built by radially projecting and welding a subdivided
* dodecahedron
*
* @param {DodecasphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function dodecasphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(dodecahedronFaces({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

/**
* @module primitiveGeometry
* @ignore
*/
/**
* @typedef {object} IcosphereOptions
* @property {number} [radius=0.5]
* @property {number} [subdivisions=2]
* @property {"gnomonic" | "spherical"} [projection="gnomonic"]
* @property {import("../../../mappings.js").MappingFn} [mapping=mappings.spherical]
*/
/**
* A geodesic sphere built by radially projecting and welding a subdivided
* icosahedron.
*
* @param {IcosphereOptions} [options={}]
* @returns {import("../../../../types.js").SimplicialComplex}
*/
function icosphere({ radius = .5, subdivisions = 2, projection, mapping } = {}) {
	return computePolyhedron(icosahedronFaces({ radius }), {
		radius,
		subdivisions,
		project: true,
		projection,
		mapping
	});
}

var utils_exports = /* @__PURE__ */ __exportAll({
	HALF_PI: () => HALF_PI,
	PHI: () => PHI,
	PLANE_DIRECTIONS: () => PLANE_DIRECTIONS,
	SQRT2: () => SQRT2,
	SQRT3: () => SQRT3,
	SQRT6: () => SQRT6,
	TAU: () => TAU,
	TMP: () => TMP,
	centerCorners: () => centerCorners,
	chebyshev: () => chebyshev,
	clamp: () => clamp,
	clampMeridianSweep: () => clampMeridianSweep,
	computeCap: () => computeCap,
	computeChebyshevColumn: () => computeChebyshevColumn,
	computeFaceContext: () => computeFaceContext,
	computeFlatRevolutionGeometry: () => computeFlatRevolutionGeometry,
	computeGridQuad: () => computeGridQuad,
	computeOutlineEdge: () => computeOutlineEdge,
	computePlane: () => computePlane,
	computePolarGeometry: () => computePolarGeometry,
	computePolarPathGeometry: () => computePolarPathGeometry,
	computePolygonCap: () => computePolygonCap,
	computePolygonCorner: () => computePolygonCorner,
	computePolygonEdge: () => computePolygonEdge,
	computePolyhedron: () => computePolyhedron,
	computeRevolutionGeometry: () => computeRevolutionGeometry,
	computeSpindleArcRevolution: () => computeSpindleArcRevolution,
	computeStarRatio: () => computeStarRatio,
	computeSweptArc: () => computeSweptArc,
	concatGeometries: () => concatGeometries,
	cross: () => cross$1,
	dot: () => dot,
	edgePoint: () => edgePoint,
	fullscreenTriangle: () => fullscreenTriangle,
	getCellsTypedArray: () => getCellsTypedArray,
	getPlaneCoordinate: () => getPlaneCoordinate,
	getPlaneCornerReference: () => getPlaneCornerReference,
	invert: () => invert,
	isPlaneCorner: () => isPlaneCorner,
	isPlaneCornerRounded: () => isPlaneCornerRounded,
	lerp: () => lerp,
	linear: () => linear,
	normalize: () => normalize,
	point: () => point,
	power: () => power,
	remapCornerOffset: () => remapCornerOffset,
	setTypedArrayType: () => setTypedArrayType,
	signedPow: () => signedPow,
	slerp: () => slerp,
	slerpTriangle: () => slerpTriangle,
	smoothstep: () => smoothstep,
	snapToZero: () => snapToZero,
	subtract: () => subtract,
	translatePositions: () => translatePositions,
	triangulateFaces: () => triangulateFaces
});

export { annulus, annulusPath, antiprism, apple, arbelos, astroid, astroidPath, astroidalEllipsoid, barrel, bicone, box, capsule, circlePath, cone, cross, crossPath, cube, cubeFaces, cylinder, disc, dodecahedron, dodecahedronFaces, dodecasphere, doubleCone, ellipse, ellipsePath, ellipsoid, funnel, greatDodecahedron, greatDodecahedronFaces, greatIcosahedron, greatIcosahedronFaces, greatStellatedDodecahedron, greatStellatedDodecahedronFaces, hexagonalGrid, hexahedron, hexahedronFaces, hexasphere, hollowCube, hollowCylinder, hollowSphere, hyperboloid, icosahedron, icosahedronFaces, icosphere, kite, kitePath, lemon, lens, lozenge, lozengePath, lune, mappings_exports as mappings, octahedron, octahedronFaces, octasphere, paraboloid, parallelogram, parallelogramPath, plane, polygon, polygonPath, prism, quad, quadGrid, rectanglePath, reuleaux, reuleauxPath, rhombus, rhombusPath, rightTriangle, rightTrianglePath, roundedCube, roundedCylinder, roundedRectangle, roundedRectanglePath, salinon, smallStellatedDodecahedron, smallStellatedDodecahedronFaces, sphere, sphericalRing, sphericon, squarePath, squircle, squirclePath, stadium, stadiumPath, star, starPath, superegg, superellipse, superellipsePath, superellipsoid, tetrahedron, tetrahedronFaces, tetrasphere, torus, trapezoid, trapezoidPath, triangle, trianglePath, triangularGrid, triquetra, utils_exports as utils, yinYang };