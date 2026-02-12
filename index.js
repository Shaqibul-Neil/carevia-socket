const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io"); //socket server---constructor function

const app = express();
app.use(cors());

//creating server
const server = http.createServer(app); //http server

const io = new Server(server, {
  cors: {
    origin: "*", //allowed all anyone can send message
    methods: ["GET", "POST"], //method allowed
  },
});

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
