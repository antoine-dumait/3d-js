import { Vector3D, Triangle, Matrix4x4, Mesh, Camera, Vector2D } from './utils3D.js';
import { Controller } from './utils.js';
import { Face, Block } from './world.js';
let fps_counter = document.getElementById("fps");
function showFPS(deltaTime){
    let FPS = Math.round(1000/deltaTime);
    fps_counter.textContent = FPS;
}
let viewLocked = false;
document.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  viewLocked = Boolean(document.pointerLockElement);
});


let cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d", { alpha: false });
let cnvWidth = 1000;
let cnvHeight = 700;
cnv.width = cnvWidth;
cnv.height = cnvHeight;

let resolutionDivider = 1;
let resWidth = cnvWidth / resolutionDivider;
let resHeight = cnvHeight / resolutionDivider;
let imageData = ctx.createImageData(1, 1);
// let imageData = ctx.createImageData(cnvWidth, cnvHeight);
// imageData.data[0] = 255;
// imageData.data[1] = 0;
// imageData.data[2] = 0;
// imageData.data[3] = 255;

function drawTriangle(x0, y0, x1, y1, x2, y2, color){
    ctx.beginPath();
    // ctx.strokeStyle = color;
    ctx.fillStyle = color;
    y0 = cnvHeight - y0;
    y1 = cnvHeight - y1;
    y2 = cnvHeight - y2;
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x0, y0);
    ctx.closePath()
    // ctx.fill();
    ctx.stroke();
}

function paintPixel(x, y, r, g, b, a=255){
    // let index = y * cnvWidth * 4 + (x * 4)
    // imageData.data[index] = r;
    // imageData.data[index + 1] = g;
    // imageData.data[index + 2] = b;
    // imageData.data[index + 3] = a;
    imageData.data[0] = r;
    imageData.data[1] = g;
    imageData.data[2] = b;
    imageData.data[3] = a;
    for (let i=0; i<resolutionDivider; i++){
        for (let j=0; j<resolutionDivider; j++){
            ctx.putImageData(imageData, x+j, y+i);
        }
    }
}

