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
  /*
  for(let p of arr){
    p.x = Math.round(p.x);
    p.y = Math.round(p.y);
  }*/
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
    if(Math.round(ex-sx+1) <= 0){
      //console.log("can't draw 0 width line", sx, y, ex);
      //console.log((new Error()).stack);
      return;
    }
    let imgData = ctx.getImageData(Math.round(sx), y, Math.round(ex-sx+1), 1);
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
