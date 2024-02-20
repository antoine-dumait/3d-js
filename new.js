let cnv = document.getElementById("canvas");
let ctx = cnv.getContext("2d");
let cnvWidth = 1000;
let cnvHeight = 700;
cnv.width = cnvWidth;
cnv.height = cnvHeight;

class Vector3D{
    constructor(x=0, y=0, z=0, w=1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    toLog(){
        return "\n X:" + this.x + "\n Y:" + this.y + "\n Z:" + this.z;   
    }
}

function vectorAdd(v1, v2){
    return new Vector3D(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
}

function vectorSub(v1, v2){
    return new Vector3D(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z);
}

function vectorMultiply(v, k){
    newV =  new Vector3D();
    newV.x = v.x * k;
    newV.y = v.y * k;
    newV.z = v.z * k;
    return newV;
}

function vectorDivision(v, k){
    newV =  new Vector3D();
    newV.x = v.x / k;
    newV.y = v.y / k;
    newV.z = v.z / k;
    return newV;
}

function vectorDotProduct(v1, v2){ //produit scalaire
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
}

function vectorLength(v){
    return Math.sqrt(vectorDotProduct(v, v));
}

function vectorNormalise(v){
    let length = vectorLength(v);
    if(length == 0){
        return new Vector3D();
    }
    let newV = new Vector3D();
    newV.x = v.x / length;
    newV.y = v.y / length;
    newV.z = v.z / length;
    return newV;
}

function vectorCrossProduct(v1, v2){ //produit vectoriel
    let newV = new Vector3D();
    newV.x = v1.y*v2.z - v1.z*v2.y
    newV.y = v1.z*v2.x - v1.x*v2.z
    newV.z = v1.x*v2.y - v1.y*v2.x
    return newV;
}

function vectorIntersectPlane(planePoint, planeNormal, lineStart, lineEnd){
    // console.log("lineStart x:" + lineStart.x, "y:" +lineStart.y, "z:"+lineStart.z);
    // console.log("lineEnd x:" + lineEnd.x, "y:" + lineEnd.y, "z:"+lineEnd.z);

    planeNormal = vectorNormalise(planeNormal);
    // console.log("planeNormal x:"+planeNormal.x, "y:" +planeNormal.y, "z:"+planeNormal.z);
    let planeDP = -vectorDotProduct(planeNormal, planePoint);
    let aDP = vectorDotProduct(lineStart, planeNormal);
    let bDP = vectorDotProduct(lineEnd, planeNormal);

    // console.log("aDP:"+aDP);
    // console.log("bDP:"+bDP);
    // console.log("(bDP - aDP):"+(bDP - aDP));

    let t = (-planeDP - aDP) / (bDP - aDP); //pourcentage position du point intersection
    // console.log(t);
    let lineStartToEnd = vectorSub(lineEnd, lineStart);
    let lineStartToIntersect = vectorMultiply(lineStartToEnd, t);
    let x = vectorAdd(lineStart, lineStartToIntersect);
    // console.log(x);
    // console.log(x.x, x.y, x.z);
    return vectorAdd(lineStart, lineStartToIntersect);
}

class Triangle{
    constructor(points=[null, null, null], color="white"){
        this.p = points; // [v1, v2, v3]                    //[[x0,y0,z0], [x1,y1,z1], [x2,y2,z2]]
        this.color = color;
        this.normal = null;
        this.id = null;
    }

    updateNormal(){
        let line1 = vectorSub(this.p[1], this.p[0]);
        let line2 = vectorSub(this.p[2], this.p[0]);
        let normal = vectorCrossProduct(line1, line2);
        // this.normal = vectorNormalise(normal);
        this.normal = normal;
    }

    setColor(lightDotProduct){
        this.color ="rgb(" + colors[this.id].map((x) => Math.round(x*lightDotProduct)).join(",") + ")";
    }
}

function triangleClipPlane(planePoint, planeNormal, tri){ //return liste triangle, vide, tri de base, 1 ou 2 nouveaux triangles
    planeNormal = vectorNormalise(planeNormal); //important normal

    //plus petite distance point, plan, SIGNÉ (+,-)
    function distance(p){
        // p = vectorNormalise(p);
        return vectorDotProduct(planeNormal, p) - vectorDotProduct(planeNormal, planePoint);
    }

    let insidePoints = []; //derriere le plan (à afficher)
    let outsidePoints = []; //avant le plan (derriere le joueur)

    let distP0 = distance(tri.p[0]);
    let distP1 = distance(tri.p[1]);
    let distP2 = distance(tri.p[2]);

    //ordre important pour conserver le sens horaire de declaration des points du triangle
    //pour conserver direction de la normal
    if(distP0 >= 0){
        insidePoints.push(tri.p[0]);
    } else {
        outsidePoints.push(tri.p[0]);
    }
    if(distP1 >= 0){
        insidePoints.push(tri.p[1]);
    } else {
        outsidePoints.push(tri.p[1]);
    }
    if(distP2 >= 0){
        insidePoints.push(tri.p[2]);
    } else {
        outsidePoints.push(tri.p[2]);
    }

    //découpage des triangles
    let nombreOutsidePoints = outsidePoints.length;
    let nombreInsidePoints = insidePoints.length;

    if(nombreInsidePoints == 0){ //tout les points sont derriere, ne rien afficher
        return [];
    }

    if(nombreInsidePoints == 3){//tout les points sont devants, tout afficher, return le triangle original
        return [tri];
    }

    if( nombreInsidePoints == 1 && nombreOutsidePoints == 2){ //2 points derriere, a remplacer
        let tri1 = new Triangle();
        tri1.id = tri.id;
        tri1.color = tri.color;
        //remplacer les point interieur par eux meme sur le vecteur intersectant le plan
        // console.log(...tri.p.map((p) => "" + p.x +" "+ p.y +" "+ p.z));
        tri1.p[0] = insidePoints[0];
        //insidePoints[0] to outisdePoints[1] forment une ligne entre les deux intersectant le plan
        // console.log(insidePoints[0].toLog() + outsidePoints[0].toLog());
        // console.log(insidePoints[0].toLog() + outsidePoints[1].toLog());
        tri1.p[1] = vectorIntersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[1]);
        tri1.p[2] = vectorIntersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
        
        
        // tri.color = "green";
        // console.log(
        //     "This is %cMy stylish message",
        //     "color: yellow; font-style: italic; background-color: blue;padding: 2px",
        //   );
        // console.log("%c test", "color: blue");
        // console.log(tri.p.map((p) => "%c" + p.x +" "+ p.y +" "+ p.z).join(" \n"), "color: red", "color: blue", "color: green");

        return [tri1];
    }

    if(nombreInsidePoints == 2 && nombreOutsidePoints == 1 ){ //former 2 nouveaux triangles
        let tri1 = new Triangle();
        let tri2 = new Triangle();

        //nouveaux triangles conservent propriétes de l'ancien triangle
        tri1.id = tri.id;
        tri1.color = tri.color;
        // tri1.color = "blue";
        tri2.id = tri.id;
        tri2.color = tri.color;
        // tri2.color = "red";

        //creation premier tri
        tri1.p[0] = insidePoints[0];
        tri1.p[1] = insidePoints[1];

        tri1.p[2] = vectorIntersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
    
        //creation deuxieme tri
        tri2.p[0] = insidePoints[1];
        tri2.p[1] = tri1.p[2]; //nouveau point créer au dessus

        tri2.p[2] = vectorIntersectPlane(planePoint, planeNormal, insidePoints[1], outsidePoints[0]);
    
        return [tri1, tri2]; //2 nouveaux tri
    }
}

class Mesh{
    constructor(vertices, triangles, rotationSpeed = 0.75){
        this.tris = triangles;
        this.verts = vertices;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.rotationSpeed = rotationSpeed; 
        this.colors = [];
    }

