import Matrix4x4 from "./matrix4.js";
import { GLOBAL, SCREEN, SCREEN_HEIGHT, SCREEN_WIDTH } from "./setup.js";
import Triangle from "./triangle.js";
import Vector3D from "./vec3.js";
import { Block, BlockType, Face } from "./world.js";

export function showHolderBlock(){
    // console.log(GLOBAL.CAMERA.pos);
    // console.log(GLOBAL.CAMERA.lookDirection);
    
    let hit = GLOBAL.WORLD.rayCastHit(GLOBAL.CAMERA.pos, GLOBAL.CAMERA.lookDirection);
    // console.log(hitBlock);

    
    // GLOBAL.WORLD.addBlock(new Block(
    //     new Vector3D(GLOBAL.holderBlock.pos.x, GLOBAL.holderBlock.pos.y, GLOBAL.holderBlock.pos.z), BlockType.blockTypes[0]), 
    //     GLOBAL.holderBlock.pos.x, GLOBAL.holderBlock.pos.y, GLOBAL.holderBlock.pos.z);
    // GLOBAL.WORLD.blocks[GLOBAL.holderBlock.pos.y][GLOBAL.holderBlock.pos.z][GLOBAL.holderBlock.pos.x] = null;
    if(hit){
        GLOBAL.hitDir = hit.dir;
        let hitBlock = hit.block;
        // console.log(dir);
        
        // console.log(hitBlock.pos);
        // console.log(GLOBAL.holderBlock.pos);
        // let tmpPos = GLOBAL.holderBlock.pos;
        // let tmpBlock = GLOBAL.WORLD.backupBlocks[tmpPos.y][tmpPos.z][tmpPos.x];
        // let bType;
        // console.log(tmpPos);
        // console.log(tmpBlock);
        
        // if(tmpBlock){
        //     // tmpBlock = tmpBlock.copy();
        // } else {
        //     tmpBlock = null;
        // }
        // console.log(dir);
        
        // console.log(bType);
        GLOBAL.holderBlock.pos = hitBlock.pos;
        GLOBAL.holderBlock.blockType = hitBlock.blockType;
        
        // GLOBAL.holderBlock.pos  = Vector3D.add(hitBlock.pos, dir);
        // GLOBAL.WORLD.addBlock(GLOBAL.holderBlock, GLOBAL.holderBlock.pos.x, GLOBAL.holderBlock.pos.y, GLOBAL.holderBlock.pos.z);
    }
}

export function placeHolderBlock(){
    if(GLOBAL.hitDir){
        GLOBAL.WORLD.addBlock(new Block(Vector3D.add(GLOBAL.holderBlock.pos, GLOBAL.hitDir), GLOBAL.currentBlock), GLOBAL.holderBlock.pos.x, GLOBAL.holderBlock.pos.y, GLOBAL.holderBlock.pos.z);
    }
}

export function drawBlock(block: Block|null, teint=false){
    if(!block)return;
    if(!block.pos){
        
        console.log(block);
        
    }
    const clipDistance = 0.5;
    const clipPlane = new Vector3D(0, 0, clipDistance); //point de notre plan, juste devant nous
    const clipPlaneNormal = new Vector3D(0, 0, 1);
    const offsetVector = new Vector3D(1, 1, 0); //offset tri points values x,y from (-1,1) to (0,2)
    const HALF_SCREEN_WIDTH = SCREEN_WIDTH/2;
    const HALF_SCREEN_HEIGHT = SCREEN_HEIGHT/2;
    if(!block)return;
    if(Vector3D.distance(block.pos, GLOBAL.CAMERA.pos) > GLOBAL.renderDistance)return;
    block!.faces!.forEach( (face: Face) => {
        if(!face.isVisible())
        return;
        face.triangles.forEach(tri => {  
            // console.log(...tri.p);
      
            let triTransformed = tri.copy();
            triTransformed.toWorld();
            // console.log(triTransformed);
            triTransformed.mapToAllPoints((p: Vector3D) => Matrix4x4.multiplyVector(GLOBAL.worldMatrix, p));   
            triTransformed.updateNormal();

            let cameraRay = Vector3D.sub(triTransformed.p[0], GLOBAL.CAMERA.pos);
            
            if(Vector3D.dotProduct(triTransformed.normal!, cameraRay) < 0){                 
                // console.log("in");
                //world space -> view space
                GLOBAL.triangleCount ++;

                let triViewed = triTransformed;
    
                triViewed.mapToAllPoints((p: Vector3D) => Matrix4x4.multiplyVector(GLOBAL.matrixView, p));
                
                //z pointe en face de nous, donc normal au plan est z
    
                let tris = Triangle.clipPlane(clipPlane, clipPlaneNormal, triViewed);
                // console.log(tris);
                
                // let tris = [triViewed];
    
                //projection,  3D -> 2D
                // console.log(tris);
                
                tris!.forEach((tri: Triangle) => {
                    tri.mapToAllPoints((p: Vector3D) => Matrix4x4.multiplyVector(GLOBAL.matrixProjection, p));
                    
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
                    tri.p[0] = Vector3D.divide(tri.p[0], tri.p[0].w)
                    tri.p[1] = Vector3D.divide(tri.p[1], tri.p[1].w)
                    tri.p[2] = Vector3D.divide(tri.p[2], tri.p[2].w)
                    
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

                    for(let i=0; i<4; i++){
                        let newTriangles: Triangle[];
                        while(newTrianglesCount > 0){
                            let triToTest = triangleQueue.shift()!;
                            newTrianglesCount--;
                            newTriangles=[];
                            switch(i){
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
                    
                    triangleQueue.forEach((tri: Triangle) => {
                        
                        SCREEN.drawTexturedTriangle(tri, tri.aux.block.blockType.getSideTextures(tri.aux.type), teint);
                            //todo contniue implémenter triagnleofblock, de maniere a avoir face coté haut et bas
                    });
                });
            }
            });
        });
}