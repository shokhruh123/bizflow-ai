export type SourceChannel = "telegram" | "whatsapp" | "voice" | "manual";
export type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered";
export const ORDER_STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];
export type Currency = "UZS" | "USD";

export interface OrderItem {
  product: string;
  quantity: number;
  unitPriceUZS: number;
  lineTotalUZS: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  workspaceId: string;
  customerName: string;
  phone: string;
  location: string;
  items: OrderItem[];
  totalUZS: number;
  source: SourceChannel;
  status: OrderStatus;
  confidence: number;
  rawText: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  priceUZS: number;
  unit: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: "personal" | "company";
  role: "owner" | "admin" | "member";
}

export type NotificationKind = "success" | "error" | "info" | "billing";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description?: string;
  createdAt: number;
  read: boolean;
}

export interface Plan {
  id: "starter" | "growth" | "scale";
  priceUZS: number;
  priceUSD: number;
  orders: { uzs: number; usd: number };
}

export interface LlmParseShape {
  customerName?: string;
  phone?: string;
  location?: string;
  items?: { product?: string; quantity?: number; unitPriceUZS?: number }[];
  source?: SourceChannel;
  confidence?: number;
}

export const PARSER_STEPS: string[] = [
  "Analiz qilish",
  "Mahsulot va miqdorlar",
  "Yetkazib berish manzili",
  "Aloqa raqami",
  "Hisob-kitob",
];