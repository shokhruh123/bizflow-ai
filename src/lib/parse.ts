import { PRODUCTS } from "./mockData";
import type { Order, OrderItem, LlmParseShape, SourceChannel } from "./types";

const LOCATIONS: { match: RegExp; label: string }[] = [
  { match: /chorsu/i, label: "Chorsu bozori, Toshkent" },
  { match: /registon/i, label: "Registon, Samarqand" },
  { match: /bobur/i, label: "Bobur ko‘chasi, Andijon" },
  { match: /kuvasoy/i, label: "Qo‘vasoy, Farg‘ona" },
  { match: /tashkent|toshkent/i, label: "Toshkent" },
  { match: /samarkand|samarqand/i, label: "Samarqand" },
  { match: /bukhara|buxoro/i, label: "Buxoro" },
  { match: /andijan|andijon/i, label: "Andijon" },
  { match: /namangan/i, label: "Namangan" },
  { match: /fergana|farg'ona/i, label: "Farg‘ona" },
  { match: /nukus/i, label: "Nukus" },
  { match: /khiva|xiva/i, label: "Xiva" },
  { match: /termez/i, label: "Termiz" },
  { match: /almaty/i, label: "Olmaota, Qozog‘iston" },
  { match: /bishkek/i, label: "Bishkek, Qirg‘iziston" },
  { match: /dushanbe/i, label: "Dushanbe, Tojikiston" },
];

const LOCATOR_WORDS = /delivery|deliver|ship|send|достав|отправ|jo.?nat|manzil/i;
const PHONE_RE = /(\+?\d[\d\s()-]{8,17}\d)/;

function makeId(): string {
  return "BF-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
}

function makeInvoiceNumber(): string {
  const d = new Date();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${d.getFullYear()}-${seq}`;
}

export function findPhone(text: string): string | null {
  const m = text.match(PHONE_RE);
  if (!m) return null;
  const digits = m[1].replace(/[^\d+]/g, "");
  const bare = digits.replace(/\D/g, "");
  if (bare.length < 9) return null;
  if (bare.startsWith("998")) return "+" + bare;
  return digits;
}

export function findLocation(text: string): string | null {
  for (const loc of LOCATIONS) {
    if (loc.match.test(text)) return loc.label;
  }
  if (LOCATOR_WORDS.test(text)) return "Manzil ko‘rsatilmagan";
  return null;
}

function clampQty(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(n, 999);
}

export function findQuantityAround(text: string, name: string, idx: number): number {
  const before = text.slice(Math.max(0, idx - 40), idx);
  const after = text.slice(idx + name.length, idx + name.length + 40);
  const patterns = [
    /(\d+)\s*(?:x|×|pcs|pc|units?|pieces?|шт(?:ук)?|dona|paket|packets?|bags?|jars?|bottles?|bars?|cups?)?\s*(?:of\s+)?$/i,
    /^\s*(?:x|×|pcs|units?|pieces?|шт(?:ук)?|of|for)\s*(\d+)/i,
    /^\s*[-—]?\s*(\d+)\s*/i,
  ];
  for (const p of patterns) {
    const mb = before.match(p);
    if (mb) return clampQty(parseInt(mb[1], 10));
    const ma = after.match(p);
    if (ma) return clampQty(parseInt(ma[1], 10));
  }
  return 1;
}

const SIZE_UNIT_RE = /^(?:\d+(?:\.\d+)?(?:kg|g|l|ml|m|cm|lt|kgx)?|x)?$/i;

function nameCandidates(name: string): string[] {
  const tokens = name.split(" ").filter(Boolean);
  const words = tokens.filter((tk) => /[a-zа-яё]{3,}/i.test(tk) && !SIZE_UNIT_RE.test(tk));
  const candidates: string[] = [];
  const full = tokens.join(" ");
  if (full) candidates.push(full);
  const short = tokens.slice(0, 2).join(" ");
  if (short.length > 6 && short !== full) candidates.push(short);
  const noSize = words.join(" ");
  if (noSize && noSize !== short && noSize !== full) candidates.push(noSize);
  for (const w of words.slice(1)) {
    if (w.length >= 4 && !candidates.includes(w)) candidates.push(w);
  }
  return candidates;
}

export function findItems(text: string): OrderItem[] {
  const lower = text.toLowerCase();
  const items: OrderItem[] = [];
  const consumed: number[] = [];

  for (const p of PRODUCTS) {
    const candidates = nameCandidates(p.name.toLowerCase());
    let idx = -1;
    let matched = "";
    for (const c of candidates) {
      const at = lower.indexOf(c);
      if (at !== -1) {
        idx = at;
        matched = c;
        break;
      }
    }
    if (idx === -1) continue;
    if (consumed.some((c) => Math.abs(c - idx) < 5)) continue;
    consumed.push(idx);

    const quantity = findQuantityAround(text, matched, idx);
    items.push({
      product: p.name,
      quantity,
      unitPriceUZS: p.priceUZS,
      lineTotalUZS: quantity * p.priceUZS,
    });
  }
  return items;
}

export function detectSource(text: string): SourceChannel {
  const t = text.toLowerCase();
  if (/voice|voicenote|audio|dikt|voice note/.test(t)) return "voice";
  if (/whatsapp|wa\.me|\bwa\b/.test(t)) return "whatsapp";
  if (/telegram|tg|t\.me/.test(t)) return "telegram";
  if (/[а-яё]/.test(t) || /iltimos|kochasi|chorsu|manzil/i.test(t)) return "telegram";
  return "manual";
}

export function guessName(text: string, fallback: string): string {
  const m =
    text.match(/(?:my name is|i am|i'm|this is)\s+([A-Za-z][A-Za-z' -]{2,30})/i) ||
    text.match(/меня зовут\s+([А-Яа-яЁё -]{2,30})/i);
  if (m) return m[1].trim().split(/\s+/).slice(0, 2).join(" ");
  return fallback;
}

function scoreConfidence(input: {
  hasPhone: boolean;
  hasLocation: boolean;
  itemCount: number;
  textLength: number;
}): number {
  let score = 0.35;
  if (input.itemCount > 0) score += 0.28;
  if (input.itemCount > 1) score += 0.08;
  if (input.hasPhone) score += 0.14;
  if (input.hasLocation) score += 0.1;
  if (input.textLength > 45) score += 0.05;
  return Math.min(0.99, Math.round(score * 100) / 100);
}

export function parseOrder(rawText: string): Order {
  const text = rawText.trim();
  const items = findItems(text);
  const phone = findPhone(text);
  const location = findLocation(text);
  const source = detectSource(text);
  const totalUZS = items.reduce((s, i) => s + i.lineTotalUZS, 0);
  const name = guessName(text, location ? `Mijoz (${location})` : "Walk-in Customer");

  const confidence = scoreConfidence({
    hasPhone: !!phone,
    hasLocation: !!location,
    itemCount: items.length,
    textLength: text.length,
  });

  return {
    id: makeId(),
    invoiceNumber: makeInvoiceNumber(),
    workspaceId: "",
    customerName: name,
    phone: phone ?? "—",
    location: location ?? "—",
    items,
    totalUZS,
    source,
    status: items.length && phone && location ? "confirmed" : "processing",
    confidence,
    rawText: text,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeLlmShape(shape: LlmParseShape, rawText: string): Order {
  const base = parseOrder(rawText);
  const items: OrderItem[] =
    Array.isArray(shape.items) && shape.items.length
      ? shape.items.map((i) => {
          const catalog = PRODUCTS.find((p) =>
            p.name.toLowerCase().includes((i.product ?? "").toLowerCase()),
          );
          const unitPriceUZS =
            Number(i.unitPriceUZS) > 0 ? Number(i.unitPriceUZS) : catalog?.priceUZS ?? 0;
          const quantity = clampQty(Number(i.quantity) || 1);
          return {
            product: i.product ?? catalog?.name ?? "Maxsus tovar",
            quantity,
            unitPriceUZS,
            lineTotalUZS: quantity * unitPriceUZS,
          };
        })
      : base.items;

  const totalUZS = items.reduce((s, i) => s + i.lineTotalUZS, 0);
  return {
    ...base,
    customerName: shape.customerName?.trim() || base.customerName,
    phone: shape.phone?.trim() || base.phone,
    location: shape.location?.trim() || base.location,
    source: shape.source ?? base.source,
    items,
    totalUZS,
    confidence:
      typeof shape.confidence === "number"
        ? Math.min(0.99, Math.max(0.1, shape.confidence))
        : base.confidence,
    status: items.length && shape.phone && shape.location ? "confirmed" : "processing",
  };
}

export function detectIntent(text: string): "order" | "question" | "greeting" | "unknown" {
  const t = text.toLowerCase();
  if (/how much|сколько|narxi|цена|price|worth/.test(t)) return "question";
  if (/hi|hello|salom|assalomu|привет/.test(t) && t.length < 30) return "greeting";
  if (/send|deliver|buy|order|шлю|хочу|iltimos|jo.?nat|needs?/.test(t)) return "order";
  return "unknown";
}