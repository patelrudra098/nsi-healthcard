import { create } from "zustand";
import type { User } from "@/lib/types";
import {
  clearAuthStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "@/lib/token";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (user: User, accessToken: string) => void;
  updateToken: (token: string) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setSession: (user, accessToken) => {
    setStoredUser(user);
    setAccessToken(accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  updateToken: (token) => {
    setAccessToken(token);
    set({ accessToken: token });
  },

  clearSession: () => {
    clearAuthStorage();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    const user = getStoredUser();
    const accessToken = getAccessToken();
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isHydrated: true,
    });
  },
}));