    changeVertices(vertices){
        this.verts = vertices;
    }

    changeTriangles(triangles){
        this.tris = triangles;
    }

    createColors(){
        this.color = [];
        for (let j = 0; j < this.tris.length; j++) {
            this.colors.push([Math.random()*255, Math.random()*255, Math.random()*255]); 
        }
    }


    update(controller){
        let k = controller.keys;
        let changeRotation = (rot, sign) => {
            return (rot + (this.rotationSpeed*sign) % (2*Math.PI));
        }
        if(k["ArrowLeft"]){
            this.rotY = changeRotation(this.rotY, -1);
        }
        if(k["ArrowRight"]){
            this.rotY = changeRotation(this.rotY, +1);
        }
        if (k["ArrowUp"]){
            this.rotX = changeRotation(this.rotX, +1);
        }
        if (k["ArrowDown"]){
            this.rotX = changeRotation(this.rotX, -1);
        }
    }
}

class Matrix4x4{
    constructor(values=Array.from(Array(4), () => Array(4).fill(0))){
        this.m = values;
    }
}

function matrixMultiplyVector(M, v){
    let newV = new Vector3D();
    newV.x = v.x*M.m[0][0] + v.y*M.m[1][0] + v.z*M.m[2][0] + v.w*M.m[3][0];
    newV.y = v.x*M.m[0][1] + v.y*M.m[1][1] + v.z*M.m[2][1] + v.w*M.m[3][1];
    newV.z = v.x*M.m[0][2] + v.y*M.m[1][2] + v.z*M.m[2][2] + v.w*M.m[3][2];
    newV.w = v.x*M.m[0][3] + v.y*M.m[1][3] + v.z*M.m[2][3] + v.w*M.m[3][3];
    return newV;
}

function matrixGetIdentity(){
    let M = new Matrix4x4();
    M.m[0][0] = 1.0;
    M.m[1][1] = 1.0;
    M.m[2][2] = 1.0;
    M.m[3][3] = 1.0;
    return M;
}

function matrixRotation(X,Y,Z){
    let M = new Matrix4x4();
    let cX = Math.cos(X), sX = Math.sin(X);
    let cY = Math.cos(Y), sY = Math.sin(Y);
    let cZ = Math.cos(Z), sZ = Math.sin(Z);
    M.m = [
        [cZ*cY,  cZ*sY*sX-sZ*cX, cZ*sY*cX+sZ*sX, 0],
        [sZ*cY,  sZ*sY*sX+cZ*cX, sZ*sY*cX-cZ*sX, 0],
        [-sY,    cY*sX,          cY*cX,          0],
        [0,      0,              0,              1]
    ];
    return M;
}

function matrixRotationX(angleRad)
	{
		let M = new Matrix4x4();
		M.m[0][0] = 1.0;
		M.m[1][1] = Math.cos(angleRad);
		M.m[1][2] = Math.sin(angleRad);
		M.m[2][1] = -Math.sin(angleRad);
		M.m[2][2] = Math.cos(angleRad);
		M.m[3][3] = 1.0;
		return M;
	}

function matrixRotationY(angleRad)
	{
		let M = new Matrix4x4();
		M.m[0][0] = Math.cos(angleRad);
		M.m[0][2] = Math.sin(angleRad);
		M.m[2][0] = -Math.sin(angleRad);
		M.m[1][1] = 1.0;
		M.m[2][2] = Math.cos(angleRad);
		M.m[3][3] = 1.0;
		return M;
	}

function matrixRotationZ(angleRad)
	{
		let M = new Matrix4x4();
		M.m[0][0] = Math.cos(angleRad);
		M.m[0][1] = Math.sin(angleRad);
		M.m[1][0] = -Math.sin(angleRad);
		M.m[1][1] = Math.cos(angleRad);
		M.m[2][2] = 1.0;
		M.m[3][3] = 1.0;
		return M;
	}

function matrixTranslation(x, y ,z){
    let M = matrixGetIdentity();
    M.m[3][0] = x;
    M.m[3][1] = y;
    M.m[3][2] = z;
    return M;
}

function matrixMakeProjection(FOVdegrees, aspectRatio, near, far){
    let FOVrad = 1/Math.tan(FOVdegrees * 0.5 * Math.PI /180); 
    let M = new Matrix4x4();
    M.m[0][0] = aspectRatio * FOVrad;
    M.m[1][1] = FOVrad;
    M.m[2][2] = far / (far - near);
    M.m[3][2] = (-far * near) / (far - near);
    M.m[2][3] = 1.0;
    M.m[3][3] = 0.0;
    return M;

}

function matrixMultiplyMatrix(M1, M2){
    let M = new Matrix4x4();
    for(r=0; r<4; r++){
        for(c=0; c<4; c++){
            M.m[r][c] = M1.m[r][0]*M2.m[0][c] + M1.m[r][1]*M2.m[1][c] + M1.m[r][2]*M2.m[2][c] + M1.m[r][3]*M2.m[3][c];
        }
    }
    return M;
}

function matrixPointAt(pos, target, up){
    //forward de nouvelle direction
    let newForward = vectorSub(target, pos);
    newForward = vectorNormalise(newForward);

    //up de nouvelle direction
    let a = vectorMultiply(newForward, vectorDotProduct(up, newForward)); //difference entre new up et up, mutliplié par new forward pour etre normal
    let newUp = vectorSub(up, a);
    newUp = vectorNormalise(newUp);
    
    //right de nouvelle direction
    let newRight = vectorCrossProduct(newUp, newForward);

    let M = new Matrix4x4();
    M.m = [
        [newRight.x,    newRight.y,     newRight.z,     0],
        [newUp.x,       newUp.y,        newUp.z,        0],
        [newForward.x,  newForward.y,   newForward.z,   0],
        [pos.x,         pos.y,          pos.z,          1]
    ];

    return M;
}

function matrixQuickInverse(M1){ //only for translation / rotation Matrix
    let M2 = new Matrix4x4();
    let A = new Vector3D(M1.m[0][0], M1.m[0][1], M1.m[0][2]);
    let B = new Vector3D(M1.m[1][0], M1.m[1][1], M1.m[1][2]);
    let C = new Vector3D(M1.m[2][0], M1.m[2][1], M1.m[2][2]);
    let T = new Vector3D(M1.m[3][0], M1.m[3][1], M1.m[3][2]); //translation Vector
    M2.m = [
        [A.x,    B.x,   C.x,    0],  
        [A.y,    B.y,   C.y,    0],  
        [A.z,    B.z,   C.z,    0],  
        [-vectorDotProduct(T,A),    -vectorDotProduct(T,B),     -vectorDotProduct(T,C),    1]
    ];

    return M2;
}

class Controller{
    constructor(){
        this.keys = 
        {
            "ArrowLeft" : false,
            "ArrowRight" : false,
            "ArrowUp" : false,
            "ArrowDown" : false,

            "k" : false,
            "m" : false,
            "o" : false,
            "l" : false,

            "q" : false,
            "d" : false,
            "z" : false,
            "s" : false,
        }
    }

