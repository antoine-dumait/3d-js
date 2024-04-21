import { BlockType } from "./world.js";
import { GLOBAL} from "./setup.js";

//TODO: add interface for GLOBAL ??

export class UI{
    FPS_counter: HTMLElement;
    triangle_counter: HTMLElement;
    paint_call_counter: HTMLElement;
    XYZ_shower: HTMLElement;
    deltaArray: number[];

    static maxDeltaVal = 20;

    constructor(FPS_counter: HTMLElement, triangle_counter: HTMLElement, paint_call_counter: HTMLElement, XYZ_shower: HTMLElement){
        this.FPS_counter = FPS_counter;
        this.triangle_counter = triangle_counter;
        this.deltaArray = [];
        this.paint_call_counter = paint_call_counter;
        this.XYZ_shower = XYZ_shower;
    }

    updateFPSCounter(deltaTime: number){
        const calculateFPS = () => {
            const delta = this.deltaArray.reduce((a,b) => a+b) / this.deltaArray.length;
            return Math.round(1000 / delta);
        }
        const addDelta = (delta: number) => {
            if(this.deltaArray.length >= UI.maxDeltaVal){
                this.deltaArray.shift();
            }
            this.deltaArray.push(delta);
        }
        addDelta(deltaTime);
        this.FPS_counter.textContent = "FPS: " + calculateFPS() as unknown as string;
    }

    updateTriangleCount(){
        this.triangle_counter.textContent = "Triangle drawn: " + GLOBAL.triangleCount;
        GLOBAL.triangleCount = 0;
    }

    updatePaintCallCount(){
        this.paint_call_counter.textContent = "Paint call: " + GLOBAL.paintCallCount;
        GLOBAL.paintCallCount = 0;
    }

    updateXYZShower(){
        this.XYZ_shower.textContent = "XYZ : " + 
            Math.floor(GLOBAL.CAMERA.pos.x) + "/" + 
            Math.floor(GLOBAL.CAMERA.pos.y) + "/" +
            Math.floor(GLOBAL.CAMERA.pos.z);
    }

}