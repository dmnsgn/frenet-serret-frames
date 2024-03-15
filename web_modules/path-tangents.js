import { s as sub$1, c as copy, n as normalize$1 } from './_chunks/vec3-nqREEh0c.js';
import { s as set, a as sub, n as normalize } from './_chunks/avec3-C97cZISE.js';

/**
 * @typedef {number[]} vec3
 */ /**
 * Compute tangents for a path of 3D points.
 *
 * @param {TypedArray | Array | vec3[]} path Simplicial complex geometry positions (eg. `new Float32Array([x, y, z, x, y, z, ...])/new Array(x, y, z, x, y, z, ...)` or `new Array([x, y, z], [x, y, z], ...)`)
 * @param {boolean} [closed=false] Specify if the path is closed. If so the last tangent will point to the first point. Otherwise it will follow the previous point.
 * @returns {TypedArray | Array | vec3[]}
 */ const pathTangents = (path, closed)=>{
    if (closed === void 0) closed = false;
    const isFlatArray = !path[0]?.length;
    if (isFlatArray) {
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