    initialize(){
        let that = this;
        document.body.addEventListener('keydown', function(e) {
            that.updateKeys(e.key, true)});
        document.body.addEventListener('keyup', function(e) {
            that.updateKeys(e.key, false)});
    }

    updateKeys(code,val) {
        if(Object.keys(this.keys).includes(code)){
            this.keys[code] = val;
        }
    }
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
    mesh.createColors();
    colors = mesh.colors;
    // return {"verts" : verts, "tris" : tris};
}

function drawTri(x0, y0, x1, y1, x2, y2, color){
    ctx.beginPath();
    // ctx.strokeStyle = "white";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    y0 = cnvHeight - y0;
    y1 = cnvHeight - y1;
    y2 = cnvHeight - y2;
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x0, y0);
    ctx.fill();
    ctx.stroke();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function radToDegrees(rad){
    return rad * (180/Math.PI);
}

function degreesToRad(degrees){
    return degrees * (Math.PI/180);
}

let controller = new Controller();
controller.initialize();

let verts = [[0,0,0], [0,1,0], [1,0,0], [1,1,0], [1,0,1], [1,1,1], [0,0,1], [0,1,1]];
let tris = [[0,1,2], [1,3,2], [2,3,4], [3,5,4], [5,6,4], [7,6,5], [0,6,7], [1,0,7], [3,1,5], [5,1,7], [0,2,4], [4,6,0]];
let newVerts = [];
let newTris = [];

for (i=0; i<verts.length; i++){
    let vect = new Vector3D(...verts[i]);
    newVerts.push(vect)
}
for (i=0; i<tris.length; i++){
    let tri = new Triangle();
    tri.p[0] = newVerts[tris[i][0]];
    tri.p[1] = newVerts[tris[i][1]];
    tri.p[2] = newVerts[tris[i][2]];
    newTris.push(tri);
}

let meshRotationSpeed = 0.2;
let mesh = new Mesh(newVerts, newTris, meshRotationSpeed);
document.getElementById("file_drop").addEventListener("change", dropHandler.bind(mesh));


let lightDirection = new Vector3D(0, 0, -1);
lightDirection = vectorNormalise(lightDirection);

mesh.createColors();
let colors = mesh.colors;


let near = 0.1;
let far = 100.0;
let FOVdegrees = 90.0;
let aspectRatio = cnvHeight / cnvWidth;
let matrixProjection = matrixMakeProjection(FOVdegrees, aspectRatio, near, far);


class Camera{
    constructor(movementSpeed, rotationSpeed){
        this.pos = new Vector3D(0, 0, 0);
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed
        this.yaw = 0; //Y angle
    }
    
