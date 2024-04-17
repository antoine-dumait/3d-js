import { SCREEN_WIDTH } from "./setup";
export function texturedTriangle(tri, texture) {
    // triangleCount++; TODO: reimplement tri count
    let P1 = tri.p[0];
    let P2 = tri.p[1];
    let P3 = tri.p[2];
    let T1 = tri.t[0];
    let T2 = tri.t[1];
    let T3 = tri.t[2];
    P1.x = Math.floor(P1.x);
    P1.y = Math.floor(P1.y);
    P2.x = Math.floor(P2.x);
    P2.y = Math.floor(P2.y);
    P3.x = Math.floor(P3.x);
    P3.y = Math.floor(P3.y);
    if (P2.y < P1.y) {
        [P2, P1] = [P1, P2];
        [T2, T1] = [T1, T2];
    }
    if (P3.y < P1.y) {
        [P3, P1] = [P1, P3];
        [T3, T1] = [T1, T3];
    }
    if (P3.y < P2.y) {
        [P3, P2] = [P2, P3];
        [T3, T2] = [T2, T3];
    }
    let dx1 = P2.x - P1.x;
    let dy1 = P2.y - P1.y;
    let du1 = T2.u - T1.u;
    let dv1 = T2.v - T1.v;
    let dw1 = T2.w - T1.w;
    const dx2 = P3.x - P1.x;
    const dy2 = P3.y - P1.y;
    const du2 = T3.u - T1.u;
    const dv2 = T3.v - T1.v;
    const dw2 = T3.w - T1.w;
    let aXstep = 0, bXstep = 0; //a parti droite, b parti gauche
    let u1step = 0, u2step = 0;
    let v1step = 0, v2step = 0;
    let w1step = 0, w2step = 0;
    const absDY1 = Math.abs(dy1);
    const absDY2 = Math.abs(dy2);
    if (dy1) {
        aXstep = dx1 / absDY1; //si dy1 differrent de zero,
        u1step = du1 / absDY1;
        v1step = dv1 / absDY1;
        w1step = dw1 / absDY1;
    }
    if (dy2) {
        bXstep = dx2 / absDY2;
        u2step = du2 / absDY2;
        v2step = dv2 / absDY2;
        w2step = dw2 / absDY2;
    }
    let w;
    let u;
    let v;
    if (dy1) {
        for (let i = P1.y; i <= P2.y; i++) {
            const deltaY = i - P1.y;
            let aX = Math.floor(P1.x + deltaY * aXstep);
            let bX = Math.floor(P1.x + deltaY * bXstep);
            let startU = T1.u + deltaY * u1step;
            let startV = T1.v + deltaY * v1step;
            let startW = T1.w + deltaY * w1step;
            let endU = T1.u + deltaY * u2step;
            let endV = T1.v + deltaY * v2step;
            let endW = T1.w + deltaY * w2step;
            if (bX < aX) { //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                [aX, bX] = [bX, aX];
                [startU, endU] = [endU, startU];
                [startV, endV] = [endV, startV];
                [startW, endW] = [endW, startW];
            }
            const tStep = 1 / (bX - aX);
            let indexY = i * SCREEN_WIDTH;
            let t = 0;
            for (let j = aX; j < bX; j++, indexY++) {
                u = (1 - t) * startU + t * endU; // TODO: change to u = startU, u+= tStep*u - tStep*startU
                v = (1 - t) * startV + t * endV;
                w = (1 - t) * startW + t * endW;
                let x = Math.floor(u / w * texture.width);
                let y = Math.floor(v / w * texture.width);
                let index = (y * texture.width + x) << 2; //TODO: optimize
                paintPixelBuffer(indexY, w, texture.dataArray[index], texture.dataArray[index + 1], texture.dataArray[index + 2], texture.dataArray[index + 3]);
                t += tStep;
            }
        }
    }
    dx1 = P3.x - P2.x;
    dy1 = P3.y - P2.y;
    du1 = T3.u - T2.u;
    dv1 = T3.v - T2.v;
    dw1 = T3.w - T2.w;
    u1step = 0;
    v1step = 0;
    if (dy1) {
        aXstep = dx1 / absDY1;
        u1step = du1 / absDY1;
        v1step = dv1 / absDY1;
        w1step = dw1 / absDY1;
    }
    if (dy2) {
        bXstep = dx2 / absDY2;
    }
    if (dy1) {
        for (let i = P2.y; i <= P3.y; i++) {
            const deltaY = i - P1.y;
            const deltaY2 = i - P2.y;
            let aX = Math.floor(P2.x + deltaY2 * aXstep);
            let bX = Math.floor(P1.x + deltaY * bXstep);
            let startU = T2.u + deltaY2 * u1step;
            let startV = T2.v + deltaY2 * v1step;
            let startW = T2.w + deltaY2 * w1step;
            let endU = T1.u + deltaY * u2step;
            let endV = T1.v + deltaY * v2step;
            let endW = T1.w + deltaY * w2step;
            if (bX < aX) { //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                [aX, bX] = [bX, aX];
                [startU, endU] = [endU, startU];
                [startV, endV] = [endV, startV];
                [startW, endW] = [endW, startW];
            }
            const tStep = 1 / (bX - aX);
            const indexY = i * SCREEN_WIDTH;
            let t = 0;
            for (let j = aX; j < bX; j++) {
                u = (1 - t) * startU + t * endU; // TODO: change to u = startU, u+= tStep*u - tStep*startU
                v = (1 - t) * startV + t * endV;
                w = (1 - t) * startW + t * endW;
                let x = Math.floor(u / w * texture.width);
                let y = Math.floor(v / w * texture.width);
                let index = (y * texture.width + x) << 2; //TODO: optimize
                paintPixelBuffer(indexY, w, texture.dataArray[index], texture.dataArray[index + 1], texture.dataArray[index + 2], texture.dataArray[index + 3]);
                t += tStep;
            }
        }
    }
}
