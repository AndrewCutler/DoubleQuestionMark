## Double Question Mark

Find the blunder instead of the best move.

### Dependencies

- [chessjs](https://github.com/jhlywa/chess.js)
- [chessboardjs](www.chesboardjs.com)
- [Lichess database](https://database.lichess.org/)

### Limitations/problems

Quite frankly this game isn't very fun or rewarding. The number of possible blunders in any given position often outnumbers the number of 'correct' moves, so finding the correct incorrect move is very difficult and almost arbitrary. Perhaps in the future glaring one-move blunders where there are no alternative solutions can be found.
The positions/games in this repo were taken somewhat randomly from [Lichess](lichess.org). 1000 games which featured double-question mark moves (??) -- AKA blunders -- were randomly pulled and used as the data set for the positions. Perhaps a more fine-tuned approach can be made in the future, e.g. only using examples where an eval swing of 500 centipawns or more is seen.

### To Do

- find better/more interesting positions to play
- integrate stockfishjs for live player move evaluations
- styling
- navigate through game moves
- lots of logic; for now, validate user move against blunder move and inform user of correct blunder selections
- optimize finding of candidate blunders? Success rate currently very low
