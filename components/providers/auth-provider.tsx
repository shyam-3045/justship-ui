"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useGetMe } from "@/hooks/customHooks/auth";
import { toastSuccess } from "@/utils/toast";

type AuthUser = {
  name: string;
  avatarUrl: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  loginWithGitHub: () => void;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetMe();

  const user: AuthUser | null = data
    ? {
        name: data.name,
        avatarUrl: data.avatarUrl,
      }
    : null;

  const loginWithGitHub = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
  }, []);

  const loginWithGoogle = useCallback(() => {
    toastSuccess("Google login not implemented yet");
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        withCredentials: true,
      });

      queryClient.setQueryData(["me"], null);
      await queryClient.invalidateQueries({ queryKey: ["me"] });

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [queryClient, router]);

  const value = useMemo(
    () => ({
      user,
      loading: isLoading,
      loginWithGitHub,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, loginWithGitHub, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
