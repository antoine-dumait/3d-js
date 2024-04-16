import { GLOBAL } from "./setup";
import { BlockType } from "./world";

export async function getTextFromPath(path: string): Promise<string>{  
    let text!: string;
    await fetch(path)
    .then(res => res.text())
    .then(fileText => {
        text = fileText;        
    });
    
    return text;
}

export function nameToRgba(name: string): Uint8ClampedArray {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    if(ctx){
        ctx.fillStyle = name;
        ctx.fillRect(0,0,1,1);
        return ctx.getImageData(0,0,1,1).data;
    }
    throw console.error("error creating 2D Context");
}

export function changeSelectedBlock(index: number){
    let currentSlotBarHTML = document.getElementById(GLOBAL.currentBlock.name)!; 
    currentSlotBarHTML.classList.remove("choosen_block");
    GLOBAL.currentIndexHotbar = Math.max(0, Math.min(BlockType.blockTypes.length-1, index)); //y is down, down is left
    GLOBAL.currentBlock = BlockType.blockTypes[GLOBAL.currentIndexHotbar];
    currentSlotBarHTML = document.getElementById(GLOBAL.currentBlock.name)!;
    currentSlotBarHTML.classList.add("choosen_block");
    console.log(GLOBAL.currentBlock);
}

export function copy(aObject: any) {
    // Prevent undefined objects
    // if (!aObject) return aObject;
  
    let bObject: any = Array.isArray(aObject) ? [] : {};
  
    let value;
    for (const key in aObject) {
  
      // Prevent self-references to parent object
      // if (Object.is(aObject[key], aObject)) continue;
      
      value = aObject[key];
  
      bObject[key] = (typeof value === "object") ? copy(value) : value;
    }
  
    return bObject;
  }