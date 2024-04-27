class Sockets {
  constructor(io) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    // escuchando event
    this.io.on("connection", (socket) => {
      socket.on("msg-client", (data) => {
        console.log(data);

        // emitiendo
        this.io.emit("msg-server", data);
      });
    });
  }
}

module.exports = Sockets