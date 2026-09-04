import type { Currency, Machine, MachineType } from "../types";
import { depPerHour, fmtMoney, machinePerHour, runPerHour } from "../lib/calc";
import { MACHINE_TYPE_LABELS } from "../lib/market";
import type { Settings } from "../types";
import { Field, Icon, NumInput, Reveal, Section, SelectInput, Spinner, TextInput } from "./ui";

const TYPE_ICON: Record<MachineType, "printer" | "layers" | "uv" | "laser" | "cog"> = {
  fdm: "printer",
  sla: "layers",
  uv: "uv",
  "laser-engrave": "laser",
  "laser-cut": "laser",
  cnc: "cog",
  other: "cog",
};

function MachineCard({
  m,
  settings,
  onPatch,
  onRemove,
  onEnrich,
  onImage,
  enriching,
  imaging,
}: {
  m: Machine;
  settings: Settings;
  onPatch: (patch: Partial<Machine>) => void;
  onRemove: () => void;
  onEnrich: () => void;
  onImage: () => void;
  enriching: boolean;
  imaging: boolean;
}) {
  const dep = depPerHour(m);
  const run = runPerHour(m, settings);
  const total = machinePerHour(m, settings);
  const lifePct = Math.min(100, Math.max(0, dep > 0 ? (dep / (dep + run)) * 100 : 0));
  const cur = settings.currency;

  return (
    <article className="group/m border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-ember/60 hover:shadow-[var(--shadow-press-sm)]">
      <div className="flex items-start gap-3">
        {m.image && (
          <img
            src={m.image}
            alt={m.name}
            className="h-16 w-16 shrink-0 border border-line object-cover"
          />
        )}
        <div className="grid min-w-0 flex-1 gap-2.5">
          <div className="flex items-center gap-2">
            <Icon name={TYPE_ICON[m.type]} className="h-4.5 w-4.5 shrink-0 text-ember" />
            <TextInput value={m.name} onChange={(v) => onPatch({ name: v })} placeholder="Machine name" />
            <button
              onClick={onRemove}
              title="Remove machine"
              className="grid h-9 w-9 shrink-0 place-items-center border border-line text-mute transition-all hover:border-danger hover:text-danger"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Field label="Type" className="col-span-2 sm:col-span-1">
              <SelectInput
                value={m.type}
                onChange={(v) => onPatch({ type: v as MachineType })}
                options={(Object.keys(MACHINE_TYPE_LABELS) as MachineType[]).map((t) => ({
                  v: t,
                  label: MACHINE_TYPE_LABELS[t],
                }))}
              />
            </Field>
            <Field label="Purchase cost">
              <NumInput value={m.purchaseCost} onChange={(n) => onPatch({ purchaseCost: n })} prefix="$" step={50} min={0} />
            </Field>
            <Field label="Buy-back value" hint="at repurchase">
              <NumInput value={m.salvageValue} onChange={(n) => onPatch({ salvageValue: n })} prefix="$" step={25} min={0} />
            </Field>
            <Field label="Repurchase in" hint="months">
              <NumInput value={m.lifespanMonths} onChange={(n) => onPatch({ lifespanMonths: n })} suffix="mo" step={6} min={1} />
            </Field>
            <Field label="Use" hint="h/month">
              <NumInput value={m.hoursPerMonth} onChange={(n) => onPatch({ hoursPerMonth: n })} suffix="h" step={5} min={0} />
            </Field>
            <Field label="Power draw">
              <NumInput value={m.watts} onChange={(n) => onPatch({ watts: n })} suffix="W" step={25} min={0} />
            </Field>
            <Field label="Consumables" hint="$/run h">
              <NumInput value={m.consumablesPerHour} onChange={(n) => onPatch({ consumablesPerHour: n })} prefix="$" step={0.1} min={0} />
            </Field>
            <Field label="Maintenance" hint="$/month">
              <NumInput value={m.maintenancePerMonth} onChange={(n) => onPatch({ maintenancePerMonth: n })} prefix="$" step={5} min={0} />
            </Field>
          </div>
        </div>
      </div>

      {/* depreciation bar */}
      <div className="mt-3.5">
        <div className="h-2 border border-line bg-paper">
          <div className="flex h-full">
            <div className="h-full bg-ember transition-all duration-500" style={{ width: `${lifePct}%` }} />
            <div className="h-full flex-1 bg-teal/70 transition-all duration-500" />
          </div>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
          <span>depreciation {fmtMoney(dep, cur)}/h</span>
          <span>running {fmtMoney(run, cur)}/h</span>
        </div>
      </div>

      {/* rate + AI actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="border border-ink bg-ink px-2 py-1 font-mono text-[11px] font-semibold text-paper">
          {fmtMoney(total, cur)}<span className="text-paper/60">/run h</span>
        </span>
        <button
          onClick={onEnrich}
          disabled={enriching}
          className="flex items-center gap-1.5 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-2 transition-all hover:border-ember hover:text-ember disabled:opacity-50"
        >
          {enriching ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="wand" className="h-3.5 w-3.5" />}
          AI specs
        </button>
        <button
          onClick={onImage}
          disabled={imaging}
          className="flex items-center gap-1.5 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-2 transition-all hover:border-teal hover:text-teal disabled:opacity-50"
        >
          {imaging ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="image" className="h-3.5 w-3.5" />}
          Photo
        </button>
      </div>

      {m.summary && <p className="mt-2.5 text-xs leading-relaxed text-ink-2">{m.summary}</p>}
      {m.specs && m.specs.length > 0 && (
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-dashed border-line pt-2 sm:grid-cols-3">
          {m.specs.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-mute">{k}</dt>
              <dd className="truncate text-xs font-medium text-ink" title={v}>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {(m.links?.product || m.links?.manual) && (
        <div className="mt-2 flex gap-3 font-mono text-[10px] uppercase tracking-wider">
          {m.links.product && (
            <a href={m.links.product} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal transition-colors hover:text-ember">
              Product page <Icon name="arrow" className="h-3 w-3" />
            </a>
          )}
          {m.links.manual && (
            <a href={m.links.manual} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal transition-colors hover:text-ember">
              Manual <Icon name="arrow" className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default function MachinesSection({
  machines,
  totalCount,
  focusId,
  showAll,
  onToggleShowAll,
  settings,
  onAdd,
  onPatch,
  onRemove,
  onEnrich,
  onImage,
  enrichId,
  imageId,
}: {
  machines: Machine[];
  totalCount: number;
  focusId: string | null;
  showAll: boolean;
  onToggleShowAll: () => void;
  settings: Settings;
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<Machine>) => void;
  onRemove: (id: string) => void;
  onEnrich: (id: string) => void;
  onImage: (id: string) => void;
  enrichId: string | null;
  imageId: string | null;
}) {
  const focused = focusId && !showAll ? machines.filter((m) => m.id === focusId) : machines;
  const hidden = totalCount - focused.length;

  return (
    <Reveal>
      <Section
        num="01"
        icon="printer"
        title="Machine fleet & depreciation"
        sub="Purchase price spread over the months until repurchase, plus energy, consumables and maintenance."
      >
        {hidden > 0 && (
          <button
            onClick={onToggleShowAll}
            className="mb-3 flex w-full items-center justify-between border border-dashed border-ember/60 bg-ember/5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ember-deep transition-colors hover:bg-ember/10"
          >
            <span>Focused view — {hidden} other machine{hidden > 1 ? "s" : ""} hidden</span>
            <span className="flex items-center gap-1">Show all <Icon name="arrow" className="h-3.5 w-3.5" /></span>
          </button>
        )}
        {!focusId && showAll === false && totalCount > 0 && null}
        <div className="space-y-4">
          {focused.map((m) => (
            <MachineCard
              key={m.id}
              m={m}
              settings={settings}
              onPatch={(p) => onPatch(m.id, p)}
              onRemove={() => onRemove(m.id)}
              onEnrich={() => onEnrich(m.id)}
              onImage={() => onImage(m.id)}
              enriching={enrichId === m.id}
              imaging={imageId === m.id}
            />
          ))}
          {focused.length === 0 && (
            <p className="border border-dashed border-line bg-card px-4 py-6 text-center text-xs text-mute">
              No machines yet — add your first one below.
            </p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-dashed border-line px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute transition-all hover:border-ember hover:text-ember"
        >
          <Icon name="plus" className="h-4 w-4" sw={2.2} />
          Add machine
        </button>
      </Section>
    </Reveal>
  );
}
