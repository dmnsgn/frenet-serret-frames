import frenetSerretFrames from "../index.js";

import computePathTangents from "path-tangents";

import { avec3, vec3, mat4, avec4 } from "pex-math";
import createContext from "pex-context";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { Pane } from "tweakpane";
import * as Primitives from "primitive-geometry";

import { curves } from "./curves.js";

const PathPrimitives = Object.fromEntries(
  Object.entries(Primitives).filter(([key]) => key.endsWith("Path")),
);

const params = new URLSearchParams(location.search);

const CONFIG = {
  geometry: params.get("geometry") || "torusKnot",
  closed: false,
  showFrames: true,
  showPath: true,
  mode: "bishop",
  tangents: "chordal",
  count: 150,
  twist: 0,
};

// Center and scale to a common size
const fit = (points) => {
  const center = [0, 1, 2].map(
    (k) =>
      (Math.min(...points.map((p) => p[k])) +
        Math.max(...points.map((p) => p[k]))) /
      2,
  );
  const radius = Math.max(...points.map((p) => vec3.distance(p, center)));
  return points.map((p) => vec3.scale(vec3.sub([...p], center), 1 / radius));
};

const geometries = {};

const sampleCurves = () => {
  for (const [name, curve] of Object.entries(curves)) {
    // Exclude u = 1: it duplicates the first point of closed curves
    const points = Array.from({ length: CONFIG.count }, (_, i) =>
      curve(i / CONFIG.count),
    );
    geometries[name] = { positions: new Float32Array(fit(points).flat()) };
  }
  for (const [name, primitive] of Object.entries(PathPrimitives)) {
    geometries[name] = primitive({
      nx: CONFIG.count,
      segments: CONFIG.count,
      edgeSegments: CONFIG.count,
    });
  }
};

// Compute frames and create buffers
const frameScale = 0.1;

const getFrames = (positions, closed) =>
  frenetSerretFrames(
    {
      positions,
      tangents: computePathTangents(positions, {
        closed,
        method: CONFIG.tangents,
      }),
    },
    { closed, mode: CONFIG.mode, twist: CONFIG.twist },
  );

const computeFrames = () => {
  Object.values(geometries).forEach((geometry) => {
    const openGeometry = getFrames(geometry.positions, false);
    const closedGeometry = getFrames(
      new Float32Array(geometry.positions),
      true,
    );

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
        openGeometry.tangents,
        i,
        frameScale,
      );
      avec3.set(geometry.tnbBuffer, i * 6 + 2, geometry.positions, i);
      avec3.set(geometry.tnbBuffer, i * 6 + 3, geometry.positions, i);
      avec3.addScaled(
        geometry.tnbBuffer,
        i * 6 + 3,
        openGeometry.normals,
        i,
        frameScale,
      );
      avec3.set(geometry.tnbBuffer, i * 6 + 4, geometry.positions, i);
      avec3.set(geometry.tnbBuffer, i * 6 + 5, geometry.positions, i);
      avec3.addScaled(
        geometry.tnbBuffer,
        i * 6 + 5,
        openGeometry.binormals,
        i,
        frameScale,
      );

      avec3.set(geometry.tnbClosedBuffer, i * 6, closedGeometry.positions, i);
      avec3.set(
        geometry.tnbClosedBuffer,
        i * 6 + 1,
        closedGeometry.positions,
        i,
      );
      avec3.addScaled(
        geometry.tnbClosedBuffer,
        i * 6 + 1,
        closedGeometry.tangents,
        i,
        frameScale,
      );
      avec3.set(
        geometry.tnbClosedBuffer,
        i * 6 + 2,
        closedGeometry.positions,
        i,
      );
      avec3.set(
        geometry.tnbClosedBuffer,
        i * 6 + 3,
        closedGeometry.positions,
        i,
      );
      avec3.addScaled(
        geometry.tnbClosedBuffer,
        i * 6 + 3,
        closedGeometry.normals,
        i,
        frameScale,
      );
      avec3.set(
        geometry.tnbClosedBuffer,
        i * 6 + 4,
        closedGeometry.positions,
        i,
      );
      avec3.set(
        geometry.tnbClosedBuffer,
        i * 6 + 5,
        closedGeometry.positions,
        i,
      );
      avec3.addScaled(
        geometry.tnbClosedBuffer,
        i * 6 + 5,
        closedGeometry.binormals,
        i,
        frameScale,
      );

      avec4.set(geometry.colorBuffer, i * 6 + 0, [1, 0, 0, 1], 0);
      avec4.set(geometry.colorBuffer, i * 6 + 1, [1, 0, 0, 1], 0);
      avec4.set(geometry.colorBuffer, i * 6 + 2, [0, 1, 0, 1], 0);
      avec4.set(geometry.colorBuffer, i * 6 + 3, [0, 1, 0, 1], 0);
      avec4.set(geometry.colorBuffer, i * 6 + 4, [0, 0, 1, 1], 0);
      avec4.set(geometry.colorBuffer, i * 6 + 5, [0, 0, 1, 1], 0);
    }
  });
};
sampleCurves();
computeFrames();

