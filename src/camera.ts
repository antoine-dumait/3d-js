import Vector3D from "./vec3";
import Controller from "./controller";
import Matrix4x4 from "./matrix4";
export default class Camera{
    pos: Vector3D; 
    lookDirection: Vector3D;  //init looking at Z !
    movementSpeed: number; 
    rotationSpeed: number; 
    yaw: number;  //Y angle
    pitch: number;  //X angle
    locked: boolean;  //is mouse locked in
    runMultiplicator: number;

    constructor(movementSpeed: number = 0.01, rotationSpeed: number = 0.01){
        this.pos = new Vector3D(0, 0, 0);
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed
        this.yaw = 0; 
        this.pitch = 0;
        this.lookDirection = new Vector3D(0, 0, 1); 
        this.locked = false; 
        this.runMultiplicator = 5;
    }

    updateAngles(x: number, y: number){
        let sensi = 500;
        this.yaw += x/sensi;
        this.pitch -= y/sensi;
    }

    updateKeys(c: Controller){
        let changePosition = (value: number, sign: number) => {
            return (value + (this.movementSpeed*sign) % (2*Math.PI));
        }

        if(c.isDown("o")){
            this.pos.y = changePosition(this.pos.y, +1);
        }
        if(c.isDown("l")){
            this.pos.y = changePosition(this.pos.y, -1);
        }
        if(c.isDown("k")){
            this.pos.x = changePosition(this.pos.x, -1);
        }
        if(c.isDown("m")){
            this.pos.x = changePosition(this.pos.x, +1);
        }
        let forward = Vector3D.multiply(this.lookDirection, this.movementSpeed);
        if(c.isDown("Shift")){
            forward = Vector3D.multiply(forward, this.runMultiplicator); 
        }
        let right = Matrix4x4.multiplyVector(Matrix4x4.rotationY(Math.PI/2), forward);
        if(c.isDown("q")){
            this.pos = Vector3D.sub(this.pos, right);
        }
        if(c.isDown("d")){
            this.pos = Vector3D.add(this.pos, right);
        }
        if(c.isDown("z")){
            this.pos = Vector3D.add(this.pos, forward);
        }
        if(c.isDown("s")){
            let forwardWithoutY = forward;
            forwardWithoutY.y = 0;
            this.pos = Vector3D.sub(this.pos, forwardWithoutY);
        }
        if(c.isDown("Control")){
            this.pos.y = changePosition(this.pos.y, +1); //TODO: fix y sign, should be -1
        }
        if(c.isDown(" ")){
          this.pos.y = changePosition(this.pos.y, -1);
        }
        
    }
}