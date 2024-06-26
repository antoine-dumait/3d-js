import { GLOBAL, SCREEN } from "./setup.js";
import Vector3D from "./vec3.js";
import Matrix4x4 from "./matrix4.js";
import { drawBlock, showHolderBlock } from "./utils3D.js";
const CAMERA = GLOBAL.CAMERA;
const WORLD = GLOBAL.WORLD;
const zOffset = 0;
const matrixZOffset = Matrix4x4.translation(0, 0, zOffset);
GLOBAL.worldMatrix = matrixZOffset;
let matrixCameraRotation;
const target = new Vector3D(0, 0, 1);
let forward;
let matrixCamera;
GLOBAL.test = false;
// SCREEN.drawTexturedTriangle(new Triangle([new Vector3D(350, 140, 1), new Vector3D(356,180,1), new Vector3D(320, 180, 1)]), BlockType.blockTypes[0].textures.sides)
// SCREEN.flushFrame();
let prevTimeStamp = 0;
GLOBAL.deltaTimeStamp = 0;
function update(timeStamp) {
    // let blockUnder = WORLD.getBlock(Vector3D.add(Vector3D.floor(GLOBAL.CAMERA.pos), new Vector3D(0,1,0)));
    // if(blockUnder == null){
    //     CAMERA.pos = Vector3D.sub(CAMERA.pos, new Vector3D(0,-0.3,0));
    // } else{
    //     // console.log(blockUnder);
    // }
    // console.countReset();
    showHolderBlock();
    GLOBAL.zero = 0;
    CAMERA.updateKeys(GLOBAL.CONTROLLER);
    // console.log(CAMERA.pos);
    GLOBAL.CAMERA.movementSpeed = GLOBAL.movementSpeed * GLOBAL.deltaTimeStamp;
    GLOBAL.CAMERA.rotationSpeed = GLOBAL.rotationSpeed * GLOBAL.deltaTimeStamp;
    GLOBAL.UI.updateFPSCounter(GLOBAL.deltaTimeStamp);
    GLOBAL.UI.updateTriangleCount();
    GLOBAL.UI.updatePaintCallCount();
    GLOBAL.UI.updateXYZShower();
    matrixCameraRotation = Matrix4x4.rotationX(CAMERA.pitch);
    matrixCameraRotation = Matrix4x4.multiplyMatrix(matrixCameraRotation, Matrix4x4.rotationY(CAMERA.yaw));
    CAMERA.lookDirection = Matrix4x4.multiplyVector(matrixCameraRotation, target);
    forward = Vector3D.add(CAMERA.pos, CAMERA.lookDirection);
    matrixCamera = Matrix4x4.pointAt(CAMERA.pos, forward, GLOBAL.UP);
    GLOBAL.matrixView = Matrix4x4.quickInverse(matrixCamera);
    WORLD.draw();
    drawBlock(GLOBAL.holderBlock, true);
    SCREEN.flushFrame();
    // console.log("updated");
    GLOBAL.deltaTimeStamp = timeStamp - prevTimeStamp;
    prevTimeStamp = timeStamp;
    window.requestAnimationFrame(update);
}
update(0);