// Render
const pixelRatio = devicePixelRatio;
const canvas = document.createElement("canvas");
document.querySelector("main").append(canvas);
const ctx = createContext({ canvas });
const camera = createCamera({
  fov: Math.PI / 3,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [0, 0, 2.2],
});
createOrbiter({ camera, element: canvas });

const onResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.set({ pixelRatio, width, height });
  camera.set({ aspect: width / height });
};
window.addEventListener("resize", onResize);
onResize();

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
    aPosition: ctx.vertexBuffer([0, 0, 0]),
    aColor: ctx.vertexBuffer([1, 0, 0, 1]),
  },
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
  },
  count: 6,
};

const clearCmd = { pass: ctx.pass({ clearColor: [0.07, 0.07, 0.07, 1] }) };

const updateGeometry = () => {
  const geometry = geometries[CONFIG.geometry];
  if (!geometry) return;

  // Curve
  const path = CONFIG.closed
    ? new Float32Array([
        ...geometry.positions,
        ...geometry.positions.slice(0, 3),
      ])
    : geometry.positions;
  ctx.update(drawCurve.attributes.aPosition, { data: path });
  drawCurve.count = path.length / 3;

  // Frames
  ctx.update(drawFrames.attributes.aPosition, {
    data: CONFIG.closed ? geometry.tnbClosedBuffer : geometry.tnbBuffer,
  });
  ctx.update(drawFrames.attributes.aColor, { data: geometry.colorBuffer });
  drawFrames.count = (geometry.positions.length / 3) * 6;
};
updateGeometry();

let pane = new Pane();
pane.addBinding(CONFIG, "closed").on("change", () => updateGeometry());
const onFramesChange = () => {
  computeFrames();
  updateGeometry();
};
pane
  .addBinding(CONFIG, "mode", {
    options: { bishop: "bishop", frenet: "frenet" },
  })
  .on("change", onFramesChange);
pane
  .addBinding(CONFIG, "tangents", {
    options: Object.fromEntries(
      ["forward", "uniform", "centripetal", "chordal"].map((m) => [m, m]),
    ),
  })
  .on("change", onFramesChange);
// Steps of π/4 to land on the multiples of π and 2π closed paths need
pane
  .addBinding(CONFIG, "twist", { min: 0, max: 4 * Math.PI, step: 0.01 })
  .on("change", onFramesChange);
const onCountChange = () => {
  sampleCurves();
  onFramesChange();
};
pane
  .addBinding(CONFIG, "count", { min: 8, max: 400, step: 1 })
  .on("change", onCountChange);
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

if (params.has("screenshot")) {
  if (params.has("geometry")) globalThis.screenshotItems = Object.keys(curves);
  globalThis.dispatchEvent(new CustomEvent("screenshot"));
}

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (!newModule) return;
    pane?.dispose();
  });
}
