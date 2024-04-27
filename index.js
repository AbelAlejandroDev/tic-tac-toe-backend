// server express
const Server = require('./models/server')

// establecemos  .env
require("dotenv").config()

// inicializamos el server 
const server = new Server()

// iniciamos el server
server.execute()


