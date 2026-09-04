import { useState } from "react";
import type { Integrations, Preset, Settings, SearchProvider } from "../types";
import { SHEETS_SCRIPT } from "../lib/ai";
import { BillsSection, LaborSection, MarketingSection, TaxSection } from "./BusinessSections";
import { Field, Icon, Reveal, Section, Seg, SelectInput, TextArea, TextInput } from "./ui";

const PROVIDERS: { v: SearchProvider; label: string; hint: string }[] = [
  { v: "tavily", label: "Tavily", hint: "api key — api.tavily.com" },
  { v: "firecrawl", label: "Firecrawl", hint: "api key — firecrawl.dev" },
  { v: "searxng", label: "SearXNG", hint: "instance URL — self-hosted" },
  { v: "crawl4ai", label: "Crawl4AI", hint: "server URL — self-hosted" },
];

function KeyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-card px-4 py-3">
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-2">{label}</p>
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
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <LaborSection settings={settings} onPatch={onPatch} />
        <BillsSection settings={settings} onPatch={onPatch} />
        <TaxSection settings={settings} onPatch={onPatch} />
        <MarketingSection settings={settings} onPatch={onPatch} />
      </div>

      <div className="space-y-6">
        {/* ---------- integrations ---------- */}
        <Reveal delay={60}>
          <Section
            num="05"
            icon="sparkle"
            title="AI & search integrations"
            sub="Bring your own keys. Everything is model-agnostic and never leaves your browser except the APIs you configure."
          >
            <div className="space-y-3">
              <KeyRow label="OpenAI-compatible model · for specs, enrichment & summaries">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr]">
                  <Field label="Base URL">
                    <TextInput value={integrations.aiBase} onChange={(v) => onIntegrations({ aiBase: v })} placeholder="https://api.openai.com/v1" />
                  </Field>
                  <Field label="Model" hint="any model name">
                    <TextInput value={integrations.aiModel} onChange={(v) => onIntegrations({ aiModel: v })} placeholder="gpt-4o-mini" />
                  </Field>
                  <Field label="API key" className="sm:col-span-2">
                    <TextInput value={integrations.aiKey} onChange={(v) => onIntegrations({ aiKey: v })} placeholder="sk-… (also works with Groq, OpenRouter, Ollama, LM Studio…)" />
                  </Field>
                </div>
              </KeyRow>

              <KeyRow label="Web search provider · competitor price lookups">
                <Seg
                  options={PROVIDERS.map((p) => ({ v: p.v, label: p.label }))}
                  value={integrations.provider}
                  onChange={(v) => onIntegrations({ provider: v })}
                />
                <div className="mt-2.5">
                  {integrations.provider === "tavily" && (
                    <Field label="Tavily API key">
                      <TextInput value={integrations.tavilyKey} onChange={(v) => onIntegrations({ tavilyKey: v })} placeholder="tvly-…" />
                    </Field>
                  )}
                  {integrations.provider === "firecrawl" && (
                    <Field label="Firecrawl API key">
                      <TextInput value={integrations.firecrawlKey} onChange={(v) => onIntegrations({ firecrawlKey: v })} placeholder="fc-…" />
                    </Field>
                  )}
                  {integrations.provider === "searxng" && (
                    <Field label="SearXNG instance URL" hint="must allow JSON + CORS">
                      <TextInput value={integrations.searxngUrl} onChange={(v) => onIntegrations({ searxngUrl: v })} placeholder="https://searx.yourdomain.com" />
                    </Field>
                  )}
                  {integrations.provider === "crawl4ai" && (
                    <Field label="Crawl4AI server URL">
                      <TextInput value={integrations.crawl4aiUrl} onChange={(v) => onIntegrations({ crawl4aiUrl: v })} placeholder="http://localhost:11235" />
                    </Field>
                  )}
                  <p className="mt-2 font-mono text-[10px] text-mute">
                    {PROVIDERS.find((p) => p.v === integrations.provider)?.hint}
                  </p>
                </div>
              </KeyRow>

              <KeyRow label="Cloudflare Workers AI · reference photos for machines">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <Field label="Account ID">
                    <TextInput value={integrations.cfAccountId} onChange={(v) => onIntegrations({ cfAccountId: v })} placeholder="hex account id" />
                  </Field>
                  <Field label="AI API token">
                    <TextInput value={integrations.cfToken} onChange={(v) => onIntegrations({ cfToken: v })} placeholder="Workers AI token" />
                  </Field>
                  <Field label="Image model" className="sm:col-span-2">
                    <TextInput value={integrations.cfModel} onChange={(v) => onIntegrations({ cfModel: v })} placeholder="@cf/black-forest-labs/flux.1-schnell" />
                  </Field>
                </div>
              </KeyRow>
            </div>
          </Section>
        </Reveal>

        {/* ---------- google sheets ---------- */}
        <Reveal delay={100}>
          <Section
            num="06"
            icon="sheet"
            title="Google Sheets price log"
            sub="One tab per machine. Each press of “Research market prices” appends your quote next to the market range, dated, with sources."
          >
            <Field label="Apps Script Web App URL" hint="from step 2">
              <TextInput
                value={integrations.sheetsWebhook}
                onChange={(v) => onIntegrations({ sheetsWebhook: v })}
                placeholder="https://script.google.com/macros/s/…/exec"
              />
            </Field>
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

        {/* ---------- offer letter ---------- */}
        <Reveal delay={140}>
          <Section
            num="07"
            icon="receipt"
            title="Offer letter (.md)"
            sub="Template & studio defaults used by “Write offer letter” on the pricing panel."
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <Field label="Business name">
                <TextInput value={offerDefaults.businessName} onChange={(v) => onOfferDefaults({ businessName: v })} />
              </Field>
              <Field label="Turnaround">
                <TextInput value={offerDefaults.turnaround} onChange={(v) => onOfferDefaults({ turnaround: v })} />
              </Field>
              <Field label="Default validity" hint="days">
                <TextInput value={String(offerDefaults.validDays)} onChange={(v) => onOfferDefaults({ validDays: Math.max(1, parseInt(v) || 1) })} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Markdown template" hint="placeholders below">
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

        {/* ---------- presets ---------- */}
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
                  <Field label="Preset name">
                    <TextInput value={newName} onChange={setNewName} placeholder="e.g. Lisbon pop-up stall" />
                  </Field>
                </div>
                <div className="min-w-40 flex-1">
                  <Field label="Location / context">
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
  );
}
