# Guide: Crafter-pricer (MarginCraft)

The complete manual. Every field in the app also has a **?** button with the same help: what it is, how to fill it, why it matters, and what happens if you leave it empty.

## Concepts

- **True cost** — everything one unit really costs you: materials, machine time, your labor, a share of rent and bills, and the setup fee spread over the batch.
- **Machine rate** — what one running hour of a machine costs: wear (depreciation) plus electricity, consumables and maintenance.
- **Overhead rate** — your fixed monthly costs (rent, utilities, software, insurance, other bills, marketing) divided by your productive hours. Every machine hour and labor hour carries this share.
- **Margin vs markup** — margin is profit as a share of the *price* (50% margin = price is double the cost). Markup is profit added on top of the *cost* (50% markup = price is 1.5× the cost).
- **Preset** — a saved snapshot of your whole setup: machines, settings and a sample job.

## How the price is worked out

| Part (per unit) | Formula |
| --- | --- |
| Materials | what you type |
| Machine time | machine hours × machine rate |
| Labor | labor hours × wage × (1 + burden %) |
| Overhead | (machine hours + labor hours) × overhead rate |
| Setup | setup fee ÷ quantity |
| **True cost per unit** | sum of the above |
| Price (margin mode) | cost ÷ (1 − margin %) — margin is capped at 95% |
| Price (markup mode) | cost × (1 + markup %) — markup is capped at 300% |
| VAT | price × VAT %, added on the invoice |
| Income tax (on profit) | profit × profit-tax % |
| Income tax (presumptive) | job revenue × effective bracket rate (see below) |
| In your pocket | profit − income tax |

**Machine rate** = (purchase cost − buy-back value) ÷ (lifespan months × hours per month) + (watts ÷ 1000 × electricity price) + consumables per hour + maintenance per month ÷ hours per month.

**Presumptive tax.** Brackets describe your revenue over a whole period (a month or a year), not one job. The app looks up the bracket for your **expected period revenue**, works out the effective rate (tax ÷ revenue) and charges each job that rate. Example: brackets "up to 25,000 → flat 600", expected yearly revenue 20,000 → 3% effective, so a 500 job carries 15 of tax. If no period revenue is set, the job's own revenue is used and a warning appears.

## What each screen does

### Studio

| Panel | What it does |
| --- | --- |
| Preset strip | Switch between presets or save the current setup as a new one |
| 01 Machine fleet | Your machines with purchase cost, lifespan, use, power, consumables and maintenance; shows wear vs running cost per hour. **AI specs** fills in a summary and spec sheet; **Photo** generates a reference image |
| 02 Competitor research | Describe the item; live web search lists competitor listings with prices and links. **Use as benchmark** sets one as your benchmark; **All → market intel** saves every priced listing; **Sync to Sheets** (or **Export CSV**) logs the result |
| 03 Market intel | Your saved price ranges, next to the built-in ranges for FDM, resin, UV and laser work |
| Job ticket | The order: machine, machine and labor hours, materials, setup fee, quantity, margin or markup |
| Cost ledger | The cost breakdown, subtotal, VAT and invoice total |
| Price panel | Unit price, profit, income tax, what's left in your pocket, your effective hourly wage |
| Market signal | Compares your price with a benchmark range; one click sets the price to break-even, market middle or market high |
| Write offer letter | Fills your offer template with this quote and downloads it as Markdown |

### Settings

| Section | What it holds |
| --- | --- |
| 01 Your labor | Hourly wage, burden %, currency |
| 02 Bills & overhead | Rent, utilities, software, insurance, other bills, electricity price, productive hours per month |
| 03 Tax system | VAT %, profit or presumptive regime, profit-tax %, brackets, expected period revenue |
| 04 Marketing | Monthly customer-acquisition budget (counts as overhead) |
| 05 AI & search integrations | Any OpenAI-compatible AI service (OpenAI, Groq, OpenRouter, Ollama, LM Studio…); web search provider (Tavily, Firecrawl, SearXNG, Crawl4AI); Cloudflare Workers AI for machine photos |
| 06 Google Sheets price log | Bridge script, Web App URL, optional spreadsheet ID, bridge secret |
| 07 Offer letter | Template with `{{placeholders}}`, business name, turnaround, validity |
| 08 Presets | Apply, rename, delete and save presets |

### Offer letter placeholders

`{{item}}`, `{{client}}`, `{{qty}}`, `{{unit_price}}`, `{{total_price}}`, `{{vat_pct}}`, `{{vat}}`, `{{invoice_total}}`, `{{turnaround}}`, `{{valid_until}}`, `{{notes}}`, `{{business_name}}`.

### Google Sheets price log

1. Settings → 06 → **Copy bridge script**. The script contains your secret.
2. Open script.google.com → New project → paste → **Deploy → Web app**: execute as *Me*, access *Anyone*.
3. Paste the `…/exec` URL into Settings.
4. In the Studio, research an item, then **Sync to Sheets**. A dated row (your price, your cost, market low/high, source links) is added to a tab named after the machine.

The URL has to be public for this to work, so the script refuses any request without your secret. **Reset** makes a new secret; paste the script again and redeploy afterwards. Without a URL, sync downloads a CSV file instead.

## Configuration

| Where | What | Default |
| --- | --- | --- |
| Browser storage | All settings, machines, presets, research and keys (`margincraft_v3`) | The "Pro studio" preset |
| `vite.config.js` | Dev and preview port | 26419 |
| `.env` | Nothing — see `.env.example` | — |

Clearing your browser's site data for MarginCraft resets everything, keys included.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Add your … key in Settings" | The feature needs your own key: Settings → 05 |
| Search returns nothing | Use a shorter, more generic description |
| SearXNG / Crawl4AI search fails | Your server must allow requests from the browser (CORS); Tavily and Firecrawl work without this |
| A listing shows no price | The listing's text had no clear price; open the link and log it by hand in Market intel |
| "Sheets refused the secret" | Copy the bridge script again and redeploy it (the secret changed) |
| Presumptive tax looks too high | Set **Expected period revenue** in Settings → 03 |
| Port 26419 already in use | Another copy is running; stop it, or run `bunx vite --port <other>` |

## FAQ

- **Where are my keys stored?** Only in your browser. They go only to the services you configured.
- **Are the built-in market ranges reliable?** They are indicative public ranges (USD, 2024–2026). Check prices where you sell.
- **Does it work offline?** The calculator does. Search, AI specs, photos and Sheets need the internet.
- **Can I use it on a phone?** Yes, the layout adapts; the price panel comes first.
