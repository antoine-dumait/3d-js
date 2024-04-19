export default class Texture {
    name;
    path;
    dataArray;
    width;
    height;
    constructor(name, path, dataArray, width, height) {
        this.name = name;
        this.path = path;
        this.dataArray = dataArray;
        this.width = width;
        this.height = height;
    }
    static async loadTexture(path) {
        let tmpCNV = document.createElement('canvas');
        let tmpCTX = tmpCNV.getContext('2d', { alpha: false }); //TODO: fix any to RenderingContext
        if (tmpCTX) {
            let textureWidth, textureHeight; //suspect
            let img = new Image();
            img.src = path;
            await img.decode();
            textureWidth = img.naturalWidth;
            textureHeight = img.naturalHeight;
            tmpCNV.width = textureWidth;
            tmpCNV.height = textureHeight;
            tmpCTX.drawImage(img, 0, 0);
            let data = tmpCTX.getImageData(0, 0, textureWidth, textureHeight).data;
            return new Texture(path, path, data, textureWidth, textureHeight); //TODO: change name to side name
        }
        else {
            throw console.error("error ctx not found");
        }
    }
}
