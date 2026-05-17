import { create } from "zustand";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
