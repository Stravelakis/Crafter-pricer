import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ---------------- icons (inline SVG) ---------------- */

export type IconName =
  | "printer" | "layers" | "uv" | "laser" | "zap" | "dollar" | "clock" | "user"
  | "home" | "percent" | "chart" | "search" | "plus" | "trash" | "sparkle"
  | "image" | "globe" | "sheet" | "download" | "copy" | "check" | "x" | "link"
  | "megaphone" | "cog" | "target" | "alert" | "arrow" | "wand" | "receipt";

const ICONS: Record<IconName, ReactNode> = {
  printer: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="1" />
      <path d="M7 14h10v7H7z" />
      <circle cx="17.4" cy="11.6" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 17.5l9 5 9-5" opacity="0.5" />
    </>
  ),
  uv: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="1" />
      <path d="M7 7V4h10v3" />
      <path d="M3 12h18" opacity="0.55" />
      <circle cx="12" cy="15" r="1.6" />
    </>
  ),
  laser: (
    <>
      <path d="M4 5h16" />
      <path d="M12 5v4" />
      <path d="M12 9l-6.5 10M12 9l6.5 10M12 9v10" opacity="0.8" />
      <circle cx="12" cy="9" r="1.4" />
    </>
  ),
  zap: <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />,
  dollar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.2c-.6-1-1.7-1.4-3-1.4-1.8 0-3 .9-3 2.3 0 3.2 6 1.6 6 4.8 0 1.4-1.3 2.3-3 2.3-1.4 0-2.6-.6-3.2-1.6M12 6v2m0 10v-1.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11L12 3.5 20.5 11" />
      <path d="M5.5 10v10h13V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5L5 19" />
      <circle cx="7" cy="7" r="2.6" />
      <circle cx="17" cy="17" r="2.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5M12 16V7M16 16v-3M20 16V9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" opacity="0.7" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M3.5 17l5-5 4 4 3-3 5 4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 2.7 4 5.7 4 9s-1.2 6.3-4 9c-2.8-2.7-4-5.7-4-9s1.2-6.3 4-9z" />
    </>
  ),
  sheet: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M4 9h16M4 15h16M10 3v18" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" />
      <path d="M4 20h16" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="1" />
      <path d="M5 16H4V4h12v1" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5L19.5 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  link: (
    <>
      <path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1.4 1.4" />
      <path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1.4-1.4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v3l4 .8L19 19V6L7 10.2 3 11z" />
      <path d="M7 15l1 4h3l-1-4" />
      <path d="M19 10h2v5h-2" opacity="0.6" />
    </>
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5L2.5 20h19L12 3.5z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.2" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6l6 6-6 6" />,
  wand: (
    <>
      <path d="M4 20L14.5 9.5" />
      <path d="M15 3l.9 2.4L18.3 6l-2.4.9L15 9.3l-.9-2.4L11.7 6l2.4-.6L15 3z" />
      <path d="M20 11l.6 1.6 1.6.6-1.6.6L20 15.4l-.6-1.6-1.6-.6 1.6-.6L20 11z" opacity="0.7" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-5 w-5",
  sw = 1.7,
}: {
  name: IconName;
  className?: string;
  sw?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

/* ---------------- reactbits-style animation primitives ---------------- */

export function Noise({ opacity = 0.07, className = "" }: { opacity?: number; className?: string }) {
  const id = useId().replace(/[:]/g, "");
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }}>
      <filter id={`n${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#n${id})`} />
    </svg>
  );
}

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const progress = frame / 1.9;
      if (progress >= text.length) {
        setDisplay(text);
        window.clearInterval(id);
        return;
      }
      setDisplay(
        text
          .split("")
          .map((c, i) =>
            i < progress ? c : c === " " ? " " : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
          )
          .join(""),
      );
    }, 30);
    return () => window.clearInterval(id);
  }, [text]);
  return <span className={className}>{display}</span>;
}

