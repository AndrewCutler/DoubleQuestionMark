//chessjs engine
var chess = new Chess()
//set up initial board
var board = ChessBoard("board", "start")
//load blunders file and save to array
var blunders
//try again button
var nextBtn = document.getElementById("tryAgain")
//is grabbed blunder a capture?
var validBlunder = false

//start game on click
var startBtn = document.getElementById("start")
startBtn.addEventListener("click", function() {
  console.log(position)
  loadBlunderPosition(newBlunderPosition)
  console.log(newBlunderPosition.blunder)
  startBtn.style.display = "none"
  nextBtn.style.display = "block"
})

//load new position
nextBtn.addEventListener("click", function() {
  grabBlunder()
  newBlunderPosition = findBlunder(position)
  while (!validBlunder) {
    if (newBlunderPosition.blunder.move.indexOf("x") === -1) {
      grabBlunder()
      newBlunderPosition = findBlunder(position)
    } else validBlunder = true
  }
  loadBlunderPosition(newBlunderPosition)
  console.log(newBlunderPosition.blunder)
})

//randomly loaded position
var position
//contains correct blunder move
var newBlunderPosition

//validate legal moves
var movePiece = function(source, target) {
  if (chess.move({ from: source, to: target }) !== null) {
    chess.move({ from: source, to: target })
    //call move checker function
    var moveOutcome = checkMove(
      chess.history()[chess.history().length - 1],
      newBlunderPosition.blunder.move
    )
    //output answer
    showAnswer(moveOutcome)
    if (moveOutcome !== "Correct!") {
      loadBlunderPosition(newBlunderPosition)
      console.log(chess.history())
    }
  } else return "snapback"
}

fetch("blunders.txt")
  .then(res => res.text())
  .then(data => {
    blunders = data
    blunders = blunders.split("\n")
    //choose random game where blunder is a capture
    grabBlunder()
    newBlunderPosition = findBlunder(position)
    while (!validBlunder) {
      if (newBlunderPosition.blunder.move.indexOf("x") === -1) {
        grabBlunder()
        newBlunderPosition = findBlunder(position)
      } else validBlunder = true
    }
    console.log(position, newBlunderPosition.blunder)
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

//check if correct blunder is made
function checkMove(playerMove, correctMove) {
  if (playerMove === correctMove) return "Correct!"
  return "That's not the blunder we're looking for."
}

//pull random blunder from blunders
function grabBlunder() {
  position = blunders[Math.floor(Math.random() * blunders.length)]
  return position
}

function showAnswer(answer) {
  document.getElementById("output").innerHTML = answer
}
