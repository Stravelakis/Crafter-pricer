import type {
  Integrations,
  Preset,
  ResearchEntry,
  TaxBracket,
} from "../types";

export const uid = () => Math.random().toString(36).slice(2, 10);

const brackets = (rows: [number, "percent" | "fixed", number][]): TaxBracket[] =>
  rows.map(([upTo, kind, value]) => ({ id: uid(), upTo, kind, value }));

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: "side",
    name: "Side hustle",
    location: "Home garage",
    machines: [
      {
        id: "sh-fdm",
        name: "Creality Ender 3 V2",
        type: "fdm",
        purchaseCost: 320,
        salvageValue: 140,
        lifespanMonths: 36,
        hoursPerMonth: 25,
        watts: 180,
        consumablesPerHour: 0.55,
        maintenancePerMonth: 8,
      },
    ],
    settings: {
      currency: "USD",
      hourlyWage: 18,
      laborBurdenPct: 0,
      electricityRate: 0.16,
      rent: 0,
      utilities: 35,
      software: 12,
      insurance: 0,
      otherBills: 10,
      billableHours: 25,
      vatPct: 0,
      profitTaxPct: 18,
      regime: "profit",
      brackets: brackets([[0, "percent", 18]]),
      presumptiveRevenue: 12000,
      marketingMonthly: 25,
    },
    job: {
      name: "PLA desk organizer batch",
      machineId: "sh-fdm",
      machineHours: 3.5,
      laborHours: 0.75,
      materialCost: 4.2,
      setupFee: 5,
      quantity: 2,
      marginMode: "margin",
      marginPct: 45,
      benchmarkId: "fdm-hour",
      benchmarkUnits: 3.5,
    },
  },
  {
    id: "pro",
    name: "Pro studio",
    location: "Rented workshop",
    machines: [
      {
        id: "ps-fdm",
        name: "Prusa MK4",
        type: "fdm",
        purchaseCost: 1100,
        salvageValue: 550,
        lifespanMonths: 48,
        hoursPerMonth: 60,
        watts: 220,
        consumablesPerHour: 0.8,
        maintenancePerMonth: 15,
      },
      {
        id: "ps-sla",
        name: "Elegoo Saturn 4 Ultra",
        type: "sla",
        purchaseCost: 500,
        salvageValue: 220,
        lifespanMonths: 36,
        hoursPerMonth: 40,
        watts: 90,
        consumablesPerHour: 1.4,
        maintenancePerMonth: 12,
      },
      {
        id: "ps-laser",
        name: "55W CO₂ laser cutter",
        type: "laser-cut",
        purchaseCost: 3800,
        salvageValue: 1900,
        lifespanMonths: 60,
        hoursPerMonth: 45,
        watts: 1400,
        consumablesPerHour: 1.1,
        maintenancePerMonth: 25,
      },
    ],
    settings: {
      currency: "USD",
      hourlyWage: 32,
      laborBurdenPct: 8,
      electricityRate: 0.18,
      rent: 650,
      utilities: 190,
      software: 95,
      insurance: 130,
      otherBills: 60,
      billableHours: 110,
      vatPct: 21,
      profitTaxPct: 26,
      regime: "profit",
      brackets: brackets([[0, "percent", 26]]),
      presumptiveRevenue: 60000,
      marketingMonthly: 380,
    },
    job: {
      name: "Walnut coaster set — engraved",
      machineId: "ps-laser",
      machineHours: 1.2,
      laborHours: 0.9,
      materialCost: 6.5,
      setupFee: 8,
      quantity: 6,
      marginMode: "margin",
      marginPct: 55,
      benchmarkId: "engrave-item",
      benchmarkUnits: 6,
    },
  },
  {
    id: "floor",
    name: "Production floor",
    location: "Industrial unit",
    machines: [
      {
        id: "pf-fdm-a",
        name: "Prusa MK4 — Line A",
        type: "fdm",
        purchaseCost: 1100,
        salvageValue: 550,
        lifespanMonths: 48,
        hoursPerMonth: 160,
        watts: 220,
        consumablesPerHour: 0.8,
        maintenancePerMonth: 15,
      },
      {
        id: "pf-fdm-b",
        name: "Prusa MK4 — Line B",
        type: "fdm",
        purchaseCost: 1100,
        salvageValue: 550,
        lifespanMonths: 48,
        hoursPerMonth: 160,
        watts: 220,
        consumablesPerHour: 0.8,
        maintenancePerMonth: 15,
      },
      {
        id: "pf-uv",
        name: "Mimaki UJF-3042 UV flatbed",
        type: "uv",
        purchaseCost: 16500,
        salvageValue: 7000,
        lifespanMonths: 72,
        hoursPerMonth: 140,
        watts: 1800,
        consumablesPerHour: 6.5,
        maintenancePerMonth: 140,
      },
      {
        id: "pf-laser",
        name: "150W CO₂ cutter",
        type: "laser-cut",
        purchaseCost: 6800,
        salvageValue: 3000,
        lifespanMonths: 72,
        hoursPerMonth: 120,
        watts: 2400,
        consumablesPerHour: 2.2,
        maintenancePerMonth: 90,
      },
    ],
    settings: {
      currency: "USD",
      hourlyWage: 38,
      laborBurdenPct: 12,
      electricityRate: 0.15,
      rent: 1900,
      utilities: 420,
      software: 220,
      insurance: 260,
      otherBills: 150,
      billableHours: 320,
      vatPct: 21,
      profitTaxPct: 30,
      regime: "profit",
      brackets: brackets([
        [25000, "fixed", 600],
        [100000, "percent", 4],
        [0, "percent", 8],
      ]),
      presumptiveRevenue: 180000,
      marketingMonthly: 950,
    },
    job: {
      name: "Acrylic signage — UV print + cut",
      machineId: "pf-uv",
      machineHours: 2.4,
      laborHours: 1.6,
      materialCost: 38,
      setupFee: 25,
      quantity: 4,
      marginMode: "margin",
      marginPct: 50,
      benchmarkId: "uv-item",
      benchmarkUnits: 4,
    },
  },
];

