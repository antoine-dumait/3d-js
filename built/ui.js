//TODO: add interface for GLOBAL ??
export class UI {
    FPS_counter;
    triangle_counter;
    deltaArray;
    static maxDeltaVal = 20;
    constructor(FPS_counter, triangle_counter) {
        this.FPS_counter = FPS_counter;
        this.triangle_counter = triangle_counter;
        this.deltaArray = [];
    }
    updateFPSCounter(deltaTime) {
        const calculateFPS = () => {
            const delta = this.deltaArray.reduce((a, b) => a + b) / this.deltaArray.length;
            return Math.round(1000 / delta);
        };
        const addDelta = (delta) => {
            if (this.deltaArray.length >= UI.maxDeltaVal) {
                this.deltaArray.shift();
            }
            this.deltaArray.push(delta);
        };
        addDelta(deltaTime);
        this.FPS_counter.textContent = calculateFPS();
    }
}
