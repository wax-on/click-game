// Socket controller

const debug = require("debug")("clickGame:socket_controller");

let io = null;
let playerTwo = {};
let playerOne = {};
let scoreboard = {};
let clickCounter = 0;

let data = {
  players: {},
  score: {},
  roundsPlayed: 0,
  playerReaction: {},
};

// Get usernames of online users
function getOnlineUsers() {
  return Object.values(playerOne);
}

// Handle a new user connecting
function handleRegisterUser(username, callback) {
  debug("Player '%s' connected to the game", username);
  playerOne[this.id] = username;
  data.players[this.id] = username;
  callback({
    joinGame: true,
    usernameInUse: false,
    onlineUsers: getOnlineUsers(),
  });

  multiplayerGame(this);

  // broadcast to all connected sockets EXCEPT ourselves
  this.broadcast.emit("new-user-connected", username);

  // broadcast online users to all connected sockets EXCEPT ourselves
  this.broadcast.emit("online-users", getOnlineUsers());
}

// Start new game
function startNewGame(socket) {
  console.log("creating one game from user: ", playerOne[socket.id]);
  console.log("Start a gameBoard from PlayerOne: ", playerOne[socket.id]);

  if (data.roundsPlayed < 10) {
    socket.emit("get-playground", socket.id);
    console.log("Played rounds: ", data.roundsPlayed);
  } else {
    io.emit("game-over", scoreboard, finalScore());
    startOver();
    console.log("Game over");
    return;
  }
}

// Update scoreboard
function updateScoreBoard(id) {
  scoreboard[data.players[id]] = data.score[id];
  io.emit("update-score", scoreboard);
}

// Add point to player how clicked first
function clickTime(playerInfo) {
  data.playerReaction[playerInfo.id] = playerInfo.reactiontime;
  clickCounter++;
  compareReaction(this);
}

// Comparing reactiontime and update the score.
function compareReaction(socket) {
  if (clickCounter === 2) {
    if (data.playerReaction[socket.id] < playerTwo.reaction) {
      data.score[socket.id]++;
      updateScoreBoard(socket.id);
    } else if (data.playerReaction[socket.id] > playerTwo.reaction) {
      data.score[playerTwo.id]++;
      updateScoreBoard(playerTwo.id);
    }
  } else {
    playerTwo = {
      id: [socket.id],
      reaction: data.playerReaction[socket.id],
    };
    return;
  }
  debug("Score: ", data.score);
  clickCounter = 0;
  data.roundsPlayed++;

  startNewGame(socket);
}

// Handle two players/users/gamers
function multiplayerGame(socket) {
  if (Object.keys(playerOne).length === 2) {
    data.score[socket.id] = 0;
    scoreboard[data.players[socket.id]] = 0;

    io.emit("update-score", scoreboard);
    io.emit("show-game");

    startNewGame(socket);
  }
  if (Object.keys(playerOne).length < 2) {
    data.players[socket.id] = playerOne[socket.id];
    data.score[socket.id] = 0;
    scoreboard[data.players[socket.id]] = 0;
    return;
  }
}

// Random position for image
function imagePosition(playgroundDimensions) {
  const y = Math.floor(Math.random() * playgroundDimensions.y);
  const x = Math.floor(Math.random() * playgroundDimensions.x);

  const delay = Math.floor(Math.random() * 5000);

  io.emit("random-position", y, x, delay, playerOne[this.id]);
}

// Clear/Remove player data
const startOver = () => {
  playerOne = {};
  data = {
    players: {},
    score: {},
    roundsPlayed: 0,
    playerReaction: {},
  };
  scoreboard = {};

  debug("Disconnect: ", data);
  debug("Scoreboard: ", scoreboard);
};

// Handle user disconnecting/exiting
function handleUserDisconnect() {
  debug(`Socket ${playerOne} left the game :(`);

  if (data.players[this.id]) {
    if (playerOne[this.id]) {
      this.broadcast.emit("user-disconnected", playerOne[this.id]);
    }
    startOver();
  }
  delete playerOne[this.id];
}

// Get final score for game
function finalScore() {
  return Object.entries(scoreboard).reduce((player, [key, value]) => {
    if (value >= 5) {
      player.push(key);
    }
    return player;
  }, []);
}

module.exports = function (socket) {
  io = this;
  debug(`Client ${socket.id} connected!`);
  socket.on("disconnect", handleUserDisconnect);
  socket.on("register-user", handleRegisterUser);
  socket.on("player-clicked-image", clickTime);
  socket.on("random-position", imagePosition);
};
