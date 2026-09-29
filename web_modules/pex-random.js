import { a as __toESM, i as __toCommonJS, t as __commonJSMin } from "./_chunks/rolldown-runtime-ppdSCyCg.js";
import { n as init__polyfill_node_crypto, t as _polyfill_node_crypto_exports } from "./_chunks/polyfills-BJy1ROkH.js";

var require_alea = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, module$6, define) {
		function Alea(seed) {
			var me = this, mash = Mash();
			me.next = function() {
				var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
				me.s0 = me.s1;
				me.s1 = me.s2;
				return me.s2 = t - (me.c = t | 0);
			};
			me.c = 1;
			me.s0 = mash(" ");
			me.s1 = mash(" ");
			me.s2 = mash(" ");
			me.s0 -= mash(seed);
			if (me.s0 < 0) me.s0 += 1;
			me.s1 -= mash(seed);
			if (me.s1 < 0) me.s1 += 1;
			me.s2 -= mash(seed);
			if (me.s2 < 0) me.s2 += 1;
			mash = null;
		}
		function copy(f, t) {
			t.c = f.c;
			t.s0 = f.s0;
			t.s1 = f.s1;
			t.s2 = f.s2;
			return t;
		}
		function impl(seed, opts) {
			var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
			prng.int32 = function() {
				return xg.next() * 4294967296 | 0;
			};
			prng.double = function() {
				return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
			};
			prng.quick = prng;
			if (state) {
				if (typeof state == "object") copy(state, xg);
				prng.state = function() {
					return copy(xg, {});
				};
			}
			return prng;
		}
		function Mash() {
			var n = 4022871197;
			var mash = function(data) {
				data = String(data);
				for (var i = 0; i < data.length; i++) {
					n += data.charCodeAt(i);
					var h = .02519603282416938 * n;
					n = h >>> 0;
					h -= n;
					h *= n;
					n = h >>> 0;
					h -= n;
					n += h * 4294967296;
				}
				return (n >>> 0) * 23283064365386963e-26;
			};
			return mash;
		}
		if (module$6 && module$6.exports) module$6.exports = impl;
		else if (define && define.amd) define(function() {
			return impl;
		});
		else this.alea = impl;
	})(exports, typeof module == "object" && module, typeof define == "function" && define);
}));

var require_xor128 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, module$5, define) {
		function XorGen(seed) {
			var me = this, strseed = "";
			me.x = 0;
			me.y = 0;
			me.z = 0;
			me.w = 0;
			me.next = function() {
				var t = me.x ^ me.x << 11;
				me.x = me.y;
				me.y = me.z;
				me.z = me.w;
				return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
			};
			if (seed === (seed | 0)) me.x = seed;
			else strseed += seed;
			for (var k = 0; k < strseed.length + 64; k++) {
				me.x ^= strseed.charCodeAt(k) | 0;
				me.next();
			}
		}
		function copy(f, t) {
			t.x = f.x;
			t.y = f.y;
			t.z = f.z;
			t.w = f.w;
			return t;
		}
		function impl(seed, opts) {
			var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
				return (xg.next() >>> 0) / 4294967296;
			};
			prng.double = function() {
				do
					var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);
				while (result === 0);
				return result;
			};
			prng.int32 = xg.next;
			prng.quick = prng;
			if (state) {
				if (typeof state == "object") copy(state, xg);
				prng.state = function() {
					return copy(xg, {});
				};
			}
			return prng;
		}
		if (module$5 && module$5.exports) module$5.exports = impl;
		else if (define && define.amd) define(function() {
			return impl;
		});
		else this.xor128 = impl;
	})(exports, typeof module == "object" && module, typeof define == "function" && define);
}));

var require_xorwow = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, module$4, define) {
		function XorGen(seed) {
			var me = this, strseed = "";
			me.next = function() {
				var t = me.x ^ me.x >>> 2;
				me.x = me.y;
				me.y = me.z;
				me.z = me.w;
				me.w = me.v;
				return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
			};
			me.x = 0;
			me.y = 0;
			me.z = 0;
			me.w = 0;
			me.v = 0;
			if (seed === (seed | 0)) me.x = seed;
			else strseed += seed;
			for (var k = 0; k < strseed.length + 64; k++) {
				me.x ^= strseed.charCodeAt(k) | 0;
				if (k == strseed.length) me.d = me.x << 10 ^ me.x >>> 4;
				me.next();
			}
		}
		function copy(f, t) {
			t.x = f.x;
			t.y = f.y;
			t.z = f.z;
			t.w = f.w;
			t.v = f.v;
			t.d = f.d;
			return t;
		}
		function impl(seed, opts) {
			var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
				return (xg.next() >>> 0) / 4294967296;
			};
			prng.double = function() {
				do
					var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);
				while (result === 0);
				return result;
			};
			prng.int32 = xg.next;
			prng.quick = prng;
			if (state) {
				if (typeof state == "object") copy(state, xg);
				prng.state = function() {
					return copy(xg, {});
				};
			}
			return prng;
		}
		if (module$4 && module$4.exports) module$4.exports = impl;
		else if (define && define.amd) define(function() {
			return impl;
		});
		else this.xorwow = impl;
	})(exports, typeof module == "object" && module, typeof define == "function" && define);
}));

