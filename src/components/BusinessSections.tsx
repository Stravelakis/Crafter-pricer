import type { Settings } from "../types";
import {
  fmtMoney,
  laborRate,
  monthlyFixed,
  overheadPerHour,
} from "../lib/calc";
import { AnimatedNumber, Field, Icon, NumInput, Reveal, Section, Slider } from "./ui";

function StatFooter({
  items,
}: {
  items: { label: string; value: number; currency: Settings["currency"]; suffix?: string }[];
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-2 bg-ink px-3 py-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55">
            {it.label}
          </span>
          <AnimatedNumber
            value={it.value}
            format={(n) => `${fmtMoney(n, it.currency)}${it.suffix ?? ""}`}
            className="font-mono text-xs font-semibold text-ember"
          />
        </div>
      ))}
    </div>
  );
}

export function LaborSection({
  settings,
  onPatch,
}: {
  settings: Settings;
  onPatch: (p: Partial<Settings>) => void;
}) {
  return (
    <Reveal delay={40}>
      <Section
        num="02"
        icon="user"
        title="Your labor"
        sub="What an hour of your hands-on time is worth — prep, finishing, packing, client chat."
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hourly wage" hint="pay yourself">
            <NumInput
              value={settings.hourlyWage}
              onChange={(n) => onPatch({ hourlyWage: n })}
              prefix="$"
              suffix="/h"
              step={1}
            />
          </Field>
          <Field label="Burden" hint="taxes, benefits…">
            <NumInput
              value={settings.laborBurdenPct}
              onChange={(n) => onPatch({ laborBurdenPct: n })}
              suffix="%"
              step={1}
            />
          </Field>
        </div>
        <StatFooter
          items={[
            {
              label: "Loaded labor rate",
              value: laborRate(settings),
              currency: settings.currency,
              suffix: "/hr",
            },
          ]}
        />
      </Section>
    </Reveal>
  );
}

export function BillsSection({
  settings,
  onPatch,
}: {
  settings: Settings;
  onPatch: (p: Partial<Settings>) => void;
}) {
  return (
    <Reveal delay={80}>
      <Section
        num="03"
        icon="home"
        title="Bills & overhead"
        sub="Monthly fixed costs are spread across your productive hours, so every job hour carries its share."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Rent / space">
            <NumInput value={settings.rent} onChange={(n) => onPatch({ rent: n })} prefix="$" step={25} />
          </Field>
          <Field label="Utilities">
            <NumInput value={settings.utilities} onChange={(n) => onPatch({ utilities: n })} prefix="$" step={10} />
          </Field>
          <Field label="Software subs">
            <NumInput value={settings.software} onChange={(n) => onPatch({ software: n })} prefix="$" step={5} />
          </Field>
          <Field label="Insurance">
            <NumInput value={settings.insurance} onChange={(n) => onPatch({ insurance: n })} prefix="$" step={10} />
          </Field>
          <Field label="Other bills">
            <NumInput value={settings.otherBills} onChange={(n) => onPatch({ otherBills: n })} prefix="$" step={10} />
          </Field>
          <Field label="Electricity" hint="per kWh">
            <NumInput
              value={settings.electricityRate}
              onChange={(n) => onPatch({ electricityRate: n })}
              prefix="$"
              step={0.01}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Productive hours per month" hint="used to spread fixed costs">
            <NumInput
              value={settings.billableHours}
              onChange={(n) => onPatch({ billableHours: n })}
              suffix="h/mo"
              step={5}
            />
          </Field>
        </div>
        <StatFooter
          items={[
            { label: "Fixed costs / month", value: monthlyFixed(settings), currency: settings.currency },
            {
              label: "Overhead / productive hr",
              value: overheadPerHour(settings),
              currency: settings.currency,
              suffix: "/hr",
            },
          ]}
        />
      </Section>
    </Reveal>
  );
}

export function TaxMarketingSection({
  settings,
  onPatch,
}: {
  settings: Settings;
  onPatch: (p: Partial<Settings>) => void;
}) {
  return (
    <Reveal delay={120}>
      <Section
        num="04"
        icon="percent"
        title="Taxes & marketing"
        sub="Tax is applied to each job's profit, and the marketing budget flows into the overhead rate."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Field label="Tax on profit">
              <Slider value={settings.profitTaxPct} onChange={(n) => onPatch({ profitTaxPct: n })} max={60} />
            </Field>
            <p className="mt-2 text-xs leading-relaxed text-mute">
              Income / self-employment tax estimate. The ledger shows profit, the tax slice, and what
              actually lands in your pocket.
            </p>
          </div>
          <Field label="Marketing budget" hint="ads, fairs, samples…">
            <NumInput
              value={settings.marketingMonthly}
              onChange={(n) => onPatch({ marketingMonthly: n })}
              prefix="$"
              suffix="/mo"
              step={25}
            />
          </Field>
        </div>
        <StatFooter
          items={[
            {
              label: "Marketing share of overhead",
              value:
                monthlyFixed(settings) > 0
                  ? (settings.marketingMonthly / monthlyFixed(settings)) * 100
                  : 0,
              currency: settings.currency,
              suffix: "%",
            },
          ]}
        />
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-mute">
          <Icon name="megaphone" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-2" />
          Every job absorbs {fmtMoney(overheadPerHour(settings), settings.currency)}/hr of fixed costs —
          rent, bills and marketing included — on top of machine and labor time.
        </p>
      </Section>
    </Reveal>
  );
}
