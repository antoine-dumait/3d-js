//              one triangle
// let vert = [-1,-1,-1, -1,1,-1, 1,-1,-1 ]
// let tri = [0,1,2 ]

//              pyramide
let vert = [-1,-1,-1, -1,3,-1, 3,3,-1, 3,-1,-1, 1,1,3, 1,1,-5];
let tri = [0,1,4, 1,2,4, 2,3,4, 3,0,4, 0,1,5, 1,2,5, 2,3,5, 3,0,5,]; // 0,1,2, 0,2,3,
let angleX = 0;
let angleY = 0;
let angleZ = 0;
let cX = Math.cos(angleX), sX = Math.sin(angleX);
let cY = Math.cos(angleY), sY = Math.sin(angleY);
let cZ = Math.cos(angleZ), sZ = Math.sin(angleZ);
dist = 10;
let spinX = [1,0,0, 0,cX,-sX, 0,sX,cX];
let spinY = [cY,0,sY, 0,1,0, -sY,0,cY];
let spinZ = [cZ,-sZ,0, sZ,cZ,0, 0,0,1];
let ans = [cY,sY*sX,-sY*cX, 0,cX,sX, sY,-cY*sX,cY*cX]
// [ 1, 0, -0, 0, 1, 0, 0, -0, 1 ]
let none = [1,0,0,0, 0,1,0,0, 0,0,1,dist];     
// ┌                    ┐
// │ cy  sy*sx -sy*cx 0 │
// │ 0  cx      sx    0 │
// │ sy -cy*sx  cy*cx 0 │
// │ 0   0      0     1 │
// └                    ┘
let pX = 0, pY = 0, pZ = 10;

var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

let m = spinY;
let limit = 10000;
let cnv = document.getElementById("canvas");
let ctx = cnv.getContext("2d");

document.body.addEventListener('keydown', function(e) {
    updateKeys(e.key, true);
    pauseActivate(e.key)});
document.body.addEventListener('keyup', function(e) {
    updateKeys(e.key, false);});
document.getElementById("file_drop").addEventListener("change", dropHandler);
document.body.addEventListener("drag", dropHandler);



function dropHandler(ev) {
    console.log("File(s) dropped");
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.stopPropagation();
  console.log(ev.target.files);
    if (ev.target.files) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.target.files].forEach((item, i) => {
        // If dropped items aren't files, reject them
          const file = item;
          console.log(`… file[${i}].name = ${file.name}`);
          let promise = file.text();
          promise.then((response)=>{
            changeObject(response);
          });
        });
    }
}

function changeObject(response){
    //vertices
    let regex = new RegExp("v (-?\\d*\\.\\d*) (-?\\d*\\.\\d*) (-?\\d*\\.\\d*)", "g");
    let data = response.matchAll(regex)
    vert = [];
    for (const trio of data){
        console.log(trio);
        vert.push(...trio.slice(1).map(x=>parseFloat(x)));
    }
    console.log(vert);

    //triangles
    regex = new RegExp("f (\\d*)/\\d*/\\d* (\\d*)/\\d*/\\d* (\\d*)/\\d*/\\d*", "g");
    data = response.matchAll(regex);
    tri = [];
    for (const trio of data){
        console.log(trio);
        tri.push(...trio.slice(1).map(x=>parseFloat(x)-1));
    }
    console.log(tri);
}

