import { useState } from "react";
import type { ResearchEntry } from "../types";
import { BENCHMARKS } from "../lib/market";
import { uid } from "../lib/presets";
import { Field, Icon, NumInput, Reveal, Section, TextInput } from "./ui";

export default function MarketPanel({
  research,
  onAdd,
  onRemove,
  onUse,
}: {
  research: ResearchEntry[];
  onAdd: (e: ResearchEntry) => void;
  onRemove: (id: string) => void;
  onUse: (e: ResearchEntry) => void;
}) {
  const [label, setLabel] = useState("");
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [unit, setUnit] = useState("");
  const [source, setSource] = useState("");

  const submit = () => {
    if (!label.trim() || !(high > 0)) return;
    onAdd({
      id: uid(),
      label: label.trim(),
      low: Math.min(low, high),
      high: Math.max(low, high),
      unit: unit.trim() || "$/job",
      source: source.trim() || "my research",
    });
    setLabel("");
    setLow(0);
    setHigh(0);
    setUnit("");
    setSource("");
  };

  return (
    <Reveal delay={160}>
      <Section
        num="03"
        icon="chart"
        title="Market intel"
        sub="Typical street rates for maker services, plus a log for the prices you research yourself. Use a row as the benchmark in the Market Signal panel."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                {["Service", "Pricing model", "Typical range", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-2 pr-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-mute"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BENCHMARKS.map((b) => (
                <tr
                  key={b.id}
                  className="group border-b border-line/70 transition-colors hover:bg-card"
                >
                  <td className="py-2.5 pr-3">
                    <div className="text-[13px] font-medium text-ink">{b.label}</div>
                    <div className="font-mono text-[10px] text-mute">{b.source}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-ink-2">{b.model}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-ink">
                    {b.low} – {b.high}{" "}
                    <span className="font-normal text-mute">{b.unit}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onUse({ id: b.id, label: b.label, low: b.low, high: b.high, unit: b.unit, source: b.source })}
                      className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-mute opacity-0 transition-all hover:border-ember hover:text-ember group-hover:opacity-100"
                    >
                      Use →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-mono text-[10px] text-mute">
          Indicative USD ranges gathered from public bureaus, marketplaces & maker communities,
          2024–26. Always verify against your local market.
        </p>

        {/* user research log */}
        <div className="mt-6 border-t-2 border-dashed border-line pt-5">
          <h4 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">
            <Icon name="link" className="h-4 w-4 text-ember" />
            Your research log
          </h4>
          {research.length > 0 && (
            <ul className="mb-4 space-y-1.5">
              {research.map((r) => (
                <li
                  key={r.id}
                  className="group flex flex-wrap items-center gap-x-3 gap-y-1 border border-line bg-card px-3 py-2 transition-colors hover:border-ink/30"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                    {r.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink-2">
                    {r.low} – {r.high} <span className="font-normal text-mute">{r.unit}</span>
                  </span>
                  <span className="hidden font-mono text-[10px] text-mute sm:inline">{r.source}</span>
                  <button
                    type="button"
                    onClick={() => onUse(r)}
                    className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-mute transition-all hover:border-ember hover:text-ember"
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(r.id)}
                    title="Remove"
                    className="grid h-6 w-6 place-items-center text-mute transition-colors hover:text-danger"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-2.5 border border-line bg-card p-3 sm:grid-cols-6">
            <Field label="What did you find" className="col-span-2">
              <TextInput value={label} onChange={setLabel} placeholder="e.g. Local shop — UV phone cases" />
            </Field>
            <Field label="Low">
              <NumInput value={low} onChange={setLow} prefix="$" step={0.5} />
            </Field>
            <Field label="High">
              <NumInput value={high} onChange={setHigh} prefix="$" step={0.5} />
            </Field>
            <Field label="Unit" hint="$/g, $/min…">
              <TextInput value={unit} onChange={setUnit} placeholder="$/item" />
            </Field>
            <Field label="Source">
              <TextInput value={source} onChange={setSource} placeholder="etsy.com" />
            </Field>
            <div className="col-span-2 flex items-end sm:col-span-6">
              <button
                type="button"
                onClick={submit}
                disabled={!label.trim() || !(high > 0)}
                className="flex items-center gap-2 border border-ink bg-ink px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper transition-all enabled:hover:border-ember enabled:hover:bg-ember enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="plus" className="h-3.5 w-3.5" sw={2.4} />
                Log this price
              </button>
            </div>
          </div>
        </div>
      </Section>
    </Reveal>
  );
}
