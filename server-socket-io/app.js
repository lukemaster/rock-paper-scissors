const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 4001;

const app = express();
app.use(cors);
app.get('/', (req, res) => {
  res.send({ response: 'I am alive' }).status(200);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: 'http://localhost:3000',//localhost restriction
    methods: ['GET', 'POST'],
  },
});

/** ****** GAME STATES ******** */
const gameStates = [
  /// // complementary ////
  'ready',
  'attemping_to_game_setup',
  /// /////////////////////
  'playing',
  'restarting-game',
];
/** *************************** */
let currentState = gameStates[0], restartGamePlayersNotified = 0;
let playersRemaining = 0, rounds = 1;

const players = {};
const results = {};

/** ****** ELEMENTS' LOGIC ****** */

// PAPER:    0 - WIN -> 2 ROCK
// SCISSORS: 1 - WIN -> 0 PAPER
// ROCK:     2 - WIN -> 1 SCISSORS
const elementsWin = [
  2,
  0,
  1,
];

const checkResult = (a, b) => {
  if (a !== b) {
    return !(elementsWin[a] !== b);
  }
  return null;
};
/** *************************** */

const broadCastFatalError = () => {
  Object.keys(players).forEach((k) => {
    const player = players[k];
    player.socket.emit('fatal-error');
    player.socket.disconnect();
    delete players[k];
  });
  playersRemaining = 0;
  rounds = 1;
  Object.keys(results).forEach((k) => { delete results[k]; });
  currentState = gameStates[0];
};

const gameResultN = () => {
  try {
    this.rounds -= 1;
    this.currentState = 'playing';
    const keys = Object.keys(players);

    const results = [];
    const roundScores = [];
    for (let i = 0; i < keys.length; i += 1) {
      const playerA = players[keys[i]];

      for (let j = i + 1; j < keys.length; j += 1) {
        const playerB = players[keys[j]];

        const result = checkResult(playerA.choice, playerB.choice);
        /** ******** RESULT OPTIONS *********
        * 0: LOSE
        * 1: WIN
        * 2: DRAW
        ********** RESULT OPTIONS ******** */
        results.push({
          A: playerA.uuid,
          B: playerB.uuid,
          win: result !=null?result?playerA.uuid:playerB.uuid:null,
          lose: result!=null?result?playerB.uuid:playerA.uuid:null
        });
      }
      roundScores[playerA.uuid] = 0;
    }

    results.forEach((result) => {
      if (result.win != null) {
        roundScores[result.win] += 1;
        roundScores[result.lose] -= 1;
      }
    });

    results.forEach((result) => {
      if (result.win != null) {
        const playerWon = players[result.win];
        playerWon.result = true;
        playerWon.roundScore = roundScores[playerWon.uuid];
        playerWon.score += playerWon.roundScore;

        const playerLost = players[result.lose];
        playerLost.result = false;
        playerLost.roundScore = roundScores[playerLost.uuid];
        playerLost.score += playerLost.roundScore;

        if (playerWon.choice != null && playerLost.choice != null) {
          playerWon.socket.emit('result', {
            newArray: [playerWon.choice, playerLost.choice],
            rounds: this.rounds,
            score: playerWon.score,
            result: playerWon.result,
          });
          playerLost.socket.emit('result', {
            newArray: [playerLost.choice, playerWon.choice],
            rounds: this.rounds,
            score: playerLost.score,
            result: playerLost.result,
          });
        } else {
          broadCastFatalError();
          return;
        }
      } else {
        keys.forEach((k) => {
          if (players[keys[0]] != null) {
            players[k].socket.emit('result', {
              newArray: [players[keys[0]].choice, players[keys[0]].choice],
              rounds: this.rounds,
              score: players[k].score,
              result: null,
            });
            players[k].roundScore = 0;
          } else {
            broadCastFatalError();
            return;
          }
        });
      }
    });

    Object.keys(players).forEach((playerKey) => {
      const choices = {};
      const roundResults = {};
      const scores = {};
      
      Object.keys(players).forEach((key) => {
        const pKey = players[key];
        let nickname = pKey.nickname;
        if (key === playerKey) {
          nickname = 'me';
        }
        choices[nickname] = pKey.choice;
        roundResults[nickname] = pKey.roundScore != null ? pKey.roundScore > 0 : null;
        scores[nickname] = pKey.roundScore;
      });
      players[playerKey].results.push({
        choices,
        results: roundResults,
        scores,
      });
    });
    if (this.rounds <= 0) {
      this.rounds = 1;
    }
  } catch (error) {
    console.error(error);// TODO: what does player has won?
    broadCastFatalError();
  }
};

