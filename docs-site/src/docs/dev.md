---
checkedAgainst: v0.2.0
checkedOn: 2026-11-21
---

## Orientation

MarginCraft (repo `Crafter-pricer`) is a **static single-page app**: React 18 + Vite 6 + Tailwind 4 + TypeScript 5, no server, no database, no router, no state library. All state lives in `useState` in `src/App.tsx` and is mirrored to **one `localStorage` key**. The pricing engine is a handful of pure functions in `src/lib/calc.ts`.

Rules that decide arguments, in order:

1. **Pricing is pure.** `computeQuote(job, machine, settings)` takes plain objects and returns a `Quote`. No I/O, no clock, no randomness. The docs site imports the same file for its live calculator.
2. **Nothing leaves the browser unless you configured it.** The only network calls are in `src/lib/ai.ts`, each to a service whose key or URL you typed into Settings.
3. **A missing number is never an error.** In the engine, empty or negative values fall back to 0 or are clamped, so the quote always computes. The input boxes also ignore text that is not a number.

> **Watch out** This page describes the code on `main` at package version **0.2.0**. `CHANGELOG.md` marks 0.2.0 as *Unreleased* and the repo has **no version tag yet**, so there is no released build; the app is not hosted either (`DEPLOY.md`: Cloudflare Pages planned). If this page and the code disagree, the code wins.

## Run it

```bash
git clone https://github.com/Stravelakis/Crafter-pricer.git
cd Crafter-pricer
git config core.hooksPath githooks   # gitleaks pre-commit; needs gitleaks installed
bun install
bun run dev                          # http://localhost:26419
```

| Command | What it does |
|---|---|
| `bun run dev` | `vite`, port **26419**, `strictPort: true`, `host: "0.0.0.0"` |
| `bun run build` | `vite build` → `dist/` (does **not** typecheck) |
| `bun run preview` | `vite preview`, same port |
| `bun run lint` | `eslint .` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | `vitest run`, files matching `src/**/*.test.ts` |
| `bun run format` / `format:check` | Prettier write / check |

> **Watch out** `server.host` is `0.0.0.0`, so while the dev server runs, other machines on your network can open it. A taken port 26419 is an error, not a fallback (`strictPort`); use `bunx vite --port <n>`.

No environment variables: `.env.example` is only a comment saying so. Every key is typed by the user in Settings.

## Layout

| Path | What |
|---|---|
| `src/lib/calc.ts` | All pricing maths and money formatting |
| `src/lib/ai.ts` | Search providers, price reading, AI specs, Cloudflare image, offer rendering, Sheets bridge and CSV |
| `src/lib/presets.ts` | The three starter presets, default integrations, default offer template, secret generator |
| `src/lib/market.ts` | Built-in benchmark ranges (`BENCHMARKS`, USD), `TYPE_TO_BENCH`, machine type labels |
| `src/lib/help.ts` | The text behind every **?** button (`what` / `how` / `why` / `empty`) |
| `src/types.ts` | `Machine`, `Settings`, `Job`, `Quote`, `Integrations`, `Preset`, and friends |
| `src/App.tsx` | State, persistence (`boot()` and the save effect), research, Sheets sync, presets |
| `src/components/` | Studio panels (`MachinesSection`, `ResearchPanel`, `MarketPanel`, `JobTicket`, `ResultsPanel`), `SettingsTab`, `BusinessSections`, `OfferModal`, `ui.tsx`, `CursorGrid` |
| `public/_headers` | Security headers for Cloudflare Pages |
| `docs-site/` | This docs website (Astro, own `package.json`, **npm**) |

## The pricing formula

All of it is in `computeQuote`. Per **unit**, then per order.

