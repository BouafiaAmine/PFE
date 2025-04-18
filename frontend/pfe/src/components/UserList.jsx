import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { UserContext } from "../context/UserContext";
import { OnlineStatusContext } from "../context/OnlineStatusContext";

const UserList = ({ onSelectConversation, currentConversation }) => {
  const { user } = useContext(UserContext);
  const { onlineUsers } = useContext(OnlineStatusContext);

  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchConversationsAndUsers();
  }, []);

  const fetchConversationsAndUsers = async () => {
    try {
      const [convRes, usersRes] = await Promise.all([
        axiosInstance.get("/api/chat"),
        axiosInstance.get("/api/users/all"),
      ]);

      setConversations(convRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error("Error loading chat data:", err);
    }
  };

  // Map of userId -> existing conversation
  const conversationMap = {};
  conversations.forEach((conv) => {
    const otherUser = conv.members.find((m) => m._id !== user._id);
    if (otherUser) conversationMap[otherUser._id] = conv;
  });

  // List to display: all users (with or without conversation)
  const displayList = allUsers.map((u) => ({
    user: u,
    conversation: conversationMap[u._id] || null,
  }));

  const handleUserClick = async (u, existingConversation) => {
    if (existingConversation) {
      onSelectConversation(existingConversation);
    } else {
      try {
        const res = await axiosInstance.post("/api/chat/access", {
          userId: u._id,
        });

        onSelectConversation(res.data);
        // Optional: refresh conversations list
        fetchConversationsAndUsers();
      } catch (err) {
        console.error("Failed to access or create chat:", err);
      }
    }
  };

  return (
    <div className="w-1/3 bg-gray-100 h-full overflow-y-auto p-4">
      <h2 className="text-lg font-bold mb-4">Chats</h2>

      {displayList.map(({ user: u, conversation }) => {
        const isOnline = onlineUsers.includes(u._id);
        const isActive = currentConversation?.members?.some(
          (m) => m._id === u._id
        );

        return (
          <div
            key={u._id}
            onClick={() => handleUserClick(u, conversation)}
            className={`p-2 cursor-pointer rounded hover:bg-blue-200 ${
              isActive ? "bg-blue-100" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{u.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
