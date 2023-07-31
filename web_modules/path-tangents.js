import { a as sub$1, b as copy, n as normalize$1 } from './_chunks/vec3-cda63e3a.js';
import { s as set, b as sub, n as normalize } from './_chunks/avec3-0842332c.js';

/**
 * @typedef {number[]} vec3
 */ /**
 * Compute tangents for a path of 3D points.
 *
 * @param {TypedArray | vec3[]} path Simplicial complex geometry positions (eg. `new Float32Array([x, y, z, x, y, z, ...])` or `new Array([x, y, z], [x, y, z], ...)`)
 * @param {boolean} [closed=false] Specify if the path is closed. If so the last tangent will point to the first point. Otherwise it will follow the previous point.
 * @returns {TypedArray | vec3[]}
 */ const pathTangents = (path, closed)=>{
    if (closed === void 0) closed = false;
    const isTypedArray = !Array.isArray(path);
    if (isTypedArray) {
        const size = path.length / 3;
        const tangents = new Float32Array(size * 3);
        for(let i = 0; i < size; i++){
            if (i < size - 1) {
                set(tangents, i, path, i + 1);
                sub(tangents, i, path, i);
            } else {
                if (closed) {
                    set(tangents, i, path, 0);
                    sub(tangents, i, path, i);
                } else {
                    set(tangents, i, path, i);
                    sub(tangents, i, path, i - 1);
                }
            }
            normalize(tangents, i);
        }
        return tangents;
    }
    return path.map((point, i, points)=>{
        let tangent;
        if (i < points.length - 1) {
            tangent = sub$1(copy(points[i + 1]), point);
        } else {
            tangent = closed ? sub$1(copy(points[0]), point) : sub$1(copy(point), points[i - 1]);
        }
        return normalize$1(tangent);
    });
};

export { pathTangents as default };
