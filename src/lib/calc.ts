import type { Currency, Job, Machine, Quote, Settings, TaxBracket } from "../types";

export const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export const MODE_MAX: Record<"margin" | "markup", number> = {
  margin: 95,
  markup: 300,
};

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** straight-line depreciation per running hour */
export function depPerHour(m: Machine): number {
  const hrs = m.lifespanMonths * m.hoursPerMonth;
  if (hrs <= 0) return 0;
  return Math.max(0, m.purchaseCost - m.salvageValue) / hrs;
}

/** energy + consumables + maintenance per running hour */
export function runPerHour(m: Machine, s: Settings): number {
  const maint = m.hoursPerMonth > 0 ? m.maintenancePerMonth / m.hoursPerMonth : 0;
  return (m.watts / 1000) * s.electricityRate + m.consumablesPerHour + maint;
}

export function machinePerHour(m: Machine, s: Settings): number {
  return depPerHour(m) + runPerHour(m, s);
}

export function monthlyFixed(s: Settings): number {
  return (
    s.rent +
    s.utilities +
    s.software +
    s.insurance +
    s.otherBills +
    s.marketingMonthly
  );
}

export function overheadPerHour(s: Settings): number {
  return s.billableHours > 0 ? monthlyFixed(s) / s.billableHours : 0;
}

export function laborRate(s: Settings): number {
  return s.hourlyWage * (1 + s.laborBurdenPct / 100);
}

/** presumptive tax: bracket where upTo = 0 means "and above" */
export function presumptiveTax(revenue: number, brackets: TaxBracket[]): number {
  if (!brackets.length) return 0;
  const sorted = [...brackets].sort(
    (a, b) => (a.upTo || Infinity) - (b.upTo || Infinity),
  );
  const hit =
    sorted.find((b) => !b.upTo || revenue <= b.upTo) ?? sorted[sorted.length - 1];
  return hit.kind === "percent" ? revenue * (hit.value / 100) : hit.value;
}

export function computeQuote(
  job: Job,
  machine: Machine | undefined,
  s: Settings,
): Quote {
  const dep = machine ? depPerHour(machine) : 0;
  const run = machine ? runPerHour(machine, s) : 0;
  const machineRate = dep + run;
  const oRate = overheadPerHour(s);
  const lRate = laborRate(s);

  const qty = Math.max(1, Math.floor(job.quantity || 1));
  const mh = Math.max(0, job.machineHours || 0);
  const lh = Math.max(0, job.laborHours || 0);

  const uMaterials = Math.max(0, job.materialCost || 0);
  const uMachine = mh * machineRate;
  const uLabor = lh * lRate;
  const uOverhead = (mh + lh) * oRate;
  const uSetup = Math.max(0, job.setupFee || 0) / qty;

  const unitCost = uMaterials + uMachine + uLabor + uOverhead + uSetup;
  const totalCost = unitCost * qty;

  const pct = clamp(job.marginPct || 0, 0, MODE_MAX[job.marginMode]);
  const unitPrice =
    job.marginMode === "margin"
      ? unitCost / (1 - pct / 100)
      : unitCost * (1 + pct / 100);
  const totalPrice = unitPrice * qty;

  const vat = totalPrice * (s.vatPct / 100);
  const invoiceTotal = totalPrice + vat;

  const profit = totalPrice - totalCost;
  const profitTax = Math.max(0, profit) * (s.profitTaxPct / 100);
  const presTax =
    s.regime === "presumptive" ? presumptiveTax(totalPrice, s.brackets) : 0;
  const tax = s.regime === "presumptive" ? presTax : profitTax;
  const net = profit - tax;

  const activeHours = mh + lh;
  const blended = activeHours > 0 ? totalCost / activeHours : 0;
  const effWage = lh > 0 ? s.hourlyWage + net / lh : 0;

  return {
    depRate: round3(dep),
    runRate: round3(run),
    machineRate: round3(machineRate),
    overheadRate: round3(oRate),
    laborRate: round3(lRate),
    qty,
    uMaterials: round3(uMaterials),
    uMachine: round3(uMachine),
    uLabor: round3(uLabor),
    uOverhead: round3(uOverhead),
    uSetup: round3(uSetup),
    unitCost: round3(unitCost),
    totalCost: round3(totalCost),
    unitPrice: round3(unitPrice),
    totalPrice: round3(totalPrice),
    vatPct: s.vatPct,
    vat: round3(vat),
    invoiceTotal: round3(invoiceTotal),
    profit: round3(profit),
    profitTax: round3(profitTax),
    presumptiveTax: round3(presTax),
    tax: round3(tax),
    net: round3(net),
    regime: s.regime,
    blended: round3(blended),
    activeHours: round3(activeHours),
    effWage: round3(effWage),
  };
}

/** margin <-> markup conversion so switching modes keeps the same price */
export function convertPct(pct: number, from: "margin" | "markup"): number {
  const m = clamp(pct, 0, MODE_MAX[from]) / 100;
  const other =
    from === "margin" ? (m < 1 ? m / (1 - m) : 9) : (m > 0 ? m / (1 + m) : 0);
  return Math.round(clamp(other * 100, 0, from === "margin" ? MODE_MAX.markup : MODE_MAX.margin) * 10) / 10;
}

/** margin or markup % that lands exactly on a target total price */
export function pctForTarget(
  targetTotal: number,
  totalCost: number,
  mode: "margin" | "markup",
): number {
  if (totalCost <= 0 || targetTotal <= 0) return 0;
  const raw =
    mode === "margin"
      ? (1 - totalCost / targetTotal) * 100
      : (targetTotal / totalCost - 1) * 100;
  return Math.round(clamp(raw, 0, MODE_MAX[mode]) * 10) / 10;
}

export function fmtMoney(n: number, currency: Currency, digits = 2): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);
  } catch {
    return `$${n.toFixed(digits)}`;
  }
}

export function fmtNum(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(n);
}
