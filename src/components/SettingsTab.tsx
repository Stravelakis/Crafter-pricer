import { useEffect, useState, type ReactNode } from "react";
import type { Integrations, Preset, Settings, SearchProvider } from "../types";
import { SHEETS_SCRIPT } from "../lib/ai";
import { BillsSection, LaborSection, MarketingSection, TaxSection } from "./BusinessSections";
import { Field, HelpTip, Icon, Reveal, Section, Seg, SelectInput, TextArea, TextInput } from "./ui";

const PROVIDERS: { v: SearchProvider; label: string; hint: string }[] = [
  { v: "tavily", label: "Tavily", hint: "api key — api.tavily.com" },
  { v: "firecrawl", label: "Firecrawl", hint: "api key — firecrawl.dev" },
  { v: "searxng", label: "SearXNG", hint: "instance URL — self-hosted" },
  { v: "crawl4ai", label: "Crawl4AI", hint: "server URL — self-hosted" },
];

const TOC = [
  { id: "s-labor", n: "01", label: "Labor" },
  { id: "s-bills", n: "02", label: "Bills & overhead" },
  { id: "s-tax", n: "03", label: "Tax system" },
  { id: "s-mkt", n: "04", label: "Marketing" },
  { id: "s-ai", n: "05", label: "AI & search keys" },
  { id: "s-sheets", n: "06", label: "Google Sheets log" },
  { id: "s-offer", n: "07", label: "Offer letter" },
  { id: "s-presets", n: "08", label: "Business presets" },
];

