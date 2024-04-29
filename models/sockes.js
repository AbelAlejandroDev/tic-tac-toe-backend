const { generateToken } = require("../utils/jwt");

class Sockets {
  constructor(io) {
    this.io = io;
    this.game = new Map();
    this.socketEvents();
  }

  socketEvents() {
    // escuchando event
    this.io.on("connection", (socket) => {
      console.log("player connected");

      // Crear una sala
      socket.on("crear-partida", async (id) => {
        try {
          // Generamos el token
          const token = await generateToken();
          this.game.set(token, {
            players: [id],
            currentPlayer: id,
            squares: Array(9).fill(null),
          });
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
      socket.on("unirse-partida", ({ codeRoom, id }) => {
        const game = this.game.get(codeRoom);
        // Codigo incorrecto
        if (!game) {
          console.log("La sala no existe");
          return;
        }
        // Validar max players
        if (game.players.length >= 2)
          return console.log("Numero maximo de jugadores");

        socket.join(codeRoom);
        game.players.push(id);
        const players = game.players;
        this.io.to(codeRoom).emit("jugador-unido", { players, codeRoom });

        const roomInfo = this.io.sockets.adapter.rooms.get(codeRoom);
        const numPlayers = roomInfo ? roomInfo.size : 0;
        console.log(`Hay ${numPlayers} jugadores en la sala ${game}`);
      });

      // Movimiento del jugador
      socket.on("jugada", (data) => {
        const { code, squares, currentPlayer } = data;
        const game = this.game.get(code);

        if (!game || !game.players.includes(currentPlayer)) {
          console.log("Error: Jugador o juego no encontrado");
          return;
        }
        const currentPlayerIndex = game.players.indexOf(currentPlayer);
        const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        game.currentPlayer = game.players[nextPlayerIndex];

        this.io.to(code).emit("jugada", {
          squares: squares,
          currentPlayer: game.currentPlayer,
        });
      });
      // Revancha
      socket.on("revancha", ({ playerId, token }) => {
        const game = this.game.get(token);
        if (!game || !game.players.includes(playerId)) {
          console.log("Error: Jugador o juego no encontrado");
          return;
        }
        const opponentId = game.players.find((player) => player !== playerId);
        this.io.to(opponentId).emit("solicitud-revancha");
      });

      socket.on("respuesta-revancha", ({ playerId, token, accepted }) => {
        const game = this.game.get(token);
        if (!game || !game.players.includes(playerId)) {
          console.log("Error: Jugador o juego no encontrado");
          return;
        }
        // Emitimos si la petición fue rechazada
        const opponentId = game.players.find((player) => player !== playerId);
        this.io.to(opponentId).emit("respuesta-revancha", accepted);

        if (accepted) {
          // Si la revancha es aceptada, reiniciar el juego
          setTimeout(() => {
            game.squares = Array(9).fill(null);
            game.currentPlayer = game.players[0];
            this.io.to(token).emit("reinicio", {
              squares: game.squares,
              players: game.players,
            });
          }, 1500);
        } else {
          this.io.to(token).emit("abandono-partida");
          // eliminamos la sala
          this.game.delete(token);
          console.log(`La sala ${token} ha sido eliminada`);
        }
      });

      // socket.on("abandonar-partida", (code) => {
      //   const game = this.game.get(code);
      //   const index = game.players.indexOf(socket.id);
      //   if (index !== -1) {
      //     game.players.splice(index, 1);
      //     if (game.players.length === 0) {
      //       // Si ya no hay jugadores, eliminamos la partida
      //       this.game.delete(code);
      //     } else {
      //       // Notificamos al otro jugador que el oponente ha abandonado la partida
      //       this.io.to(code).emit("oponente-abandonado");
      //     }
      //   }
      // });

      socket.on("disconnect", () => {
        this.io.emit(console.log("player desconnected"));
      });
    });
  }
}

module.exports = Sockets;
