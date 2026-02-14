const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io"); //socket server---constructor function

const app = express();
app.use(express.json());
app.use(cors());

//creating server
const server = http.createServer(app); //http server

const io = new Server(server, {
  cors: {
    origin: "*", //allowed to all anyone can send message
    methods: ["GET", "POST"], //method allowed
  },
});

// ==========================================
// Socket.io Events
// ==========================================

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined ${room}`);
  });

  // Listen for new bookings from Next.js
  socket.on("new_booking", (customerData) => {
    console.log("New booking:", customerData);
    // Broadcast to all connected dashboards
    io.emit("customer_added", customerData);
  });

  //data has the message and the receiver information
  socket.on("send_message", (data) => {
    //getting the info of room from data then broadcasts the same event with a new event and same message
    // Broadcast to EVERYONE in the room (including sender)
    console.log("mesg", data);
    io.to(data.roomId).emit("receive_message", data);
  });

  socket.on("typing", ({ userName, room }) => {
    socket.to(room).emit("user_typing", userName);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected : `, socket.id);
  });
});

// ==========================================
// HTTP API Endpoints (for Next.js to call)
// ==========================================
app.post("/emit-booking", async (req, res) => {
  try {
    const customerData = req.body;
    if (!customerData.userId) {
      return res
        .status(500)
        .send({ success: false, message: "Invalid id required" });
    }
    // Step 3: Log for debugging
    console.log("📢 Broadcasting new customer:", customerData);
    io.emit("customer_added", customerData);
    return res.json({
      success: true,
      message: "Broadcast Successful",
      clientCount: io.engine.clientsCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
