const socket = io();

const startEl = document.querySelector("#start");
const gameWrapperEl = document.querySelector("#game-wrapper");
const playernameForm = document.querySelector("#playername-form");

//GAME CODE
const score = document.querySelector("#score");
const playGround = document.querySelector("#playground");
const startGame = document.querySelector("#startGame");
const showScore = document.querySelector("#showScore");

let scorePlayer = 0;

let player = { score: 0 };
startGame.addEventListener("click", function () {
  startGame.style.display = "none";
  let ranTime = Math.random() * 2000 + 1000;
  setTimeout(makeItem, ranTime);
});

function makeItem() {
  let boundary = playGround.getBoundingClientRect();
  console.log(boundary);
  let div = document.createElement("div");
  let ul = document.createElement("ul");
  div.style.position = "absolute";
  div.style.left = Math.random() * boundary.width + "px";
  div.style.top = Math.random() * boundary.height + "px";
  div.style.width = Math.random() * 10 + 40 + "px";
  div.style.height = Math.random() * 10 + 40 + "px";
  div.style.borderRadius = "10%";
  div.style.cursor = "pointer";
  div.style.backgroundColor = "#" + Math.random().toString(16).substr(-6);
  ul.startTime = Date.now();
  div.addEventListener("click", function () {
    let endTime = Date.now();
    let diff = (endTime - ul.startTime) / 1000;
    score.innerHTML = `${username}: ` + diff + "seconds";
    // startGame.style.display = "block";
    clearTimeout(ul.timer);
    makeItem();
    playGround.removeChild(div);
  });
  div.addEventListener("click", function () {
    scorePlayer++;
    showScore.innerHTML = `${username}` + " score: " + scorePlayer;
  });
  div.addEventListener("click", function play() {
    let audio = document.getElementById("audio");
    audio.play();
  });
  div.timer = setTimeout(function () {
    playGround.removeChild(div);
    makeItem();
  }, 1500);
  playGround.appendChild(div);
  console.log(div);
}

//Functionality for players
let username = null;

const updateOnlinePlayers = (users) => {
  document.querySelector("#online-players").innerHTML = users
    .map((user) => `<li class="user">${user}</li>`)
    .join("");
};

// get username from form and emit `register-user`-event to server
playernameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  username = document.querySelector("#username").value;
  socket.emit("register-user", username, (status) => {
    console.log("Server acknowledged the registration", status);

    if (status.joinChat) {
      startEl.classList.add("hide");
      gameWrapperEl.classList.remove("hide");

      updateOnlinePlayers(status.onlineUsers);
    }
  });
});

socket.on("reconnect", () => {
  if (username) {
    socket.emit("register-user", username, () => {
      console.log("The server acknowledged our reconnect.");
    });
  }
});

socket.on("online-players", (users) => {
  updateOnlinePlayers(users);
});

// Particles
var count_particles, stats, update;
stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = "absolute";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";
document.body.appendChild(stats.domElement);

update = function () {
  stats.begin();
  stats.end();
  if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
    count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
  }
  requestAnimationFrame(update);
};
requestAnimationFrame(update);
