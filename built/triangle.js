import Vector3D from "./vec3.js";
import Vector2D from "./vec2.js";
export default class Triangle {
    p;
    t;
    normal;
    aux;
    static clipPlane(planePoint, planeNormal, tri, any = null) {
        planeNormal = Vector3D.normalise(planeNormal); //important normal
        //plus petite distance point, plan, SIGNÉ (+,-)
        function distance(p) {
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
        if (distP0 >= 0) {
            insidePoints.push(tri.p[0]);
            insideTextures.push(tri.t[0]);
        }
        else {
            outsidePoints.push(tri.p[0]);
            outsideTextures.push(tri.t[0]);
        }
        if (distP1 >= 0) {
            insidePoints.push(tri.p[1]);
            insideTextures.push(tri.t[1]);
        }
        else {
            outsidePoints.push(tri.p[1]);
            outsideTextures.push(tri.t[1]);
        }
        if (distP2 >= 0) {
            insidePoints.push(tri.p[2]);
            insideTextures.push(tri.t[2]);
        }
        else {
            outsidePoints.push(tri.p[2]);
            outsideTextures.push(tri.t[2]);
        }
        //découpage des triangles
        let nombreOutsidePoints = outsidePoints.length;
        let nombreInsidePoints = insidePoints.length;
        // console.log(nombreInsidePoints, nombreOutsidePoints);
        if (nombreInsidePoints == 0) { //tout les points sont derriere, ne rien afficher
            return [];
        }
        if (nombreInsidePoints == 3) { //tout les points sont devants, tout afficher, return le triangle original
            return [tri];
        }
        if (nombreInsidePoints == 1 && nombreOutsidePoints == 2) { //2 points derriere, a remplacer
            let tri1 = tri.copy(); //permet de choisir entre triangle et triangle of block
            //todo change adding face even if type is Triangle() to in Triangle.returnCOpy Too
            //remplacer les point interieur par eux meme sur le vecteur intersectant le plan
            tri1.p[0] = insidePoints[0];
            tri1.t[0] = insideTextures[0];
            //insidePoints[0] to outisdePoints[1] forment une ligne entre les deux intersectant le plan
            let intersection1 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
            let distanceMidPoint1 = intersection1.distance;
            tri1.p[1] = intersection1.vector;
            tri1.t[1].u = distanceMidPoint1 * (outsideTextures[0].u - insideTextures[0].u) + insideTextures[0].u;
            tri1.t[1].v = distanceMidPoint1 * (outsideTextures[0].v - insideTextures[0].v) + insideTextures[0].v;
            tri1.t[1].w = distanceMidPoint1 * (outsideTextures[0].w - insideTextures[0].w) + insideTextures[0].w;
            let intersection2 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[1]);
            let distanceMidPoint2 = intersection2.distance;
            tri1.p[2] = intersection2.vector;
            tri1.t[2].u = distanceMidPoint2 * (outsideTextures[1].u - insideTextures[0].u) + insideTextures[0].u;
            tri1.t[2].v = distanceMidPoint2 * (outsideTextures[1].v - insideTextures[0].v) + insideTextures[0].v;
            tri1.t[2].w = distanceMidPoint2 * (outsideTextures[1].w - insideTextures[0].w) + insideTextures[0].w;
            return [tri1];
        }
        if (nombreInsidePoints == 2 && nombreOutsidePoints == 1) { //former 2 nouveaux triangles
            //nouveaux triangles conservent propriétes de l'ancien triangle
            //TODO: optimize triangle duplication
            let tri1 = tri.copy(); //permet de choisir entre triangle et triangle of block
            let tri2 = tri.copy(); //permet de choisir entre triangle et triangle of block
            //creation premier tri
            tri1.p[0] = insidePoints[0];
            tri1.t[0] = insideTextures[0];
            tri1.p[1] = insidePoints[1];
            tri1.t[1] = insideTextures[1];
            let intersection1 = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
            let distanceMidPoint1 = intersection1.distance;
            tri1.p[2] = intersection1.vector;
            tri1.t[2].u = distanceMidPoint1 * (outsideTextures[0].u - insideTextures[0].u) + insideTextures[0].u;
            tri1.t[2].v = distanceMidPoint1 * (outsideTextures[0].v - insideTextures[0].v) + insideTextures[0].v;
            tri1.t[2].w = distanceMidPoint1 * (outsideTextures[0].w - insideTextures[0].w) + insideTextures[0].w;
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
            let distanceMidPoint2 = intersection2.distance;
            tri2.p[2] = intersection2.vector;
            tri2.t[2].u = distanceMidPoint2 * (outsideTextures[0].u - insideTextures[1].u) + insideTextures[1].u;
            tri2.t[2].v = distanceMidPoint2 * (outsideTextures[0].v - insideTextures[1].v) + insideTextures[1].v;
            tri2.t[2].w = distanceMidPoint2 * (outsideTextures[0].w - insideTextures[1].w) + insideTextures[1].w;
            return [tri1, tri2]; //2 nouveaux tri
        }
        return [];
    }
    constructor(points = [new Vector3D(0, 0, 0), new Vector3D(0, 1, 0), new Vector3D(1, 1, 0)], textures = [new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1)]) {
        this.p = points; // [v1, v2, v3]                    //[[x0,y0,z0], [x1,y1,z1], [x2,y2,z2]]
        this.t = textures;
        this.normal = null;
    }
    mapToAllPoints(func) {
        for (let i = 0; i < 3; i++) {
            this.p[i] = func(this.p[i]);
        }
    }
    getNormal() {
        let line1 = Vector3D.sub(this.p[1], this.p[0]);
        let line2 = Vector3D.sub(this.p[2], this.p[0]);
        let normal = Vector3D.crossProduct(line1, line2);
        return Vector3D.normalise(normal);
    }
    updateNormal() {
        let line1 = Vector3D.sub(this.p[1], this.p[0]);
        let line2 = Vector3D.sub(this.p[2], this.p[0]);
        let normal = Vector3D.crossProduct(line1, line2);
        this.normal = Vector3D.normalise(normal);
    }
    copy() {
        let tmp = new Triangle([this.p[0].copy(), this.p[1].copy(), this.p[2].copy()], [this.t[0].copy(), this.t[1].copy(), this.t[2].copy()]);
        tmp.normal = this.normal;
        tmp.aux = this.aux;
        return tmp;
    }
    toWorld() {
        this.p[0] = Vector3D.add(this.p[0], this.aux.block.pos);
        this.p[1] = Vector3D.add(this.p[1], this.aux.block.pos);
        this.p[2] = Vector3D.add(this.p[2], this.aux.block.pos);
    }
}
