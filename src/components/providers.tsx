"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchCurrentUser, type UserProfile } from "@/lib/auth";

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone: string; country: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const current = await fetchCurrentUser();
    setUser(current);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const current = await fetchCurrentUser();
    if (current) return;
    // Call login which sets the cookie
    const response = await fetch((process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "") + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.detail ?? "Incorrect email or password.");
    setUser(body as UserProfile);
  };

  const register = async (data: { email: string; password: string; full_name: string; phone: string; country: string }) => {
    const response = await fetch((process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "") + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.detail ?? "We could not create your account. Please try again.");
    setUser(body as UserProfile);
  };

  const logout = async () => {
    await fetch((process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "") + "/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
