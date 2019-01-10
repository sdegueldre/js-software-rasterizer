function parseOBJ(obj){
  let lines = obj.split('\n');
  let strVertices = [];
  let strFaces = [];
  for(let line of lines){
    if(line[0] == 'v')
      strVertices.push(line);
    else if(line[0] == 'f')
      strFaces.push(line);
  }

  let vertices = [[0,0,0]];
  for(let str of strVertices){
    let vertex = str.split(' ');
    vertices.push([parseFloat(vertex[1]), parseFloat(vertex[2]), parseFloat(vertex[3])]);
  }

  let faces = [];
  for(let str of strFaces){
      let face = str.split(' ');
      faces.push([parseInt(face[1]), parseInt(face[2]), parseInt(face[3])]);
  }

  return [vertices, faces];
}
function objToImg(obj){
  let [vertices, faces] = parseOBJ(obj);
  let pixelVertices = [];

  for(let v of vertices)
    pixelVertices.push(v[0], v[1], v[2]);
  pixelVertices = pixelVertices.map((v) => floatToUint8Array(v));

  let tempArr = [];
  for(let pv of pixelVertices)
    tempArr.push(pv[0], pv[1], pv[2], pv[3]);
  pixelVertices = new Uint8Array(tempArr);

  let pixelFaces = [];
  for(let f of faces)
    pixelFaces.push(f[0], f[1], f[2]);
  pixelFaces = pixelFaces.map((f) => int32ToUint8Array(f));

  tempArr = [];
  for(let pf of pixelFaces)
    tempArr.push(pf[0], pf[1], pf[2], pf[3]);
  pixelFaces = new Uint8Array(tempArr);

  let rawData = [...int32ToUint8Array(vertices.length), ...int32ToUint8Array(faces.length), ...pixelVertices, ...pixelFaces];
  console.log(rawData);
  let pixelData = [];
  for(let i = 0; i < rawData.length; i++){
    pixelData.push(rawData[i]);
    if(i%3 == 2)
      pixelData.push(255);
  }
  pixelData.push(255,255,255);

  let cv = document.createElement('canvas');
  let sz = Math.ceil(Math.sqrt(pixelData.length/4));
  cv.width = cv.height = sz;
  let ctx = cv.getContext('2d');
  let imgData = ctx.getImageData(0,0,sz,sz);
  for(let i = 0; i < pixelData.length; i++)
    imgData.data[i] = pixelData[i];
  ctx.putImageData(imgData, 0, 0);
  document.body.appendChild(cv);

  console.log(imgData.data);
  imgData = ctx.getImageData(0,0,sz,sz);
  return imgData.data;
}

function floatToUint8Array(f){
    let buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = f;
    let view = new DataView(buf);
    return [view.getUint8(3), view.getUint8(2), view.getUint8(1), view.getUint8(0)];
}

function int32ToUint8Array(i){
    let buf = new ArrayBuffer(4);
    (new Uint32Array(buf))[0] = i;
    let view = new DataView(buf);
    return [view.getUint8(3), view.getUint8(2), view.getUint8(1), view.getUint8(0)];
}

function uint8ArrayToInt32(arr){
  let buf = new ArrayBuffer(4);
  let uint8Buf = new Uint8Array(buf);
  for(let i = 0; i < 4; i++)
    uint8Buf[i] = arr[i];
  let view = new DataView(buf);
  return view.getUint32(0);
}

function uint8ArrayToFloat32(arr){
  let buf = new ArrayBuffer(4);
  let uint8Buf = new Uint8Array(buf);
  for(let i = 0; i < 4; i++)
    uint8Buf[i] = arr[i];
  let view = new DataView(buf);
  return view.getFloat32(0);
}