var require_xorshift7 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, module$3, define) {
		function XorGen(seed) {
			var me = this;
			me.next = function() {
				var X = me.x, i = me.i, t = X[i], v;
				t ^= t >>> 7;
				v = t ^ t << 24;
				t = X[i + 1 & 7];
				v ^= t ^ t >>> 10;
				t = X[i + 3 & 7];
				v ^= t ^ t >>> 3;
				t = X[i + 4 & 7];
				v ^= t ^ t << 7;
				t = X[i + 7 & 7];
				t = t ^ t << 13;
				v ^= t ^ t << 9;
				X[i] = v;
				me.i = i + 1 & 7;
				return v;
			};
			function init(me, seed) {
				var j, X = [];
				if (seed === (seed | 0)) X[0] = seed;
				else {
					seed = "" + seed;
					for (j = 0; j < seed.length; ++j) X[j & 7] = X[j & 7] << 15 ^ seed.charCodeAt(j) + X[j + 1 & 7] << 13;
				}
				while (X.length < 8) X.push(0);
				for (j = 0; j < 8 && X[j] === 0; ++j);
				if (j == 8) X[7] = -1;
				else X[j];
				me.x = X;
				me.i = 0;
				for (j = 256; j > 0; --j) me.next();
			}
			init(me, seed);
		}
		function copy(f, t) {
			t.x = f.x.slice();
			t.i = f.i;
			return t;
		}
		function impl(seed, opts) {
			if (seed == null) seed = +/* @__PURE__ */ new Date();
			var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
				return (xg.next() >>> 0) / 4294967296;
			};
			prng.double = function() {
				do
					var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);
				while (result === 0);
				return result;
			};
			prng.int32 = xg.next;
			prng.quick = prng;
			if (state) {
				if (state.x) copy(state, xg);
				prng.state = function() {
					return copy(xg, {});
				};
			}
			return prng;
		}
		if (module$3 && module$3.exports) module$3.exports = impl;
		else if (define && define.amd) define(function() {
			return impl;
		});
		else this.xorshift7 = impl;
	})(exports, typeof module == "object" && module, typeof define == "function" && define);
}));

var require_xor4096 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, module$2, define) {
		function XorGen(seed) {
			var me = this;
			me.next = function() {
				var w = me.w, X = me.X, i = me.i, t, v;
				me.w = w = w + 1640531527 | 0;
				v = X[i + 34 & 127];
				t = X[i = i + 1 & 127];
				v ^= v << 13;
				t ^= t << 17;
				v ^= v >>> 15;
				t ^= t >>> 12;
				v = X[i] = v ^ t;
				me.i = i;
				return v + (w ^ w >>> 16) | 0;
			};
			function init(me, seed) {
				var t, v, i, j, w, X = [], limit = 128;
				if (seed === (seed | 0)) {
					v = seed;
					seed = null;
				} else {
					seed = seed + "\0";
					v = 0;
					limit = Math.max(limit, seed.length);
				}
				for (i = 0, j = -32; j < limit; ++j) {
					if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
					if (j === 0) w = v;
					v ^= v << 10;
					v ^= v >>> 15;
					v ^= v << 4;
					v ^= v >>> 13;
					if (j >= 0) {
						w = w + 1640531527 | 0;
						t = X[j & 127] ^= v + w;
						i = 0 == t ? i + 1 : 0;
					}
				}
				if (i >= 128) X[(seed && seed.length || 0) & 127] = -1;
				i = 127;
				for (j = 512; j > 0; --j) {
					v = X[i + 34 & 127];
					t = X[i = i + 1 & 127];
					v ^= v << 13;
					t ^= t << 17;
					v ^= v >>> 15;
					t ^= t >>> 12;
					X[i] = v ^ t;
				}
				me.w = w;
				me.X = X;
				me.i = i;
			}
			init(me, seed);
		}
		function copy(f, t) {
			t.i = f.i;
			t.w = f.w;
			t.X = f.X.slice();
			return t;
		}
		function impl(seed, opts) {
			if (seed == null) seed = +/* @__PURE__ */ new Date();
			var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
				return (xg.next() >>> 0) / 4294967296;
			};
			prng.double = function() {
				do
					var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);
				while (result === 0);
				return result;
			};
			prng.int32 = xg.next;
			prng.quick = prng;
			if (state) {
				if (state.X) copy(state, xg);
				prng.state = function() {
					return copy(xg, {});
				};
			}
			return prng;
		}
		if (module$2 && module$2.exports) module$2.exports = impl;
		else if (define && define.amd) define(function() {
			return impl;
		});
		else this.xor4096 = impl;
	})(exports, typeof module == "object" && module, typeof define == "function" && define);
}));

