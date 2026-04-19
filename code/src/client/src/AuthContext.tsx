import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { setBasicAuth, clearAuth, admin } from "./api";

interface AuthUser { id: string; name: string; email: string; roles: string[]; isAdmin: boolean; }
interface AuthCtx { user: AuthUser | null; login(uid: string, pwd: string): Promise<void>; logout(): void; }

const AuthContext = createContext<AuthCtx>({ user: null, login: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("dlms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (uid: string, pwd: string) => {
    setBasicAuth(uid, pwd);
    // Validate credentials by hitting a protected endpoint
    const health = await admin.health();
    // If we get here the credentials are valid; build user from Basic auth uid
    const u: AuthUser = {
      id: uid,
      name: uid.charAt(0).toUpperCase() + uid.slice(1),
      email: `${uid}@test.com`,
      roles: uid === "admin" ? ["Admin", "Employee"] : ["Employee"],
      isAdmin: uid === "admin",
    };
    setUser(u);
    sessionStorage.setItem("dlms_user", JSON.stringify(u));
    sessionStorage.setItem("dlms_auth", btoa(`${uid}:${pwd}`));
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    sessionStorage.clear();
  }, []);

  // Restore auth header on page refresh
  React.useEffect(() => {
    const stored = sessionStorage.getItem("dlms_auth");
    if (stored) {
      const [uid, pwd] = atob(stored).split(":");
      setBasicAuth(uid, pwd);
    }
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
