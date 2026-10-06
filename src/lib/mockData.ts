import type { Product, Workspace } from "./types";

/** Catalog prices are stored in UZS (so‘m) only. USD is a display conversion (USD_RATE). */
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Organic Honey 1kg", category: "Groceries", priceUZS: 109000, unit: "jar" },
  { id: "p2", name: "Green Tea 250g", category: "Groceries", priceUZS: 79000, unit: "pack" },
  { id: "p3", name: "Dried Apricots 500g", category: "Groceries", priceUZS: 65000, unit: "pack" },
  { id: "p4", name: "Basmati Rice 5kg", category: "Groceries", priceUZS: 128000, unit: "bag" },
  { id: "p5", name: "Sunflower Oil 1L", category: "Essentials", priceUZS: 58000, unit: "bottle" },
  { id: "p6", name: "Pistachio Chocolate 200g", category: "Gourmet", priceUZS: 88000, unit: "bar" },
  { id: "p7", name: "Desi Ghee 1kg", category: "Gourmet", priceUZS: 187000, unit: "jar" },
  { id: "p8", name: "Pomegranate Juice 1L", category: "Drinks", priceUZS: 51000, unit: "bottle" },
  { id: "p9", name: "Dried Figs 1kg", category: "Groceries", priceUZS: 134000, unit: "bag" },
  { id: "p10", name: "Premium Coffee 500g", category: "Gourmet", priceUZS: 232000, unit: "bag" },
];

export const SAMPLE_CHATS: {
  id: string;
  label: string;
  note: string;
  text: string;
}[] = [
  {
    id: "s1",
    label: "Klassik buyurtma",
    note: "O‘Z",
    text: "Assalomu alaykum! 5 jar Organic Honey, Chorsu bozoriga yetkazing. Tel: +998901234567",
  },
  {
    id: "s2",
    label: "Ovozli xabar",
    note: "UZ",
    text: "Iltimos 3 paket Green Tea va 2 dona Basmati Rice jonating. Manzil: Samarqand, Registon ko‘chasi 45. Tel: +998 93 456 78 90",
  },
  {
    id: "s3",
    label: "Ko‘p tovarlar",
    note: "EN",
    text: "Need 10 x Dried Apricots and 6 Pistachio Chocolate delivered to Andijan, Bobur street 12. WhatsApp me +998974445566",
  },
  {
    id: "s4",
    label: "Rus tili",
    note: "RU",
    text: "Сколько стоит Pomegranate Juice 1L? хочу 8 штук. Бухара, отель Марказий. Звоните +998652233445",
  },
  {
    id: "s5",
    label: "Katta buyurtma",
    note: "EN",
    text: "Reupping: send 12 Premium Coffee 500g bags, 4 Basmati Rice 5kg to Fergana, Kuvasoy. Call +998901234455",
  },
];

export const DEFAULT_WORKSPACES = [
  { id: "ws_personal", name: "personal", type: "personal", role: "owner" },
  { id: "ws_company", name: "Em Techno Logistics", type: "company", role: "admin" },
] satisfies Workspace[];