var require_tychei = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, module$1, define) {
		function XorGen(seed) {
			var me = this, strseed = "";
			me.next = function() {
				var b = me.b, c = me.c, d = me.d, a = me.a;
				b = b << 25 ^ b >>> 7 ^ c;
				c = c - d | 0;
				d = d << 24 ^ d >>> 8 ^ a;
				a = a - b | 0;
				me.b = b = b << 20 ^ b >>> 12 ^ c;
				me.c = c = c - d | 0;
				me.d = d << 16 ^ c >>> 16 ^ a;
				return me.a = a - b | 0;
			};
			me.a = 0;
			me.b = 0;
			me.c = -1640531527;
			me.d = 1367130551;
			if (seed === Math.floor(seed)) {
				me.a = seed / 4294967296 | 0;
				me.b = seed | 0;
			} else strseed += seed;
			for (var k = 0; k < strseed.length + 20; k++) {
				me.b ^= strseed.charCodeAt(k) | 0;
				me.next();
			}
		}
		function copy(f, t) {
			t.a = f.a;
			t.b = f.b;
			t.c = f.c;
			t.d = f.d;
			return t;
		}
		function impl(seed, opts) {
			var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
				return (xg.next() >>> 0) / 4294967296;
			};
			prng.double = function() {
				do
					var result = ((xg.next() >>> 11) + (xg.next() >>> 0) / 4294967296) / (1 << 21);
				while (result === 0);
				return result;
			};
			prng.int32 = xg.next;
			prng.quick = prng;
			if (state) {
				if (typeof state == "object") copy(state, xg);
				prng.state = function() {
					return copy(xg, {});
				};
			}
			return prng;
		}
		if (module$1 && module$1.exports) module$1.exports = impl;
		else if (define && define.amd) define(function() {
			return impl;
		});
		else this.tychei = impl;
	})(exports, typeof module == "object" && module, typeof define == "function" && define);
}));

var require_seedrandom$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(global, pool, math) {
		var width = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto;
		function seedrandom(seed, options, callback) {
			var key = [];
			options = options == true ? { entropy: true } : options || {};
			var shortseed = mixkey(flatten(options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed, 3), key);
			var arc4 = new ARC4(key);
			var prng = function() {
				var n = arc4.g(chunks), d = startdenom, x = 0;
				while (n < significance) {
					n = (n + x) * width;
					d *= width;
					x = arc4.g(1);
				}
				while (n >= overflow) {
					n /= 2;
					d /= 2;
					x >>>= 1;
				}
				return (n + x) / d;
			};
			prng.int32 = function() {
				return arc4.g(4) | 0;
			};
			prng.quick = function() {
				return arc4.g(4) / 4294967296;
			};
			prng.double = prng;
			mixkey(tostring(arc4.S), pool);
			return (options.pass || callback || function(prng, seed, is_math_call, state) {
				if (state) {
					if (state.S) copy(state, arc4);
					prng.state = function() {
						return copy(arc4, {});
					};
				}
				if (is_math_call) {
					math[rngname] = prng;
					return seed;
				} else return prng;
			})(prng, shortseed, "global" in options ? options.global : this == math, options.state);
		}
		function ARC4(key) {
			var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
			if (!keylen) key = [keylen++];
			while (i < width) s[i] = i++;
			for (i = 0; i < width; i++) {
				s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
				s[j] = t;
			}
			(me.g = function(count) {
				var t, r = 0, i = me.i, j = me.j, s = me.S;
				while (count--) {
					t = s[i = mask & i + 1];
					r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
				}
				me.i = i;
				me.j = j;
				return r;
			})(width);
		}
		function copy(f, t) {
			t.i = f.i;
			t.j = f.j;
			t.S = f.S.slice();
			return t;
		}
		function flatten(obj, depth) {
			var result = [], typ = typeof obj, prop;
			if (depth && typ == "object") for (prop in obj) try {
				result.push(flatten(obj[prop], depth - 1));
			} catch (e) {}
			return result.length ? result : typ == "string" ? obj : obj + "\0";
		}
		function mixkey(seed, key) {
			var stringseed = seed + "", smear, j = 0;
			while (j < stringseed.length) key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
			return tostring(key);
		}
		function autoseed() {
			try {
				var out;
				if (nodecrypto && (out = nodecrypto.randomBytes)) out = out(width);
				else {
					out = new Uint8Array(width);
					(global.crypto || global.msCrypto).getRandomValues(out);
				}
				return tostring(out);
			} catch (e) {
				var browser = global.navigator, plugins = browser && browser.plugins;
				return [
					+/* @__PURE__ */ new Date(),
					global,
					plugins,
					global.screen,
					tostring(pool)
				];
			}
		}
		function tostring(a) {
			return String.fromCharCode.apply(0, a);
		}
		mixkey(math.random(), pool);
		if (typeof module == "object" && module.exports) {
			module.exports = seedrandom;
			try {
				nodecrypto = (init__polyfill_node_crypto(), __toCommonJS(_polyfill_node_crypto_exports));
			} catch (ex) {}
		} else if (typeof define == "function" && define.amd) define(function() {
			return seedrandom;
		});
		else math["seed" + rngname] = seedrandom;
	})(typeof self !== "undefined" ? self : exports, [], Math);
}));