const gameResult = () => {// UNUSED. PARTICULAR CASE FOR ONLY TWO PLAYERS
  try {
    this.currentState = 'playing'
    const keys = Object.keys(players);

    const elementWin = checkResult(players[keys[0]].choice, players[keys[1]].choice);
    /** ******** RESULTS *********
    * 0: LOSE
    * 1: WIN
    * 2: DRAW
    ********** RESULTS ******** */
    this.rounds -= 1;
    let idxWon = 1, idxLost = 0;
    if (elementWin != null) {
      if (elementWin) {
        idxWon = 0;
        idxLost = 1;
      }
      const playerWon = players[keys[idxWon]];
      playerWon.result = true;
      playerWon.score += 1;
      playerWon.roundScore = 1;
      const playerLost = players[keys[idxLost]];
      playerLost.result = false;
      playerLost.score -= 1;
      playerLost.roundScore = -1;
      playerWon.socket.emit('result', {
        newArray: [playerWon.choice, playerLost.choice],
        rounds: this.rounds,
        score: playerWon.score,
        result: playerWon.result,
      });
      playerLost.socket.emit('result', {
        newArray: [playerLost.choice, playerWon.choice],
        rounds: this.rounds,
        score: playerLost.score,
        result: playerLost.result,
      });
    } else {
      keys.forEach((k) => {
        players[k].socket.emit('result', {
          newArray: [players[keys[0]].choice, players[keys[0]].choice],
          rounds: this.rounds,
          score: players[k].score,
          result: null,
        });
        players[k].roundScore = 0;
      });
    }
    Object.keys(players).forEach((playerKey) => {
      const player = players[playerKey];
      const choices = {}, roundResults = {}, scores = {}
      
      Object.keys(players).forEach((key) => {
        let nickname = player.nickname;
        if (key === playerKey) {
          nickname = 'me';
        }
        choices[nickname] = players[key].choice
        roundResults[nickname] = elementWin != null?keys[idxWon] == key:null
        scores[nickname] = players[key].roundScore
      });
      player.results.push({
        choices,
        results: roundResults,
        scores,
      });
    });
    if (this.rounds <= 0) {
      this.rounds = 1;
    }
  } catch (error) {
    console.error(error);// TODO: what player has won
    broadCastFatalError();
  }
};

const setPlayersRemaining = (val) => {
  playersRemaining = Math.max(0, Math.min(Object.keys(players).length, val));
};

const broadCastNewGame = () => {
  restartGamePlayersNotified = 0;
  this.currentState = 'restarting-game';
  Object.keys(players).forEach((key) => {
    players[key].socket.emit('restart-game');
    players[key].socket.disconnect();
  });
  this.currentState = 'attemping_to_game_setup';
};

const reConfigureGame = (player) => {
  if (this.currentState !== 'restarting-game') {
    const socket = player.socket;
    socket.on('configure-game', () => { this.gameState = 'configure-game'; });
    /** ******* SETTING UP GAME ******* */
    socket.on('game-setup', () => {
      if (Object.keys(players).length > 1) {
        socket.emit('let-us-play');
      } else {
        socket.emit('waitForPlayers');
      }
    });
    if (this.currentState === 'attemping_to_game_setup') {
      socket.emit('configure-game');
    }
    let newPlayersRemaining = 0;
    Object.keys(players).forEach((k) => {
      if (players[k].choice == null) {
        newPlayersRemaining += 1;
      }
    });
    setPlayersRemaining(newPlayersRemaining);
  }
};

