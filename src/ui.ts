import { BlockType } from "./world.js";
import { GLOBAL} from "./setup.js";

//TODO: add interface for GLOBAL ??

export class UI{
    FPS_counter: HTMLElement;
    triangle_counter: HTMLElement;
    paint_call_counter: HTMLElement;
    deltaArray: number[];

    static maxDeltaVal = 20;

    constructor(FPS_counter: HTMLElement, triangle_counter: HTMLElement, paint_call_counter: HTMLElement){
        this.FPS_counter = FPS_counter;
        this.triangle_counter = triangle_counter;
        this.deltaArray = [];
        this.paint_call_counter = paint_call_counter;
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

}