export const DEFAULT_RESEARCH: ResearchEntry[] = [
  {
    id: "rs-etsy",
    label: "Etsy — engraved coaster set (6 pcs)",
    low: 95,
    high: 165,
    unit: "$/set",
    source: "etsy.com search",
  },
  {
    id: "rs-space",
    label: "Local makerspace — laser rate",
    low: 1.0,
    high: 1.8,
    unit: "$/min",
    source: "community rate sheet",
  },
  {
    id: "rs-treat",
    label: "Treatstock — FDM PETG",
    low: 0.8,
    high: 1.6,
    unit: "$/g",
    source: "treatstock.co listings",
  },
];

export const DEFAULT_INTEGRATIONS: Integrations = {
  aiBase: "https://api.openai.com/v1",
  aiKey: "",
  aiModel: "gpt-4o-mini",
  provider: "tavily",
  tavilyKey: "",
  firecrawlKey: "",
  searxngUrl: "",
  crawl4aiUrl: "",
  cfAccountId: "",
  cfToken: "",
  cfModel: "@cf/black-forest-labs/flux.1-schnell",
  sheetsWebhook: "",
  sheetsSecret: "",
};

/** random secret for the Sheets bridge; crypto-strength so it can't be guessed */
export function newSheetsSecret(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const DEFAULT_OFFER_TEMPLATE = `# Offer — {{item}}

Hi {{client}},

Thank you for your interest in our work. Here is our offer:

| | |
|---|---|
| **Item** | {{item}} |
| **Quantity** | {{qty}} |
| **Unit price (net)** | {{unit_price}} |
| **Subtotal (net)** | {{total_price}} |
| **VAT ({{vat_pct}}%)** | {{vat}} |
| **Invoice total** | {{invoice_total}} |

- **Turnaround:** {{turnaround}}
- **Offer valid until:** {{valid_until}}
- **Payment:** 50% upfront, 50% on delivery.

{{notes}}

— {{business_name}}
`;

export const DEFAULT_OFFER_DEFAULTS = {
  businessName: "Your Maker Studio",
  turnaround: "5–7 business days",
  validDays: 14,
};
