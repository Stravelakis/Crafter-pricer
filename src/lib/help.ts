export interface HelpEntry {
  what: string;
  how: string;
  why: string;
  empty: string;
}

/** Plain-language field guide, keyed by help id used across the app. */
export const HELP: Record<string, HelpEntry> = {
  /* ---------- machines ---------- */
  mName: {
    what: "The name of this machine, the way you'd refer to it yourself.",
    how: "Brand + model works best — e.g. “Prusa MK4” or “55W CO₂ cutter”. The AI spec lookup searches by this exact name, so the closer to the real product name, the better.",
    why: "It labels every hourly rate, every quote row, every research-log entry and every Google Sheets tab.",
    empty: "The card shows “Unnamed machine”. Nothing breaks — the math is unaffected, it just becomes hard to tell machines apart.",
  },
  mType: {
    what: "What kind of work this machine does.",
    how: "Pick the closest category: FDM printer, resin printer, UV flatbed, laser engraver, laser cutter, CNC or other.",
    why: "The category decides which street-rate benchmark is suggested when you price a job, so you compare against the right market.",
    empty: "Defaults to FDM printer, which may suggest the wrong market benchmark.",
  },
  mPurchase: {
    what: "What the machine cost you — or what you'd pay for it today.",
    how: "Enter the full price including shipping and taxes, in your working currency.",
    why: "This is the amount you must earn back through jobs before the machine has paid for itself. It's the input behind the depreciation-per-hour number on the card.",
    empty: "At 0 the machine is treated as free — depreciation is zero and your prices will never recover the purchase.",
  },
  mSalvage: {
    what: "What you expect to get back when you eventually replace (re-buy) the machine.",
    how: "Make an honest guess at its resale or trade-in value at the end of its life. Check sold listings for the same model.",
    why: "Depreciation only has to cover the value you lose (purchase minus buy-back), not the whole price — a realistic figure keeps your hourly rate fair.",
    empty: "Assumed to be 0, meaning you plan to recover the entire purchase price. Slightly conservative — your rate will be a touch higher.",
  },
  mLifespan: {
    what: "How many months you expect to run this machine before replacing it.",
    how: "Think in upgrades, not breakdowns — e.g. 36 months if you typically refresh printers every three years.",
    why: "The shorter the life, the faster you must earn the purchase back, and the higher the hourly rate. This is the “repurchase time” that drives depreciation.",
    empty: "At 0 the machine is assumed to live forever — depreciation silently becomes zero and you underprice every job that uses it.",
  },
  mHours: {
    what: "How many hours per month the machine actually spends producing billable work.",
    how: "Be conservative — count real orders plus test prints, not 24/7 potential. 4 hours a day ≈ 90 h/month.",
    why: "It spreads the machine's fixed costs over productive time. Fewer hours means each hour must carry more cost.",
    empty: "At 0 the machine rate drops to zero — as if the machine cost nothing to run. Always put in a realistic number.",
  },
  mWatts: {
    what: "The machine's average power draw while it's running, in watts.",
    how: "Find it on the spec sheet or measure it with a plug meter. Typical: FDM 150–350 W, resin 60–150 W, UV flatbed 1–2 kW, CO₂ laser 1–2.5 kW.",
    why: "It converts your electricity price per kWh into a running cost per machine hour. Power-hungry lasers and UV printers add up.",
    empty: "Electricity is ignored for this machine — a small underprice, usually acceptable for desktop printers.",
  },
  mConsumables: {
    what: "Wear parts consumed per hour of running: nozzles, resin film, lenses, belts, ink heads…",
    how: "Take the part's price and divide by the hours it lasts. E.g. a $20 nozzle replaced every 200 h = $0.10/h.",
    why: "Resin, UV and laser machines quietly eat consumables. Missing them is one of the most common ways makers lose margin.",
    empty: "Assumed zero. Fine for a cheap FDM setup, risky for UV and laser work.",
  },
  mMaintenance: {
    what: "Scheduled upkeep cost per month — cleaning kits, lubricants, calibration, servicing.",
    how: "Average your yearly maintenance spend and divide by 12.",
    why: "Keeps the machine producing sellable quality; folded into the per-hour running cost.",
    empty: "Not accounted for. If your machine needs real servicing, add a monthly estimate.",
  },

  /* ---------- labor ---------- */
  lWage: {
    what: "What you pay yourself for each hour of hands-on work.",
    how: "Use the rate you'd happily accept if someone hired you — include your skill, not just a minimum wage.",
    why: "For most makers, labor is the biggest cost of a job. If you underprice your time, you're effectively volunteering.",
    empty: "At 0 your labor is counted as free — quotes will look great and pay you nothing for your hours.",
  },
  lBurden: {
    what: "Extra costs stacked on top of your wage: payroll tax, benefits, pension.",
    how: "0% if you're a solo hobbyist; roughly 8–20% if you employ people, depending on your country.",
    why: "A $30/h wage really costs ~$35/h once employer costs are added. This makes the “loaded rate” honest.",
    empty: "Assumed 0 — the wage is treated as the full cost of labor.",
  },
  lCurrency: {
    what: "The currency all amounts in the app are shown in.",
    how: "Pick the one you actually invoice customers in.",
    why: "Formatting only — nothing is converted, so pick it once and keep all numbers in that currency.",
    empty: "Not possible — USD is the default.",
  },

  /* ---------- bills ---------- */
  bRent: {
    what: "What your workspace costs you per month.",
    how: "Your rent — or a fair share of home costs if you work from a garage or spare room.",
    why: "It's a fixed cost every job must help pay back, spread across your productive hours.",
    empty: "At 0 your space is treated as free — perfectly fine if it genuinely is.",
  },
  bUtils: {
    what: "Monthly utilities other than machine electricity: internet, water, heating, phone.",
    how: "A typical month's bill, or the yearly total divided by 12.",
    why: "Part of the overhead that lands on every productive hour.",
    empty: "Not counted. Small, but easy to include.",
  },
  bSoftware: {
    what: "Subscriptions you need to do the work: CAD, slicers, design tools, storefront, hosting.",
    how: "Total monthly cost; divide yearly plans by 12.",
    why: "Tools you can't sell without are a real monthly cost of each job.",
    empty: "Not counted.",
  },
  bInsurance: {
    what: "Liability and equipment insurance per month.",
    how: "Yearly premium divided by 12.",
    why: "One accident can erase a year of profit; the monthly slice belongs in your prices.",
    empty: "Not counted — a risk worth being aware of.",
  },
  bOther: {
    what: "Any other regular monthly cost: bank fees, packaging supplies, accountant, market-stall fees.",
    how: "Add them up; rough is fine.",
    why: "Small leaks sink margins — this catch-all keeps them visible.",
    empty: "Not counted.",
  },
  bKwh: {
    what: "Your electricity price per kilowatt-hour.",
    how: "Read it off your energy bill: total cost ÷ kWh used. Typical homes: $0.12–0.35.",
    why: "It turns each machine's wattage into a real cost per running hour.",
    empty: "At 0 electricity is free. Harmless for small printers, significant for lasers and UV.",
  },
  bBillable: {
    what: "Total productive hours per month across your whole shop — machine time plus your labor time.",
    how: "A realistic figure, e.g. 4 focused hours/day × 22 days ≈ 88. Don't count idle time.",
    why: "This is the divisor that turns your monthly bills into an overhead cost per hour. The fewer productive hours, the more every hour must carry.",
    empty: "At 0 overhead allocation is skipped entirely — your quotes will silently ignore rent, bills and marketing.",
  },

  /* ---------- taxes ---------- */
  tVat: {
    what: "The VAT or sales tax you must add on top of your net prices when invoicing.",
    how: "Your country's standard rate — e.g. 19% Germany, 21% Spain/Netherlands, 20% UK, often 0% for small US sellers.",
    why: "VAT is charged to the customer on top of your price. If you forget it, you pay it out of your own profit.",
    empty: "At 0 no VAT is added — correct if you're exempt or below the registration threshold, wrong if you're VAT-registered.",
  },
  tRegime: {
    what: "How your income tax is calculated: on profit, or presumptively on revenue.",
    how: "Choose “On profit” if you're taxed on what's left after costs. Choose “Presumptive” if your country taxes small businesses as a slice of revenue (tiered brackets).",
    why: "Matching your real tax scheme makes the “in your pocket” number on the price panel truthful.",
    empty: "Defaults to profit-based tax.",
  },
  tProfit: {
    what: "The percentage of each job's profit you'll owe as income tax.",
    how: "Use your marginal rate, or your expected average — check last year's return.",
    why: "Gross profit isn't yours. This slider shows what actually lands in your pocket.",
    empty: "At 0 the app pretends there is no income tax — “in your pocket” will be overstated.",
  },
  tBrackets: {
    what: "Revenue tiers for presumptive tax: up to a certain revenue you owe a given percent or flat amount.",
    how: "One row per tier. “Up to” is the revenue ceiling (per month or year, matching your scheme); set the top tier's cap to $0, which means “and above”. Choose % of revenue or a flat fee per tier.",
    why: "Presumptive schemes jump tiers as revenue grows — the right bracket keeps the tax slice realistic.",
    empty: "With no brackets, presumptive tax computes as 0 — add at least one catch-all row ($0 cap) with your rate.",
  },

  /* ---------- marketing ---------- */
  mkBudget: {
    what: "What you spend per month to win customers: ads, craft-fair fees, samples, freebies.",
    how: "A monthly average — divide yearly fair budgets by 12.",
    why: "It flows into the overhead rate, so every job pays back a slice of customer acquisition instead of your cheapest quotes eating the ad budget.",
    empty: "At 0 no acquisition cost is priced in — growth will quietly cost more than quotes suggest.",
  },

  /* ---------- job ticket ---------- */
  jName: {
    what: "The title of the order you're quoting.",
    how: "Write what the customer would recognize — “Engraved walnut coaster set” beats “job12”.",
    why: "It appears on the ticket, the offer letter and the research log.",
    empty: "Shows as “Untitled job” — nothing else is affected.",
  },
  jMachine: {
    what: "Which machine from your fleet does the work.",
    how: "Pick from the dropdown — only machines you've added in section 01 appear.",
    why: "The quote uses that machine's hourly rate (depreciation + energy + consumables + maintenance) for the machine-time line.",
    empty: "Machine time is priced at $0 — the quote ignores the machine entirely.",
  },
  jMachineH: {
    what: "Hours the machine runs to make one unit.",
    how: "Take it from the slicer estimate or past jobs. For long prints, add a little margin for failures.",
    why: "Multiplied by the machine's hourly rate. Double the hours, double that cost line.",
    empty: "At 0 machine time is free — fine for hand work, wrong for printed or cut parts.",
  },
  jLaborH: {
    what: "Your hands-on time per unit: file prep, setup, post-processing, finishing, packing.",
    how: "Time one unit honestly, including cleanup. Repeat work gets faster — average a small batch.",
    why: "Multiplied by your loaded wage. This is usually the line that decides whether a job is worth taking.",
    empty: "At 0 your time is free — the most common underpricing mistake.",
  },
  jMaterials: {
    what: "Raw material cost of one unit at your purchase price.",
    how: "Filament, resin, wood, acrylic, ink — weighed or measured per piece. Include a bit of waste.",
    why: "The most visible cost, and the easiest to get right.",
    empty: "At 0 materials are free — only correct for pure service work on customer-supplied parts.",
  },
  jSetup: {
    what: "A one-time fee for the whole order: file preparation, fixtures, artwork, calibration.",
    how: "Charge it once per order — the ledger automatically spreads it across the quantity.",
    why: "Setup doesn't shrink when the batch grows, so small orders must carry their fair share.",
    empty: "No setup is recovered. Add it whenever you do non-repeating prep work.",
  },
  jQty: {
    what: "How many pieces are in this order.",
    how: "The exact quantity you're quoting for.",
    why: "Scales the order total and thins out the per-unit setup fee.",
    empty: "Treated as 1 piece.",
  },
  jMode: {
    what: "How profit is defined: margin (share of the final price) vs markup (added on top of cost).",
    how: "Pick whichever your head works in. Switching modes converts the number for you, so the price doesn't jump.",
    why: "The same number means very different profits: 50% markup is only ~33% margin. Knowing both keeps you honest.",
    empty: "Not applicable — one of the two is always selected.",
  },
  jPct: {
    what: "How much profit you want on this job.",
    how: "Slide until the price feels sellable, then check the market-signal meter below. Higher risk, rush jobs and custom design work deserve more.",
    why: "This is the difference between covering costs and running a business.",
    empty: "At 0 you quote at exact cost — a break-even offer with no profit.",
  },

  /* ---------- market signal ---------- */
  sigBench: {
    what: "The market rate you want to compare your price against.",
    how: "Pick a built-in street rate, a price you logged in Market Intel, or a finding from competitor research (marked ★).",
    why: "It powers the meter that tells you whether you're under, in, or above the market.",
    empty: "Comparison is switched off — the meter waits for a benchmark.",
  },
  sigSize: {
    what: "How many units of the benchmark this whole order uses.",
    how: "Match the benchmark's unit: grams for $/g rates, minutes for $/min, items for per-item rates.",
    why: "It scales the market band to your order size, so you compare apples to apples.",
    empty: "At 0 the market band collapses to zero — the comparison becomes meaningless.",
  },

  /* ---------- research ---------- */
  rqQuery: {
    what: "A plain-language description of the item you want to price.",
    how: "Write it the way a customer would search for it — “engraved wooden coaster set of 6” rather than “job 47”. More specific = closer comparable listings.",
    why: "This text is sent to your search provider to find competitor listings and their prices.",
    empty: "The Research button stays disabled — there's nothing to search for.",
  },
  rqProvider: {
    what: "Which search service fetches competitor listings for you.",
    how: "Pick the one whose key or URL you've entered in Settings → AI & search integrations. Tavily and Firecrawl are cloud API keys; SearXNG and Crawl4AI are self-hosted URLs.",
    why: "Each service returns results differently — choose the one you trust and have credentials for.",
    empty: "Defaults to Tavily, but research will fail until a valid key/URL exists for the chosen provider.",
  },

  /* ---------- market intel log ---------- */
  logLabel: {
    what: "A short name for the price you found.",
    how: "Item + where you saw it, e.g. “Etsy — walnut coaster set (6)”.",
    why: "It shows up in the benchmark dropdown, so future-you knows what it means.",
    empty: "The row can't be saved.",
  },
  logLow: {
    what: "The cheapest comparable price you saw.",
    how: "Scan a handful of listings and take the lowest realistic one — ignore obvious outliers and sales.",
    why: "Forms the bottom of the “typical band” on the market meter.",
    empty: "With a 0 high, the row can't be saved.",
  },
  logHigh: {
    what: "The priciest comparable you saw.",
    how: "The top realistic listing for the same kind of item.",
    why: "Forms the top of the typical band.",
    empty: "Must be above 0 to save the row.",
  },
  logUnit: {
    what: "What that price is per — item, gram, minute…",
    how: "Short unit like “$/item”, “$/g”, “$/min”. It tells you how to size the job when comparing.",
    why: "A $12 price means nothing until you know it's per item or per gram.",
    empty: "Defaults to “$/job”.",
  },
  logSource: {
    what: "Where you saw the price: a URL or shop name.",
    how: "Paste the listing link if you have it.",
    why: "Lets you re-verify the price later — markets move.",
    empty: "Logged as “my research”.",
  },

  /* ---------- offer letter ---------- */
  oClient: {
    what: "Who the offer is addressed to.",
    how: "Customer or company name.",
    why: "Personalizes the letter instead of leaving a placeholder.",
    empty: "The letter keeps a “{{client}}” placeholder you can fill by hand.",
  },
  oValid: {
    what: "How many days this quote stays valid.",
    how: "14 days is typical; shorter for volatile material prices.",
    why: "Protects you from being held to old prices when material costs move.",
    empty: "Falls back to the default validity from Settings.",
  },
  oNotes: {
    what: "Anything extra: rush options, revision policy, files you need from the client.",
    how: "Free text, shown as-is in the letter.",
    why: "Sets expectations before the work starts.",
    empty: "Omitted from the letter.",
  },
  oTemplate: {
    what: "The markdown skeleton of your offer letter.",
    how: "Edit freely. Any {{placeholder}} (listed below the box) is replaced with live values from the current quote when you open the letter.",
    why: "One template, always-consistent offers — change your wording once, apply it everywhere.",
    empty: "If emptied, letters render without structure — the app falls back to the default template if this field is blank.",
  },
  oBusiness: {
    what: "Your studio's name, printed at the bottom of every offer.",
    how: "Exactly how you want it to appear to clients.",
    why: "Branding on every quote you send.",
    empty: "Shows as “Your Maker Studio”.",
  },
  oTurnaround: {
    what: "The delivery promise written into offers.",
    how: "Be realistic — “5–7 business days”, “2 weeks”.",
    why: "Clients quote you against this promise; underpromising loses trust.",
    empty: "Defaults to “5–7 business days”.",
  },
  oValidDays: {
    what: "Default quote validity in days, pre-filled in the offer dialog.",
    how: "Any positive number.",
    why: "Saves you typing it per offer.",
    empty: "Falls back to 14.",
  },

  /* ---------- integrations ---------- */
  iBase: {
    what: "The base URL of any OpenAI-compatible chat API.",
    how: "OpenAI: https://api.openai.com/v1 · OpenRouter: https://openrouter.ai/api/v1 · Groq: https://api.groq.com/openai/v1 · local Ollama: http://localhost:11434/v1",
    why: "Model-agnostic by design: any service that speaks the OpenAI format can power the AI spec lookups.",
    empty: "AI features switch off; everything else keeps working.",
  },
  iKey: {
    what: "Your API key for the service above.",
    how: "Paste the key from your provider's dashboard. It's stored only in this browser and sent only to the base URL you configured.",
    why: "Authenticates the spec lookups and enrichments.",
    empty: "The “AI specs” button reports that a key is missing.",
  },
  iModel: {
    what: "The model id at that provider.",
    how: "E.g. gpt-4o-mini, gpt-4.1, openrouter/auto, llama-3.3-70b-versatile — whatever your endpoint accepts.",
    why: "Controls the quality and cost of machine spec lookups.",
    empty: "Requests will fail — every provider needs a model name.",
  },
  iTavily: {
    what: "Your Tavily search API key.",
    how: "Create one free at tavily.com → dashboard → API keys; starts with “tvly-”.",
    why: "Powers “Research market prices” — live competitor listings with links.",
    empty: "Research fails until a key is added (or another provider is chosen).",
  },
  iFirecrawl: {
    what: "Your Firecrawl API key.",
    how: "From firecrawl.dev → API keys; starts with “fc-”.",
    why: "Alternative research engine — strong at extracting prices from product pages.",
    empty: "Research fails until a key is added (or another provider is chosen).",
  },
  iSearx: {
    what: "The URL of your self-hosted SearXNG instance.",
    how: "E.g. https://search.yourdomain.com — the instance must allow JSON output and CORS (enabled in SearXNG's settings.yml under formats: json).",
    why: "Private, key-free competitor research through your own meta-search engine.",
    empty: "Research fails until a reachable instance URL is set.",
  },
  iCrawl: {
    what: "The URL of your Crawl4AI server.",
    how: "E.g. http://localhost:11235 — run it via the official Docker image; the app posts to its /crawl endpoint with an extraction prompt.",
    why: "Crawls competitor pages directly and extracts prices with an LLM of your choice.",
    empty: "Research fails until a running server URL is set.",
  },
  iCfAccount: {
    what: "Your Cloudflare account ID.",
    how: "Cloudflare dashboard → Workers & Pages → the hex “Account ID” shown on the right.",
    why: "Routes image generation to your Workers AI account.",
    empty: "The machine “Photo” button reports missing credentials.",
  },
  iCfToken: {
    what: "A Cloudflare API token with Workers AI permissions.",
    how: "Dashboard → My Profile → API Tokens → Create → use the “Workers AI” template (Edit permission).",
    why: "Authenticates the image model calls.",
    empty: "Photo generation is disabled.",
  },
  iCfModel: {
    what: "Which Workers AI image model generates the reference photo.",
    how: "Default is @cf/black-forest-labs/flux.1-schnell (fast). Swap in any image model your account can run.",
    why: "Different models trade speed against quality.",
    empty: "Falls back to FLUX.1-schnell.",
  },

  /* ---------- google sheets ---------- */
  sWebhook: {
    what: "The URL of a tiny Google Apps Script web app that receives your price log.",
    how: "1) Open script.google.com → new project → paste the bridge script (button below). 2) Deploy → Web app → run as “Me”, access “Anyone”. 3) Copy the …/exec URL here.",
    why: "Every “Sync to Sheets” press then appends a dated row — your quote vs the market range, with source links — into a tab named after the machine.",
    empty: "No problem: sync downloads a CSV file instead, which you can open in Sheets manually.",
  },
  sFileId: {
    what: "The ID of an existing spreadsheet to log into (the long string in the sheet's URL).",
    how: "Optional. Create a sheet, copy the ID from its URL, paste it here.",
    why: "Reuses one spreadsheet you control instead of auto-creating a new one.",
    empty: "The bridge script creates “MarginCraft — price log” automatically on first sync.",
  },

  /* ---------- presets ---------- */
  pName: {
    what: "A name for this saved snapshot of your business setup.",
    how: "Something you'll recognize in a year: “Berlin studio”, “Summer craft-fair kit”.",
    why: "Lets you switch an entire business configuration — machines, costs, sample job — in one click.",
    empty: "The preset can't be saved without a name.",
  },
  pLocation: {
    what: "Where or for whom this setup applies.",
    how: "City, market channel, client type — “Porto, PT · B2B signage”.",
    why: "Pricing differs wildly by location; the label keeps presets from blurring together.",
    empty: "Logged as “Custom”.",
  },
};