// "# Blender 3.6.5\n# www.blender.org\nmtllib untitled.mtl\no Cube\nv 1.000000 1.000000 -1.000000\nv 1.000000 -1.000000 -1.000000\nv 1.000000 1.000000 1.000000\nv 1.000000 -1.000000 1.000000\nv -1.000000 1.000000 -1.000000\nv -1.000000 -1.000000 -1.000000\nv -1.000000 1.000000 1.000000\nv -1.000000 -1.000000 1.000000\nvn -0.0000 1.0000 -0.0000\nvn -0.0000 -0.0000 1.0000\nvn -1.0000 -0.0000 -0.0000\nvn -0.0000 -1.0000 -0.0000\nvn 1.0000 -0.0000 -0.0000\nvn -0.0000 -0.0000 -1.0000\nvt 0.625000 0.500000\nvt 0.875000 0.500000\nvt 0.875000 0.750000\nvt 0.625000 0.750000\nvt 0.375000 0.750000\nvt 0.625000 1.000000\nvt 0.375000 1.000000\nvt 0.375000 0.000000\nvt 0.625000 0.000000\nvt 0.625000 0.250000\nvt 0.375000 0.250000\nvt 0.125000 0.500000\nvt 0.375000 0.500000\nvt 0.125000 0.750000\ns 0\nusemtl Material\nf 1/1/1 5/2/1 7/3/1 3/4/1\nf 4/5/2 3/4/2 7/6/2 8/7/2\nf 8/8/3 7/9/3 5/10/3 6/11/3\nf 6/12/4 2/13/4 4/5/4 8/14/4\nf 2/13/5 1/1/5 3/4/5 4/5/5\nf 6/11/6 5/10/6 1/1/6 2/13/6\n"


let left = false, up = false, right = false, down = false;
let counterClock = false, clock = false;
let aLeft = false, aUp = false, aRight = false, aDown = false;


let pause = false;

function pauseActivate(key){
    if(key=="p") pause=!pause;
}

cnvWidth = 1000;
cnvHeight = 1000;
cnv.width = cnvWidth;
cnv.height = cnvHeight;
m=addRotationMatrices(spinY, spinX);
console.log(m);
console.log(ans);

let zBuffer = [];
let triCalc = [];

update();

function updateKeys(code,val) {
    switch (code) {
        case "ArrowLeft":
            aLeft=val;
            break; //Left key
        case "ArrowUp":
            aUp=val;
            break; //Up key
        case "ArrowRight":
            aRight=val;
            break; //Right key
        case "ArrowDown":
            aDown=val;
            break; //Down key
        case "1":
            left=val;
            break; //Left key
        case "5":
            up=val;
            break; //Up key
        case "3":
            right=val;
            break; //Right key
        case "2":
            down=val;
            break; //Down key
        case "4":
            counterClock=val;
            break; //Down key
        case "6":
            clock=val;
            break; //Down key
    }
}

function updateAngle(){
    a = 0.04;
    mov = 0.05;
    if(left)angleY-=a;
    if(right)angleY+=a;
    if(down)angleX-=a;
    if(up)angleX+=a;
    if(counterClock)angleZ+=a;
    if(clock)angleZ-=a;
    if(aLeft)pX-=mov;
    if(aRight)pX+=mov;
    if(aDown) pZ+=mov;
    if(aUp) pZ-=mov;
}

function addRotationMatrices(A, B){
    // let spinX =  [1,0,0, 
                 //  0,1,-0, 
                 //  0,0,1];
    // let spinY =  [1,0,0, 
                  // 0,1,0, 
                //  -0,0,1];
    // [ 1, 1, 1, 1, 1, 1, 2, 2, 2 ]
    // [ 1, 0, -0, 0, 1, 0, 0, -0, 1]
    let sizeM = 3;
    let M = [];
    for (h=0; h<sizeM; h++){
        for (i=0; i<sizeM; i++){
            let v = 0
            for (j=0; j<sizeM; j++){ 
                v += A[j+i*sizeM]*B[h+j*sizeM];
            }
            M.push(v)
        }
    }
    
    // console.log(M);
    return M;
}

function update(timeStamp=0){
    if (pause)return;
    updateAngle()
    // angleY = timeStamp/1000;
    cY = Math.cos(angleY), sY = Math.sin(angleY);
    cX = Math.cos(angleX), sX = Math.sin(angleX);
    cZ = Math.cos(angleZ), sZ = Math.sin(angleZ);

    spinY = [cY,0,-sY, 0,1,0, sY,0,cY];
    spinX = [1,0,0, 0,cX,sX, 0,-sX,cX];
    spinZ = [cZ,-sZ,0, sZ,cZ,0, 0,0,1];

    ans = [cY,sY*sX,-sY*cX, 0,cX,sX, sY,-cY*sX,cY*cX]
    m=addRotationMatrices(spinX, spinY);
    m= addRotationMatrices(spinZ, m);
    // m=ans;
    ctx.fillStyle = "white";
    ctx.clearRect(0,0, cnvWidth, cnvHeight);
    ctx.fillRect(0,0, cnvWidth, cnvHeight);
    zBufferUpdate(vert,tri);
    draw();
    // console.log(triCalc);
    // console.log(zBuffer);
    // draw(vert, tri);
    drawAxes();
    window.requestAnimationFrame(update);
}

