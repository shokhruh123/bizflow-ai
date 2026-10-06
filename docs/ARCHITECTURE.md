# BizFlow AI — MVP Architecture & Tech Stack (Section 1)

**Startup Weekend Tashkent 2026 · 55-hour build · English**

---

## 1.1 Why this stack (decision matrix)

| Layer | Choice | Why for a 55-hour hackathon |
|---|---|---|
| Framework | **Next.js 15 (App Router, TypeScript, Turbopack)** | Single deployable unit on Vercel; server routes + static UI in one repo; fastest SSR/ISR for demo |
| UI | **React 19 + Tailwind CSS v4** | Utility-first → premium SaaS look with zero design time; dark/light via CSS `@custom-variant` |
| Icons | **lucide-react** | Crisp, tree-shaken, consistent visual language |
| Charts | **recharts** | Interactive Area/Bar/Pie with 4 lines of code; no lib conflicts with React 19 |
| Invoices | **jsPDF + jspdf-autotable** | 100% client-side PDF generation — no server, works offline in the demo room |
| AI Engine | **Deterministic Smart Local parser (default) + optional OpenAI-compatible LLM route** (`/api/parse`) | Zero-config demo that never fails live; real LLM plugged via env keys with automatic mock fallback |
| Data | **In-memory + seeded mock store** | No DB provisioning during the weekend; swap to Supabase/Postgres in week 2 |
| Auth / Channel APIs | Not in MVP (roadmap) | Telegram/WhatsApp webhooks simulated via the built-in Chat Simulator |

**Vercel-first deploy:** one command (`vercel`) → live judge URL in < 5 minutes (Section 5).

## 1.2 Core user flows

### Flow A — Dashboard overview (SMB owner)
Raw message arrives → AI parses → order hits CRM state → the Dashboard recomputes:
- 4 KPI cards: Revenue (30d), Orders Processed, AI Time Saved (hours), Avg Order Value.
- Area chart (revenue + order count, 30 days), channel-mix donut (Telegram/WhatsApp/Voice/Manual).
- Live "recent orders" table fed by `orders` state — chat orders captured during the demo appear instantly.
- Top movers (best sellers with progress bars).

### Flow B — Live AI Order Processing Playground (the demo moment)
1. Judge pastes a messy chat (or clicks a sample chip — EN / RU / UZ / voice transcript).
2. Clicks **Process with AI**.
3. Staged parsing animation runs (intent → items & quantities → address → contact → totals).
4. Structured result renders: items table, unit totals, customer/phone/location/channel, confidence bar, status.
5. **Download PDF invoice** (jsPDF) or **Preview** (branded HTML invoice modal) — also **Copy JSON** into any CRM.
6. Engine toggle: **Smart Local AI** (offline, never fails) ↔ **LLM API** (real model when `AI_API_KEY` set; auto-falls back).

### Flow C — Analytics & Customer Insights
- Revenue-by-weekday bars, channel revenue pie, avg AI confidence, hours saved, repeat-customer rate.
- Top products by revenue, VIP customer segmentation, AI operational-win summary.
- Every judgment: no manual bookkeeping → dashboards fill themselves.

## 1.3 Folder layout (this repo)

```
bizflow-ai/
├── package.json            Next 15 · React 19 · Tailwind v4 · lucide · recharts · jspdf
├── src/
│   ├── app/
│   │   ├── layout.tsx       Root layout + theme bootstrap (no FOUC)
│   │   ├── page.tsx         → renders <App/>
│   │   ├── globals.css      Design system: glass, gradients, grid, animations
│   │   └── api/parse/route.ts   LLM endpoint (env-key) → mock fallback
│   ├── lib/
│   │   ├── types.ts         Domain types + parser step definitions
│   │   ├── mockData.ts      Product catalog, sample chats, seeded 30-day series, seed orders
│   │   ├── parse.ts         Deterministic extraction: phone/location/items/quantity/source/confidence
│   │   └── invoice.ts       jsPDF invoice generator
│   └── components/
│       ├── App.tsx          Shell: sidebar, tabs, theme toggle, shared orders state
│       ├── Dashboard.tsx    Flow A
│       ├── Playground.tsx   Flow B (AI Order Converter)
│       ├── Analytics.tsx    Flow C
│       ├── ChatSimulator.tsx  Telegram/WhatsApp-style live trial (also feeds CRM)
│       ├── InvoiceModal.tsx  Branded invoice preview
│       └── ui.tsx           Card / Button / Badge / StatCard / ProgressBar / Field
└── docs/
    ├── ARCHITECTURE.md      (this file)
    ├── PITCH.md             Section 3 — 10-slide, 3-minute script
    ├── QNA.md               Section 4 — jury defense
    └── DEPLOY.md            Section 5 — Vercel/Netlify + local run
```

## 1.4 Week-2 production roadmap (honest scope note)
Supabase persistence + multi-tenant auth → Telegram/WhatsApp webhooks (community `grammY`/`whatsapp-web.js`) → voice-note transcription (Whisper API) → payments (Click/Payme/Uzum for UZ; Stripe for global) → role-based team access.