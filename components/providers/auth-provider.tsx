"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthUser = {
  name: string;
  avatarUrl: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loginWithGitHub: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
};

const USER_STORAGE_KEY = "justship-ui-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const persistedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!persistedUser) return;
    setUser(JSON.parse(persistedUser) as AuthUser);
  }, []);

  const loginWithGitHub = useCallback(() => {
    // Placeholder for real GitHub OAuth redirect/session handshake.
    const mockUser: AuthUser = {
      name: "shipped-dev",
      avatarUrl: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
    };
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const loginWithGoogle = useCallback(() => {
    // Placeholder for real Google OAuth redirect/session handshake.
    const mockUser: AuthUser = {
      name: "user",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user-avatar",
    };
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loginWithGitHub,
      loginWithGoogle,
      logout,
    }),
    [user, loginWithGitHub, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
