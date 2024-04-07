import { Triangle, Vector2D, Vector3D } from "./utilsThreeD.js";

class Block{
    constructor(pos, blockType){
        this.pos = pos;
        this.blockType = blockType;
        //todo : 3d rendering with points index value face
        let p0 = new Vector3D(0,0,0);
        let p1 = new Vector3D(0,1,0);
        let p2 = new Vector3D(1,1,0);
        let p3 = new Vector3D(1,0,0); 
        let p4 = new Vector3D(0,0,1);
        let p5 = new Vector3D(0,1,1);
        let p6 = new Vector3D(1,1,1);
        let p7 = new Vector3D(1,0,1); 

        let t0 = new Vector2D(0,0); //sides faces
        let t1 = new Vector2D(0,1);
        let t2 = new Vector2D(1,1);
        let t3 = new Vector2D(1,0);
        
        let topT0 = new Vector2D(0,0); //top face
        let topT1 = new Vector2D(0,1);
        let topT2 = new Vector2D(1,1);
        let topT3 = new Vector2D(1,0);

        let bottomT0 = new Vector2D(0,0); //bottom face
        let bottomT1 = new Vector2D(0,1);
        let bottomT2 = new Vector2D(1,1);
        let bottomT3 = new Vector2D(1,0);
        
        this.faces = [
            new Face(p0, p1, p2, p3, t0, t1, t2, t3, this, "sides"),
            new Face(p4, p5, p1, p0, t0, t1, t2, t3, this, "sides"),
            new Face(p7, p6, p5, p4, t0, t1, t2, t3, this, "sides"),
            new Face(p3, p2, p6, p7, t0, t1, t2, t3, this, "sides"),
            new Face(p4, p0, p3, p7, bottomT0, bottomT1, bottomT2, bottomT3, this, this.blockType.textures.bottom ? "bottom" : "sides"),
            new Face(p1, p5, p6, p2, topT0, topT1, topT2, topT3, this, this.blockType.textures.top ? "top" : "sides")
        ];

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
    constructor(p0, p1, p2, p3, t0, t1, t2, t3, block, type="sides"){
        this.block = block;
        this.type = type;
        this.triangles = [
            new TriangleOfBlock([p0, p1, p2], [t0, t1, t2], this), 
            new TriangleOfBlock([p2, p3, p0], [t2, t3, t0], this)
        ];
    }

    getTriangles(){
        return this.triangles;
    }
}

class TriangleOfBlock extends Triangle{
    constructor(
            points=[new Vector3D(0,0,0), new Vector3D(0,1,0), new Vector3D(1,1,0)], 
            textures=[new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1)], 
            face=null
        ){
            super(points, textures);
            this.face = face;
        }
}
export {Block, Face, TriangleOfBlock};