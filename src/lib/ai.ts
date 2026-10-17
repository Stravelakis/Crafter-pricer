import type { Integrations, Machine, SheetRow } from "../types";

export interface RawResult {
  title: string;
  url: string;
  snippet: string;
}

const j = async (r: Response, label: string) => {
  if (!r.ok) throw new Error(`${label} returned ${r.status}`);
  return r.json();
};

/* ---------------- web search providers ---------------- */

export async function searchWeb(
  ai: Integrations,
  query: string,
  max = 8,
): Promise<RawResult[]> {
  const q = `${query} price buy`;
  switch (ai.provider) {
    case "tavily": {
      if (!ai.tavilyKey) throw new Error("Add your Tavily API key in Settings → Integrations.");
      const d = await j(
        await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: ai.tavilyKey,
            query: q,
            search_depth: "advanced",
            max_results: max,
          }),
        }),
        "Tavily",
      );
      return (d.results || []).map((r: { title?: string; url?: string; content?: string }) => ({
        title: r.title || r.url || "Result",
        url: r.url || "",
        snippet: (r.content || "").slice(0, 400),
      }));
    }
    case "firecrawl": {
      if (!ai.firecrawlKey) throw new Error("Add your Firecrawl API key in Settings → Integrations.");
      const d = await j(
        await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ai.firecrawlKey}`,
          },
          body: JSON.stringify({ query: q, limit: max }),
        }),
        "Firecrawl",
      );
      return (d.data || []).map(
        (r: { title?: string; url?: string; description?: string; markdown?: string }) => ({
          title: r.title || r.url || "Result",
          url: r.url || "",
          snippet: (r.description || r.markdown || "").slice(0, 400),
        }),
      );
    }
    case "searxng": {
      const base = ai.searxngUrl.replace(/\/+$/, "");
      if (!base) throw new Error("Add your SearXNG instance URL in Settings → Integrations.");
      const d = await j(
        await fetch(
          `${base}/search?q=${encodeURIComponent(q)}&format=json&categories=shopping,general`,
        ),
        "SearXNG",
      );
      return (d.results || []).slice(0, max).map(
        (r: { title?: string; url?: string; content?: string }) => ({
          title: r.title || r.url || "Result",
          url: r.url || "",
          snippet: (r.content || "").slice(0, 400),
        }),
      );
    }
    case "crawl4ai": {
      const base = ai.crawl4aiUrl.replace(/\/+$/, "");
      if (!base) throw new Error("Add your Crawl4AI server URL in Settings → Integrations.");
      const d = await j(
        await fetch(`${base}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, num_results: max }),
        }),
        "Crawl4AI",
      );
      const arr = d.results || d.data || [];
      return arr.map(
        (r: { title?: string; url?: string; description?: string; content?: string }) => ({
          title: r.title || r.url || "Result",
          url: r.url || "",
          snippet: (r.description || r.content || "").slice(0, 400),
        }),
      );
    }
  }
}

/* ---------------- price extraction ---------------- */

const PRICE_MIN = 0.5;
const PRICE_MAX = 250000;
const NUMBER = String.raw`(?:\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?!\d)`;
const PRICE_PATTERN = new RegExp(
  String.raw`(?:[$€£]\s?(${NUMBER}))|(?:\b(${NUMBER})\s?(?:[$€£]|USD|EUR|GBP|dollars?|euros?|pounds?|bucks)(?![a-z]))`,
  "gi",
);
/** words around a number that mean it is not the item's price */
const NOT_A_PRICE_BEFORE = /(save|saving|shipping|delivery|coupon|voucher|cashback)\W*$/i;
const NOT_A_PRICE_AFTER = /^\s*(off|discount|shipping|delivery)/i;

/**
 * Reads one number written in US style (1,234.56) or European style (1.234,56).
 * The last separator is the decimal point only when 1–2 digits follow it.
 */
export function parsePriceNumber(raw: string): number | null {
  const s = raw.replace(/\s/g, "");
  const lastSep = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  let normalized: string;
  if (lastSep === -1) {
    normalized = s;
  } else {
    const decimals = s.length - lastSep - 1;
    const intPart = s.slice(0, lastSep).replace(/[.,]/g, "");
    normalized = decimals === 3 ? intPart + s.slice(lastSep + 1) : `${intPart}.${s.slice(lastSep + 1)}`;
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** every plausible price in a piece of text, in reading order */
export function extractPrices(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(PRICE_PATTERN)) {
    const before = text.slice(Math.max(0, m.index - 16), m.index);
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 12);
    if (NOT_A_PRICE_BEFORE.test(before) || NOT_A_PRICE_AFTER.test(after)) continue;
    const n = parsePriceNumber(m[1] ?? m[2] ?? "");
    if (n !== null && n >= PRICE_MIN && n <= PRICE_MAX) out.push(n);
  }
  return out;
}

/**
 * The listing's price: a price in the title beats one in the snippet,
 * because snippets often mix in shipping, other variants or related items.
 */
export function extractPrice(title: string, snippet = ""): number | null {
  return extractPrices(title)[0] ?? extractPrices(snippet)[0] ?? null;
}

export function vendorFrom(title: string): string {
  const cut = title.split(/[-|–—:]/)[0].trim();
  return cut.length > 3 && cut.length < 48 ? cut : title.slice(0, 40);
}

/* ---------------- OpenAI-compatible chat (model agnostic) ---------------- */

