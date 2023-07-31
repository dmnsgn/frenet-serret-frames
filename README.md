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

Compute Frenet-Serret frames for a geometry of 3D positions and optionally provided tangents.

[![paypal](https://img.shields.io/badge/donate-paypal-informational?logo=paypal)](https://paypal.me/dmnsgn)
[![coinbase](https://img.shields.io/badge/donate-coinbase-informational?logo=coinbase)](https://commerce.coinbase.com/checkout/56cbdf28-e323-48d8-9c98-7019e72c97f3)
[![twitter](https://img.shields.io/twitter/follow/dmnsgn?style=social)](https://twitter.com/dmnsgn)

![](https://raw.githubusercontent.com/dmnsgn/frenet-serret-frames/main/screenshot.gif)

## Installation

```bash
npm install frenet-serret-frames
```

## Usage

```js
import frenetSerretFrames from "frenet-serret-frames";

const frames = frenetSerretFrames({ positions }, {
  closed: true,
  initialNormal: [0, 1, 0],
});
```

## API

<!-- api-start -->

## Functions

<dl>
<dt><a href="#frenetSerretFrames">frenetSerretFrames(geometry, [options])</a> ⇒ <code><a href="#SimplicialComplexWithTNB">SimplicialComplexWithTNB</a></code></dt>
<dd><p>Compute Frenet-Serret frames for a geometry of 3D positions and optionally provided tangents.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#vec3">vec3</a> : <code>Array.&lt;number&gt;</code></dt>
<dd></dd>
<dt><a href="#SimplicialComplex">SimplicialComplex</a> : <code>object</code></dt>
<dd><p>Geometry definition.</p>
</dd>
<dt><a href="#SimplicialComplexWithTNB">SimplicialComplexWithTNB</a> : <code>object</code></dt>
<dd><p>Geometry definition augmented with tangent, normals and binormals.</p>
</dd>
<dt><a href="#Options">Options</a> : <code>object</code></dt>
<dd><p>Options for frames computation. All optional.</p>
</dd>
</dl>

<a name="frenetSerretFrames"></a>

## frenetSerretFrames(geometry, [options]) ⇒ [<code>SimplicialComplexWithTNB</code>](#SimplicialComplexWithTNB)

Compute Frenet-Serret frames for a geometry of 3D positions and optionally provided tangents.

**Kind**: global function
**See**: [Frenet–Serret formulas](https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas)

| Param     | Type                                                 | Default         |
| --------- | ---------------------------------------------------- | --------------- |
| geometry  | [<code>SimplicialComplex</code>](#SimplicialComplex) |                 |
| [options] | [<code>Options</code>](#Options)                     | <code>{}</code> |

<a name="vec3"></a>

## vec3 : <code>Array.&lt;number&gt;</code>

**Kind**: global typedef
<a name="SimplicialComplex"></a>

## SimplicialComplex : <code>object</code>

Geometry definition.

**Kind**: global typedef
**Properties**

| Name       | Type                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| positions  | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| [tangents] | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| [normals]  | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| [uvs]      | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| [cells]    | <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3) |

<a name="SimplicialComplexWithTNB"></a>

## SimplicialComplexWithTNB : <code>object</code>

Geometry definition augmented with tangent, normals and binormals.

**Kind**: global typedef
**Properties**

| Name      | Type                                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| positions | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| tangents  | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| normals   | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| binormals | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| [uvs]     | <code>Float32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3)                                                       |
| [cells]   | <code>Uint8Array</code> \| <code>Uint16Array</code> \| <code>Uint32Array</code> \| [<code>Array.&lt;vec3&gt;</code>](#vec3) |

<a name="Options"></a>

## Options : <code>object</code>

Options for frames computation. All optional.

**Kind**: global typedef
**Properties**

| Name            | Type                       | Default            | Description                                                                                          |
| --------------- | -------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| [closed]        | <code>boolean</code>       | <code>false</code> | Specify is the path is closed.                                                                       |
| [initialNormal] | [<code>vec3</code>](#vec3) | <code></code>      | Specify a starting normal for the frames. Default to the direction of the minimum tangent component. |

<!-- api-end -->

## License

MIT. See [license file](https://github.com/dmnsgn/frenet-serret-frames/blob/main/LICENSE.md).
