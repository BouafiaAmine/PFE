import React, { useContext, useEffect, useState, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import { UserContext } from "../context/UserContext";
import { useSocket } from "../context/socket";

const ChatWindow = ({ currentConversation }) => {
  const { user } = useContext(UserContext);
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // 🔁 Rejoindre la salle au changement de conversation
  useEffect(() => {
    if (socket && currentConversation?._id) {
      socket.emit("join_chat_room", currentConversation._id);
      console.log("Joined room:", currentConversation._id);
    }
  }, [socket, currentConversation]);

  // 📦 Charger les anciens messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation?._id) return;
      try {
        const res = await axiosInstance.get(
          `/api/messages/${currentConversation._id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [currentConversation]);

  // ✅ Attacher socket.on une seule fois
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      console.log("INCOMING MSG:", msg);
      // Vérifier si le message est pour la conversation active
      setMessages((prev) => {
        if (msg.conversationId === currentConversation?._id) {
          return [...prev, msg];
        }
        return prev;
      });
    };

    socket.on("receive_message", handleIncoming);
    return () => socket.off("receive_message", handleIncoming);
  }, [socket, currentConversation?._id]); // tu peux aussi mettre juste `[socket]`

  // 📤 Envoyer un message
  const handleSend = async () => {
    if (!newMessage.trim() || !currentConversation?._id) return;

    const messageData = {
      conversationId: currentConversation._id,
      content: newMessage.trim(),
    };

    try {
      const res = await axiosInstance.post("/api/messages", messageData);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");

      // 🔄 Émettre le message aux autres
      socket.emit("send_message", res.data);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // 📜 Scroll automatique
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentConversation?._id) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="w-2/3 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            ref={scrollRef}
            className={`mb-2 max-w-xs p-2 rounded-lg ${
              msg.sender?._id === user._id
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded p-2 mr-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
