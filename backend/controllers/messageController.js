const Message = require("../models/Message");

// GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("sender", "name email");

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// POST /api/messages
const sendMessage = async (req, res) => {
  const { conversationId, content } = req.body;
  const senderId = req.user?.id || req.body.sender; // fallback if no auth middleware

  try {
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      content,
    });

    const savedMessage = await newMessage.save();
    const populated = await savedMessage.populate("sender", "name email");

    // Optional: Broadcast via Socket.IO
    req.io.to(conversationId).emit("receive_message", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
