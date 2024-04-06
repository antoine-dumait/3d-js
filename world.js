import { Triangle, Vector2D, Vector3D } from "./utilsThreeD";

class Block{
    constructor(pos, color){
        this.pos = pos;
        let p0 = new Vector3D(0,0,0);
        let p1 = new Vector3D(0,1,0);
        let p2 = new Vector3D(1,1,0);
        let p3 = new Vector3D(1,0,0); 
        let p4 = new Vector3D(0,0,1);
        let p5 = new Vector3D(0,1,1);
        let p6 = new Vector3D(1,1,1);
        let p7 = new Vector3D(1,0,1); 
        let t0 = new Vector2D(0,0);
        let t1 = new Vector2D(0,1);
        let t2 = new Vector2D(1,1);
        let t3 = new Vector2D(1,0); 
        this.faces = [
            new Face(p0, p1, p2, p3, t0, t1, t2, t3, color),
            new Face(p4, p5, p1, p0, t0, t1, t2, t3, color),
            new Face(p7, p6, p5, p4, t0, t1, t2, t3, color),
            new Face(p3, p2, p6, p7, t0, t1, t2, t3, color),
            new Face(p4, p0, p3, p7, t0, t1, t2, t3, color),
            new Face(p1, p5, p6, p2, t0, t1, t2, t3, color)
        ];
        this.color = color;
    }

    getTriangles(){
        let triangles = [];
        this.faces.forEach( face => {
            triangles.push(...face.getTriangles());
        });
        triangles = triangles.map((tri) => {
            tri.p = tri.p.map((p) => {
               return Vector3D.add(p, this.pos);
            });
            return tri;
        });
        return triangles;
    }
}

class Face{
    constructor(p0, p1, p2, p3, t0, t1, t2, t3, color){
        this.triangles = [
            new Triangle([p0, p1, p2], [t0, t1, t2], color), 
            new Triangle([p2, p3, p0], [t2, t3, t0], color)
        ];
    }

    getTriangles(){
        return this.triangles;
    }
}

export {Block, Face};