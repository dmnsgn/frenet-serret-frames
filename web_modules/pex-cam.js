import { a as __toESM, t as __commonJSMin } from "./_chunks/rolldown-runtime-ppdSCyCg.js";
import { A as frustum, B as toRadians, C as scale, D as distance$1, F as perspective$1, I as set, L as clamp, M as lookAt, P as ortho, R as lerp, S as normalize, T as sub, _ as create$1, b as length, g as copy, h as add, j as invert, k as create, v as distance, w as set$1, x as multMat4, y as dot, z as toDegrees } from "./_chunks/pex-math-BqQ1rq3_.js";

/**
* An interface for cameras to extend
*/
var Camera = class {
	static get DEFAULT_OPTIONS() {
		return {
			projectionMatrix: create(),
			invViewMatrix: create(),
			viewMatrix: create(),
			position: [
				0,
				0,
				3
			],
			target: [
				0,
				0,
				0
			],
			up: [
				0,
				1,
				0
			],
			aspect: 1,
			near: .1,
			far: 100,
			view: null
		};
	}
	/**
	* Update the camera
	* @param {import("./types.js").CameraOptions} opts
	*/
	set(opts) {
		Object.assign(this, opts);
		if (opts.position || opts.target || opts.up) {
			lookAt(this.viewMatrix, this.position, this.target, this.up);
			set(this.invViewMatrix, this.viewMatrix);
			invert(this.invViewMatrix);
		}
	}
};

