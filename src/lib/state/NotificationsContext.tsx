"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AppNotification, NotificationKind } from "@/lib/types";
import { readJSON, uid, writeJSON } from "@/lib/storage";

const KEY = "notifications_v1";

const Ctx = createContext<{
  items: AppNotification[];
  add: (kind: NotificationKind, title: string, description?: string) => void;
  clearAll: () => void;
  markAllRead: () => void;
  unreadCount: number;
} | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>(
    () => readJSON<AppNotification[]>(KEY, []),
  );

  useEffect(() => writeJSON(KEY, items), [items]);

  const add = useCallback(
    (kind: NotificationKind, title: string, description?: string) => {
      setItems((prev) =>
        [
          { id: uid("n"), kind, title, description, createdAt: Date.now(), read: false },
          ...prev,
        ].slice(0, 50),
      );
    },
    [],
  );

  const clearAll = useCallback(() => setItems([]), []);

  const markAllRead = useCallback(
    () => setItems((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <Ctx.Provider value={{ items, add, clearAll, markAllRead, unreadCount }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications outside provider");
  return ctx;
}