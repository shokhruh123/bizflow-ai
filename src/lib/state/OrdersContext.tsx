"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { readJSON, writeJSON } from "@/lib/storage";

const KEY = "orders_v1";

const Ctx = createContext<{
  ordersByWorkspace: Record<string, Order[]>;
  activeOrders: Order[];
  createOrder: (order: Order) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  removeOrder: (id: string) => void;
  exportOrdersCsv: (orders: Order[]) => void;
} | null>(null);

export function OrdersProvider({
  activeWorkspaceId,
  children,
}: {
  activeWorkspaceId: string;
  children: ReactNode;
}) {
  const [ordersByWorkspace, setOrdersByWorkspace] = useState<
    Record<string, Order[]>
  >(() => readJSON(KEY, {}));

  useEffect(() => writeJSON(KEY, ordersByWorkspace), [ordersByWorkspace]);

  const activeOrders = useMemo(
    () => ordersByWorkspace[activeWorkspaceId] ?? [],
    [ordersByWorkspace, activeWorkspaceId],
  );

  const createOrder = useCallback(
    (order: Order) => {
      const next = order;
      setOrdersByWorkspace((map) => {
        const current = map[next.workspaceId] ?? [];
        return { ...map, [next.workspaceId]: [next, ...current].slice(0, 200) };
      });
      return next;
    },
    [],
  );

  const setStatus = useCallback((id: string, status: OrderStatus) => {
    setOrdersByWorkspace((map) => {
      const out: Record<string, Order[]> = {};
      for (const [ws, list] of Object.entries(map)) {
        out[ws] = list.map((o) => (o.id === id ? { ...o, status } : o));
      }
      return out;
    });
  }, []);

  const removeOrder = useCallback((id: string) => {
    setOrdersByWorkspace((map) => {
      const out: Record<string, Order[]> = {};
      for (const [ws, list] of Object.entries(map)) {
        out[ws] = list.filter((o) => o.id !== id);
      }
      return out;
    });
  }, []);

  const exportOrdersCsv = useCallback((orders: Order[]) => {
    const header = [
      "invoice",
      "customer",
      "phone",
      "location",
      "items",
      "total_uzs",
      "source",
      "status",
      "created_at",
    ];
    const rows = orders.map((o) => [
      o.invoiceNumber,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.phone,
      `"${o.location.replace(/"/g, '""')}"`,
      `"${o.items.map((i) => `${i.quantity}x ${i.product}`).join("; ")}"`,
      o.totalUZS,
      o.source,
      o.status,
      o.createdAt,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizflow-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Ctx.Provider
      value={{
        ordersByWorkspace,
        activeOrders,
        createOrder,
        setStatus,
        removeOrder,
        exportOrdersCsv,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrders outside provider");
  return ctx;
}