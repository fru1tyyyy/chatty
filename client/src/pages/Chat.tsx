import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import EmptyState from "../components/EmptyState";
import styles from "./ChatPage.module.css";

export default function ChatPage() {
  const { fetchConversations, activeConversation } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {activeConversation ? <ChatWindow /> : <EmptyState />}
      </main>
    </div>
  );
}