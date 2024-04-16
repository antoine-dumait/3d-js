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
            await new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = path;
            }).then( 
                image => {
                    textureWidth = (image as HTMLImageElement).naturalWidth;
                    textureHeight = (image as HTMLImageElement).naturalHeight;
                },
                error => {throw error}
            );

            tmpCNV.width! = textureWidth;
            tmpCNV.height = textureHeight;
            tmpCTX.drawImage(img, 0, 0);
            let data = tmpCTX.getImageData(0, 0, textureWidth, textureHeight).data;
            return new Texture (path, path, data, textureWidth, textureHeight);
        } else {
            throw console.error("erreor ctx not found");
        }
    }
}