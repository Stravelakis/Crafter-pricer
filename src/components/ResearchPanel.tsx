import type { Finding, Integrations, SearchProvider } from "../types";
import type { Currency } from "../types";
import { Field, HelpTip, Icon, Reveal, Section, Spinner, TextArea } from "./ui";

const PROVIDER_LABEL: Record<SearchProvider, string> = {
  tavily: "Tavily",
  firecrawl: "Firecrawl",
  searxng: "SearXNG",
  crawl4ai: "Crawl4AI",
};

export default function ResearchPanel({
  currency,
  integrations,
  query,
  onQuery,
  findings,
  researching,
  error,
  onResearch,
  onUseFinding,
  onUseAll,
  onSyncSheets,
  syncing,
  onGoSettings,
}: {
  currency: Currency;
  integrations: Integrations;
  query: string;
  onQuery: (s: string) => void;
  findings: Finding[];
  researching: boolean;
  error: string | null;
  onResearch: () => void;
  onUseFinding: (f: Finding) => void;
  onUseAll: () => void;
  onSyncSheets: () => void;
  syncing: boolean;
  onGoSettings: () => void;
}) {
  const configured =
    integrations.provider === "tavily"
      ? !!integrations.tavilyKey
      : integrations.provider === "firecrawl"
        ? !!integrations.firecrawlKey
        : integrations.provider === "searxng"
          ? !!integrations.searxngUrl
          : !!integrations.crawl4aiUrl;

  return (
    <Reveal delay={50}>
      <Section
        num="02"
        icon="search"
        title="Competitor research"
        sub="Describe the item — live web search finds what others charge, with a link to each competitor listing."
      >
        <Field label="What are we making?" help="rqQuery" hint="used as the search query">
          <TextArea
            value={query}
            onChange={onQuery}
            placeholder="e.g. engraved walnut coaster set of 6, or UV-printed phone case with custom artwork…"
            rows={2}
          />
        </Field>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={onResearch}
            disabled={researching || !query.trim()}
            className="flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-all enabled:hover:border-ember enabled:hover:bg-ember enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            {researching ? <Spinner className="h-4 w-4" /> : <Icon name="search" className="h-4 w-4" sw={2.1} />}
            {researching ? "Searching…" : "Research market prices"}
          </button>
          <button
            onClick={onGoSettings}
            title="Change provider & keys in Settings"
            className={`flex items-center gap-1.5 border px-2.5 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              configured
                ? "border-teal/60 bg-teal/10 text-teal hover:bg-teal/15"
                : "border-amber/60 bg-amber/10 text-amber hover:bg-amber/15"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${configured ? "bg-teal" : "bg-amber"}`} />
            {PROVIDER_LABEL[integrations.provider]}
            {configured ? " ready" : " — add key"}
          </button>
          <HelpTip k="rqProvider" />
        </div>
        {!configured && (
          <p className="mt-2 text-[11px] leading-relaxed text-mute">
            Live search needs a provider key. Open <button onClick={onGoSettings} className="text-ember underline underline-offset-2">Settings → Integrations</button> and
            drop in your Tavily, Firecrawl, SearXNG or Crawl4AI credentials.
          </p>
        )}
        {error && (
          <p className="mt-3 flex items-start gap-2 border border-danger/50 bg-danger/10 px-3 py-2 text-xs text-danger">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" sw={2.1} />
            {error}
          </p>
        )}

        {findings.length > 0 && (
          <div className="mt-4 border-t-2 border-dashed border-line pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
                {findings.length} listing{findings.length > 1 ? "s" : ""} found ·{" "}
                {new Date(findings[0].date).toLocaleDateString()}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={onUseAll}
                  className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-mute transition-all hover:border-teal hover:text-teal"
                >
                  All → market intel
                </button>
                <button
                  onClick={onSyncSheets}
                  disabled={syncing}
                  className="flex items-center gap-1.5 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-mute transition-all hover:border-ember hover:text-ember disabled:opacity-50"
                >
                  {syncing ? <Spinner className="h-3 w-3" /> : <Icon name="sheet" className="h-3.5 w-3.5" />}
                  {integrations.sheetsWebhook ? "Sync to Sheets" : "Export CSV"}
                </button>
              </div>
            </div>
            <ul className="space-y-1.5">
              {findings.map((f) => (
                <li
                  key={f.id}
                  className="group flex flex-wrap items-center gap-x-3 gap-y-1.5 border border-line bg-card px-3 py-2.5 transition-all hover:-translate-y-px hover:border-ink/30 hover:shadow-[var(--shadow-press-sm)]"
                >
                  <div className="min-w-0 flex-1 basis-52">
                    <p className="truncate text-[13px] font-medium text-ink" title={f.item}>
                      {f.item}
                    </p>
                    <p className="font-mono text-[10px] text-mute">
                      {f.vendor} · via {PROVIDER_LABEL[f.provider]}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-ink">
                    {f.price !== null ? (
                      <>
                        {f.sym}
                        {f.price.toFixed(2)}
                      </>
                    ) : (
                      <span className="text-xs font-normal text-mute">no price found</span>
                    )}
                  </span>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open the competitor listing"
                    className="flex items-center gap-1 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-teal transition-all hover:border-teal hover:bg-teal/10"
                  >
                    Source <Icon name="arrow" className="h-3 w-3" />
                  </a>
                  {f.price !== null && (
                    <button
                      onClick={() => onUseFinding(f)}
                      className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-mute transition-all hover:border-ember hover:text-ember"
                    >
                      Use as benchmark
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[10px] text-mute">
              Prices are parsed from public listings in {currency}. Always click through to verify before quoting.
            </p>
          </div>
        )}
        {integrations.sheetsLastSync && (
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-mute">
            <Icon name="check" className="h-3.5 w-3.5 text-teal" />
            Last Sheets sync: {new Date(integrations.sheetsLastSync).toLocaleString()}
          </p>
        )}
      </Section>
    </Reveal>
  );
}
