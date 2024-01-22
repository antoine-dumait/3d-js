let cnv = document.getElementById("canvas");
let ctx = cnv.getContext("2d");
let cnvWidth = 1000;
let cnvHeight = 700;
cnv.width = cnvWidth;
cnv.height = cnvHeight;

document.getElementById("file_drop").addEventListener("change", dropHandler);

document.body.addEventListener('keydown', function(e) {
    updateKeys(e.key, true)});
document.body.addEventListener('keyup', function(e) {
updateKeys(e.key, false)});


function dropHandler(ev) {
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
            changeObject(response);
          });
        });
    }
}

function changeObject(response){
    //vertices
    let regex = new RegExp("v (-?\\d*\\.\\d*) (-?\\d*\\.\\d*) (-?\\d*\\.\\d*)", "g");
    let data = response.matchAll(regex)
    vert = [];
    for (const trio of data){
        // console.log(trio);
        vert.push(...trio.slice(1).map(x=>parseFloat(x)));
    }
    // console.log(vert);

    //triangles
    regex = new RegExp("f (\\d*)/\\d*/\\d* (\\d*)/\\d*/\\d* (\\d*)/\\d*/\\d*", "g");
    data = response.matchAll(regex);
    tri = [];
    for (const trio of data){
        // console.log(trio);
        tri.push(...trio.slice(1).map(x=>parseFloat(x)-1));
    }
    for (let i = 0, j = 0; i < tri.length; i+=3, j+=1) {
        colors[j] = [Math.random()*255, Math.random()*255, Math.random()*255]; 
    }
    // console.log(tri);
}

function updateKeys(code,val) {
    switch (code) {
        case "ArrowLeft":
            aLeft=val;
            break; //Left key
        case "ArrowUp":
            aUp=val;
            break; //Up key
        case "ArrowRight":
            aRight=val;
            break; //Right key
        case "ArrowDown":
            aDown=val;
    }
}

function Vector3D(){
    return Array(4).fill(0);
}

function multiplyMatrixVector(v, m){
    let v2 = Vector3D();
    v2[0] = v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + m[3][0];
    v2[1] = v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + m[3][1];
    v2[2] = v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + m[3][2];
    let w = v[0] * m[0][3] + v[1] * m[1][3] + v[2] * m[2][3] + m[3][3];
    // console.log("v2 : ", v2);
    if (w != 0.0){
        v2[0] /= w; v2[1] /= w; v2[2] /= w;
    }

    return v2;
}
let objRotationX = 0;
let objRotationY = 0;
let objRotationZ = 0;

let near = 0.1;
let far = 100.0;
let FOV = 90.0;
let aspectRatio = cnvHeight / cnvWidth;
let FOVscaling = 1/Math.tan(FOV * 0.5 * Math.PI /180); 

// let matrixProjection = Array(4).fill(0).map(x => Array(4).fill(0));
let matrixProjection = Array.from(Array(4), () => Array(4).fill(0));
matrixProjection[0][0] = aspectRatio*FOVscaling;
matrixProjection[1][1] = FOVscaling;
matrixProjection[2][2] = far / (far - near);
matrixProjection[3][2] = (-far * near)  / (far - near);
matrixProjection[2][3] = 1;
matrixProjection[3][3] = 0;

// let vert = [-1,-1,-1, -1,3,-1, 3,3,-1, 3,-1,-1, 1,1,3, 1,1,-5];
//cube vert // [0,0,0, 0,1,0, 1,0,0, 1,1,0, 1,0,1, 1,1,1, 0,1,1, 1,0,1]
//cube tri // [0,1,2, 1,2,3, 2,3,4, 3,5,4, 4,6,5, 5,6,7, 7,6,0, 7,0,1]

let vert = [0,0,0, 0,1,0, 1,0,0, 1,1,0, 1,0,1, 1,1,1, 0,0,1, 0,1,1];
let tri = [0,1,2, 1,3,2, 2,3,4, 3,5,4, 5,6,4, 7,6,5, 0,6,7, 1,0,7, 3,1,5, 5,1,7, 0,2,4, 4,6,0];
// let vert = [0,0,0, 0,4,0, 4,4,0, 4,0,0, 2,2,5, 2,2,0];
// let tri = [0,1,4, 1,2,4, 2,3,4, 3,0,4, 0,1,5, 1,2,5, 2,3,5, 3,0,5,]; // 0,1,2, 0,2,3,

let cameraPos = [0,0,0];

function matrixRotation(X,Y,Z){
    let cX = Math.cos(X), sX = Math.sin(X);
    let cY = Math.cos(Y), sY = Math.sin(Y);
    let cZ = Math.cos(Z), sZ = Math.sin(Z);
    return [
        [cZ*cY,  cZ*sY*sX-sZ*cX, cZ*sY*cX+sZ*sX, 0],
        [sZ*cY,  sZ*sY*sX+cZ*cX, sZ*sY*cX-cZ*sX, 0],
        [-sY,    cY*sX,          cY*cX,          0],
        [0,      0,              0,              0]
    ];
}

function drawTri(x0, y0, x1, y1, x2, y2, color){
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x0, y0);
    ctx.fill();
    ctx.stroke();
}

