const computeFrenetSerretFrames = require("./");
const computePathTangents = require("path-tangents");
const { vec3, mat4 } = require("gl-matrix");
const { flatten } = require("lodash");
const createContext = require("pex-context");
const createCamera = require("pex-cam/perspective");
const createOrbiter = require("pex-cam/orbiter");

const path = [];
let isClosed = false;
const frameScale = 0.65;

// Create Torus knot
const count = 50;
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
  // path.push([x * s, y * s, z * s]);
}

// Create helix
for (let i = 0; i < count; i++) {
  const t = ((Math.PI * 2 * i) / count) * 4;
  const x = Math.cos(t);
  const y = 0.1 * t;
  const z = Math.sin(t);
  path.push([x, y, z]);
}

// Create circle
for (let i = 0; i < count; i++) {
  const t = (Math.PI * 2 * i) / count;
  const x = Math.cos(t);
  const y = 0;
  const z = Math.sin(t);
  // path.push([x, y, z]);
}

// Closed
// isClosed = true;
// path.push([...path[0]]);

// Compute frames
const tangents = computePathTangents(path, isClosed);
const frames = computeFrenetSerretFrames(path, tangents, { closed: isClosed });

// Render
const ctx = createContext();
const camera = createCamera({
  fov: Math.PI / 3,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [0, 0, 5]
});
createOrbiter({ camera });

const lineVert = `
attribute vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

void main() {
  mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
  gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);
}
`;

const lineFrag = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}
`;

const frameVert = `
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
`;

const frameFrag = `
#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`;

const drawCurve = {
  pipeline: ctx.pipeline({
    vert: lineVert,
    frag: lineFrag,
    primitive: ctx.Primitive.LineStrip
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(path)
  },
  count: path.length,
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uColor: [1, 1, 1, 1]
  }
};

const TNBBuffer = flatten(
  frames.map(({ position, tangent, normal, binormal }) => [
    position,
    vec3.scaleAndAdd(vec3.create(), position, tangent, frameScale),
    position,
    vec3.scaleAndAdd(vec3.create(), position, normal, frameScale),
    position,
    vec3.scaleAndAdd(vec3.create(), position, binormal, frameScale)
  ])
);

const colorBuffer = flatten(
  frames.map(() => [
    [1, 0, 0, 1],
    [0.5, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0.5, 0, 1],
    [0, 0, 1, 1],
    [0, 0, 0.5, 1]
  ])
);

const drawFrames = {
  pipeline: ctx.pipeline({
    vert: frameVert,
    frag: frameFrag,
    primitive: ctx.Primitive.Lines
  }),
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(TNBBuffer)
    },
    aColor: {
      buffer: ctx.vertexBuffer(colorBuffer)
    }
  },
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  },
  count: 6 * frames.length
};

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.05, 0.05, 0.05, 1]
  })
};

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawCurve);
  ctx.submit(drawFrames);
});
