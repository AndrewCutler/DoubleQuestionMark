//chessjs engine
var chess = new Chess()
//set up initial board
var board = ChessBoard("board", "start")
//load blunders file and save to array
var blunders
//start button
var startBtn = document.getElementById("start")
//try next position button
var nextBtn = document.getElementById("tryAgain")
//eval field
var evalDiv = document.getElementById("eval")
//is grabbed blunder a capture?
var validBlunder = false
//randomly loaded position
var position
//contains correct move
var newBlunderPosition
//value of pre- and post-move evaluation
var eval
//regex for evaluation
var evalRE = /eval\s#*-*\d+\.?\d*]\s}/
//black eval bar
var blackBar = document.getElementById("black")

//start game on click
startBtn.addEventListener("click", function() {
  loadBlunderPosition(newBlunderPosition)
  startBtn.style.display = "none"
  nextBtn.style.display = "block"
  evalDiv.innerHTML = "Eval before blunder: " + eval.pre
})

//load new position
nextBtn.addEventListener("click", function() {
  newPosition()
  validBlunder = false
  loadBlunderPosition(newBlunderPosition)
  evalDiv.innerHTML = "Eval before blunder: " + eval.pre
  console.log(eval)
  console.log(newBlunderPosition.blunder)
})

//validate legal moves and check if it's correct
var movePiece = function(source, target) {
  if (chess.move({ from: source, to: target }) !== null) {
    // chess.move({ from: source, to: target })
    //call move checker function
    var moveOutcome = checkMove(
      chess.history()[chess.history().length - 1],
      newBlunderPosition.blunder.move
    )
    showAnswer(moveOutcome)
    if (moveOutcome !== "Correct!") {
      chess.undo()
      return "snapback"
    }
    moveEvalBar(eval)
  } else return "snapback"
}

//load games into blunders variable
fetch("blunders.txt")
  .then(res => res.text())
  .then(data => {
    blunders = data
    blunders = blunders.split("\n")
    //choose random game where blunder is a capture
    newPosition()
    validBlunder = false
  })

//   ############### Functions
//find first blunder in given game PGN
function findBlunder(positionPGN) {
  //finds index of first ?? blunder
  var blunderIndex = positionPGN.search(/\?\?/)
  //finds eval after blunder is made
  findEval(blunderIndex, positionPGN)
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

//load game to position where blunder is next half move
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
  if (playerMove === correctMove) {
    evalDiv.innerHTML = `Eval after blunder: ${eval.post}`
    // </br>Centipawn change: ${(eval.post - eval.pre).toPrecision(2)}`
    return "Correct!"
  }
  return "That's not the blunder we're looking for."
}

//pull random blunder from blunders
function grabBlunder() {
  position = blunders[Math.floor(Math.random() * blunders.length)]
  return position
}

//output answer to DOM
function showAnswer(answer) {
  document.getElementById("output").innerHTML = answer
}

//load a blunder and show its position
function newPosition() {
  grabBlunder()
  newBlunderPosition = findBlunder(position)
  while (!validBlunder) {
    if (newBlunderPosition.blunder.move.indexOf("x") === -1) {
      grabBlunder()
      newBlunderPosition = findBlunder(position)
    } else validBlunder = true
  }
  //set eval bar to preEval width
  blackBar.style.animation = "none"
  blackBar.offsetHeight
  blackBar.style.animation = null
  blackBar.style.width = 50 - eval.pre * 5 + "%"
  //moveEvalBar triggers on page load (shouldn't)
}

//find and save evals
function findEval(blunderIndex, blunderPosition) {
  //before-blunder eval with junk as string
  var preEval = evalRE.exec(blunderPosition.substr(blunderIndex - 25, 25))
  //retrieve number from preEval only
  preEval = preEval[0].split(" ")[1]
  //remove closing bracket ] from string
  preEval = preEval.slice(0, preEval.length - 1)
  // after-blunder eval with junk as string
  var postEval = evalRE.exec(blunderPosition.substr(blunderIndex + 5, 18))
  //retrieve number from val only
  postEval = postEval[0].split(" ")[1]
  //remove closing bracket ] from string
  postEval = postEval.slice(0, postEval.length - 1)
  console.log(blunderPosition)
  console.log("####postEval: " + postEval)
  console.log("####preEval: " + preEval)
  return (eval = { pre: preEval, post: postEval })
}

//logic for eval bar
//eval of 0 means black div width = 50%
//eval of >= 10 means black div width = 0%
//eval of <= -10 means black div width = 100%
function moveEvalBar(evaluation) {
  //set width to 50% at start
  var preWidth = parseInt(50 - evaluation.pre * 5) + "%"
  blackBar.style.width = preWidth
  //calculate new width
  var postWidth = parseInt(50 - evaluation.post * 5)
  //if blunder leads to forced mate
  if (evaluation.post.indexOf("#") !== -1) {
    postWidth = 100
  }
  console.log(parseFloat(blackBar.style.width))
  console.log(postWidth)
  //create new animation and add to head
  var animationStyle = document.createElement("style")
  animationStyle.type = "text/css"
  animationStyle.setAttribute("id", "animation")
  animationStyle.innerHTML = `@keyframes moveBar {
    0% {width: ${preWidth}%;}
    100% {width: ${postWidth}%;}
  }`
  //remove old animation
  if (document.getElementById("animation")) {
    document.head.removeChild(document.getElementById("animation"))
    //remove animation and retrigger CSS
    blackBar.style.animation = "none"
    blackBar.offsetHeight
    blackBar.style.animation = null
  }
  //add animation style tag to head
  document.head.appendChild(animationStyle)
  //retrigger animation
  blackBar.style.animation = "moveBar 1s linear forwards"
}
/*to-do: 
  set max of 10 and min of -10
  animation doesn't parse mates properly (NaN)
  */
