import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ConversationItem from "./ConversationItem";
import NewChatModal from "./NewChatModal";
import { LogOut, Edit } from "lucide-react";
import { disconnectSocket } from "../lib/socket";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { conversations, activeConversation, setActiveConversation, fetchMessages } = useChatStore();
  const { user, logout } = useAuthStore();
  const [showNewChat, setShowNewChat] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate("/login");
  };

  const handleSelect = (conv: typeof conversations[0]) => {
    setActiveConversation(conv);
    fetchMessages(conv._id);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user?.username[0].toUpperCase()}</div>
          <span className={styles.username}>{user?.username}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.iconBtn} title="New chat" onClick={() => setShowNewChat(true)}>
            <Edit size={18} />
          </button>
          <button className={styles.iconBtn} title="Logout" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className={styles.search}>
        <input className={styles.searchInput} placeholder="Search conversations…" readOnly />
      </div>

      <div className={styles.list}>
        {conversations.length === 0 ? (
          <p className={styles.empty}>No conversations yet.<br />Start one!</p>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              isActive={activeConversation?._id === conv._id}
              onClick={() => handleSelect(conv)}
            />
          ))
        )}
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </aside>
  );
}
