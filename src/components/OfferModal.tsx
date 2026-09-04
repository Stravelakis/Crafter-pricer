import { useEffect, useMemo, useState } from "react";
import type { Currency, Job, Quote, Settings } from "../types";
import { fmtMoney, fmtNum } from "../lib/calc";
import { downloadFile, renderOffer } from "../lib/ai";
import { DEFAULT_OFFER_DEFAULTS } from "../lib/presets";
import { Field, Icon, Modal, NumInput, TextArea, TextInput } from "./ui";

export default function OfferModal({
  open,
  onClose,
  quote,
  job,
  currency,
  template,
  defaults,
  onToast,
}: {
  open: boolean;
  onClose: () => void;
  quote: Quote;
  job: Job;
  currency: Currency;
  template: string;
  defaults: typeof DEFAULT_OFFER_DEFAULTS;
  onToast: (msg: string) => void;
}) {
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState(defaults.validDays);

  useEffect(() => {
    if (open) setValidDays(defaults.validDays);
  }, [open, defaults.validDays]);

  const md = useMemo(() => {
    const validUntil = new Date(Date.now() + validDays * 86400000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return renderOffer(template, {
      business_name: defaults.businessName,
      client: client.trim() || "{{client}}",
      item: job.name.trim() || "Custom order",
      description: job.name,
      qty: String(quote.qty),
      unit_price: fmtMoney(quote.unitPrice, currency),
      total_price: fmtMoney(quote.totalPrice, currency),
      vat: fmtMoney(quote.vat, currency),
      vat_pct: fmtNum(quote.vatPct, 1),
      invoice_total: fmtMoney(quote.invoiceTotal, currency),
      valid_until: validUntil,
      turnaround: defaults.turnaround,
      notes: notes.trim(),
      currency,
    });
  }, [template, defaults, client, notes, validDays, quote, job, currency]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      onToast("Offer letter copied to clipboard");
    } catch {
      onToast("Could not access the clipboard");
    }
  };

  const fileName = `offer-${(job.name.trim() || "custom-order").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.md`;

  return (
    <Modal open={open} onClose={onClose} title="Offer letter (.md)" wide>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Client name" help="oClient">
          <TextInput value={client} onChange={setClient} placeholder="e.g. Acme Coffee Roasters" />
        </Field>
        <Field label="Valid for" help="oValid" hint="days from today">
          <NumInput value={validDays} onChange={(n) => setValidDays(Math.max(1, Math.round(n)))} suffix="days" step={1} min={1} />
        </Field>
        <Field label="Extra notes" help="oNotes" className="sm:col-span-2">
          <TextArea value={notes} onChange={setNotes} rows={2} placeholder="Rush delivery, revisions policy, files needed…" />
        </Field>
      </div>
      <div className="mt-4">
        <p className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          <span>Preview · live from your quote</span>
          <button
            onClick={() => onToast("Edit the template in Settings → Offer letter")}
            className="normal-case tracking-normal text-teal underline underline-offset-2 hover:text-ember"
          >
            edit template
          </button>
        </p>
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap border border-line bg-card p-4 font-mono text-xs leading-relaxed text-ink-2">
          {md}
        </pre>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="flex items-center gap-2 border border-ink bg-ink px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper transition-all hover:border-ember hover:bg-ember active:translate-y-px"
        >
          <Icon name="copy" className="h-4 w-4" />
          Copy markdown
        </button>
        <button
          onClick={() => {
            downloadFile(fileName, md);
            onToast(`${fileName} downloaded`);
          }}
          className="flex items-center gap-2 border border-line bg-card px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink transition-all hover:border-teal hover:text-teal active:translate-y-px"
        >
          <Icon name="download" className="h-4 w-4" />
          Download .md
        </button>
      </div>
    </Modal>
  );
}
