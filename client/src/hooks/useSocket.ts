import { useEffect } from "react";
import { getSocket, disconnectSocket } from "../lib/socket";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import type { Message } from "../types";

export const useSocket = () => {
  const { token } = useAuthStore();
  const { addMessage, updateConversationLastMessage, setTyping, setUserOnline } = useChatStore();

  useEffect(() => {
    if (!token) return;

    const socket = getSocket();

    socket.on("connect", () => console.log("🔌 Socket connected"));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));

    socket.on("message:new", (message: Message) => {
      addMessage(message);
      updateConversationLastMessage(message.conversation, message);
    });

    socket.on("typing:start", ({ userId, username, conversationId }: { userId: string; username: string; conversationId: string }) => {
      setTyping(conversationId, userId, username, true);
    });

    socket.on("typing:stop", ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTyping(conversationId, userId, "", false);
    });

    socket.on("user:status", ({ userId, status }: { userId: string; status: "online" | "offline" }) => {
      setUserOnline(userId, status);
    });

    return () => {
      socket.off("message:new");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("user:status");
    };
  }, [token]);

  useEffect(() => {
    return () => { disconnectSocket(); };
  }, []);
};
