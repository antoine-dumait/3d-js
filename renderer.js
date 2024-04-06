import { Vector3D, Triangle, Matrix4x4, Mesh, Camera, Vector2D } from './utilsThreeD.js';
import { Controller } from './utils.js';
import { Face, Block } from './world.js';
let fps_counter = document.getElementById("fps");
function showFPS(deltaTime){
    addDelta(deltaTime);
    const FPS = calculateFPS();
    fps_counter.textContent = FPS;
}


let viewLocked = false;
document.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  viewLocked = Boolean(document.pointerLockElement);
});
let triangleCount = 0;
const triangle_count_counter = document.getElementById("triangle_count");
function updateTriangleCountCounter(){
    triangle_count_counter.textContent = triangleCount;
}
let cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d", { alpha: false });
let cnvWidth = 1000;
let cnvHeight = 700;
cnv.width = cnvWidth;
cnv.height = cnvHeight;

let resolutionDivider = 1;
let resWidth = cnvWidth / resolutionDivider;
let resHeight = cnvHeight / resolutionDivider;


let imageData = ctx.createImageData(cnvWidth, cnvHeight);

let paintedPixelCount = 0;
function paintPixel(index, r, g, b, a, w){ // index = y * cnvWidth + x ;   
    // console.log(w); 
    // if(Math.floor(Math.random() * 10000) == 1){
    //     console.log(w);
    // }
    if(w > depthBuffer[index]){
        paintedPixelCount++;
        depthBuffer[index] = w;
        const paintIndex = index << 2; //bitwise decalage gauche, a << b = a * (b^2)
        imageData.data[paintIndex] = r;
        imageData.data[paintIndex + 1] = g;
        imageData.data[paintIndex + 2] = b;
        imageData.data[paintIndex + 3] = a;
    }    
        // console.log(r,g,b,a);
}


function drawLine(
    x1, y1, w1, 
    x2, y2, w2,
    r, g, b){
        
    let dx = x2 - x1; 
    let dy = y2 - y1;
    let incX = Math.sign(dx);
    let incY = Math.sign(dy);
    dx = Math.abs(dx);
    dy = Math.abs(dy);
    // console.log(index);
    if(dy == 0){ //horizontal line
        let index = y1 * cnvWidth +x1;
        // console.log("horizontal");
        // console.log("dy  = 0");
        // console.log(x1, x2, incX);
        for(let x=x1; x!=x2 + incX; x += incX){ //pas <= car descend ou monte donc !=
            // console.log(x);
            // paintPixel(index, 0, 200, 0);
            paintPixel(index, r, g, b);

            // console.log(index);
            index += incX; 
        }
    }

    else if(dx == 0){ //vertical line
        let index = y1 * cnvWidth +x1;
        // console.log("vertical");
        for(let y=y1; y!=y2 + incY; y += incY){
            // paintPixel(index, 200, 0, 0);
            paintPixel(index, r, g, b);
            index += cnvWidth*incY; 
        }
    }
    else if(dx >= dy){ //ligne + horizontale
        // console.log("+ horizontal");
        let index = y1 * cnvWidth + x1;

        let slope = 2 * dy;
        let error = -dx;
        let errorInc = -2 * dx;
        for(let x=x1; x!=x2 + incX; x += incX){
            // paintPixel(index, 0, 0, 255);
            paintPixel(index, r, g, b);

            index += incX; 
            error += slope;
            if(error >= 0){
                index += cnvWidth*incY;
                error += errorInc;
            }
        }
    }

    else {
        let index = y1 * cnvWidth +x1;

        // console.log("+ vertical");
        let slope = 2 * dx;
        let error = -dy;
        let errorInc = -2 * dy;        
        for(let y=y1; y!=y2 + incY; y += incY){
            // paintPixel(index, 255, 255, 255);
            paintPixel(index, r, g, b);

            index += cnvWidth*incY; 
            error += slope;
            if(error >= 0){
                index += incX;
                error += errorInc;
            }
        }
    }
}

function wireframeTriangle(    
    x1, y1, w1, 
    x2, y2, w2,
    x3, y3, w3,
    r, g, b){
    triangleCount++;
    
    
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    x3 = Math.floor(x3);
    y3 = Math.floor(y3);

    drawLine(
        x1, y1, w1,  
        x2, y2, w2, 
        255,0,0);

    drawLine(
        x2, y2, w2,
        x3, y3, w3,
        0,255,0); 

    drawLine(
        x3, y3, w3,
        x1, y1, w1,
        0,0,255); 
    }

