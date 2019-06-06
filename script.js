//chessjs engine
var chess = new Chess()

//validate legal moves
var movePiece = function(source, target) {
  if (chess.move({ from: source, to: target }) !== null) {
    chess.move({ from: source, to: target })
  } else return "snapback"
}

//set up initial board
var board = ChessBoard("board", "start")

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

//start game
var startBtn = document.getElementById("start")
startBtn.addEventListener("click", function() {
  console.log(position)
  var newBlunderPosition = findBlunder(position)
  loadBlunderPosition(newBlunderPosition)
  console.log(newBlunderPosition.blunder)
})

// functions to find blunders and load position
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

function loadBlunderPosition(loadedBlunder) {
  chess.load_pgn(loadedBlunder.position)
  //calculate side to play
  var moveNumLength = loadedBlunder.blunder.moveNum.length
  var whoseTurn =
    loadedBlunder.blunder.moveNum.substring(
      moveNumLength - 3,
      moveNumLength
    ) === "..."
      ? "black"
      : "white"
  //config for loaded position
  var config = {
    orientation: whoseTurn,
    position: chess.fen(),
    draggable: true,
    onDrop: movePiece
  }
  board = ChessBoard("board", config)
}