**Machine rate** (per running hour, from the job's machine; 0 when the job has no machine):

```
depPerHour  = max(0, purchaseCost − salvageValue) / (lifespanMonths × hoursPerMonth)     (0 if that product ≤ 0)
runPerHour  = watts/1000 × electricityRate + consumablesPerHour + maintenancePerMonth / hoursPerMonth
              (maintenance term is 0 if hoursPerMonth ≤ 0)
machineRate = depPerHour + runPerHour
```

**Rates from Settings:**

```
monthlyFixed  = rent + utilities + software + insurance + otherBills + marketingMonthly
overheadRate  = monthlyFixed / billableHours        (0 if billableHours ≤ 0)
laborRate     = hourlyWage × (1 + laborBurdenPct/100)
```

**Per unit** (`qty = max(1, floor(quantity || 1))`, `mh = max(0, machineHours)`, `lh = max(0, laborHours)`):

```
uMaterials = max(0, materialCost)
uMachine   = mh × machineRate
uLabor     = lh × laborRate
uOverhead  = (mh + lh) × overheadRate              ← overhead rides on machine hours AND labour hours
uSetup     = max(0, setupFee) / qty                ← setup fee is per ORDER, spread over the batch
unitCost   = uMaterials + uMachine + uLabor + uOverhead + uSetup
totalCost  = unitCost × qty
```

**Margin or markup** (`pct = clamp(marginPct || 0, 0, MODE_MAX[mode])`, `MODE_MAX = { margin: 95, markup: 300 }`):

```
margin mode:  unitPrice = unitCost / (1 − pct/100)
markup mode:  unitPrice = unitCost × (1 + pct/100)
totalPrice    = unitPrice × qty
```

**Tax and what is left:**

```
vat          = totalPrice × vatPct/100             invoiceTotal = totalPrice + vat
profit       = totalPrice − totalCost              (VAT is not in it)
regime "profit":       tax = max(0, profit) × profitTaxPct/100
regime "presumptive":  tax = presumptiveTaxForJob(totalPrice, presumptiveRevenue, brackets).tax
net          = profit − tax                        ("In your pocket")
activeHours  = mh + lh
blended      = activeHours > 0 ? totalCost / activeHours : 0          ("True all-in cost" per active hour)
effWage      = lh > 0 ? hourlyWage + net / lh : 0                     ("Wage, after tax")
```

**Presumptive tax.** Brackets describe a whole period, not one job:

```
presumptiveTax(revenue, brackets):
  none → 0
  sort by (upTo || Infinity); hit = first with upTo = 0 or revenue ≤ upTo, else the highest bracket
  "percent" → revenue × value/100,  "fixed" → value
presumptiveTaxForJob(jobRevenue, periodRevenue, brackets):
  base = periodRevenue > 0 ? periodRevenue : jobRevenue      (revenueMissing = !(periodRevenue > 0))
  base ≤ 0 → tax 0
  rate = presumptiveTax(base, brackets) / base
  tax  = jobRevenue × rate;  ratePct = rate × 100
```

**Rounding.** Nothing is rounded while calculating. Every number in the returned `Quote` goes through `round3` (3 decimals) at the end, so totals are computed from unrounded parts. The UI formats money with `fmtMoney` (`Intl.NumberFormat("en-US")`, 2 decimals, currency from Settings; falls back to a `$` prefix if the currency code throws). There is **no "round to a nice price" step**.

**Helpers used by the UI:**

- `convertPct(pct, from)`: margin → markup is `m/(1−m)` (9 if `m ≥ 1`), markup → margin is `m/(1+m)`; clamped to the other mode's cap, rounded to 0.1. Switching mode in the Job ticket keeps the price, up to margin 75% / markup 300% (above that the cap changes it) and within the 0.1 rounding.
- `pctForTarget(targetTotal, totalCost, mode)`: the percentage that lands exactly on a target order total, clamped and rounded to 0.1; 0 if cost or target is 0 or less. Behind the three **Snap your margin to a target** buttons: *Break-even floor* (= `totalCost`), *Market match* (middle of the benchmark band × job size), *Market high*.

**Worked example** (the shipped *Pro studio* preset; the same numbers appear in the Studio screenshot on the front page). Run `computeQuote` on it and you get, per unit: machine rate 2.611 (wear 0.704 + running 1.908), overhead rate 13.682 (1,505 / 110), labour rate 34.56 (32 × 1.08), materials 6.5, machine 3.134 (1.2 h), labour 31.104 (0.9 h), overhead 28.732 (2.1 h), setup 1.333 (8 / 6), **unit cost 70.803**, **unit price 157.339** at 55 % margin; order total 944.036, VAT (21 %) 198.247, profit 519.22, profit tax (26 %) 134.997, **net 384.222**.

## State and storage

`Persisted` (in `App.tsx`) is saved on every change to one JSON string under **`localStorage["margincraft_v3"]`**:

`settings`, `machines`, `job`, `research`, `integrations` (**including every API key, in plain text**), `presets`, `activePresetId`, `offerTemplate`, `offerDefaults`, `findings`, `query`.

- `boot()` merges whatever it finds over the defaults, field by field, inside a `try`; any parse error returns the defaults. First run = preset `pro` ("Pro studio", USD).
- If `setItem` throws (storage full, typically from machine photos stored as data URLs), it retries once with every machine's `image` removed, then gives up silently.
- `withSheetsSecret` creates the Sheets secret (18 random bytes from `crypto.getRandomValues`, hex) on first boot if none exists.
- There is no export or import of the whole state, no sync, no account. Clear site data and it is gone.

## What leaves the browser

Nothing is sent to the project's author: no analytics, no telemetry, no error reporting, no CDN fonts (fonts are bundled with `@fontsource`; `index.html` loads nothing external). The only `fetch` calls are in `src/lib/ai.ts`:

| Feature | Sent to | What is sent |
|---|---|---|
| Competitor research (Tavily) | `https://api.tavily.com/search` | Your description + `" price buy"`, your key in the body; `search_depth: "advanced"`, 8 results |
| Competitor research (Firecrawl) | `https://api.firecrawl.dev/v1/search` | Same query, key as Bearer, `limit: 8` |
| Competitor research (SearXNG) | `{your URL}/search?q=…&format=json&categories=shopping,general` | The query. No key. Cross-origin: **needs CORS** |
| Competitor research (Crawl4AI) | `{your URL}/search` (POST) | `{ query, num_results }`. Cross-origin: **needs CORS** |
| **AI specs** | `{aiBase}/chat/completions` (default `https://api.openai.com/v1`) | Machine name, type and purchase cost; your key as Bearer; model default `gpt-4o-mini`, temperature 0.2 |
| **Photo** | `https://api.cloudflare.com/client/v4/accounts/{id}/ai/run/{model}` | A fixed prompt built from the machine name and type; your token as Bearer; default model `@cf/black-forest-labs/flux.1-schnell` |
| **Sync to Sheets** | Your Apps Script web-app URL (POST, `text/plain`) | `{ secret, fileId, rows }`: date, machine, item, your unit price, order total and cost, market low/high, source URLs |

Each call needs its key or URL first; without it the code throws a message telling you to add it in Settings. The **AI specs** result also fills a "manual" link: if the model gives none, it falls back to a Google search URL for `"<machine name> manual pdf"` (a link you click, not a request the app makes).

Everything else (pricing, presets, market intel, offer letters, CSV) is local. The footer line "keys & data never leave your browser" is only true until you set up one of the services above, and then only for the data not listed in the table.

> **Watch out** Keys are plain text in `localStorage`. Anyone (or any script) with access to that browser profile can read them, and `public/_headers` sets no CSP. Treat the machine as the trust boundary.

## Research and price reading

`runResearch` calls `searchWeb`, maps each result to a `Finding` with `price = extractPrice(title, snippet)` (snippets cut to 400 chars). Price reading (`extractPrices`):

- Accepts a number with `$ € £` before it, or a number followed by `$ € £`, `USD`, `EUR`, `GBP`, `dollar(s)`, `euro(s)`, `pound(s)` or `bucks`.
- Keeps values from **0.5 to 250,000**.
- Skips a number if the 16 characters before it end in `save|saving|shipping|delivery|coupon|voucher|cashback` or the 12 after it start with `off|discount|shipping|delivery`.
- `parsePriceNumber` reads `1,234.56` and `1.234,56`: the last separator is the decimal point only when 1–2 digits follow it; exactly 3 digits makes it a thousands separator.
- The **title** price beats a snippet price.

**Use as benchmark** turns a priced finding into a `ResearchEntry` with `low = price × 0.9` and `high = price × 1.1` (2 decimals) and selects it, setting the job size to the order quantity (at least 1). **All → market intel** does that for every priced finding. Entries from research are marked ★ in the benchmark dropdown. The currency symbol on findings comes from Settings; **no conversion happens anywhere**.

## Market signal

`ResultsPanel` multiplies the selected benchmark's `low` and `high` by `job.benchmarkUnits`, then reports **Under market** (total below low), **In market range** (percentage above or below the midpoint) or **Premium** (above high). The built-in ranges are static USD figures from `market.ts`, described in the source as indicative for 2024–2026.

## Offer letter rendering

`renderOffer(template, values)` replaces `{{name}}` (regex `\{\{\s*(\w+)\s*\}\}`); an unknown name becomes empty text. `OfferModal` supplies: `business_name`, `client` (stays literally `{{client}}` until you type one), `item` (job name, or "Custom order"), `description`, `qty`, `unit_price`, `total_price`, `vat`, `vat_pct`, `invoice_total`, `valid_until` (US long date), `turnaround`, `notes`, `currency`. **Copy markdown** uses the clipboard; **Download .md** saves `offer-<job-name-slug, 40 chars>.md`.

## Google Sheets bridge

`sheetsScript(secret)` generates an Apps Script `doPost` with the secret baked in. It rejects any body whose `secret` differs, takes a script lock, opens the sheet by `fileId` (or the stored `mc_ss_id`, or creates "MarginCraft pricing log"), and appends one row per entry to a tab named after the machine (max 90 chars), writing a header row to new tabs. It must be deployed as **Execute as: Me, Access: Anyone**, so the secret is the only gate. **Reset** makes a new secret; paste and redeploy the script after it. `pushToSheets` throws `"unauthorized"` on a refused secret; with no URL set, the same button downloads `margincraft-log-<date>.csv` (`rowsToCsv`).

## Tests, CI, release

- Tests: `src/lib/calc.test.ts` (pricing, depreciation, presumptive tax, conversions) and `src/lib/ai.test.ts` (price reading). They need no network. Vitest 5.
- `.github/workflows/ci.yml` on push to `main` and every PR: bun 1.4.2, `bun install --frozen-lockfile`, then lint, typecheck, test, build.
- Pre-commit: `githooks/pre-commit` runs `gitleaks git --pre-commit --redact --staged --verbose`, and refuses to commit without gitleaks installed.
- Release gate and steps are in `DEPLOY.md` and `STANDARDS.md` §2: bump `version` in `package.json` and the README badge, add the CHANGELOG entry, merge to `main`, then `git tag vX.Y.Z && git push origin vX.Y.Z` and a GitHub Release.
- Hosting: planned for **Cloudflare Pages** (build `bun install --frozen-lockfile && bun run build`, output `dist`, `BUN_VERSION=1.4.2`, `SKIP_DEPENDENCY_INSTALL=true`); the project is not created yet.
- `public/_headers`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## This docs site

Built from `docs-site/` (Astro, npm, Node 22 in CI) by `.github/workflows/docs-site.yml` on every `v*` tag or by hand (Actions → *Deploy docs site* → Run workflow), published at `https://docs.stravelakis.com/Crafter-pricer/`. `scripts/sync-docs.mjs` copies the repo's `GUIDE.md` and `INSTALL.md` into the Guide and Install sections and reads `docs/glossary.yml` for the tooltips. The **Try the calculator** box on the front page imports `src/lib/calc.ts` straight from the app (`../../../src/lib/calc`), so moving that file breaks the docs build.

## Gotchas

- **Currency symbols are hard-coded `$` in the input boxes** (`prefix="$"` in `JobTicket`, `MachinesSection`, `BusinessSections`, `MarketPanel`). Choosing EUR or GBP changes how results are formatted, **not** the `$` shown in the fields, and nothing is converted.
- The benchmark ranges and the Market intel units (`$/g`, `$/min`) are USD.
- `fmtMoney` always formats as `en-US` (for example `€1,234.56`), whatever the browser language.
- With `billableHours` at 0 overhead is silently skipped; with a machine's `hoursPerMonth` or lifespan at 0, its wear is 0.
- In presumptive mode with no *Expected period revenue*, the job's own revenue stands in for the period and a flat tier is charged in full on that one job. The price panel shows "(set period revenue)".
- Over the highest bracket cap with no `0` ("and above") row, the highest bracket still applies.
- SearXNG and Crawl4AI search only work if the server answers browser cross-origin requests.
- `bun run build` does not typecheck; run `bun run typecheck`.