let aLeft = false, aRight = false, aDown = false, aUp = false;
function controller(){
    let objRotationSpeed = 0.01;
    if(aLeft) objRotationY = (objRotationY - objRotationSpeed)%(2*Math.PI);
    if(aRight) objRotationY = (objRotationY + objRotationSpeed)%(2*Math.PI);
    if(aDown) objRotationX = (objRotationX - objRotationSpeed)%(2*Math.PI);
    if(aUp) objRotationX = (objRotationX + objRotationSpeed)%(2*Math.PI);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
function normalVector(x0, y0 , z0, x1, y1, z1, x2, y2, z2){
    let line1 = [];
    let line2 = [];
    let normal = [];
    line1[0] = x1 - x0;
    line1[1] = y1 - y0;
    line1[2] = z1 - z0;
    
    line2[0] = x2 - x0;
    line2[1] = y2 - y0;
    line2[2] = z2 - z0;
    // console.log(x0, y0 , z0, x1, y1, z1, x2, y2, z2);
    normal[0] = line1[1]*line2[2] - line1[2]*line2[1];
    normal[1] = line1[2]*line2[0] - line1[0]*line2[2];
    normal[2] = line1[0]*line2[1] - line1[1]*line2[0];
    // console.log(line1, line2);
    // console.log(normal);
    let normalLength = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
    // console.log(normalLength);
    let normalNormalized = [normal[0]/normalLength, normal[1]/normalLength, normal[2]/normalLength];

    return normal;
}

function normalizedVector(x,y,z){
    let length = Math.sqrt(x**2 + y**2 + z**2);
    x/=length; y/=length; z/=length;
    return [x,y,z];
}

let lightDirection = [0,0,-1];

lightDirection = normalizedVector(...lightDirection)

let lastTime = 0;
let frameVert = [];
let colors = [];
for (let i = 0, j = 0; i < tri.length; i+=3, j+=1) {
    colors[j] = [Math.random()*255, Math.random()*255, Math.random()*255]; 
}
console.log(colors.length);
function update(timeStamp=0){
    controller();
    let deltaTime = timeStamp - lastTime;
    let rotationSpeed = (deltaTime/1000);
    // objRotationX = (objRotationX + rotationSpeed)%(2*Math.PI);
    // objRotationY = (objRotationY + rotationSpeed)%(2*Math.PI);
    lightDirection = multiplyMatrixVector(lightDirection, matrixRotation(0,deltaTime%(Math.PI*2)/100,0));
    ctx.fillStyle = "green";
    ctx.clearRect(0,0, cnvWidth, cnvHeight);
    ctx.fillRect(0,0, cnvWidth, cnvHeight); 
    frameVert = [];
    let rotVert = [];
    let normals = [];
    for (let i = 0; i < vert.length; i+=3) {
        let vertX = vert[i];
        let vertY = vert[i+1];
        let vertZ = vert[i+2];
        
        
        // console.log(matrixRotation(objRotationX, objRotationY, objRotationZ));
        //apply matrix rotation to said object
        [vertX, vertY, vertZ] = multiplyMatrixVector([vertX,vertY,vertZ], matrixRotation(objRotationX, objRotationY, objRotationZ));
        // console.log(multiplyMatrixVector([vertX,vertY,vertZ], matrixRotation(objRotationX, objRotationY, objRotationZ)));
        vertZ += 5;

        rotVert[i] = vertX;
        rotVert[i+1] = vertY;
        rotVert[i+2] = vertZ;
        //translate away from us on Z axis
        
        //matrixProjection applied, 3D to 2D, returns between -1 and 1
        [vertX, vertY, vertZ] = multiplyMatrixVector([vertX,vertY,vertZ], matrixProjection);
        //scale 
        vertScaled = [];
        vertX = (vertX + 1)*(cnvWidth/2);
        vertY = (vertY + 1)*(cnvHeight/2);

        // console.log([vertX, vertY, vertZ]);

        frameVert[i] = vertX;
        frameVert[i+1] = vertY;
        frameVert[i+2] = vertZ;
    }

    for (let i = 0, j = 0; i < tri.length; i+=3, j+=1) {
        let v1 = [rotVert[tri[i]*3], rotVert[tri[i]*3+1], rotVert[tri[i]*3+2]];
        let v2 = [rotVert[tri[i+1]*3], rotVert[tri[i+1]*3+1], rotVert[tri[i+1]*3+2]];
        let v3 = [rotVert[tri[i+2]*3], rotVert[tri[i+2]*3+1], rotVert[tri[i+2]*3+2]];
        normals[j] = normalVector(...v1, ...v2, ...v3);
        // console.log(normals[j]);
    }
    for (let i = 0, j = 0; i < tri.length; i+=3, j+=1) {
        // console.log(
        //     vert[tri[i]*3],     vert[tri[i]*3+1], 
        //     vert[tri[i+1]*3],     vert[tri[i+1]*3+1], 
        //     vert[tri[i+2]*3],     vert[tri[i+2]*3+1]);
        // if (normals[j][2] < 0){
        if (normals[j][0] * (rotVert[tri[i]*3] - cameraPos[0]) +
        normals[j][1] * (rotVert[tri[i]*3+1] - cameraPos[1]) +
        normals[j][2] * (rotVert[tri[i]*3+2] - cameraPos[2]) < 0){

            let lightDotProduct = normals[j][0]*lightDirection[0] + normals[j][1]*lightDirection[1] + normals[j][2]*lightDirection[2];
            let color = colors[j].map((x) => x*lightDotProduct);
            drawTri(
                frameVert[tri[i]*3],        frameVert[tri[i]*3+1], 
                frameVert[tri[i+1]*3],      frameVert[tri[i+1]*3+1], 
                frameVert[tri[i+2]*3],      frameVert[tri[i+2]*3+1],
                "rgb(" + color.join(',')+")");
        }
    }
    
    lastTime=timeStamp;
    window.requestAnimationFrame(update);

    // setTimeout(() => {  
    //         console.log('frameDrawn'); 
    //         lastTime=timeStamp;
    //         window.requestAnimationFrame(update);
    //     }, 1);
    }

update();