function fillTriangle(
    x1, y1, w1, 
    x2, y2, w2,
    x3, y3, w3,
    r, g, b){
    triangleCount++;
    
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    x3 = Math.floor(x3);
    y3 = Math.floor(y3);

    if(y2 < y1){
        [y1, y2] = [y2, y1];
        [x1, x2] = [x2, x1];
        [w1, w2] = [w2, w1];
    }      
    
    if(y3 < y1){
        [y1, y3] = [y3, y1];
        [x1, x3] = [x3, x1];
        [w1, w3] = [w3, w1];
    }  
    
    if(y3 < y2){
        [y2, y3] = [y3, y2];
        [x2, x3] = [x3, x2];
        [w2, w3] = [w3, w2];   
    } 

    
    let dy1 = y2 - y1;
    let dx1 = x2 - x1;
    let dw1 = w2 - w1;

    let dy2 = y3 - y1;
    let dx2 = x3 - x1;
    let dw2 = w3 - w1;

    let aXstep = 0, bXstep = 0; //a parti droite, b parti gauche
    let w1step = 0, w2step = 0;

    if(dy1) {
        aXstep = dx1 / Math.abs(dy1);//si dy1 differrent de zero,
        w1step = dw1 / Math.abs(dy1);
    }
    if(dy2){
        bXstep = dx2 / Math.abs(dy2);
        w2step = dw2 / Math.abs(dy2);
    } 
    let w;
    if(dy1){
        for (let i = y1; i<=y2; i++){
            const deltaY = i - y1
            let aX = Math.floor(x1 + deltaY * aXstep);
            let bX = Math.floor(x1 + deltaY * bXstep);

            let startW = w1 + deltaY * w1step;
            let endW = w1 + deltaY * w2step;
            
            if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                [aX, bX] = [bX, aX];
                [startW, endW] = [endW, startW];
            } 

            const tStep =  1 / (bX - aX);
            const indexY = i * cnvWidth;
            let t = 0;
            for (let j=aX; j < bX; j++){
                w = (1 - t)*startW  +  t*endW;
                const index = indexY + j;
                paintPixel(index,r,g,b,255,w);
                t += tStep;
            }
        }
    }

    dy1 = y3 - y2;
    dx1 = x3 - x2;
    dw1 = w3 - w2;

    if (dy1) aXstep = dx1 / Math.abs(dy1);
    if (dy1) w1step = dw1 / Math.abs(dy1);
    if (dy2) bXstep = dx2 / Math.abs(dy2);


    if(dy1){
        for (let i = y2; i<=y3; i++){
            const deltaY = i - y1;
            const deltaY2 = i - y2;
            let aX = Math.floor(x2 + deltaY2 * aXstep);
            let bX = Math.floor(x1 + deltaY * bXstep);

            let startW = w1 + deltaY2 * w1step;
            let endW = w1 + deltaY * w2step;
            
            if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                [aX, bX] = [bX, aX];
                [startW, endW] = [endW, startW];
            } 

            const tStep =  1 / (bX - aX);
            const indexY = i * cnvWidth;
            let t = 0;
            for (let j=aX; j < bX; j++){
                const index = indexY + j;
                w = (1 - t)*startW  +  t*endW;
                paintPixel(index,r,g,b,255,w);
                t += tStep;
            }
        }
    }
}

