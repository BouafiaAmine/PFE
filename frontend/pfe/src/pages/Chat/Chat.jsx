import React, { useState } from "react";
import UserList from "../../components/UserList";
import ChatWindow from "../../components/ChatWindow";

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="flex h-[90vh]">
      <UserList onSelectConversation={setSelectedConversation} currentConversation={selectedConversation} />
      {selectedConversation ? (
      <ChatWindow currentConversation={selectedConversation} />

      ) : (
        <div className="w-2/3 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default Chat;
