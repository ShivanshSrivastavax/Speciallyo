import { create } from "zustand";
import api from "../services/api";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("lovelink_user") || "null"),
  token: localStorage.getItem("lovelink_token") || null,
  isAuthenticated: !!localStorage.getItem("lovelink_token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("lovelink_token", token);
      localStorage.setItem("lovelink_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Login failed. Please check your credentials.";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/auth/register", { name, email, password });
      const { token, user } = response.data;
      localStorage.setItem("lovelink_token", token);
      localStorage.setItem("lovelink_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Registration failed. Please try again.";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem("lovelink_token");
    localStorage.removeItem("lovelink_user");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("lovelink_token");
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    try {
      const response = await api.get("/api/auth/me");
      const { user } = response.data;
      localStorage.setItem("lovelink_user", JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem("lovelink_token");
      localStorage.removeItem("lovelink_user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