function imgToObj(imgID){
  let img = new Image();
  img.src = "teapot obj.png";
  let cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  let ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  let imgData = ctx.getImageData(0, 0, cv.width, cv.height);
  let pixelData = imgData.data;
  let rawData = [];
  for(let i = 0; i < pixelData.length; i++)
    if(i%4 != 3)
      rawData.push(pixelData[i]);

  let nbVertices = uint8ArrayToInt32(rawData.slice(0,4));
  let nbFaces = uint8ArrayToInt32(rawData.slice(4,8));
  let vertexDelimiter = 4*nbVertices*3 + 8;
  let vertexData = rawData.slice(8, vertexDelimiter);
  let faceData = rawData.slice(vertexDelimiter, vertexDelimiter + 4*nbFaces*3);

  let verticesCoordinates = [];
  for(let i = 0; i < vertexData.length; i+=4)
    verticesCoordinates.push(uint8ArrayToFloat32(vertexData.slice(i, i+4)));

  let facesCoordinates = [];
  for(let i = 0; i < faceData.length; i+=4)
    facesCoordinates.push(uint8ArrayToInt32(faceData.slice(i, i+4)));

  let vertices = [];
  for(let i = 0; i < verticesCoordinates.length; i+=3)
    vertices.push([...verticesCoordinates.slice(i, i+3)])

  let faces = [];
  for(let i = 0; i < facesCoordinates.length; i+=3)
    faces.push([...facesCoordinates.slice(i, i+3)])

  return [vertices, faces];
}
function dot(u, v){
  return (u[0]*v[0] + u[1]*v[1] + u[2]*v[2]);
}

function cross(u, v){
  return [u[1]*v[2] - u[2]*v[1],
          u[2]*v[0] - u[0]*v[2],
          u[0]*v[1] - u[1]*v[0]];
}

function normalize(v){
  let n = norm(v)
  return [v[0]/n, v[1]/n, v[2]/n];
}

function norm(v){
  return Math.hypot(v[0], v[1], v[2]);
}

function normal(f){
  return normalize(cross(diff(f[1], f[0]), diff(f[2], f[1])));
}

function diff(u, v){
  return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
}

function avgZ(f){
  return (f[0][2] + f[1][2] + f[2][2])/3;
}

function matrixVectorMultiply(M, v){
  return [dot(M[0], v), dot(M[1], v), dot(M[2], v)];
}

function rotateX(angle){
  return [[1, 0, 0],
          [0, Math.cos(angle), Math.sin(angle)],
          [0, -Math.sin(angle), Math.cos(angle)]];
}

function rotateY(angle){
  return [[Math.cos(angle), 0, Math.sin(angle)],
          [0, 1, 0],
          [-Math.sin(angle), 0, Math.cos(angle)]];
}

function matrixMatrixMultiply(A, B){
  let mat = [];
  for(let i = 0; i < A.length; i++){
    mat[i] = matrixVectorMultiply(A, [B[0][i], B[1][i], B[2][i]]);
  }
  return transpose(mat);
}

function transpose(M){
  let mat = [];
  for(let line of M){
    for(let i = 0; i < line.length; i++){
      if(typeof mat[i] === 'undefined')
        mat[i] = [];
      mat[i].push(line[i]);
    }
  }
  return mat;
}

// 0,0 50,0 0,50
function triangle(x1, y1, x2, y2, x3, y3, col){
  let arr = [{x:x1, y:y1}, {x:x2, y:y2}, {x:x3, y:y3}];
  arr.sort((a,b) => a.y - b.y);

  let [A,B,C] = arr;
  //console.log(A,B,C);

  let [dx1, dx2, dx3] = [0, 0, 0];
  if (B.y-A.y > 0)
    dx1=(B.x-A.x)/(B.y-A.y);
  if (C.y-A.y > 0)
    dx2=(C.x-A.x)/(C.y-A.y);
  if (C.y-B.y > 0)
    dx3=(C.x-B.x)/(C.y-B.y);

  //console.log(dx1,dx2,dx3);
  dx1 = dx1;
  dx2 = dx2;
  dx3 = dx3;

	let S = {x: A.x, y: A.y};
  let E = {x: A.x, y: A.y};

	if(dx1 > dx2) {
    //console.log("dx1 > dx2");
		while(S.y<=B.y){
			horizline(S.x,E.x,S.y,col);
      S.y++;
      E.y++;
      S.x+=dx2;
      E.x+=dx1;
    }
		E = {x:B.x, y:B.y};
		while(S.y<=C.y){
			horizline(S.x,E.x,S.y,col);
      S.y++;
      E.y++;
      S.x+=dx2;
      E.x+=dx3;
    }
	} else {
    //console.log("dx2 >= dx1");
    while(S.y<=B.y){
			horizline(S.x,E.x,S.y,col);
      S.y++;
      E.y++;
      S.x+=dx1;
      E.x+=dx2;
    }
		S = {x:B.x, y:B.y};
		while(S.y<=C.y){
			horizline(S.x,E.x,S.y,col);
      S.y++;
      E.y++;
      S.x+=dx3;
      E.x+=dx2;
    }
	}
}

