// Server Express
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("socket.io");

const Sockets = require("./sockes");

class Server {
  constructor() {
    (this.app = express()), (this.port = process.env.PORT);

    // Http
    this.server = http.createServer(this.app);

    // Configurmos socket
    this.io = socketio(this.server, {
      // config
    });
  }

  middlewares() {
    // this.app.use(
    //   cors({
    //     origin: "*",
    //     methods: ["GET", "POST"],
    //     allowedHeaders: "*",
    //     credentials: true,
    //   })
    // );

    // Parseamos el body
    this.app.use(express.json());
  }

  configSockets() {
    new Sockets(this.io);
  }

  execute() {
    // Inicializamos los middlewares
    this.middlewares();

    // Inicializamos los sockets
    this.configSockets();

    // Inicializamos el server
    this.server.listen(this.port, () => {
      console.log("Server corriendo en puerto:", this.port);
    });
  }
}

module.exports = Server;
