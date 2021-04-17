# frenet-serret-frames

[![npm version](https://img.shields.io/npm/v/frenet-serret-frames)](https://www.npmjs.com/package/frenet-serret-frames)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/frenet-serret-frames)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/frenet-serret-frames)](https://www.npmjs.com/package/frenet-serret-frames)
[![dependencies](https://img.shields.io/david/dmnsgn/frenet-serret-frames)](https://github.com/dmnsgn/frenet-serret-frames/blob/main/package.json)
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

Auto-generated API content.

<!-- api-end -->

## License

MIT. See [license file](https://github.com/dmnsgn/frenet-serret-frames/blob/main/LICENSE.md).
