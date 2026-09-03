import type { Benchmark, MachineType } from "../types";

/**
 * Indicative market ranges gathered from public service bureaus, print
 * marketplaces (Hubs, Treatstock, Etsy), makerspaces and maker communities
 * across 2024–2026. All figures in USD. Users should verify locally.
 */
export const BENCHMARKS: Benchmark[] = [
  {
    id: "fdm-hour",
    label: "FDM print — machine time",
    unit: "$/machine hr",
    hint: "machine hours for the whole job",
    low: 25,
    high: 60,
    model: "per machine hour",
    source: "Service bureaus & print farms",
  },
  {
    id: "fdm-gram",
    label: "FDM print — per gram",
    unit: "$/gram",
    hint: "grams of filament in the job",
    low: 0.5,
    high: 1.5,
    model: "per gram printed",
    source: "Hubs, Treatstock, local bureaus",
  },
  {
    id: "sla-hour",
    label: "Resin (SLA/DLP) — machine time",
    unit: "$/machine hr",
    hint: "machine hours for the whole job",
    low: 40,
    high: 90,
    model: "per machine hour",
    source: "Bureaus, dental & jewelry niches",
  },
  {
    id: "sla-gram",
    label: "Resin print — per gram",
    unit: "$/gram",
    hint: "grams of resin in the job",
    low: 1.5,
    high: 4,
    model: "per gram printed",
    source: "Bureaus & marketplaces",
  },
  {
    id: "uv-item",
    label: "UV print on item (case → plaque)",
    unit: "$/item",
    hint: "finished items in the job",
    low: 12,
    high: 40,
    model: "per finished item",
    source: "Etsy, promo suppliers, sign shops",
  },
  {
    id: "uv-cm2",
    label: "UV flatbed — print area",
    unit: "$/cm²",
    hint: "total printed area in cm²",
    low: 0.25,
    high: 0.75,
    model: "per cm² of print",
    source: "Sign & promotional industry quotes",
  },
  {
    id: "engrave-min",
    label: "Laser engraving — beam time",
    unit: "$/min",
    hint: "engraving minutes in the job",
    low: 0.6,
    high: 2,
    model: "per minute of beam time",
    source: "Makerspaces & Etsy engravers",
  },
  {
    id: "engrave-item",
    label: "Engraved gift item",
    unit: "$/item",
    hint: "engraved items in the job",
    low: 8,
    high: 35,
    model: "per item, incl. setup",
    source: "Etsy & local gift shops",
  },
  {
    id: "cut-min",
    label: "Laser cutting — beam time",
    unit: "$/min",
    hint: "cutting minutes in the job",
    low: 1.2,
    high: 3.5,
    model: "per minute of beam time",
    source: "Makerspaces & fab labs",
  },
];

export const TYPE_TO_BENCH: Record<MachineType, string> = {
  fdm: "fdm-hour",
  sla: "sla-hour",
  uv: "uv-item",
  "laser-engrave": "engrave-item",
  "laser-cut": "cut-min",
  cnc: "cut-min",
  other: "engrave-min",
};

export const MACHINE_TYPE_LABELS: Record<MachineType, string> = {
  fdm: "FDM 3D printer",
  sla: "Resin (SLA/DLP)",
  uv: "UV flatbed printer",
  "laser-engrave": "Laser engraver",
  "laser-cut": "Laser cutter",
  cnc: "CNC router",
  other: "Other machine",
};
