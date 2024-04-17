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
        let tmpCTX = tmpCNV.getContext('2d', { alhpa: false }); //TODO: fix any to RenderingContext
        if (tmpCTX) {
            let textureWidth, textureHeight; //suspect
            let img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = path;
            }).then(image => {
                textureWidth = image.naturalWidth;
                textureHeight = image.naturalHeight;
            }, error => { throw error; });
            tmpCNV.width = textureWidth;
            tmpCNV.height = textureHeight;
            tmpCTX.drawImage(img, 0, 0);
            let data = tmpCTX.getImageData(0, 0, textureWidth, textureHeight).data;
            return new Texture(path, path, data, textureWidth, textureHeight);
        }
        else {
            throw console.error("erreor ctx not found");
        }
    }
}
