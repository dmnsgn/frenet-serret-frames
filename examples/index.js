import frenetSerretFrames from "../index.js";

import { avec3, vec3, mat4, avec4 } from "pex-math";
import createContext from "pex-context";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { Pane } from "tweakpane";

const CONFIG = {
  geometry: "torusKnot",
  closed: true,
  showFrames: true,
  showPath: true,
};

const count = 50;
const geometries = {
  torusKnot: { positions: new Float32Array(count * 3) },
  torusKnotChunked: { positions: [] },
  helix: { positions: new Float32Array(count * 3) },
  helixChunked: { positions: [] },
  circle: { positions: new Float32Array(count * 3) },
  circleChunked: { positions: [] },
};

// Create Torus knot
for (let i = 0; i < count; i++) {
  const s = 1 / 10;
  const t = (Math.PI * 2 * i) / count;

  const x =
    10 * (Math.cos(t) + Math.cos(3 * t)) + Math.cos(2 * t) + Math.cos(4 * t);
  const y = 6 * Math.sin(t) + 10 * Math.sin(3 * t);
  const z =
    4 * Math.sin(3 * t) * Math.sin((5 * t) / 2) +
    4 * Math.sin(4 * t) -
    2 * Math.sin(6 * t);
  geometries.torusKnot.positions.set([x * s, y * s, z * s], i * 3);
  geometries.torusKnotChunked.positions.push([x * s, y * s, z * s]);
}

// Create helix
for (let i = 0; i < count; i++) {
  const t = ((Math.PI * 2 * i) / count) * 4;
  const x = Math.cos(t);
  const y = 0.1 * t;
  const z = Math.sin(t);
  geometries.helix.positions.set([x, y, z], i * 3);
  geometries.helixChunked.positions.push([x, y, z]);
}

// Create circle
for (let i = 0; i < count; i++) {
  const t = (Math.PI * 2 * i) / count;
  const x = Math.cos(t);
  const y = 0;
  const z = Math.sin(t);
  geometries.circle.positions.set([x, y, z], i * 3);
  geometries.circleChunked.positions.push([x, y, z]);
}

// Compute frames and create buffers
const frameScale = 0.65;

Object.values(geometries).forEach((geometry) => {
  const isTypedArray = !Array.isArray(geometry.positions);

  if (!isTypedArray) {
    frenetSerretFrames(geometry);

    geometry.tnbBuffer = geometry.positions
      .map((position, index) => [
        position,
        vec3.addScaled(
          vec3.copy(position),
          geometry.tangents[index],
          frameScale,
        ),
        position,
        vec3.addScaled(
          vec3.copy(position),
          geometry.normals[index],
          frameScale,
        ),
        position,
        vec3.addScaled(
          vec3.copy(position),
          geometry.binormals[index],
          frameScale,
        ),
      ])
      .flat();

    geometry.colorBuffer = geometry.positions
      .map(() => [
        [1, 0, 0, 1],
        [0.5, 0, 0, 1],
        [0, 1, 0, 1],
        [0, 0.5, 0, 1],
        [0, 0, 1, 1],
        [0, 0, 0.5, 1],
      ])
      .flat();

    const closedGeometry = { positions: [...geometry.positions] };
    frenetSerretFrames(closedGeometry, { closed: true });

    geometry.tnbClosedBuffer = closedGeometry.positions
      .map((position, index) => [
        position,
        vec3.addScaled(
          vec3.copy(position),
          closedGeometry.tangents[index],
          frameScale,
        ),
        position,
        vec3.addScaled(
          vec3.copy(position),
          closedGeometry.normals[index],
          frameScale,
        ),
        position,
        vec3.addScaled(
          vec3.copy(position),
          closedGeometry.binormals[index],
          frameScale,
        ),
      ])
      .flat();

    return;
  }

  frenetSerretFrames(geometry);

  const closedGeometry = { positions: new Float32Array(geometry.positions) };
  frenetSerretFrames(closedGeometry, { closed: true });

  const size = geometry.positions.length / 3;
  geometry.tnbBuffer = new Float32Array(size * 3 * 6);
  geometry.tnbClosedBuffer = new Float32Array(size * 3 * 6);
  geometry.colorBuffer = new Float32Array(size * 4 * 6);

  for (let i = 0; i < size; i++) {
    avec3.set(geometry.tnbBuffer, i * 6, geometry.positions, i);
    avec3.set(geometry.tnbBuffer, i * 6 + 1, geometry.positions, i);
    avec3.addScaled(
      geometry.tnbBuffer,
      i * 6 + 1,
      geometry.tangents,
      i,
      frameScale,
    );
    avec3.set(geometry.tnbBuffer, i * 6 + 2, geometry.positions, i);
    avec3.set(geometry.tnbBuffer, i * 6 + 3, geometry.positions, i);
    avec3.addScaled(
      geometry.tnbBuffer,
      i * 6 + 3,
      geometry.normals,
      i,
      frameScale,
    );
    avec3.set(geometry.tnbBuffer, i * 6 + 4, geometry.positions, i);
    avec3.set(geometry.tnbBuffer, i * 6 + 5, geometry.positions, i);
    avec3.addScaled(
      geometry.tnbBuffer,
      i * 6 + 5,
      geometry.binormals,
      i,
      frameScale,
    );

    avec3.set(geometry.tnbClosedBuffer, i * 6, closedGeometry.positions, i);
    avec3.set(geometry.tnbClosedBuffer, i * 6 + 1, closedGeometry.positions, i);
    avec3.addScaled(
      geometry.tnbClosedBuffer,
      i * 6 + 1,
      closedGeometry.tangents,
      i,
      frameScale,
    );
    avec3.set(geometry.tnbClosedBuffer, i * 6 + 2, closedGeometry.positions, i);
    avec3.set(geometry.tnbClosedBuffer, i * 6 + 3, closedGeometry.positions, i);
    avec3.addScaled(
      geometry.tnbClosedBuffer,
      i * 6 + 3,
      closedGeometry.normals,
      i,
      frameScale,
    );
    avec3.set(geometry.tnbClosedBuffer, i * 6 + 4, closedGeometry.positions, i);
    avec3.set(geometry.tnbClosedBuffer, i * 6 + 5, closedGeometry.positions, i);
    avec3.addScaled(
      geometry.tnbClosedBuffer,
      i * 6 + 5,
      closedGeometry.binormals,
      i,
      frameScale,
    );

    avec4.set(geometry.colorBuffer, i * 6 + 0, [1, 0, 0, 1], 0);
    avec4.set(geometry.colorBuffer, i * 6 + 1, [0.5, 0, 0, 1], 0);
    avec4.set(geometry.colorBuffer, i * 6 + 2, [0, 1, 0, 1], 0);
    avec4.set(geometry.colorBuffer, i * 6 + 3, [0, 0.5, 0, 1], 0);
    avec4.set(geometry.colorBuffer, i * 6 + 4, [0, 0, 1, 1], 0);
    avec4.set(geometry.colorBuffer, i * 6 + 5, [0, 0, 0.5, 1], 0);
  }
});

