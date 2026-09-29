# frenet-serret-frames

[![npm version](https://img.shields.io/npm/v/frenet-serret-frames)](https://www.npmjs.com/package/frenet-serret-frames)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/frenet-serret-frames)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/frenet-serret-frames)](https://bundlephobia.com/package/frenet-serret-frames)
[![dependencies](https://img.shields.io/librariesio/release/npm/frenet-serret-frames)](https://github.com/dmnsgn/frenet-serret-frames/blob/main/package.json)
[![types](https://img.shields.io/npm/types/frenet-serret-frames)](https://github.com/microsoft/TypeScript)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![license](https://img.shields.io/github/license/dmnsgn/frenet-serret-frames)](https://github.com/dmnsgn/frenet-serret-frames/blob/main/LICENSE.md)

Compute rotation minimizing (Bishop) or Frenet-Serret frames for a path of 3D positions.

[![paypal](https://img.shields.io/badge/donate-paypal-informational?logo=paypal)](https://paypal.me/dmnsgn)
[![coinbase](https://img.shields.io/badge/donate-coinbase-informational?logo=coinbase)](https://commerce.coinbase.com/checkout/56cbdf28-e323-48d8-9c98-7019e72c97f3)
[![twitter](https://img.shields.io/twitter/follow/dmnsgn?style=social)](https://twitter.com/dmnsgn)

[![frenet-serret-frames screenshot](https://raw.githubusercontent.com/dmnsgn/frenet-serret-frames/main/screenshot.gif)](https://dmnsgn.github.io/frenet-serret-frames/)

## Installation

```bash
npm install frenet-serret-frames
```

## Features

- **Bishop frames** (default): rotation minimizing frames, also known as parallel transport frames, computed with the [double reflection method](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/Computation-of-rotation-minimizing-frames.pdf). Minimal twist around the path, suited for sweeping tubes and ribbons.
- **Frenet frames**: normal pointing towards the centre of curvature. Flips at inflection points; straight parts take the nearest frame.
- **Seamless closed paths**: the mismatch at the seam is spread along the arc length.
- **Constraints**: `initialNormal`, `finalNormal` on open paths, and an additional `twist` spread along the arc length.
- **Any layout**: flat or nested positions, normals and binormals out in the same layout, written into provided arrays.
- **Robust**: duplicated points, straight lines and reversed tangents handled without flips.

## Usage

```js
import frenetSerretFrames from "frenet-serret-frames";
import { squirclePath } from "primitive-geometry";

const geometry = squirclePath();
frenetSerretFrames(geometry, {
  closed: false,
  mode: "bishop",
  initialNormal: null,
  finalNormal: null,
  twist: 0,
});
console.log(geometry);
// {
//   positions: Float32Array [x, y, z, x, y, z, ...],
//   cells: [[a, b, c, ...]],
//   tangents: Float32Array [x, y, z, x, y, z, ...],
//   normals: Float32Array [x, y, z, x, y, z, ...],
//   binormals: Float32Array [x, y, z, x, y, z, ...],
// }
```

## API

<!-- api-start -->

## Functions

<dl>
<dt><a href="#frenetSerretFrames">frenetSerretFrames(geometry, [options])</a> ⇒ <code><a href="#SimplicialComplexWithTNB">SimplicialComplexWithTNB</a></code></dt>
<dd><p>Compute rotation minimizing (Bishop) or Frenet-Serret frames for a path of 3D
positions.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SimplicialComplex">SimplicialComplex</a> : <code>object</code></dt>
<dd><p>Geometry definition.</p>
</dd>
<dt><a href="#SimplicialComplexWithTNB">SimplicialComplexWithTNB</a> : <code>object</code></dt>
<dd><p>Geometry definition augmented with
  tangents, normals and binormals.</p>
</dd>
<dt><a href="#Options">Options</a> : <code>object</code></dt>
<dd><p>Options for frames computation. All optional.</p>
</dd>
</dl>

<a name="frenetSerretFrames"></a>

## frenetSerretFrames(geometry, [options]) ⇒ [<code>SimplicialComplexWithTNB</code>](#SimplicialComplexWithTNB)

Compute rotation minimizing (Bishop) or Frenet-Serret frames for a path of 3D
positions.

**Kind**: global function
**See**

- [Frenet–Serret formulas](https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas)
- [Computation of Rotation Minimizing Frames (Wang et al. 2008)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/Computation-of-rotation-minimizing-frames.pdf)

| Param     | Type                                                 | Default         |
| --------- | ---------------------------------------------------- | --------------- |
| geometry  | [<code>SimplicialComplex</code>](#SimplicialComplex) |                 |
| [options] | [<code>Options</code>](#Options)                     | <code>{}</code> |

<a name="SimplicialComplex"></a>

## SimplicialComplex : <code>object</code>

Geometry definition.

**Kind**: global typedef
**Properties**

| Name        | Type                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| positions   | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| [tangents]  | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| [normals]   | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| [binormals] | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| [uvs]       | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec2&gt;</code>                          |
| [cells]     | <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code> \| <code>Array</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code> |

<a name="SimplicialComplexWithTNB"></a>

## SimplicialComplexWithTNB : <code>object</code>

Geometry definition augmented with
tangents, normals and binormals.

**Kind**: global typedef
**Properties**

| Name      | Type                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| positions | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| tangents  | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| normals   | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| binormals | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code>                          |
| [uvs]     | <code>module:pex-math~TypedArray</code> \| <code>Array.&lt;number&gt;</code> \| <code>Array.&lt;module:pex-math~Vec2&gt;</code>                          |
| [cells]   | <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code> \| <code>Array</code> \| <code>Array.&lt;module:pex-math~Vec3&gt;</code> |

<a name="Options"></a>

## Options : <code>object</code>

Options for frames computation. All optional.

**Kind**: global typedef
**Properties**

| Name            | Type                                                               | Default                         | Description                                                                                                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [closed]        | <code>boolean</code>                                               | <code>false</code>              | Specify if the path is closed.                                                                                                                                                                                                                                                                                                 |
| [mode]          | <code>&quot;bishop&quot;</code> \| <code>&quot;frenet&quot;</code> | <code>&quot;bishop&quot;</code> | Frame type: - "bishop": rotation minimizing (parallel transport) frames, computed with the double reflection method. Twist free, suited for sweeping. - "frenet": normal pointing towards the curvature centre. Flips at inflection points and is undefined on straight parts, where the nearest frame is transported instead. |
| [initialNormal] | <code>module:pex-math~Vec3</code>                                  | <code></code>                   | Specify a starting normal for "bishop" frames, made orthogonal to the first tangent. Defaults to a coordinate axis not aligned with the first tangent, also used when the initial normal is parallel to it.                                                                                                                    |
| [finalNormal]   | <code>module:pex-math~Vec3</code>                                  | <code></code>                   | Specify an ending normal for "bishop" frames of open paths, made orthogonal to the last tangent. Reached with the smallest rotation, spread along the arc length. Ignored when parallel to the last tangent.                                                                                                                   |
| [twist]         | <code>number</code>                                                | <code>0</code>                  | Additional rotation of "bishop" frames around the tangent, in radians, spread along the arc length from the first frame to the last. Closed paths and paths with a final normal need a multiple of 2π to keep their end frame, or of π when the sign of the normal doesn't matter (eg. flat ribbons).                          |

<!-- api-end -->

## License

MIT. See [license file](https://github.com/dmnsgn/frenet-serret-frames/blob/main/LICENSE.md).
