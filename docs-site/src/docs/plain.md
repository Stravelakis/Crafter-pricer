## What it is

MarginCraft is a pricing tool for makers who sell work made on 3D printers, resin printers, UV printers, lasers or CNC machines. It works out what each piece really costs you, adds the profit you want, and shows the price, the VAT and what you keep after tax.

## Get it

1. Install [Bun](https://bun.sh).
2. Download the code from GitHub.
3. Run `bun install`, then `bun run dev`, and open http://localhost:26419.

It opens with a sample "Pro studio" setup so you can see a full quote straight away. A hosted web version is planned.

## Set up your business once

In **Settings**:

| Section | What you enter |
|---|---|
| Your labor | What you pay yourself per hour |
| Bills & overhead | Rent, utilities, software, insurance, electricity price, productive hours per month |
| Tax system | VAT, and income tax on profit or by revenue brackets |
| Marketing | What you spend each month to find customers |
| AI & search | Optional keys for competitor search and machine specs |

## Price a job

In the **Studio**:

1. Add your machines: price, how long they last, how much you use them, power draw.
2. Fill in the job ticket: which machine, machine hours, your hands-on hours, materials, setup fee, quantity.
3. Pick **margin** or **markup** and the percentage — or type the price you want.
4. Read the result: cost breakdown, price, VAT, invoice total, profit and what's left after tax.

## Check the market

Describe the item and press **Research market prices**. MarginCraft searches the web (with your Tavily, Firecrawl, SearXNG or Crawl4AI key) and lists competitor listings with their prices and links. Use one as your benchmark, or save them to your market notes.

## Send an offer

**Write offer letter** turns the quote into a ready-to-send Markdown offer from your own template.

## Keep a price log

Connect a Google Sheet (a short script, copied from Settings) and every **Sync to Sheets** adds a dated row: your price next to the market range. The script only accepts your app's secret, so nobody else can write to it. Without a sheet, you get a CSV file.

## Your data

Everything — settings, machines, keys — stays in your own browser. Nothing is sent anywhere except the services you set up yourself.
