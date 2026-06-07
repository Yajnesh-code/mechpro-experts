"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, saveAuthSession } from "@/lib/api";
import { backendRoleToPortalRole, clearSession, readSession, saveSession } from "@/lib/authStore";
import type { AuthSession, PortalRole } from "@/types/auth";

type LoginInput = {
  email: string;
  password: string;
  selectedRole: PortalRole;
  remember?: boolean;
};

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthSession>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const login = useCallback(async ({ email, password, selectedRole, remember }: LoginInput) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) throw new Error("Email is required.");
    if (!password) throw new Error("Password is required.");

    const auth = await authApi.login({
      email: normalizedEmail,
      password,
      remember_me: remember,
    });
    const actualRole = backendRoleToPortalRole(auth.user.role);

    if (actualRole !== selectedRole) {
      throw new Error("Selected role does not match registered account.");
    }

    saveAuthSession(auth);
    const sessionFromApi: AuthSession = {
      user: {
        id: auth.user.id,
        email: auth.user.email,
        role: actualRole,
        name: auth.user.contact_person,
        phone: auth.user.phone,
        company: auth.user.company_name,
        city: auth.user.city,
        token: auth.access_token,
      },
      token: auth.access_token,
      role: actualRole,
    };
    saveSession(sessionFromApi);
    setSession(sessionFromApi);
    return sessionFromApi;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      ready,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [login, logout, ready, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