// function zBufferSort(){
//     for (let index = 0; index < zBuffer.length; index++) {
//         const e = zBuffer[index];
//         const z = e[3];
//         while
//     }
// }

function zBufferUpdate(vert, tri){
    zBuffer = [];
    triCalc = [];
    for(i=0; i < tri.length; i+=3){
        let p0 = tri[i]*3, p1 = tri[i+1]*3, p2 = tri[i+2]*3;
        let a = vertexShader(vert[p0], vert[p0+1], vert[p0+2], m);
        let b = vertexShader(vert[p1], vert[p1+1], vert[p1+2], m);  
        let c = vertexShader(vert[p2], vert[p2+1], vert[p2+2], m);
        let z = Math.min(a[2], b[2], c[2]);
        let zMoy = [a[2],b[2],c[2]].reduce((x,y)=>x+y)/3;
        // console.log(zMoy);
        // console.log(a,b,c);
        triCalc.push([a,b,c])
        zBuffer.push([i/3,z, zMoy])
    }
    zBuffer.sort((a,b) => {
        let diff = b[1] - a[1];
        if (diff!=0) return b[1] - a[1]
        return  b[2] - a[2];});
    // console.log(zBuffer);
}

// function draw(vert, tri){;
//     for(i=0; i < tri.length; i+=3){
//         let p0 = tri[i]*3, p1 = tri[i+1]*3, p2 = tri[i+2]*3;
//         let a = vertexShader(vert[p0], vert[p0+1], vert[p0+2], m);
//         let b = vertexShader(vert[p1], vert[p1+1], vert[p1+2], m);  
//         let c = vertexShader(vert[p2], vert[p2+1], vert[p2+2], m);
//         ctx.fillStyle = colorArray[(i/3)%(tri.length/3)]  ;
//         drawTri(a,b,c);
//     }
// }

function draw(){
    for(i=0; i < zBuffer.length; i++){
        let index = zBuffer[i][0];
        let a = triCalc[index][0], b = triCalc[index][1], c = triCalc[index][2];
        ctx.fillStyle = colorArray[index%colorArray.length];
        // console.log(a,b,c);
        drawTri(a,b,c);
    }
}

function vertexShader(x,y,z, m){
    let x0 = x*m[0] + y*m[1] + z*m[2] + pX;
    let y0 = x*m[3] + y*m[4] + z*m[5] + pY;
    let z0 = x*m[6] + y*m[7] + z*m[8] + pZ;
    return [x0, y0, z0];
}

function drawTri(a, b, c){
    let xOff = cnvWidth/2; //x offset
    let yOff = cnvHeight/2;
    let size = 1000;
    let x0= xOff + size*a[0]/a[2], y0= yOff + size*a[1]/a[2];
    let x1= xOff + size*b[0]/b[2], y1= yOff + size*b[1]/b[2];
    let x2= xOff + size*c[0]/c[2], y2= yOff + size*c[1]/c[2];
    ctx.strokeStyle = "black";
    // ctx.fillStyle = colorArray[];
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x0, y0);
    ctx.fill();
    // ctx.stroke()
    // console.log(a,b,c);
}

function drawAxes(){
    xOri = 100;
    yOri = cnvHeight - 100;
    zOri = 0;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(xOri, yOri); ctx.lineTo(limit, yOri);
    ctx.stroke();
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(xOri, yOri); ctx.lineTo(xOri, -limit);
    ctx.stroke();
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(xOri, yOri); ctx.lineTo(xOri, -limit);
    ctx.stroke();

}