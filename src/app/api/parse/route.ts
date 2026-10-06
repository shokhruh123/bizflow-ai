export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { detectIntent, normalizeLlmShape, parseOrder } from "@/lib/parse";
import { askJson, extractJson, localReply, refusalForLang } from "@/lib/llm";
import type { LlmParseShape } from "@/lib/types";

const SYSTEM_PROMPT = `You are Bizflow AI, an order-extraction engine for small businesses.
Extract a structured order from the customer's raw message (English, Russian, or Uzbek).
Return STRICT JSON with this shape and nothing else:
{
  "customerName": string,
  "phone": international phone string or "",
  "location": delivery address or "",
  "items": [{"product": string, "quantity": number, "unitPriceUZS": number}],
  "source": "telegram" | "whatsapp" | "voice" | "manual",
  "confidence": number between 0 and 1,
  "intent": "order" | "other",
  "reply": string
}
Rules:
- Prices must be in UZS (so'm). Only include products explicitly requested.
- If the message contains a product request, a delivery location or a phone, set intent="order".
- If the message is NOT an order (a greeting, casual chat, or an unrelated subject), set intent="other",
  items=[] and put your answer in "reply" (short, friendly, business-related).
  For an off-topic subject use EXACTLY this reply: "${refusalForLang("ru")}"
- Never invent products that are not requested.`;

export async function POST(request: Request) {
  let body: { text?: string; workspaceId?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const text = String(body.text ?? "").trim();
  const lang = String(body.lang ?? "ru");
  if (!text) {
    return NextResponse.json({ error: "empty text" }, { status: 400 });
  }

  // Offline fast path: clearly not an order → assistant reply (no LLM needed).
  const intent = detectIntent(text);
  const isOther = intent !== "order";
  const hasLlm = Boolean(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
  if (!hasLlm && isOther) {
    const reply = localReply(text, lang);
    return NextResponse.json({
      ok: false,
      engine: "local",
      intent: "other",
      reply,
      order: { ...parseOrder(text), workspaceId: body.workspaceId ?? "" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      engine: "mock-fallback",
      order: { ...parseOrder(text), workspaceId: body.workspaceId ?? "" },
    });
  }

  try {
    const lm = await askJson(SYSTEM_PROMPT, text);
    if (!lm.ok) throw new Error(lm.error);
    const parsed = JSON.parse(extractJson(lm.content)) as LlmParseShape & {
      intent?: string;
      reply?: string;
    };

    const shapeIsOrder = parsed.intent === "order" || intent === "order";
    if (!shapeIsOrder) {
      return NextResponse.json({
        ok: true,
        engine: "llm",
        model: lm.model,
        intent: "other",
        reply: parsed.reply?.trim() || refusalForLang(lang),
        order: { ...parseOrder(text), workspaceId: body.workspaceId ?? "" },
      });
    }

    return NextResponse.json({
      ok: true,
      engine: "llm",
      model: lm.model,
      intent: "order",
      order: { ...normalizeLlmShape(parsed, text), workspaceId: body.workspaceId ?? "" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    // Non-order message + LLM unavailable/failed → still answer with the guardrail reply.
    if (!isOther) {
      return NextResponse.json({
        ok: false,
        engine: "mock-fallback",
        error: message,
        order: { ...parseOrder(text), workspaceId: body.workspaceId ?? "" },
      });
    }
    return NextResponse.json({
      ok: false,
      engine: "mock-fallback",
      error: message,
      intent: "other",
      reply: localReply(text, lang),
      order: { ...parseOrder(text), workspaceId: body.workspaceId ?? "" },
    });
  }
}