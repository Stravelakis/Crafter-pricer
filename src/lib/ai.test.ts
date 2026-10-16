import { describe, expect, it } from "vitest";
import { extractPrice, extractPrices, parsePriceNumber, rowsToCsv } from "./ai";

describe("parsePriceNumber", () => {
  it.each([
    ["49", 49],
    ["49.99", 49.99],
    ["49,99", 49.99],
    ["1,234.56", 1234.56],
    ["1.234,56", 1234.56],
    ["1,234", 1234],
    ["1.234", 1234],
    ["12,5", 12.5],
  ])("reads %s as %d", (raw, expected) => {
    expect(parsePriceNumber(raw)).toBe(expected);
  });
});

describe("extractPrices", () => {
  it("finds prices with the symbol before or after", () => {
    expect(extractPrices("now $24.90, was 1.234,56 € or 30 GBP")).toEqual([24.9, 1234.56, 30]);
  });

  it("reads full numbers, not their first three digits", () => {
    expect(extractPrices("$1234.56")).toEqual([1234.56]);
  });

  it("skips discounts and shipping costs", () => {
    expect(extractPrices("Save $10 today, $5 off, shipping $4.99, price $39")).toEqual([39]);
  });

  it("ignores numbers without a currency", () => {
    expect(extractPrices("pack of 12, 300 x 200 mm")).toEqual([]);
  });
});

describe("extractPrice", () => {
  it("prefers the title's price over the snippet's", () => {
    expect(extractPrice("Walnut coasters – €18,50", "from €9 to €49")).toBe(18.5);
  });

  it("falls back to the snippet", () => {
    expect(extractPrice("Walnut coasters", "Sold for $22 each")).toBe(22);
  });

  it("returns null when there is no price", () => {
    expect(extractPrice("Walnut coasters", "handmade in Greece")).toBeNull();
  });
});

describe("rowsToCsv", () => {
  it("quotes every value and escapes quotes", () => {
    const csv = rowsToCsv([
      {
        date: "2026-10-16",
        machine: 'Laser "Pro"',
        item: "Coasters",
        myUnit: 10,
        myTotal: 40,
        myCost: 20,
        mLow: null,
        mHigh: 12,
        sources: "a ; b",
      },
    ]);
    expect(csv.split("\n")[1]).toBe('"2026-10-16","Laser ""Pro""","Coasters","10","40","20","","12","a ; b"');
  });
});
