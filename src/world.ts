import Vector3D from "./vec3.js";
import Vector2D from "./vec2.js";
import Triangle from "./triangle.js";
import Texture from "./texture.js";
import Camera from "./camera.js";
import { copy, getTextFromPath } from "./utils.js";
import Matrix4x4 from "./matrix4.js";
import { GLOBAL, SCREEN, SCREEN_HEIGHT, SCREEN_WIDTH } from "./setup.js";
import { drawBlock } from "./utils3D.js";

export class World{
    size: number;
    origin: Vector3D;
    blocks: (Block|null)[][][];
    holderBlock: (Block|null);
    backupBlocks: (Block|null)[][][];
    constructor(size: number, origin: Vector3D){
        this.size = size;
        this.origin = origin;
        this.blocks = [];
        for(let y=0; y<this.size; y++){
            let tmpY: (Block|null)[][] = [];
            for(let z=0; z<this.size; z++){
                let tmpZ:(Block|null)[] = [];
                for(let x=0; x<this.size; x++){
                    tmpZ.push(null);
                }
                tmpY.push(tmpZ);
            }
            this.blocks.push(tmpY);
        }
        this.holderBlock = null;
        this.backupBlocks = [];
        for(let y=0; y<this.size; y++){ //TODO: implement sth
            let tmpY: (Block|null)[][] = [];
            for(let z=0; z<this.size; z++){
                let tmpZ:(Block|null)[] = [];
                for(let x=0; x<this.size; x++){
                    tmpZ.push(null);
                }
                tmpY.push(tmpZ);
            }
            this.backupBlocks.push(tmpY);
        }
    }
    
    //must be INTGER
    addBlock(block: Block, x: number, y:number, z: number){
        // x= Math.floor(x);
        // y= Math.floor(y);
        // z= Math.floor(z);
        if(x < this.size && y < this.size && z < this.size){
            this.blocks[y][z][x] = block;
        } else {
            console.log("fuck", x , y, z);
        }
    }

    generateBlocks(radius: number, blockTypes: (BlockType[] | null), yHeight: number = 1,){
        let blockTypeRand;
        let block;
        let block2;
        for( let y = this.origin.y - yHeight; y<this.origin.y; y++){
                        for( let z = this.origin.z - radius; z<radius + this.origin.z; z++){
                for(let x = this.origin.x - radius; x<radius + this.origin.x; x++){
                    let r;
                    if(blockTypes == null){
                        blockTypeRand = BlockType.blockTypes[Math.floor(Math.random() * BlockType.count)];
                        block = new Block(new Vector3D(x, y, z), blockTypeRand);
                        block2 = new Block(new Vector3D(x, y, z), blockTypeRand);
                    }else{
                        blockTypeRand = blockTypes[Math.floor(Math.random() * blockTypes.length)];
                        block = new Block(new Vector3D(x, y, z), blockTypeRand);
                        block2 = new Block(new Vector3D(x, y, z), blockTypeRand);
                    }
                // console.log(x,y,z);
                    this.addBlock(block, x, y, z);
                    this.backupBlocks[y][z][x] = block2
                }
                // console.log(x, "one");
                
            }
        }        
    }

    blockAtPos(x: number, y: number, z: number) : (Block | null){ //TODO: use Vector3D ?
        let newPos = new Vector3D(x,y,z);
        newPos.floor();
        // console.log(newPos); 
        
        if(newPos.x < this.size && newPos.z < this.size && newPos.z < this.size
            && newPos.x >= 0 && newPos.y >= 0 && newPos.z >= 0){
                if(!this.blocks[newPos.y]){
                    console.log(newPos);
                    
                }
            return this.blocks[newPos.y][newPos.z][newPos.x];
        }
        return null;
    }

    getBlock(pos: Vector3D){
        return this.blocks[pos.y][pos.z][pos.x];
    }

    rayCastHit(pos: Vector3D, target: Vector3D){
        let currentX = Math.floor(pos.x);
        let currentY = Math.floor(pos.y);
        let currentZ = Math.floor(pos.z);
    
        let stepX = Math.sign(target.x);
        let stepY = Math.sign(target.y);
        let stepZ = Math.sign(target.z);
    
        let deltaX = Math.abs(1/target.x);
        let deltaY = Math.abs(1/target.y);
        let deltaZ = Math.abs(1/target.z);
    
        let lastStep: Vector3D; //dernier movement emi avant dattendre block, x, y ou z, permet de connaitre coté touché
    
        let distX: number, distY: number, distZ: number;
        if(stepX>0){
            distX = (currentX + 1 - pos.x) * deltaX;
        } else {
            distX = (pos.x - currentX) * deltaX;
        }
    
        if(stepY>0){
            distY = (currentY + 1 - Math.abs(pos.y)) * deltaY;
        } else {
            distY = (Math.abs(pos.y) - currentY) * deltaY;
        }
    
        if(stepZ>0){
            distZ = (currentZ + 1 - pos.z) * deltaZ;
        } else {
            distZ = (pos.z - currentZ) * deltaZ;
        }
        let lastStepX = new Vector3D(-stepX,0,0);
        let lastStepY = new Vector3D(0,-stepY,0);
        let lastStepZ = new Vector3D(0,0,-stepZ);
        let hit = false;
        while(!hit && Math.max(Math.abs(currentX), Math.abs(currentY), Math.abs(currentZ)) < this.size - 1
        && Math.min(Math.abs(currentX), Math.abs(currentY), Math.abs(currentZ)) > 0){
            if(distX < distY && distX < distZ){
                distX+= deltaX;
                currentX+=stepX;
                lastStep = lastStepX;
            } else if(distY < distX && distY < distZ){
                distY+= deltaY;
                currentY+=stepY;
                lastStep = lastStepY;
            } else {
                distZ+= deltaZ;
                currentZ+=stepZ;
                lastStep = lastStepZ;
            }
            let blockHitted = this.blockAtPos(currentX, currentY, currentZ);
            if(blockHitted){
                return {block: blockHitted, dir: lastStep};
            }            
        }
        return null;
    }

