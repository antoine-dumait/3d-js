function nameToRgba(name) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.fillStyle = name;
    context.fillRect(0,0,1,1);
    return context.getImageData(0,0,1,1).data;
}

class Vector3D{
    static add(v1, v2){
        return new Vector3D(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
    }

    static sub(v1, v2){
        return new Vector3D(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z);
    }

    static multiply(v, k){
        let newV =  new Vector3D(v.x*k, v.y*k, v.z*k);
        return newV;
    }

    static divide(v, k){
        let newV =  new Vector3D(v.x/k, v.y/k, v.z/k);
        return newV;
    }

    static dotProduct(v1, v2){ //produit scalaire
        return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
    }

    static length(v){
        return Math.sqrt(Vector3D.dotProduct(v, v));
    }

    static normalise(v){
        let length = Vector3D.length(v);
        if(length == 0){
            return new Vector3D();
        }
        return Vector3D.divide(v, length);
    }

    static crossProduct(v1, v2){ //produit vectoriel
        let newV = new Vector3D();
        newV.x = v1.y*v2.z - v1.z*v2.y;
        newV.y = v1.z*v2.x - v1.x*v2.z;
        newV.z = v1.x*v2.y - v1.y*v2.x;
        return newV;
    }

    static intersectPlane(planePoint, planeNormal, lineStart, lineEnd){
        planeNormal = Vector3D.normalise(planeNormal);
        let planeDP = -Vector3D.dotProduct(planeNormal, planePoint);
        let aDP = Vector3D.dotProduct(lineStart, planeNormal);
        let bDP = Vector3D.dotProduct(lineEnd, planeNormal);
    
        let t = (-planeDP - aDP) / (bDP - aDP); //pourcentage position du point intersection
    
        let lineStartToEnd = Vector3D.sub(lineEnd, lineStart);
        let lineStartToIntersect = Vector3D.multiply(lineStartToEnd, t);
        let x = Vector3D.add(lineStart, lineStartToIntersect);
    
        return {v : x, "t" : t};
    }

    constructor(x=0, y=0, z=0, w=1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    floor(){
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        this.w = Math.round(this.w);
    }

    toLog(){
        return "\n X:" + this.x + "\n Y:" + this.y + "\n Z:" + this.z;   
    }
}

class Triangle{

    static clipPlane(planePoint, planeNormal, tri, log=false){ //return liste triangle, vide, tri de base, 1 ou 2 nouveaux triangles
        planeNormal = Vector3D.normalise(planeNormal); //important normal
    
        //plus petite distance point, plan, SIGNÉ (+,-)
        function distance(p){
            return Vector3D.dotProduct(planeNormal, p) - Vector3D.dotProduct(planeNormal, planePoint);
        }
    
        let insidePoints = []; //derriere le plan (à afficher)
        let outsidePoints = []; //avant le plan (derriere le joueur)
        let insideTextures = [];
        let outsideTextures = [];


        let distP0 = distance(tri.p[0]);
        let distP1 = distance(tri.p[1]);
        let distP2 = distance(tri.p[2]);
    
        //ordre important pour conserver le sens horaire de declaration des points du triangle
        //pour conserver direction de la normal
        if(distP0 >= 0){
            insidePoints.push(tri.p[0]);
            insideTextures.push(tri.t[0]);
        } else {
            outsidePoints.push(tri.p[0]);
            outsideTextures.push(tri.t[0]);
        }
        if(distP1 >= 0){
            insidePoints.push(tri.p[1]);
            insideTextures.push(tri.t[1]);
        } else {
            outsidePoints.push(tri.p[1]);
            outsideTextures.push(tri.t[1]);
        }
        if(distP2 >= 0){
            insidePoints.push(tri.p[2]);
            insideTextures.push(tri.t[2]);
        } else {
            outsidePoints.push(tri.p[2]);
            outsideTextures.push(tri.t[2]);
        }
        // if(log){
        //     console.log(planePoint, planeNormal, tri);
        //     console.log(...tri.p);
        //     console.log(distP0, distP1, distP2);
        // }
        
        //découpage des triangles
        let nombreOutsidePoints = outsidePoints.length;
        let nombreInsidePoints = insidePoints.length;
        // console.log(nombreInsidePoints, nombreOutsidePoints);
        
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
            tri1.p[0] = insidePoints[0];
            tri1.t[0] = insideTextures[0];
            //insidePoints[0] to outisdePoints[1] forment une ligne entre les deux intersectant le plan
            let intersection1 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
            let t = intersection1.t
            tri1.p[1] = intersection1.v;
            tri1.t[1].u = t * (outsideTextures[0].u - insideTextures[0].u) + insideTextures[0].u;
            tri1.t[1].v = t * (outsideTextures[0].v - insideTextures[0].v) + insideTextures[0].v;
            tri1.t[1].w = t * (outsideTextures[0].w - insideTextures[0].w) + insideTextures[0].w;


            let intersection2 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[1]);
            t = intersection2.t;
            tri1.p[2] = intersection2.v;
            tri1.t[2].u = t * (outsideTextures[1].u - insideTextures[0].u) + insideTextures[0].u;
            tri1.t[2].v = t * (outsideTextures[1].v - insideTextures[0].v) + insideTextures[0].v;
            tri1.t[2].w = t * (outsideTextures[1].w - insideTextures[0].w) + insideTextures[0].w;
            return [tri1];
        }
    
        if(nombreInsidePoints == 2 && nombreOutsidePoints == 1 ){ //former 2 nouveaux triangles
            
            //nouveaux triangles conservent propriétes de l'ancien triangle
            let tri1 = new Triangle();
            // tri1.id = tri.id;
            // tri1.color = tri.color;
            // tri1.t = tri.t;
            let tri2 = new Triangle();
            // tri2.id = tri.id;
            // tri2.color = tri.color;
            // tri2.t = tri.t;
    
            //creation premier tri
            tri1.p[0] = insidePoints[0];
            tri1.t[0] = insideTextures[0];


            tri1.p[1] = insidePoints[1];
            tri1.t[1] = insideTextures[1];

            let intersection1 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
            tri1.p[2] = intersection1.v;
            tri1.t[2].u = intersection1.t * (outsideTextures[0].u - insideTextures[0].u) + insideTextures[0].u;
            tri1.t[2].v = intersection1.t * (outsideTextures[0].v - insideTextures[0].v) + insideTextures[0].v;
            tri1.t[2].w = intersection1.t * (outsideTextures[0].w - insideTextures[0].w) + insideTextures[0].w;

            
            //creation deuxieme tri
            tri2.p[1] = insidePoints[1];
            tri2.t[1].u = tri1.t[1].u;
            tri2.t[1].v = tri1.t[1].v;
            tri2.t[1].w = tri1.t[1].w;

            tri2.p[0] = tri1.p[2]; //nouveau point créer au dessus
            tri2.t[0].u = tri1.t[2].u;
            tri2.t[0].v = tri1.t[2].v;
            tri2.t[0].w = tri1.t[2].w;
            
            let intersection2 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[1], outsidePoints[0]);
            tri2.p[2] = intersection2.v;
            tri2.t[2].u = intersection2.t * (outsideTextures[0].u - insideTextures[1].u) + insideTextures[1].u;
            tri2.t[2].v = intersection2.t * (outsideTextures[0].v - insideTextures[1].v) + insideTextures[1].v;
            tri2.t[2].w = intersection2.t * (outsideTextures[0].w - insideTextures[1].w) + insideTextures[1].w;

            return [tri1, tri2]; //2 nouveaux tri
        }
    }

    constructor(
        points=[new Vector3D(0,0,0), new Vector3D(0,1,0), new Vector3D(1,1,0)], 
        textures=[new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1)], 
        color=[230, 230, 230]
        ){
        this.p = points; // [v1, v2, v3]                    //[[x0,y0,z0], [x1,y1,z1], [x2,y2,z2]]
        this.t = textures;
        this.color = color;
        this.normal = null;
        this.id = null;
    }

    mapToAllPoints(func){
        for(let i=0; i<3; i++){
            // console.log(this.p[i]);
            this.p[i] = func(this.p[i]);
            // console.log(this.p[i]);
        }
        // console.log(this.p);
    }
    
    updateNormal(){
        // console.log(this.p);
        let line1 = Vector3D.sub(this.p[1], this.p[0]);
        let line2 = Vector3D.sub(this.p[2], this.p[0]);
        let normal = Vector3D.crossProduct(line1, line2);
        normal = Vector3D.normalise(normal);
        this.normal = normal;
    }

    setColor(color){
        this.color = nameToRgba(color);
    }

    returnCopy(){
        let newTri = new Triangle();
        newTri.p[0] = new Vector3D(this.p[0].x, this.p[0].y, this.p[0].z);
        newTri.p[1] = new Vector3D(this.p[1].x, this.p[1].y, this.p[1].z);
        newTri.p[2] = new Vector3D(this.p[2].x, this.p[2].y, this.p[2].z);
        newTri.t[0] = new Vector2D(this.t[0].u, this.t[0].v, this.t[0].w);
        newTri.t[1] = new Vector2D(this.t[1].u, this.t[1].v, this.t[1].w);
        newTri.t[2] = new Vector2D(this.t[2].u, this.t[2].v, this.t[2].w);
        newTri.color = this.color;
        newTri.id = this.id;
        return newTri;
    }
}


