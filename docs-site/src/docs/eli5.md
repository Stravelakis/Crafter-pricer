---
checkedAgainst: v0.2.0
checkedOn: 2026-11-21
---

## Start here

This page takes you from "I make things and guess my prices" to "I know what each piece really costs me and what to charge". You do not need to know anything about pricing or about code. Go slowly. Nothing here can break your computer, and every step says **what you should see**, so you always know if it worked.

> **Do this first** You do not have to read everything before you start. Read **The ideas** (about ten minutes), then follow the steps one at a time. Come back to the rest when you need it.

**What you will have at the end:**

- MarginCraft running on your computer.
- Your machine, your hourly pay and your monthly bills typed in once.
- One real job priced, with every part of the cost visible.
- A sample offer letter for a customer.
- A clear picture of what stays in your browser and what could leave it.

**What you do not need:** an account, a credit card, or any programming knowledge. You need a computer with internet for the first download. **No cloud service is required**, because the price calculator works on its own. Search, AI and spreadsheet features are optional extras that need their own keys.

**How long:** about 40 minutes, most of it installing and typing your own numbers.

> **Watch out** There is no installer and no website for this yet. You run a small program on your own computer. The steps below walk you through it. This page describes version **0.2.0**, which is not tagged as an official release yet.

## The ideas

Take them one at a time. Nothing here is a test.

### 1. Cost and price are different things

**Cost** is what making one piece takes out of your pocket. **Price** is what the customer pays you. If the price is lower than the cost, you lose money on every sale, even if people love your work. **Profit** is the part of the price left over after the cost.

### 2. Cost-plus pricing means "cost first, profit on top"

You do not look at what others charge and guess. You work out your **true cost**, add the profit you want, and the total is your price. That is **cost-plus pricing**. After that you check the result against the market, so you do not charge something nobody would pay.

### 3. Your true cost has five parts

When you make one piece, you spend:

1. **Materials**, the plastic, wood or resin in it.
2. **Machine time**, because the machine wears out and uses electricity while it works.
3. **Your own time**, because your hours are worth something even if you pay yourself nothing.
4. **A share of your bills**, such as rent and software, that you pay whether or not you sell anything today.
5. **Setup**, the one-time work for an order (preparing a file, adjusting the machine), shared across all the pieces in the order.

Add these five up and you have the **true cost per piece**. Most people forget parts 3 and 4, which is why their prices feel fine and their bank account does not.

### 4. A machine wears out, so each hour it runs costs something

Say you bought a printer for 600 and you expect to sell it for 200 when you replace it in 20 months. You "use up" 400 of its value. If it works 20 hours a month, that is 20 × 20 = 400 hours, so each hour costs **1.00** in wear. That wear is called **depreciation**. On top of it, each running hour has electricity, small parts that wear out (**consumables**) and a share of maintenance. Together that is the **machine rate**: the cost of one running hour.

### 5. Overhead is the bills you pay anyway

**Overhead** means the costs that go on even when the machine is switched off: rent, utilities, software, insurance, other bills and your marketing budget. The app adds them up per month and divides by your **productive hours**, the hours a month you are really working on orders. The result is a small cost for every hour of work. Each job then carries its share.

### 6. Margin and markup both mean "profit", but they count differently

- **Markup** is profit as a percentage of your **cost**. Cost 100, markup 50% → price 150.
- **Margin** is profit as a percentage of the **price**. Cost 100, margin 50% → price 200, because half of 200 is profit.

The same number means a different price. 50% margin is a much higher price than 50% markup. The app lets you use either, and when you switch it converts the number so the price stays about the same (except at very high margins).

### 7. Taxes take a slice

- **VAT** (or sales tax) is added to your price on the invoice. You collect it for the government. It is not your money, so the app keeps it out of your profit.
- **Income tax** is a slice of what you earn. The app has two ways of counting it. **On profit** takes a percentage of your profit. **Presumptive** takes a percentage of your revenue using a table of brackets, which some countries use for small businesses.

