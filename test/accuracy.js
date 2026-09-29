import test from "node:test";
import assert from "node:assert/strict";

import computePathTangents from "path-tangents";
import { vec3 } from "pex-math";
import frenetSerretFrames from "../index.js";
import {
  reject,
  signedAngle,
  transport,
  curves,
  samplings,
  curveTangent,
} from "./utils.js";

const TANGENTS = ["forward", "uniform", "centripetal", "chordal", "exact"];
const SUBSTEPS = 100;

// Rotation minimizing normals at each sample parameter, integrated with exact
// tangents over SUBSTEPS double reflection steps per interval.
function referenceNormals(curve, us, initialNormal) {
  const normals = [initialNormal];
  let normal = initialNormal;
  for (let k = 1; k < us.length; k++) {
    for (let j = 1; j <= SUBSTEPS; j++) {
      const u0 = us[k - 1] + ((us[k] - us[k - 1]) * (j - 1)) / SUBSTEPS;
      const u1 = us[k - 1] + ((us[k] - us[k - 1]) * j) / SUBSTEPS;
      normal = transport(
        normal,
        curveTangent(curve, u0),
        curveTangent(curve, u1),
        curve(u0),
        curve(u1),
      );
    }
    normals.push(normal);
  }
  return normals;
}

// Max twist error in degrees against the reference frames
function twistError(curve, us, tangentMethod) {
  const positions = us.map(curve);
  const exact = us.map((u) => curveTangent(curve, u));
  const tangents =
    tangentMethod === "exact"
      ? exact
      : computePathTangents(positions, { method: tangentMethod });

  const referenceNormal = vec3.normalize(
    reject(vec3.cross([...exact[0]], [0.3, 0.9, 0.1]), exact[0]),
  );
  const reference = referenceNormals(curve, us, referenceNormal);
  const { normals } = frenetSerretFrames(
    { positions, tangents },
    { initialNormal: vec3.normalize(reject(referenceNormal, tangents[0])) },
  );

  return Math.max(
    ...normals.map((n, i) => {
      const r = vec3.normalize(reject(reference[i], tangents[i]));
      return Math.abs(signedAngle(n, r, tangents[i]) * (180 / Math.PI));
    }),
  );
}

const geometricMean = (values) =>
  Math.exp(
    values.reduce((sum, x) => sum + Math.log(Math.max(x, 1e-12)), 0) /
      values.length,
  );

test("bishop: accuracy of tangent methods across curves and samplings", (t) => {
  const count = 48;
  const results = {};

  for (const [samplingName, sampling] of Object.entries(samplings)) {
    const us = sampling(count);
    results[samplingName] = Object.fromEntries(
      TANGENTS.map((method) => [
        method,
        Object.values(curves).map((curve) => twistError(curve, us, method)),
      ]),
    );

    t.diagnostic(
      `${samplingName.padEnd(10)} geometric mean / worst twist error (deg), n=${count}:`,
    );
    for (const method of TANGENTS) {
      const errors = results[samplingName][method];
      t.diagnostic(
        `  ${method.padEnd(12)} ${geometricMean(errors).toPrecision(2).padStart(8)} / ${Math.max(...errors).toPrecision(2)}`,
      );
    }
  }

  for (const [samplingName, errors] of Object.entries(results)) {
    const mean = (method) => geometricMean(errors[method]);
    // Chordal is the default: never far from the best and far better on jitter
    assert.ok(
      mean("chordal") < 0.2,
      `${samplingName} chordal ${mean("chordal")}`,
    );
    assert.ok(mean("chordal") < mean("forward") / 10, samplingName);
    assert.ok(mean("exact") < mean("chordal") / 10, samplingName);
  }
  assert.ok(
    geometricMean(results.jitter.chordal) <
      geometricMean(results.jitter.uniform) / 10,
  );
});
