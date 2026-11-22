# Handoff: Crafter-pricer (MarginCraft)

_Last updated: 2026-10-16 · by: Claude · branch: `standards-and-fixes` · version: 0.2.0 (unreleased)_

## In one paragraph

MarginCraft is a browser-only pricing studio for makers with 3D printers, UV printers, lasers and CNC machines. It turns machine, labor, overhead and tax settings into a cost-plus quote, compares it with market ranges and live competitor listings, and writes offer letters. Version 0.2.0 brings the repo up to the house standards and fixes the presumptive-tax bug; it is not hosted yet.

## Current state

- **Works:** pricing engine, presets, machine fleet, competitor search (4 providers), market intel, offer letters, Google Sheets log with secret, CSV export. Verified in a browser with no console errors.
- **Fixed in 0.2.0:** presumptive tax charged a full flat bracket fee on every quote; European price formats were misread; market results were lost on refresh; the Sheets bridge accepted writes from anyone with the URL; fonts loaded from Google.
- **Test suite:** yes — `bun run test` (32 tests) plus `bun run lint`, `bun run typecheck`, CI on every PR.
- **Not hosted:** Cloudflare Pages chosen; project not created yet (see DEPLOY.md).
- **Docs site:** built and checked locally; GitHub Pages not switched on yet (repo setting, see Open questions).

## Next steps, in order

1. Owner: merge the standards PR, run `git config core.hooksPath githooks` once on the laptop, install gitleaks.
2. Owner: create the Cloudflare Pages project (DEPLOY.md), then tag `v0.2.0-beta.1` after the release gate (STANDARDS.md §2).
3. Record port 26419 in PORTS.md (`node tools/pick-port.mjs --check 26419`).
4. Optional: convert remaining fixed colour names in components to the semantic tokens (`primary`, `accent`, …).
5. Optional: clear the 18 React Compiler lint warnings (animation hooks; they work today).
6. Decide one name (MarginCraft vs Crafter-pricer) before going public.

## Run it

See [INSTALL.md](INSTALL.md). The one command that proves it works:

```bash
bun run test
```

## Where things live

| Path | What |
| --- | --- |
| `src/lib/calc.ts` | All pricing maths: machine rates, overhead, margin/markup, VAT, profit and presumptive tax |
| `src/lib/ai.ts` | Web search providers, price reading, AI specs, Cloudflare image, offer letters, Sheets bridge script |
| `src/lib/presets.ts` | Starter presets, default integrations, offer template, Sheets secret generator |
| `src/lib/market.ts` | Built-in market price ranges per machine type |
| `src/lib/help.ts` | The "?" help text for every field (what / how / why / if empty) |
| `src/App.tsx` | App state, saving to the browser, research and Sheets actions |
| `src/components/` | Studio panels (machines, research, market, job ticket, results) and Settings |
| `src/index.css` | Colour tokens, fonts, panels, animations, reduced-motion rules |
| `src/lib/*.test.ts` | Tests |
| `docs/screenshots/` | README images |
| `docs-site/` | Docs website (Astro, own `package.json`, npm). Deployed by `.github/workflows/docs-site.yml` on `v*` tags or by hand |

## Decisions and why

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-16 | Presumptive tax = job revenue × (bracket tax on expected period revenue ÷ period revenue) | Brackets describe a month or year, not one job. Without a period revenue the job stands in and the UI warns |
| 2026-10-16 | Sheets bridge checks a per-install secret baked into the script | Apps Script web apps must be "Anyone" access; the secret stops strangers writing to the sheet (STANDARDS §3) |
| 2026-10-16 | Fonts self-hosted via @fontsource | GDPR: no third-party requests the page doesn't need (STANDARDS §3) |
| 2026-10-16 | Kept the paper / ink / ember palette, added semantic token names | Owner's choice: same look, langplay-style structure |
| 2026-10-16 | bun instead of npm | Same toolset as langplay; owner's choice |
| 2026-10-16 | Dev port 26419 | Follows the port rules (10000–49151, ≥3 different digits, no pattern, not a known tool's port) |
| 2026-10-16 | React Compiler lint rules set to warn | App doesn't use the compiler; the flagged hooks work; rewriting them risks UI bugs (stability first) |
| 2026-10-16 | Removed Supabase, router, charts, drag-and-drop, animation libs | Never imported; leftover from the project template |

## Gotchas

- All user data lives in `localStorage` under `margincraft_v3`. Changing the shape of saved data needs a merge with defaults in `boot()` (see `App.tsx`), or old users lose settings.
- Resetting the Sheets secret breaks syncing until the bridge script is pasted again and redeployed.
- Some search providers (SearXNG especially) block calls straight from a browser (CORS); Tavily and Firecrawl work.
- Built-in market ranges are USD regardless of the chosen currency.

## Secrets and access

Names only. The app itself needs none (see `.env.example`); users' keys stay in their browser.

| Name | What for | Where |
| --- | --- | --- |
| Cloudflare account | Hosting (planned) | Owner's Cloudflare dashboard, Git-connected Pages project |

## Open questions

- Final public name: MarginCraft or Crafter-pricer?
- Custom domain for the hosted version?
- GitHub Pages on a private repo needs a paid GitHub plan; on the free plan the docs site needs the repo public or another host.

## 2026-11-21: docs site moved to the v2 theme (docs only)

**What changed.** `docs-site/` now uses the shared v2 docs theme (dark look, Dev / English / ELI5 levels, level cards, glossary tooltips, review stamp). Rewrote `dev.md`, `plain.md`, `eli5.md`, added `docs/glossary.yml`, kept the live calculator (runs the real `src/lib/calc.ts`). Renamed one heading in `GUIDE.md` ("Features" → "What each screen does") so it no longer clashes with the page's own `#features` anchor. The workflow `docs-site.yml` needed no change (it already builds `docs-site/` with npm). No app code touched.

**Stamps.** Pages say "Checked against v0.2.0 on 21 Nov 2026". v0.2.0 is not tagged or released (CHANGELOG: Unreleased), so the docs describe `main`.

**Unreleased / undocumented.** Nothing beyond `main` is described. No hosted copy exists yet (DEPLOY.md), so no "open the app" link.

**Product problems found (not fixed).**
1. Input boxes always show `$` (JobTicket, MachinesSection, BusinessSections, MarketPanel) even when EUR or GBP is chosen.
2. Margin to markup conversion cannot keep the price above 75% margin (markup cap 300).
3. Settings field "Productive hours per month" has a minimum of 1, but the warning text elsewhere treats 0 as possible (only via old saved data).
4. This file's "Current state" still says the docs site is not live and 32 tests; the site is live and the test count was not re-checked (about 25 literal test calls found).
5. API keys are stored in plain text in browser storage; no CSP in `public/_headers`.

**Claims not confirmed.** "Tavily and Firecrawl need no CORS setup" (from GUIDE.md, third-party behaviour); "works offline" (no service worker; true only once loaded); install time estimates on the ELI5 and English pages; the 32-test count.
