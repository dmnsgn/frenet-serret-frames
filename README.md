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

Compute Frenet-Serret frames for a path of 3D points and tangents.

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
import pathTangents from "path-tangents";

const isClosed = true;
const tangents = pathTangents(path, isClosed);
const frames = frenetSerretFrames(path, tangents, {
  closed: isClosed,
  initialNormal: [0, 1, 0],
});
```

## API

<!-- api-start -->

## Functions

<dl>
<dt><a href="#frenetSerretFrames">frenetSerretFrames(points, tangents, [options])</a> ⇒ <code><a href="#Frame">Array.&lt;Frame&gt;</a></code></dt>
<dd><p>Compute Frenet-Serret frames for a path of 3D points and tangents</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#vec3">vec3</a> : <code>Array.&lt;number&gt;</code></dt>
<dd></dd>
<dt><a href="#Options">Options</a> : <code>Object</code></dt>
<dd><p>Options for frames computation. All optional.</p>
</dd>
<dt><a href="#Frame">Frame</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="frenetSerretFrames"></a>

## frenetSerretFrames(points, tangents, [options]) ⇒ [<code>Array.&lt;Frame&gt;</code>](#Frame)

Compute Frenet-Serret frames for a path of 3D points and tangents

**Kind**: global function  
**See**: [Frenet–Serret formulas](https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas)

| Param     | Type                                     | Default         | Description                                                             |
| --------- | ---------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| points    | [<code>Array.&lt;vec3&gt;</code>](#vec3) |                 | Array of 3D points [x, y, z].                                           |
| tangents  | [<code>Array.&lt;vec3&gt;</code>](#vec3) |                 | Array of 3D points [x, y, z] corresponding to the tangents of the path. |
| [options] | [<code>Options</code>](#Options)         | <code>{}</code> |                                                                         |

<a name="vec3"></a>

## vec3 : <code>Array.&lt;number&gt;</code>

**Kind**: global typedef  
<a name="Options"></a>

## Options : <code>Object</code>

Options for frames computation. All optional.

**Kind**: global typedef  
**Properties**

| Name            | Type                       | Default            | Description                                                                                          |
| --------------- | -------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| [closed]        | <code>boolean</code>       | <code>false</code> | Specify is the path is closed.                                                                       |
| [initialNormal] | [<code>vec3</code>](#vec3) | <code></code>      | Specify a starting normal for the frames. Default to the direction of the minimum tangent component. |

<a name="Frame"></a>

## Frame : <code>Object</code>

**Kind**: global typedef  
**Properties**

| Name     | Type                       |
| -------- | -------------------------- |
| position | [<code>vec3</code>](#vec3) |
| normal   | [<code>vec3</code>](#vec3) |
| binormal | [<code>vec3</code>](#vec3) |
| tangent  | [<code>vec3</code>](#vec3) |

<!-- api-end -->

## License

MIT. See [license file](https://github.com/dmnsgn/frenet-serret-frames/blob/main/LICENSE.md).
