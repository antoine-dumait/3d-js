class Controller{
    constructor(){
        this.keys = 
        {
            "ArrowUp" : false,
            "ArrowLeft" : false,
            "ArrowDown" : false,
            "ArrowRight" : false,

            "o" : false,
            "k" : false,
            "l" : false,
            "m" : false,

            "z" : false,
            "q" : false,
            "s" : false,
            "d" : false,
        }
    }

    initialize(){
        document.body.addEventListener('keydown', (e) => //fonction anonyme to keep this as controller instance
            this.updateKeys(e.key, true));
        document.body.addEventListener('keyup', (e) =>
            this.updateKeys(e.key, false));
    }

    updateKeys(code,val) {
        if(Object.keys(this.keys).includes(code)){
            this.keys[code] = val;
        }
    }
}

export {Controller};