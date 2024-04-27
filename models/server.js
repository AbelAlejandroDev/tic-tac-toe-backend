// Server Express
const express = require("express");
const http = require("http");

class Server {
  constructor() {
    (this.app = express()), (this.port = process.env.PORT);

    // Http
    this.server = http.createServer(this.app);
  }

  execute() {
    this.server.listen(this.port, () => {
      console.log("Server corriendo en puerto:", this.port);
    });
  }
}

module.exports = Server;