io.on('connection', (socket) => {
  const numberOfPlayers = Object.keys(players).length;

  if (numberOfPlayers >= 2) { // RESTRICTION: 2 PLAYERS
    socket.disconnect();
  }

  const masterPlayer = numberOfPlayers < 1;

  /** ** SETTING UP CONNECTION ** */
  const uuid = uuidv4();
  players[uuid] = {
    uuid,
    socket,
    choice: null,
    score: 0,
    results: [],
  };
  const player = players[uuid];
  results[uuid] = [];

  /** ****** PLAYER DISCONNECTION ******* */
  socket.on('disconnect', (reason) => {
    setPlayersRemaining(playersRemaining - 1);
    if (reason !== 'client namespace disconnect') {
      const keys = Object.keys(players);
      // PREVENTING REMOVE PLAYER WITHOUT BEING ADDED TO PLAYERS' ARRAY
      if (keys.indexOf(uuid) >= 0) {
        const player = players[uuid];
        if (player?.masterPlayer) {
          if (keys.length > 1) {
            players[keys[1]].masterPlayer = true;
            players[keys[1]].choice = null;
          }
          delete players[uuid];
          // after deleting, newt before key is now index 0
          const newKeys = Object.keys(players);
          if (newKeys.length > 0) {
            reConfigureGame(players[newKeys[0]])
          }
        } else {
          delete players[uuid];
        }
      }
    }
    /// /////////////////////////////////////////////////////////////
    console.log(`Player disconnected. Players: ${Object.keys(players).length}`);
  });

  console.log(`New player connected. Players: ${Object.keys(players).length}`);

  socket.on('your-uuid-ACK',() => {
    setPlayersRemaining(playersRemaining + 1);
    if (!masterPlayer) {
      // be secure there is at least one master player
      let masterPlayerFound = false;
      const pKeys = Object.keys(players);
      pKeys.forEach((key) => {
        masterPlayerFound = masterPlayerFound || players[key].masterPlayer
      });
      if (masterPlayerFound) {
        socket.emit('join-game');
      } else {
        const p = players[pKeys[0]];
        this.currentState = 'attemping_to_game_setup';
        p.masterPlayer = true;
        reConfigureGame(p);
      }
    } else {
      this.currentState = 'attemping_to_game_setup';
      player.masterPlayer = true;
      reConfigureGame(player);
      /** ******************************* */
    }

    /** ******** CHOICE RECEPTION ********* */
    socket.on('choice', (data) => {
      try {
        if (data.choice != null) {
          player.choice = data.choice;
          setPlayersRemaining(playersRemaining - 1);
          if (playersRemaining <= 0) {
            if (playersRemaining < 0) {
              broadCastFatalError();
            } else { // playersRemaining == 0
              gameResultN();
              playersRemaining = Object.keys(players).length;
            }
          }
        } else {
          throw broadCastFatalError();
        }
      } catch (error) {
        console.error(error);
        broadCastFatalError();
      }
    });

    socket.on('player-info', (data) => {
      player.choice = null;
      player.score = 0;
      player.results = [];
      if (player.masterPlayer) {
        this.rounds = data.rounds;
      }
      player.nickname = data.nickname;
    });

    socket.on('get-final-score', () => {
      this.currentState = 'attemping_to_game_setup';
      socket.emit('show-final-score', {
        finalScore: player.results,
      });
    });

    socket.on('restart-game', () => {
      restartGamePlayersNotified += 1;
      if (Object.keys(players).length <= restartGamePlayersNotified) {
        broadCastNewGame();
      }
    });
  });

  socket.emit('your-uuid', { uuid });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