    draw(){
        //view space donc clip plane juste plan en face de nous a z = clip distance
        this.blocks.forEach(yArray => yArray.forEach(zArray => zArray.forEach(block => { //TODO: should we do this ? 
            if(!block?.pos.equals(GLOBAL.holderBlock.pos)){
                drawBlock(block);
            }
        })));
            // if(block){
            //     no = true;
            //     console.log(block);   
            // }
    }
}

// {
//     top:
// }
interface TextureType{
    sides?: Texture,
    top?: Texture,
    bottom?: Texture
}

enum Sides {
    sides = "sides",
    top = "top",
    bottom = "bottom",
} 

export class BlockType{
    name: string;
    path: string;
    textures: any; //TODO: fix to be Object, Map, {}
    
    constructor(name: string, path: string, textures: {}){
        this.name = name;
        this.path = path;
        this.textures = textures;
        
        BlockType.blockTypes.push(this);
        (BlockType.blockTypesDict as any)[name] = this;
        BlockType.count ++;        
    }

    static blockTypes: BlockType[] = [];
    static blockTypesName: string[] = []; 
    static blockTypesDict = {};
    static count: number = 0;

    static async initBlocks(){
        let blockTypesString = await getTextFromPath("./blocks/blocks_list.txt") as string;
        BlockType.blockTypesName = blockTypesString.split("\n"); 
        
        for (let i = 0; i < BlockType.blockTypesName.length; i++) {
            await BlockType.loadBlockType(BlockType.blockTypesName[i]);
            
        }
    }

    static async loadBlockType(name: string){
        let path: string = name + ".block"; //sus 
        let text: string = await getTextFromPath("blocks/" + path);
              
        let blockInfo = JSON.parse(text);
        let textures: TextureType = {};
        console.log(blockInfo);
        
        let ent = Object.entries(blockInfo.textures);
        for (let i=0; i<Object.entries(blockInfo.textures).length; i++){
            let name = ent[i][0];
            let path = ent[i][1];
            
            textures[name] = await Texture.loadTexture("textures/" + (path as string)); //TODO fix as any
            // console.log( (textures as any)[name]);
            
        }     
        
        new BlockType(name, path, textures);
    }

    getSideTextures(side: string){
        if(this.textures[side]){
            return this.textures[side];
        }
        return this.textures["sides"];
    }
}

export class Block{
    pos: Vector3D;
    blockType: BlockType;
    faces: Face[];
    
    static worldMap = [];

    constructor(pos: Vector3D, blockType: BlockType){
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

        this.faces = [
            new Face(p0, p1, p2, p3, new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1), new Vector2D(1,0), this, "sides", new Vector3D(0,0,-1)),
            new Face(p4, p5, p1, p0, new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1), new Vector2D(1,0), this, "sides", new Vector3D(-1,0,0)),
            new Face(p7, p6, p5, p4, new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1), new Vector2D(1,0), this, "sides", new Vector3D(0,0,+1)),
            new Face(p3, p2, p6, p7, new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1), new Vector2D(1,0), this, "sides", new Vector3D(1,0,0)),
            new Face(p0, p3, p7, p4, new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1), new Vector2D(1,0), this, "top" , new Vector3D(0,-1,0)), //side to look for visible flipped too
            new Face(p1, p5, p6, p2, new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1), new Vector2D(1,0), this, "bottom", new Vector3D(0,+1,0)) //bottom and top inversé todo fix 
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

    getTriangles(){
        let triangles : Triangle[]= [];
        this.faces.forEach( face => {
            triangles.push(...face.getTriangles());
        });
        triangles = triangles.map((tri) => {
            tri.p = tri.p.map((p: Vector3D) => {
               return Vector3D.add(p, this.pos);
            });
            return tri;
        });
        return triangles;
    }
}

export class Face{
    
    block: Block;
    type: string;
    triangles: Triangle[];
    side: Vector3D;
    constructor(
        p0: Vector3D, p1: Vector3D, p2: Vector3D, p3: Vector3D, 
        t0: Vector2D, t1: Vector2D, t2: Vector2D, t3: Vector2D, 
        block: Block, type: string ="sides",
        side: Vector3D){
        this.block = block;
        this.type = type;
        this.side = side;
        this.triangles = [
            new TriangleOfBlock([p0, p1, p2], [t0, t1, t2], this), 
            new TriangleOfBlock([p2, p3, p0], [t2, t3, t0], this)
        ];
    }

    getTriangles(){
        return this.triangles;
    }

    isVisible(){
        let tmpVec = Vector3D.add(this.block.pos, this.side);
        return GLOBAL.WORLD.blocks[tmpVec.y][tmpVec.z][tmpVec.x] == null;

        // return GLOBAL.WORLD.blockAtPos(tmpVec.x, tmpVec.y, tmpVec.z) == null; //TODO:fix very slow du to at pos being very slow due to comparaison
    }
}

export class TriangleOfBlock extends Triangle{
    // face: Face | null;
    constructor(
            points: Vector3D[]=[new Vector3D(0,0,0), new Vector3D(0,1,0), new Vector3D(1,1,0)], 
            textures: Vector2D[]=[new Vector2D(0,0), new Vector2D(0,1), new Vector2D(1,1)], 
            face: Face | null =null
        ){
            super(points, textures);
            this.aux = face;
        }
}