function texturedTriangle(
    x1, y1, u1, v1, w1,
    x2, y2, u2, v2, w2,
    x3, y3, u3, v3, w3,
    texture){

        triangleCount++;

        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        x3 = Math.floor(x3);
        y3 = Math.floor(y3);
    
        if(y2 < y1){
            [y1, y2] = [y2, y1];
            [x1, x2] = [x2, x1];
            [u1, u2] = [u2, u1];
            [v1, v2] = [v2, v1];
            [w1, w2] = [w2, w1];
        }      
        
        if(y3 < y1){
            [y1, y3] = [y3, y1];
            [x1, x3] = [x3, x1];
            [u1, u3] = [u3, u1];
            [v1, v3] = [v3, v1];
            [w1, w3] = [w3, w1];
        }  
        
        if(y3 < y2){
            [y2, y3] = [y3, y2];
            [x2, x3] = [x3, x2];
            [u2, u3] = [u3, u2];   
            [v2, v3] = [v3, v2];   
            [w2, w3] = [w3, w2];   
        } 
    
        
        let dy1 = y2 - y1;
        let dx1 = x2 - x1;
        let du1 = u2 - u1;
        let dv1 = v2 - v1;
        let dw1 = w2 - w1;
    
        let dy2 = y3 - y1;
        let dx2 = x3 - x1;
		let du2 = u3 - u1;
        let dv2 = v3 - v1;
        let dw2 = w3 - w1;
    
        let aXstep = 0, bXstep = 0; //a parti droite, b parti gauche
        let u1step = 0, u2step = 0;
        let v1step = 0, v2step = 0;
        let w1step = 0, w2step = 0;
    
        if(dy1) {
            aXstep = dx1 / Math.abs(dy1);//si dy1 differrent de zero,
            u1step = du1 / Math.abs(dy1);
            v1step = dv1 / Math.abs(dy1);
            w1step = dw1 / Math.abs(dy1);
        }
        if(dy2){
            bXstep = dx2 / Math.abs(dy2);
            u2step = du2 / Math.abs(dy2);
            v2step = dv2 / Math.abs(dy2);
            w2step = dw2 / Math.abs(dy2);
        } 
        let w;
        let u;
        let v;
        if(dy1){
            for (let i = y1; i<=y2; i++){
                const deltaY = i - y1
                let aX = Math.floor(x1 + deltaY * aXstep);
                let bX = Math.floor(x1 + deltaY * bXstep);
    
                let startU = u1 + deltaY * u1step;
                let startV = v1 + deltaY * v1step;
                let startW = w1 + deltaY * w1step;
                
                let endU = u1 + deltaY * u2step;
                let endV = v1 + deltaY * v2step;
                let endW = w1 + deltaY * w2step;

                if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                    [aX, bX] = [bX, aX];
                    [startU, endU] = [endU, startU];
                    [startV, endV] = [endV, startV];
                    [startW, endW] = [endW, startW];
                } 
    
                const tStep =  1 / (bX - aX);
                const indexY = i * cnvWidth;
                let t = 0;
                for (let j=aX; j < bX; j++){
                    u = (1 - t)*startU  +  t*endU;
                    v = (1 - t)*startV  +  t*endV;
                    w = (1 - t)*startW  +  t*endW;
                    const index = indexY + j;
                    paintPixel(index, ...getColorPixelSprite(texture, u, v, w), w);
                    t += tStep;
                }
            }
        }
    
        dx1 = x3 - x2;
        dy1 = y3 - y2;
        du1 = u3 - u2;
        dv1 = v3 - v2;
        dw1 = w3 - w2;
    
        u1step = 0;
        v1step = 0;

        if (dy1) {
            aXstep = dx1 / Math.abs(dy1);
            u1step = du1 / Math.abs(dy1);
            v1step = dv1 / Math.abs(dy1);
            w1step = dw1 / Math.abs(dy1); 
        }

        if (dy2) {
            bXstep = dx2 / Math.abs(dy2);
        }
    
        if(dy1){
            for (let i = y2; i<=y3; i++){
                const deltaY = i - y1;
                const deltaY2 = i - y2;
                let aX = Math.floor(x2 + deltaY2 * aXstep);
                let bX = Math.floor(x1 + deltaY * bXstep);
    
                let startU = u2 + deltaY2 * u1step;
                let startV = v2 + deltaY2 * v1step;
                let startW = w2 + deltaY2 * w1step;
                
                let endU = u1 + deltaY * u2step;
                let endV = v1 + deltaY * v2step;
                let endW = w1 + deltaY * w2step;
                
                if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                    [aX, bX] = [bX, aX];
                    [startU, endU] = [endU, startU];
                    [startV, endV] = [endV, startV];
                    [startW, endW] = [endW, startW];
                } 
    
                const tStep =  1 / (bX - aX);
                const indexY = i * cnvWidth;
                let t = 0;
                for (let j=aX; j < bX; j++){
                    u = (1 - t)*startU  +  t*endU;
                    v = (1 - t)*startV  +  t*endV;
                    w = (1 - t)*startW  +  t*endW;
                    const index = indexY + j;
                    paintPixel(index, ...getColorPixelSprite(texture, u, v, w), w);
                    t += tStep;
                }
            }
        }    
}

