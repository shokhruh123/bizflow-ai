# BizFlow AI — Deploy & Demo Guide (Section 5)

**Goal: get a live judge-testable URL in under 10 minutes, plus a bulletproof local demo.**

---

## 5.1 Prerequisites (one-time)
- A machine with **Node.js 20+** (project tested on Node 24).
- Accounts: **GitHub** + **Vercel** (fastest) — Netlify alternative at the end.

## 5.2 Local run (for rehearsal & offline-safe demo)
```powershell
cd C:\Users\WnlyPC\Downloads\bizflow-ai
npm.cmd install
npm.cmd run dev
```
Open http://localhost:3000 → the app loads fully (dark SaaS dashboard by default; toggle sun/moon in the header).

> **PowerShell note:** if `npm` itself errors about execution policy, use `npm.cmd` (works without policy change).

## 5.3 Optional: enable the real LLM engine
The app works 100% offline with **Smart Local AI**. To also test the live-LLM path:
```powershell
# PowerShell
$env:AI_API_KEY="sk-..."
$env:AI_MODEL="gpt-4o-mini"
npm.cmd run dev
```
No `.env` file is required for the demo. In Playground choose **"LLM API"** — if the key is missing, the UI automatically reports fallback to Smart Local AI (see QNA.md for cost math).

## 5.4 Deploy to Vercel (the single winning move — ~5 min)

**Option A — CLI (fastest from this machine):**
```powershell
cd C:\Users\WnlyPC\Downloads\bizflow-ai
npx vercel login          # browser login once
npx vercel --prod         # answers: existing? No → name: bizflow-ai → ...framework: Other
```
It builds `next build` inside Vercel, so **no lockfile/env needed locally**. CLI prints your live URL:
`https://bizflow-ai-xxxx.vercel.app`

**Option B — Git push → Vercel import:**
1. Push this folder to a new GitHub repo.
2. vercel.com → *Add New… → Project → Import* the repo → keep defaults → **Deploy**.
3. Vercel auto-detects Next.js; output appears in ~90 seconds with a fresh URL.
4. (Optional) *Settings → Environment Variables →* add `AI_API_KEY`, `AI_MODEL` → Redeploy.

**Live check right after deploy:**
- Open the URL → Dashboard renders.
- Go to **AI Order Converter** → click a sample → **Process with AI** → table + invoice PDF appear.
- Open **Live Chat Trial** → send any message → reply arrives, order hits the Dashboard tab.

## 5.5 Netlify (alternative, if judges insist)
- Netlify supports Next.js via its build preset (npx adapter). Steps: push to GitHub → netlify.com → *Add new site → Import from Git* → build command `npm run build`, output `.next` (Netlify preset handles it) → Deploy.
- The `/api/parse` route runs serverlessly on Netlify Functions automatically.
- Vercel is recommended: first-party Next.js support = fewer moving parts for the pitch.

## 5.6 5-minute demo-room checklist
- [ ] Confirm Vercel URL loads on **the room projector** (not just your laptop).
- [ ] Put **2 sample chats copy-pasted** (EN + RU/UZ) on a sticky note — in case fill-in by clicking is seen as "scripted".
- [ ] Volume/audio only needed if demoing voice; default samples include a "Voice note" tag that still works as text (no mic dependency in the demo room).
- [ ] Rehearse: fill sample → Process → (watch pipeline) → Download PDF → open Live Chat → send message → jump to Dashboard. Total: 60 seconds.
- [ ] Open **theme toggle** to show light mode = fully responsive & polished on two themes.
- [ ] Keep **this docs/DEPLOY.md** in the repo — judges love a redeploy-ready team.

## 5.7 Troubleshooting
| Symptom | Fix |
|---|---|
| `npm` not recognized / policy error | use `npm.cmd` |
| Port 3000 busy | `npm.cmd run dev -- --port 3001` |
| LLM API shows "no API key" hint | that is by design — Smart Local AI is active |
| Chart blank in dark mode | toggle theme once — charts use theme-aware tooltip grids |
| Vercel build fails first time | check you pushed `package-lock.json`; redeploy after 10s (transient registry flakiness) |

## 5.8 After the pitch — 7-day keep-it-alive plan
1. Add **Supabase** persistence & simple magic-link auth.
2. Ship **Telegram webhook** on `grammY` (bot API) pointing at the same parser.
3. Collect 30 pilot stores' **opt-in list** from the weekend; begin paid pilots at $29.
4. Publish a case-study post with the Startup Weekend numbers to the merchant forums.