var gameDeathSquareSize = 3;
var gameSize = 19;
var odd = gameSize % 2 === 1

function check_liberties(position, testing, x, y, c, deathSquareSize=gameDeathSquareSize) {
	// out of the board there aren't liberties

	if(x < 0 || x >= position.size || y < 0 || y >= position.size) return true;
    
    var odd = position.size % 2 === 1
    if((
        odd && (
            x < Math.floor(position.size / 2) + 1 + deathSquareSize &&
            x > Math.floor(position.size / 2) - 1 - deathSquareSize && 
            y < Math.floor(position.size / 2) + 1 + deathSquareSize &&
            y > Math.floor(position.size / 2) - 1 - deathSquareSize
        )
        ) || (
        !odd && (
            x < position.size / 2 - 0.5 + deathSquareSize &&
            x > position.size / 2 - 0.5 - deathSquareSize &&
            y < position.size / 2 - 0.5 + deathSquareSize &&
            y > position.size / 2 - 0.5 - deathSquareSize
        )
    )){ return true;}
	// however empty field means liberty
	if(position.get(x,y) == 0) return false;
	// already tested field or stone of enemy isn't giving us a liberty.
	if(testing.get(x,y) == true || position.get(x,y) == -c) return true;

	// set this field as tested
	testing.set(x,y,true);

	// in this case we are checking our stone, if we get 4 trues, it has no liberty
	return 	check_liberties(position, testing, x, y-1, c) &&
			check_liberties(position, testing, x, y+1, c) &&
			check_liberties(position, testing, x-1, y, c) &&
			check_liberties(position, testing, x+1, y, c);
}

var game = new WGo.Game(gameSize);

var board = new WGo.Board(document.getElementById("board"), {
    size: gameSize,
    width: 600,
    section: {
        top: -0.5,
        left: -0.5,
        right: -0.5,
        bottom: -0.5,
    }
});

var currentPlayer = WGo.B

// WGo.Board.DrawHandler which draws airplanes
var plane = {
    // draw on stone layer
    stone: {
        // draw function is called in context of CanvasRenderingContext2D, so we can paint immediately using this
        draw: function(args, board) {
            var xr = board.getX(args.x), // get absolute x coordinate of intersection
                yr = board.getY(args.y), // get absolute y coordinate of intersection
                sr = board.stoneRadius; // get field radius in px
            
            // if there is a black stone, draw white plane
            if(board.obj_arr[args.x][args.y][0].c == WGo.B) this.strokeStyle = "white"; 
            else this.strokeStyle = "black";
            
            this.lineWidth = 3;
            
            this.beginPath();
            
            this.moveTo(xr - sr*0.8, yr);
            this.lineTo(xr + sr*0.5, yr);
            this.lineTo(xr + sr*0.8, yr - sr*0.25);
            this.moveTo(xr - sr*0.4, yr);
            this.lineTo(xr + sr*0.3, yr - sr*0.6);
            this.moveTo(xr - sr*0.4, yr);
            this.lineTo(xr + sr*0.3, yr + sr*0.6);
            
            this.stroke();
        }
    },
}

var deadArea = {
    // draw on grid layer
    grid: {
        draw: function(args, board) {
            var xr, yr, sr;
            
            this.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.textBaseline="middle";
            this.textAlign="center";
            this.font = board.stoneRadius+"px "+(board.font || "");
            sr = board.stoneRadius * gameDeathSquareSize; 

            
            
            if (odd){
                xr = board.getX(Math.floor(board.size / 2) - gameDeathSquareSize*4.5/4);
                yr = board.getY(Math.floor(board.size / 2) - gameDeathSquareSize*4.5/4);
                this.fillRect(xr, yr, sr*4.5, sr*4.5);
            } else {
                xr = board.getX(board.size / 2 - 0.5 - gameDeathSquareSize*3.75/4);
                yr = board.getY(board.size / 2 - 0.5 - gameDeathSquareSize*3.75/4);
                this.fillRect(xr, yr, sr*3.75, sr*3.75);
            }
            
        }
    }
 }

// WGo.Board.DrawHandler which draws coordinates
var coordinates = {
    // draw on grid layer
    grid: {
        draw: function(args, board) {
            var ch, t, xright, xleft, ytop, ybottom;
            
            this.fillStyle = "rgba(0,0,0,0.7)";
            this.textBaseline="middle";
            this.textAlign="center";
            this.font = board.stoneRadius+"px "+(board.font || "");
            
            xright = board.getX(-0.75);
            xleft = board.getX(board.size-0.25);
            ytop = board.getY(-0.75);
            ybottom = board.getY(board.size-0.25);
            
            for(var i = 0; i < board.size; i++) {
                ch = i+"A".charCodeAt(0);
                if(ch >= "I".charCodeAt(0)) ch++;
                
                t = board.getY(i);
                this.fillText(board.size-i, xright, t);
                this.fillText(board.size-i, xleft, t);
                
                t = board.getX(i);
                this.fillText(String.fromCharCode(ch), t, ytop);
                this.fillText(String.fromCharCode(ch), t, ybottom);
            }
            
            this.fillStyle = "black";
        }
    }
}

board.addCustomObject(coordinates);
board.addCustomObject(deadArea);

board.addEventListener("click", function (x, y) {
    // Check if the intersection is empty
    var result = game.play(x, y, currentPlayer, false);
    
    if (typeof result != 'number') {
        // Update the board
        board.addObject({x: x, y: y, c: currentPlayer});
        for (var stone of result){
            board.removeObjectsAt(stone.x, stone.y)
        }

        // Switch to the other player for the next turn
        currentPlayer = (currentPlayer === WGo.B) ? WGo.W : WGo.B;
    }
});