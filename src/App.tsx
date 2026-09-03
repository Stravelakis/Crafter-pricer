import { useMemo, useState } from "react";
import type { Currency, Job, Machine, ResearchEntry, Settings } from "./types";
import { DEFAULT_RESEARCH, SCENARIOS, defaultScenario, uid } from "./lib/presets";
import { BENCHMARKS, TYPE_TO_BENCH } from "./lib/market";
import {
  clamp,
  computeQuote,
  fmtMoney,
  laborRate,
  machinePerHour,
  overheadPerHour,
} from "./lib/calc";
import { Chip, Icon, Reveal, useLocalStorage } from "./components/ui";
import MachinesSection from "./components/MachinesSection";
import {
  BillsSection,
  LaborSection,
  TaxMarketingSection,
} from "./components/BusinessSections";
import JobTicket from "./components/JobTicket";
import ResultsPanel from "./components/ResultsPanel";
import MarketPanel from "./components/MarketPanel";

/** sensible default benchmark units when the machine (and thus service) changes */
const suggestUnits = (benchId: string, j: Job): number => {
  const qty = Math.max(1, j.quantity);
  switch (benchId) {
    case "fdm-hour":
    case "sla-hour":
      return Math.round(j.machineHours * qty * 100) / 100;
    case "engrave-min":
    case "cut-min":
      return Math.round(j.machineHours * 60 * qty);
    case "uv-item":
    case "engrave-item":
      return qty;
    case "uv-cm2":
      return 100 * qty;
    default:
      return j.benchmarkUnits;
  }
};

