"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface SessionUser {
  id: string;
  email: string;
  login: string;
  name: string;
}
type SessionState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated"; user: null };

const Ctx = createContext<{
  session: SessionState;
  signOut: () => void;
  refresh: () => void;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    status: "loading",
    user: null,
  });
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setSession({ status: "unauthenticated", user: null });
    window.location.href = "/login?expired=1";
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setSession({ status: "unauthenticated", user: null });
        return;
      }
      const data = await res.json();
      setSession({ status: "authenticated", user: data.user });
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
      if (typeof data.expiresAt === "number" && data.expiresAt > Date.now()) {
        sessionTimer.current = setTimeout(() => {
          void signOut();
        }, Math.max(1000, data.expiresAt - Date.now()));
      }
    } catch {
      setSession({ status: "unauthenticated", user: null });
    }
  }, [signOut]);

  useEffect(() => {
    refresh();
    return () => {
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
    };
  }, [refresh]);

  return (
    <Ctx.Provider value={{ session, signOut, refresh }}>{children}</Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession outside provider");
  return ctx;
}