function gradientTriangle(
    x1, y1, u1, v1, w1,
    x2, y2, u2, v2, w2,
    x3, y3, u3, v3, w3){

        triangleCount++;

        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        x3 = Math.floor(x3);
        y3 = Math.floor(y3);
    
        if(y2 < y1){
            [y1, y2] = [y2, y1];
            [x1, x2] = [x2, x1];
            [u1, u2] = [u2, u1];
            [v1, v2] = [v2, v1];
            [w1, w2] = [w2, w1];
        }      
        
        if(y3 < y1){
            [y1, y3] = [y3, y1];
            [x1, x3] = [x3, x1];
            [u1, u3] = [u3, u1];
            [v1, v3] = [v3, v1];
            [w1, w3] = [w3, w1];
        }  
        
        if(y3 < y2){
            [y2, y3] = [y3, y2];
            [x2, x3] = [x3, x2];
            [u2, u3] = [u3, u2];   
            [v2, v3] = [v3, v2];   
            [w2, w3] = [w3, w2];   
        } 
    
        
        let dy1 = y2 - y1;
        let dx1 = x2 - x1;
        let du1 = u2 - u1;
        let dv1 = v2 - v1;
        let dw1 = w2 - w1;
    
        let dy2 = y3 - y1;
        let dx2 = x3 - x1;
		let du2 = u3 - u1;
        let dv2 = v3 - v1;
        let dw2 = w3 - w1;
    
        let aXstep = 0, bXstep = 0; //a parti droite, b parti gauche
        let u1step = 0, u2step = 0;
        let v1step = 0, v2step = 0;
        let w1step = 0, w2step = 0;
    
        if(dy1) {
            aXstep = dx1 / Math.abs(dy1);//si dy1 differrent de zero,
            u1step = du1 / Math.abs(dy1);
            v1step = dv1 / Math.abs(dy1);
            w1step = dw1 / Math.abs(dy1);
        }
        if(dy2){
            bXstep = dx2 / Math.abs(dy2);
            u2step = du2 / Math.abs(dy2);
            v2step = dv2 / Math.abs(dy2);
            w2step = dw2 / Math.abs(dy2);
        } 
        let w;
        let u;
        let v;
        if(dy1){
            for (let i = y1; i<=y2; i++){
                const deltaY = i - y1
                let aX = Math.floor(x1 + deltaY * aXstep);
                let bX = Math.floor(x1 + deltaY * bXstep);
    
                let startU = u1 + deltaY * u1step;
                let startV = v1 + deltaY * v1step;
                let startW = w1 + deltaY * w1step;
                
                let endU = u1 + deltaY * u2step;
                let endV = v1 + deltaY * v2step;
                let endW = w1 + deltaY * w2step;

                if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                    [aX, bX] = [bX, aX];
                    [startU, endU] = [endU, startU];
                    [startV, endV] = [endV, startV];
                    [startW, endW] = [endW, startW];
                } 
    
                const tStep =  1 / (bX - aX);
                const indexY = i * cnvWidth;
                let t = 0;
                for (let j=aX; j < bX; j++){
                    u = (1 - t)*startU  +  t*endU;
                    v = (1 - t)*startV  +  t*endV;
                    w = (1 - t)*startW  +  t*endW;
                    const index = indexY + j;
                    paintPixel(index, 255, 255, 255, 255, w);
                    t += tStep;
                }
            }
        }
    
        dx1 = x3 - x2;
        dy1 = y3 - y2;
        du1 = u3 - u2;
        dv1 = v3 - v2;
        dw1 = w3 - w2;
    
        u1step = 0;
        v1step = 0;

        if (dy1) {
            aXstep = dx1 / Math.abs(dy1);
            u1step = du1 / Math.abs(dy1);
            v1step = dv1 / Math.abs(dy1);
            w1step = dw1 / Math.abs(dy1); 
        }

        if (dy2) {
            bXstep = dx2 / Math.abs(dy2);
        }
    
        if(dy1){
            for (let i = y2; i<=y3; i++){
                const deltaY = i - y1;
                const deltaY2 = i - y2;
                let aX = Math.floor(x2 + deltaY2 * aXstep);
                let bX = Math.floor(x1 + deltaY * bXstep);
    
                let startU = u2 + deltaY2 * u1step;
                let startV = v2 + deltaY2 * v1step;
                let startW = w2 + deltaY2 * w1step;
                
                let endU = u1 + deltaY * u2step;
                let endV = v1 + deltaY * v2step;
                let endW = w1 + deltaY * w2step;
                
                if (bX < aX){ //bx doit etre a droite et ax a gauche, traversÃ© horizontale
                    [aX, bX] = [bX, aX];
                    [startU, endU] = [endU, startU];
                    [startV, endV] = [endV, startV];
                    [startW, endW] = [endW, startW];
                } 
    
                const tStep =  1 / (bX - aX);
                const indexY = i * cnvWidth;
                let t = 0;
                for (let j=aX; j < bX; j++){
                    u = (1 - t)*startU  +  t*endU;
                    v = (1 - t)*startV  +  t*endV;
                    w = (1 - t)*startW  +  t*endW;
                    const index = indexY + j;
                        paintPixel(index, 255, 255, 255, 255, w);
                      t += tStep;
                }
            }
        }    
}

//return 1d array [r, g, b, a, ...] of image path
async function loadTexture(path, name){
    let tmpCNV = document.createElement('canvas');
    let tmpCTX = tmpCNV.getContext('2d');
    let textureWidth, textureHeight;
    let img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = path;
    }).then( 
        image => {
            textureWidth = image.naturalWidth;
            textureHeight = image.naturalHeight;
        },
        error => {throw error}
    );

    tmpCNV.width = textureWidth;
    tmpCNV.height = textureHeight;
    tmpCTX.drawImage(img, 0, 0);
    let data = tmpCTX.getImageData(0, 0, textureWidth, textureHeight).data;
    console.log(
    "Image loaded : \n" + 
    name + " at " + path + "\n" + 
    "Width : " + textureWidth + " Height : " + textureHeight);
    return [data, textureWidth, textureHeight];
}

// loadTexture('./CozyRoom.png', 'heart');
let tmpText = await loadTexture('./grass', 'heart');
let texture = {sprite: tmpText[0], width: tmpText[1], height: tmpText[2]};
console.log(texture);
// throw 'death';
let spritePath = "./color.spr"
let sprite = [];
await fetch(spritePath) //juste trop fort
  .then((res) => res.text())
  .then((text) => {
        let arr = text.replaceAll("\r\n"," ").split(" ");
        let chunkSize = Math.ceil(Math.sqrt(arr.length));
        let split = [];
        for (let i=0; i<arr.length; i+=chunkSize){
            let tmp = [];
            for (let j=0; j<chunkSize; j++){
                if(arr[i + j]){
                    tmp.push(arr[i + j]);
                } else {
                    tmp.push("white")
                }
            }
            split.push(tmp);
        }
        sprite = split;
    })
    .catch((e) => console.error(e));

