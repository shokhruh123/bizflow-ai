import { NextResponse } from "next/server";

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export const ok = (data: Record<string, unknown> = {}) => json({ ok: true, ...data });
export const fail = (code: string, status = 400, extra: Record<string, unknown> = {}) =>
  json({ ok: false, code, ...extra }, status);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;