import React, { createContext, useEffect, useState } from "react";

import { useContext } from "react";
import { UserContext } from "./UserContext";
import { useSocket } from "../context/socket";
export const OnlineStatusContext = createContext();

export const OnlineStatusProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useContext(UserContext);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("userOnline", user._id);

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, [socket, user]);

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