### 8. Your numbers live in your browser

A browser can keep small notes for a website in a drawer on your computer, called **browser storage**. MarginCraft saves your machines, settings, presets, research and keys there. That is why there is no account. It also means **clearing your browser's site data erases everything**.

### 9. A key is a password for a service

Some optional features, like searching the web, ask another company's service to do a job. That service wants to know it is you asking, so it gives you a long secret code called an **API key**. Think of a library card: whoever holds it can borrow in your name. MarginCraft keeps your keys in your browser and sends each one only to the service it belongs to. You never need a key for the calculator itself.

> **In short** True cost = materials + machine time + your time + a share of your bills + setup. Price = that cost with profit added (margin or markup). Taxes then take their slice.

## A tiny example by hand

Do this on paper first, so the app will make sense. All the numbers are invented, just for learning.

- Printer: bought for **600**, resale **200**, replaced after **20 months**, used **20 hours a month**. Wear = (600 − 200) ÷ (20 × 20) = **1.00 per hour**.
- Running cost per hour: electricity 200 watts × 0.25 per kWh = **0.05**, small parts **0.10**, maintenance 10 a month ÷ 20 hours = **0.50**. That is **0.65**.
- **Machine rate** = 1.00 + 0.65 = **1.65 per hour**.
- Your pay: **15 per hour**.
- Bills: utilities 20 + software 10 + other 10 = **40 a month**. With **40 productive hours** a month, overhead is **1.00 per hour**.

An order of **3 pieces**: each needs **4 hours** of machine time, **0.5 hours** of your time and **3** of material. The setup fee is **6** for the whole order.

| One piece | Sum |
|---|---|
| Materials | 3.00 |
| Machine: 4 h × 1.65 | 6.60 |
| Your time: 0.5 h × 15 | 7.50 |
| Overhead: (4 + 0.5) h × 1.00 | 4.50 |
| Setup: 6 ÷ 3 pieces | 2.00 |
| **True cost** | **23.60** |

With **50% margin** the price is 23.60 ÷ (1 − 0.5) = **47.20**. With **50% markup** it is 23.60 × 1.5 = **35.40**. The order of 3 at 47.20 is 141.60; its cost is 70.80, so profit is 70.80. With a 20% income tax on profit, 14.16 goes to tax and **56.64** stays with you. With 20% VAT on top, the invoice is 169.92. The app does exactly this for you (this example, typed in, gives these same numbers).

## Step 1: Get two helper programs

You need two free programs: **Git** (it downloads the code) and **Bun** (it prepares and runs the app).