async function getTextFromPath(path){
    let text;

    await fetch(path)
    .then(res => res.text())
    .then(fileText => {
        text = fileText;
    });

    return text;
}
async function loadModelFromObj(path, hasTexture = false){
    let data = await getTextFromPath(path);
    let lines = data.split("\n");
    let i = 0;
    let verts = [];
    let textVerts = [];
    let tris = [];
    lines.forEach((line) =>{
        let typeLength = line.indexOf(" ");
        let type = line.slice(0, typeLength);
        let data = line.slice(typeLength+1); //account for the space after denominator
        if (type == "v") {
            let values = data.split(" ");
            values = values.map((x)=> parseFloat(x));
            verts.push(new Vector3D(...values));
        } else if (type == "vt"){
            let values = data.split(" ");
            values = values.map((x)=> parseFloat(x));
            textVerts.push(new Vector2D(...values));
        }else if (type == "f") {
            let p = data.split(" ");
            p = p.map((x)=> parseInt(x));
            let tri = new Triangle([verts[p[0]-1], verts[p[1]-1], verts[p[2]-1]], [textVerts[p[0]-1], textVerts[p[1]-1], textVerts[p[2]-1]]); // .obj triangles index start at 1, us starts at 0
            tri.id = i;
            i++;
            tris.push(tri); //obj indexed start at 1, us starts at 0
        }
    });
    return tris;
}

let modelPath = "./treeLowPoly.obj";
let modelTris = await loadModelFromObj(modelPath);
// console.log(modelTris);
function nameToRgba(name) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.fillStyle = name;
    context.fillRect(0,0,1,1);
    return context.getImageData(0,0,1,1).data;
}
function getColorPixelSprite(texture, u, v, w){
    
    let x = Math.floor(u/w * texture.width);
    let y = Math.floor(v/w * texture.width);
    let index = (y * texture.width + x) << 2;
    return [texture.sprite[index], texture.sprite[index +1], texture.sprite[index+2], texture.sprite[index+3]];
}
for(let i=0; i<sprite.length; i++){
    sprite[i] = sprite[i].map(colorName => nameToRgba(colorName));
}

let controller = new Controller();
controller.initialize();

let meshRotationSpeed = 1;
let mesh = new Mesh([], [], meshRotationSpeed);

let lightDirection = new Vector3D(0, 0, -1);
lightDirection = Vector3D.normalise(lightDirection);

const depthBuffer = new Float32Array(cnvWidth*cnvHeight);

function getColors(length){
    let colors = [];
    for (let i = 0; i < length; i++) {
        // if(Math.random() > 0.5){
        //     colors.push([0,0,255]);
        // } else {
        //     colors.push([255,0,0]);            
        // }
        colors.push([Math.random()*255, Math.random()*255, Math.random()*255]); 
    }
    return colors;
}

function randomRGBColor(){
    return [Math.random()*255, Math.random()*255, Math.random()*255];
}
let colors = getColors(modelTris.length);

function random(min, max){
    return min + (Math.random() * (max - min));
}

function randomVector(){
    return new Vector3D(random(-100, 100), random(-100, 100), random(-100, 100))
}

let block  = new Block(new Vector3D(0,0,0), nameToRgba("red"));

let objects = [];
// objects.push(block);
block.pos = new Vector3D(1,1,1)
let objectsTri = [];
let mapSize = 10;
function generateBlock(objects){
    for(let x=0; x<mapSize; x++){
        for(let z=0; z<mapSize; z++){
            objects.push(new Block(new Vector3D(x, 0, z), randomRGBColor()));
        }
    }
    objects.forEach(objet => {
        objectsTri.push(...objet.getTriangles());
    });
}

generateBlock(objects);
// for(let x=0; x<mapSize; x++){
    //     for(let z=0; z<mapSize; z++){
        //         objects.push(new Block(new Vector3D(x, 1, z), nameToRgba("rgb(102, 51, 0)")))
        //     }
        // }
        // for(let y=2; y<5; y++){
            // for(let x=0; x<mapSize; x++){
                //     for(let z=0; z<mapSize; z++){
                    //         objects.push(new Block(new Vector3D(x, y, z), nameToRgba("grey")))
                    //     }
                    // }
                    // }
                    
// objectsTri.push(new Triangle());

// console.log(objectsTri);

mesh.changeTriangles(objectsTri);
// console.log(mesh.tris);

let near = 0.1;
let far = 100.0;
let FOVdegrees = 90.0;
let aspectRatio = cnvHeight / cnvWidth;
let matrixProjection = Matrix4x4.makeProjection(FOVdegrees, aspectRatio, near, far);

