import { randomUUID } from "node:crypto";

export interface DemoUser {
  id: string;
  login: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  verified: boolean;
  createdAt: number;
}

interface OtpEntry {
  email: string;
  mode: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

/**
 * In-memory demo store. Single Node process → survives during `npm run dev`.
 * Swap for Supabase/Postgres in production (see ARCHITECTURE.md).
 */
const users = new Map<string, DemoUser>();
const otps = new Map<string, OtpEntry>();

export function getDemoUserByEmail(email: string): DemoUser | undefined {
  const key = email.trim().toLowerCase();
  return users.get(key);
}

export function getDemoUserById(id: string): DemoUser | undefined {
  for (const u of users.values()) if (u.id === id) return u;
  return undefined;
}

export async function createDemoUser(input: {
  login: string;
  email: string;
  passwordHash: string;
  salt: string;
}): Promise<DemoUser> {
  const email = input.email.trim().toLowerCase();
  const user: DemoUser = {
    id: randomUUID(),
    login: input.login.trim(),
    email,
    name: input.login.trim(),
    passwordHash: input.passwordHash,
    salt: input.salt,
    verified: false,
    createdAt: Date.now(),
  };
  users.set(email, user);
  return user;
}

export async function setUserVerified(email: string): Promise<void> {
  const user = getDemoUserByEmail(email);
  if (user) user.verified = true;
}

export async function updateDemoUser(
  id: string,
  patch: { name?: string; login?: string },
): Promise<DemoUser | undefined> {
  const user = getDemoUserById(id);
  if (!user) return undefined;
  if (typeof patch.name === "string" && patch.name.trim()) {
    user.name = patch.name.trim();
  }
  if (typeof patch.login === "string" && patch.login.trim()) {
    user.login = patch.login.trim();
  }
  return user;
}

export function upsertOtp(input: {
  email: string;
  mode: string;
  codeHash: string;
}): OtpEntry {
  const email = input.email.trim().toLowerCase();
  const entry: OtpEntry = {
    email,
    mode: input.mode,
    codeHash: input.codeHash,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  };
  otps.set(email, entry);
  return entry;
}

export function consumeOtp(email: string, codeHash: string): "ok" | "invalid" | "expired" | "locked" {
  const entry = otps.get(email.trim().toLowerCase());
  if (!entry) return "invalid";
  if (Date.now() > entry.expiresAt) return "expired";
  if (entry.attempts >= 5) return "locked";
  if (entry.codeHash !== codeHash) {
    entry.attempts += 1;
    return "invalid";
  }
  otps.delete(email.trim().toLowerCase());
  return "ok";
}

export function freshOtpNeeded(email: string, mode: string): boolean {
  const entry = otps.get(email.trim().toLowerCase());
  if (!entry || entry.mode !== mode) return true;
  return Date.now() > entry.expiresAt - 60_000;
}