/**
* A class to create a perspective camera
* @augments Camera
*/
var PerspectiveCamera = class PerspectiveCamera extends Camera {
	static get DEFAULT_OPTIONS() {
		return { fov: Math.PI / 3 };
	}
	/**
	* Create an instance of PerspectiveCamera
	* @param {import("./types.js").CameraOptions & import("./types.js").PerspectiveCameraOptions} opts
	*/
	constructor(opts = {}) {
		super();
		this.set({
			...Camera.DEFAULT_OPTIONS,
			...PerspectiveCamera.DEFAULT_OPTIONS,
			...opts
		});
	}
	/**
	* Update the camera
	* @param {import("./types.js").CameraOptions & import("./types.js").PerspectiveCameraOptions} opts
	*/
	set(opts) {
		super.set(opts);
		if (opts.fov || opts.aspect || opts.near || opts.far || opts.view) {
			if (this.view) {
				const aspectRatio = this.view.totalSize[0] / this.view.totalSize[1];
				const top = Math.tan(this.fov * .5) * this.near;
				const bottom = -top;
				const left = aspectRatio * bottom;
				const right = aspectRatio * top;
				const width = Math.abs(right - left);
				const height = Math.abs(top - bottom);
				const widthNormalized = width / this.view.totalSize[0];
				const heightNormalized = height / this.view.totalSize[1];
				const l = left + this.view.offset[0] * widthNormalized;
				const r = left + (this.view.offset[0] + this.view.size[0]) * widthNormalized;
				const b = top - (this.view.offset[1] + this.view.size[1]) * heightNormalized;
				const t = top - this.view.offset[1] * heightNormalized;
				frustum(this.projectionMatrix, l, r, b, t, this.near, this.far);
			} else perspective$1(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
		}
	}
	/**
	* Create a picking ray in view (camera) coordinates
	* @param {number} x mouse x
	* @param {number} y mouse y
	* @param {number} windowWidth
	* @param {number} windowHeight
	* @returns {import("pex-geom").ray}
	*/
	getViewRay(x, y, windowWidth, windowHeight) {
		if (this.view) {
			x += this.view.offset[0];
			y += this.view.offset[1];
			windowWidth = this.view.totalSize[0];
			windowHeight = this.view.totalSize[1];
		}
		let nx = 2 * x / windowWidth - 1;
		let ny = 1 - 2 * y / windowHeight;
		const hNear = 2 * Math.tan(this.fov / 2) * this.near;
		const wNear = hNear * this.aspect;
		nx *= wNear * .5;
		ny *= hNear * .5;
		return [[
			0,
			0,
			0
		], normalize([
			nx,
			ny,
			-this.near
		])];
	}
	/**
	* Create a picking ray in world coordinates
	* @param {number} x
	* @param {number} y
	* @param {number} windowWidth
	* @param {number} windowHeight
	* @returns {import("pex-geom").ray}
	*/
	getWorldRay(x, y, windowWidth, windowHeight) {
		let ray = this.getViewRay(x, y, windowWidth, windowHeight);
		const origin = ray[0];
		const direction = ray[1];
		multMat4(origin, this.invViewMatrix);
		multMat4(direction, this.invViewMatrix);
		normalize(sub(direction, origin));
		return ray;
	}
};

/**
* A class to create an orthographic camera
* @augments Camera
*/
var OrthographicCamera = class OrthographicCamera extends Camera {
	static get DEFAULT_OPTIONS() {
		return {
			left: -1,
			right: 1,
			bottom: -1,
			top: 1,
			zoom: 1
		};
	}
	/**
	* Create an instance of PerspectiveCamera
	* @param {import("./types.js").CameraOptions & import("./types.js").OrthographicCameraOptions} opts
	*/
	constructor(opts = {}) {
		super();
		this.set({
			...Camera.DEFAULT_OPTIONS,
			...OrthographicCamera.DEFAULT_OPTIONS,
			...opts
		});
	}
	/**
	* Update the camera
	* @param {import("./types.js").CameraOptions & import("./types.js").OrthographicCameraOptions} opts
	*/
	set(opts) {
		super.set(opts);
		if (opts.left || opts.right || opts.bottom || opts.top || opts.zoom || opts.near || opts.far || opts.view) {
			const dx = (this.right - this.left) / (2 / this.zoom);
			const dy = (this.top - this.bottom) / (2 / this.zoom);
			const cx = (this.right + this.left) / 2;
			const cy = (this.top + this.bottom) / 2;
			let left = cx - dx;
			let right = cx + dx;
			let top = cy + dy;
			let bottom = cy - dy;
			if (this.view) {
				const zoomW = 1 / this.zoom / (this.view.size[0] / this.view.totalSize[0]);
				const zoomH = 1 / this.zoom / (this.view.size[1] / this.view.totalSize[1]);
				const scaleW = (this.right - this.left) / this.view.size[0];
				const scaleH = (this.top - this.bottom) / this.view.size[1];
				left += scaleW * (this.view.offset[0] / zoomW);
				right = left + scaleW * (this.view.size[0] / zoomW);
				top -= scaleH * (this.view.offset[1] / zoomH);
				bottom = top - scaleH * (this.view.size[1] / zoomH);
			}
			ortho(this.projectionMatrix, left, right, bottom, top, this.near, this.far);
		}
	}
	getViewRay(x, y, windowWidth, windowHeight) {
		if (this.view) {
			x += this.view.offset[0];
			y += this.view.offset[1];
			windowWidth = this.view.totalSize[0];
			windowHeight = this.view.totalSize[1];
		}
		return [[
			0,
			0,
			0
		], normalize([
			x * (this.right - this.left) / this.zoom / windowWidth,
			(1 - y) * (this.top - this.bottom) / this.zoom / windowHeight,
			-this.near
		])];
	}
};

/** @module ray */
/**
* Enum for different intersections values
*
* @property {number} Intersect Ray intersects the target
* @property {number} NoIntersect Ray does not intersect the target
* @property {number} SamePlane Ray lies on the same plane as the target
* @property {number} Parallel Ray is parallel to the target
* @property {number} TriangleDegenerate Triangle has zero area and cannot be
*   tested
* @readonly
* @enum {number}
*/
const Intersections = Object.freeze({
	Intersect: 1,
	NoIntersect: 0,
	SamePlane: -1,
	Parallel: -2,
	TriangleDegenerate: -2
});
const TEMP_0 = create$1();
const TEMP_1 = create$1();
const TEMP_2 = create$1();
const TEMP_3 = create$1();
const TEMP_4 = create$1();
const TEMP_5 = create$1();
const TEMP_6 = create$1();
const TEMP_7 = create$1();
/**
* Determines if a ray intersect a plane and set intersection point
*
* @param {import("./types.js").Ray} ray
* @param {import("./types.js").Plane} plane
* @param {import("pex-math").Vec3} out
* @returns {number}
* @see {@link https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm}
*/
function hitTestPlane([origin, direction], [point, normal], out = create$1()) {
	set$1(TEMP_0, origin);
	set$1(TEMP_1, direction);
	const dotDirectionNormal = dot(TEMP_1, normal);
	if (dotDirectionNormal === 0) return Intersections.SamePlane;
	set$1(TEMP_2, point);
	const t = dot(sub(TEMP_2, TEMP_0), normal) / dotDirectionNormal;
	if (t < 0) return Intersections.Parallel;
	set$1(out, add(TEMP_0, scale(TEMP_1, t)));
	return Intersections.Intersect;
}

var require_lerp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function lerp(v0, v1, t) {
		return v0 * (1 - t) + v1 * t;
	}
	module.exports = lerp;
}));

