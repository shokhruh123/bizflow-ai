"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readJSON, writeJSON } from "@/lib/storage";
import { PLANS, TRIAL_DAYS, VIP_EMAIL, type PlanId } from "@/lib/plans";
import { useSession } from "@/lib/state/SessionContext";

type EntitlementStatus = "vip" | "paid" | "trial" | "new" | "expired";

interface EntState {
  plan: PlanId | null;
  trialStart: number | null;
  cardBound: boolean;
}

const DEFAULT_STATE: EntState = { plan: null, trialStart: null, cardBound: false };

const Ctx = createContext<{
  plan: PlanId | null;
  planLabel: string | null;
  status: EntitlementStatus;
  vip: boolean;
  blocked: boolean;
  trialDaysLeft: number;
  cardBound: boolean;
  startTrial: () => void;
  applyPlan: (id: PlanId) => void;
  resetEntitlements: () => void;
} | null>(null);

function keyFor(userId: string): string {
  return `ent_${userId}`;
}

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const user = session.user;

  const [state, setState] = useState<EntState>(DEFAULT_STATE);
  const [loadedUser, setLoadedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setState(DEFAULT_STATE);
      setLoadedUser(null);
      return;
    }
    if (loadedUser !== user.id) {
      setLoadedUser(user.id);
      setState(readJSON(keyFor(user.id), DEFAULT_STATE));
    }
  }, [user, loadedUser]);

  useEffect(() => {
    if (!user || loadedUser !== user.id) return;
    writeJSON(keyFor(user.id), state);
  }, [user, state, loadedUser]);

  const startTrial = useCallback(() => {
    if (!user) return;
    setState((s) => ({
      ...s,
      plan: null,
      cardBound: true,
      trialStart: s.trialStart ?? Date.now(),
    }));
  }, [user]);

  const applyPlan = useCallback((id: PlanId) => {
    const plan = PLANS.find((p) => p.id === id);
    if (!plan) return;
    setState((s) => ({ ...s, plan: id, cardBound: true }));
  }, []);

  const resetEntitlements = useCallback(() => {
    if (!user) return;
    setState(DEFAULT_STATE);
  }, [user]);

  const entitlements = useMemo(() => {
    const vip = user?.email === VIP_EMAIL;
    if (!user) {
      return {
        plan: null,
        planLabel: null,
        status: "new" as EntitlementStatus,
        vip,
        blocked: false,
        trialDaysLeft: 0,
        cardBound: false,
      };
    }
    if (vip) {
      return {
        plan: null,
        planLabel: null,
        status: "vip" as EntitlementStatus,
        vip,
        blocked: false,
        trialDaysLeft: TRIAL_DAYS,
        cardBound: state.cardBound,
      };
    }
    if (state.plan) {
      const def = PLANS.find((p) => p.id === state.plan);
      return {
        plan: state.plan,
        planLabel: def ? `bill.plans.${def.id}` : null,
        status: "paid" as EntitlementStatus,
        vip,
        blocked: false,
        trialDaysLeft: 0,
        cardBound: true,
      };
    }
    if (state.trialStart) {
      const endsAt = state.trialStart + TRIAL_DAYS * 24 * 60 * 60 * 1000;
      const leftMs = endsAt - Date.now();
      if (leftMs > 0) {
        return {
          plan: null,
          planLabel: null,
          status: "trial" as EntitlementStatus,
          vip,
          blocked: false,
          trialDaysLeft: Math.ceil(leftMs / (24 * 60 * 60 * 1000)),
          cardBound: state.cardBound,
        };
      }
      // Trial expired and no paid plan → block.
      return {
        plan: null,
        planLabel: null,
        status: "expired" as EntitlementStatus,
        vip,
        blocked: true,
        trialDaysLeft: 0,
        cardBound: state.cardBound,
      };
    }
    // Authenticated but never started trial — allow use, prompt to bind card for trial.
    return {
      plan: null,
      planLabel: null,
      status: "new" as EntitlementStatus,
      vip,
      blocked: false,
      trialDaysLeft: TRIAL_DAYS,
      cardBound: false,
    };
  }, [user, state]);

  return (
    <Ctx.Provider
      value={{
        plan: entitlements.plan,
        planLabel: entitlements.planLabel,
        status: entitlements.status,
        vip: entitlements.vip,
        blocked: entitlements.blocked,
        trialDaysLeft: entitlements.trialDaysLeft,
        cardBound: entitlements.cardBound,
        startTrial,
        applyPlan,
        resetEntitlements,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useEntitlements() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEntitlements outside provider");
  return ctx;
}