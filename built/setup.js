import MyScreen from "./screen";
import Camera from "./camera";
import Controller from "./controller";
import Matrix4x4 from "./matrix4";
import { changeSelectedBlock } from "./utils";
import Vector3D from "./vec3";
import { BlockType, World } from "./world";
import { UI } from "./ui";
// const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
const SCREEN_WIDTH = 1280, SCREEN_HEIGHT = 720;
const N_PIXELS = SCREEN_WIDTH * SCREEN_HEIGHT;
const SCREEN = new MyScreen(SCREEN_WIDTH, SCREEN_HEIGHT);
const GLOBAL = {};
GLOBAL.FPS = 0;
GLOBAL.near = 0.1;
GLOBAL.far = 100.0;
GLOBAL.FOVdegrees = 70.0;
GLOBAL.aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
GLOBAL.matrixProjection = Matrix4x4.makeProjection(GLOBAL.FOVdegrees, GLOBAL.aspectRatio, GLOBAL.near, GLOBAL.far);
GLOBAL.deltaTime = 0; //en millisecondes
GLOBAL.UP = new Vector3D(0, 1, 0);
await BlockType.initBlocks();
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(400);
// console.log("Block Types:");
// console.log(BlockType.blockTypes);
// console.log(BlockType.blockTypesName[0]);
// console.log(BlockType.count);
GLOBAL.WORLD_SIZE = 100;
GLOBAL.WORLD_ORIGIN = new Vector3D(Math.floor(GLOBAL.WORLD_SIZE / 2), Math.floor(GLOBAL.WORLD_SIZE / 2), Math.floor(GLOBAL.WORLD_SIZE / 2));
GLOBAL.WORLD = new World(GLOBAL.WORLD_SIZE, GLOBAL.WORLD_ORIGIN);
GLOBAL.WORLD.generateBlocks(49, null, 1); //TODO: fix 50 crashing du to Triangle.isVisble not testing value
console.log("Blocks:", GLOBAL.WORLD.blocks);
GLOBAL.movementSpeed = 0.01;
GLOBAL.deltaMovementSpeed = GLOBAL.movementSpeed * GLOBAL.deltaTime;
GLOBAL.rotationSpeed = 0.03;
GLOBAL.CAMERA = new Camera(GLOBAL.deltaMovementSpeed, GLOBAL.rotationSpeed, new Vector3D(GLOBAL.WORLD_SIZE / 2, GLOBAL.WORLD_SIZE / 2 - 2, GLOBAL.WORLD_SIZE / 2));
GLOBAL.renderDistance = 20;
GLOBAL.CONTROLLER = new Controller();
GLOBAL.CONTROLLER.initialize();
const hotbar = document.getElementById("hotbar");
const FPS_counter = document.getElementById("fps");
const triangle_counter = document.getElementById("triangle_count");
let triangleCount = 0;
let currentIndexHotbar = 0;
let currentBlock = BlockType.blockTypes[currentIndexHotbar];
GLOBAL.UI = new UI(FPS_counter, triangle_counter);
function updateTriangleCountCounter() {
    triangle_counter.textContent = triangleCount;
}
document.addEventListener("pointerlockchange", () => {
    GLOBAL.CAMERA.locked = Boolean(document.pointerLockElement);
});
document.addEventListener("wheel", (e) => {
    changeSelectedBlock(-Math.sign(e.deltaY));
});
document.body.addEventListener('mousemove', (e) => {
    if (GLOBAL.CAMERA.locked) {
        GLOBAL.CAMERA.updateAngles(e.movementX, e.movementY);
    }
});
document.body.addEventListener('click', (e) => {
    document.body.requestPointerLock();
    let forward = Vector3D.add(GLOBAL.CAMERA.pos, GLOBAL.CAMERA.lookDirection);
    // WORLD.placeBlock(); //TODO: implement
});
GLOBAL.currentIndexHotbar = currentIndexHotbar;
GLOBAL.currentBlock = currentBlock;
GLOBAL.borderHautY = 50;
GLOBAL.planHaut = new Vector3D(0, GLOBAL.borderHautY, 0);
GLOBAL.normalPlanHaut = new Vector3D(0, 1, 0);
// ctx.moveTo(0, borderHautY); ctx.lineTo(cnvWidth, borderHautY);
GLOBAL.borderBasY = SCREEN_HEIGHT - 50;
GLOBAL.planBas = new Vector3D(0, GLOBAL.borderBasY, 0);
GLOBAL.normalPlanBas = new Vector3D(0, -1, 0);
// ctx.moveTo(0, borderBasY); ctx.lineTo(cnvWidth, borderBasY);
GLOBAL.borderGaucheX = 50;
GLOBAL.planGauche = new Vector3D(GLOBAL.borderGaucheX, 0, 0);
GLOBAL.normalPlanGauche = new Vector3D(1, 0, 0);
// ctx.moveTo(borderGaucheX, 0); ctx.lineTo(borderGaucheX, cnvHeight);
GLOBAL.borderDroiteX = SCREEN_HEIGHT - 50;
GLOBAL.planDroite = new Vector3D(GLOBAL.borderDroiteX, 0, 0);
GLOBAL.normalPlanDroite = new Vector3D(-1, 0, 0);
console.log(SCREEN_HEIGHT);
export { SCREEN, SCREEN_WIDTH, SCREEN_HEIGHT, N_PIXELS, GLOBAL };
