"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { token, setUser, logout } = useStore();

  useEffect(() => {
    async function loadMe() {
      if (token) {
        try {
          const user = await api.getMe();
          setUser(user);
        } catch (err) {
          logout();
        }
      }
    }
    loadMe();
  }, [token, setUser, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        {children}
        <Toaster position="bottom-right" />
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
