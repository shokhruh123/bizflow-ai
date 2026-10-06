"use client";

import type { ReactNode } from "react";
import { I18nBootstrap } from "@/lib/app/i18n-bootstrap";
import { ThemeProvider, useTheme } from "@/lib/state/ThemeContext";
import { CurrencyProvider } from "@/lib/state/CurrencyContext";
import { WorkspacesProvider, useWorkspaces } from "@/lib/state/WorkspacesContext";
import { OrdersProvider } from "@/lib/state/OrdersContext";
import { NotificationsProvider } from "@/lib/state/NotificationsContext";
import { CommandMenuProvider } from "@/lib/state/CommandContext";
import { SessionProvider } from "@/lib/state/SessionContext";
import { EntitlementsProvider } from "@/lib/state/EntitlementsContext";

function Layers({ children }: { children: ReactNode }) {
  const { activeId } = useWorkspaces();
  return <OrdersProvider activeWorkspaceId={activeId}>{children}</OrdersProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nBootstrap>
      <SessionProvider>
        <EntitlementsProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <WorkspacesProvider>
                <NotificationsProvider>
                  <CommandMenuProvider>
                    <Layers>{children}</Layers>
                  </CommandMenuProvider>
                </NotificationsProvider>
              </WorkspacesProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </EntitlementsProvider>
      </SessionProvider>
    </I18nBootstrap>
  );
}

export { useTheme };
export { switchLocale } from "@/lib/app/i18n-bootstrap";