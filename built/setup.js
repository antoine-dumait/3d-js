import MyScreen from "./screen.js";
import Camera from "./camera.js";
import Controller from "./controller.js";
import Matrix4x4 from "./matrix4.js";
import { changeSelectedBlock, takeScreenshot, changeRenderMode, changeRenderDistance } from "./utils.js";
import Vector3D from "./vec3.js";
import { Block, BlockType, World } from "./world.js";
import { UI } from "./ui.js";
import { placeHolderBlock, removeBlock } from "./utils3D.js";
// const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
const SCREEN_WIDTH = 1280, SCREEN_HEIGHT = 720;
const N_PIXELS = SCREEN_WIDTH * SCREEN_HEIGHT;
const SCREEN = new MyScreen(SCREEN_WIDTH, SCREEN_HEIGHT);
const GLOBAL = {};
GLOBAL.FPS = 0;
GLOBAL.near = 0.1;
GLOBAL.far = 100.0;
GLOBAL.FOVdegrees = 60.0;
GLOBAL.aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
GLOBAL.matrixProjection = Matrix4x4.makeProjection(GLOBAL.FOVdegrees, GLOBAL.aspectRatio, GLOBAL.near, GLOBAL.far);
GLOBAL.deltaTime = 0; //en millisecondes
GLOBAL.UP = new Vector3D(0, 1, 0);
await BlockType.initBlocks();
console.log(BlockType.blockTypes);
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// await sleep(1000);
const hotbar = document.getElementById("hotbar");
let firstSlot = true;
BlockType.blockTypes.forEach(blockType => {
    let slot = document.createElement("div");
    slot.id = blockType.name;
    slot.classList.add("hotbar_slot");
    slot.style.backgroundImage = "url('" + blockType.textures.sides.path + "')";
    if (firstSlot) {
        slot.classList.add("choosen_block");
        firstSlot = false;
    }
    hotbar.appendChild(slot);
});
// console.log("Block Types:");
// console.log(BlockType.blockTypes);
// console.log(BlockType.blockTypesName[0]);
// console.log(BlockType.count);
GLOBAL.WORLD_SIZE = 100;
GLOBAL.WORLD_ORIGIN = new Vector3D(Math.floor(GLOBAL.WORLD_SIZE / 2), Math.floor(GLOBAL.WORLD_SIZE / 2), Math.floor(GLOBAL.WORLD_SIZE / 2));
GLOBAL.WORLD = new World(GLOBAL.WORLD_SIZE, GLOBAL.WORLD_ORIGIN);
const blockToGenerate = [BlockType.blockTypesDict.dirt,
    BlockType.blockTypesDict.grass,
    BlockType.blockTypesDict.grass,
    BlockType.blockTypesDict.grass];
GLOBAL.WORLD.generateBlocks(40, blockToGenerate, 1); //TODO: fix 50 crashing du to Triangle.isVisble not testing value
console.log("Blocks:", GLOBAL.WORLD.blocks);
GLOBAL.movementSpeed = 0.01;
GLOBAL.deltaMovementSpeed = GLOBAL.movementSpeed * GLOBAL.deltaTime;
GLOBAL.rotationSpeed = 0.03;
GLOBAL.CAMERA = new Camera(GLOBAL.deltaMovementSpeed, GLOBAL.rotationSpeed, new Vector3D(GLOBAL.WORLD_SIZE / 2, GLOBAL.WORLD_SIZE / 2 - 2, GLOBAL.WORLD_SIZE / 2));
GLOBAL.renderDistance = 20;
GLOBAL.CONTROLLER = new Controller();
GLOBAL.CONTROLLER.initialize();
const FPS_counter = document.getElementById("fps");
const triangle_counter = document.getElementById("triangle_count");
const paint_call_counter = document.getElementById("paint_call_count");
const XYZ_shower = document.getElementById("xyz");
GLOBAL.paintCallCount = 0;
GLOBAL.triangleCount = 0;
GLOBAL.currentIndexHotbar = 0;
GLOBAL.currentBlock = BlockType.blockTypes[GLOBAL.currentIndexHotbar];
GLOBAL.holderBlock = new Block(new Vector3D(0, 0, 0), GLOBAL.currentBlock);
GLOBAL.hitDir = null;
GLOBAL.UI = new UI(FPS_counter, triangle_counter, paint_call_counter, XYZ_shower);
GLOBAL.renderList = [SCREEN.drawTexturedTriangle.bind(SCREEN), SCREEN.drawWireframeTriangle.bind(SCREEN)];
GLOBAL.currentRenderIndex = 0;
GLOBAL.currentRender = GLOBAL.renderList[GLOBAL.currentRenderIndex];
document.addEventListener("pointerlockchange", () => {
    GLOBAL.CAMERA.locked = Boolean(document.pointerLockElement);
});
document.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > 5) {
        changeSelectedBlock(Math.sign(e.deltaY));
    }
});
document.body.addEventListener('mousemove', (e) => {
    if (GLOBAL.CAMERA.locked) {
        GLOBAL.CAMERA.updateAngles(e.movementX, e.movementY);
    }
});
document.addEventListener('mousedown', (e) => {
    if (e.button == 2) {
        removeBlock();
    }
    else if (e.button == 0) {
        placeHolderBlock();
        document.body.requestPointerLock();
    }
});
document.body.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "o":
            takeScreenshot();
            break;
        case "r":
            changeRenderMode();
            break;
        case "p":
            changeRenderDistance(1);
            break;
        case "m":
            changeRenderDistance(-1);
            break;
    }
});
GLOBAL.borderHautY = 0;
GLOBAL.planHaut = new Vector3D(0, GLOBAL.borderHautY, 0);
GLOBAL.normalPlanHaut = new Vector3D(0, 1, 0);
GLOBAL.borderBasY = SCREEN_HEIGHT - 0;
GLOBAL.planBas = new Vector3D(0, GLOBAL.borderBasY, 0);
GLOBAL.normalPlanBas = new Vector3D(0, -1, 0);
GLOBAL.borderGaucheX = 0;
GLOBAL.planGauche = new Vector3D(GLOBAL.borderGaucheX, 0, 0);
GLOBAL.normalPlanGauche = new Vector3D(1, 0, 0);
GLOBAL.borderDroiteX = SCREEN_WIDTH - 0;
GLOBAL.planDroite = new Vector3D(GLOBAL.borderDroiteX, 0, 0);
GLOBAL.normalPlanDroite = new Vector3D(-1, 0, 0);
console.log(SCREEN_HEIGHT);
export { SCREEN, SCREEN_WIDTH, SCREEN_HEIGHT, N_PIXELS, GLOBAL };
