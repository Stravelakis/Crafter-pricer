import type { Machine, MachineType, Settings } from "../types";
import { MACHINE_TYPE_LABELS } from "../lib/market";
import { depPerHour, runPerHour, fmtMoney } from "../lib/calc";
import {
  Field,
  Icon,
  NumInput,
  Reveal,
  Section,
  SelectInput,
  type IconName,
} from "./ui";

const TYPE_ICON: Record<MachineType, IconName> = {
  fdm: "fdm",
  sla: "layers",
  uv: "uv",
  "laser-engrave": "engrave",
  "laser-cut": "laser",
  cnc: "cnc",
  other: "gear",
};

const TYPE_OPTIONS = (
  Object.keys(MACHINE_TYPE_LABELS) as MachineType[]
).map((t) => ({ v: t, label: MACHINE_TYPE_LABELS[t] }));

function RateChip({ label, value, cur }: { label: string; value: number; cur: Settings["currency"] }) {
  return (
    <div className="flex items-baseline justify-between gap-2 bg-ink px-3 py-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55">
        {label}
      </span>
      <span key={value} className="tick-flash font-mono text-xs font-semibold text-ember">
        {fmtMoney(value, cur)}/hr
      </span>
    </div>
  );
}

export default function MachinesSection({
  machines,
  settings,
  onPatch,
  onRemove,
  onAdd,
}: {
  machines: Machine[];
  settings: Settings;
  onPatch: (id: string, patch: Partial<Machine>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <Reveal>
      <Section
        num="01"
        icon="gear"
        title="Machine fleet & depreciation"
        sub="Purchase price minus buy-back value, spread over the hours you'll actually run each machine before you replace it."
        right={
          <button
            type="button"
            onClick={onAdd}
            className="group flex items-center gap-1.5 border border-ink bg-ink px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper transition-all hover:bg-ember hover:border-ember active:translate-y-px"
          >
            <Icon name="plus" className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" sw={2.4} />
            Add machine
          </button>
        }
      >
        {machines.length === 0 && (
          <div className="flex items-center gap-3 border border-dashed border-line bg-card px-4 py-6 text-sm text-mute">
            <Icon name="alert" className="h-5 w-5 shrink-0 text-amber" />
            No machines on the floor yet — add your first printer, UV bed or laser to start costing jobs.
          </div>
        )}
        <div className="space-y-4">
          {machines.map((m, idx) => {
            const dep = depPerHour(m);
            const run = runPerHour(m, settings);
            return (
              <Reveal key={m.id} delay={idx * 60}>
                <article className="group border border-line bg-card transition-shadow hover:shadow-[var(--shadow-press-sm)]">
                  <div className="flex flex-wrap items-center gap-3 border-b border-line/70 px-4 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-paper text-ink-2">
                      <Icon name={TYPE_ICON[m.type]} className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => onPatch(m.id, { name: e.target.value })}
                      placeholder="Machine name"
                      className="min-w-0 flex-1 border-b border-transparent bg-transparent font-display text-sm font-bold uppercase tracking-wide text-ink outline-none transition focus:border-ember"
                    />
                    <SelectInput
                      value={m.type}
                      onChange={(v) => onPatch(m.id, { type: v as MachineType })}
                      options={TYPE_OPTIONS}
                      className="w-44"
                    />
                    <button
                      type="button"
                      onClick={() => onRemove(m.id)}
                      title="Remove machine"
                      className="grid h-8 w-8 place-items-center border border-line text-mute transition-all hover:border-danger hover:bg-danger hover:text-paper active:translate-y-px"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Field label="Purchase cost">
                      <NumInput
                        value={m.purchaseCost}
                        onChange={(n) => onPatch(m.id, { purchaseCost: n })}
                        prefix="$"
                        step={50}
                      />
                    </Field>
                    <Field label="Buy-back value" hint="at repurchase">
                      <NumInput
                        value={m.salvageValue}
                        onChange={(n) => onPatch(m.id, { salvageValue: n })}
                        prefix="$"
                        step={25}
                      />
                    </Field>
                    <Field label="Repurchase in" hint="months">
                      <NumInput
                        value={m.lifespanMonths}
                        onChange={(n) => onPatch(m.id, { lifespanMonths: n })}
                        suffix="mo"
                        step={6}
                      />
                    </Field>
                    <Field label="Utilization" hint="hrs / month">
                      <NumInput
                        value={m.hoursPerMonth}
                        onChange={(n) => onPatch(m.id, { hoursPerMonth: n })}
                        suffix="h"
                        step={5}
                      />
                    </Field>
                    <Field label="Avg. draw" hint="watts">
                      <NumInput
                        value={m.watts}
                        onChange={(n) => onPatch(m.id, { watts: n })}
                        suffix="W"
                        step={10}
                      />
                    </Field>
                    <Field label="Consumables" hint="nozzles, film…">
                      <NumInput
                        value={m.consumablesPerHour}
                        onChange={(n) => onPatch(m.id, { consumablesPerHour: n })}
                        prefix="$"
                        suffix="/h"
                        step={0.1}
                      />
                    </Field>
                    <Field label="Maintenance" hint="per month">
                      <NumInput
                        value={m.maintenancePerMonth}
                        onChange={(n) => onPatch(m.id, { maintenancePerMonth: n })}
                        prefix="$"
                        suffix="/mo"
                        step={5}
                      />
                    </Field>
                    <div className="flex flex-col justify-end">
                      <div className="grid grid-cols-3 gap-1">
                        <RateChip label="Depr" value={dep} cur={settings.currency} />
                        <RateChip label="Run" value={run} cur={settings.currency} />
                        <RateChip label="All-in" value={dep + run} cur={settings.currency} />
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mute">
          <Icon name="clock" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-2" />
          Depreciation/hr = (purchase − buy-back) ÷ (months until repurchase × monthly hours).
          Running cost adds electricity (watts × your kWh rate), consumables and maintenance.
        </p>
      </Section>
    </Reveal>
  );
}
