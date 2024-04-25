import { GLOBAL } from "./setup.js";
import { drawLine } from "./utils3D.js";
export default class MyScreen {
    width;
    height;
    N_PIXELS;
    canvas;
    ctx;
    frameBufferSize;
    frameBuffer;
    cleanFrameBuffer;
    zBuffer;
    cleanZBuffer;
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.N_PIXELS = width * height;
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.frameBufferSize = this.N_PIXELS << 2; //TODO: vérifier si bitwise opération + rapide
        this.frameBuffer = this.ctx.createImageData(width, height);
        this.cleanFrameBuffer = new Uint8ClampedArray(this.frameBufferSize);
        for (let i = 3; i < this.frameBufferSize; i += 4) { //set opacity to 255 for each pixel
            this.cleanFrameBuffer[i] = 255;
        }
        // rgb(0,191,255) deepskyblue
        for (let i = 0; i < this.frameBufferSize; i += 4) { //set opacity to 255 for each pixel
            this.cleanFrameBuffer[i] = 0;
            this.cleanFrameBuffer[i + 1] = 191;
            this.cleanFrameBuffer[i + 2] = 255;
        }
        this.frameBuffer.data.set(this.cleanFrameBuffer);
        this.zBuffer = new Float32Array(this.N_PIXELS);
        this.cleanZBuffer = new Float32Array(this.N_PIXELS);
    }
    flushBuffer(buffer) {
        this.ctx.putImageData(buffer, 0, 0);
    }
    flushFrame() {
        this.flushBuffer(this.frameBuffer);
        this.frameBuffer;
        this.frameBuffer.data.set(this.cleanFrameBuffer);
        this.zBuffer.set(this.cleanZBuffer);
    }
    paintPixelBuffer(index, r, g, b) {
        GLOBAL.paintCallCount++;
        this.frameBuffer.data[index] = r;
        this.frameBuffer.data[index + 1] = g;
        this.frameBuffer.data[index + 2] = b;
    }
    drawTexturedTriangle(tri, texture, teint = false) {
        let textWidth = texture.width;
        let textDataArr = texture.dataArray;
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
        let absDY1 = Math.abs(dy1);
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
        if (dy1) {
            let aXstepTmp = aXstep;
            let u1stepTmp = u1step;
            let v1stepTmp = v1step;
            let w1stepTmp = w1step;
            let bXstepTmp = bXstep;
            let u2stepTmp = u2step;
            let v2stepTmp = v2step;
            let w2stepTmp = w2step;
            if (bXstep < aXstep) { //bx doit etre a droite et ax a gauche, traverse horizontale
                [aXstepTmp, bXstepTmp] = [bXstepTmp, aXstepTmp];
                [u1stepTmp, u2stepTmp] = [u2stepTmp, u1stepTmp];
                [v1stepTmp, v2stepTmp] = [v2stepTmp, v1stepTmp];
                [w1stepTmp, w2stepTmp] = [w2stepTmp, w1stepTmp];
            }
            let deltaY1 = 0;
            let startU = T1.u;
            let startV = T1.v;
            let startW = T1.w;
            let endU = T1.u;
            let endV = T1.v;
            let endW = T1.w;
            let aX;
            let bX;
            for (let i = P1.y; i <= P2.y; i++,
                deltaY1++,
                startU += u1stepTmp,
                startV += v1stepTmp,
                startW += w1stepTmp,
                endU += u2stepTmp,
                endV += v2stepTmp,
                endW += w2stepTmp) {
                aX = Math.floor(P1.x + deltaY1 * aXstepTmp);
                bX = Math.floor(P1.x + deltaY1 * bXstepTmp);
                const tStep = 1 / (bX - aX);
                let indexY = i * this.width + aX;
                let u = startU * textWidth;
                let v = startV * textWidth;
                let w = startW;
                let uStep = tStep * (endU - startU) * textWidth;
                let vStep = tStep * (endV - startV) * textWidth;
                let wStep = tStep * (endW - startW);
                let indexPaint = indexY * 4;
                // let tmpIndex = indexY * 4;
                // this.frameBuffer.data.set(tmpIndex, texture.dataArray.subarray())
                for (let j = aX; j < bX; j++,
                    u += uStep,
                    v += vStep,
                    w += wStep,
                    indexY++,
                    indexPaint += 4) {
                    if (this.zBuffer[indexY] < w) {
                        this.zBuffer[indexY] = w;
                        let indexText = (Math.floor(v / w) * textWidth * 4 + Math.floor(u / w) * 4); //TODO: optimize
                        if (!teint) {
                            this.paintPixelBuffer(indexPaint, textDataArr[indexText], textDataArr[indexText + 1], textDataArr[indexText + 2]);
                        }
                        else {
                            this.paintPixelBuffer(indexPaint, Math.floor(textDataArr[indexText] / 4 * 3), Math.floor(textDataArr[indexText + 1] / 4 * 3), Math.floor((textDataArr[indexText + 2] + 150) / 2)); //color mixing block color and blue
                        }
                    }
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
        absDY1 = Math.abs(dy1);
        if (dy1) {
            aXstep = dx1 / absDY1;
            u1step = du1 / absDY1;
            v1step = dv1 / absDY1;
            w1step = dw1 / absDY1;
        }
        if (dy2) {
            bXstep = dx2 / absDY2; //TODO: useful ?
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
                const indexY = i * this.width;
                let u = startU;
                let v = startV;
                let w = startW;
                let uStep = tStep * (endU - startU);
                let vStep = tStep * (endV - startV);
                let wStep = tStep * (endW - startW);
                for (let j = aX; j < bX; j++) {
                    if (this.zBuffer[indexY + j] < w) {
                        this.zBuffer[indexY + j] = w;
                        let x = Math.floor(u / w * textWidth);
                        let y = Math.floor(v / w * textWidth);
                        let index2 = (indexY + j) * 4;
                        let index = (y * textWidth + x) * 4; //TODO: optimize
                        //TODO: fix white line at bottom by switching array+3 to 255
                        if (!teint) {
                            this.paintPixelBuffer(index2, textDataArr[index], textDataArr[index + 1], textDataArr[index + 2]);
                        }
                        else {
                            this.paintPixelBuffer(index2, Math.floor(textDataArr[index] / 4 * 3), Math.floor(textDataArr[index + 1] / 4 * 3), Math.floor((textDataArr[index + 2] + 150) / 2)); //color mixing block color and blue
                        }
                    }
                    u += uStep;
                    v += vStep;
                    w += wStep;
                }
            }
        }
    }
    drawWireframeTriangle(tri) {
        let P1 = tri.p[0];
        let P2 = tri.p[1];
        let P3 = tri.p[2];
        P1.x = Math.floor(P1.x);
        P1.y = Math.floor(P1.y);
        P2.x = Math.floor(P2.x);
        P2.y = Math.floor(P2.y);
        P3.x = Math.floor(P3.x);
        P3.y = Math.floor(P3.y);
        drawLine(P1.x, P1.y, P1.w, P2.x, P2.y, P2.w, 255, 0, 0);
        drawLine(P2.x, P2.y, P2.w, P3.x, P3.y, P3.w, 0, 255, 0);
        drawLine(P3.x, P3.y, P3.w, P1.x, P1.y, P1.w, 0, 0, 255);
    }
}