var require_interpolate_angle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var lerp = require_lerp();
	var PI = Math.PI;
	var TWO_PI = Math.PI * 2;
	function interpolateAngle(fromAngle, toAngle, t) {
		fromAngle = (fromAngle + TWO_PI) % TWO_PI;
		toAngle = (toAngle + TWO_PI) % TWO_PI;
		if (Math.abs(fromAngle - toAngle) < PI) return lerp(fromAngle, toAngle, t);
		else if (fromAngle > toAngle) {
			fromAngle = fromAngle - TWO_PI;
			return lerp(fromAngle, toAngle, t);
		} else if (toAngle > fromAngle) {
			toAngle = toAngle - TWO_PI;
			return lerp(fromAngle, toAngle, t);
		}
	}
	module.exports = interpolateAngle;
}));

var require_latlon_to_xyz = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function latLonToXyz(lat, lon, out) {
		out = out || [
			0,
			0,
			0
		];
		const phi = (lon + 90) / 180 * Math.PI;
		const theta = (90 - lat) / 180 * Math.PI;
		out[0] = Math.sin(theta) * Math.sin(phi);
		out[1] = Math.cos(theta);
		out[2] = Math.sin(theta) * Math.cos(phi);
		return out;
	}
	module.exports = latLonToXyz;
}));

var require_xyz_to_latlon = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function xyzToLatLon(normalizedPosition, out) {
		out = out || [0, 0];
		out[0] = 90 - Math.acos(normalizedPosition[1]) / Math.PI * 180;
		out[1] = -Math.atan2(normalizedPosition[2], normalizedPosition[0]) / Math.PI * 180;
		return out;
	}
	module.exports = xyzToLatLon;
}));

var require_mouse_event_offset = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var rootPosition = {
		left: 0,
		top: 0
	};
	module.exports = mouseEventOffset;
	function mouseEventOffset(ev, target, out) {
		target = target || ev.currentTarget || ev.srcElement;
		if (!Array.isArray(out)) out = [0, 0];
		var cx = ev.clientX || 0;
		var cy = ev.clientY || 0;
		var rect = getBoundingClientOffset(target);
		out[0] = cx - rect.left;
		out[1] = cy - rect.top;
		return out;
	}
	function getBoundingClientOffset(element) {
		if (element === window || element === document || element === document.body) return rootPosition;
		else return element.getBoundingClientRect();
	}
}));

