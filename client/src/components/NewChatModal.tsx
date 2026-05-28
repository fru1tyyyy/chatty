import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import { getSocket } from "../lib/socket";
import type { User } from "../types";
import { X, Search } from "lucide-react";
import styles from "./NewChatModal.module.css";

interface Props {
  onClose: () => void;
}

export default function NewChatModal({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchUsers, startConversation, setActiveConversation, fetchMessages } = useChatStore();

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const users = await searchUsers(q);
    setResults(users);
    setLoading(false);
  };

  const handleSelect = async (user: User) => {
    const conv = await startConversation(user._id);
    getSocket().emit("conversation:join", conv._id);
    setActiveConversation(conv);
    fetchMessages(conv._id);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>New Chat</h2>
          <button className={styles.close} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.input}
            placeholder="Search by username or email…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className={styles.results}>
          {loading && <p className={styles.hint}>Searching…</p>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className={styles.hint}>No users found</p>
          )}
          {results.map((u) => (
            <div key={u._id} className={styles.userItem} onClick={() => handleSelect(u)}>
              <div className={styles.avatar}>{u.username[0].toUpperCase()}</div>
              <div>
                <p className={styles.uname}>{u.username}</p>
                <p className={styles.email}>{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}