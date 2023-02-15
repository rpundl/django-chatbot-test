const Application = PIXI.Application,
      Sprite = PIXI.Sprite;
                    


const app = new Application({
    width: 512,
    height: 512,
    antialias: true,
    transparent: false,
    resolution: 1
});

            
document.body.appendChild(app.view);


let grid = [];
let allPieces = [];
let pieceID = 0;


let s = 1;
for(let i=0; i<8; i++) {
  let row = []
  for(let k=0; k<8; k++) {
    s = !s;
    let square = createSquare(s, 64 * k, 64 * i);
    if(k==7) s = !s;
    row.push(
      {
        "obj": square,
        "center": [64*k+32, 64*i+32],
        "valid": false
      });
  }
  grid.push(row);
}

setPiece("static/chat/queen.png", 2, 1, "white");
setPiece("static/chat/king.png", 3, 1, "white");
setPiece("static/chat/rook.png", 4, 1, "white");
setPiece("static/chat/bishop.png", 5, 1, "white");
setPiece("static/chat/knight.png", 6, 1, "white");
setPiece("static/chat/pawn.png", 2, 6, "white");


function createSquare(color, x, y){
  let asset = color ? "black.png" : "white.png";
  const square = Sprite.from(asset);
  square.anchor.set(.5);
  square.position.set(x + 32, y + 32);
  //0-not occupied
  //1-occupied by white
  //2-occupied by black
  square.code=0;
  app.stage.addChild(square);

  return square;
}





let dragTarget = null;


app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('pointerup', onDragEnd);





function onDragMove(event) {
  if (dragTarget) {
    dragTarget.parent.toLocal(event.global, null, dragTarget.position);
  }
};


function onDragStart() {
  this.alpha = .9;
  dragTarget = this;
  dragTarget.original_position = [dragTarget.position.x, dragTarget.position.y];
  orig = convertToGrid(dragTarget.position.x, dragTarget.position.y)
  
  getValidMoves(dragTarget, orig[0], orig[1]);
  app.stage.on('pointermove', onDragMove);
}

function onDragEnd() {
  function placePiece(dragTarget) {
    let x = dragTarget.position.x;
    let y = dragTarget.position.y;
    let o = dragTarget.original_position
    let square = getGrid(x,y);
    if(square.valid) {
      let center = square.center;
      dragTarget.position.set(center[0], center[1]);
      getGrid(o[0],o[1]).obj.code = 0;
      square.obj.code = 1;
      dragTarget.move = 1;
      
      if (o[0]!=center[0] || o[1]!=center[1]) {
        dragTarget.location = square;
        action = sendGameState(dragTarget);
        processReceivedState(action[0], action[1]);
      }
    } else {
      dragTarget.position.set(o[0], o[1]);
    }
    
  }
  if (dragTarget) {
    app.stage.off('pointermove', onDragMove);
    dragTarget.alpha = 1;
    placePiece(dragTarget);
  }
  
  setGridInvalid(grid);
  dragTarget = null;
}

function setPiece(filename, x, y, color) {
  const piece = Sprite.from(filename);
  piece.name = filename.substring(0, filename.length - 4)
  piece.location = grid[y][x];
  piece.id = pieceID;
  allPieces.push(piece);
  pieceID+=1;
  let square = piece.location;
  let center = square.center;
  piece.move=0;
  piece.color=color;
  piece.position.set(center[0], center[1]);
  if (color=="white") {
    square.obj.code=1;
  }
  
  
  

  piece.interactive = true;
  piece.cursor = "pointer";
  piece.anchor.set(.5);

  piece.on('pointerdown', onDragStart, piece);

  app.stage.addChild(piece);

  return piece;
}


function convertToGrid(x, y) {
  return [Math.floor(x/64), Math.floor(y/64)];
}

function getGrid(x, y) {
  let xbase = Math.floor(x/64);
  let ybase = Math.floor(y/64);
  
  return grid[ybase][xbase];
}


function setGridInvalid() {
  for (let i=0; i<8; i++) {
    for (let k=0; k<8; k++) {
      grid[i][k].valid = false;
      grid[i][k].obj.tint = 0xFFFFFF;

    }
  }
}




