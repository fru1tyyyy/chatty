import { create } from "zustand";
import type { Conversation, Message, User } from "../types";
import api from "../lib/api";

interface TypingState {
  [conversationId: string]: { userId: string; username: string }[];
}

interface ChatStore {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  typing: TypingState;
  onlineUsers: Set<string>;

  fetchConversations: () => Promise<void>;
  setActiveConversation: (conv: Conversation | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
  setTyping: (conversationId: string, userId: string, username: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, status: "online" | "offline") => void;
  startConversation: (participantId: string) => Promise<Conversation>;
  searchUsers: (q: string) => Promise<User[]>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  typing: {},
  onlineUsers: new Set(),

  fetchConversations: async () => {
    const { data } = await api.get("/conversations");
    set({ conversations: data });
  },

  setActiveConversation: (conv) => {
    set({ activeConversation: conv, messages: [] });
  },

  fetchMessages: async (conversationId) => {
    const { data } = await api.get(`/messages/${conversationId}`);
    set({ messages: data });
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  updateConversationLastMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
            : c
        )
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
    }));
  },

  setTyping: (conversationId, userId, username, isTyping) => {
    set((state) => {
      const current = state.typing[conversationId] || [];
      const filtered = current.filter((t) => t.userId !== userId);
      return {
        typing: {
          ...state.typing,
          [conversationId]: isTyping ? [...filtered, { userId, username }] : filtered,
        },
      };
    });
  },

  setUserOnline: (userId, status) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      status === "online" ? next.add(userId) : next.delete(userId);
      return { onlineUsers: next };
    });
  },

  startConversation: async (participantId) => {
    const { data } = await api.post("/conversations", { participantId });
    set((state) => {
      const exists = state.conversations.find((c) => c._id === data._id);
      if (!exists) return { conversations: [data, ...state.conversations] };
      return {};
    });
    return data;
  },

  searchUsers: async (q) => {
    const { data } = await api.get(`/users/search?q=${q}`);
    return data;
  },
}));
