export default class Texture{ //todo optimize texture loading by awaiting all texture rather than on by one
    name: string;
    path: string;
    dataArray: Uint8ClampedArray;
    width: number;
    height: number;
    
    constructor(name: string, path: string, dataArray: Uint8ClampedArray, width: number, height: number){ //loadTextureType
        this.name = name;
        this.path = path;
        this.dataArray = dataArray;
        this.width = width;
        this.height = height;
    }

    static async loadTexture(path: string){
        let tmpCNV: HTMLCanvasElement = document.createElement('canvas');
        let tmpCTX: any = tmpCNV.getContext('2d', {alhpa: false}); //TODO: fix any to RenderingContext
        if(tmpCTX){
            let textureWidth!: number, textureHeight!: number; //suspect

            let img = new Image();
            img.src = path;
            await img.decode();
            textureWidth = img.naturalWidth;
            textureHeight = img.naturalHeight;
            
            // let test = new Promise((resolve, reject) => {
            //     img.onload = () => resolve(img.height);
            //     img.onerror = reject;
            //     // console.log(path);   
            // });
            // await test;
            // console.log(test);
            tmpCNV.width! = textureWidth;
            tmpCNV.height = textureHeight;
            tmpCTX.drawImage(img, 0, 0);
            let data = tmpCTX.getImageData(0, 0, textureWidth, textureHeight).data;
            // console.log(data);
            
            return new Texture (path, path, data, textureWidth, textureHeight);
        } else {
            throw console.error("error ctx not found");
        }
    }

}