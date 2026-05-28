import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import type { Conversation } from "../types";
import { formatDistanceToNow } from "date-fns";
import styles from "./ConversationItem.module.css";

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick }: Props) {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore();

  const other = conversation.participants.find((p) => p._id !== user?._id);
  const displayName = conversation.isGroup ? conversation.groupName : other?.username;
  const initial = (displayName || "?")[0].toUpperCase();
  const isOnline = other ? onlineUsers.has(other._id) : false;

  const lastMsg = conversation.lastMessage;
  const preview = lastMsg
    ? lastMsg.sender._id === user?._id
      ? `You: ${lastMsg.content}`
      : lastMsg.content
    : "No messages yet";

  return (
    <div className={`${styles.item} ${isActive ? styles.active : ""}`} onClick={onClick}>
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>{initial}</div>
        {!conversation.isGroup && (
          <span className={`${styles.dot} ${isOnline ? styles.online : styles.offline}`} />
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.row}>
          <span className={styles.name}>{displayName}</span>
          {conversation.lastMessageAt && (
            <span className={styles.time}>
              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
            </span>
          )}
        </div>
        <p className={styles.preview}>{preview}</p>
      </div>
    </div>
  );
}