class Matrix4x4{

    static multiplyVector(M, v){
        let newV = new Vector3D();
        newV.x = v.x*M.m[0][0] + v.y*M.m[1][0] + v.z*M.m[2][0] + v.w*M.m[3][0];
        newV.y = v.x*M.m[0][1] + v.y*M.m[1][1] + v.z*M.m[2][1] + v.w*M.m[3][1];
        newV.z = v.x*M.m[0][2] + v.y*M.m[1][2] + v.z*M.m[2][2] + v.w*M.m[3][2];
        newV.w = v.x*M.m[0][3] + v.y*M.m[1][3] + v.z*M.m[2][3] + v.w*M.m[3][3];
        return newV;
    }

    static getIdentity(){
        let M = new Matrix4x4();
        M.m[0][0] = 1.0;
        M.m[1][1] = 1.0;
        M.m[2][2] = 1.0;
        M.m[3][3] = 1.0;
        return M;
    }

    static rotation(X,Y,Z){
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

    static rotationX(angleRad){
		let M = new Matrix4x4();
		M.m[0][0] = 1.0;
		M.m[1][1] = Math.cos(angleRad);
		M.m[1][2] = Math.sin(angleRad);
		M.m[2][1] = -Math.sin(angleRad);
		M.m[2][2] = Math.cos(angleRad);
		M.m[3][3] = 1.0;
		return M;
	}

    static rotationY(angleRad){
		let M = new Matrix4x4();
		M.m[0][0] = Math.cos(angleRad);
		M.m[0][2] = Math.sin(angleRad);
		M.m[2][0] = -Math.sin(angleRad);
		M.m[1][1] = 1.0;
		M.m[2][2] = Math.cos(angleRad);
		M.m[3][3] = 1.0;
		return M;
	}

    static rotationZ(angleRad)
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

    static translation(x, y ,z){
        let M = Matrix4x4.getIdentity();
        M.m[3][0] = x;
        M.m[3][1] = y;
        M.m[3][2] = z;
        return M;
    }

    static makeProjection(FOVdegrees, aspectRatio, near, far){
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

    static multiplyMatrix(M1, M2){
        let M = new Matrix4x4();
        for(let r=0; r<4; r++){
            for(let c=0; c<4; c++){
                M.m[r][c] = M1.m[r][0]*M2.m[0][c] + M1.m[r][1]*M2.m[1][c] + M1.m[r][2]*M2.m[2][c] + M1.m[r][3]*M2.m[3][c];
            }
        }
        return M;
    }

    static pointAt(pos, target, up){
        //forward de nouvelle direction
        let newForward = Vector3D.sub(target, pos);
        newForward = Vector3D.normalise(newForward);
    
        //up de nouvelle direction
        let a = Vector3D.multiply(newForward, Vector3D.dotProduct(up, newForward)); //difference entre new up et up, mutliplié par new forward pour etre normal
        let newUp = Vector3D.sub(up, a);
        newUp = Vector3D.normalise(newUp);
        
        //right de nouvelle direction
        let newRight = Vector3D.crossProduct(newUp, newForward);
    
        let M = new Matrix4x4();
        M.m = [
            [newRight.x,    newRight.y,     newRight.z,     0],
            [newUp.x,       newUp.y,        newUp.z,        0],
            [newForward.x,  newForward.y,   newForward.z,   0],
            [pos.x,         pos.y,          pos.z,          1]
        ];
        return M;
    }
    
    static quickInverse(M1){ //only for translation / rotation Matrix
        let M2 = new Matrix4x4();
        let A = new Vector3D(M1.m[0][0], M1.m[0][1], M1.m[0][2]);
        let B = new Vector3D(M1.m[1][0], M1.m[1][1], M1.m[1][2]);
        let C = new Vector3D(M1.m[2][0], M1.m[2][1], M1.m[2][2]);
        let T = new Vector3D(M1.m[3][0], M1.m[3][1], M1.m[3][2]); //translation Vector
        M2.m = [
            [A.x,    B.x,   C.x,    0],  
            [A.y,    B.y,   C.y,    0],  
            [A.z,    B.z,   C.z,    0],  
            [-Vector3D.dotProduct(T,A),    -Vector3D.dotProduct(T,B),     -Vector3D.dotProduct(T,C),    1]
        ];
        return M2;
    }

    constructor(values=Array.from(Array(4), () => Array(4).fill(0))){
        this.m = values;
    }
}


class Mesh{
    constructor(vertices = [], triangles = [], rotationSpeed = 0.75){
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


class Camera{
    constructor(movementSpeed, rotationSpeed){
        this.pos = new Vector3D(0, 0, 0);
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed
        this.yaw = 0; //Y angle
        this.pitch = 0; //X angle
        this.lookDirection = new Vector3D(0, 0, 1); //init looking at Z ?
        this.locked = false; //is mouse locked in
        this.runMutliplactor = 5;
    }
    
    initialize(){
        document.body.addEventListener('mousemove', (e) => { //fonction anonyme to keep this as controller camera
            // console.log(this.locked);
            if(this.locked){
                this.updateAngles(e.movementX, e.movementY);
            }
        // console.log("mousemove");
        });
    }

    updateAngles(x, y){
        let sensi = 500;
        this.yaw += x/sensi;
        this.pitch -= y/sensi;
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
        let forward = Vector3D.multiply(this.lookDirection, this.movementSpeed);
        if(k["Shift"]){
            forward = Vector3D.multiply(forward, this.runMutliplactor); 
        }
        let right = Matrix4x4.multiplyVector(Matrix4x4.rotationY(Math.PI/2), forward);
        // console.log(forward.x, forward.y, forward.z);
        // console.log(right.x, right.y, right.z);
        if(k["q"]){
            this.pos = Vector3D.sub(this.pos, right);
            // this.yaw -= this.rotationSpeed
        }
        if(k["d"]){
            this.pos = Vector3D.add(this.pos, right);
            // this.yaw += this.rotationSpeed
        }
        if(k["z"]){
            this.pos = Vector3D.add(this.pos, forward);
        }
        if(k["s"]){
            let forwardWithoutY = forward;
            forwardWithoutY.y = 0;
            this.pos = Vector3D.sub(this.pos, forwardWithoutY);
        }

        if(k["a"]){
            this.pos.y = changePosition(this.pos.y, -1);
        }
        if(k["e"]){
            this.pos.y = changePosition(this.pos.y, +1);
        }

        if(k["Control"]){
            this.pos.y = changePosition(this.pos.y, -1);
        }
        if(k[" "]){
            this.pos.y = changePosition(this.pos.y, +1);
        }
        
    }
}


class Vector2D{
    constructor(u=0, v=0, w=1){
        this.u = u;
        this.v = v;
        this.w = w;
    }
}
export {Vector3D, Triangle, Matrix4x4, Mesh, Camera, Vector2D}