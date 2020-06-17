const socket = io();

const startEl = document.querySelector("#start");
const gameWrapperEl = document.querySelector("#game-wrapper");
const playernameForm = document.querySelector("#playername-form");
const image = document.querySelector("#image");
const playGround = document.querySelector("#playground");
const startGame = document.querySelector("#startGame");
const showScore = document.querySelector("#showScore");
const loading = document.querySelector("#loading");
const disconnected = document.querySelector("#disconnected");
const gameOver = document.querySelector("#gameOver");

let playername = null;
let setTime = null;

let data = {
  id: null,
};

// Update players
const updatePlayers = (users) => {
  document.querySelector("#online-players").innerHTML = users
    .map((user) => `<li class="user">${user}</li>`)
    .join("");
};

// Update scoreboard
const updateScoreBoard = (scoreboard) => {
  document.querySelector("#showScore").innerHTML = Object.entries(scoreboard)
    .map(([key, value]) => {
      console.log(`${key}: ${value}`);
      return `<li class="list-item users">${key}: ${value}</li>`;
    })
    .join("");
};

// Get "playground"  where image can "move" around and "rules".
function getPlayGround() {
  const playgroundHeight = playGround.offsetHeight;
  const playgroundWidth = playGround.offsetWidth;

  const y = playgroundHeight;
  const x = playgroundWidth;

  const playgroundDimensions = { y, x };
  socket.emit("random-position", playgroundDimensions);
}

// Output random position for the image
const randomPosition = (y, x, delay) => {
  image.style.display = "inline";
  image.style.top = y + "px";
  image.style.left = x + "px";

  setTimeout(() => {
    image.classList.remove("hide"), (setTime = Date.now());
  }, delay);
};

// Audio when clicking the image
image.addEventListener("click", function play() {
  var audio = document.querySelector("#audio");
  audio.play();
});

// the player clicked on image
image.addEventListener("click", (e) => {
  let playerClicked = Date.now();
  reactiontime = playerClicked - setTime;
  socket.emit("user-click", playername);

  let data = {
    id: socket.id,
    reactiontime,
  };

  socket.emit("player-clicked-image", data);
  image.classList.add("hide");
});

// Get username form and emit "register-user" event to the server
playernameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  playername = document.querySelector("#username").value;
  socket.emit("register-user", playername, (status) => {
    if (status.joinGame) {
      startEl.classList.add("hide");
      loading.classList.remove("hide");

      updatePlayers(status.onlineUsers);
    }
  });
});

// Player disconnected/exited from the game
const playerDisconnected = () => {
  disconnected.classList.remove("hide");
  gameWrapperEl.classList.add("hide");
  gameOver.classList.add("hide");
};

// show the winner and show it
function getGameOver(scoreboard) {
  document.querySelector("#result").innerHTML = Object.entries(scoreboard)
    .map(([key, value]) => {
      return `<li class="list-item players">${key}: ${value}</li>`;
    })
    .join("");

  gameOver.classList.remove("hide");
  gameWrapperEl.classList.add("hide");
}

// Get players online
const handleUpdateUsers = (users) => {
  document.querySelector("#online-players").innerHTML = users
    .map((user) => `<li id="online-players">${user}</li>`)
    .join("");
};

// socket.on
socket.on("online-players", (users) => {
  updatePlayers(users);
});

socket.on("online-users", (users) => {
  handleUpdateUsers(users);
});

const getPlayers = () => {
  loading.classList.add("hide");
  gameWrapperEl.classList.remove("hide");
};

socket.on("reconnect", () => {
  if (playername) {
    socket.emit("register-user", playername, () => {});
  }
});

socket.on("user-disconnected", (playername) => {
  playerDisconnected(playername);
});

socket.on("show-game", getPlayers);
socket.on("update-score", updateScoreBoard);
socket.on("random-position", randomPosition);
socket.on("get-playground", getPlayGround);
socket.on("game-over", getGameOver);
