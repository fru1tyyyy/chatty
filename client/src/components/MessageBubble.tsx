import type { Message } from "../types";
import { format } from "date-fns";
import styles from "./MessageBubble.module.css";

interface Props {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: Props) {
  return (
    <div className={`${styles.wrapper} ${isMine ? styles.mine : styles.theirs}`}>
      {!isMine && (
        <div className={styles.avatar}>{message.sender.username[0].toUpperCase()}</div>
      )}
      <div className={styles.bubble}>
        {!isMine && <p className={styles.sender}>{message.sender.username}</p>}
        <p className={styles.content}>{message.content}</p>
        <span className={styles.time}>{format(new Date(message.createdAt), "HH:mm")}</span>
      </div>
    </div>
  );
}
