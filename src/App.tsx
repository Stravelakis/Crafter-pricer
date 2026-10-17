import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Finding,
  Integrations,
  Job,
  Machine,
  Preset,
  ResearchEntry,
  Settings,
} from "./types";
import { computeQuote, fmtMoney, pctForTarget } from "./lib/calc";
import { BENCHMARKS, TYPE_TO_BENCH } from "./lib/market";
import {
  DEFAULT_INTEGRATIONS,
  DEFAULT_OFFER_DEFAULTS,
  DEFAULT_OFFER_TEMPLATE,
  DEFAULT_PRESETS,
  DEFAULT_RESEARCH,
  newSheetsSecret,
  uid,
} from "./lib/presets";
import {
  downloadFile,
  enrichMachine,
  extractPrice,
  generateImage,
  pushToSheets,
  rowsToCsv,
  searchWeb,
  vendorFrom,
  type RawResult,
} from "./lib/ai";
import CursorGrid from "./components/CursorGrid";
import MachinesSection from "./components/MachinesSection";
import ResearchPanel from "./components/ResearchPanel";
import MarketPanel from "./components/MarketPanel";
import JobTicket from "./components/JobTicket";
import ResultsPanel from "./components/ResultsPanel";
import SettingsTab from "./components/SettingsTab";
import OfferModal from "./components/OfferModal";
import { AnimatedNumber, Field, Icon, Modal, Noise, ScrambleText, SelectInput, TextInput } from "./components/ui";

const LS_KEY = "margincraft_v3";
const SYM: Record<Settings["currency"], string> = { USD: "$", EUR: "€", GBP: "£" };
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
const round2 = (n: number) => Math.round(n * 100) / 100;

interface Persisted {
  settings: Settings;
  machines: Machine[];
  job: Job;
  research: ResearchEntry[];
  integrations: Integrations;
  presets: Preset[];
  activePresetId: string;
  offerTemplate: string;
  offerDefaults: typeof DEFAULT_OFFER_DEFAULTS;
  /** last market search, kept so a page refresh doesn't lose it */
  findings: Finding[];
  query: string;
}

const withSheetsSecret = (i: Integrations): Integrations =>
  i.sheetsSecret ? i : { ...i, sheetsSecret: newSheetsSecret() };

function boot(): Persisted {
  const base = DEFAULT_PRESETS[1];
  const fallback: Persisted = {
    settings: base.settings,
    machines: base.machines,
    job: base.job,
    research: DEFAULT_RESEARCH,
    integrations: withSheetsSecret(DEFAULT_INTEGRATIONS),
    presets: DEFAULT_PRESETS,
    activePresetId: "pro",
    offerTemplate: DEFAULT_OFFER_TEMPLATE,
    offerDefaults: DEFAULT_OFFER_DEFAULTS,
    findings: [],
    query: "",
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Persisted>;
    return {
      settings: { ...fallback.settings, ...(p.settings ?? {}) },
      machines: Array.isArray(p.machines) ? (p.machines as Machine[]) : fallback.machines,
      job: { ...fallback.job, ...(p.job ?? {}) },
      research: Array.isArray(p.research) ? (p.research as ResearchEntry[]) : fallback.research,
      integrations: withSheetsSecret({ ...fallback.integrations, ...(p.integrations ?? {}) }),
      presets: Array.isArray(p.presets) && p.presets.length ? (p.presets as Preset[]) : fallback.presets,
      activePresetId: p.activePresetId ?? "pro",
      offerTemplate: p.offerTemplate ?? DEFAULT_OFFER_TEMPLATE,
      offerDefaults: { ...DEFAULT_OFFER_DEFAULTS, ...(p.offerDefaults ?? {}) },
      findings: Array.isArray(p.findings) ? (p.findings as Finding[]) : fallback.findings,
      query: typeof p.query === "string" ? p.query : fallback.query,
    };
  } catch {
    return fallback;
  }
}

type Tab = "studio" | "settings";

