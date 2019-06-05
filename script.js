//chessjs engine
var chess = new Chess()

//validate legal moves
var movePiece = function(source, target) {
  if (chess.move({ from: source, to: target }) !== null) {
    chess.move({ from: source, to: target })
  } else return "snapback"
}

//set up board
var config = {
  position: "start",
  draggable: true,
  onDrop: movePiece
}
var board = ChessBoard("board", config)

//randomly loaded position
var position

//load blunders file and save to array
var blunders
fetch("blunders.txt")
  .then(res => res.text())
  .then(data => {
    blunders = data
    blunders = blunders.split("\n")
    //choose random game
    position = blunders[Math.floor(Math.random() * blunders.length)]
  })

var startBtn = document.getElementById("start")
startBtn.addEventListener("click", function() {
  console.log(position)
  findBlunder(position)
  chess.load_pgn(position)
  board = ChessBoard("board", chess.fen())
})

function findBlunder(positionPGN) {
  //finds index of first ?? blunder
  var blunderIndex = positionPGN.search(/\?\?/)
  console.log(positionPGN.substr(blunderIndex - 4, 4))
}