var require_seedrandom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var alea = require_alea();
	var xor128 = require_xor128();
	var xorwow = require_xorwow();
	var xorshift7 = require_xorshift7();
	var xor4096 = require_xor4096();
	var tychei = require_tychei();
	var sr = require_seedrandom$1();
	sr.alea = alea;
	sr.xor128 = xor128;
	sr.xorwow = xorwow;
	sr.xorshift7 = xorshift7;
	sr.xor4096 = xor4096;
	sr.tychei = tychei;
	module.exports = sr;
}));

var import_seedrandom = /* @__PURE__ */ __toESM(require_seedrandom(), 1);
const SQRT3 = /*#__PURE__*/ Math.sqrt(3);
const SQRT5 = /*#__PURE__*/ Math.sqrt(5);
const F2 = .5 * (SQRT3 - 1);
const G2 = (3 - SQRT3) / 6;
const F3 = 1 / 3;
const G3 = 1 / 6;
const F4 = (SQRT5 - 1) / 4;
const G4 = (5 - SQRT5) / 20;
const fastFloor = (x) => Math.floor(x) | 0;
const grad2 = /*#__PURE__*/ new Float64Array([
	1,
	1,
	-1,
	1,
	1,
	-1,
	-1,
	-1,
	1,
	0,
	-1,
	0,
	1,
	0,
	-1,
	0,
	0,
	1,
	0,
	-1,
	0,
	1,
	0,
	-1
]);
const grad3 = /*#__PURE__*/ new Float64Array([
	1,
	1,
	0,
	-1,
	1,
	0,
	1,
	-1,
	0,
	-1,
	-1,
	0,
	1,
	0,
	1,
	-1,
	0,
	1,
	1,
	0,
	-1,
	-1,
	0,
	-1,
	0,
	1,
	1,
	0,
	-1,
	1,
	0,
	1,
	-1,
	0,
	-1,
	-1
]);
const grad4 = /*#__PURE__*/ new Float64Array([
	0,
	1,
	1,
	1,
	0,
	1,
	1,
	-1,
	0,
	1,
	-1,
	1,
	0,
	1,
	-1,
	-1,
	0,
	-1,
	1,
	1,
	0,
	-1,
	1,
	-1,
	0,
	-1,
	-1,
	1,
	0,
	-1,
	-1,
	-1,
	1,
	0,
	1,
	1,
	1,
	0,
	1,
	-1,
	1,
	0,
	-1,
	1,
	1,
	0,
	-1,
	-1,
	-1,
	0,
	1,
	1,
	-1,
	0,
	1,
	-1,
	-1,
	0,
	-1,
	1,
	-1,
	0,
	-1,
	-1,
	1,
	1,
	0,
	1,
	1,
	1,
	0,
	-1,
	1,
	-1,
	0,
	1,
	1,
	-1,
	0,
	-1,
	-1,
	1,
	0,
	1,
	-1,
	1,
	0,
	-1,
	-1,
	-1,
	0,
	1,
	-1,
	-1,
	0,
	-1,
	1,
	1,
	1,
	0,
	1,
	1,
	-1,
	0,
	1,
	-1,
	1,
	0,
	1,
	-1,
	-1,
	0,
	-1,
	1,
	1,
	0,
	-1,
	1,
	-1,
	0,
	-1,
	-1,
	1,
	0,
	-1,
	-1,
	-1,
	0
]);
/**
* Creates a 2D noise function
* @param random the random function that will be used to build the permutation table
* @returns {NoiseFunction2D}
*/
function createNoise2D(random = Math.random) {
	const perm = buildPermutationTable(random);
	const permGrad2x = new Float64Array(perm).map((v) => grad2[v % 12 * 2]);
	const permGrad2y = new Float64Array(perm).map((v) => grad2[v % 12 * 2 + 1]);
	return function noise2D(x, y) {
		let n0 = 0;
		let n1 = 0;
		let n2 = 0;
		const s = (x + y) * F2;
		const i = fastFloor(x + s);
		const j = fastFloor(y + s);
		const t = (i + j) * G2;
		const X0 = i - t;
		const Y0 = j - t;
		const x0 = x - X0;
		const y0 = y - Y0;
		let i1, j1;
		if (x0 > y0) {
			i1 = 1;
			j1 = 0;
		} else {
			i1 = 0;
			j1 = 1;
		}
		const x1 = x0 - i1 + G2;
		const y1 = y0 - j1 + G2;
		const x2 = x0 - 1 + 2 * G2;
		const y2 = y0 - 1 + 2 * G2;
		const ii = i & 255;
		const jj = j & 255;
		let t0 = .5 - x0 * x0 - y0 * y0;
		if (t0 >= 0) {
			const gi0 = ii + perm[jj];
			const g0x = permGrad2x[gi0];
			const g0y = permGrad2y[gi0];
			t0 *= t0;
			n0 = t0 * t0 * (g0x * x0 + g0y * y0);
		}
		let t1 = .5 - x1 * x1 - y1 * y1;
		if (t1 >= 0) {
			const gi1 = ii + i1 + perm[jj + j1];
			const g1x = permGrad2x[gi1];
			const g1y = permGrad2y[gi1];
			t1 *= t1;
			n1 = t1 * t1 * (g1x * x1 + g1y * y1);
		}
		let t2 = .5 - x2 * x2 - y2 * y2;
		if (t2 >= 0) {
			const gi2 = ii + 1 + perm[jj + 1];
			const g2x = permGrad2x[gi2];
			const g2y = permGrad2y[gi2];
			t2 *= t2;
			n2 = t2 * t2 * (g2x * x2 + g2y * y2);
		}
		return 70 * (n0 + n1 + n2);
	};
}
/**
* Creates a 3D noise function
* @param random the random function that will be used to build the permutation table
* @returns {NoiseFunction3D}
*/
function createNoise3D(random = Math.random) {
	const perm = buildPermutationTable(random);
	const permGrad3x = new Float64Array(perm).map((v) => grad3[v % 12 * 3]);
	const permGrad3y = new Float64Array(perm).map((v) => grad3[v % 12 * 3 + 1]);
	const permGrad3z = new Float64Array(perm).map((v) => grad3[v % 12 * 3 + 2]);
	return function noise3D(x, y, z) {
		let n0, n1, n2, n3;
		const s = (x + y + z) * F3;
		const i = fastFloor(x + s);
		const j = fastFloor(y + s);
		const k = fastFloor(z + s);
		const t = (i + j + k) * G3;
		const X0 = i - t;
		const Y0 = j - t;
		const Z0 = k - t;
		const x0 = x - X0;
		const y0 = y - Y0;
		const z0 = z - Z0;
		let i1, j1, k1;
		let i2, j2, k2;
		if (x0 >= y0) {
			if (y0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			} else if (x0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} else {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			}
		} else if (y0 < z0) {
			i1 = 0;
			j1 = 0;
			k1 = 1;
			i2 = 0;
			j2 = 1;
			k2 = 1;
		} else if (x0 < z0) {
			i1 = 0;
			j1 = 1;
			k1 = 0;
			i2 = 0;
			j2 = 1;
			k2 = 1;
		} else {
			i1 = 0;
			j1 = 1;
			k1 = 0;
			i2 = 1;
			j2 = 1;
			k2 = 0;
		}
		const x1 = x0 - i1 + G3;
		const y1 = y0 - j1 + G3;
		const z1 = z0 - k1 + G3;
		const x2 = x0 - i2 + 2 * G3;
		const y2 = y0 - j2 + 2 * G3;
		const z2 = z0 - k2 + 2 * G3;
		const x3 = x0 - 1 + 3 * G3;
		const y3 = y0 - 1 + 3 * G3;
		const z3 = z0 - 1 + 3 * G3;
		const ii = i & 255;
		const jj = j & 255;
		const kk = k & 255;
		let t0 = .6 - x0 * x0 - y0 * y0 - z0 * z0;
		if (t0 < 0) n0 = 0;
		else {
			const gi0 = ii + perm[jj + perm[kk]];
			t0 *= t0;
			n0 = t0 * t0 * (permGrad3x[gi0] * x0 + permGrad3y[gi0] * y0 + permGrad3z[gi0] * z0);
		}
		let t1 = .6 - x1 * x1 - y1 * y1 - z1 * z1;
		if (t1 < 0) n1 = 0;
		else {
			const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1]];
			t1 *= t1;
			n1 = t1 * t1 * (permGrad3x[gi1] * x1 + permGrad3y[gi1] * y1 + permGrad3z[gi1] * z1);
		}
		let t2 = .6 - x2 * x2 - y2 * y2 - z2 * z2;
		if (t2 < 0) n2 = 0;
		else {
			const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2]];
			t2 *= t2;
			n2 = t2 * t2 * (permGrad3x[gi2] * x2 + permGrad3y[gi2] * y2 + permGrad3z[gi2] * z2);
		}
		let t3 = .6 - x3 * x3 - y3 * y3 - z3 * z3;
		if (t3 < 0) n3 = 0;
		else {
			const gi3 = ii + 1 + perm[jj + 1 + perm[kk + 1]];
			t3 *= t3;
			n3 = t3 * t3 * (permGrad3x[gi3] * x3 + permGrad3y[gi3] * y3 + permGrad3z[gi3] * z3);
		}
		return 32 * (n0 + n1 + n2 + n3);
	};
}
/**
* Creates a 4D noise function
* @param random the random function that will be used to build the permutation table
* @returns {NoiseFunction4D}
*/
function createNoise4D(random = Math.random) {
	const perm = buildPermutationTable(random);
	const permGrad4x = new Float64Array(perm).map((v) => grad4[v % 32 * 4]);
	const permGrad4y = new Float64Array(perm).map((v) => grad4[v % 32 * 4 + 1]);
	const permGrad4z = new Float64Array(perm).map((v) => grad4[v % 32 * 4 + 2]);
	const permGrad4w = new Float64Array(perm).map((v) => grad4[v % 32 * 4 + 3]);
	return function noise4D(x, y, z, w) {
		let n0, n1, n2, n3, n4;
		const s = (x + y + z + w) * F4;
		const i = fastFloor(x + s);
		const j = fastFloor(y + s);
		const k = fastFloor(z + s);
		const l = fastFloor(w + s);
		const t = (i + j + k + l) * G4;
		const X0 = i - t;
		const Y0 = j - t;
		const Z0 = k - t;
		const W0 = l - t;
		const x0 = x - X0;
		const y0 = y - Y0;
		const z0 = z - Z0;
		const w0 = w - W0;
		let rankx = 0;
		let ranky = 0;
		let rankz = 0;
		let rankw = 0;
		if (x0 > y0) rankx++;
		else ranky++;
		if (x0 > z0) rankx++;
		else rankz++;
		if (x0 > w0) rankx++;
		else rankw++;
		if (y0 > z0) ranky++;
		else rankz++;
		if (y0 > w0) ranky++;
		else rankw++;
		if (z0 > w0) rankz++;
		else rankw++;
		const i1 = rankx >= 3 ? 1 : 0;
		const j1 = ranky >= 3 ? 1 : 0;
		const k1 = rankz >= 3 ? 1 : 0;
		const l1 = rankw >= 3 ? 1 : 0;
		const i2 = rankx >= 2 ? 1 : 0;
		const j2 = ranky >= 2 ? 1 : 0;
		const k2 = rankz >= 2 ? 1 : 0;
		const l2 = rankw >= 2 ? 1 : 0;
		const i3 = rankx >= 1 ? 1 : 0;
		const j3 = ranky >= 1 ? 1 : 0;
		const k3 = rankz >= 1 ? 1 : 0;
		const l3 = rankw >= 1 ? 1 : 0;
		const x1 = x0 - i1 + G4;
		const y1 = y0 - j1 + G4;
		const z1 = z0 - k1 + G4;
		const w1 = w0 - l1 + G4;
		const x2 = x0 - i2 + 2 * G4;
		const y2 = y0 - j2 + 2 * G4;
		const z2 = z0 - k2 + 2 * G4;
		const w2 = w0 - l2 + 2 * G4;
		const x3 = x0 - i3 + 3 * G4;
		const y3 = y0 - j3 + 3 * G4;
		const z3 = z0 - k3 + 3 * G4;
		const w3 = w0 - l3 + 3 * G4;
		const x4 = x0 - 1 + 4 * G4;
		const y4 = y0 - 1 + 4 * G4;
		const z4 = z0 - 1 + 4 * G4;
		const w4 = w0 - 1 + 4 * G4;
		const ii = i & 255;
		const jj = j & 255;
		const kk = k & 255;
		const ll = l & 255;
		let t0 = .6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
		if (t0 < 0) n0 = 0;
		else {
			const gi0 = ii + perm[jj + perm[kk + perm[ll]]];
			t0 *= t0;
			n0 = t0 * t0 * (permGrad4x[gi0] * x0 + permGrad4y[gi0] * y0 + permGrad4z[gi0] * z0 + permGrad4w[gi0] * w0);
		}
		let t1 = .6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
		if (t1 < 0) n1 = 0;
		else {
			const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]];
			t1 *= t1;
			n1 = t1 * t1 * (permGrad4x[gi1] * x1 + permGrad4y[gi1] * y1 + permGrad4z[gi1] * z1 + permGrad4w[gi1] * w1);
		}
		let t2 = .6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
		if (t2 < 0) n2 = 0;
		else {
			const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]];
			t2 *= t2;
			n2 = t2 * t2 * (permGrad4x[gi2] * x2 + permGrad4y[gi2] * y2 + permGrad4z[gi2] * z2 + permGrad4w[gi2] * w2);
		}
		let t3 = .6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
		if (t3 < 0) n3 = 0;
		else {
			const gi3 = ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]];
			t3 *= t3;
			n3 = t3 * t3 * (permGrad4x[gi3] * x3 + permGrad4y[gi3] * y3 + permGrad4z[gi3] * z3 + permGrad4w[gi3] * w3);
		}
		let t4 = .6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
		if (t4 < 0) n4 = 0;
		else {
			const gi4 = ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]];
			t4 *= t4;
			n4 = t4 * t4 * (permGrad4x[gi4] * x4 + permGrad4y[gi4] * y4 + permGrad4z[gi4] * z4 + permGrad4w[gi4] * w4);
		}
		return 27 * (n0 + n1 + n2 + n3 + n4);
	};
}
/**
* Builds a random permutation table.
* This is exported only for (internal) testing purposes.
* Do not rely on this export.
* @private
*/
function buildPermutationTable(random) {
	const tableSize = 512;
	const p = new Uint8Array(tableSize);
	for (let i = 0; i < tableSize / 2; i++) p[i] = i;
	for (let i = 0; i < tableSize / 2 - 1; i++) {
		const r = i + ~~(random() * (256 - i));
		const aux = p[i];
		p[i] = p[r];
		p[r] = aux;
	}
	for (let i = 256; i < tableSize; i++) p[i] = p[i - 256];
	return p;
}