let deltaTime = 0; //en millisecondes
let deltaArray = [];
const maxDeltaVal = 20;
function addDelta(dt){
    if(deltaArray.length >= maxDeltaVal){
        deltaArray.shift();
    }
    deltaArray.push(dt);
}

function calculateFPS(){
    const delta = deltaArray.reduce((a,b) => a+b) / deltaArray.length;
    return Math.round(1000 / delta);
}
let movementSpeed = 0.01;
let deltaMovementSpeed = movementSpeed * deltaTime;
let rotationSpeed = 0.03;
let camera = new Camera(movementSpeed, rotationSpeed);
camera.initialize();
let up = new Vector3D(0, 1, 0);

let lastTime = 0;

document.body.addEventListener('click', (e) => {
    placeBlock();
});

function placeBlock(){
    let forward = Vector3D.add(camera.pos, camera.lookDirection);
    let newBlock = new Block(forward, block.color);
    mesh.tris.push(...newBlock.getTriangles());
}

let renderOn = {
    "wireframe": false,
    "fill": false,
    "texture": true,
};
function changeRender(type){
    renderOn[type] = !renderOn[type];
    document.getElementById(type+"_checkbox").getElementsByTagName("input")[0].checked = renderOn[type];
    }

var pause = false;
var wantLog = false;
document.body.addEventListener('keydown', (e) => {         //fonction anonyme to keep this as controller instance
    if(e.key == "p"){
        pause = !pause;
    }
    if(e.key == "w"){
        changeRender("wireframe");
    }
    if(e.key == "f"){
        changeRender("fill");
    }
    if(e.key == "t"){
        changeRender("texture");
    }
    if(e.key == "l"){
        wantLog = !wantLog
    }
    e.preventDefault();
});

let greenaArray8 = ctx.createImageData(cnvWidth, cnvHeight);
for(let i=0; i<cnvHeight*cnvWidth; i++){
    greenaArray8[i] = 255;
}

function showHolderBlock(){
    let blockFrontDistance = 10;
    let holderBlock = new Block(Vector3D.add(Vector3D.multiply(camera.lookDirection, blockFrontDistance), camera.pos), [255, 51, 204]);
    holderBlock.pos.floor();
    let triListe = holderBlock.getTriangles();
    for(let i=0; i<triListe.length; i++){
        mesh.tris.pop();
    }
    mesh.tris.push(...triListe);
}