var import_interpolate_angle = /* @__PURE__ */ __toESM(require_interpolate_angle(), 1);
var import_latlon_to_xyz = /* @__PURE__ */ __toESM(require_latlon_to_xyz(), 1);
var import_xyz_to_latlon = /* @__PURE__ */ __toESM(require_xyz_to_latlon(), 1);
var import_mouse_event_offset = /* @__PURE__ */ __toESM(require_mouse_event_offset(), 1);
/**
* Camera controls to orbit around a target
*/
var OrbiterControls = class OrbiterControls {
	static get DEFAULT_OPTIONS() {
		return {
			element: document,
			easing: .1,
			zoom: true,
			pan: true,
			drag: true,
			minDistance: .01,
			maxDistance: Infinity,
			minLat: -89.5,
			maxLat: 89.5,
			minLon: -Infinity,
			maxLon: Infinity,
			panSlowdown: 4,
			zoomSlowdown: 400,
			dragSlowdown: 4,
			autoUpdate: true
		};
	}
	get domElement() {
		return this.element === document ? this.element.body : this.element;
	}
	/**
	* Create an instance of OrbiterControls
	* @param {import("./types.js").OrbiterControlsOptions} opts
	*/
	constructor(opts) {
		this.lat = null;
		this.lon = null;
		this.currentLat = null;
		this.currentLon = null;
		this.distance = null;
		this.currentDistance = null;
		this.panning = false;
		this.dragging = false;
		this.zooming = false;
		this.width = 0;
		this.height = 0;
		this.zoomTouchDistance = null;
		this.panPlane = null;
		this.clickTarget = [
			0,
			0,
			0
		];
		this.clickPosWorld = [
			0,
			0,
			0
		];
		this.clickPosPlane = [
			0,
			0,
			0
		];
		this.dragPos = [
			0,
			0,
			0
		];
		this.dragPosWorld = [
			0,
			0,
			0
		];
		this.dragPosPlane = [
			0,
			0,
			0
		];
		this.set({
			...OrbiterControls.DEFAULT_OPTIONS,
			...opts
		});
		this.setup();
	}
	/**
	* Update the control
	* @param {import("./types.js").OrbiterOptions} opts
	*/
	set(opts) {
		Object.assign(this, opts);
		if (opts.camera) {
			const latLon = (0, import_xyz_to_latlon.default)(normalize(sub(copy(opts.camera.position), opts.camera.target)));
			const distance$2 = opts.distance || distance(opts.camera.position, opts.camera.target);
			this.lat = latLon[0];
			this.lon = latLon[1];
			this.currentLat = this.lat;
			this.currentLon = this.lon;
			this.distance = distance$2;
			this.currentDistance = this.distance;
		}
		if (Object.getOwnPropertyDescriptor(opts, "autoUpdate")) {
			if (this.autoUpdate) {
				const self = this;
				this.rafHandle = requestAnimationFrame(function tick() {
					self.updateCamera();
					if (self.autoUpdate) self.rafHandle = requestAnimationFrame(tick);
				});
			} else if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
		}
	}
	updateCamera() {
		if (!this.camera) return;
		const position = this.camera.position;
		const target = this.camera.target;
		this.lat = clamp(this.lat, this.minLat, this.maxLat);
		if (this.minLon !== -Infinity && this.maxLon !== Infinity) this.lon = clamp(this.lon, this.minLon, this.maxLon) % 360;
		this.currentLat = toDegrees((0, import_interpolate_angle.default)((toRadians(this.currentLat) + 2 * Math.PI) % (2 * Math.PI), (toRadians(this.lat) + 2 * Math.PI) % (2 * Math.PI), this.easing));
		this.currentLon += (this.lon - this.currentLon) * this.easing;
		this.currentDistance = lerp(this.currentDistance, this.distance, this.easing);
		(0, import_latlon_to_xyz.default)(this.currentLat, this.currentLon, position);
		scale(position, this.currentDistance);
		add(position, target);
		if (this.camera.zoom !== void 0) this.camera.set({ zoom: length(position) });
		this.camera.set({ position });
	}
	updateWindowSize() {
		const width = this.domElement.clientWidth || this.domElement.innerWidth;
		const height = this.domElement.clientHeight || this.domElement.innerHeight;
		if (width !== this.width) this.width = width;
		if (height !== this.height) this.height = height;
	}
	handleDragStart(position) {
		this.dragging = true;
		this.dragPos = position;
	}
	handlePanZoomStart(touch0, touch1) {
		this.dragging = false;
		if (this.zoom && touch1) {
			this.zooming = true;
			this.zoomTouchDistance = distance$1(touch1, touch0);
		}
		const camera = this.camera;
		if (this.pan && camera) {
			this.panning = true;
			this.updateWindowSize();
			const clickPosWindow = touch1 ? [(touch0[0] + touch1[0]) * .5, (touch0[1] + touch1[1]) * .5] : touch0;
			set$1(this.clickTarget, camera.target);
			const targetInViewSpace = multMat4(copy(this.clickTarget), camera.viewMatrix);
			this.panPlane = [targetInViewSpace, [
				0,
				0,
				1
			]];
			hitTestPlane(camera.getViewRay(clickPosWindow[0], clickPosWindow[1], this.width, this.height), this.panPlane, this.clickPosPlane);
		}
	}
	handleDragMove(position) {
		const dx = position[0] - this.dragPos[0];
		const dy = position[1] - this.dragPos[1];
		this.lat += dy / this.dragSlowdown;
		this.lon -= dx / this.dragSlowdown;
		this.dragPos = position;
	}
	handlePanZoomMove(touch0, touch1) {
		if (this.zoom && touch1) {
			const distance = distance$1(touch1, touch0);
			this.handleZoom(this.zoomTouchDistance - distance);
			this.zoomTouchDistance = distance;
		}
		const camera = this.camera;
		if (this.pan && camera && this.panPlane) {
			const dragPosWindow = touch1 ? [(touch0[0] + touch1[0]) * .5, (touch0[1] + touch1[1]) * .5] : touch0;
			hitTestPlane(camera.getViewRay(dragPosWindow[0], dragPosWindow[1], this.width, this.height), this.panPlane, this.dragPosPlane);
			multMat4(set$1(this.clickPosWorld, this.clickPosPlane), camera.invViewMatrix);
			multMat4(set$1(this.dragPosWorld, this.dragPosPlane), camera.invViewMatrix);
			const diffWorld = sub(copy(this.dragPosWorld), this.clickPosWorld);
			camera.set({
				distance: this.distance,
				target: sub(copy(this.clickTarget), diffWorld)
			});
		}
	}
	handleZoom(dy) {
		this.distance *= 1 + dy / this.zoomSlowdown;
		this.distance = clamp(this.distance, this.minDistance, this.maxDistance);
	}
	handleEnd() {
		this.dragging = false;
		this.panning = false;
		this.zooming = false;
		this.panPlane = null;
	}
	setup() {
		this.onPointerDown = (event) => {
			const pan = event.ctrlKey || event.metaKey || event.shiftKey || event.touches && event.touches.length === 2;
			const touch0 = (0, import_mouse_event_offset.default)(event.touches ? event.touches[0] : event, this.domElement);
			if (this.drag && !pan) this.handleDragStart(touch0);
			else if ((this.pan || this.zoom) && pan) {
				const touch1 = event.touches && (0, import_mouse_event_offset.default)(event.touches[1], this.domElement);
				this.handlePanZoomStart(touch0, touch1);
			}
		};
		this.onPointerMove = (event) => {
			const touch0 = (0, import_mouse_event_offset.default)(event.touches ? event.touches[0] : event, this.domElement);
			if (this.dragging) this.handleDragMove(touch0);
			else if (this.panning || this.zooming) {
				if (event.touches && !event.touches[1]) return;
				const touch1 = event.touches && (0, import_mouse_event_offset.default)(event.touches[1], this.domElement);
				this.handlePanZoomMove(touch0, touch1);
			}
		};
		this.onPointerUp = () => {
			this.handleEnd();
		};
		this.onTouchStart = (event) => {
			event.preventDefault();
			if (event.touches.length <= 2) this.onPointerDown(event);
		};
		this.onTouchMove = (event) => {
			event.cancelable && event.preventDefault();
			if (event.touches.length <= 2) this.onPointerMove(event);
		};
		this.onWheel = (event) => {
			if (!this.zoom) return;
			event.preventDefault();
			this.handleZoom(event.deltaY);
		};
		this.element.addEventListener("pointerdown", this.onPointerDown);
		this.element.addEventListener("wheel", this.onWheel, { passive: false });
		document.addEventListener("pointermove", this.onPointerMove);
		document.addEventListener("pointerup", this.onPointerUp);
		this.domElement.style.touchAction = "none";
	}
	/**
	* Remove all event listeners
	*/
	dispose() {
		if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
		this.element.removeEventListener("pointerdown", this.onPointerDown);
		this.element.removeEventListener("wheel", this.onWheel);
		document.removeEventListener("pointermove", this.onPointerMove);
		document.removeEventListener("pointerup", this.onPointerUp);
	}
};

/**
* Re-export classes and factory functions
* @module pex-cam
*/
/**
* Factory function for perspective camera
* @param {import("./types.js").CameraOptions & import("./types.js").PerspectiveCameraOptions} opts
* @returns {PerspectiveCamera}
*/
const perspective = (opts) => new PerspectiveCamera(opts);
/**
* Factory function for orthographic camera
* @param {import("./types.js").CameraOptions & import("./types.js").OrthographicCameraOptions} opts
* @returns {OrthographicCamera}
*/
const orthographic = (opts) => new OrthographicCamera(opts);
/**
* Factory function for orbiter controls
* @param {import("./types.js").OrbiterControlsOptions} opts
* @returns {OrbiterControls}
*/
const orbiter = (opts) => new OrbiterControls(opts);

export { OrbiterControls, OrthographicCamera, PerspectiveCamera, orbiter, orthographic, perspective };