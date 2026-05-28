import { create } from "zustand";
import type { User } from "../types";
import api from "../lib/api";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    set({ token: data.token, user: data.user });
  },

  register: async (username, email, password) => {
    const { data } = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("token", data.token);
    set({ token: data.token, user: data.user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));