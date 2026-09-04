import type { Settings, TaxBracket } from "../types";
import { fmtMoney, laborRate, monthlyFixed, overheadPerHour } from "../lib/calc";
import { uid } from "../lib/presets";
import { AnimatedNumber, Field, Icon, NumInput, Reveal, Section, Seg, Slider } from "./ui";

function StatFooter({
  items,
}: {
  items: { label: string; value: number; currency: Settings["currency"]; suffix?: string }[];
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-2 bg-ink px-3 py-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55">{it.label}</span>
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

export function LaborSection({ settings, onPatch }: { settings: Settings; onPatch: (p: Partial<Settings>) => void }) {
  return (
    <Reveal delay={40}>
      <Section
        num="01"
        icon="user"
        title="Your labor"
        sub="What an hour of your hands-on time is worth — prep, finishing, packing, client chat."
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hourly wage" hint="pay yourself">
            <NumInput value={settings.hourlyWage} onChange={(n) => onPatch({ hourlyWage: n })} prefix="$" suffix="/h" step={1} min={0} />
          </Field>
          <Field label="Burden" hint="benefits, payroll…">
            <NumInput value={settings.laborBurdenPct} onChange={(n) => onPatch({ laborBurdenPct: n })} suffix="%" step={1} min={0} />
          </Field>
          <Field label="Currency" className="col-span-2">
            <Seg
              options={[
                { v: "USD" as const, label: "$ USD" },
                { v: "EUR" as const, label: "€ EUR" },
                { v: "GBP" as const, label: "£ GBP" },
              ]}
              value={settings.currency}
              onChange={(v) => onPatch({ currency: v })}
            />
          </Field>
        </div>
        <StatFooter
          items={[{ label: "Loaded labor rate", value: laborRate(settings), currency: settings.currency, suffix: "/hr" }]}
        />
      </Section>
    </Reveal>
  );
}

export function BillsSection({ settings, onPatch }: { settings: Settings; onPatch: (p: Partial<Settings>) => void }) {
  return (
    <Reveal delay={80}>
      <Section
        num="02"
        icon="home"
        title="Bills & overhead"
        sub="Monthly fixed costs spread across your productive hours, so every job hour carries its share."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Rent / space">
            <NumInput value={settings.rent} onChange={(n) => onPatch({ rent: n })} prefix="$" step={25} min={0} />
          </Field>
          <Field label="Utilities">
            <NumInput value={settings.utilities} onChange={(n) => onPatch({ utilities: n })} prefix="$" step={10} min={0} />
          </Field>
          <Field label="Software subs">
            <NumInput value={settings.software} onChange={(n) => onPatch({ software: n })} prefix="$" step={5} min={0} />
          </Field>
          <Field label="Insurance">
            <NumInput value={settings.insurance} onChange={(n) => onPatch({ insurance: n })} prefix="$" step={10} min={0} />
          </Field>
          <Field label="Other bills">
            <NumInput value={settings.otherBills} onChange={(n) => onPatch({ otherBills: n })} prefix="$" step={10} min={0} />
          </Field>
          <Field label="Electricity" hint="per kWh">
            <NumInput value={settings.electricityRate} onChange={(n) => onPatch({ electricityRate: n })} prefix="$" step={0.01} min={0} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Productive hours per month" hint="used to spread fixed costs">
            <NumInput value={settings.billableHours} onChange={(n) => onPatch({ billableHours: n })} suffix="h/mo" step={5} min={1} />
          </Field>
        </div>
        <StatFooter
          items={[
            { label: "Fixed costs / month", value: monthlyFixed(settings), currency: settings.currency },
            { label: "Overhead / productive hr", value: overheadPerHour(settings), currency: settings.currency, suffix: "/hr" },
          ]}
        />
      </Section>
    </Reveal>
  );
}

export function TaxSection({ settings, onPatch }: { settings: Settings; onPatch: (p: Partial<Settings>) => void }) {
  const patchBracket = (id: string, p: Partial<TaxBracket>) =>
    onPatch({ brackets: settings.brackets.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  const removeBracket = (id: string) => onPatch({ brackets: settings.brackets.filter((b) => b.id !== id) });
  const addBracket = () =>
    onPatch({ brackets: [...settings.brackets, { id: uid(), upTo: 0, kind: "percent", value: 10 }] });

  return (
    <Reveal delay={120}>
      <Section
        num="03"
        icon="percent"
        title="Tax system"
        sub="VAT is collected on top of your net price. Income tax runs on profit — or on revenue via presumptive brackets."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Field label="VAT / sales tax" hint="added on invoice">
              <Slider value={settings.vatPct} onChange={(n) => onPatch({ vatPct: n })} max={30} step={0.5} />
            </Field>
            <div className="mt-4">
              <Field label="Income tax regime">
                <Seg
                  options={[
                    { v: "profit" as const, label: "On profit" },
                    { v: "presumptive" as const, label: "Presumptive" },
                  ]}
                  value={settings.regime}
                  onChange={(v) => onPatch({ regime: v })}
                />
              </Field>
            </div>
            {settings.regime === "profit" && (
              <div className="mt-4">
                <Field label="Profit tax rate">
                  <Slider value={settings.profitTaxPct} onChange={(n) => onPatch({ profitTaxPct: n })} max={60} />
                </Field>
              </div>
            )}
          </div>
          <div>
            <Field label="Presumptive brackets" hint="revenue cap → tax">
              <div className="space-y-1.5">
                {settings.brackets.length === 0 && (
                  <p className="border border-dashed border-line bg-card px-3 py-2 text-xs text-mute">
                    No brackets yet — add your revenue tiers.
                  </p>
                )}
                {settings.brackets.map((b) => (
                  <div key={b.id} className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-mute">up to</span>
                    <div className="w-24">
                      <NumInput value={b.upTo} onChange={(n) => patchBracket(b.id, { upTo: n })} prefix="$" step={500} min={0} />
                    </div>
                    <div className="w-[104px]">
                      <Seg
                        options={[
                          { v: "percent" as const, label: "%" },
                          { v: "fixed" as const, label: "flat" },
                        ]}
                        value={b.kind}
                        onChange={(v) => patchBracket(b.id, { kind: v })}
                      />
                    </div>
                    <div className="w-20">
                      <NumInput
                        value={b.value}
                        onChange={(n) => patchBracket(b.id, { value: n })}
                        suffix={b.kind === "percent" ? "%" : "$"}
                        step={0.5}
                        min={0}
                      />
                    </div>
                    <button
                      onClick={() => removeBracket(b.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center text-mute transition-colors hover:text-danger"
                      title="Remove bracket"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBracket}
                  className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-teal transition-colors hover:text-ember"
                >
                  <Icon name="plus" className="h-3.5 w-3.5" sw={2.2} /> Add bracket
                </button>
                <p className="text-[10px] leading-relaxed text-mute">
                  A cap of <span className="font-mono">$0</span> means “and above” — the catch-all top tier.
                </p>
              </div>
            </Field>
          </div>
        </div>
      </Section>
    </Reveal>
  );
}

export function MarketingSection({ settings, onPatch }: { settings: Settings; onPatch: (p: Partial<Settings>) => void }) {
  return (
    <Reveal delay={160}>
      <Section
        num="04"
        icon="megaphone"
        title="Marketing"
        sub="Your monthly customer-acquisition budget, absorbed into the overhead rate so every job contributes."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Marketing budget" hint="ads, fairs, samples…">
            <NumInput value={settings.marketingMonthly} onChange={(n) => onPatch({ marketingMonthly: n })} prefix="$" suffix="/mo" step={25} min={0} />
          </Field>
          <div className="flex flex-col justify-end">
            <div className="flex items-baseline justify-between bg-ink px-3 py-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55">Share of fixed costs</span>
              <AnimatedNumber
                value={monthlyFixed(settings) > 0 ? (settings.marketingMonthly / monthlyFixed(settings)) * 100 : 0}
                format={(n) => `${n.toFixed(0)}%`}
                className="font-mono text-xs font-semibold text-ember"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-mute">
          <Icon name="megaphone" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-2" />
          Every job absorbs {fmtMoney(overheadPerHour(settings), settings.currency)}/hr of fixed costs — rent, bills
          and marketing included — on top of machine and labor time.
        </p>
      </Section>
    </Reveal>
  );
}