function getValidMoves(piece, x, y) {

  function setValid(n, m) {
    grid[n][m].valid = true;
    grid[n][m].obj.tint = 0xCA335C;
  }

  if (piece.name=="queen" || piece.name=="rook" || piece.name=="bishop") {
    
    if (piece.name=="queen" || piece.name=="rook") {
      for(let i=x; i<8; i++){
        setValid(y, i);
        if (i+1<8) {
          if (grid[y][i+1].obj.code==1) break; 
        }
     
      }

      for(let i=y; i<8; i++){
        setValid(i, x);
        if (i+1<8) {
          if (grid[i+1][x].obj.code==1) break; 
        }
      }

      for(let i=x; i>=0; i--){
        setValid(y, i);
        if (i-1>=0) {
          if (grid[y][i-1].obj.code==1) break; 
        }
      }

      for(let i=y; i>=0; i--){
        setValid(i, x);
        if (i-1>=0) {
          if (grid[i-1][x].obj.code==1) break; 
        }
      }
    }

    if (piece.name=="queen" || piece.name=="bishop") {
      for(let i=0; i<8; i++) {
        if(y-i>=0 && x+i<8) {
          setValid(y-i, x+i);
          if (y-i-1>=0 && x+i+1<8) {
            if (grid[y-i-1][x+i+1].obj.code==1) break;
          }   
        }
      }

      for(let i=0; i<8; i++) {
        if(y-i>=0 && x-i>=0) {
          setValid(y-i, x-i);
          if (y-i-1>=0 && x-i-1>=0) {
            if (grid[y-i-1][x-i-1].obj.code==1) break;
          }   
        }
      }
      
      for(let i=0; i<8; i++) {
        if(y+i<8 && x+i<8) {
          setValid(y+i, x+i);
          if (y+i+1<8 && x+i+1<8) {
            if (grid[y+i+1][x+i+1].obj.code==1) break;
          }  
        }
      }

      for(let i=0; i<8; i++) {
        if(y+i<8 && x-i>=0) {
          setValid(y+i, x-i);
          if (y+i+1<8 && x-i-1>=0) {
            if (grid[y+i+1][x-i-1].obj.code==1) break;
          } 
        }
      }
    }   
  }

  if (piece.name=="king") {
    if(y-1>=0) {
      if (grid[y-1][x].obj.code!=1) {
        setValid(y-1, x);
      }
      
      if (grid[y-1][x-1].obj.code!=1) {
        if(x-1>=0) {
        setValid(y-1, x-1);
      }
      }
      
      if (grid[y-1][x+1].obj.code!=1) {
        if(x+1<8) {
          setValid(y-1, x+1);
        }
      }
      
    }

    if (x-1>=0) {
      if (grid[y][x-1].obj.code!=1) {
        setValid(y, x-1);
      }
      
      if (grid[y+1][x-1].obj.code!=1) {
        if (y+1<8) {
          setValid(y+1, x-1);
        }
      }
      
    }
    
    if (y+1<8) {
      if (grid[y+1][x].obj.code!=1) {
        setValid(y+1, x);
      }
      
      if(x+1<8) {
        if (grid[y+1][x+1].obj.code!=1) {
          setValid(y+1, x+1);
        }
        
      }
      
    }

    if(x+1<8) {
      if (grid[y][x+1].obj.code!=1) {
        setValid(y, x+1);
      }
      
    }
  }

  if (piece.name=="knight") {
    
    if(x-2>=0) {
      if (y-1>=0) {
        if (grid[y-1][x-2].obj.code!=1) {
          setValid(y-1,x-2);
        }
        
      }

      if (y+1<8) {
        if (grid[y+1][x-2].obj.code!=1) {
          setValid(y+1,x-2);
        }
        
      }
    }

    if(y-2>=0) {
      if (x-1>=0) {
        if (grid[y-2][x-1].obj.code!=1) {
          setValid(y-2,x-1);
        }
        
      }

      if (x+1<8) {
        if (grid[y-2][x+1].obj.code!=1) {
          setValid(y-2,x+1);
        }
        
      }
    }

    if(x+2<8) {
      if (y-1>=0) {
        if (grid[y-1][x+2].obj.code!=1) {
          setValid(y-1,x+2);
        }
        
      }

      if (y+1<8) {
        if (grid[y+1][x+2].obj.code!=1) {
          setValid(y+1,x+2);
        }
        
      }
    }

    if (y+2<8) {
      if (x-1>=0) {
        if (grid[y+2][x-1].obj.code!=1) {
          setValid(y+2, x-1);
        }
        
      }

      if (x+1<8) {
        if (grid[y+2][x+1].obj.code!=1) {
          setValid(y+2, x+1);
        }
        
      }
    }
  }

  if (piece.name=="pawn") {
    if (piece.move==0) {
      if (grid[y-1][x].obj.code!=1) {
        setValid(y-1,x);
      }
      if (grid[y-2][x].obj.code!=1 && grid[y-1][x].obj.code!=1) {
        setValid(y-2,x);
      }

    } else {
      if (grid[y-1][x].obj.code!=1 && y-1>0) {
        setValid(y-1,x);
      }
    }
  }
}

function sendGameState(piece) {
  // console.log(piece);
  // console.log(piece.location);
  // console.log(piece.id);
  return [piece.id, piece.location.center]
}

function processReceivedState(id, center) {
  let piece = allPieces[id];
  console.log(piece, center);
  piece.location = center;
  allPieces[id].position.set(center[0], center[1])
}