console.log(geometries);

// Render
const ctx = createContext({ canvas: document.querySelector("canvas") });
const camera = createCamera({
  fov: Math.PI / 3,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [0, 0, 5],
});
createOrbiter({ camera });

const drawCurve = {
  pipeline: ctx.pipeline({
    vert: /* glsl */ `
attribute vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

void main() {
  mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
  gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);
}
`,
    frag: /* glsl */ `
precision highp float;

uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}
`,
    primitive: ctx.Primitive.LineStrip,
  }),
  attributes: { aPosition: ctx.vertexBuffer([]) },
  count: 0,
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uColor: [1, 1, 1, 1],
  },
};

const drawFrames = {
  pipeline: ctx.pipeline({
    vert: /* glsl */ `
attribute vec3 aPosition;
attribute vec4 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec4 vColor;

void main() {
  vColor = aColor;
  mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
  gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);
}
`,
    frag: /* glsl */ `
precision highp float;

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`,
    primitive: ctx.Primitive.Lines,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer([
      0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    ]),
    aColor: ctx.vertexBuffer([
      1, 0, 0, 1, 1, 0.5, 0.5, 1, 0, 1, 0, 1, 0.5, 1, 0.5, 1, 0, 0, 1, 1, 0.5,
      0.5, 1, 1,
    ]),
  },
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  count: 6,
};

const clearCmd = { pass: ctx.pass({ clearColor: [0.05, 0.05, 0.05, 1] }) };

const updateGeometry = () => {
  const geometry = geometries[CONFIG.geometry];
  const isTypedArray = !Array.isArray(geometry.positions);

  // Curve
  let path;
  if (isTypedArray) {
    path = CONFIG.closed
      ? new Float32Array([
          ...geometry.positions,
          ...geometry.positions.slice(0, 3),
        ])
      : new Float32Array(geometry.positions);
  } else {
    path = CONFIG.closed
      ? [...geometry.positions, geometry.positions[0]]
      : geometry.positions;
  }
  ctx.update(drawCurve.attributes.aPosition, { data: path });
  drawCurve.count = path.length / (isTypedArray ? 3 : 1);

  // Frames
  ctx.update(drawFrames.attributes.aPosition, {
    data: CONFIG.closed ? geometry.tnbClosedBuffer : geometry.tnbBuffer,
  });
  ctx.update(drawFrames.attributes.aColor, { data: geometry.colorBuffer });
  drawFrames.count = (geometry.positions.length / (isTypedArray ? 3 : 1)) * 6;
};
updateGeometry();

let pane = new Pane();
pane.addBinding(CONFIG, "closed").on("change", () => updateGeometry());
pane.addBinding(CONFIG, "showFrames");
pane.addBinding(CONFIG, "showPath");
pane
  .addBinding(CONFIG, "geometry", {
    options: Object.keys(geometries).map((value) => ({
      text: value.toUpperCase(),
      value,
    })),
  })
  .on("change", () => updateGeometry());

ctx.frame(() => {
  ctx.submit(clearCmd);
  if (CONFIG.showFrames) ctx.submit(drawFrames);
  if (CONFIG.showPath) ctx.submit(drawCurve);
});

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      console.log(pane);
      if (pane) pane.dispose();
    }
  });
}