function texturedTriangle(
    x1, y1, u1, v1,
    x2, y2, u2, v2, 
    x3, y3, u3, v3,
    sprite, color){
    // ctx.fillStyle = color;
    if(y2 < y1){
        [y1, y2] = [y2, y1];
        [x1, x2] = [x2, x1];
        [u1, u2] = [u2, u1];
        [v1, v2] = [v2, v1];
    }      
    
    if(y3 < y1){
        [y1, y3] = [y3, y1];
        [x1, x3] = [x3, x1];
        [u1, u3] = [u3, u1];
        [v1, v3] = [v3, v1];
    }  
    
    if(y3 < y2){
        [y2, y3] = [y3, y2];
        [x2, x3] = [x3, x2];
        [u2, u3] = [u3, u2];
        [v2, v3] = [v3, v2];
    }  
    
    let dy1 = y2 - y1;
    let dx1 = x2 - x1;
    let du1 = u2 - u1;
    let dv1 = v2 - v1;

    let dy2 = y3 - y1;
    let dx2 = x3 - x1;
    let du2 = u3 - u1;
    let dv2 = v3 - v1;

    let aXstep = 0, bXstep = 0; //a parti droite, b parti gauche
    let u1step = 0, v1step = 0;
    let u2step = 0, v2step = 0;

    if(dy1) aXstep = dx1 / Math.abs(dy1);
    if(dy2) bXstep = dx2 / Math.abs(dy2);

    if(dy1) u1step = du1 / Math.abs(dy1);
    if(dy1) v1step = du1 / Math.abs(dy1);

    if(dy2) u2step = du2 / Math.abs(dy2);
    if(dy2) v2step = du2 / Math.abs(dy2);

    if(dy1){
        for (let i=y1; i<=y2; i++){
            let aX = x1 + (i - y1) * aXstep;
            let bX = x1 + (i - y1) * bXstep;

            let startU = u1 + (i - y1) * u1step;
            let startV = v1 + (i - y1) * v1step;
            
            let endU = u1 + (i - y1) * u2step;
            let endV = v1 + (i - y1) * v2step;

            if (bX < aX){ //bx doit etre a droite et ax a gauche, traversé horizontale
                [aX, bX] = [bX, aX];
                [startU, endU] = [endU, startU];
                [startV, endV] = [endV, startV];
            }

            let u = startU;
            let v = startV;

            let tStep =  1 / (bX - aX);
            let t = 0;
            // console.log(y2-y1);
            // ctx.rect(aX,i,bX-aX, 1);
            // console.log(aX,i,bX-aX, 1);
            for (let j=aX; j < bX; j++){

                u = (1 - t) * startU + t * endU;
                v = (1 - t) * startV + t * endV;
                paintPixel(j, i, color[0], color[1], color[2]);
                // ctx.fillRect(j, i, 1, 1);
                t += tStep;
            }
        }
    }
    dy1 = y3 - y2;
    dx1 = x3 - x2;
    dv1 = v3 - v2;
    du1 = u3 - u2;

    u1step = 0;
    v1step = 0;

    if(dy1) aXstep = dx1 / Math.abs(dy1);
    if(dy2) bXstep = dx2 / Math.abs(dy2);

    if(dy1) u1step = du1 / Math.abs(dy1);
    if(dy1) v1step = du1 / Math.abs(dy1);

    if(dy1){
        for (let i=y2; i<=y3; i++){
            let aX = x2 + (i - y2) * aXstep;
            let bX = x1 + (i - y1) * bXstep;

            let startU = u2 + (i - y2) * u1step;
            let startV = v2 + (i - y2) * v1step;
            // console.log(v2 , i , y2, v1step);
            // console.log("start", startU, startV);
            
            let endU = u1 + (i - y1) * u2step;
            let endV = v1 + (i - y1) * v2step;

            if (bX < aX){ //bx doit etre a droite et ax a gauche, traversé horizontale
                [aX, bX] = [bX, aX];
                [startU, endU] = [endU, startU];
                [startV, endV] = [endV, startV];
            }

            startU = Math.max(0, startU);
            startV = Math.max(0, startV);
            let u = startU;
            let v = startV;

        
            let tStep =  1 / (bX - aX);
            let t = 0;
            // console.log("end", endU, endV);
            // console.log("start", startU, startV);
            for (let j=aX; j < bX; j++){

                u = (1 - t) * startU + t * endU;
                v = (1 - t) * startV + t * endV;
                // let newColor = getColorPixelSprite(sprite, u, v);
                // console.log(newColor);
                // paintPixel(j, i, newColor[0], newColor[1], newColor[2]);
                paintPixel(j, i, color[0], color[1], color[2]);
                // ctx.fillRect(j, i, 1, 1);
                t += tStep;
            }
        }
    }
}
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

function nameToRgba(name) {
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
context.fillStyle = name;
context.fillRect(0,0,1,1);
return context.getImageData(0,0,1,1).data;
}
// console.log(sprite);
function getColorPixelSprite(sprite, u , v){
    let x = Math.max(0,Math.floor(u * (sprite.length - 1)));
    let y = Math.max(0,Math.floor(v * (sprite.length - 1)));
    // console.log(u, v);
    // console.log(x,y);
    return sprite[y][x];
}
for(let i=0; i<sprite.length; i++){
    sprite[i] = sprite[i].map(colorName => nameToRgba(colorName));
}
// sprite = sprite.map(colorName => nameToRgba(colorName));
// console.log(sprite);
// console.log(getColorPixelSprite(sprite, 0.1, 0.19));

function dropHandler(ev) {
    let mesh = this;
    console.log("File(s) dropped");
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.stopPropagation();
    console.log(ev.target.files);
    if (ev.target.files) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.target.files].forEach((item, i) => {
        // If dropped items aren't files, reject them
          const file = item;
          console.log(`… file[${i}].name = ${file.name}`);
          let promise = file.text();
          promise.then((response)=>{
            changeObject(response, mesh);
          });
        });
    }
}

