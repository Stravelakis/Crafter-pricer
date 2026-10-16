export type MachineType =
  | "fdm"
  | "sla"
  | "uv"
  | "laser-engrave"
  | "laser-cut"
  | "cnc"
  | "other";

export type Currency = "USD" | "EUR" | "GBP";
export type MarginMode = "margin" | "markup";
export type TaxRegime = "profit" | "presumptive";
export type SearchProvider = "tavily" | "firecrawl" | "searxng" | "crawl4ai";

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  purchaseCost: number;
  salvageValue: number;
  lifespanMonths: number;
  hoursPerMonth: number;
  watts: number;
  consumablesPerHour: number;
  maintenancePerMonth: number;
  summary?: string;
  specs?: [string, string][];
  links?: { product?: string | null; manual?: string | null };
  image?: string;
}

/** upTo = 0 means "and above" (catch-all top bracket) */
export interface TaxBracket {
  id: string;
  upTo: number;
  kind: "percent" | "fixed";
  value: number;
}

export interface Settings {
  currency: Currency;
  hourlyWage: number;
  laborBurdenPct: number;
  electricityRate: number;
  rent: number;
  utilities: number;
  software: number;
  insurance: number;
  otherBills: number;
  billableHours: number;
  vatPct: number;
  profitTaxPct: number;
  regime: TaxRegime;
  brackets: TaxBracket[];
  /** expected revenue for the period the brackets describe (month or year) */
  presumptiveRevenue: number;
  marketingMonthly: number;
}

export interface Job {
  name: string;
  machineId: string;
  machineHours: number;
  laborHours: number;
  materialCost: number;
  setupFee: number;
  quantity: number;
  marginMode: MarginMode;
  marginPct: number;
  benchmarkId: string;
  benchmarkUnits: number;
}

export interface Quote {
  depRate: number;
  runRate: number;
  machineRate: number;
  overheadRate: number;
  laborRate: number;
  qty: number;
  uMaterials: number;
  uMachine: number;
  uLabor: number;
  uOverhead: number;
  uSetup: number;
  unitCost: number;
  totalCost: number;
  unitPrice: number;
  totalPrice: number;
  vatPct: number;
  vat: number;
  invoiceTotal: number;
  profit: number;
  profitTax: number;
  presumptiveTax: number;
  /** effective presumptive rate applied to this job's revenue, in % */
  presumptiveRatePct: number;
  /** true when no period revenue is set, so the job's own revenue stood in for it */
  presumptiveRevenueMissing: boolean;
  tax: number;
  net: number;
  regime: TaxRegime;
  blended: number;
  activeHours: number;
  effWage: number;
}

export interface Benchmark {
  id: string;
  label: string;
  unit: string;
  hint: string;
  low: number;
  high: number;
  model: string;
  source: string;
  custom?: boolean;
}

export interface ResearchEntry {
  id: string;
  label: string;
  low: number;
  high: number;
  unit: string;
  source: string;
}

export interface Integrations {
  aiBase: string;
  aiKey: string;
  aiModel: string;
  provider: SearchProvider;
  tavilyKey: string;
  firecrawlKey: string;
  searxngUrl: string;
  crawl4aiUrl: string;
  cfAccountId: string;
  cfToken: string;
  cfModel: string;
  sheetsWebhook: string;
  /** shared secret the bridge script checks, so only this app can write to the sheet */
  sheetsSecret: string;
  sheetsFileId?: string;
  sheetsLastSync?: string;
}

export interface Finding {
  id: string;
  date: string;
  query: string;
  item: string;
  vendor: string;
  price: number | null;
  sym: string;
  url: string;
  provider: SearchProvider;
}

export interface SheetRow {
  date: string;
  machine: string;
  item: string;
  myUnit: number;
  myTotal: number;
  myCost: number;
  mLow: number | null;
  mHigh: number | null;
  sources: string;
}

export interface Preset {
  id: string;
  name: string;
  location: string;
  custom?: boolean;
  machines: Machine[];
  settings: Settings;
  job: Job;
}
