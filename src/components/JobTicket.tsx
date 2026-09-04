import type { Currency, Job, Machine, Quote } from "../types";
import { convertPct, fmtMoney, fmtNum, MODE_MAX } from "../lib/calc";
import { AnimatedNumber, Field, HelpTip, Icon, NumInput, Reveal, Seg, Slider, SelectInput, TextInput } from "./ui";

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
  const switchMode = (mode: Job["marginMode"]) => {
    if (mode === job.marginMode) return;
    onChange({ marginMode: mode, marginPct: convertPct(job.marginPct, job.marginMode) });
  };

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
          <Field label="Job name" help="jName">
            <TextInput
              value={job.name}
              onChange={(v) => onChange({ name: v })}
              placeholder="e.g. Engraved walnut coaster set"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Machine" help="jMachine" hint="focuses the fleet panel" className="col-span-2">
              <SelectInput
                value={machine?.id ?? ""}
                onChange={(v) => onChange({ machineId: v })}
                options={
                  machines.length
                    ? [{ v: "", label: "— no machine (labor only) —" }, ...machines.map((m) => ({ v: m.id, label: m.name || "Unnamed machine" }))]
                    : [{ v: "", label: "— add a machine in section 01 —" }]
                }
              />
            </Field>
            <Field label="Machine time" help="jMachineH" hint="per unit">
              <NumInput value={job.machineHours} onChange={(n) => onChange({ machineHours: n })} suffix="h" step={0.25} min={0} />
            </Field>
            <Field label="Labor time" help="jLaborH" hint="per unit">
              <NumInput value={job.laborHours} onChange={(n) => onChange({ laborHours: n })} suffix="h" step={0.25} min={0} />
            </Field>
            <Field label="Materials" help="jMaterials" hint="per unit">
              <NumInput value={job.materialCost} onChange={(n) => onChange({ materialCost: n })} prefix="$" step={0.5} min={0} />
            </Field>
            <Field label="Setup / prep fee" help="jSetup" hint="whole order">
              <NumInput value={job.setupFee} onChange={(n) => onChange({ setupFee: n })} prefix="$" step={1} min={0} />
            </Field>
            <Field label="Quantity" help="jQty">
              <NumInput
                value={job.quantity}
                onChange={(n) => onChange({ quantity: Math.max(1, Math.floor(n)) })}
                suffix="pcs"
                step={1}
                min={1}
              />
            </Field>
            <div className="flex flex-col justify-end pb-0.5">
              <div className="flex items-baseline justify-between border border-line bg-card px-3 py-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-mute">Machine rate</span>
                <AnimatedNumber
                  value={quote.machineRate}
                  format={(n) => `${fmtMoney(n, currency)}/h`}
                  className="font-mono text-xs font-semibold text-ink"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-line pt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                Profit model
                <HelpTip k="jMode" />
                <HelpTip k="jPct" />
              </span>
              <Seg
                options={[
                  { v: "margin" as const, label: "Margin" },
                  { v: "markup" as const, label: "Markup" },
                ]}
                value={job.marginMode}
                onChange={switchMode}
              />
            </div>
            <Slider
              value={job.marginPct}
              onChange={(n) => onChange({ marginPct: n })}
              max={MODE_MAX[job.marginMode]}
              step={job.marginMode === "markup" ? 5 : 1}
            />
            <p className="mt-2 text-xs leading-relaxed text-mute">
              {job.marginMode === "margin"
                ? "Margin on price — profit as a share of what the customer pays."
                : "Markup on cost — profit stacked on top of your true cost. Switching modes keeps the same price."}
            </p>
          </div>

          <div className="flex items-center justify-between bg-ink px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
              <Icon name="zap" className="h-3.5 w-3.5 text-ember" />
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
