import { create } from "zustand";
import { neonApi } from "../services/neonApi";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("speciallyo_user") || localStorage.getItem("lovelink_user") || "null"),
  token: localStorage.getItem("speciallyo_token") || localStorage.getItem("lovelink_token") || null,
  isAuthenticated: !!(localStorage.getItem("speciallyo_token") || localStorage.getItem("lovelink_token")),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await neonApi.login(email, password);
      localStorage.setItem("speciallyo_token", token);
      localStorage.setItem("speciallyo_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.message || "Login failed. Please check your credentials.";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await neonApi.register(name, email, password);
      localStorage.setItem("speciallyo_token", token);
      localStorage.setItem("speciallyo_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = err.message || "Registration failed. Please try again.";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem("speciallyo_token");
    localStorage.removeItem("speciallyo_user");
    localStorage.removeItem("lovelink_token");
    localStorage.removeItem("lovelink_user");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem("speciallyo_token") || localStorage.getItem("lovelink_token");
    const storedUser = localStorage.getItem("speciallyo_user") || localStorage.getItem("lovelink_user");
    if (!token || !storedUser) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      set({ user, token, isAuthenticated: true });
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
