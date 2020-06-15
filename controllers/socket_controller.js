// SOCKET CONTROLLER

const debug = require("debug")("tap-the-whale:socket_controller");
const users = {};

// Get usernames of online users
function getOnlineUsers() {
  return Object.values(users);
}

// Handle user disconnecting
function handleUserDisconnect() {
  debug(`Socket ${this.id} left the game :(`);

  // broadcast to all connected sockets that this user has left the chat
  if (users[this.id]) {
    this.broadcast.emit("user-disconnected", users[this.id]);
  }

  // remove user from list of connected users
  delete users[this.id];
}

// Handle a new user connecting
function handleRegisterUser(username, callback) {
  debug("Player '%s' connected to the game", username);
  users[this.id] = username;
  callback({
    joinChat: true,
    usernameInUse: false,
    onlineUsers: getOnlineUsers(),
  });

  // broadcast to all connected sockets EXCEPT ourselves
  this.broadcast.emit("new-user-connected", username);

  // broadcast online users to all connected sockets EXCEPT ourselves
  this.broadcast.emit("online-users", getOnlineUsers());
}

module.exports = function (socket) {
  // this = io
  debug(`Client ${socket.id} connected!`);
  socket.on("disconnect", handleUserDisconnect);
  socket.on("register-user", handleRegisterUser);
};
