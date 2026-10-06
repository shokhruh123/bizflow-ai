export type PlanId = "starter" | "growth" | "scale" | "enterprise";

export interface PlanDef {
  id: PlanId;
  priceUZS: number;
  priceUSD: number;
  users: number | null; // null = unlimited
  ordersPerMonth: number | null; // null = unlimited
  features: string[]; // i18n keys under bill.feat
  popular?: boolean;
}

export const VIP_EMAIL = "shohruhuktamov@gmail.com";

/** Realistic monthly plans priced in UZS with USD equivalents (see USD_RATE). */
export const PLANS: PlanDef[] = [
  {
    id: "starter",
    priceUZS: 49_000,
    priceUSD: 4,
    users: 1,
    ordersPerMonth: 200,
    features: ["orders200", "invoices", "analytics"],
  },
  {
    id: "growth",
    priceUZS: 99_000,
    priceUSD: 8,
    users: 3,
    ordersPerMonth: 2_000,
    features: ["orders2k", "invoices", "reports", "team3"],
    popular: true,
  },
  {
    id: "scale",
    priceUZS: 199_000,
    priceUSD: 15,
    users: 10,
    ordersPerMonth: 5_000,
    features: ["orders5k", "invoices", "reports", "team10", "api"],
  },
  {
    id: "enterprise",
    priceUZS: 499_000,
    priceUSD: 39,
    users: null,
    ordersPerMonth: null,
    features: ["ordersU", "reports", "teamU", "api", "sla", "priority"],
  },
];

export const TRIAL_DAYS = 7;

export const UZS_PROVIDERS = ["payme", "click", "paynet"] as const;
export const USD_PROVIDERS = ["stripe", "googleplay"] as const;

export function providersForCurrency(currency: "UZS" | "USD"): readonly string[] {
  return currency === "UZS" ? UZS_PROVIDERS : USD_PROVIDERS;
}