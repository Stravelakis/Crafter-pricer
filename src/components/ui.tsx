import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

/* ---------------- hooks ---------------- */

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — keep running in-memory */
    }
  }, [key, value]);
  return [value, setValue];
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
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
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
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${on ? "reveal-on" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const roundSmart = (n: number) => Math.round(n * 1000) / 1000;

export function AnimatedNumber({
  value,
  format,
  className = "",
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (!Number.isFinite(to) || Math.abs(to - from) < 1e-9) {
      setDisp(to);
      return;
    }
    const t0 = performance.now();
    const dur = 420;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{format(Number.isFinite(disp) ? disp : 0)}</span>;
}

/* ---------------- icons ---------------- */

const PATHS = {
  spark: ["M12 3v18", "M3 12h18", "M6 6l12 12", "M18 6L6 18"],
  fdm: ["M3 5h18", "M7 5v4h10V5", "M10 9v2l-2 3h8l-2-3V9", "M5 19h14", "M12 14v2"],
  layers: ["M12 3l9 4.5-9 4.5-9-4.5z", "M3 12.5l9 4.5 9-4.5", "M3 17l9 4.5 9-4.5"],
  uv: ["M6 8h12v9H6z", "M9 8V5", "M15 8V5", "M9 17v2", "M15 17v2", "M3 12.5h3", "M18 12.5h3", "M9.5 12.5h5"],
  engrave: ["M4 4h16", "M12 4v5", "M8 9h8", "M12 9l-5 11", "M12 9l5 11", "M4 20h16"],
  laser: ["M3 4h18", "M12 4v7", "M6 20h12", "M12 11l-4 9", "M12 11l4 9", "M12 11v9"],
  cnc: ["M12 3v4", "M8 7h8v4l-2 7h-4l-2-7z", "M12 18v3"],
  gear: [
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7",
    "M12 2.5v3",
    "M12 18.5v3",
    "M2.5 12h3",
    "M18.5 12h3",
    "M5 5l2.1 2.1",
    "M16.9 16.9L19 19",
    "M19 5l-2.1 2.1",
    "M7.1 16.9L5 19",
  ],
  wrench: [
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  ],
  bolt: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
  tag: ["M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6z", "M7.5 7.5h.01"],
  coins: ["M8 9.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11", "M11.8 3.6A5.5 5.5 0 1 1 20 10.9", "M6 15h4"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M12 7v5l3.5 2"],
  user: ["M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8", "M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"],
  home: ["M3 11.5 12 4l9 7.5", "M5.5 10v9.5h13V10", "M10 19.5v-5h4v5"],
  megaphone: ["m3 11 18-5v12L3 14v-3z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"],
  percent: ["M19 5 5 19", "M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5", "M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"],
  chart: ["M3 3v18h18", "M7.5 14v3.5", "M12 9v8.5", "M16.5 12v5.5"],
  plus: ["M12 5v14", "M5 12h14"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6", "M10 11v5", "M14 11v5"],
  link: ["M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7", "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"],
  check: ["M20 6 9 17l-5-5"],
  alert: ["M12 3 2 20h20L12 3z", "M12 10v4", "M12 17.5h.01"],
  target: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8", "M12 12h.01"],
  receipt: ["M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z", "M9 8h6", "M9 12h6"],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "h-4 w-4",
  sw = 1.8,
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
      aria-hidden="true"
    >
      {(PATHS[name] as readonly string[]).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ---------------- primitives ---------------- */

export function Section({
  num,
  title,
  sub,
  icon,
  children,
  right,
  className = "",
}: {
  num: string;
  title: string;
  sub?: string;
  icon: IconName;
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel overflow-hidden ${className}`}>
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-card px-5 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-ink font-mono text-xs font-semibold text-ember">
          {num}
        </span>
        <span className="text-ink-2">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold uppercase tracking-[0.08em] text-ink">
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-xs leading-snug text-mute">{sub}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
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
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          {label}
        </span>
        {hint && (
          <span className="truncate font-mono text-[10px] text-mute/70">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

const fmtInput = (n: number) => String(roundSmart(n));

export function NumInput({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  className = "",
}: {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  className?: string;
}) {
  const [txt, setTxt] = useState(() => fmtInput(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setTxt(fmtInput(value));
  }, [value]);
  return (
    <div
      className={`flex items-center border border-line bg-card transition focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/20 hover:border-ink/30 ${className}`}
    >
      {prefix && (
        <span className="select-none pl-2.5 font-mono text-xs text-mute">{prefix}</span>
      )}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={txt}
        onFocus={() => (focused.current = true)}
        onBlur={() => {
          focused.current = false;
          setTxt(fmtInput(value));
        }}
        onChange={(e) => {
          const t = e.target.value;
          setTxt(t);
          const n = parseFloat(t);
          if (Number.isFinite(n)) onChange(roundSmart(Math.max(min, n)));
        }}
        className="w-full min-w-0 bg-transparent px-2.5 py-2 text-right font-mono text-sm text-ink outline-none"
      />
      {suffix && (
        <span className="select-none pr-2.5 font-mono text-xs text-mute">{suffix}</span>
      )}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition placeholder:text-mute/60 hover:border-ink/30 focus:border-ember focus:ring-2 focus:ring-ember/20 ${className}`}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-line bg-card py-2 pl-3 pr-8 text-sm text-ink outline-none transition hover:border-ink/30 focus:border-ember focus:ring-2 focus:ring-ember/20"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
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
    <div className="grid grid-flow-col gap-0.5 rounded-[4px] border border-line bg-card p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ${
            value === o.v
              ? "bg-ink text-paper shadow-sm"
              : "text-mute hover:bg-ink/5 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "%",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        className="range flex-1"
        style={{ "--fill": `${fill}%` } as CSSProperties}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="w-16 shrink-0 text-right font-mono text-sm font-semibold text-ink">
        {roundSmart(value)}
        {suffix}
      </span>
    </div>
  );
}

export function Chip({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "ember" | "teal";
}) {
  const valueColor =
    tone === "ember" ? "text-ember" : tone === "teal" ? "text-teal" : "text-paper";
  return (
    <div className="flex items-baseline gap-2 border border-paper/15 bg-paper/5 px-3 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55">
        {label}
      </span>
      <span key={value} className={`tick-flash font-mono text-xs font-semibold ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}
