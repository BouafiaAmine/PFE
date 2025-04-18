const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    name: { type: String }, // for group chat name
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
