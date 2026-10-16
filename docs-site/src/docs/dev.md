## Architecture

MarginCraft is a static single-page app: React 18, Vite 6, Tailwind CSS 4, TypeScript, built with Bun. There is **no backend**. State lives in React and is saved to `localStorage` (`margincraft_v3`); every external call goes straight from the browser to a service the user configured.

| Path | What |
|---|---|
| `src/lib/calc.ts` | Pure pricing engine, no React (also runs this page's calculator) |
| `src/lib/ai.ts` | Search providers, price extraction, AI enrichment, Cloudflare image, offer rendering, Sheets bridge |
| `src/lib/presets.ts` | Starter presets, defaults, offer template, secret generator |
| `src/lib/market.ts` | Built-in benchmark ranges (USD) |
| `src/lib/help.ts` | Field help: what / how / why / empty |
| `src/App.tsx` | State, persistence (`boot()` merges saved data with defaults), actions |
| `src/components/` | Studio panels and Settings |

## Pricing engine

`computeQuote(job, machine, settings)` returns a `Quote`:

- **Depreciation/h** = (purchase − salvage) ÷ (lifespan months × hours/month)
- **Running/h** = kW × €/kWh + consumables/h + maintenance/month ÷ hours/month
- **Overhead/h** = (rent + utilities + software + insurance + other + marketing) ÷ billable hours
- **Labor/h** = wage × (1 + burden%)
- **Unit cost** = materials + mh × machine rate + lh × labor rate + (mh + lh) × overhead + setup ÷ qty
- **Price** = cost ÷ (1 − margin) (margin ≤ 95%) or cost × (1 + markup) (markup ≤ 300%)
- **VAT** on top; **profit tax** = max(0, profit) × rate
- **Presumptive tax** = job revenue × `presumptiveTax(periodRevenue, brackets) / periodRevenue`. Brackets are sorted by cap; cap `0` means "and above". Without a period revenue the job revenue stands in and `presumptiveRevenueMissing` is set.

Values are rounded to 3 decimals only at the output.

## Price extraction

`extractPrices(text)` matches a currency symbol or code before or after a number, parses US (`1,234.56`) and European (`1.234,56`) formats (last separator is decimal only if 1–2 digits follow), drops values next to *save / shipping / coupon / off*, and keeps 0.5–250,000. `extractPrice(title, snippet)` prefers the title.

## Google Sheets bridge

`sheetsScript(secret)` returns an Apps Script web app with the secret baked in. The app posts `{secret, fileId, rows}` as `text/plain` (no CORS preflight); the script refuses requests without the secret and answers JSON `{ok}`. The secret is 18 random bytes from `crypto.getRandomValues`, created on first boot.

## Quality

- `bun run test` — Vitest, 32 tests on the engine, taxes, price extraction and CSV export
- `bun run lint` (ESLint 10, typescript-eslint, react-hooks), `bun run typecheck`, `bun run build`
- CI runs all four on every push and PR; gitleaks pre-commit hook blocks secrets
- Fonts self-hosted (`@fontsource`), `prefers-reduced-motion` respected, background canvas idles when nothing moves

## Deploy

Static `dist/` to Cloudflare Pages (`bun install --frozen-lockfile && bun run build`, `BUN_VERSION=1.4.2`). This docs site is Astro, deployed to GitHub Pages by `.github/workflows/docs-site.yml`.
