import { useRef, useCallback } from "react";
import { getSocket } from "../lib/socket";

export const useTyping = (conversationId: string) => {
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback(() => {
    const socket = getSocket();
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing:start", { conversationId });
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing:stop", { conversationId });
    }, 2000);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      getSocket().emit("typing:stop", { conversationId });
    }
  }, [conversationId]);

  return { emitTyping, stopTyping };
};
