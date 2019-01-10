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
  let then = new Date();
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
    //let color = Math.floor((dot(n, [-0.577,0.577,0.577]) + 1) * 255/2);
    /*ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
    drawTriangle(face[0][0], face[0][1], face[1][0], face[1][1], face[2][0], face[2][1]);*/
    triangle( scl*(face[0][0]+window.innerWidth/400), -scl*(face[0][1]+window.innerHeight/-400 - center[1]),
              scl*(face[1][0]+window.innerWidth/400), -scl*(face[1][1]+window.innerHeight/-400 - center[1]),
              scl*(face[2][0]+window.innerWidth/400), -scl*(face[2][1]+window.innerHeight/-400 - center[1]),
              [(n[0]+1)*255/2, (n[1]+1)*255/2, (n[2]+1)*255/2, 255]);

    // Sleep 1ms to let the canvas refresh between triangles
    if(i%100 == 0)
      await new Promise((resolve) => {setTimeout(() => resolve(), 1)});
    i++;
  }
  console.log("Frame time: " + (Date.now() - then) + "ms")
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
