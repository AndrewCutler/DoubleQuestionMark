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
  var newBlunderPosition = findBlunder(position)
  loadBlunderPosition(newBlunderPosition.position)
  console.log(newBlunderPosition.blunder)
})

function findBlunder(positionPGN) {
  //finds index of first ?? blunder
  var blunderIndex = positionPGN.search(/\?\?/)
  //all moves up to/including bluner
  var prevMoves = positionPGN.substr(0, blunderIndex)
  //blunder move number and move
  var prevMoveEndIndex = prevMoves.lastIndexOf("}") + 2
  var blunderInfo = prevMoves.substr(
    prevMoveEndIndex,
    blunderIndex - prevMoveEndIndex
  )
  //moves up to/excluding blunder
  prevMoves = prevMoves.slice(0, prevMoveEndIndex)
  var blunderData = {}
  blunderData.moveNum = blunderInfo.split(" ")[0]
  blunderData.move = blunderInfo.split(" ")[1]
  var blunderPosition = { blunder: blunderData, position: prevMoves }
  return blunderPosition
}

function loadBlunderPosition(blunder) {
  chess.load_pgn(blunder)
  board = ChessBoard("board", chess.fen())
}
