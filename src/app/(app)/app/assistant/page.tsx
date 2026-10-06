"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Send, User, Sparkles, ShieldAlert } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const QUICK = ["ai.quick1", "ai.quick2", "ai.quick3"];

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data?.reply ?? t("common.notFound") },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("common.notFound") }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("ai.title")}
          </h2>
          <Badge variant="info">
            <ShieldAlert className="h-3 w-3" strokeWidth={1.5} />
            {t("ai.guardrail")}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("ai.subtitle")}</p>
      </div>

      <Card className="flex h-[50vh] min-h-[360px] flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                  <Bot className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("ai.empty.title")}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{t("ai.empty.desc")}</p>
              </div>
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn("flex items-end gap-2", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                  <Bot className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
                )}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <User className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Bot className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-3.5 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {QUICK.map((k) => (
              <button
                key={k}
                onClick={() => send(t(k))}
                disabled={busy}
                className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
              >
                <Sparkles className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
                {t(k)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={t("ai.placeholder")}
              className="input-base h-10 flex-1 px-3 text-sm"
            />
            <Button onClick={() => send()} loading={busy} disabled={!input.trim()}>
              <Send className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </Card>

      <p className="text-center text-[11px] text-zinc-400">{t("ai.demoNote")}</p>
    </div>
  );
}