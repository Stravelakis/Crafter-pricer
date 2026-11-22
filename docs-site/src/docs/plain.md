---
checkedAgainst: v0.2.0
checkedOn: 2026-11-21
---

## What MarginCraft is

A pricing calculator for people who make things with machines: 3D printers (filament or resin), UV printers, laser engravers and cutters, CNC routers. You tell it what your machines cost, what an hour of your time is worth and what your bills are, and it works out what **one piece really costs** and what to **charge** so the job pays you. It then shows your price next to what others charge, and can write the offer letter.

It is a web page that runs **entirely in your browser**. There is no account, no server of ours and no database. Your numbers are saved in your own browser.

> **Watch out** This page describes version **0.2.0** as it is in the repository. That version is not tagged or released yet, and **there is no hosted copy**: you run it yourself (next section). The docs describe what the code does today, not a promise about later versions.

The idea behind the price is called **cost-plus pricing**: work out your true cost first, then add the profit you want. The "plus" is either a **margin** (profit as a share of the price) or a **markup** (profit on top of the cost).

## Install it

There is no installer and no website to open yet. You run it on your own computer. It takes about five minutes if you are comfortable with a terminal.

1. Install [Bun](https://bun.sh) (version 1.4 or newer) and [Git](https://git-scm.com).
2. Download the code and install what it needs:

```bash
git clone https://github.com/Stravelakis/Crafter-pricer.git
cd Crafter-pricer
bun install
```

3. Start it:

```bash
bun run dev
```

4. Open **http://localhost:26419** in your browser. You should see the **Studio** with the *Pro studio* preset already filled in and a unit price in the top right.

Stop it any time with Ctrl+C in the terminal. Your numbers are kept in the browser, not in the folder, so stopping does not lose them (see *Where your data lives*).

> **Why** `INSTALL.md` also lists gitleaks and a `git config core.hooksPath githooks` line. Those only matter if you plan to **commit changes to the code**: the hook blocks a commit that would leak a secret. For just using the app you can skip them.

If the port is busy, another copy is already running. Close it, or run `bunx vite --port 27000` (any free port).

## Your first quote in ten minutes

The app has two tabs at the top: **Studio** (where you price jobs) and **Settings** (your business, once). It starts on the *Pro studio* sample so you can see numbers straight away.

1. **Pick or save a starting point.** The **Preset** strip at the top of the Studio has three samples: *Side hustle*, *Pro studio*, *Production floor*. Pick the closest. Later, **Save current…** stores your own.
2. **Settings → 01 Labor.** Set your **Hourly wage** (what you pay yourself), **Burden** (extra employer costs, usually 0 if you work alone) and **Currency** (USD, EUR or GBP).
3. **Settings → 02 Bills & overhead.** Fill **Rent / space**, **Utilities**, **Software subs**, **Insurance**, **Other bills**, **Electricity** (price per kWh) and **Productive hours per month**. (Your **Marketing budget** from section 04 counts as a bill too.) The two dark boxes underneath show your **Fixed costs / month** and your **Overhead / productive hr**.
4. **Studio → 01 Machine fleet.** Edit the machine or **Add machine**. For each one: **Type**, **Purchase cost**, **Buy-back value** (what you could sell it for when you replace it), **Repurchase in** (months), **Use** (hours per month), **Power draw** (watts), **Consumables** (per running hour) and **Maintenance** (per month). The card shows the hourly cost split into depreciation (wear) and running cost. With several machines, the panel shows only the one selected on the job, with a **Focused view** bar; press **Show all** to see the rest.
5. **Studio → Job ticket.** Name the job, pick the **Machine**, then fill **Machine time**, **Labor time** and **Materials** (all per piece), the **Setup / prep fee** (once for the whole order) and **Quantity**. Choose **Margin** or **Markup** and drag the slider.
6. **Read the answer.** The big number is **Your price · per unit**. Below it: **Profit (net of VAT)**, the tax line, and **In your pocket**. The **Cost ledger** shows where every part of the cost came from.

> **In short** True cost per piece = materials + machine time + your labour + a share of your bills + the setup fee split across the batch. Price = that cost with your margin or markup on top.

## The maths behind the price

| Part (per piece) | How it is calculated |
|---|---|
| Materials | What you type |
| Machine time | machine hours × machine rate |
| Labor | labor hours × wage × (1 + burden %) |
| Overhead share | (machine hours + labor hours) × overhead rate |
| Setup / file prep | setup fee ÷ quantity |
| **True cost per unit** | the sum of the above |
| Price, margin mode | cost ÷ (1 − margin %), margin capped at 95% |
| Price, markup mode | cost × (1 + markup %), markup capped at 300% |

**Machine rate** (cost of one running hour) = (purchase cost − buy-back value) ÷ (months of life × hours used per month) + (watts ÷ 1000 × electricity price) + consumables per hour + maintenance per month ÷ hours used per month.

**Overhead rate** = your monthly rent, utilities, software, insurance, other bills **and marketing budget** ÷ your productive hours per month. Every machine hour and every labour hour carries that share.

An example you can reproduce: the *Pro studio* sample prices a set of 6 engraved coasters at a **true cost of 70.80 per coaster** and a **price of 157.34 per coaster** at 55% margin. Of the 70.80, labour is 31.10 and overhead 28.73, and the machine only 3.13. Time and bills, not the machine, are the big parts.

> **Watch out** Margin and markup are not the same number. 50% **margin** doubles your cost. 50% **markup** multiplies it by 1.5. Switching between them in the Job ticket converts the percentage for you so the price stays about the same (very high margins above 75% cannot be matched, because markup stops at 300%).

## Tax and what you keep

**Settings → 03 Tax system** has:

- **VAT / sales tax.** Added on top of your price on the invoice (price × VAT %). It is **not** part of your profit.
- **Income tax regime.** Choose **On profit** (a **Profit tax rate** percentage of each job's profit) or **Presumptive** (for countries that tax small businesses from their revenue using a table).
- **Presumptive brackets.** One row per tier: **up to** an amount, then either **%** of revenue or a **flat** amount. A cap of 0 means "and above".
- **Expected period revenue.** The revenue you expect over the same period as the brackets (a month or a year).

The app finds your bracket from the expected period revenue, turns it into a percentage, and charges **each job that percentage of its revenue**. For example: brackets "up to 25,000 → flat 600" and an expected yearly revenue of 20,000 give 3%, so a job worth 500 carries 15 of tax.

> **Watch out** Leave **Expected period revenue** empty in presumptive mode and the job's own revenue is used as if it were your whole year. A flat tier then lands entirely on that one job and the tax looks far too high. The price panel then says "set period revenue" next to the tax.

**In your pocket** is profit minus income tax. **Wage, after tax** shows what an hour of your hands-on time earned once the profit is included.

## Is the price right? Market check

- **Studio → 03 Market intel.** A built-in table of typical street rates for FDM, resin, UV, laser engraving and laser cutting work, plus your own log. They are rough public ranges in **US dollars**: check prices where you sell.
- **Market signal panel** (under the price). Choose **Compare against** (a built-in range or one of your own entries) and the **Job size** in that range's unit (grams, minutes, items). The meter tells you if you are **under market**, **in range** or **premium**.
- **Snap your margin to a target.** Three buttons set your margin so the order total lands exactly on **Break-even floor** (zero profit before tax), **Market match** (the middle of the range) or **Market high**.

## Competitor research (optional, needs a key)

1. In **Settings → 05 AI & search integrations**, pick a **web search provider** (Tavily, Firecrawl, SearXNG or Crawl4AI) and enter its key or address.
2. In **Studio → 02 Competitor research**, describe what you make ("engraved walnut coaster set of 6") and press **Research market prices**.
3. You get a list of listings with links and, where the text has a clear price, the price. **Use as benchmark** adds one to your Market intel and selects it. **All → market intel** adds every priced listing.

The text you type, plus the words "price buy", is sent to the search service you chose. Prices are read automatically from titles and snippets and can be wrong: open the link before you trust one. Discounts and shipping amounts are skipped, but not every time.

## Machine extras (optional, need keys)

- **AI specs** (on a machine card) asks an AI service to fill a short summary and a spec sheet from the machine's name. It sends the machine name, type and purchase cost to the service in **Settings → 05**. Any OpenAI-compatible service works (OpenAI, Groq, OpenRouter, Ollama, LM Studio and similar). It can be wrong; check the specs.
- **Photo** makes a reference picture with Cloudflare Workers AI and needs your Cloudflare account ID and token.

Neither changes your prices.

## Writing an offer letter

On the price panel, press **Write offer letter (.md)**. Type the **Client name**, how many days it is **Valid for**, and any **Extra notes**. You see a live preview. **Copy markdown** puts it on your clipboard; **Download .md** saves a file you can open in any text editor.

The wording comes from **Settings → 07 Offer letter**: your **Business name**, **Turnaround**, **Default validity** and a Markdown template with placeholders like `{{item}}`, `{{client}}`, `{{qty}}`, `{{unit_price}}`, `{{total_price}}`, `{{vat_pct}}`, `{{vat}}`, `{{invoice_total}}`, `{{turnaround}}`, `{{valid_until}}`, `{{notes}}` and `{{business_name}}`. The default template mentions "50% upfront, 50% on delivery": change it if that is not your rule.

## Google Sheets price log (optional)

Keeps a dated row each time you press Sync (your price, your cost, the market low and high, the source links) in a Google Sheet, on a tab named after the machine.

1. **Settings → 06**, press **Copy bridge script**. It contains a secret that is yours.
2. Open [script.google.com](https://script.google.com), make a new project, paste it, then **Deploy → Web app** with *Execute as: Me* and *Access: Anyone*.
3. Paste the address ending in `/exec` into **Apps Script Web App URL**.
4. In the Studio, run a research, then press **Sync to Sheets**.

The address is public by design, so the script refuses anything without your secret. **reset** (next to *Bridge secret*) makes a new secret: copy the script again and redeploy it. With no URL set, the button is called **Export CSV** and downloads a **CSV file** instead.

## Presets

A preset is a saved copy of your machines, settings and sample job. Switch with the strip at the top of the Studio, or manage them in **Settings → 08 Business presets**: **Apply** one, rename it by typing in its boxes, delete the ones you saved yourself, or **Save preset** from the current setup.

> **Watch out** **Apply** replaces your current machines, settings and job with the preset's. Unsaved changes are lost, so use **Save current…** first. Your keys, research and offer template are not touched.

## Where your data lives

> **Do this first** Everything you enter (settings, machines, presets, research, **and your keys**) is saved in **your browser's own storage** for this page. Nothing is sent to the project's author. Clearing the browser's site data for the page erases all of it, so keep your important numbers somewhere else too.

What does leave your computer, and only when you use it:

| When | Where it goes | What |
|---|---|---|
| **Research market prices** | The search service you chose (Tavily or Firecrawl in the cloud; SearXNG or Crawl4AI at the address you gave) | Your description of the item, plus "price buy" |
| **AI specs** | The AI service in Settings | Machine name, type and purchase cost |
| **Photo** | Cloudflare | A picture request built from the machine name and type |
| **Sync to Sheets** | Your own Google script | The price-log row |

Pricing, presets, market intel and offer letters never leave the page. The calculator itself works offline; search, AI specs, photos and Sheets need the internet.

> **Watch out** Your keys are stored in the browser as plain text. Do not use this on a shared or public computer.

## When something goes wrong

| What you see | What to do |
|---|---|
| A message "Add your … key in Settings" | The feature needs your own key: **Settings → 05** |
| Research returns nothing | Use a shorter, more generic description |
| SearXNG or Crawl4AI search fails | Your server must allow requests from the browser (CORS). Tavily and Firecrawl do not need this |
| A listing shows no price | The listing text had no clear price. Open the link and log it by hand in Market intel |
| "Sheets refused the secret" | Copy the bridge script again and redeploy it (the secret changed) |
| Presumptive tax looks too high | Set **Expected period revenue** in **Settings → 03** |
| Port 26419 already in use | Another copy is running. Stop it, or use `bunx vite --port <other>` |
| The `$` in the boxes does not change when you pick EUR or GBP | Known: the boxes always show `$`. Results use your currency, and no amounts are converted, so just type your own currency's numbers |
