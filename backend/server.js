require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const Message = require("./models/Message"); // <-- import this
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Connect to DB
connectDB();

// Middleware
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);
app.use('/api/messages', messageRoutes);

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for a "join_chat_room" event to add users to a specific room
  socket.on("join_chat_room", (roomId) => {
    socket.join(roomId);  // Join a specific chat room (e.g., roomId could be a project or team)
    console.log(`User ${socket.id} joined chat room ${roomId}`);
  });

  // Listen for chat messages and broadcast to the appropriate room
  socket.on("send_message", async(messageData) => {
    try {
      // Save the message
      const newMessage = new Message(messageData);
      await newMessage.save();
  
      // Broadcast to everyone in the room
      io.to(messageData.conversationId).emit("receive_message", {
        ...messageData,
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
      });
      io.emit("receive_message", {
        ...messageData,
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
      });
      console.log("Sent message to room:", messageData.roomId);
    } catch (error) {
      console.error("Error saving message", error);
    }
  });
  // Listen for disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('PORT:', PORT);
