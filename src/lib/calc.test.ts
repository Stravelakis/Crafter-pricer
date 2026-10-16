import { describe, expect, it } from "vitest";
import {
  computeQuote,
  convertPct,
  depPerHour,
  pctForTarget,
  presumptiveTax,
  presumptiveTaxForJob,
  runPerHour,
} from "./calc";
import type { Job, Machine, Settings, TaxBracket } from "../types";

const machine: Machine = {
  id: "m1",
  name: "Test printer",
  type: "fdm",
  purchaseCost: 1200,
  salvageValue: 200,
  lifespanMonths: 25,
  hoursPerMonth: 40,
  watts: 500,
  consumablesPerHour: 0.5,
  maintenancePerMonth: 20,
};

const settings: Settings = {
  currency: "EUR",
  hourlyWage: 20,
  laborBurdenPct: 25,
  electricityRate: 0.2,
  rent: 300,
  utilities: 50,
  software: 20,
  insurance: 30,
  otherBills: 0,
  billableHours: 100,
  vatPct: 24,
  profitTaxPct: 20,
  regime: "profit",
  brackets: [],
  presumptiveRevenue: 0,
  marketingMonthly: 100,
};

const job: Job = {
  name: "Test job",
  machineId: "m1",
  machineHours: 2,
  laborHours: 1,
  materialCost: 5,
  setupFee: 10,
  quantity: 2,
  marginMode: "margin",
  marginPct: 50,
  benchmarkId: "",
  benchmarkUnits: 1,
};

const bracket = (upTo: number, kind: TaxBracket["kind"], value: number): TaxBracket => ({
  id: `${upTo}-${kind}`,
  upTo,
  kind,
  value,
});

describe("machine rates", () => {
  it("spreads purchase cost minus salvage over the machine's life", () => {
    // (1200 - 200) / (25 * 40) = 1 per hour
    expect(depPerHour(machine)).toBe(1);
  });

  it("adds energy, consumables and maintenance per running hour", () => {
    // 0.5 kW * 0.2 + 0.5 + 20 / 40 = 0.1 + 0.5 + 0.5
    expect(runPerHour(machine, settings)).toBeCloseTo(1.1);
  });

  it("returns 0 depreciation for a machine with no running hours", () => {
    expect(depPerHour({ ...machine, hoursPerMonth: 0 })).toBe(0);
  });
});

describe("computeQuote", () => {
  const q = computeQuote(job, machine, settings);

  it("adds up the unit cost from its parts", () => {
    // materials 5, machine 2h * 2.1, labor 1h * 25, overhead 3h * 5, setup 10 / 2
    expect(q.unitCost).toBeCloseTo(5 + 4.2 + 25 + 15 + 5);
    expect(q.totalCost).toBeCloseTo(q.unitCost * 2);
  });

  it("applies margin on price, not on cost", () => {
    expect(q.unitPrice).toBeCloseTo(q.unitCost / 0.5);
  });

  it("applies markup on cost", () => {
    const m = computeQuote({ ...job, marginMode: "markup", marginPct: 50 }, machine, settings);
    expect(m.unitPrice).toBeCloseTo(m.unitCost * 1.5);
  });

  it("adds VAT on top of the price", () => {
    expect(q.vat).toBeCloseTo(q.totalPrice * 0.24);
    expect(q.invoiceTotal).toBeCloseTo(q.totalPrice * 1.24);
  });

  it("taxes profit under the profit regime", () => {
    expect(q.tax).toBeCloseTo(q.profit * 0.2);
    expect(q.net).toBeCloseTo(q.profit * 0.8);
  });

  it("caps margin below 100% so the price can't divide by zero", () => {
    const m = computeQuote({ ...job, marginPct: 100 }, machine, settings);
    expect(Number.isFinite(m.unitPrice)).toBe(true);
  });

  it("treats a missing machine as zero machine cost", () => {
    expect(computeQuote(job, undefined, settings).uMachine).toBe(0);
  });
});

describe("presumptive tax", () => {
  const brackets = [bracket(25000, "fixed", 600), bracket(100000, "percent", 4), bracket(0, "percent", 8)];

  it("picks the bracket for the revenue", () => {
    expect(presumptiveTax(20000, brackets)).toBe(600);
    expect(presumptiveTax(50000, brackets)).toBe(2000);
    expect(presumptiveTax(200000, brackets)).toBe(16000);
  });

  it("charges a job its share, not the whole flat fee", () => {
    // period revenue 20,000 → 600 tax → 3% effective; a 500 job pays 15
    const r = presumptiveTaxForJob(500, 20000, brackets);
    expect(r.tax).toBeCloseTo(15);
    expect(r.ratePct).toBeCloseTo(3);
    expect(r.revenueMissing).toBe(false);
  });

  it("falls back to the job's own revenue when no period revenue is set, and says so", () => {
    const r = presumptiveTaxForJob(500, 0, brackets);
    expect(r.tax).toBe(600);
    expect(r.revenueMissing).toBe(true);
  });

  it("flows into the quote", () => {
    const s: Settings = { ...settings, regime: "presumptive", brackets, presumptiveRevenue: 20000 };
    const q = computeQuote(job, machine, s);
    expect(q.tax).toBeCloseTo(q.totalPrice * 0.03);
    expect(q.presumptiveRatePct).toBeCloseTo(3);
  });
});

describe("margin and markup helpers", () => {
  it("converts margin to the markup that gives the same price", () => {
    expect(convertPct(50, "margin")).toBe(100);
    expect(convertPct(100, "markup")).toBe(50);
  });

  it("finds the percentage that lands on a target price", () => {
    expect(pctForTarget(200, 100, "margin")).toBe(50);
    expect(pctForTarget(200, 100, "markup")).toBe(100);
    expect(pctForTarget(0, 100, "margin")).toBe(0);
  });
});