1. Go to [git-scm.com](https://git-scm.com) and install **Git** with its normal settings.
2. Go to [bun.sh](https://bun.sh) and follow its install instructions for your computer. The app needs **version 1.4 or newer**.
3. Open a **terminal**: a window where you type commands. On Windows, press the Start button and type *PowerShell* (or *Terminal*), then press Enter. On a Mac, open the *Terminal* app.
4. Type `git --version` and press Enter.
5. Type `bun --version` and press Enter.

**What you should see:** after steps 4 and 5, each command prints a version number (for example a line starting with `git version`, and a number like `1.4.2` for Bun). If one says "not found" or "not recognized", close the terminal, open a new one and try again. If it still fails, see *When something goes wrong*.

## Step 2: Download the app

1. In the terminal, type these three lines. Press Enter after each.

```bash
git clone https://github.com/Stravelakis/Crafter-pricer.git
cd Crafter-pricer
bun install
```

**What you should see:** the first line prints progress and makes a folder called `Crafter-pricer` wherever the terminal was. The second line moves the terminal into that folder. The third prints a list of things being added and then finishes without red error text. It can take a minute.

> **Why** `git clone` copies the project to your computer. `bun install` fetches the building blocks the app is made of. You only do this once.

## Step 3: Start the app

1. Still inside the `Crafter-pricer` folder, type:

```bash
bun run dev
```

2. Open your web browser and go to **http://localhost:26419**.

**What you should see:** in the terminal, a few lines including a web address with `26419` in it. In the browser, a page called **MarginCraft** with two tabs, **Studio** and **Settings**, a sample already filled in, and a **unit price** in the top right corner (on a phone this is hidden; the price is in the dark box instead).

> **Watch out** Leave the terminal window open while you use the app. Closing it, or pressing Ctrl+C, stops the app. Your numbers stay saved in your browser; start it again with `bun run dev` and they are still there.

`localhost` just means "this same computer". Nobody else can see the page by that name.

## Step 4: Look around

1. Look at the top. **Studio** is where you price jobs. **Settings** is where you describe your business once.
2. In the Studio, the **Preset** bar at the top holds saved setups. The app starts with *Pro studio*.
3. On the right (on a phone, at the top), the **Job ticket** with a dark header is the order you are pricing, and under it the **Cost ledger** and the big price. Section 01 is called **Machine fleet & depreciation**.
4. Click the little **?** beside any field.

**What you should see:** a small box explaining that field in plain words: what it is, how to fill it, why it matters and what happens if you leave it empty. Use them whenever a word is new.

## Step 5: Tell it about you (Settings, once)

Click **Settings**.

1. **01 Labor.** Type your **Hourly wage**: what you pay yourself per hour of hands-on work. Even if you work for free right now, put a real number, because your time is not free. Leave **Burden** at 0 unless you pay employer costs on top of a wage. Pick your **Currency**.
2. **02 Bills & overhead.** Type your monthly **Rent / space**, **Utilities**, **Software subs** (subscriptions), **Insurance** and **Other bills**. Type your **Electricity** price per kWh (it is on your electricity bill). Then **Productive hours per month**: your honest guess of how many hours a month you really work on orders. Do not use 24 hours × 30 days.
3. **04 Marketing.** If you spend money on ads, fair fees or samples, type the monthly amount in **Marketing budget**.

**What you should see:** under **Bills & overhead**, two dark boxes: **Fixed costs / month** (the total of what you typed, with marketing included) and **Overhead / productive hr** (that total divided by your productive hours). Under **Labor**, a **Loaded labor rate**.

> **Do this first** Never leave **Productive hours per month** at 0. The app then skips your bills completely and your prices will quietly ignore your rent.

### Section 03 Tax system

Still in Settings, find **03 Tax system**.

1. **VAT / sales tax.** If you charge it, set your rate. Otherwise leave it at 0.
2. **Income tax regime.** Pick **On profit** and set a **Profit tax rate** if your tax is a percentage of what you earn. Pick **Presumptive** only if your country taxes small businesses from their revenue using a table.
3. Only for **Presumptive**: fill **Presumptive brackets** (one row per tier: "up to" an amount, then either **%** or a **flat** amount; an "up to" of 0 means "and above"), and **Expected period revenue**, the money you expect to bring in over the same period as the table (a month or a year).

**What you should see:** nothing changes on screen right away, but the **In your pocket** number in the Studio will now reflect your tax.

<details>
<summary>I do not know my tax rules</summary>

That is fine. Leave **VAT / sales tax** at 0 and the tax rate low, and ask your accountant or tax office what applies to you. The app does not know your country's law. It only does the arithmetic with the numbers you give it.

</details>

## Step 6: Add your machine

Go back to **Studio**. In **01 Machine fleet**, edit the sample machine, or press **Add machine**.

1. Type the **name** you use for it, such as "Prusa MK4".
2. **Type**: pick the closest, such as FDM 3D printer or Laser cutter.
3. **Purchase cost**: what you paid, including shipping and tax.
4. **Buy-back value**: what you could sell it for when you replace it.
5. **Repurchase in**: how many months until you expect to replace it.
6. **Use**: how many hours a month it really runs.
7. **Power draw**: how many watts it uses. It is on the label or in the manual.
8. **Consumables**: the cost of small parts that wear out, per running hour. A 20 nozzle that lasts 200 hours is 0.10 per hour.
9. **Maintenance**: what upkeep costs per month.

**What you should see:** a coloured bar and two numbers, **Depreciation** and **Running**, per hour, and a dark tag with the **machine rate** per run hour. If you typed the numbers from the hand example, the tag shows 1.65.

> **Why** If **Repurchase in** or **Use** is 0, the app thinks the machine lasts forever and depreciation becomes zero. Every job using it will then be underpriced.

If you have several machines, the panel shows only the one selected on the job, with a bar that says **Focused view**. Press **Show all** to see them all.

## Step 7: Price a job

In the dark **Job ticket**:

1. **Job name**: what the customer would recognise, like "Walnut coaster set".
2. **Machine**: pick the machine that does the work.
3. **Machine time**: hours the machine runs for **one piece**.
4. **Labor time**: your own hours for **one piece**: preparing, finishing, packing.
5. **Materials**: the cost of materials for **one piece**.
6. **Setup / prep fee**: a one-time fee for the **whole order**.
7. **Quantity**: how many pieces are in the order.
8. Under **Profit model**, choose **Margin** or **Markup** and drag the slider.

**What you should see:** the **Cost ledger** lists Materials, Machine time, Labor, Overhead share and Setup / file prep, then **True cost per unit**. The big dark box shows **Your price · per unit**, the order total, then **Profit**, the tax, and **In your pocket**. Move the slider and everything updates at once.

> **Try it** Type the numbers from the hand example (3 pieces, 4 hours machine, 0.5 hours labour, materials 3, setup 6) and pick 50% **Margin**. Your price per unit should read 47.20 if the rest of your Settings matches the example too.

## Step 8: Is that price sensible?

The **Market signal** panel (under the price) compares your order total with market rates.

1. In **Compare against**, pick a range that fits your work, such as "Engraved gift item".
2. In **Job size**, say how many units of that range your order uses. For a "per item" range, it is the number of pieces.

**What you should see:** a bar with the typical price band and a mark for your price, plus a sentence: **Under market**, **In market range**, or **Premium**. Below, three buttons under **Snap your margin to a target**: **Break-even floor** (zero profit before tax), **Market match** (middle of the band) and **Market high**. Press one and your margin (or markup, if that is what you picked) changes to land on that total. Break-even means zero profit before tax.

> **Watch out** The built-in ranges are rough, public figures in **US dollars**. They are a starting point, not a verdict. Check what people really pay where you sell.

## Step 9: Write an offer letter

1. Press **Write offer letter (.md)** under the price.
2. Type the **Client name**. Set **Valid for** (days) and add **Extra notes** if you want.
3. Press **Copy markdown** or **Download .md**.

**What you should see:** a live preview of the letter with your numbers. After **Download .md** a file starting with `offer-` appears in your downloads; open it with any text editor. You can change the wording in **Settings → 07 Offer letter**.

## Step 10: Save your setup

1. In the Studio, press **Save current…** on the **Preset** bar.
2. Type a name and a location or context, then **Save snapshot**.

**What you should see:** a message "Preset … saved", and your preset in the Preset menu.

> **Watch out** Choosing a preset **replaces** your current machines, settings and job with the preset's. Save yours first.

## Step 11: Decide about the extras

You can stop here. The calculator is complete. These need keys and are optional:

- **Competitor research:** searches the web for what others charge. Needs a key or address for a search service in **Settings → 05 AI & search integrations**. What you type is sent to that service.
- **AI specs** and **Photo** on a machine card: an AI fills a summary of your machine, or draws a picture. They send the machine's name and details to the service you configured.
- **Google Sheets price log:** adds a dated row in your own Google spreadsheet each time you press Sync.

If you do nothing, **nothing leaves your browser**.

## If something goes wrong

<details>
<summary>"git" or "bun" is not recognized</summary>

The program is installed but the terminal does not know where it is. Close the terminal completely and open a new one, then type `git --version` or `bun --version` again. Still nothing: run the installer again for that program and follow its last screen.

</details>

<details>
<summary>The browser says the page cannot be reached</summary>

The app is probably not running. Look at the terminal: it must still show the app running. If it is back at a prompt, type `bun run dev` again. Check you opened `http://localhost:26419` with **26419** in it.

</details>

<details>
<summary>The terminal says the port is already in use</summary>

Another copy is already running somewhere. Find that terminal and press Ctrl+C in it, or start this one on another port with `bunx vite --port 27000`, then open the address with that number.

</details>

<details>
<summary>My numbers disappeared</summary>

They live in your browser's storage for this page. They disappear if you clear the browser's site data, switch to another browser, open the page at a different address (for example another port) or use a private window. There is no way to get them back, so keep the important numbers written down somewhere else too.

</details>

<details>
<summary>My price looks too low</summary>

The usual reasons: **Hourly wage** is 0, **Labor time** is 0, **Productive hours per month** is 0 (bills ignored), or the machine's **Repurchase in** or **Use** is 0. The **?** button on each field says what happens when it is empty.

</details>

<details>
<summary>The income tax looks far too high (Presumptive)</summary>

Open **Settings → 03 Tax system** and fill **Expected period revenue**. Without it the job counts as your whole year, so a flat tier lands on that one job.

</details>

<details>
<summary>"Add your … key in Settings"</summary>

That feature needs its own key or address, and you have not typed one. Open **Settings → 05 AI & search integrations** and fill it in, or skip the feature. The calculator does not need any key.

</details>

<details>
<summary>Research returns nothing, or a listing has no price</summary>

Try a shorter, more general description. Some listings do not show a clear price in their text: open the link and type the price in yourself under **Market intel**. If you use SearXNG or Crawl4AI, your server also has to allow requests from the browser.

</details>

<details>
<summary>The $ sign does not change when I pick EUR or GBP</summary>

That is a known gap. The boxes always show `$`. Results use the currency you picked, but nothing is converted, so just type your own currency's numbers in every box.

</details>

## A small dictionary

- **Cost-plus pricing:** your cost plus the profit you want.
- **True cost:** everything one piece really costs you.
- **Machine rate:** the cost of one running hour of a machine.
- **Depreciation:** the value a machine loses as it works, spread over its hours.
- **Buy-back value:** what you could sell the machine for when you replace it.
- **Consumables:** small parts that wear out while the machine works.
- **Overhead:** bills you pay anyway, shared across your working hours.
- **Productive hours:** hours a month you really work on orders.
- **Burden:** extra employer costs added on top of a wage.
- **Margin:** profit as a share of the price.
- **Markup:** profit as a share of the cost.
- **VAT:** a tax added to your price that you pass on.
- **Presumptive tax:** a tax worked out from your revenue using a table of brackets.
- **Benchmark:** a market price you compare yours with.
- **Preset:** a saved setup you can load again.
- **API key:** a secret code that lets the app use a service in your name.

## What next?

- Add every machine you own and price your five most common jobs.
- Run the **Snap your margin to a target** buttons on a job and notice how the market and your costs differ.
- Open the **Guide** section at the bottom of this site for the complete field list and the Google Sheets steps.
- Write down your settings somewhere safe once you are happy with them.

## Stop and remove it

1. In the terminal, press **Ctrl+C** to stop the app.
2. To remove the app itself, delete the `Crafter-pricer` folder.
3. To erase the numbers it saved, clear the browser's site data for `localhost:26419`.

**What you should see:** after step 1, the terminal returns to a prompt; the browser page stops responding. After step 3, opening the page again starts with the *Pro studio* sample.
