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

    updateKeys(code,val) {
        if(Object.keys(this.keys).includes(code)){
            this.keys[code] = val;
        }
    }
}

// document.getElementById("file_browse").addEventListener("change", dropHandler.bind(mesh));

function dropHandler(ev) {
    let mesh = this;
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
            changeObject(response, mesh);
          });
        });
    }
}

function changeObject(response, mesh){
    let verts = [];
    let tris = [];
    let lines = response.split("\n");
    let i = 0;
    lines.forEach( (line) =>{
        let typeLength = line.indexOf(" ");
        let type = line.slice(0, typeLength);
        let data = line.slice(typeLength+1); //account for the space after denominator
        if (type == "v") {
            let values = data.split(" ");
            values = values.map((x)=> parseFloat(x));
            verts.push(new Vector3D(...values));
        }else if (type == "f") {
            let p = data.split(" ");
            p = p.map((x)=> parseInt(x));
            let tri = new Triangle([verts[p[0]-1], verts[p[1]-1], verts[p[2]-1]]); // .obj triangles index start at 1, us starts at 0
            tri.id = i;
            i++;
            tris.push(tri); //obj indexed start at 1, us starts at 0
        }
    })
    mesh.changeVertices(verts);
    mesh.changeTriangles(tris);
    colors = getColors(mesh.tris.length);
}

export {Controller};