/**
* @alias pex-random
*/
var Random = class Random {
	/**
	* @private
	*/
	static #instanceCount = 0;
	/**
	* @private
	* @property {number} NOW Runtime performance.now() value.
	*/
	static NOW = performance.now();
	/**
	* Creates an instance of Random.
	* @param {string|number} [seed=Random.NOW + Random.#instanceCount]
	*/
	constructor(seed = Random.NOW + Random.#instanceCount) {
		this.seed(seed);
		Random.#instanceCount++;
	}
	/**
	* Create an instance of Random.
	* @param {string|number} [seed] If omitted, the global PRNG seed will be used and incremented for each local PRNG.
	* @returns {Random}
	*/
	create = (seed) => new Random(seed);
	/**
	* Set the seed for the random number generator.
	* @param {string} s Seed value
	*/
	seed(s) {
		this.rng = (0, import_seedrandom.default)(s);
		this.simplex = {
			noise2D: createNoise2D(this.rng),
			noise3D: createNoise3D(this.rng),
			noise4D: createNoise4D(this.rng)
		};
	}
	/**
	* Get a float between min and max. Defaults to:
	* - `0 <= x < 1` if no argument supplied
	* - `0 <= x < max` if only one argument supplied
	* @param {number} [min]
	* @param {number} [max]
	* @returns {number}
	*/
	float(min, max) {
		if (arguments.length == 0) {
			min = 0;
			max = 1;
		} else if (arguments.length == 1) {
			max = min;
			min = 0;
		}
		return min + (max - min) * this.rng();
	}
	/**
	* Get an int between min and max. Defaults to:
	* - `0 <= x < Number.MAX_SAFE_INTEGER` if no argument supplied
	* - `0 <= x < max` if only one argument supplied
	* @param {number} [min]
	* @param {number} [max]
	* @returns {number}
	*/
	int(min, max) {
		if (arguments.length == 0) {
			min = 0;
			max = Number.MAX_SAFE_INTEGER;
		} else if (arguments.length == 1) {
			max = min;
			min = 0;
		}
		return Math.floor(this.float(min, max));
	}
	/**
	* Get a vec2 included in a radius.
	* @param {number} [r=1] radius
	* @returns {import("./types.js").vec2}
	*/
	vec2(r = 1) {
		const x = 2 * this.rng() - 1;
		const y = 2 * this.rng() - 1;
		const rr = this.rng() * r;
		const len = Math.sqrt(x * x + y * y);
		return [rr * x / len, rr * y / len];
	}
	/**
	* Get a vec3 included in a radius.
	* @param {number} [r=1] radius
	* @returns {import("./types.js").vec3}
	*/
	vec3(r = 1) {
		const x = 2 * this.rng() - 1;
		const y = 2 * this.rng() - 1;
		const z = 2 * this.rng() - 1;
		const rr = this.rng() * r;
		const len = Math.sqrt(x * x + y * y + z * z);
		return [
			rr * x / len,
			rr * y / len,
			rr * z / len
		];
	}
	/**
	* Get a vec2 included in a rectangle.
	* @param {number} rect rectangle
	* @returns {import("./types.js").vec2}
	*/
	vec2InRect(rect) {
		return [rect[0][0] + this.rng() * (rect[1][0] - rect[0][0]), rect[0][1] + this.rng() * (rect[1][1] - rect[0][1])];
	}
	/**
	* Get a vec3 included in a rectangle bbox.
	* @param {number} bbox rectangle bbox
	* @returns {import("./types.js").vec3}
	*/
	vec3InAABB(bbox) {
		return [
			bbox[0][0] + this.rng() * (bbox[1][0] - bbox[0][0]),
			bbox[0][1] + this.rng() * (bbox[1][1] - bbox[0][1]),
			bbox[0][2] + this.rng() * (bbox[1][2] - bbox[0][2])
		];
	}
	/**
	* Get a random quaternion.
	* @see [Graphics Gems III, Edited by David Kirk, III.6 UNIFORM RANDOM ROTATIONS]
	* @see [Steve LaValle]{@link https://web.archive.org/web/20211105205926/http://planning.cs.uiuc.edu/node198.html}
	* @returns {import("./types.js").quat}
	*/
	quat() {
		const x0 = this.rng();
		const theta1 = 2 * Math.PI * this.rng();
		const theta2 = 2 * Math.PI * this.rng();
		const r1 = Math.sqrt(1 - x0);
		const r2 = Math.sqrt(x0);
		return [
			Math.sin(theta1) * r1,
			Math.cos(theta1) * r1,
			Math.sin(theta2) * r2,
			Math.cos(theta2) * r2
		];
	}
	/**
	* Returns a chance of an event occuring according to a given probability between 0 and 1.
	* @param {number} [probability=0.5] Float between 0 and 1.
	* @returns {boolean}
	*/
	chance(probability = .5) {
		return this.rng() <= probability;
	}
	/**
	* Gets a random element from a list.
	* @param {Array} list
	* @returns {*}
	*/
	element(list) {
		return list[Math.floor(this.rng() * list.length)];
	}
	/**
	* Samples the noise field in 2 dimensions.
	* @param {number} x
	* @param {number} y
	* @returns {number} in the interval [-1, 1]
	*/
	noise2(x, y) {
		return this.simplex.noise2D(x, y);
	}
	/**
	* Samples the noise field in 3 dimensions.
	* @param {number} x
	* @param {number} y
	* @param {number} z
	* @returns {number} in the interval [-1, 1]
	*/
	noise3(x, y, z) {
		return this.simplex.noise3D(x, y, z);
	}
	/**
	* Samples the noise field in 4 dimensions.
	* @param {number} x
	* @param {number} y
	* @param {number} z
	* @param {number} w
	* @returns {number} in the interval [-1, 1]
	*/
	noise4(x, y, z, w) {
		return this.simplex.noise4D(x, y, z, w);
	}
	/**
	* Fractional Brownian motion (also called fractal Brownian motion) noise. Default to 1/f noise with 8 octaves.
	* @param {import("./types.js").FBMOptions} options
	* @param  {...number} d x, y, z?, w?
	* @returns {number} in the interval [-1, 1]
	*/
	fbm({ octaves = 8, lacunarity = 2, gain = .5, frequency = 1, amplitude = gain, noise }, ...d) {
		let value = 0;
		noise ||= this[`noise${d.length}`].bind(this);
		for (let i = 0; i < octaves; i++) {
			value += noise(...d.map((n) => n * frequency)) * amplitude;
			frequency *= lacunarity;
			amplitude *= gain;
		}
		return value;
	}
};
/**
* @module pex-random
*
* @summary
* Export a Random instance using the global PRNG:
* - The instance is seeded by `performance.now()`
* - Call `random.seed("seed")` to overwrite the global PRNG: all other calls to `random.float()` will derive from the new seeded state.
* - Call `random.create()` to create a local instance of Random with a separate unpredictable PRNG.
* - Call `random.create("seed")` to create a local instance of Random with a separate predictable PRNG: all other calls to `random.float()` will derive from the new seeded state.
*/
var pex_random_default = new Random();

export { pex_random_default as default };