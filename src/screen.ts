import { GLOBAL, SCREEN_HEIGHT } from "./setup";
import Texture from "./texture";
import Triangle from "./triangle";

type Uint8 = number; //integer between 0 and 255


export default class MyScreen{
    width: number;
    height: number;
    N_PIXELS: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    frameBufferSize: number;
    frameBuffer: ImageData;
    cleanFrameBuffer: Uint8ClampedArray;
    zBuffer: Float32Array;
    cleanZBuffer: Float32Array;

    constructor(width : number, height : number){
        this.width = width;
        this.height = height;
        this.N_PIXELS = width * height;
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d", {alpha: false})!;
        this.frameBufferSize = this.N_PIXELS << 2; //TODO: vérifier si bitwise opération + rapide
        this.frameBuffer = this.ctx.createImageData(width, height);
        this.cleanFrameBuffer = new Uint8ClampedArray(this.frameBufferSize);
        for (let i = 3; i < this.frameBufferSize; i+=4){ //set opacity to 255 for each pixel
            this.cleanFrameBuffer[i] = 255;
        }
        // rgb(0,191,255) deepskyblue
        for (let i = 0; i < this.frameBufferSize; i+=4){ //set opacity to 255 for each pixel
            this.cleanFrameBuffer[i] = 0;
            this.cleanFrameBuffer[i+1] = 191;
            this.cleanFrameBuffer[i+2] = 255;
        }
        this.frameBuffer.data.set(this.cleanFrameBuffer);
        this.zBuffer = new Float32Array(this.N_PIXELS);
        this.cleanZBuffer = new Float32Array(this.N_PIXELS);
    }

    flushBuffer(buffer : ImageData){
        this.ctx.putImageData(buffer, 0, 0);
    }

    flushFrame(){
        let notYet = true;
        this.flushBuffer(this.frameBuffer);
        for (let i = 0; i < this.frameBuffer.height * this.frameBuffer.width; i++) {
            if((this.frameBuffer as any).data[i] == 67){
                // if(notYet){
                    // console.log("nice");
                    // console.log((this.frameBuffer as any).data[i]);
                    
                    // notYet = false;
                // }
            }            
        }
        this.frameBuffer
        this.frameBuffer.data.set(this.cleanFrameBuffer);
        this.zBuffer.set(this.cleanZBuffer);
    }

    paintPixelBuffer(index: number, w: number, r: Uint8, g: Uint8, b: Uint8, a: Uint8){
            //paintedPixelCount++;
            // if(GLOBAL.zero < 10){
                // console.log(index);
                // GLOBAL.zero ++
            // }
            this.frameBuffer.data[index] = r;
            this.frameBuffer.data[index + 1] = g;
            this.frameBuffer.data[index + 2] = b;
            this.frameBuffer.data[index + 3] = 255;
    }    

    drawTexturedTriangle(tri: Triangle, texture: Texture){
        // console.count();
        // console.log("draw");
        
        // console.log("drawTexturedTriangle");
        
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

            if(P2.y < P1.y){
                [P2, P1] = [P1, P2];
                [T2, T1] = [T1, T2];
            }

            if(P3.y < P1.y){
                [P3, P1] = [P1, P3];
                [T3, T1] = [T1, T3];
            }

            if(P3.y < P2.y){
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
            
            if(dy1) {
                aXstep = dx1 / absDY1;//si dy1 differrent de zero,
                u1step = du1 / absDY1;
                v1step = dv1 / absDY1;
                w1step = dw1 / absDY1;
            }

            if(dy2){
                bXstep = dx2 / absDY2;
                u2step = du2 / absDY2;
                v2step = dv2 / absDY2;
                w2step = dw2 / absDY2;
            } 
            
            if(dy1){
                // console.log(P1, P2, P3);
                
                for (let i = P1.y; i<=P2.y; i++){
                    const deltaY = i - P1.y;
                    let aX = Math.floor(P1.x + deltaY * aXstep);
                    let bX = Math.floor(P1.x + deltaY * bXstep);
        
                    let startU = T1.u + deltaY * u1step;
                    let startV = T1.v + deltaY * v1step;
                    let startW = T1.w + deltaY * w1step;
                    
                    let endU = T1.u + deltaY * u2step;
                    let endV = T1.v + deltaY * v2step;
                    let endW = T1.w + deltaY * w2step;

                    if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                        [aX, bX] = [bX, aX];
                        [startU, endU] = [endU, startU];
                        [startV, endV] = [endV, startV];
                        [startW, endW] = [endW, startW];
                    } 
        
                    const tStep =  1 / (bX - aX);
                    let indexY = i * this.width;
                    let u = startU;
                    let v = startV;
                    let w = startW;
                    let uStep = tStep*(endU - startU);
                    let vStep = tStep*(endV - startV);
                    let wStep = tStep*(endW - startW);

                    // let tmpIndex = indexY * 4;
                    // this.frameBuffer.data.set(tmpIndex, texture.dataArray.subarray())
                    for (let j=aX; j < bX; j++){
                        let index2 = (indexY + j)*4;
                        if(this.zBuffer[indexY + j] < w){
                            this.zBuffer[indexY + j] = w;
                            let x = Math.floor(u/w * texture.width);
                            let y = Math.floor(v/w * texture.width);
                            let index = (y * texture.width + x) * 4; //TODO: optimize
                            //TODO: fix white line at bottom by switching array+3 to 255
                            this.paintPixelBuffer(index2 , w, texture.dataArray[index], texture.dataArray[index+1], texture.dataArray[index+2], texture.dataArray[index+3]);
                            // t += tStep;
                        }
                            u += uStep;
                            v += vStep;
                            w += wStep;
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
        
            if(dy1){
                
                for (let i = P2.y; i<=P3.y; i++){
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
                    
                    if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                        [aX, bX] = [bX, aX];
                        [startU, endU] = [endU, startU];
                        [startV, endV] = [endV, startV];
                        [startW, endW] = [endW, startW];
                    } 
        
                    const tStep =  1 / (bX - aX);
                    const indexY = i * this.width;
                    let u = startU;
                    let v = startV;
                    let w = startW;
                    let uStep = tStep*(endU - startU);
                    let vStep = tStep*(endV - startV);
                    let wStep = tStep*(endW - startW);
                    
                    for (let j=aX; j < bX; j++){
                        if(this.zBuffer[indexY + j] < w){
                            this.zBuffer[indexY + j] = w;
                            let x = Math.floor(u/w * texture.width);
                            let y = Math.floor(v/w * texture.width);
                            let index2 = (indexY + j)*4;
                            let index = (y * texture.width + x) * 4; //TODO: optimize
                            //TODO: fix white line at bottom by switching array+3 to 255
                            this.paintPixelBuffer(index2 , w, texture.dataArray[index], texture.dataArray[index+1], texture.dataArray[index+2], texture.dataArray[index+3]);
                            // t += tStep;
                            
                        }
                        u += uStep;
                        v += vStep;
                        w += wStep;
                    }
                }
            }    
    }
}