import Vector3D from "./vec3";
import Vector2D from "./vec2";
import Triangle from "./triangle";
import Texture from "./texture";
import { getTextFromPath } from "./utils";
import Matrix4x4 from "./matrix4";
import { GLOBAL, SCREEN, SCREEN_HEIGHT, SCREEN_WIDTH } from "./setup";
export class World {
    size;
    origin;
    blocks;
    holderBlock;
    liveBlocks;
    constructor(size, origin) {
        this.size = size;
        this.origin = origin;
        this.blocks = [];
        for (let y = 0; y < this.size; y++) {
            let tmpY = [];
            for (let z = 0; z < this.size; z++) {
                let tmpZ = [];
                for (let x = 0; x < this.size; x++) {
                    tmpZ.push(null);
                }
                tmpY.push(tmpZ);
            }
            this.blocks.push(tmpY);
        }
        this.holderBlock = null;
        this.liveBlocks = [];
        // for(let y=0; y<this.size; y++){ //TODO: implement sth
        //     let tmpY: (Block|null)[][] = [];
        //     for(let z=0; z<this.size; z++){
        //         let tmpZ:(Block|null)[] = [];
        //         for(let x=0; x<this.size; x++){
        //             tmpZ.push(null);
        //         }
        //         tmpY.push(tmpZ);
        //     }
        //     this.liveBlocks.push(tmpY);
        // }
    }
    //must be INTGER
    addBlock(block, x, y, z) {
        if (x < this.size && y < this.size && z < this.size) {
            this.blocks[y][z][x] = block;
        }
        else {
            console.log("fuck", x, y, z);
        }
    }
    generateBlocks(radius, blockType, yHeight = 1) {
        let blockTypeRand;
        let block;
        for (let y = this.origin.y - yHeight; y < this.origin.y; y++) {
            for (let x = this.origin.x - radius; x < radius + this.origin.x; x++) {
                for (let z = this.origin.z - radius; z < radius + this.origin.z; z++) {
                    if (blockType == null) {
                        blockTypeRand = BlockType.blockTypes[Math.floor(Math.random() * BlockType.count)];
                        block = new Block(new Vector3D(x, y, z), blockTypeRand);
                    }
                    else {
                        block = new Block(new Vector3D(x, y, z), blockType);
                    }
                    // console.log(x,y,z);
                    this.addBlock(block, x, y, z);
                }
                // console.log(x, "one");
            }
        }
        // console.log(radius);
    }
    blockAtPos(x, y, z) {
        let newPos = Vector3D.sub(new Vector3D(x, y, z), this.origin);
        newPos.floor();
        if (newPos.x < this.size && newPos.z < this.size && newPos.z < this.size
            && newPos.x >= 0 && newPos.y >= 0 && newPos.z >= 0) {
            return this.blocks[newPos.y][newPos.z][newPos.x];
        }
        return null;
    }
    //TODO: implement
    // updateHolderBlock(camera: Camera){
    //     let hit = this.rayCastHit(camera.pos, camera.lookDirection);
    //     if(hit){
    //         let tmpPos
    //         let pos = Vector3D.add(hit.block.pos, hit.hitFrom);
    //         let holderBlock = new Block(pos, currentBlock);
    //         holderBlock.pos.floor();
    //         let triListe = holderBlock.getTriangles();
    //         for(let i=0; i<triListe.length; i++){
    //             mesh.tris.pop();
    //         }
    //         mesh.tris.push(...triListe);
    //     }
    // }
    rayCastHit(pos, target) {
        let currentX = Math.floor(pos.x);
        let currentY = Math.abs(Math.floor(pos.y));
        let currentZ = Math.floor(pos.z);
        let stepX = Math.sign(target.x);
        let stepY = -Math.sign(target.y);
        let stepZ = Math.sign(target.z);
        let deltaX = Math.abs(1 / target.x);
        let deltaY = Math.abs(1 / target.y);
        let deltaZ = Math.abs(1 / target.z);
        let lastStep; //dernier movement emi avant dattendre block, x, y ou z, permet de connaitre coté touché
        let distX, distY, distZ;
        if (stepX > 0) {
            distX = (currentX + 1 - pos.x) * deltaX;
        }
        else {
            distX = (pos.x - currentX) * deltaX;
        }
        if (stepY > 0) {
            distY = (currentY + 1 - Math.abs(pos.y)) * deltaY;
        }
        else {
            distY = (Math.abs(pos.y) - currentY) * deltaY;
        }
        if (stepZ > 0) {
            distZ = (currentZ + 1 - pos.z) * deltaZ;
        }
        else {
            distZ = (pos.z - currentZ) * deltaZ;
        }
        let lastStepX = new Vector3D(1, 0, 0);
        let lastStepY = new Vector3D(0, 1, 0);
        let lastStepZ = new Vector3D(0, 0, 1);
        let hit = false;
        while (!hit && Math.max(Math.abs(currentX), Math.abs(currentY), Math.abs(currentZ)) < this.size) {
            if (distX < distY && distX < distZ) {
                distX += deltaX;
                currentX += stepX;
                lastStep = lastStepX;
            }
            else if (distY < distX && distY < distZ) {
                distY += deltaY;
                currentY += stepY;
                lastStep = lastStepY;
            }
            else {
                distZ += deltaZ;
                currentZ += stepZ;
                lastStep = lastStepZ;
            }
            let blockHitted = this.blockAtPos(currentX, currentY, currentZ);
            if (blockHitted) {
                return blockHitted;
            }
        }
        return null;
    }
    draw() {
        //view space donc clip plane juste plan en face de nous a z = clip distance
        const clipDistance = 0.5;
        const clipPlane = new Vector3D(0, 0, clipDistance); //point de notre plan, juste devant nous
        const clipPlaneNormal = new Vector3D(0, 0, 1);
        const offsetVector = new Vector3D(1, 1, 0); //offset tri points values x,y from (-1,1) to (0,2)
        const HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;
        const HALF_SCREEN_HEIGHT = SCREEN_HEIGHT / 2;
        let no = false;
        let ok = 0;
        this.blocks.forEach(yArray => yArray.forEach(zArray => zArray.forEach(block => {
            // if(block){
            //     no = true;
            //     console.log(block);   
            // }
            if (!block)
                return;
            if (Vector3D.distance(block.pos, GLOBAL.CAMERA.pos) > GLOBAL.renderDistance)
                return;
            block.faces.forEach(face => {
                if (!face.isVisible())
                    return;
                face.triangles.forEach(tri => {
                    // console.log(...tri.p);
                    let triTransformed = tri.copy();
                    triTransformed.toWorld();
                    // console.log(triTransformed);
                    triTransformed.mapToAllPoints((p) => Matrix4x4.multiplyVector(GLOBAL.worldMatrix, p));
                    triTransformed.updateNormal();
                    let cameraRay = Vector3D.sub(triTransformed.p[0], GLOBAL.CAMERA.pos);
                    if (Vector3D.dotProduct(triTransformed.normal, cameraRay) < 0) {
                        // console.log("in");
                        //world space -> view space
                        let triViewed = triTransformed;
                        triViewed.mapToAllPoints((p) => Matrix4x4.multiplyVector(GLOBAL.matrixView, p));
                        //z pointe en face de nous, donc normal au plan est z
                        let tris = Triangle.clipPlane(clipPlane, clipPlaneNormal, triViewed);
                        // console.log(tris);
                        // let tris = [triViewed];
                        //projection,  3D -> 2D
                        // console.log(tris);
                        tris.forEach((tri) => {
                            tri.mapToAllPoints((p) => Matrix4x4.multiplyVector(GLOBAL.matrixProjection, p));
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
                            tri.p[0] = Vector3D.divide(tri.p[0], tri.p[0].w);
                            tri.p[1] = Vector3D.divide(tri.p[1], tri.p[1].w);
                            tri.p[2] = Vector3D.divide(tri.p[2], tri.p[2].w);
                            //re inversÃ© X et Y
                            //flip y for it to point up 
                            // tri.p[0].x *= -1; 
                            // tri.p[0].y *= -1; 
                            // tri.p[1].x *= -1; 
                            // tri.p[1].y *= -1; 
                            // tri.p[2].x *= -1; 
                            // tri.p[2].y *= -1; 
                            //offset into screen
                            tri.p[0] = Vector3D.add(tri.p[0], offsetVector);
                            tri.p[1] = Vector3D.add(tri.p[1], offsetVector);
                            tri.p[2] = Vector3D.add(tri.p[2], offsetVector);
                            //scale to screen size
                            tri.p[0].x *= (HALF_SCREEN_WIDTH / 2);
                            tri.p[0].y *= (HALF_SCREEN_HEIGHT / 2);
                            tri.p[1].x *= (HALF_SCREEN_WIDTH / 2);
                            tri.p[1].y *= (HALF_SCREEN_HEIGHT / 2);
                            tri.p[2].x *= (HALF_SCREEN_WIDTH / 2);
                            tri.p[2].y *= (HALF_SCREEN_HEIGHT / 2);
                            let triProjected = tri;
                            let triangleQueue = [triProjected];
                            let newTrianglesCount = 1;
                            for (let i = 0; i < 4; i++) {
                                let newTriangles;
                                while (newTrianglesCount > 0) {
                                    let triToTest = triangleQueue.shift();
                                    newTrianglesCount--;
                                    newTriangles = [];
                                    switch (i) {
                                        case 0:
                                            newTriangles = Triangle.clipPlane(GLOBAL.planHaut, GLOBAL.normalPlanHaut, triToTest);
                                            break;
                                        case 1:
                                            newTriangles = Triangle.clipPlane(GLOBAL.planBas, GLOBAL.normalPlanBas, triToTest);
                                            break;
                                        case 2:
                                            newTriangles = Triangle.clipPlane(GLOBAL.planGauche, GLOBAL.normalPlanGauche, triToTest);
                                            break;
                                        case 3:
                                            newTriangles = Triangle.clipPlane(GLOBAL.planDroite, GLOBAL.normalPlanDroite, triToTest);
                                            break;
                                    }
                                    triangleQueue.push(...newTriangles);
                                }
                                newTrianglesCount = triangleQueue.length;
                            }
                            // console.log("inDraw");
                            // console.log(triangleQueue);
                            triangleQueue.forEach((tri) => {
                                if (!tri.aux) {
                                    console.log(tri);
                                }
                                // console.log("drawing");
                                // console.log(tri, tri.aux.block.blockType.textures[tri.aux.type]);
                                // SCREEN.drawTexturedTriangle(new Triangle([new Vector3D(0, 0, 1), new Vector3D(0,200,1), new Vector3D(200, 200, 1)]), BlockType.blockTypes[1].textures.sides);
                                // console.log(tri.aux);
                                // console.log(...tri.p);
                                SCREEN.drawTexturedTriangle(tri, tri.aux.block.blockType.textures[tri.aux.type]);
                                //todo contniue implémenter triagnleofblock, de maniere a avoir face coté haut et bas
                            });
                        });
                    }
                });
            });
        })));
    }
}
export class BlockType {
    name;
    path;
    textures; //TODO: fix to be Object, Map, {}
    constructor(name, path, textures) {
        this.name = name;
        this.path = path;
        this.textures = textures;
        BlockType.blockTypes.push(this);
        BlockType.count++;
    }
    static blockTypes = [];
    static blockTypesName = [];
    static count = 0;
    static async initBlocks() {
        let blockTypesString = await getTextFromPath("./blocks/blocks_list.txt");
        BlockType.blockTypesName = blockTypesString.split("\r\n");
        BlockType.blockTypesName.forEach(async (name) => {
            await BlockType.loadBlockType(name);
        });
    }
    static async loadBlockType(name) {
        let path = name + ".block"; //sus 
        let text = await getTextFromPath(path);
        let blockInfo = JSON.parse(text);
        let textures = {};
        for (const [name, path] of Object.entries(blockInfo.textures)) {
            textures[name] = await Texture.loadTexture(path); //TODO fix as any
        }
        new BlockType(name, path, textures);
    }
}
export class Block {
    pos;
    blockType;
    faces;
    static worldMap = [];
    constructor(pos, blockType) {
        this.pos = pos;
        this.blockType = blockType;
        //todo : 3d rendering with points index value face
        let p0 = new Vector3D(0, 0, 0);
        let p1 = new Vector3D(0, 1, 0);
        let p2 = new Vector3D(1, 1, 0);
        let p3 = new Vector3D(1, 0, 0);
        let p4 = new Vector3D(0, 0, 1);
        let p5 = new Vector3D(0, 1, 1);
        let p6 = new Vector3D(1, 1, 1);
        let p7 = new Vector3D(1, 0, 1);
        this.faces = [
            new Face(p0, p1, p2, p3, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "sides", new Vector3D(0, 0, -1)),
            new Face(p4, p5, p1, p0, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "sides", new Vector3D(-1, 0, 0)),
            new Face(p7, p6, p5, p4, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "sides", new Vector3D(0, 0, +1)),
            new Face(p3, p2, p6, p7, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "sides", new Vector3D(+1, 0, 0)),
            new Face(p0, p3, p7, p4, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, this.blockType.textures.top ? "top" : "sides", new Vector3D(0, +1, 0)),
            new Face(p1, p5, p6, p2, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, this.blockType.textures.bottom ? "bottom" : "sides", new Vector3D(0, -1, 0)) //bottom and top inversé todo fix 
        ];
    }
    // getNeighborX(sign: number){
    // }
    // getNeighbor(x,y,z){
    //     if(Math.abs(x+y+z) != 1){
    //         console.log("getNeighbor too much info x y z != 1");
    //         return null;
    //     } else {
    //         if(Block.worldMap[this.z + z][this.y + y][this.x + x]){
    //             return Block.worldMap[this.z + z][this.y + y][this.x + x];
    //         } else {
    //             return null;
    //         }
    //     }
    // }
    getTriangles() {
        let triangles = [];
        this.faces.forEach(face => {
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
export class Face {
    block;
    type;
    triangles;
    side;
    constructor(p0, p1, p2, p3, t0, t1, t2, t3, block, type = "sides", side) {
        this.block = block;
        this.type = type;
        this.side = side;
        this.triangles = [
            new TriangleOfBlock([p0, p1, p2], [t0, t1, t2], this),
            new TriangleOfBlock([p2, p3, p0], [t2, t3, t0], this)
        ];
    }
    getTriangles() {
        return this.triangles;
    }
    isVisible() {
        let tmpVec = Vector3D.add(this.block.pos, this.side);
        tmpVec.floor();
        return GLOBAL.WORLD.blocks[tmpVec.y][tmpVec.z][tmpVec.x] == null;
        // return GLOBAL.WORLD.blockAtPos(tmpVec.x, tmpVec.y, tmpVec.z) == null; //TODO:fix very slow du to at pos being very slow due to comparaison
    }
}
export class TriangleOfBlock extends Triangle {
    // face: Face | null;
    constructor(points = [new Vector3D(0, 0, 0), new Vector3D(0, 1, 0), new Vector3D(1, 1, 0)], textures = [new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1)], face = null) {
        super(points, textures);
        this.aux = face;
    }
}
