import type { Currency, Job, Machine, Quote } from "../types";
import { fmtMoney } from "../lib/calc";
import {
  AnimatedNumber,
  Field,
  NumInput,
  Reveal,
  Seg,
  SelectInput,
  Slider,
  TextInput,
} from "./ui";

export default function JobTicket({
  job,
  machines,
  machine,
  quote,
  currency,
  onChange,
}: {
  job: Job;
  machines: Machine[];
  machine: Machine | undefined;
  quote: Quote;
  currency: Currency;
  onChange: (patch: Partial<Job>) => void;
}) {
  return (
    <Reveal delay={60}>
      <section className="panel overflow-hidden">
        <header className="relative flex items-center justify-between gap-3 border-b-2 border-dashed border-paper/25 bg-ink px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ember">
              Job ticket · cost-plus
            </p>
            <h2 className="truncate font-display text-lg font-bold uppercase tracking-[0.06em] text-paper">
              {job.name.trim() || "Untitled job"}
            </h2>
          </div>
          <span className="shrink-0 rotate-3 border-2 border-dashed border-ember px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-ember">
            № {String(quote.qty).padStart(2, "0")}×
          </span>
        </header>
        <div className="space-y-4 p-5">
          <Field label="Job name">
            <TextInput
              value={job.name}
              onChange={(v) => onChange({ name: v })}
              placeholder="e.g. Engraved walnut coaster set"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Machine" className="col-span-2">
              <SelectInput
                value={machine?.id ?? ""}
                onChange={(v) => onChange({ machineId: v })}
                options={
                  machines.length
                    ? machines.map((m) => ({ v: m.id, label: m.name || "Unnamed machine" }))
                    : [{ v: "", label: "— add a machine in section 01 —" }]
                }
              />
            </Field>
            <Field label="Machine time" hint="per unit">
              <NumInput
                value={job.machineHours}
                onChange={(n) => onChange({ machineHours: n })}
                suffix="h"
                step={0.25}
              />
            </Field>
            <Field label="Labor time" hint="per unit">
              <NumInput
                value={job.laborHours}
                onChange={(n) => onChange({ laborHours: n })}
                suffix="h"
                step={0.25}
              />
            </Field>
            <Field label="Materials" hint="per unit">
              <NumInput
                value={job.materialCost}
                onChange={(n) => onChange({ materialCost: n })}
                prefix="$"
                step={0.5}
              />
            </Field>
            <Field label="Setup / prep fee" hint="whole order">
              <NumInput
                value={job.setupFee}
                onChange={(n) => onChange({ setupFee: n })}
                prefix="$"
                step={1}
              />
            </Field>
            <Field label="Quantity">
              <NumInput
                value={job.quantity}
                onChange={(n) => onChange({ quantity: Math.max(1, Math.floor(n)) })}
                suffix="pcs"
                step={1}
                min={1}
              />
            </Field>
            <div className="flex flex-col justify-end">
              <div className="flex items-baseline justify-between border border-line bg-card px-3 py-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-mute">
                  Machine rate
                </span>
                <span key={quote.machineRate} className="tick-flash font-mono text-xs font-semibold text-ink">
                  {fmtMoney(quote.machineRate, currency)}
                  <span className="text-mute">/hr</span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-line pt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                Profit model
              </span>
              <Seg
                options={[
                  { v: "margin" as const, label: "Margin" },
                  { v: "markup" as const, label: "Markup" },
                ]}
                value={job.marginMode}
                onChange={(v) => onChange({ marginMode: v })}
              />
            </div>
            <Slider value={job.marginPct} onChange={(n) => onChange({ marginPct: n })} max={95} />
            <p className="mt-2 text-xs leading-relaxed text-mute">
              {job.marginMode === "margin"
                ? "Margin on price — profit as a share of what the customer pays."
                : "Markup on cost — profit stacked on top of your true cost."}
            </p>
          </div>

          <div className="flex items-center justify-between bg-ink px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
              True all-in cost
            </span>
            <AnimatedNumber
              value={quote.blended}
              format={(n) => `${fmtMoney(n, currency)}/active hr`}
              className="font-mono text-sm font-semibold text-ember"
            />
          </div>
        </div>
      </section>
    </Reveal>
  );
}
