export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { askChat, type ChatTurn } from "@/lib/llm";

export async function POST(request: Request) {
  let body: { messages?: ChatTurn[]; lang?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const message = String(body.messages?.at(-1)?.content ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  const safe: ChatTurn[] = (body.messages ?? []).filter(
    (m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length <= 4000,
  );
  const lang = String(body.lang ?? "ru");

  const reply = await askChat(safe.length ? safe : [{ role: "user", content: message }], lang);

  return NextResponse.json({ ok: true, reply });
}