export default function App() {
  const boot = useMemo(defaultScenario, []);
  const [machines, setMachines] = useLocalStorage<Machine[]>("mc.machines.v1", boot.machines);
  const [settings, setSettings] = useLocalStorage<Settings>("mc.settings.v1", boot.settings);
  const [job, setJob] = useLocalStorage<Job>("mc.job.v1", boot.job);
  const [research, setResearch] = useLocalStorage<ResearchEntry[]>("mc.research.v1", DEFAULT_RESEARCH);
  const [scenarioId, setScenarioId] = useState<string | null>("pro");

  const cur: Currency = settings.currency ?? "USD";
  const machine = machines.find((m) => m.id === job.machineId) ?? machines[0];
  const quote = useMemo(() => computeQuote(job, machine, settings), [job, machine, settings]);

  const benchmarksAll = useMemo(
    () => [
      ...BENCHMARKS,
      ...research.map((r) => ({
        id: r.id,
        label: r.label,
        unit: r.unit,
        hint: `job size in ${r.unit}`,
        low: r.low,
        high: r.high,
        model: "your research",
        source: r.source,
        custom: true as const,
      })),
    ],
    [research],
  );
  const bench = benchmarksAll.find((b) => b.id === job.benchmarkId);

  /* ---------- handlers ---------- */

  const patchSettings = (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p }));

  const patchJob = (patch: Partial<Job>) =>
    setJob((j) => {
      const next = { ...j, ...patch };
      if (patch.machineId) {
        const m = machines.find((x) => x.id === patch.machineId);
        if (m) {
          next.benchmarkId = TYPE_TO_BENCH[m.type];
          next.benchmarkUnits = suggestUnits(TYPE_TO_BENCH[m.type], next);
        }
      }
      return next;
    });

  const addMachine = () => {
    const m: Machine = {
      id: uid(),
      name: "New machine",
      type: "fdm",
      purchaseCost: 500,
      salvageValue: 200,
      lifespanMonths: 48,
      hoursPerMonth: 40,
      watts: 200,
      consumablesPerHour: 0.5,
      maintenancePerMonth: 10,
    };
    setMachines((ms) => [...ms, m]);
    setJob((j) => ({ ...j, machineId: m.id }));
  };

  const patchMachine = (id: string, patch: Partial<Machine>) =>
    setMachines((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const removeMachine = (id: string) => {
    const next = machines.filter((m) => m.id !== id);
    setMachines(next);
    if (job.machineId === id) setJob({ ...job, machineId: next[0]?.id ?? "" });
  };

  const applyScenario = (id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id);
    if (!sc) return;
    setMachines(sc.machines);
    setSettings(sc.settings);
    setJob(sc.job);
    setScenarioId(id);
  };

  const applyTarget = (total: number) => {
    if (total <= 0) return;
    const m =
      total <= quote.totalCost
        ? 0
        : clamp((1 - quote.totalCost / total) * 100, 0, 95);
    setJob((j) => ({ ...j, marginMode: "margin", marginPct: Math.round(m * 10) / 10 }));
  };

  const addResearch = (e: ResearchEntry) => setResearch((rs) => [...rs, e]);
  const removeResearch = (id: string) => {
    setResearch((rs) => rs.filter((r) => r.id !== id));
    if (job.benchmarkId === id)
      setJob((j) => ({ ...j, benchmarkId: machine ? TYPE_TO_BENCH[machine.type] : "fdm-hour" }));
  };
  const useResearch = (e: ResearchEntry) => setJob((j) => ({ ...j, benchmarkId: e.id }));

  /* ---------- render ---------- */

  return (
    <div className="min-h-screen">
      {/* ======= top bar ======= */}
      <header className="sticky top-0 z-50 border-b-2 border-ember bg-ink">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-ember text-ink">
            <Icon name="spark" className="h-5 w-5" sw={2.2} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold uppercase leading-tight tracking-[0.2em] text-paper">
              MarginCraft
            </p>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-paper/45">
              maker pricing studio
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-1.5 xl:flex">
            <Chip label="Overhead/hr" value={fmtMoney(overheadPerHour(settings), cur)} />
            <Chip label="Labor/hr" value={fmtMoney(laborRate(settings), cur)} tone="teal" />
            <Chip
              label={machine ? "Machine/hr" : "No machine"}
              value={machine ? fmtMoney(machinePerHour(machine, settings), cur) : "—"}
              tone="ember"
            />
          </div>
          <select
            value={cur}
            onChange={(e) => patchSettings({ currency: e.target.value as Currency })}
            title="Currency"
            className="ml-2 shrink-0 cursor-pointer border border-paper/25 bg-ink px-2 py-1.5 font-mono text-xs text-paper outline-none transition hover:border-ember focus:border-ember"
          >
            {(["USD", "EUR", "GBP"] as Currency[]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => applyScenario(defaultScenario().id)}
            title="Reset to the default studio"
            className="grid h-8 w-8 shrink-0 place-items-center border border-paper/25 text-paper/60 transition-all hover:border-ember hover:text-ember active:translate-y-px"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ======= masthead ======= */}
      <div className="border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-5 pb-8 pt-10 lg:grid-cols-[1fr_340px]">
          <Reveal>
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-ember">
              <Icon name="bolt" className="h-3.5 w-3.5" sw={2.2} />
              3D · UV · Laser — cost-plus pricing workbench
            </p>
            <h1 className="font-display text-[2.6rem] font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl">
              Cost it to the cent.
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1.6px var(--color-ink)" }}
              >
                Price it to win.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-mute">
              Drop in your machines, your hour, your bills and your tax bite. MarginCraft turns
              them into an honest cost-plus price — then checks it against what the market
              actually pays for printing, engraving and cutting work.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
                Load a studio preset
              </p>
              <div className="space-y-1.5">
                {SCENARIOS.map((sc, i) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => applyScenario(sc.id)}
                    className={`group flex w-full items-center gap-3 border px-3.5 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-press-sm)] active:translate-y-0 ${
                      scenarioId === sc.id
                        ? "border-ember bg-card shadow-[var(--shadow-press-sm)]"
                        : "border-line bg-panel"
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold ${
                        scenarioId === sc.id ? "text-ember" : "text-mute"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-bold uppercase tracking-wide text-ink">
                        {sc.label}
                      </span>
                      <span className="block truncate text-[11px] text-mute">{sc.blurb}</span>
                    </span>
                    <Icon
                      name="check"
                      sw={2.6}
                      className={`ml-auto h-4 w-4 shrink-0 text-ember transition-opacity ${
                        scenarioId === sc.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ======= workbench ======= */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <MachinesSection
            machines={machines}
            settings={settings}
            onPatch={patchMachine}
            onRemove={removeMachine}
            onAdd={addMachine}
          />
          <LaborSection settings={settings} onPatch={patchSettings} />
          <BillsSection settings={settings} onPatch={patchSettings} />
          <TaxMarketingSection settings={settings} onPatch={patchSettings} />
          <MarketPanel
            research={research}
            onAdd={addResearch}
            onRemove={removeResearch}
            onUse={useResearch}
          />
        </div>
        <div className="order-first lg:order-none lg:col-span-5">
          <div className="space-y-6 pb-2 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-1">
            <JobTicket
              job={job}
              machines={machines}
              machine={machine}
              quote={quote}
              currency={cur}
              onChange={patchJob}
            />
            <ResultsPanel
              quote={quote}
              job={job}
              currency={cur}
              bench={bench}
              benchmarks={benchmarksAll}
              onJob={patchJob}
              onTarget={applyTarget}
            />
          </div>
        </div>
      </main>

      {/* ======= footer ======= */}
      <footer className="mt-4 border-t border-line bg-panel/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-mute">
            MarginCraft — every number stays in your browser
          </p>
          <p className="font-mono text-[10px] text-mute">
            Market bands are indicative (USD sources). Verify against your local market.
          </p>
        </div>
      </footer>
    </div>
  );
}
