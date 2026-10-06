"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandMenu } from "./CommandMenu";
import { TrialBanner } from "./TrialBanner";
import { SubscriptionGate } from "./SubscriptionGate";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <TrialBanner />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
          <SubscriptionGate>{children}</SubscriptionGate>
        </main>
        <footer className="px-4 py-4 text-xs text-zinc-400 sm:px-6 lg:px-10 dark:text-zinc-600">
          © {new Date().getFullYear()} Bizflow
        </footer>
      </div>
      <CommandMenu />
    </div>
  );
}