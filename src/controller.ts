export default class Controller{
    keys: {};

    constructor(){
        this.keys = 
        {
            "ArrowUp" : false,
            "ArrowLeft" : false,
            "ArrowDown" : false,
            "ArrowRight" : false,

            // "o" : false,
            // "k" : false,
            // "l" : false,
            // "m" : false,

            "z" : false,
            "q" : false,
            "s" : false,
            "d" : false,

            "a" : false,
            "e" : false,

            "Control" : false,
            " " : false,
            "Shift": false,

            "p" : false,

            "w" : false,
            "f" : false,
            "t" : false,
        }
    }

    initialize(){
        document.body.addEventListener('keydown', (e) => {         //fonction anonyme to keep this as controller instance
            this.updateKeys(e.key, true)
            e.preventDefault();
        });
        document.body.addEventListener('keyup', (e) => {
            this.updateKeys(e.key, false)
            e.preventDefault();
        });
    }

    updateKeys(code: string, val: boolean) {
        if(Object.keys(this.keys).includes(code)){
            (this.keys as any)[code] = val; //TODO: same as in world.loadblocktype, fix any
        }
    }
    
    isDown(key: string){
        return (this.keys as any)[key];
    }
}