let horizline;
function initHorizLine(ctx){
  horizline = (sx, ex, y, color) => {
    let imgData = ctx.getImageData(sx, y, ex-sx+1, 1);
    for(let i = 0; i < imgData.data.length; i+=4){
      imgData.data[i] = color[0];
      imgData.data[i+1] = color[1];
      imgData.data[i+2] = color[2];
      imgData.data[i+3] = color[3];
    }
    ctx.putImageData(imgData, sx, y);
  };
}

function max(a, b){
  return a > b ? a : b;
}
window.addEventListener('load', start);
window.addEventListener('keypress', keyPressed);

let vertices, faces;
let cv, ctx;
function start(){
  [vertices, faces] = imgToObj('obj');

  cv = document.getElementById('canvas');
  //window.addEventListener('resize', () => {fitToWindow(cv); displayObj(cv, vertices, faces);});
  fitToWindow(cv);
  rotate(cv, vertices, faces);
}

let turnAngle = 0.1;
let height = -0.4;
let center = [0.05392258408779177, 1.7236646403291944, -0.0002448559670781888];
async function displayObj(cv, vertices, faces){
  cv.width = window.innerWidth;
  ctx = cv.getContext('2d');
  //let drawTriangle = getTriangleDrawer(ctx);
  initHorizLine(ctx);
  let scl = 200;
  ctx.scale(scl, -scl);
  ctx.translate(window.innerWidth/400, window.innerHeight/-400 - center[1]);

  let orderedFaces = [];
  let rotatedVertices = [];
  let rotationMatrix = matrixMatrixMultiply(rotateX(height), rotateY(turnAngle));
  //console.log(rotationMatrix);
  for(let v of vertices)
    rotatedVertices.push(matrixVectorMultiply(rotationMatrix, v));
  for(let f of faces){
    let face = [[rotatedVertices[f[0]][0], rotatedVertices[f[0]][1], rotatedVertices[f[0]][2]],
                [rotatedVertices[f[1]][0], rotatedVertices[f[1]][1], rotatedVertices[f[1]][2]],
                [rotatedVertices[f[2]][0], rotatedVertices[f[2]][1], rotatedVertices[f[2]][2]]];
    orderedFaces.push(face);
  }
  orderedFaces.sort((a,b) => avgZ(a) - avgZ(b));
  let i = 0;
  for(let face of orderedFaces){
    let n = normal(face);
    let color = Math.floor((dot(n, [-0.577,0.577,0.577]) + 1) * 255/2);
    /*ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
    drawTriangle(face[0][0], face[0][1], face[1][0], face[1][1], face[2][0], face[2][1]);*/
    triangle( scl*(face[0][0]+window.innerWidth/400), -scl*(face[0][1]+window.innerHeight/-400 - center[1]),
              scl*(face[1][0]+window.innerWidth/400), -scl*(face[1][1]+window.innerHeight/-400 - center[1]),
              scl*(face[2][0]+window.innerWidth/400), -scl*(face[2][1]+window.innerHeight/-400 - center[1]),
              [color, color, color, 255]);
    i++;
    if(i%10 == 0)
      await new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve('foo');
          }, 16);
        });
  }
}

function fitToWindow(cv){
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
}

getTriangleDrawer = (ctx) => ((x1, y1, x2, y2, x3, y3) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
})


function rotate(cv, vertices, faces){
  turnAngle += 0.01;
  displayObj(cv, vertices, faces);
  //window.requestAnimationFrame(() => rotate(cv, vertices, faces));
}

function keyPressed(e){
  switch (e.key) {
    case 'ArrowUp':
      height += 0.1;
      break;
    case 'ArrowDown':
      height -= 0.1;
      break;
    default:

  }
}
