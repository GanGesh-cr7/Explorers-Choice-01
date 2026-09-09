"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchCurrentUser, loginUser, logoutUser, registerUser, type UserProfile } from "@/lib/auth";

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  country: string;
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
    const current = await loginUser({ email, password });
    setUser(current);
    await refresh();
  };

  const register = async (data: RegisterPayload) => {
    const current = await registerUser(data);
    setUser(current);
    await refresh();
  };

  const logout = async () => {
    await logoutUser();
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
