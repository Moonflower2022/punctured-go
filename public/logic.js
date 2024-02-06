import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

import WGo from "./wgo/wgo.js"

const firebaseConfig = {
    apiKey: "AIzaSyA1ZtrqXn8f7jdFjAXWi3Cx0KcEj8nhmVw",
    authDomain: "punctured-go125.firebaseapp.com",
    databaseURL: "https://punctured-go125-default-rtdb.firebaseio.com",
    projectId: "punctured-go125",
    storageBucket: "punctured-go125.appspot.com",
    messagingSenderId: "666876129138",
    appId: "1:666876129138:web:a3b75a686482d51dc1b7eb"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app)

const movesRef = ref(database, '/game state/moves')
const moveNumberRef = ref(database, '/game state/move number')
const gameOverRef = ref(database, '/game state/game over')

var gameDeathSquareSize = (localStorage.getItem('deathSquareSize') * 1) || 3;
var boardSize = (localStorage.getItem('boardSize') * 1) || 19;
var odd = boardSize % 2 === 1
const isAdmin = localStorage.getItem("email") === "harryqian16@gmail.com" || localStorage.getItem("email") === "harrisonq125@gmail.com"

document.getElementById("deathSquareSize").value = gameDeathSquareSize.toString()
document.getElementById("boardSize").value = boardSize.toString()

document.getElementById("deathSquareSize-value").innerHTML = gameDeathSquareSize.toString()
document.getElementById("boardSize-value").innerHTML = boardSize.toString()

if (isAdmin){
    get(gameOverRef)
        .then((snapshot) => {
            if (snapshot.val() === true) {
                console.log(document.getElementById("deathSquareSize"))
                document.getElementById("deathSquareSize").removeAttribute('disabled')
                document.getElementById("boardSize").removeAttribute('disabled')

                document.getElementById("gameStatus").innerHTML = "Game paused."
            } else {
                document.getElementById("gameStatus").innerHTML = "Game in progress."
            }
        });
    onValue(gameOverRef, (snapshot) => {
        if (snapshot.val() === true){
            document.getElementById("deathSquareSize").removeAttribute('disabled')
            document.getElementById("boardSize").removeAttribute('disabled')

            document.getElementById("gameStatus").innerHTML = "Game paused."
        } else {
            document.getElementById("deathSquareSize").setAttribute('disabled', 'true')
            document.getElementById("boardSize").setAttribute('disabled', 'true')

            document.getElementById("gameStatus").innerHTML = "Game in progress."
        }
    })
}

get(gameOverRef)
    .then((snapshot) => {
        document.getElementById("gameStatus").innerHTML = snapshot.val() ? "Game paused." : "Game in progress."
    });
onValue(gameOverRef, (snapshot) => {
    document.getElementById("gameStatus").innerHTML = snapshot.val() ? "Game paused." : "Game in progress."
    localStorage.setItem("gameOver", snapshot.val().toString())
})


var game = new WGo.Game(boardSize);

var board = new WGo.Board(document.getElementById("board"), {
    size: boardSize,
    width: 600,
    section: {
        top: -0.5,
        left: -0.5,
        right: -0.5,
        bottom: -0.5,
    }
});

var color = isAdmin ? WGo.B : WGo.W

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

onValue(movesRef, (snapshot) => {
    var retrievedMoves = snapshot.val()

    localStorage.setItem("moves", JSON.stringify(retrievedMoves))

    console.log("retrievedMoves (on change): ", retrievedMoves)

    game.firstPosition()

    board.removeAllObjects()

    if (retrievedMoves){
        for (const moveNumber in retrievedMoves){

            const move = retrievedMoves[moveNumber]
            
            var result = game.play(move.x, move.y, move.c)

            if (typeof result != 'number') {
                board.addObject(move);
                for (const stone of result){
                    board.removeObjectsAt(stone.x, stone.y)
                    console.log("removed: ", stone.x, stone.y)
                }
            } else {
                console.log(result)
                throw new Error("Move is bad! some how game.play returns an error code")
            }
        }
        /*
        var position = game.getPosition()

        for (let i = 0; i < position.schema.length; i++){
            if (position.schema[i] != 0){
                board.addObject({x: Math.floor(i / (position.size * 1)), y: i % (position.size * 1), c: position.schema[i]})
            }
        }
        */
    }
})

onValue(ref(database, '/game state/board size'), (snapshot) => {
    
})

onValue(ref(database, '/game state/death square size'), (snapshot) => {

})


board.addEventListener("click", function (x, y) {
    if (localStorage.getItem("gameOver") === "true"){
        return;
    } 
    var result = game.play(x, y, color, false);
    
    if (typeof result != 'number') {
        var retrievedMoves = JSON.parse(localStorage.getItem("moves")) || {}
        
        retrievedMoves[localStorage.getItem('moveNumber') * 1] = {x: x, y: y, c: color}

        set(movesRef, retrievedMoves)
            .then(function(){
                board.addObject({x: x, y: y, c: color});
                for (var stone of result){
                    board.removeObjectsAt(stone.x, stone.y)
                }
            })
            .catch((error) => {
                console.log("error adding move: ", error.message)
            })

        set(moveNumberRef, localStorage.getItem('moveNumber') * 1 + 1);
    } else {
        console.log("Move is bad! game.play returns an error code: ", result)
    }
});

/*
document.getElementById('pass').addEventListener("click", function () {

});
*/

document.getElementById('undo').addEventListener("click", function () {
    var retrievedMoves = JSON.parse(localStorage.getItem("moves")) || {}

    if (retrievedMoves === null) return;
    
    delete retrievedMoves[localStorage.getItem('moveNumber') * 1 - 1]

    set(movesRef, retrievedMoves)
        .then(function(){
            console.log("move removed!")
        })
        .catch((error) => {
            throw new Error(error.message)
        })

    set(moveNumberRef, localStorage.getItem('moveNumber') * 1 - 1)

    game.popPosition()
});