function changeObject(response, mesh){
    let verts = [];
    let tris = [];
    let lines = response.split("\n");
    let i = 0;
    lines.forEach( (line) =>{
        let typeLength = line.indexOf(" ");
        let type = line.slice(0, typeLength);
        let data = line.slice(typeLength+1); //account for the space after denominator
        if (type == "v") {
            let values = data.split(" ");
            values = values.map((x)=> parseFloat(x));
            verts.push(new Vector3D(...values));
        }else if (type == "f") {
            let p = data.split(" ");
            p = p.map((x)=> parseInt(x));
            let tri = new Triangle([verts[p[0]-1], verts[p[1]-1], verts[p[2]-1]]); // .obj triangles index start at 1, us starts at 0
            tri.id = i;
            i++;
            tris.push(tri); //obj indexed start at 1, us starts at 0
        }
    })
    mesh.changeVertices(verts);
    mesh.changeTriangles(tris);
    colors = getColors(mesh.tris.length);
}

let controller = new Controller();
controller.initialize();

let verts = [[0,0,0], [0,1,0], [1,0,0], [1,1,0], [1,0,1], [1,1,1], [0,0,1], [0,1,1]];
let tris = [[0,1,2], [1,3,2], [2,3,4], [3,5,4], [5,6,4], [7,6,5], [0,6,7], [1,0,7], [3,1,5], [5,1,7], [0,2,4], [4,6,0]];
let tex =   [   [[0,0], [0,1], [1,0]], [[0,0], [1,0], [1,1]], [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]], 
                [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]], 
                [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]], [[0,0], [0,1], [1,0]]
            ];
let newVerts = [];
let newTris = [];

for (let i=0; i<verts.length; i++){
    let vect = new Vector3D(...verts[i]);
    newVerts.push(vect)
}
for (let i=0; i<tris.length; i++){
    let tri = new Triangle();
    tri.p[0] = newVerts[tris[i][0]];
    tri.p[1] = newVerts[tris[i][1]];
    tri.p[2] = newVerts[tris[i][2]];
    tri.t[0] = new Vector2D(tex[i][0][0], tex[i][0][1]);
    tri.t[1] = new Vector2D(tex[i][1][0], tex[i][1][1]);
    tri.t[2] = new Vector2D(tex[i][2][0], tex[i][2][1]);
    newTris.push(tri);
}

let meshRotationSpeed = 1;
let mesh = new Mesh(newVerts, newTris, meshRotationSpeed);
// document.getElementById("file_browse").addEventListener("change", dropHandler.bind(mesh));


let lightDirection = new Vector3D(0, 0, -1);
lightDirection = Vector3D.normalise(lightDirection);

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
let colors = getColors(mesh.tris.length);

function random(min, max){
    return min + (Math.random() * (max - min));
}

function randomVector(){
    return new Vector3D(random(-100, 100), random(-100, 100), random(-100, 100))
}

let block  = new Block(new Vector3D(0,0,0), nameToRgba("red"));
let block1  = new Block(new Vector3D(10,0,0), nameToRgba("green"));
let block2  = new Block(new Vector3D(0,0,10), nameToRgba("blue"));
let block3  = new Block(new Vector3D(0,10,0), nameToRgba("yellow"));

let objects = [block, block1, block2, block3];
objects.push(block);
let testTri = [];

for (let i=0; i<1000; i++){
    objects.push(new Block(randomVector(), randomRGBColor()))
}

objects.forEach(objet => {
    testTri.push(...objet.getTriangles());
});

console.log(testTri);

mesh.changeTriangles(testTri);
console.log(mesh.tris);

let near = 0.1;
let far = 100.0;
let FOVdegrees = 90.0;
let aspectRatio = cnvHeight / cnvWidth;
let matrixProjection = Matrix4x4.makeProjection(FOVdegrees, aspectRatio, near, far);

let deltaTime = 0; //en millisecondes
let movementSpeed = 0.01;
let deltaMovementSpeed = movementSpeed * deltaTime;
let rotationSpeed = 0.03;
let camera = new Camera(movementSpeed, rotationSpeed);
camera.initialize();
let up = new Vector3D(0, 1, 0);