export function ShinyText({ text, className = "" }: { text: string; className?: string }) {
  return <span className={`shiny-text ${className}`}>{text}</span>;
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-ink/60" />
      <div
        className={`modal-in panel relative max-h-[88vh] w-full overflow-y-auto ${wide ? "max-w-3xl" : "max-w-xl"}`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-panel px-5 py-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center border border-line text-mute transition-all hover:border-danger hover:text-danger"
          >
            <Icon name="x" className="h-4 w-4" sw={2.2} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- layout primitives ---------------- */

export function Section({
  num,
  icon,
  title,
  sub,
  children,
  accent = false,
}: {
  num: string;
  icon: IconName;
  title: string;
  sub?: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section className="panel overflow-hidden">
      <header
        className={`flex items-center gap-3 border-b border-line px-5 py-3.5 ${accent ? "bg-ember text-paper" : "bg-card"}`}
      >
        <span className={`font-mono text-[11px] font-semibold ${accent ? "text-paper/70" : "text-ember"}`}>{num}</span>
        <Icon name={icon} className={`h-5 w-5 ${accent ? "text-paper" : "text-ink-2"}`} />
        <div className="min-w-0">
          <h3 className={`font-display text-base font-bold uppercase tracking-[0.08em] leading-tight ${accent ? "text-paper" : "text-ink"}`}>
            {title}
          </h3>
          {sub && <p className={`truncate text-[11px] leading-tight ${accent ? "text-paper/70" : "text-mute"}`}>{sub}</p>}
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${on ? "reveal-on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">{label}</span>
        {hint && <span className="truncate font-mono text-[9px] text-line">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-line bg-card px-3 py-2 font-mono text-sm text-ink transition-all outline-none placeholder:text-line focus:border-ember focus:ring-2 focus:ring-ember/20";

export function NumInput({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
}: {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  const [txt, setTxt] = useState<string>(String(value));
  useEffect(() => {
    setTxt((prev) => {
      const p = parseFloat(prev.replace(",", "."));
      return Number.isFinite(p) && Math.abs(p - value) < 1e-9 ? prev : String(value);
    });
  }, [value]);
  const commit = (s: string) => {
    setTxt(s);
    const n = parseFloat(s.replace(",", "."));
    if (Number.isFinite(n)) onChange(min !== undefined ? Math.max(min, n) : n);
    else if (s === "" && min === undefined) onChange(0);
  };
  return (
    <div className="flex items-stretch overflow-hidden border border-line bg-card transition-all focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/20">
      {prefix && <span className="grid select-none place-items-center border-r border-line bg-paper px-2 font-mono text-xs text-mute">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={txt}
        onChange={(e) => commit(e.target.value)}
        className="w-full min-w-0 bg-transparent px-2.5 py-2 font-mono text-sm text-ink outline-none"
      />
      {suffix && <span className="grid select-none place-items-center border-l border-line bg-paper px-2 font-mono text-xs text-mute">{suffix}</span>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} resize-y ${mono ? "text-xs leading-relaxed" : ""}`}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (s: string) => void;
  options: { v: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Slider({
  value,
  onChange,
  max = 100,
  step = 1,
  suffix = "%",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const fill = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={Math.min(value, max)}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range w-full"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      <span className="w-14 shrink-0 text-right font-mono text-sm font-semibold text-ink">
        {Math.round(value * 10) / 10}
        {suffix}
      </span>
    </div>
  );
}

export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden border border-line bg-card">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
            value === o.v ? "bg-ink text-paper" : "text-mute hover:bg-paper hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- animated numbers ---------------- */

function useCountUp(target: number, dur = 450): number {
  const [val, setVal] = useState(target);
  const ref = useRef({ from: target, to: target, t0: 0 });
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  useEffect(() => {
    if (reduced) {
      setVal(target);
      ref.current = { from: target, to: target, t0: 0 };
      return;
    }
    ref.current = { from: ref.current.to, to: target, t0: performance.now() };
    let raf = 0;
    const tick = (t: number) => {
      const { from, to, t0 } = ref.current;
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur, reduced]);
  return val;
}

export function AnimatedNumber({
  value,
  format,
  className = "",
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const v = useCountUp(value);
  const prev = useRef(value);
  const flash = prev.current !== value;
  useEffect(() => {
    prev.current = value;
  }, [value]);
  return (
    <span key={value} className={`tabular-nums ${flash ? "tick-flash" : ""} ${className}`}>
      {format(v)}
    </span>
  );
}
