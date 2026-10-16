import type { Benchmark, Currency, Job, Quote } from "../types";
import { fmtMoney, fmtNum } from "../lib/calc";
import { AnimatedNumber, Field, Icon, Noise, NumInput, Reveal, SelectInput, ShinyText } from "./ui";

function Row({
  label,
  sub,
  value,
  cur,
  strong = false,
  negative = false,
  prefix = "",
}: {
  label: string;
  sub?: string;
  value: number;
  cur: Currency;
  strong?: boolean;
  negative?: boolean;
  prefix?: string;
}) {
  return (
    <div className="ledger-row py-[5px]">
      <div className="min-w-0">
        <div className={`text-[13px] leading-tight ${strong ? "font-semibold text-ink" : "text-ink-2"}`}>{label}</div>
        {sub && <div className="font-mono text-[10px] text-mute">{sub}</div>}
      </div>
      <div className="dots" />
      <div className={`shrink-0 font-mono text-sm ${strong ? "font-semibold text-ink" : negative ? "text-danger" : "text-ink-2"}`}>
        {prefix}
        {fmtMoney(value, cur)}
      </div>
    </div>
  );
}

function Meter({ low, high, price, cur }: { low: number; high: number; price: number; cur: Currency }) {
  const pad = Math.max((high - low) * 0.18, Math.abs(price) * 0.1, 1);
  const dMin = Math.min(low, price) - pad;
  const dMax = Math.max(high, price) + pad;
  const pct = (v: number) => ((v - dMin) / (dMax - dMin)) * 100;
  const zLow = pct(low);
  const zHigh = pct(high);
  const p = pct(price);
  return (
    <div>
      <div className="relative h-3 border border-line bg-card">
        <div
          className="zone-anim absolute inset-y-0 border-x-2 border-teal/50 bg-teal/15"
          style={{ left: `${zLow}%`, width: `${Math.max(0.5, zHigh - zLow)}%` }}
        />
        <div
          className="meter-mark absolute -bottom-2 -top-2 w-[3px] bg-ember shadow-[0_0_0_2px_rgba(232,85,30,0.22)]"
          style={{ left: `calc(${p}% - 1.5px)` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-mute">
        <span>{fmtMoney(low, cur, 0)}</span>
        <span className="uppercase tracking-[0.18em] text-teal">typical market band</span>
        <span>{fmtMoney(high, cur, 0)}</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({
  quote,
  job,
  currency,
  bench,
  benchmarks,
  onJob,
  onTarget,
  onOffer,
}: {
  quote: Quote;
  job: Job;
  currency: Currency;
  bench: Benchmark | undefined;
  benchmarks: Benchmark[];
  onJob: (patch: Partial<Job>) => void;
  onTarget: (totalTarget: number) => void;
  onOffer: () => void;
}) {
  const units = Math.max(0, job.benchmarkUnits || 0);
  const mLow = bench ? bench.low * units : 0;
  const mHigh = bench ? bench.high * units : 0;
  const mMid = (mLow + mHigh) / 2;
  const delta = mMid > 0 ? ((quote.totalPrice - mMid) / mMid) * 100 : 0;
  const status: "none" | "below" | "in" | "premium" = !bench
    ? "none"
    : quote.totalPrice < mLow
      ? "below"
      : quote.totalPrice > mHigh
        ? "premium"
        : "in";

  const suggestions = [
    { label: "Break-even floor", value: quote.totalCost, note: "covers every cost, zero profit" },
    { label: "Market match", value: mMid, note: "middle of the researched band" },
    { label: "Market high", value: mHigh, note: "top of the researched band" },
  ];

  return (
    <div className="space-y-6">
      {/* ------- cost ledger ------- */}
      <Reveal delay={100}>
        <section className="panel overflow-hidden">
          <header className="flex items-center gap-3 border-b border-line bg-card px-5 py-3.5">
            <Icon name="receipt" className="h-5 w-5 text-ink-2" />
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">Cost ledger</h3>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-mute">per unit</span>
          </header>
          <div className="px-5 py-4">
            <Row label="Materials" value={quote.uMaterials} cur={currency} />
            <Row
              label="Machine time"
              sub={`${fmtNum(job.machineHours)} h × ${fmtMoney(quote.machineRate, currency)} (depr ${fmtMoney(quote.depRate, currency)} + run ${fmtMoney(quote.runRate, currency)})`}
              value={quote.uMachine}
              cur={currency}
            />
            <Row
              label="Labor"
              sub={`${fmtNum(job.laborHours)} h × ${fmtMoney(quote.laborRate, currency)}/h loaded`}
              value={quote.uLabor}
              cur={currency}
            />
            <Row
              label="Overhead share"
              sub={`${fmtNum(quote.activeHours)} active h × ${fmtMoney(quote.overheadRate, currency)}/h`}
              value={quote.uOverhead}
              cur={currency}
            />
            <Row label="Setup / file prep" sub={`amortized over ${quote.qty} pcs`} value={quote.uSetup} cur={currency} />
            <div className="my-2 border-t border-line" />
            <Row label="True cost per unit" value={quote.unitCost} cur={currency} strong />
            <Row label={`× ${quote.qty} unit${quote.qty > 1 ? "s" : ""} — total cost`} value={quote.totalCost} cur={currency} />
            <div className="my-2 border-t border-line" />
            <Row label="Subtotal (net)" value={quote.totalPrice} cur={currency} strong />
            <Row label={`VAT / sales tax (${fmtNum(quote.vatPct, 1)}%)`} value={quote.vat} cur={currency} />
            <Row label="Invoice total" value={quote.invoiceTotal} cur={currency} strong />
          </div>
        </section>
      </Reveal>

      {/* ------- price hero ------- */}
      <Reveal delay={140}>
        <section className="panel-dark relative overflow-hidden p-5">
          <Noise opacity={0.09} />
          <span
            key={`${job.marginMode}-${Math.round(job.marginPct)}`}
            className="stamp-in absolute right-4 top-4 z-10 border-2 border-dashed border-ember px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ember"
          >
            cost+{job.marginMode} {Math.round(job.marginPct)}%
          </span>
          <p className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
            <ShinyText text="Your price · per unit" />
          </p>
          <AnimatedNumber
            value={quote.unitPrice}
            format={(n) => fmtMoney(n, currency)}
            className="relative mt-1 block font-display text-5xl font-bold leading-none tracking-tight text-paper"
          />
          <p className="relative mt-2 font-mono text-xs text-paper/65">
            order total{" "}
            <AnimatedNumber
              value={quote.totalPrice}
              format={(n) => fmtMoney(n, currency)}
              className="font-semibold text-paper"
            />{" "}
            · invoice {fmtMoney(quote.invoiceTotal, currency)}
          </p>
          <div className="relative mt-4 space-y-1 border-t border-paper/15 pt-3">
            <div className="ledger-row">
              <span className="text-[13px] text-paper/80">Profit (net of VAT)</span>
              <span className="dots !border-paper/25" />
              <span className="font-mono text-sm text-paper">{fmtMoney(quote.profit, currency)}</span>
            </div>
            <div className="ledger-row">
              <span className="text-[13px] text-paper/60">
                {quote.regime === "presumptive"
                  ? `Presumptive tax · ${quote.presumptiveRatePct.toFixed(1)}% of revenue${quote.presumptiveRevenueMissing ? " (set period revenue)" : ""}`
                  : "Profit tax"}
              </span>
              <span className="dots !border-paper/25" />
              <span className="font-mono text-sm text-paper/70">−{fmtMoney(quote.tax, currency)}</span>
            </div>
            <div className="ledger-row">
              <span className="text-[13px] font-semibold text-paper">In your pocket</span>
              <span className="dots !border-paper/25" />
              <span className="font-mono text-sm font-bold text-ember">{fmtMoney(quote.net, currency)}</span>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-2 gap-1">
            <div className="flex items-baseline justify-between gap-2 bg-paper/5 px-3 py-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/50">Wage, after tax</span>
              <AnimatedNumber
                value={quote.effWage}
                format={(n) => `${fmtMoney(n, currency)}/h`}
                className="font-mono text-xs font-semibold text-ember brightness-150"
              />
            </div>
            <div className="flex items-baseline justify-between gap-2 bg-paper/5 px-3 py-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/50">Active hours</span>
              <span className="font-mono text-xs font-semibold text-paper">{fmtNum(quote.activeHours)} h</span>
            </div>
          </div>
          <button
            onClick={onOffer}
            className="relative mt-4 flex w-full items-center justify-center gap-2 border border-paper/30 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-all hover:border-ember hover:bg-ember hover:text-paper active:translate-y-px"
          >
            <Icon name="receipt" className="h-4 w-4" />
            Write offer letter (.md)
          </button>
        </section>
      </Reveal>

      {/* ------- market signal ------- */}
      <Reveal delay={180}>
        <section className="panel overflow-hidden">
          <header className="flex items-center gap-3 border-b border-line bg-card px-5 py-3.5">
            <Icon name="target" className="h-5 w-5 text-ink-2" />
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">Market signal</h3>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-mute">order total</span>
          </header>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px]">
              <Field label="Compare against" help="sigBench">
                <SelectInput
                  value={job.benchmarkId}
                  onChange={(v) => onJob({ benchmarkId: v })}
                  options={benchmarks.map((b) => ({ v: b.id, label: `${b.label}${b.custom ? " ★" : ""}` }))}
                />
              </Field>
              <Field label={bench ? `Job size (${bench.unit})` : "Job size"} help="sigSize">
                <NumInput value={job.benchmarkUnits} onChange={(n) => onJob({ benchmarkUnits: n })} suffix={bench ? bench.unit.replace("$", "") : ""} step={1} min={0} />
              </Field>
            </div>

            {bench ? (
              <>
                <Meter low={mLow} high={mHigh} price={quote.totalPrice} cur={currency} />
                <div
                  className={`flex items-start gap-2.5 border px-3 py-2.5 text-xs font-medium leading-snug ${
                    status === "below"
                      ? "border-amber/50 bg-amber/10 text-amber"
                      : status === "premium"
                        ? "border-ember/50 bg-ember/10 text-ember-deep"
                        : "border-teal/50 bg-teal/10 text-teal"
                  }`}
                >
                  <Icon
                    name={status === "below" ? "alert" : status === "premium" ? "target" : "check"}
                    className="mt-0.5 h-4 w-4 shrink-0"
                    sw={2.2}
                  />
                  <span>
                    {status === "below" &&
                      `Under market — the typical band starts at ${fmtMoney(mLow, currency, 0)}. You may be leaving money on the table.`}
                    {status === "in" &&
                      `In market range — ${fmtNum(Math.abs(delta), 0)}% ${delta >= 0 ? "above" : "below"} the researched midpoint. Competitive and defensible.`}
                    {status === "premium" &&
                      "Premium — above the typical band. Back it with turnaround, finish quality or service."}
                  </span>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                    Snap your margin to a target
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {suggestions.map((sug) => (
                      <button
                        key={sug.label}
                        type="button"
                        disabled={!sug.value || sug.value <= 0}
                        onClick={() => onTarget(sug.value)}
                        title={sug.note}
                        className="group border border-line bg-card px-2 py-2.5 text-left transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-ember enabled:hover:shadow-[var(--shadow-press-sm)] enabled:active:translate-y-0 disabled:opacity-40"
                      >
                        <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-mute group-enabled:group-hover:text-ember-deep">
                          {sug.label}
                        </span>
                        <span className="mt-1 block font-mono text-sm font-semibold text-ink">
                          {fmtMoney(sug.value, currency, 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="border border-dashed border-line bg-card px-4 py-5 text-xs leading-relaxed text-mute">
                Pick a benchmark to see how your price sits against researched market rates — or add your own
                findings in Competitor Research / Market Intel.
              </p>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
