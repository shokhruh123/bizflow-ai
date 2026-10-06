"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell/AppShell";
import { useSession } from "@/lib/state/SessionContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const router = useRouter();
  const status = session.status;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?expired=1");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
          Loading…
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}