export default function App() {
  const init = useRef(boot()).current;
  const [tab, setTab] = useState<Tab>("studio");
  const [settings, setSettings] = useState<Settings>(init.settings);
  const [machines, setMachines] = useState<Machine[]>(init.machines);
  const [job, setJob] = useState<Job>(init.job);
  const [research, setResearch] = useState<ResearchEntry[]>(init.research);
  const [integrations, setIntegrations] = useState<Integrations>(init.integrations);
  const [presets, setPresets] = useState<Preset[]>(init.presets);
  const [activePresetId, setActivePresetId] = useState(init.activePresetId);
  const [offerTemplate, setOfferTemplate] = useState(init.offerTemplate);
  const [offerDefaults, setOfferDefaults] = useState(init.offerDefaults);

  const [findings, setFindings] = useState<Finding[]>(init.findings);
  const [query, setQuery] = useState(init.query);
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [enrichId, setEnrichId] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetLocation, setPresetLocation] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);

  /* persistence */
  useEffect(() => {
    const data: Persisted = {
      settings, machines, job, research, integrations, presets, activePresetId, offerTemplate, offerDefaults,
      findings, query,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {
      /* storage full — drop machine photos and retry once */
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ ...data, machines: data.machines.map((m) => ({ ...m, image: undefined })) }),
        );
      } catch { /* give up silently */ }
    }
  }, [settings, machines, job, research, integrations, presets, activePresetId, offerTemplate, offerDefaults, findings, query]);

  const say = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  /* derived */
  const machine = machines.find((m) => m.id === job.machineId);
  const quote = useMemo(() => computeQuote(job, machine, settings), [job, machine, settings]);
  const benchmarks = useMemo(
    () => [
      ...BENCHMARKS,
      ...research.map((r) => ({
        id: r.id,
        label: r.label,
        unit: r.unit,
        hint: "your research",
        low: r.low,
        high: r.high,
        model: "your research",
        source: r.source,
        custom: true,
      })),
    ],
    [research],
  );
  const bench = benchmarks.find((b) => b.id === job.benchmarkId);

  /* machine handlers */
  const addMachine = () => {
    const id = uid();
    const m: Machine = {
      id,
      name: "New machine",
      type: "fdm",
      purchaseCost: 500,
      salvageValue: 200,
      lifespanMonths: 36,
      hoursPerMonth: 40,
      watts: 200,
      consumablesPerHour: 0.6,
      maintenancePerMonth: 10,
    };
    setMachines((ms) => [...ms, m]);
    setJob((j) => ({
      ...j,
      machineId: id,
      benchmarkId: j.benchmarkId || TYPE_TO_BENCH[m.type],
    }));
    setShowAll(false);
  };
  const patchMachine = (id: string, p: Partial<Machine>) =>
    setMachines((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const removeMachine = (id: string) => {
    setMachines((ms) => ms.filter((m) => m.id !== id));
    if (job.machineId === id) setJob((j) => ({ ...j, machineId: "" }));
  };

  const onEnrich = async (id: string) => {
    const m = machines.find((x) => x.id === id);
    if (!m) return;
    if (!integrations.aiKey) {
      say("Add an OpenAI-compatible key in Settings → Integrations first");
      return;
    }
    setEnrichId(id);
    try {
      const out = await enrichMachine(integrations, m);
      patchMachine(id, { summary: out.summary, specs: out.specs, links: { product: out.product_url, manual: out.manual_url } });
      say(`Specs pulled for ${m.name || "machine"}`);
    } catch (e) {
      say(e instanceof Error ? e.message : "AI enrichment failed");
    } finally {
      setEnrichId(null);
    }
  };

  const onImage = async (id: string) => {
    const m = machines.find((x) => x.id === id);
    if (!m) return;
    if (!integrations.cfAccountId || !integrations.cfToken) {
      say("Add your Cloudflare account ID + AI token in Settings first");
      return;
    }
    setImageId(id);
    try {
      const img = await generateImage(integrations, m);
      patchMachine(id, { image: img });
      say("Reference photo generated");
    } catch (e) {
      say(e instanceof Error ? e.message : "Image generation failed");
    } finally {
      setImageId(null);
    }
  };

  /* research */
  const runResearch = async () => {
    if (!query.trim()) return;
    setResearching(true);
    setResearchError(null);
    try {
      const raw: RawResult[] = await searchWeb(integrations, query.trim(), 8);
      if (!raw.length) {
        setResearchError("No results came back — try a shorter, more generic description.");
        return;
      }
      const sym = SYM[settings.currency];
      const fs: Finding[] = raw.map((r) => ({
        id: uid(),
        date: new Date().toISOString(),
        query: query.trim(),
        item: r.title,
        vendor: vendorFrom(r.title),
        price: extractPrice(r.title, r.snippet),
        sym,
        url: r.url,
        provider: integrations.provider,
      }));
      setFindings(fs);
      const priced = fs.filter((f) => f.price !== null).length;
      say(`${fs.length} listings found · ${priced} with a price`);
    } catch (e) {
      setResearchError(e instanceof Error ? e.message : "Search failed — check your key / URL in Settings.");
    } finally {
      setResearching(false);
    }
  };

  const findingToEntry = (f: Finding): ResearchEntry => ({
    id: uid(),
    label: f.item.length > 64 ? `${f.item.slice(0, 61)}…` : f.item,
    low: round2((f.price ?? 0) * 0.9),
    high: round2((f.price ?? 0) * 1.1),
    unit: `${f.sym}/item`,
    source: f.url || "web research",
  });

  const useFinding = (f: Finding) => {
    const e = findingToEntry(f);
    setResearch((rs) => [...rs, e]);
    setJob((j) => ({ ...j, benchmarkId: e.id, benchmarkUnits: Math.max(1, j.quantity) }));
    say("Added to market intel & set as benchmark");
  };
  const useAllFindings = () => {
    const priced = findings.filter((f) => f.price !== null);
    if (!priced.length) return;
    setResearch((rs) => [...rs, ...priced.map(findingToEntry)]);
    say(`${priced.length} prices logged to market intel`);
  };

  const buildSheetRows = () => {
    const priced = findings.filter((f) => f.price !== null).map((f) => f.price as number);
    const date = new Date().toLocaleDateString("en-CA");
    return [
      {
        date,
        machine: machine?.name || "General",
        item: query.trim() || job.name || "research",
        myUnit: round2(quote.unitPrice),
        myTotal: round2(quote.totalPrice),
        myCost: round2(quote.totalCost),
        mLow: priced.length ? round2(Math.min(...priced)) : null,
        mHigh: priced.length ? round2(Math.max(...priced)) : null,
        sources: findings.map((f) => f.url).filter(Boolean).join(" ; "),
      },
    ];
  };

  const syncSheets = async () => {
    const rows = buildSheetRows();
    if (integrations.sheetsWebhook) {
      setSyncing(true);
      try {
        await pushToSheets(integrations.sheetsWebhook, integrations.sheetsSecret, integrations.sheetsFileId, rows);
        setIntegrations((i) => ({ ...i, sheetsLastSync: new Date().toISOString() }));
        say("Logged to Google Sheets ✓");
      } catch (e) {
        say(
          e instanceof Error && e.message === "unauthorized"
            ? "Sheets refused the secret — copy the bridge script again and redeploy it"
            : "Sheets sync failed — check the Web App URL in Settings",
        );
      } finally {
        setSyncing(false);
      }
    } else {
      downloadFile(`margincraft-log-${rows[0].date}.csv`, rowsToCsv(rows), "text/csv");
      say("No Sheets webhook set — exported CSV instead");
    }
  };

  /* presets */
  const applyPreset = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setMachines(clone(p.machines));
    setSettings(clone(p.settings));
    setJob(clone(p.job));
    setActivePresetId(id);
    setShowAll(false);
    say(`Preset “${p.name}” applied`);
  };
  const savePreset = (name: string, location: string) => {
    const p: Preset = {
      id: uid(),
      name,
      location,
      custom: true,
      machines: clone(machines),
      settings: clone(settings),
      job: clone(job),
    };
    setPresets((ps) => [...ps, p]);
    setActivePresetId(p.id);
    say(`Preset “${name}” saved`);
  };
  const deletePreset = (id: string) => {
    setPresets((ps) => ps.filter((p) => p.id !== id));
    if (activePresetId === id) setActivePresetId("");
  };
  const renamePreset = (id: string, patch: Partial<Preset>) =>
    setPresets((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const onTarget = (total: number) => {
    setJob((j) => ({ ...j, marginPct: pctForTarget(total, quote.totalCost, j.marginMode) }));
  };

  const focusId = job.machineId || null;

  return (
    <div className="relative min-h-screen">
      <CursorGrid />

      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden bg-ink font-display text-sm font-bold text-ember">
              <Noise opacity={0.14} />
              <span className="relative">M/C</span>
            </div>
            <div className="leading-none">
              <ScrambleText
                text="MARGINCRAFT"
                className="block font-display text-lg font-bold tracking-[0.06em] text-ink"
              />
              <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.24em] text-mute">
                maker pricing studio
              </span>
            </div>
          </div>

          <nav className="ml-2 flex items-center gap-1 sm:ml-8">
            {(
              [
                { id: "studio", label: "Studio", icon: "printer" },
                { id: "settings", label: "Settings", icon: "cog" },
              ] as { id: Tab; label: string; icon: "printer" | "cog" }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-all ${
                  tab === t.id ? "bg-ink text-paper" : "text-mute hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon name={t.icon} className="h-4 w-4" />
                {t.label}
                {tab === t.id && <span className="absolute inset-x-0 -bottom-[11px] h-[3px] bg-ember" />}
              </button>
            ))}
          </nav>

          <div className="ml-auto hidden items-baseline gap-2 md:flex">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mute">unit price</span>
            <AnimatedNumber
              value={quote.unitPrice}
              format={(n) => fmtMoney(n, settings.currency)}
              className="font-mono text-base font-bold text-ember-deep"
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {tab === "studio" ? (
          <>
            {/* preset strip */}
            <div className="panel mb-6 flex flex-wrap items-center gap-3 px-4 py-3">
              <Icon name="layers" className="h-4 w-4 shrink-0 text-ember" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">
                Preset
              </span>
              <div className="w-56 min-w-40">
                <SelectInput
                  value={activePresetId}
                  onChange={applyPreset}
                  options={[
                    ...presets.map((p) => ({ v: p.id, label: `${p.name} — ${p.location}` })),
                    ...(presets.some((p) => p.id === activePresetId) ? [] : [{ v: activePresetId, label: "Custom state" }]),
                  ]}
                />
              </div>
              <button
                onClick={() => setSavePresetOpen(true)}
                className="flex items-center gap-1.5 border border-line px-2.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2 transition-all hover:border-ember hover:text-ember active:translate-y-px"
              >
                <Icon name="plus" className="h-3.5 w-3.5" sw={2.2} />
                Save current…
              </button>
              <button
                onClick={() => setTab("settings")}
                className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-teal underline-offset-2 hover:underline sm:block"
              >
                manage presets
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <MachinesSection
                  machines={machines}
                  totalCount={machines.length}
                  focusId={focusId}
                  showAll={showAll}
                  onToggleShowAll={() => setShowAll((s) => !s)}
                  settings={settings}
                  onAdd={addMachine}
                  onPatch={patchMachine}
                  onRemove={removeMachine}
                  onEnrich={onEnrich}
                  onImage={onImage}
                  enrichId={enrichId}
                  imageId={imageId}
                />
                <ResearchPanel
                  currency={settings.currency}
                  integrations={integrations}
                  query={query}
                  onQuery={setQuery}
                  findings={findings}
                  researching={researching}
                  error={researchError}
                  onResearch={runResearch}
                  onUseFinding={useFinding}
                  onUseAll={useAllFindings}
                  onSyncSheets={syncSheets}
                  syncing={syncing}
                  onGoSettings={() => setTab("settings")}
                />
                <MarketPanel
                  research={research}
                  onAdd={(e) => setResearch((rs) => [...rs, e])}
                  onRemove={(id) => setResearch((rs) => rs.filter((r) => r.id !== id))}
                  onUse={(e) => {
                    const exists = research.some((r) => r.id === e.id) || BENCHMARKS.some((b) => b.id === e.id);
                    if (!exists) setResearch((rs) => [...rs, e]);
                    setJob((j) => ({ ...j, benchmarkId: e.id, benchmarkUnits: Math.max(1, j.quantity) }));
                    say("Benchmark set from market intel");
                  }}
                />
              </div>

              <div className="order-first space-y-6 lg:order-none lg:col-span-5">
                <div className="space-y-6 pb-2 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto lg:pr-1">
                  <JobTicket
                    job={job}
                    machines={machines}
                    machine={machine}
                    quote={quote}
                    currency={settings.currency}
                    onChange={(p) => setJob((j) => ({ ...j, ...p }))}
                  />
                  <ResultsPanel
                    quote={quote}
                    job={job}
                    currency={settings.currency}
                    bench={bench}
                    benchmarks={benchmarks}
                    onJob={(p) => setJob((j) => ({ ...j, ...p }))}
                    onTarget={onTarget}
                    onOffer={() => setOfferOpen(true)}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <SettingsTab
            settings={settings}
            onPatch={(p) => setSettings((s) => ({ ...s, ...p }))}
            integrations={integrations}
            onIntegrations={(p) => setIntegrations((i) => ({ ...i, ...p }))}
            presets={presets}
            activeId={activePresetId}
            onApply={applyPreset}
            onSaveCurrent={savePreset}
            onDeletePreset={deletePreset}
            onRenamePreset={renamePreset}
            offerTemplate={offerTemplate}
            onOfferTemplate={setOfferTemplate}
            offerDefaults={offerDefaults}
            onOfferDefaults={(p) => setOfferDefaults((d) => ({ ...d, ...p }))}
            onToast={say}
          />
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t-2 border-ink pt-4 pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
            cost+margin · straight-line depreciation · VAT + profit/presumptive tax
          </p>
          <p className="font-mono text-[10px] text-mute">keys & data never leave your browser · saved locally</p>
        </footer>
      </main>

      {/* save-preset modal */}
      <Modal open={savePresetOpen} onClose={() => setSavePresetOpen(false)} title="Save current setup as preset">
        <div className="space-y-3">
          <Field label="Preset name">
            <TextInput value={presetName} onChange={setPresetName} placeholder="e.g. Berlin studio — winter rates" />
          </Field>
          <Field label="Business location / context">
            <TextInput value={presetLocation} onChange={setPresetLocation} placeholder="e.g. Berlin, DE · B2B clients" />
          </Field>
          <button
            onClick={() => {
              if (!presetName.trim()) return;
              savePreset(presetName.trim(), presetLocation.trim() || "Custom");
              setPresetName("");
              setPresetLocation("");
              setSavePresetOpen(false);
            }}
            disabled={!presetName.trim()}
            className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper transition-all enabled:hover:border-ember enabled:hover:bg-ember enabled:active:translate-y-px disabled:opacity-40"
          >
            <Icon name="check" className="h-4 w-4" sw={2.2} />
            Save snapshot
          </button>
        </div>
      </Modal>

      <OfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        quote={quote}
        job={job}
        currency={settings.currency}
        template={offerTemplate}
        defaults={offerDefaults}
        onToast={say}
      />

      {/* toast */}
      {toast && (
        <div className="toast-in fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 border border-ink bg-ink px-4 py-3 font-mono text-xs text-paper shadow-[var(--shadow-press)]">
          <Icon name="sparkle" className="h-4 w-4 text-ember" />
          {toast}
        </div>
      )}
    </div>
  );
}
