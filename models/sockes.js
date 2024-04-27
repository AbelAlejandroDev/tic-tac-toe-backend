const { generateToken } = require("../utils/jwt");

class Sockets {
  constructor(io) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    // escuchando event
    this.io.on("connection", (socket) => {
      console.log("player connected");

      // Crear una sala
      socket.on("crear-partida", async () => {
        try {
          // Generamos el token
          const token = await generateToken();

          // Emitimos el token
          socket.emit("token-generado", token);

          //Unimos al jugador que creo la partida a la sala
          socket.join(token);

          // Contar el número de sockets en la sala ||DEV
          const roomInfo = this.io.sockets.adapter.rooms.get(token);
          const numPlayers = roomInfo ? roomInfo.size : 0;

          console.log(`Hay ${numPlayers} jugadores en la sala ${token}`);
        } catch (err) {
          console.log("Error al generar el token:", err);
        }
      });

      //   Unirse a una sala
      socket.on("unirse-partida", (code) => {
        socket.join(code);
        const roomInfo = this.io.sockets.adapter.rooms.get(code);

        // Contar el número de sockets en la sala
        const numPlayers = roomInfo ? roomInfo.size : 0;

        console.log(`Hay ${numPlayers} jugadores en la sala ${code}`);
      });

      socket.on("disconnect", () => {
        this.io.emit(console.log("player desconnected"));
      });
    });
  }
}

module.exports = Sockets;
