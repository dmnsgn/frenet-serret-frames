import { a as addScaled, c as length, d as set, f as sub, l as normalize, s as distanceSq, u as scale } from "./_chunks/pex-math-BqQ1rq3_.js";

/** @module utils */
const DELTAS = /* @__PURE__ */ new Float64Array(6);
const uniform = () => 1;
const centripetal = (deltas, i) => Math.sqrt(length(deltas, i));
const chordal = (deltas, i) => length(deltas, i);
/**
* Parameter spacing functions of the parabola methods.
*
* @type {Record<
*   "uniform" | "centripetal" | "chordal",
*   import("./types.js").Spacing
* >}
*/
const SPACINGS = {
	uniform,
	centripetal,
	chordal
};
/**
* Set `out[i]` to the delta from `points[from]` to `points[to]`.
*
* @param {import("pex-math").TypedArray | number[]} out
* @param {number} i
* @param {import("pex-math").TypedArray | number[]} points Flat points.
* @param {number} from
* @param {number} to
*/
function setDelta(out, i, points, from, to) {
	set(out, i, points, to);
	sub(out, i, points, from);
}
/**
* Set `out[i]` to the derivative at x₁ of the parabola through x₀, x₁, x₂.
*
* @param {import("pex-math").TypedArray | number[]} out
* @param {number} i
* @param {import("pex-math").TypedArray} deltas Flat deltas x₀→x₁ and x₁→x₂.
* @param {number} a Spacing of x₀→x₁.
* @param {number} b Spacing of x₁→x₂.
*/
function parabolaMiddleTangent(out, i, deltas, a, b) {
	set(out, i, deltas, 0);
	scale(out, i, b / a);
	addScaled(out, i, deltas, 1, a / b);
}
/**
* Set `out[i]` to the derivative at x₀ of the parabola through x₀, x₁, x₂.
*
* @param {import("pex-math").TypedArray | number[]} out
* @param {number} i
* @param {import("pex-math").TypedArray} deltas Flat deltas x₀→x₁ and x₁→x₂.
* @param {number} a Spacing of x₀→x₁.
* @param {number} b Spacing of x₁→x₂.
*/
function parabolaEndTangent(out, i, deltas, a, b) {
	set(out, i, deltas, 0);
	scale(out, i, (2 * a + b) / (a * (a + b)));
	addScaled(out, i, deltas, 1, -a / (b * (a + b)));
}
/**
* Compute the previous and next distinct point of each point, -1 when there is
* none.
*
* @param {import("pex-math").TypedArray | number[]} points Flat points.
* @param {number} size Number of points.
* @param {boolean} closed
* @returns {import("./types.js").Neighbours}
*/
function computeNeighbours(points, size, closed) {
	const prev = new Int32Array(size).fill(-1);
	const next = new Int32Array(size).fill(-1);
	for (let i = size - 2; i >= 0; i--) next[i] = distanceSq(points, i, points, i + 1) ? i + 1 : next[i + 1];
	for (let i = 1; i < size; i++) prev[i] = distanceSq(points, i, points, i - 1) ? i - 1 : prev[i - 1];
	if (closed && size > 1) {
		const wrapNext = distanceSq(points, size - 1, points, 0) ? 0 : next[0];
		const wrapPrev = distanceSq(points, 0, points, size - 1) ? size - 1 : prev[size - 1];
		for (let i = size - 1; i >= 0 && next[i] === -1; i--) next[i] = wrapNext;
		for (let i = 0; i < size && prev[i] === -1; i++) prev[i] = wrapPrev;
	}
	return {
		prev,
		next
	};
}
/**
* Set `out[i]` to the direction of the segment starting at point `i`, or ending
* there for the last point of open paths.
*
* @param {import("pex-math").TypedArray | number[]} out
* @param {import("pex-math").TypedArray | number[]} points Flat points.
* @param {import("./types.js").Neighbours} neighbours
* @param {number} i
*/
function forwardTangent(out, points, { prev, next }, i) {
	if (next[i] !== -1) setDelta(out, i, points, i, next[i]);
	else if (prev[i] !== -1) setDelta(out, i, points, prev[i], i);
}
/**
* Set `out[i]` to the derivative at point `i` of the parabola through it and
* its two neighbours.
*
* @param {import("pex-math").TypedArray | number[]} out
* @param {import("pex-math").TypedArray | number[]} points Flat points.
* @param {import("./types.js").Neighbours} neighbours
* @param {number} i
* @param {import("./types.js").Spacing} spacing
*/
function parabolaTangent(out, points, neighbours, i, spacing) {
	const prev = neighbours.prev[i];
	const next = neighbours.next[i];
	if (prev !== -1 && next !== -1) {
		setDelta(DELTAS, 0, points, prev, i);
		setDelta(DELTAS, 1, points, i, next);
		const a = spacing(DELTAS, 0);
		const b = spacing(DELTAS, 1);
		parabolaMiddleTangent(out, i, DELTAS, a, b);
		const scale = b / a * length(DELTAS, 0) + a / b * length(DELTAS, 1);
		if (length(out, i) <= Number.EPSILON * scale) set(out, i, DELTAS, 1);
		return;
	}
	const isStart = next !== -1;
	const p1 = isStart ? next : prev;
	if (p1 === -1) return;
	const p2 = isStart ? neighbours.next[p1] : neighbours.prev[p1];
	if (p2 === -1) {
		setDelta(out, i, points, isStart ? i : p1, isStart ? p1 : i);
		return;
	}
	setDelta(DELTAS, 0, points, i, p1);
	setDelta(DELTAS, 1, points, p1, p2);
	parabolaEndTangent(out, i, DELTAS, spacing(DELTAS, 0), spacing(DELTAS, 1));
	if (!isStart) scale(out, i, -1);
}

/** @module path-tangents */
/**
* Compute tangents for a path of 3D points.
*
* @param {import("./types.js").Path} path Simplicial complex geometry
*   positions.
* @param {import("./types.js").Options} [options={}]
* @returns {import("./types.js").Tangents}
* @alias module:path-tangents
*/
const pathTangents = (path, options) => {
	const { closed = false, method = "chordal" } = { ...options };
	const spacing = SPACINGS[method];
	const isFlatArray = !path[0]?.length;
	const size = path.length / (isFlatArray ? 3 : 1);
	const points = isFlatArray ? path : new Float64Array(size * 3);
	if (!isFlatArray) path.forEach((point, i) => set(points, i, point, 0));
	const neighbours = computeNeighbours(points, size, closed);
	const tangents = new Float64Array(size * 3);
	for (let i = 0; i < size; i++) {
		if (spacing) parabolaTangent(tangents, points, neighbours, i, spacing);
		else forwardTangent(tangents, points, neighbours, i);
		normalize(tangents, i);
	}
	if (path instanceof Float64Array) return tangents;
	return isFlatArray ? new Float32Array(tangents) : Array.from({ length: size }, (_, i) => [
		tangents[i * 3],
		tangents[i * 3 + 1],
		tangents[i * 3 + 2]
	]);
};

export { SPACINGS, computeNeighbours, pathTangents as default, forwardTangent, parabolaEndTangent, parabolaMiddleTangent, parabolaTangent, setDelta };