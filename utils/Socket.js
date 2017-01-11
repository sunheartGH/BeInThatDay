const socket = require("socket.io");
const Cryptos = require("./Cryptos.js");
const {User} = require('../models');

//user id作为键
let sockets = {};
exports.init = function (http) {
  let io;
  io = socket(http);
  io.use(function(socket, next){
    let handshakeData = socket.request;
    if (handshakeData && handshakeData.token) {
      let pl = Cryptos.parseToken(token);
      if (pl && pl.aud) {
        sockets[pl.aud] = socket;
        socket.on('disconnect', function () {
          delete sockets[pl.aud];
        })
        return next();
      }
    }
    next(new Error('Authentication error'));
  });
}

exports.sendMessage = function(id, message) {
  if (id && message) {
    id = id.toString();
    if (sockets[id]) {
      try {
        sockets[id].emit("message", message);
      } catch (e) {
        console.log("[socket sendMessage]");
        console.log(e);
        console.log(e.stack);
      }
    }
  }
}
