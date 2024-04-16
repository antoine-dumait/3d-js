import { GLOBAL, SCREEN, SCREEN_WIDTH } from "./setup";
import MyScreen from "./screen";
import Vector2D from "./vec2";
import Vector3D from "./vec3";
import Triangle from "./triangle";
import Matrix4x4 from "./matrix4";
import Camera from "./camera";
import Controller from "./controller";
import { World, BlockType, Block, Face, TriangleOfBlock } from "./world";


const CAMERA: Camera = GLOBAL.CAMERA;
const WORLD: World = GLOBAL.WORLD;

const zOffset = 2;
const matrixZOffset = Matrix4x4.translation(0, 0, zOffset);
GLOBAL.worldMatrix = matrixZOffset;
let matrixCameraRotation;
const target = new Vector3D(0, 0, 1);
let forward;
let matrixCamera;
GLOBAL.test = false;
// SCREEN.drawTexturedTriangle(new Triangle([new Vector3D(350, 140, 1), new Vector3D(356,180,1), new Vector3D(320, 180, 1)]), BlockType.blockTypes[0].textures.sides)
// SCREEN.flushFrame();
function update(){
    // console.countReset();
    GLOBAL.zero = 0;
    CAMERA.updateKeys(GLOBAL.CONTROLLER);
    // console.log(CAMERA.pos);
    
    matrixCameraRotation = Matrix4x4.rotationX(CAMERA.pitch);
    matrixCameraRotation = Matrix4x4.multiplyMatrix(matrixCameraRotation, Matrix4x4.rotationY(CAMERA.yaw));
    CAMERA.lookDirection = Matrix4x4.multiplyVector(matrixCameraRotation, target);
    forward = Vector3D.add(CAMERA.pos, CAMERA.lookDirection);
    matrixCamera = Matrix4x4.pointAt(CAMERA.pos, forward, GLOBAL.UP);
    GLOBAL.matrixView = Matrix4x4.quickInverse(matrixCamera);
    WORLD.draw();
    // SCREEN.drawTexturedTriangle(new Triangle([new Vector3D(0, 0, 1), new Vector3D(0,200,1), new Vector3D(200, 200, 1)]), BlockType.blockTypes[1].textures.sides);
    SCREEN.flushFrame();
    console.log("updated");
    
    window.requestAnimationFrame(update);
}

update();