function SettingsToc() {
  const [active, setActive] = useState(TOC[0].id);
  const [openM, setOpenM] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-18% 0px -72% 0px" },
    );
    TOC.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpenM(false);
  };

  const list = (
    <ul className="space-y-0.5">
      {TOC.map((t) => (
        <li key={t.id}>
          <button
            onClick={() => go(t.id)}
            className={`flex w-full items-baseline gap-2 px-2.5 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] transition-all ${
              active === t.id
                ? "bg-ink text-paper"
                : "text-mute hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <span className={active === t.id ? "text-ember" : "text-line"}>{t.n}</span>
            {t.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* desktop floater */}
      <aside className="fixed right-4 top-24 z-40 hidden w-48 border border-line bg-panel/95 shadow-[var(--shadow-press-sm)] backdrop-blur-sm 2xl:block">
        <p className="flex items-center gap-2 border-b border-line px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ember">
          <Icon name="compass" className="h-3.5 w-3.5" />
          On this page
        </p>
        <div className="p-1.5">{list}</div>
      </aside>
      {/* mobile floater */}
      <div className="fixed bottom-5 left-5 z-40 2xl:hidden">
        {openM && (
          <div className="tip-pop mb-2 w-52 border border-line bg-panel shadow-[var(--shadow-press)]">
            <p className="border-b border-line px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ember">
              On this page
            </p>
            <div className="p-1.5">{list}</div>
          </div>
        )}
        <button
          onClick={() => setOpenM((o) => !o)}
          className="flex items-center gap-2 border border-ink bg-ink px-3 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-paper shadow-[var(--shadow-press-sm)] transition-all hover:border-ember hover:bg-ember active:translate-y-px"
        >
          <Icon name="compass" className="h-4 w-4" />
          Contents
        </button>
      </div>
    </>
  );
}

function KeyRow({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="border border-line bg-card px-4 py-3">
      <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-2">
        {label}
        {help && <HelpTip k={help} />}
      </p>
      {children}
    </div>
  );
}

export default function SettingsTab({
  settings,
  onPatch,
  integrations,
  onIntegrations,
  presets,
  activeId,
  onApply,
  onSaveCurrent,
  onDeletePreset,
  onRenamePreset,
  offerTemplate,
  onOfferTemplate,
  offerDefaults,
  onOfferDefaults,
  onToast,
}: {
  settings: Settings;
  onPatch: (p: Partial<Settings>) => void;
  integrations: Integrations;
  onIntegrations: (p: Partial<Integrations>) => void;
  presets: Preset[];
  activeId: string;
  onApply: (id: string) => void;
  onSaveCurrent: (name: string, location: string) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string, p: Partial<Preset>) => void;
  offerTemplate: string;
  onOfferTemplate: (s: string) => void;
  offerDefaults: { businessName: string; turnaround: string; validDays: number };
  onOfferDefaults: (p: Partial<{ businessName: string; turnaround: string; validDays: number }>) => void;
  onToast: (msg: string) => void;
}) {
  const [showScript, setShowScript] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(SHEETS_SCRIPT);
      onToast("Apps Script copied — paste it into script.google.com");
    } catch {
      onToast("Could not access the clipboard");
    }
  };

  return (
    <div className="relative">
      <SettingsToc />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:pr-52">
        <div className="space-y-6">
          <div id="s-labor">
            <LaborSection settings={settings} onPatch={onPatch} />
          </div>
          <div id="s-bills">
            <BillsSection settings={settings} onPatch={onPatch} />
          </div>
          <div id="s-tax">
            <TaxSection settings={settings} onPatch={onPatch} />
          </div>
          <div id="s-mkt">
            <MarketingSection settings={settings} onPatch={onPatch} />
          </div>
        </div>

        <div className="space-y-6">
          {/* ---------- integrations ---------- */}
          <div id="s-ai">
            <Reveal delay={60}>
              <Section
                num="05"
                icon="sparkle"
                title="AI & search integrations"
                sub="Bring your own keys. Everything is model-agnostic and never leaves your browser except the APIs you configure."
              >
                <div className="space-y-3">
                  <KeyRow label="OpenAI-compatible model · for specs, enrichment & summaries" help="iBase">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr]">
                      <Field label="Base URL" help="iBase">
                        <TextInput value={integrations.aiBase} onChange={(v) => onIntegrations({ aiBase: v })} placeholder="https://api.openai.com/v1" />
                      </Field>
                      <Field label="Model" help="iModel">
                        <TextInput value={integrations.aiModel} onChange={(v) => onIntegrations({ aiModel: v })} placeholder="gpt-4o-mini" />
                      </Field>
                      <Field label="API key" help="iKey" className="sm:col-span-2">
                        <TextInput value={integrations.aiKey} onChange={(v) => onIntegrations({ aiKey: v })} placeholder="sk-… (also works with Groq, OpenRouter, Ollama, LM Studio…)" />
                      </Field>
                    </div>
                  </KeyRow>

                  <KeyRow label="Web search provider · competitor price lookups" help="rqProvider">
                    <Seg
                      options={PROVIDERS.map((p) => ({ v: p.v, label: p.label }))}
                      value={integrations.provider}
                      onChange={(v) => onIntegrations({ provider: v })}
                    />
                    <div className="mt-2.5">
                      {integrations.provider === "tavily" && (
                        <Field label="Tavily API key" help="iTavily">
                          <TextInput value={integrations.tavilyKey} onChange={(v) => onIntegrations({ tavilyKey: v })} placeholder="tvly-…" />
                        </Field>
                      )}
                      {integrations.provider === "firecrawl" && (
                        <Field label="Firecrawl API key" help="iFirecrawl">
                          <TextInput value={integrations.firecrawlKey} onChange={(v) => onIntegrations({ firecrawlKey: v })} placeholder="fc-…" />
                        </Field>
                      )}
                      {integrations.provider === "searxng" && (
                        <Field label="SearXNG instance URL" help="iSearx">
                          <TextInput value={integrations.searxngUrl} onChange={(v) => onIntegrations({ searxngUrl: v })} placeholder="https://searx.yourdomain.com" />
                        </Field>
                      )}
                      {integrations.provider === "crawl4ai" && (
                        <Field label="Crawl4AI server URL" help="iCrawl">
                          <TextInput value={integrations.crawl4aiUrl} onChange={(v) => onIntegrations({ crawl4aiUrl: v })} placeholder="http://localhost:11235" />
                        </Field>
                      )}
                      <p className="mt-2 font-mono text-[10px] text-mute">
                        {PROVIDERS.find((p) => p.v === integrations.provider)?.hint}
                      </p>
                    </div>
                  </KeyRow>

                  <KeyRow label="Cloudflare Workers AI · reference photos for machines" help="iCfAccount">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Field label="Account ID" help="iCfAccount">
                        <TextInput value={integrations.cfAccountId} onChange={(v) => onIntegrations({ cfAccountId: v })} placeholder="hex account id" />
                      </Field>
                      <Field label="AI API token" help="iCfToken">
                        <TextInput value={integrations.cfToken} onChange={(v) => onIntegrations({ cfToken: v })} placeholder="Workers AI token" />
                      </Field>
                      <Field label="Image model" help="iCfModel" className="sm:col-span-2">
                        <TextInput value={integrations.cfModel} onChange={(v) => onIntegrations({ cfModel: v })} placeholder="@cf/black-forest-labs/flux.1-schnell" />
                      </Field>
                    </div>
                  </KeyRow>
                </div>
              </Section>
            </Reveal>
          </div>

          {/* ---------- google sheets ---------- */}
          <div id="s-sheets">
            <Reveal delay={100}>
              <Section
                num="06"
                icon="sheet"
                title="Google Sheets price log"
                sub="Your dated paper trail: what you charged vs what the market charged."
              >
                <div className="mb-4 border-l-4 border-teal bg-teal/5 px-4 py-3">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-teal">
                    <HelpTip k="sWebhook" /> What is the price log?
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
                    It's a running spreadsheet that keeps your pricing honest over time. When you press{" "}
                    <strong className="font-semibold text-ink">“Research market prices”</strong> in the Studio and then{" "}
                    <strong className="font-semibold text-ink">“Sync to Sheets”</strong>, a dated row is appended showing{" "}
                    <em>your quote</em> next to the <em>competitors' price range</em>, with links to the exact listings.
                    Each machine gets its own tab, so you can watch whether your rates stay competitive month after month.
                    Skip the setup and the same data downloads as a CSV instead — nothing is required.
                  </p>
                </div>
                <Field label="Apps Script Web App URL" help="sWebhook">
                  <TextInput
                    value={integrations.sheetsWebhook}
                    onChange={(v) => onIntegrations({ sheetsWebhook: v })}
                    placeholder="https://script.google.com/macros/s/…/exec"
                  />
                </Field>
                <div className="mt-2.5">
                  <Field label="Spreadsheet ID" help="sFileId">
                    <TextInput
                      value={integrations.sheetsFileId ?? ""}
                      onChange={(v) => onIntegrations({ sheetsFileId: v || undefined })}
                      placeholder="optional — auto-created if empty"
                    />
                  </Field>
                </div>
                <ol className="mt-3 space-y-1.5 text-xs leading-relaxed text-ink-2">
                  <li><span className="mr-1.5 font-mono text-ember">1.</span>Open <a className="text-teal underline underline-offset-2" href="https://script.google.com" target="_blank" rel="noreferrer">script.google.com</a> → new project → paste the bridge script.</li>
                  <li><span className="mr-1.5 font-mono text-ember">2.</span>Deploy → Web app → execute as <em>Me</em>, access <em>Anyone</em> → copy the URL above.</li>
                  <li><span className="mr-1.5 font-mono text-ember">3.</span>Press “Research market prices” then “Sync to Sheets”. The spreadsheet is created automatically, one tab per machine.</li>
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={copyScript}
                    className="flex items-center gap-2 border border-ink bg-ink px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-paper transition-all hover:border-ember hover:bg-ember active:translate-y-px"
                  >
                    <Icon name="copy" className="h-3.5 w-3.5" /> Copy bridge script
                  </button>
                  <button
                    onClick={() => setShowScript((s) => !s)}
                    className="flex items-center gap-2 border border-line px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2 transition-all hover:border-teal hover:text-teal"
                  >
                    <Icon name="sheet" className="h-3.5 w-3.5" /> {showScript ? "Hide script" : "View script"}
                  </button>
                </div>
                {showScript && (
                  <pre className="mt-3 max-h-56 overflow-y-auto border border-line bg-card p-3 font-mono text-[10px] leading-relaxed text-ink-2">
                    {SHEETS_SCRIPT}
                  </pre>
                )}
              </Section>
            </Reveal>
          </div>

          {/* ---------- offer letter ---------- */}
          <div id="s-offer">
            <Reveal delay={140}>
              <Section
                num="07"
                icon="receipt"
                title="Offer letter (.md)"
                sub="Template & studio defaults used by “Write offer letter” on the pricing panel."
              >
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <Field label="Business name" help="oBusiness">
                    <TextInput value={offerDefaults.businessName} onChange={(v) => onOfferDefaults({ businessName: v })} />
                  </Field>
                  <Field label="Turnaround" help="oTurnaround">
                    <TextInput value={offerDefaults.turnaround} onChange={(v) => onOfferDefaults({ turnaround: v })} />
                  </Field>
                  <Field label="Default validity" help="oValidDays" hint="days">
                    <TextInput value={String(offerDefaults.validDays)} onChange={(v) => onOfferDefaults({ validDays: Math.max(1, parseInt(v) || 1) })} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Markdown template" help="oTemplate">
                    <TextArea value={offerTemplate} onChange={onOfferTemplate} rows={11} mono />
                  </Field>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["item", "client", "qty", "unit_price", "total_price", "vat", "vat_pct", "invoice_total", "valid_until", "turnaround", "notes", "business_name"].map((k) => (
                    <code key={k} className="border border-line bg-card px-1.5 py-0.5 font-mono text-[9px] text-teal">
                      {"{{" + k + "}}"}
                    </code>
                  ))}
                </div>
              </Section>
            </Reveal>
          </div>

          {/* ---------- presets ---------- */}
          <div id="s-presets">
            <Reveal delay={180}>
              <Section
                num="08"
                icon="layers"
                title="Business presets"
                sub="Snapshots of machines + costs + a sample job. Create one per location or business line and switch from the Studio bar."
              >
                <div className="space-y-2">
                  {presets.map((p) => (
                    <div
                      key={p.id}
                      className={`flex flex-wrap items-center gap-2 border px-3 py-2.5 transition-all ${
                        activeId === p.id ? "border-ember bg-ember/5" : "border-line bg-card hover:border-ink/30"
                      }`}
                    >
                      <div className="grid min-w-0 flex-1 basis-60 grid-cols-1 gap-1.5 sm:grid-cols-2">
                        <TextInput value={p.name} onChange={(v) => onRenamePreset(p.id, { name: v })} />
                        <TextInput value={p.location} onChange={(v) => onRenamePreset(p.id, { location: v })} />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-mute">
                        {p.machines.length} machine{p.machines.length !== 1 ? "s" : ""}
                        {p.custom ? " · custom" : ""}
                      </span>
                      <button
                        onClick={() => onApply(p.id)}
                        className={`border px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all active:translate-y-px ${
                          activeId === p.id
                            ? "border-ember bg-ember text-paper"
                            : "border-line text-ink-2 hover:border-ember hover:text-ember"
                        }`}
                      >
                        {activeId === p.id ? "Active" : "Apply"}
                      </button>
                      {p.custom && (
                        <button
                          onClick={() => onDeletePreset(p.id)}
                          title="Delete preset"
                          className="grid h-7 w-7 place-items-center border border-line text-mute transition-all hover:border-danger hover:text-danger"
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t-2 border-dashed border-line pt-4">
                  <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                    Save current setup as a new preset
                  </p>
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-40 flex-1">
                      <Field label="Preset name" help="pName">
                        <TextInput value={newName} onChange={setNewName} placeholder="e.g. Lisbon pop-up stall" />
                      </Field>
                    </div>
                    <div className="min-w-40 flex-1">
                      <Field label="Location / context" help="pLocation">
                        <TextInput value={newLocation} onChange={setNewLocation} placeholder="e.g. Porto, PT · craft fairs" />
                      </Field>
                    </div>
                    <button
                      onClick={() => {
                        if (!newName.trim()) return;
                        onSaveCurrent(newName.trim(), newLocation.trim() || "Custom");
                        setNewName("");
                        setNewLocation("");
                      }}
                      disabled={!newName.trim()}
                      className="flex items-center gap-2 border border-ink bg-ink px-3 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-paper transition-all enabled:hover:border-ember enabled:hover:bg-ember enabled:active:translate-y-px disabled:opacity-40"
                    >
                      <Icon name="plus" className="h-3.5 w-3.5" sw={2.2} /> Save preset
                    </button>
                  </div>
                </div>
              </Section>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