let lastTime = 0;
function update(timeStamp=0){
    //set deltaTime et movementSpeed en ajustant
    deltaTime = timeStamp - lastTime; 
    // deltaTime = 1;
    showFPS(deltaTime);
    deltaMovementSpeed = movementSpeed * deltaTime;
    camera.movementSpeed = deltaMovementSpeed;
    lastTime=timeStamp;
    ctx.clearRect(0, 0, cnvWidth, cnvHeight);
    // if(!Object.values(controller.keys).includes(true)){ // si pas d'input pas de maj
    //     window.requestAnimationFrame(update, timeStamp);
    //     return;
    // }
    
    // console.clear();

    mesh.update(controller); //get input and feed it to object or cam
    camera.update(controller);
    camera.locked = viewLocked;
    // console.log(camera.viewLocked);
    lightDirection = Matrix4x4.multiplyVector(Matrix4x4.rotation(0,mesh.rotationSpeed%(Math.PI*2)/100,0), lightDirection);
    
    // ctx.fillStyle = "black";
    // ctx.clearRect(0,0, cnvWidth, cnvHeight);
    // ctx.fillRect(0,0, cnvWidth, cnvHeight); 

    let trisToView = [] //[tri, ...]
    let zOffset = 2;
    let matrixZOffset = Matrix4x4.translation(0, 0, zOffset);
    // let worldMatrix = Matrix4x4.multiplyMatrix(rotZMatrix, rotXMatrix);
    let worldMatrix = Matrix4x4.getIdentity();
    worldMatrix = Matrix4x4.multiplyMatrix(worldMatrix, matrixZOffset);
   
    let matrixCameraRotation = Matrix4x4.rotationY(camera.yaw);
    // matrixCameraRotation = Matrix4x4.multiplyMatrix(matrixCameraRotation, Matrix4x4.rotationX(camera.pitch));
    let target = new Vector3D(0, 0, 1);

    camera.lookDirection = Matrix4x4.multiplyVector(matrixCameraRotation, target);

    let newTarget = Vector3D.add(camera.pos, camera.lookDirection);
    // console.log(newTarget);
    let matrixCamera = Matrix4x4.pointAt(camera.pos, newTarget, up);
    let matrixView = Matrix4x4.quickInverse(matrixCamera);


    // transformation pipeline
    let i=0;
    mesh.tris.forEach( tri => {
        let triTransformed = new Triangle();
        triTransformed.p[0] = Matrix4x4.multiplyVector(worldMatrix, tri.p[0]);
        triTransformed.p[1] = Matrix4x4.multiplyVector(worldMatrix, tri.p[1]);
        triTransformed.p[2] = Matrix4x4.multiplyVector(worldMatrix, tri.p[2]);
        
        triTransformed.t = tri.t;        
        triTransformed.updateNormal();

        triTransformed.id = i;
        triTransformed.color = tri.color;
        i++;

        let cameraRay = Vector3D.sub(triTransformed.p[0], camera.pos);
        if(Vector3D.dotProduct(triTransformed.normal, cameraRay) < 0){ 

            //world space -> view space
            let triViewed = new Triangle();
            triViewed.id = triTransformed.id;
            triViewed.p[0] = Matrix4x4.multiplyVector(matrixView, triTransformed.p[0]);
            triViewed.p[1] = Matrix4x4.multiplyVector(matrixView, triTransformed.p[1]);
            triViewed.p[2] = Matrix4x4.multiplyVector(matrixView, triTransformed.p[2]);
            triViewed.t = triTransformed.t;
            triViewed.color = triTransformed.color;
            //view space donc clip plane juste plan en face de nous a z = clip distance
            let clipDistance = 0.5;
            let clipPlane = new Vector3D(0, 0, clipDistance); //point de notre plan, juste devant nous
            
            //z pointe en face de nous, donc normal au plan est z
            let clipPlaneNormal = new Vector3D(0, 0, 1);
            let tris = Triangle.clipPlane(clipPlane, clipPlaneNormal, triViewed);
            
            function triangleProjection(tri, offsetVector){
                //projection,  3D -> 2D
                tri.p[0] = Matrix4x4.multiplyVector(matrixProjection, tri.p[0]);
                tri.p[1] = Matrix4x4.multiplyVector(matrixProjection, tri.p[1]);
                tri.p[2] = Matrix4x4.multiplyVector(matrixProjection, tri.p[2]);
                
                //diviser par W pour rester dans espace cartésien ?? TODO : revoir
                tri.p[0] = Vector3D.divide(tri.p[0], tri.p[0].w)
                tri.p[1] = Vector3D.divide(tri.p[1], tri.p[1].w)
                tri.p[2] = Vector3D.divide(tri.p[2], tri.p[2].w)
                
                //re inversé X et Y
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

                // let lightDotProduct = Math.max(0.1, Vector3D.dotProduct(lightDirection, triTransformed.normal)); //getting normal from world space triangle
                let lightDotProduct = 1;
                // let color = "rgb(" + colors[triProjected.id].map((x) => Math.round(x*lightDotProduct)).join(",") + ")"
                // let color = colors[triProjected.id];
                // triProjected.setColor(color);

                trisToView.push(triProjected);
            });
        }
    })

    

    trisToView.sort(
        (a,b) => {
            let meanZa = (a.p[0].z + a.p[1].z + a.p[2].z) / 3;
            let meanZb = (b.p[0].z + b.p[1].z + b.p[2].z) / 3;
            return meanZa < meanZb;
        }
    );


    //repere ecran donc haut = 0,0,0,
    // ctx.beginPath();
    // ctx.strokeStyle = "red";

    let borderHautY = 50;  
    let planHaut = new Vector3D(0, cnvHeight - borderHautY, 0), normalPlanHaut = new Vector3D(0, -1, 0); 
    // ctx.moveTo(0, borderHautY); ctx.lineTo(cnvWidth, borderHautY);

    let borderBasY = cnvHeight - 50;  
    let planBas = new Vector3D(0, cnvHeight - borderBasY, 0), normalPlanBas = new Vector3D(0, 1, 0); 
    // ctx.moveTo(0, borderBasY); ctx.lineTo(cnvWidth, borderBasY);

    let borderGaucheX = 50;
    let planGauche = new Vector3D(borderGaucheX, 0, 0), normalPlanGauche = new Vector3D(1, 0, 0); 
    // ctx.moveTo(borderGaucheX, 0); ctx.lineTo(borderGaucheX, cnvHeight);

    let borderDroiteX = cnvWidth - 50;
    let planDroite = new Vector3D(borderDroiteX, 0, 0), normalPlanDroite = new Vector3D(-1, 0, 0); 
    // ctx.moveTo(borderDroiteX, 0); ctx.lineTo(borderDroiteX, cnvHeight);
    
    // ctx.closePath();
    // ctx.stroke();
    trisToView.forEach(tri => {
        
        let triangleQueue = [];
        triangleQueue.push(tri);
        let newTrianglesCount = 1;
        
        for(let i=0; i<4; i++){
            let newTriangles = [];
            while(newTrianglesCount > 0){
                let triToTest = triangleQueue.shift();
                newTrianglesCount--;
                newTriangles=[];
                switch(i){
                    case 0: newTriangles = Triangle.clipPlane(planHaut, normalPlanHaut, triToTest);                     
                    break;
                    case 1: newTriangles = Triangle.clipPlane(planBas, normalPlanBas, triToTest);
                    break;
                    case 2: newTriangles = Triangle.clipPlane(planGauche, normalPlanGauche, triToTest);
                    break;
                    case 3: newTriangles = Triangle.clipPlane(planDroite, normalPlanDroite, triToTest);
                    break;
                }
                triangleQueue.push(...newTriangles);
            }
            newTrianglesCount = triangleQueue.length;
        }
        // if(triangleQueue[0]) triangleQueue[0].color = "green";
    triangleQueue.forEach( tri => {

        texturedTriangle(
            tri.p[0].x, cnvHeight - tri.p[0].y, tri.t[0].u, tri.t[0].v,
            tri.p[1].x, cnvHeight - tri.p[1].y, tri.t[1].u, tri.t[1].v,
            tri.p[2].x, cnvHeight - tri.p[2].y, tri.t[2].u, tri.t[2].v,
            sprite, tri.color);

        // drawTriangle(
        //     tri.p[0].x, cnvHeight - tri.p[0].y,
        //     tri.p[1].x, cnvHeight - tri.p[1].y,
        //     tri.p[2].x, cnvHeight - tri.p[2].y,
        //     tri.color);
    });
});

    // console.log("updated");
    // ctx.putImageData(imageData, 0, 0);
    // imageData = ctx.createImageData(cnvWidth, cnvHeight);
    window.requestAnimationFrame(update);
    }

update();