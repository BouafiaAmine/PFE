const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const { protect } = require("../middlewares/authMiddleware");

// Get or create a 1-on-1 chat
router.post("/access", protect, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if chat already exists
    let chat = await Conversation.findOne({
      isGroup: false,
      members: { $all: [req.user._id, userId], $size: 2 },
    }).populate("members", "name email");

    if (chat) return res.json(chat);

    // Otherwise, create new
    const newChat = await Conversation.create({
      members: [req.user._id, userId],
      isGroup: false,
    });

    const fullChat = await newChat.populate("members", "name email");
    res.status(201).json(fullChat);
  } catch (err) {
    console.error("Error in /access chat:", err);
    res.status(500).json({ message: "Error accessing chat", err });
  }
});


// Get all conversations of a user
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Conversation.find({
      members: { $in: [req.user._id] },
    }).populate("members", "name email");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chats", err });
  }
});

module.exports = router;
