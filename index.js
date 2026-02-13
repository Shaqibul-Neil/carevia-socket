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
    origin: "*", //allowed to all anyone can send message
    methods: ["GET", "POST"], //method allowed
  },
});

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  //events
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined ${room}`);
  });
  //data has the message and the receiver information
  socket.on("send_message", (data) => {
    //getting the info of room from data then broadcasts the same event with a new event and same message
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", ({ userName, room }) => {
    socket.to(room).emit("user_typing", userName);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected : `, socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
