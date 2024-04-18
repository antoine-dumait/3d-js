import Vector3D from "./vec3.js";
import Vector2D from "./vec2.js";
import Triangle from "./triangle.js";
import Texture from "./texture.js";
import { getTextFromPath } from "./utils.js";
import { GLOBAL } from "./setup.js";
import { drawBlock } from "./utils3D.js";
export class World {
    size;
    origin;
    blocks;
    holderBlock;
    backupBlocks;
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
        this.backupBlocks = [];
        for (let y = 0; y < this.size; y++) { //TODO: implement sth
            let tmpY = [];
            for (let z = 0; z < this.size; z++) {
                let tmpZ = [];
                for (let x = 0; x < this.size; x++) {
                    tmpZ.push(null);
                }
                tmpY.push(tmpZ);
            }
            this.backupBlocks.push(tmpY);
        }
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
    generateBlocks(radius, blockTypes, yHeight = 1) {
        let blockTypeRand;
        let block;
        let block2;
        for (let y = this.origin.y - yHeight; y < this.origin.y; y++) {
            for (let z = this.origin.z - radius; z < radius + this.origin.z; z++) {
                for (let x = this.origin.x - radius; x < radius + this.origin.x; x++) {
                    let r;
                    if (blockTypes == null) {
                        blockTypeRand = BlockType.blockTypes[Math.floor(Math.random() * BlockType.count)];
                        block = new Block(new Vector3D(x, y, z), blockTypeRand);
                        block2 = new Block(new Vector3D(x, y, z), blockTypeRand);
                    }
                    else {
                        blockTypeRand = blockTypes[Math.floor(Math.random() * blockTypes.length)];
                        block = new Block(new Vector3D(x, y, z), blockTypeRand);
                        block2 = new Block(new Vector3D(x, y, z), blockTypeRand);
                    }
                    // console.log(x,y,z);
                    this.addBlock(block, x, y, z);
                    this.backupBlocks[y][z][x] = block2;
                }
                // console.log(x, "one");
            }
        }
    }
    blockAtPos(x, y, z) {
        let newPos = new Vector3D(x, y, z);
        newPos.floor();
        // console.log(newPos); 
        if (newPos.x < this.size && newPos.z < this.size && newPos.z < this.size
            && newPos.x >= 0 && newPos.y >= 0 && newPos.z >= 0) {
            if (!this.blocks[newPos.y]) {
                console.log(newPos);
            }
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
        let currentY = Math.floor(pos.y);
        let currentZ = Math.floor(pos.z);
        let stepX = Math.sign(target.x);
        let stepY = Math.sign(target.y);
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
        let lastStepX = new Vector3D(-stepX, 0, 0);
        let lastStepY = new Vector3D(0, -stepY, 0);
        let lastStepZ = new Vector3D(0, 0, -stepZ);
        let hit = false;
        while (!hit && Math.max(Math.abs(currentX), Math.abs(currentY), Math.abs(currentZ)) < this.size - 1
            && Math.min(Math.abs(currentX), Math.abs(currentY), Math.abs(currentZ)) > 0) {
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
                return { block: blockHitted, dir: lastStep };
            }
        }
        return null;
    }
    draw() {
        //view space donc clip plane juste plan en face de nous a z = clip distance
        this.blocks.forEach(yArray => yArray.forEach(zArray => zArray.forEach(block => {
            if (!block?.pos.equals(GLOBAL.holderBlock.pos)) {
                drawBlock(block);
            }
        })));
        // if(block){
        //     no = true;
        //     console.log(block);   
        // }
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
        BlockType.blockTypesDict[name] = this;
        BlockType.count++;
    }
    static blockTypes = [];
    static blockTypesName = [];
    static blockTypesDict = {};
    static count = 0;
    static async initBlocks() {
        let blockTypesString = await getTextFromPath("./blocks/blocks_list.txt");
        BlockType.blockTypesName = blockTypesString.split("\n");
        console.log(this.blockTypesName);
        BlockType.blockTypesName.forEach(async (name) => {
            await BlockType.loadBlockType(name);
        });
    }
    static async loadBlockType(name) {
        let path = name + ".block"; //sus 
        let text = await getTextFromPath("blocks/" + path);
        console.log(text);
        let blockInfo = JSON.parse(text);
        let textures = {};
        let ent = Object.entries(blockInfo.textures);
        for (let i = 0; i < Object.entries(blockInfo.textures).length; i++) {
            let name = ent[i][0];
            let path = ent[i][1];
            // console.log(name);
            textures[name] = await Texture.loadTexture("textures/" + path); //TODO fix as any
            // console.log( (textures as any)[name]);
        }
        console.log(textures);
        new BlockType(name, path, textures);
    }
    getSideTextures(side) {
        if (this.textures[side]) {
            return this.textures[side];
        }
        return this.textures["sides"];
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
            new Face(p3, p2, p6, p7, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "sides", new Vector3D(1, 0, 0)),
            new Face(p0, p3, p7, p4, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "top", new Vector3D(0, -1, 0)), //side to look for visible flipped too
            new Face(p1, p5, p6, p2, new Vector2D(0, 0), new Vector2D(0, 1), new Vector2D(1, 1), new Vector2D(1, 0), this, "bottom", new Vector3D(0, +1, 0)) //bottom and top inversé todo fix 
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
