import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useTyping } from "../hooks/useTyping";
import { getSocket } from "../lib/socket";
import MessageBubble from "./MessageBubble";
import { Send } from "lucide-react";
import styles from "./ChatWindow.module.css";

export default function ChatWindow() {
  const { activeConversation, messages, typing, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { emitTyping, stopTyping } = useTyping(activeConversation!._id);

  const other = activeConversation!.participants.find((p) => p._id !== user?._id);
  const displayName = activeConversation!.isGroup ? activeConversation!.groupName : other?.username;
  const isOnline = other ? onlineUsers.has(other._id) : false;

  const typingUsers = typing[activeConversation!._id] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = text.trim();
    if (!content || !activeConversation) return;
    stopTyping();
    getSocket().emit("message:send", { conversationId: activeConversation._id, content });
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.headerAvatar}>{(displayName || "?")[0].toUpperCase()}</div>
        <div>
          <p className={styles.headerName}>{displayName}</p>
          <p className={styles.headerStatus}>
            {activeConversation!.isGroup
              ? `${activeConversation!.participants.length} members`
              : isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} isMine={msg.sender._id === user?._id} />
        ))}

        {typingUsers.length > 0 && (
          <div className={styles.typing}>
            <span className={styles.typingDots}>
              <span /><span /><span />
            </span>
            <span>{typingUsers[0].username} is typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputBar}>
        <textarea
          className={styles.input}
          placeholder="Message…"
          value={text}
          rows={1}
          onChange={(e) => { setText(e.target.value); emitTyping(); }}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!text.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
