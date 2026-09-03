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

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  purchaseCost: number;
  /** expected resale / buy-back value at end of life */
  salvageValue: number;
  /** months until repurchase (useful life) */
  lifespanMonths: number;
  /** expected productive hours per month */
  hoursPerMonth: number;
  /** average power draw in watts while running */
  watts: number;
  /** wear & consumables cost per running hour (nozzles, film, lens…) */
  consumablesPerHour: number;
  /** scheduled maintenance cost per month */
  maintenancePerMonth: number;
}

export interface Settings {
  currency: Currency;
  hourlyWage: number;
  /** payroll burden on top of wage, % */
  laborBurdenPct: number;
  /** electricity price per kWh */
  electricityRate: number;
  rent: number;
  utilities: number;
  software: number;
  insurance: number;
  otherBills: number;
  /** productive hours per month used to spread fixed costs */
  billableHours: number;
  /** tax owed on profit, % */
  profitTaxPct: number;
  marketingMonthly: number;
}

export interface Job {
  name: string;
  machineId: string;
  /** machine hours needed per unit */
  machineHours: number;
  /** hands-on labor hours per unit */
  laborHours: number;
  /** raw material cost per unit */
  materialCost: number;
  /** one-time prep/setup fee for the whole order */
  setupFee: number;
  quantity: number;
  marginMode: MarginMode;
  marginPct: number;
  benchmarkId: string;
  /** how many benchmark units this whole job uses (grams, minutes, items…) */
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
  profit: number;
  tax: number;
  net: number;
  /** true all-in cost per active (machine + labor) hour */
  blended: number;
  activeHours: number;
  /** effective after-tax hourly wage for the owner */
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
