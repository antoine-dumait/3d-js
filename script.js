//              one triangle
// let vert = [-1,-1,-1, -1,1,-1, 1,-1,-1 ]
// let tri = [0,1,2 ]

//              pyramide
let vert = [-1,-1,-1, -1,3,-1, 3,3,-1, 3,-1,-1, 1,1,3, 1,1,-5];
let tri = [0,1,2, 0,2,3, 0,1,4, 1,2,4, 2,3,4, 3,0,4, 0,1,5, 1,2,5, 2,3,5, 3,0,5,];
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
    updateKeys(e.key, true);});
document.body.addEventListener('keyup', function(e) {
    updateKeys(e.key, false);});

let left = false, up = false, right = false, down = false, counterClock = false, clock = false;


cnvWidth = 1000;
cnvHeight = 1000;
cnv.width = cnvWidth;
cnv.height = cnvHeight;
m=addRotationMatrices(spinY, spinX);
console.log(m);
console.log(ans);
update();

function updateKeys(code,val) {
    switch (code) {
        // case "ArrowLeft":
        // left=val;
        // break; //Left key
        // case "ArrowUp":
        // up=val;
        // break; //Up key
        // case "ArrowRight":
        // right=val;
        // break; //Right key
        // case "ArrowDown":
        // down=val;
        // break; //Down key
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
    if(left)angleY-=a;
    if(right)angleY+=a;
    if(down)angleX-=a;
    if(up)angleX+=a;
    if(counterClock)angleZ+=a;
    if(clock)angleZ-=a;
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
    draw(vert, tri);
    drawAxes();
    window.requestAnimationFrame(update)
}

function draw(vert, tri){;
    for(i=0; i < tri.length; i+=3){
        let p0 = tri[i]*3, p1 = tri[i+1]*3, p2 = tri[i+2]*3;
        let a = vertexShader(vert[p0], vert[p0+1], vert[p0+2], m);
        let b = vertexShader(vert[p1], vert[p1+1], vert[p1+2], m);  
        let c = vertexShader(vert[p2], vert[p2+1], vert[p2+2], m);
        ctx.fillStyle = colorArray[(i/3)%(tri.length/3)]  
        drawTri(a,b,c);
    }
}

function vertexShader(x,y,z, m){
    let x0 = x*m[0] + y*m[1] + z*m[2];
    let y0 = x*m[3] + y*m[4] + z*m[5];
    let z0 = x*m[6] + y*m[7] + z*m[8] + dist;
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