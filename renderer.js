import {Vector3D, Triangle, Matrix4x4, Mesh, Camera} from './utils3D.js';
import { Controller } from './utils.js';

let viewLocked = false;
document.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  viewLocked = Boolean(document.pointerLockElement);
});

let cnv = document.getElementById("canvas");
let ctx = cnv.getContext("2d");
let cnvWidth = 1000;
let cnvHeight = 700;
cnv.width = cnvWidth;
cnv.height = cnvHeight;

function drawTriangle(x0, y0, x1, y1, x2, y2, color){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    y0 = cnvHeight - y0;
    y1 = cnvHeight - y1;
    y2 = cnvHeight - y2;
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x0, y0);
    ctx.fill();
    ctx.stroke();
}

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
    newTris.push(tri);
}

let meshRotationSpeed = 0.2;
let mesh = new Mesh(newVerts, newTris, meshRotationSpeed);
document.getElementById("file_browse").addEventListener("change", dropHandler.bind(mesh));


let lightDirection = new Vector3D(0, 0, -1);
lightDirection = Vector3D.normalise(lightDirection);

function getColors(length){
    let colors = [];
    for (let i = 0; i < length; i++) {
        colors.push([Math.random()*255, Math.random()*255, Math.random()*255]); 
    }
    return colors;
}
let colors = getColors(mesh.tris.length);

let near = 0.1;
let far = 100.0;
let FOVdegrees = 90.0;
let aspectRatio = cnvHeight / cnvWidth;
let matrixProjection = Matrix4x4.makeProjection(FOVdegrees, aspectRatio, near, far);

let deltaTime = 0; //en millisecondes
let movementSpeed = 0.1 * deltaTime;
let rotationSpeed = 0.03;
let camera = new Camera(movementSpeed, rotationSpeed);
camera.initialize();
let up = new Vector3D(0, 1, 0);

let lastTime = 0;
function update(timeStamp=0){
    //set deltaTime et movementSpeed en ajustant
    deltaTime = timeStamp - lastTime; 
    movementSpeed = 0.003 * deltaTime;
    camera.movementSpeed = movementSpeed;
    lastTime=timeStamp;
    
    // if(!Object.values(controller.keys).includes(true)){ // si pas d'input pas de maj
    //     window.requestAnimationFrame(update, timeStamp);
    //     return;
    // }
    
    // console.clear();

    mesh.update(controller); //get input and feed it to object or cam
    camera.update(controller);
    camera.viewLocked = viewLocked;
    console.log(camera.viewLocked);
    lightDirection = Matrix4x4.multiplyVector(Matrix4x4.rotation(0,mesh.rotationSpeed%(Math.PI*2)/100,0), lightDirection);
    
    ctx.fillStyle = "black";
    ctx.clearRect(0,0, cnvWidth, cnvHeight);
    ctx.fillRect(0,0, cnvWidth, cnvHeight); 

    let trisToView = [] //[tri, ...]
    let zOffset = 2;
    let matrixZOffset = Matrix4x4.translation(0, 0, zOffset);
    // let worldMatrix = Matrix4x4.multiplyMatrix(rotZMatrix, rotXMatrix);
    let worldMatrix = Matrix4x4.getIdentity();
    worldMatrix = Matrix4x4.multiplyMatrix(worldMatrix, matrixZOffset);
   
    let matrixCameraRotation = Matrix4x4.rotationY(camera.yaw);
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
        
        triTransformed.updateNormal();

        triTransformed.id = i;
        i++;

        let cameraRay = Vector3D.sub(triTransformed.p[0], camera.pos);
        if(Vector3D.dotProduct(triTransformed.normal, cameraRay) < 0){ 

            //world space -> view space
            let triViewed = new Triangle();
            triViewed.id = triTransformed.id;
            triViewed.p[0] = Matrix4x4.multiplyVector(matrixView, triTransformed.p[0]);
            triViewed.p[1] = Matrix4x4.multiplyVector(matrixView, triTransformed.p[1]);
            triViewed.p[2] = Matrix4x4.multiplyVector(matrixView, triTransformed.p[2]);


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
                tri.p[0].x *= (cnvWidth / 2); 
                tri.p[0].y *= (cnvHeight / 2); 
                tri.p[1].x *= (cnvWidth / 2); 
                tri.p[1].y *= (cnvHeight / 2); 
                tri.p[2].x *= (cnvWidth / 2); 
                tri.p[2].y *= (cnvHeight / 2); 
                
                return tri;
            }

            let offsetVector = new Vector3D(1, 1, 0); //offset tri points values x,y from (-1,1) to (0,2)
            tris.forEach( (triClipped) => {

                //3D -> 2D
                let triProjected = triangleProjection(triClipped, offsetVector);

                let lightDotProduct = Math.max(0.1, Vector3D.dotProduct(lightDirection, triTransformed.normal)); //getting normal from world space triangle
                let color = "rgb(" + colors[triProjected.id].map((x) => Math.round(x*lightDotProduct)).join(",") + ")"
                triProjected.setColor(color);

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
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";

    let borderHautY = 50;  
    let planHaut = new Vector3D(0, cnvHeight - borderHautY, 0), normalPlanHaut = new Vector3D(0, -1, 0); 
    ctx.moveTo(0, borderHautY); ctx.lineTo(cnvWidth, borderHautY);

    let borderBasY = cnvHeight - 50;  
    let planBas = new Vector3D(0, cnvHeight - borderBasY, 0), normalPlanBas = new Vector3D(0, 1, 0); 
    ctx.moveTo(0, borderBasY); ctx.lineTo(cnvWidth, borderBasY);

    let borderGaucheX = 50;
    let planGauche = new Vector3D(borderGaucheX, 0, 0), normalPlanGauche = new Vector3D(1, 0, 0); 
    ctx.moveTo(borderGaucheX, 0); ctx.lineTo(borderGaucheX, cnvHeight);

    let borderDroiteX = cnvWidth - 50;
    let planDroite = new Vector3D(borderDroiteX, 0, 0), normalPlanDroite = new Vector3D(-1, 0, 0); 
    ctx.moveTo(borderDroiteX, 0); ctx.lineTo(borderDroiteX, cnvHeight);

    ctx.stroke();
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
        
    triangleQueue.forEach( tri => {

        drawTriangle(
            tri.p[0].x, cnvHeight - tri.p[0].y,
            tri.p[1].x, cnvHeight - tri.p[1].y,
            tri.p[2].x, cnvHeight - tri.p[2].y,
            tri.color);
    });
});

    // console.log("updated");
    window.requestAnimationFrame(update);
    }

update();