export async function chatJson<T>(
  ai: Integrations,
  system: string,
  user: string,
): Promise<T> {
  if (!ai.aiKey) throw new Error("Add your OpenAI-compatible API key in Settings → Integrations.");
  const base = ai.aiBase.replace(/\/+$/, "");
  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ai.aiKey}`,
    },
    body: JSON.stringify({
      model: ai.aiModel || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    }),
  });
  const d = await j(r, "AI endpoint");
  const raw: string = d?.choices?.[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("The model returned something unparsable — try again.");
  }
}

/* ---------------- machine enrichment ---------------- */

export interface MachineEnrichment {
  summary: string;
  specs: [string, string][];
  product_url: string | null;
  manual_url: string | null;
}

export async function enrichMachine(
  ai: Integrations,
  m: Machine,
): Promise<MachineEnrichment> {
  const out = await chatJson<MachineEnrichment>(
    ai,
    `You are a fabrication-machine database. Reply with STRICT JSON only, no markdown:
{"summary": string, "specs": [["Build volume","..."],["Rated power","..."],["Footprint","..."],["Weight","..."],["MSRP","..."],["Best for","..."]], "product_url": "official product page or null", "manual_url": "official manual or docs page URL or null"}
Use "Unknown" if unsure. Prefer official manufacturer URLs.`,
    `Machine: ${m.name} (type: ${m.type}, purchase cost $${m.purchaseCost}).`,
  );
  return {
    summary: out.summary || "",
    specs: Array.isArray(out.specs) ? out.specs.filter((s) => Array.isArray(s)) : [],
    product_url: out.product_url || null,
    manual_url:
      out.manual_url ||
      `https://www.google.com/search?q=${encodeURIComponent(m.name + " manual pdf")}`,
  };
}

/* ---------------- Cloudflare Workers AI image ---------------- */

export async function generateImage(ai: Integrations, m: Machine): Promise<string> {
  if (!ai.cfAccountId || !ai.cfToken)
    throw new Error("Add your Cloudflare account ID + AI token in Settings → Integrations.");
  const model = ai.cfModel || "@cf/black-forest-labs/flux.1-schnell";
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ai.cfAccountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${ai.cfToken}` },
      body: JSON.stringify({
        prompt: `product photo of a ${m.name}, ${m.type === "uv" ? "UV flatbed printer" : m.type === "fdm" ? "FDM 3D printer" : m.type === "sla" ? "resin 3D printer" : m.type.includes("laser") ? "laser engraving machine" : "fabrication machine"}, centered on a clean light grey studio background, soft shadow, photorealistic, no text`,
        num_steps: 4,
      }),
    },
  );
  const d = await j(r, "Cloudflare AI");
  const b64: string = d?.result?.image;
  if (!b64) throw new Error("Cloudflare returned no image data.");
  return await shrink(`data:image/png;base64,${b64}`, 440);
}

function shrink(src: string, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => reject(new Error("Could not decode the generated image."));
    img.src = src;
  });
}

/* ---------------- offer letters ---------------- */

export function renderOffer(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, k: string) => values[k] ?? "");
}

export function downloadFile(name: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------------- Google Sheets bridge ---------------- */

/** Apps Script bridge with this app's secret baked in; requests without it are refused. */
export function sheetsScript(secret: string): string {
  return `/** MarginCraft → Google Sheets bridge.
 *  1) script.google.com → New project → paste → Deploy → Web app.
 *  2) Execute as: Me · Access: Anyone. Copy the Web App URL into MarginCraft.
 *  The URL is public, so every request must carry the secret below.
 *  If you reset the secret in MarginCraft, paste the new script and redeploy. */
var SECRET = '${secret}';

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return reply({ ok: false, error: 'bad request' }); }
  if (!SECRET || d.secret !== SECRET) return reply({ ok: false, error: 'unauthorized' });
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  var props = PropertiesService.getScriptProperties();
  var id = d.fileId || props.getProperty('mc_ss_id');
  var ss;
  try { ss = id ? SpreadsheetApp.openById(id) : null; } catch (err) { ss = null; }
  if (!ss) { ss = SpreadsheetApp.create('MarginCraft pricing log'); props.setProperty('mc_ss_id', ss.getId()); }
  (d.rows || []).forEach(function (r) {
    var name = String(r.machine || 'General').slice(0, 90);
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0)
      sh.appendRow(['Date', 'Item', 'My unit price', 'My order total', 'My cost', 'Market low', 'Market high', 'Sources']);
    sh.appendRow([r.date, r.item, r.myUnit, r.myTotal, r.myCost, r.mLow, r.mHigh, r.sources]);
  });
  lock.releaseLock();
  return reply({ ok: true, url: ss.getUrl() });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;
}

export function rowsToCsv(rows: SheetRow[]): string {
  const head = "Date,Machine,Item,My unit price,My order total,My cost,Market low,Market high,Sources";
  const body = rows.map((r) =>
    [r.date, r.machine, r.item, r.myUnit, r.myTotal, r.myCost, r.mLow ?? "", r.mHigh ?? "", r.sources]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [head, ...body].join("\n");
}

export async function pushToSheets(
  webhook: string,
  secret: string,
  fileId: string | undefined,
  rows: SheetRow[],
): Promise<void> {
  const r = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret, fileId: fileId || undefined, rows }),
  });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d?.ok) throw new Error(d?.error === "unauthorized" ? "unauthorized" : "failed");
}
