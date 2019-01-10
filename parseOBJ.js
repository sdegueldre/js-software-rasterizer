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