// mesh.tris = modelTris;
// mesh.tris.forEach(tri => tri.color = randomRGBColor());
function update(timeStamp=0){
    if(pause){
        window.requestAnimationFrame(update);
        return;
    }
    showHolderBlock();
    // console.log("update");
    updateTriangleCountCounter();
    triangleCount = 0;
    //set deltaTime et movementSpeed en ajustant
    deltaTime = timeStamp - lastTime; 
    // deltaTime = 1;
    showFPS(deltaTime);
    deltaMovementSpeed = movementSpeed * deltaTime;
    camera.movementSpeed = deltaMovementSpeed;
    lastTime=timeStamp;
    // ctx.clearRect(0, 0, cnvWidth, cnvHeight);
    
    for(let i=0; i<cnvWidth*cnvHeight; i++){
        depthBuffer[i]=0;
    }

    mesh.update(controller); //get input and feed it to object or cam
    camera.update(controller);
    camera.locked = viewLocked;
    lightDirection = Matrix4x4.multiplyVector(Matrix4x4.rotation(0,mesh.rotationSpeed%(Math.PI*2)/100,0), lightDirection);

    let trisToView = [] //[tri, ...]
    let zOffset = 0;
    let matrixZOffset = Matrix4x4.translation(0, 0, zOffset);
    // let worldMatrix = Matrix4x4.multiplyMatrix(rotZMatrix, rotXMatrix);
    let worldMatrix = Matrix4x4.getIdentity();
    worldMatrix = Matrix4x4.multiplyMatrix(worldMatrix, matrixZOffset);
   
    let matrixCameraRotation = Matrix4x4.rotationY(camera.yaw);
    // matrixCameraRotation = Matrix4x4.multiplyMatrix(matrixCameraRotation, Matrix4x4.rotationX(camera.pitch));
    let target = new Vector3D(0, 0, 1);

    camera.lookDirection = Matrix4x4.multiplyVector(matrixCameraRotation, target);

    let newTarget = Vector3D.add(camera.pos, camera.lookDirection);

   
    let matrixCamera = Matrix4x4.pointAt(camera.pos, newTarget, up);
    let matrixView = Matrix4x4.quickInverse(matrixCamera);

    // transformation pipeline
    let i=0;
    mesh.tris.forEach( tri => {
        // console.log(tri.t[0].u, tri.t[1].u, tri.t[2].u);
        // console.log(tri.t[0].v, tri.t[1].v, tri.t[2].v);

        // console.log(tri.t[0].w, tri.t[1].w, tri.t[2].w);

        let triTransformed = tri.returnCopy();
        triTransformed.mapToAllPoints(p => Matrix4x4.multiplyVector(worldMatrix, p));   
        triTransformed.updateNormal();
        // console.log(triTransformed.normal);
        // triTransformed.id = i;
        i++;

        let cameraRay = Vector3D.sub(triTransformed.p[0], camera.pos);
        if(Vector3D.dotProduct(triTransformed.normal, cameraRay) < 0){ 
            // console.log(Vector3D.dotProduct(triTransformed.normal, cameraRay));

            //world space -> view space
            let triViewed = triTransformed;

            triViewed.mapToAllPoints(p => Matrix4x4.multiplyVector(matrixView, p));
            //view space donc clip plane juste plan en face de nous a z = clip distance
            let clipDistance = 0.5;
            let clipPlane = new Vector3D(0, 0, clipDistance); //point de notre plan, juste devant nous
            
            //z pointe en face de nous, donc normal au plan est z
            let clipPlaneNormal = new Vector3D(0, 0, 1);
            let tris = Triangle.clipPlane(clipPlane, clipPlaneNormal, triViewed);
            // let tris = [triViewed];
            
            function triangleProjection(tri, offsetVector){
                //projection,  3D -> 2D
               
                tri.mapToAllPoints(p => Matrix4x4.multiplyVector(matrixProjection, p));
                // console.log(tri.t[0].u, tri.t[1].u, tri.t[2].u);
                // console.log(tri.t[0].v, tri.t[1].v, tri.t[2].v);
                // console.log(tri.t[0].w, tri.t[1].w, tri.t[2].w);
                // console.log(tri.p[0].w, tri.p[1].w, tri.p[2].w);
                
                tri.t[0].u = tri.t[0].u / tri.p[0].w;
                tri.t[1].u = tri.t[1].u / tri.p[1].w;
                tri.t[2].u = tri.t[2].u / tri.p[2].w;

                tri.t[0].v = tri.t[0].v / tri.p[0].w;
                tri.t[1].v = tri.t[1].v / tri.p[1].w;
                tri.t[2].v = tri.t[2].v / tri.p[2].w;


                tri.t[0].w = 1 / tri.p[0].w;
                tri.t[1].w = 1 / tri.p[1].w;
                tri.t[2].w = 1 / tri.p[2].w;
        
                //diviser par W pour rester dans espace cartÃ©sien ?? TODO : revoir
                tri.p[0] = Vector3D.divide(tri.p[0], tri.p[0].w)
                tri.p[1] = Vector3D.divide(tri.p[1], tri.p[1].w)
                tri.p[2] = Vector3D.divide(tri.p[2], tri.p[2].w)
                
                //re inversÃ© X et Y
                tri.p[0].x *= -1; 
                tri.p[0].y *= -1; 
                tri.p[1].x *= -1; 
                tri.p[1].y *= -1; 
                tri.p[2].x *= -1; 
                tri.p[2].y *= -1; 
                
                //offset into screen
                tri.p[0] = Vector3D.add(tri.p[0], offsetVector);
                tri.p[1] = Vector3D.add(tri.p[1], offsetVector);
                tri.p[2] = Vector3D.add(tri.p[2], offsetVector);
                
                //scale to screen size
                tri.p[0].x *= (resWidth / 2); 
                tri.p[0].y *= (resHeight / 2); 
                tri.p[1].x *= (resWidth / 2); 
                tri.p[1].y *= (resHeight / 2); 
                tri.p[2].x *= (resWidth / 2); 
                tri.p[2].y *= (resHeight / 2); 
                return tri;
            }

            let offsetVector = new Vector3D(1, 1, 0); //offset tri points values x,y from (-1,1) to (0,2)
            tris.forEach( (triClipped) => {

                //3D -> 2D
                let triProjected = triangleProjection(triClipped, offsetVector);
                // console.log(triProjected.t);
                // let lightDotProduct = Math.max(0.1, Vector3D.dotProduct(lightDirection, triTransformed.normal)); //getting normal from world space triangle
                let lightDotProduct = 1;


                trisToView.push(triProjected);
            });
        }
    })

    

    // trisToView.sort(
    //     (a,b) => {
    //         let meanZa = (a.p[0].z + a.p[1].z + a.p[2].z);
    //         let meanZb = (b.p[0].z + b.p[1].z + b.p[2].z);
    //         return meanZa < meanZb;
    //     }
    // );


    //repere ecran donc haut = 0,0,0,
    // ctx.beginPath();
    // ctx.strokeStyle = "red";

    let borderHautY = 50;  
    let planHaut = new Vector3D(0, borderHautY, 0), normalPlanHaut = new Vector3D(0, 1, 0); 
    // ctx.moveTo(0, borderHautY); ctx.lineTo(cnvWidth, borderHautY);

    let borderBasY = cnvHeight - 50;  
    let planBas = new Vector3D(0, borderBasY, 0), normalPlanBas = new Vector3D(0, -1, 0); 
    // ctx.moveTo(0, borderBasY); ctx.lineTo(cnvWidth, borderBasY);

    let borderGaucheX = 50;
    let planGauche = new Vector3D(borderGaucheX, 0, 0), normalPlanGauche = new Vector3D(1, 0, 0); 
    // ctx.moveTo(borderGaucheX, 0); ctx.lineTo(borderGaucheX, cnvHeight);

    let borderDroiteX = cnvWidth - 50;
    let planDroite = new Vector3D(borderDroiteX, 0, 0), normalPlanDroite = new Vector3D(-1, 0, 0); 
    // ctx.moveTo(borderDroiteX, 0); ctx.lineTo(borderDroiteX, cnvHeight);
    
    // ctx.closePath();
    // ctx.stroke();
    // console.count();
    // console.log("coolk start", trisToView.length);
    // console.log(trisToView);
    trisToView.forEach(tri => {
        let triangleQueue = [tri];
        let newTrianglesCount = 1;
        
        for(let i=0; i<4; i++){
            let newTriangles = [];
            while(newTrianglesCount > 0){
                let triToTest = triangleQueue.shift();
                newTrianglesCount--;
                newTriangles=[];
                // console.log(...triToTest.p);
                switch(i){
                    case 0: newTriangles = Triangle.clipPlane(planHaut, normalPlanHaut, triToTest, true);
                        // console.log("i: " + i, newTriangles.length);                     
                        break;
                    case 1: 
                        newTriangles = Triangle.clipPlane(planBas, normalPlanBas, triToTest);
                        // newTriangles = [triToTest];
                        // console.log("i: " + i, newTriangles.length);                     
                        break;
                    case 2: 
                        newTriangles = Triangle.clipPlane(planGauche, normalPlanGauche, triToTest);
                        // console.log("2",newTriangles.length, triToTest);
                        // console.log("i: " + i, newTriangles.length);                     
                        break;
                    case 3: 
                        newTriangles = Triangle.clipPlane(planDroite, normalPlanDroite, triToTest);
                        // console.log("i: " + i, newTriangles.length);                     
                        break;
                }
                triangleQueue.push(...newTriangles);
            }
            newTrianglesCount = triangleQueue.length;
        }
        // console.log("coolk end", triangleQueue.length);

        triangleQueue.forEach( tri => {
        // console.clear();
        // console.log(tri.t[0].u, tri.t[1].u, tri.t[2].u);
        // console.log(tri.t[0].v, tri.t[1].v, tri.t[2].v);
        // console.log(tri.t[0].w, tri.t[1].w, tri.t[2].w);
        if(renderOn.wireframe){
            wireframeTriangle(
                tri.p[0].x, tri.p[0].y, tri.t[0].w,
                tri.p[1].x, tri.p[1].y, tri.t[1].w,
                tri.p[2].x, tri.p[2].y, tri.t[2].w,
                255, 255, 255);
        }
        if(renderOn.fill){
            fillTriangle(
                tri.p[0].x, tri.p[0].y, tri.t[0].w,
                tri.p[1].x, tri.p[1].y, tri.t[1].w,
                tri.p[2].x, tri.p[2].y, tri.t[2].w,
                tri.color[0], tri.color[1], tri.color[2]);
        }
        if(renderOn.texture){
            texturedTriangle(
                tri.p[0].x, tri.p[0].y, tri.t[0].u, tri.t[0].v, tri.t[0].w,
                tri.p[1].x, tri.p[1].y, tri.t[1].u, tri.t[1].v, tri.t[1].w,
                tri.p[2].x, tri.p[2].y, tri.t[2].u, tri.t[2].v, tri.t[2].w,
                texture);
        }
    });
});

    ctx.putImageData(imageData, 0, 0);
    imageData = ctx.createImageData(cnvWidth, cnvHeight);
    ctx.beginPath();
    ctx.strokeStyle = "red";

    ctx.moveTo(0, borderHautY); ctx.lineTo(cnvWidth, borderHautY);

    ctx.moveTo(0, borderBasY); ctx.lineTo(cnvWidth, borderBasY);
    ctx.moveTo(borderGaucheX, 0); ctx.lineTo(borderGaucheX, cnvHeight);

    ctx.moveTo(borderDroiteX, 0); ctx.lineTo(borderDroiteX, cnvHeight);
    
    ctx.closePath();
    ctx.stroke();
    // drawLine(100,100,0, 400,100,0,     255, 0, 0);
    // drawLine(100,100,0, 100,400,0,     0, 0, 255);
    // drawLine(513,174,0, 341,172,0,   0, 255, 0);
    if(wantLog){
        console.log(paintedPixelCount);
    }
    paintedPixelCount = 0;
    window.requestAnimationFrame(update);
    return;
    }

update();