    update(controller){
        let k = controller.keys;
        let changePosition = (pos, sign) => {
            return (pos + (this.movementSpeed*sign) % (2*Math.PI));
        }
        if(k["o"]){
            this.pos.y = changePosition(this.pos.y, +1);
        }
        if(k["l"]){
            this.pos.y = changePosition(this.pos.y, -1);
        }
        if(k["k"]){
            this.pos.x = changePosition(this.pos.x, -1);
        }
        if(k["m"]){
            this.pos.x = changePosition(this.pos.x, +1);
        }

        let forward = vectorMultiply(lookDirection, this.movementSpeed);
        if(k["q"]){
            this.yaw -= this.rotationSpeed
        }
        if(k["d"]){
            this.yaw += this.rotationSpeed
        }
        if(k["z"]){
            this.pos = vectorAdd(this.pos, forward);
        }
        if(k["s"]){
            this.pos = vectorSub(this.pos, forward);
        }
        
    }
}
let movementSpeed = 0.1;
let rotationSpeed = 0.03;
let camera = new Camera(movementSpeed, rotationSpeed);

let up = new Vector3D(0, 1, 0);
let lookDirection = new Vector3D(0, 0, 1);

let lastTime = 0;
function update(timeStamp=0){
    if(!Object.values(controller.keys).includes(true)){
        window.requestAnimationFrame(update);
        return;
    }
    console.clear();
    mesh.update(controller);
    camera.update(controller);
    let deltaTime = timeStamp - lastTime;

    lightDirection = matrixMultiplyVector(matrixRotation(0,mesh.rotationSpeed%(Math.PI*2)/100,0), lightDirection);
    
    ctx.fillStyle = "black";
    ctx.clearRect(0,0, cnvWidth, cnvHeight);
    ctx.fillRect(0,0, cnvWidth, cnvHeight); 

    let trisToView = [] //[tri, ...]
    
    let matrixMeshRotation = matrixRotation(mesh.rotX, mesh.rotY, mesh.rotZ);
    let rotXMatrix = matrixRotationX(degreesToRad(mesh.rotX));
    let rotZMatrix = matrixRotationZ(degreesToRad(mesh.rotY));
    let zOffset = 2;
    let matrixZOffset = matrixTranslation(0, 0, zOffset);
    // let worldMatrix = matrixMultiplyMatrix(rotZMatrix, rotXMatrix);
    let worldMatrix = matrixGetIdentity();
    worldMatrix = matrixMultiplyMatrix(worldMatrix, matrixZOffset);
   
    let matrixCameraRotation = matrixRotationY(camera.yaw);
    let target = new Vector3D(0, 0, 1);

    lookDirection = matrixMultiplyVector(matrixCameraRotation, target);
    // console.log(lookDirection);
    // console.log(camera.pos);
    let newTarget = vectorAdd(camera.pos, lookDirection);
    // console.log(newTarget);
    let matrixCamera = matrixPointAt(camera.pos, newTarget, up);
    let matrixView = matrixQuickInverse(matrixCamera);


    // transformation pipeline
    let i=0;
    mesh.tris.forEach( tri => {
        let triTransformed = new Triangle();
        triTransformed.p[0] = matrixMultiplyVector(worldMatrix, tri.p[0]);
        triTransformed.p[1] = matrixMultiplyVector(worldMatrix, tri.p[1]);
        triTransformed.p[2] = matrixMultiplyVector(worldMatrix, tri.p[2]);
        
        triTransformed.updateNormal();

        triTransformed.id = i;
        i++;

        let cameraRay = vectorSub(triTransformed.p[0], camera.pos);
        if(vectorDotProduct(triTransformed.normal, cameraRay) < 0){ 

            //world space -> view space
            let triViewed = new Triangle();
            triViewed.p[0] = matrixMultiplyVector(matrixView, triTransformed.p[0]);
            triViewed.p[1] = matrixMultiplyVector(matrixView, triTransformed.p[1]);
            triViewed.p[2] = matrixMultiplyVector(matrixView, triTransformed.p[2]);


            //view space donc clip plane juste plan en face de nous a z = clip distance
            let clipDistance = 0.5;
            let clipPlane = new Vector3D(0, 0, clipDistance); //point de notre plan, juste devant nous
            //z pointe en face de nous, donc normal au plan est z
            let clipPlaneNormal = new Vector3D(0, 0, 1);
            let tris = triangleClipPlane(clipPlane, clipPlaneNormal, triViewed);
            // console.log(tris);
            tris.forEach( (triClipped) => {
                // console.log(triClipped);

                //3D -> 2D
                let triProjected = new Triangle();
                triProjected.p[0] = matrixMultiplyVector(matrixProjection, triClipped.p[0]);
                triProjected.p[1] = matrixMultiplyVector(matrixProjection, triClipped.p[1]);
                triProjected.p[2] = matrixMultiplyVector(matrixProjection, triClipped.p[2]);

                //diviser par W pour rester dans espace cartésien ?? TODO : revoir
                triProjected.p[0] = vectorDivision(triProjected.p[0], triProjected.p[0].w)
                triProjected.p[1] = vectorDivision(triProjected.p[1], triProjected.p[1].w)
                triProjected.p[2] = vectorDivision(triProjected.p[2], triProjected.p[2].w)

                //re inversé X et Y
                triProjected.p[0].x *= -1; 
                triProjected.p[0].y *= -1; 
                triProjected.p[1].x *= -1; 
                triProjected.p[1].y *= -1; 
                triProjected.p[2].x *= -1; 
                triProjected.p[2].y *= -1; 


                //scale to screen size
                let offsetView = new Vector3D(1,1);
                triProjected.p[0] = vectorAdd(triProjected.p[0], offsetView);
                triProjected.p[1] = vectorAdd(triProjected.p[1], offsetView);
                triProjected.p[2] = vectorAdd(triProjected.p[2], offsetView);

                triProjected.p[0].x *= (cnvWidth / 2); 
                triProjected.p[0].y *= (cnvHeight / 2); 
                triProjected.p[1].x *= (cnvWidth / 2); 
                triProjected.p[1].y *= (cnvHeight / 2); 
                triProjected.p[2].x *= (cnvWidth / 2); 
                triProjected.p[2].y *= (cnvHeight / 2); 

                triProjected.id = triTransformed.id;

                let lightDotProduct = Math.max(0.1, vectorDotProduct(lightDirection, triTransformed.normal)); //getting normal from world space triangle
                // triProjected.setColor(lightDotProduct);
                triProjected.setColor(1);
                // triProjected.color = triClipped.color;

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
    let planHaut = new Vector3D(0,cnvHeight - 150, 0), normalPlanHaut = new Vector3D(0, -1, 1); 
    ctx.moveTo(0, 150); ctx.lineTo(cnvWidth, 150);
    let planBas = new Vector3D(0, 100, 0), normalPlanBas = new Vector3D(0, 1, 0); 
    ctx.moveTo(0, cnvHeight - 100); ctx.lineTo(cnvWidth, cnvHeight - 100);
    let planGauche = new Vector3D(300, 0, 0), normalPlanGauche = new Vector3D(1, 0, 0); 
    ctx.moveTo(300, 0); ctx.lineTo(300, cnvHeight);
    let planDroite = new Vector3D(cnvWidth - 300, 0, 0), normalPlanDroite = new Vector3D(-1, 0, 0); 
    ctx.moveTo(cnvWidth - 300, 0); ctx.lineTo(cnvWidth - 300, cnvHeight);
    ctx.stroke();
    // let planDroite = planGauche; normalPlanDroite = normalPlanGauche;
    // trisToView.shift();
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
                    case 2: newTriangles = triangleClipPlane(planHaut, normalPlanHaut, triToTest);                     
                    break;
                    case 1: newTriangles = triangleClipPlane(planBas, normalPlanBas, triToTest);
                    break;
                    case 0: 
                    newTriangles = triangleClipPlane(planGauche, normalPlanGauche, triToTest);
                    break;
                    case 3: newTriangles = triangleClipPlane(planDroite, normalPlanDroite, triToTest);
                    break;
                }
                // console.log("ici out switch", newTriangles);
                triangleQueue.push(...newTriangles);
            }
            newTrianglesCount = triangleQueue.length;
        }
        
    // console.log("ici tri length", triangleQueue.length);
    triangleQueue.forEach( tri => {

        // console.log(tri.p[0].x, tri.p[0].y,
        //     tri.p[1].x, tri.p[1].y,
        //     tri.p[2].x, tri.p[2].y,
        //     tri.color);
        drawTri(
            tri.p[0].x, tri.p[0].y,
            tri.p[1].x, tri.p[1].y,
            tri.p[2].x, tri.p[2].y,
            tri.color);
    });
});
    lastTime=timeStamp;

    // console.log("updated");
    window.requestAnimationFrame(update);
    }

update();