import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRY_CODES, DEFAULT_COUNTRY_ISO } from "./countryCodes";

interface PhoneInputProps {
  country: string;
  phone: string;
  onCountryChange: (iso: string) => void;
  onPhoneChange: (value: string) => void;
}

function Flag({ iso }: { iso: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      alt=""
      loading="lazy"
      className="w-5 h-[14px] rounded-[3px] object-cover shrink-0 ring-1 ring-black/5"
    />
  );
}

export default function PhoneInput({
  country,
  phone,
  onCountryChange,
  onPhoneChange,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const selected =
    COUNTRY_CODES.find((c) => c.iso === country) ??
    COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.slice(1).startsWith(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (iso: string) => {
    onCountryChange(iso);
    setOpen(false);
    setQuery("");
    phoneRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-center h-10 rounded-lg bg-gray-50 border transition-colors focus-within:bg-white ${
          open ? "border-[#1E90FF]/40 bg-white" : "border-gray-100 focus-within:border-[#1E90FF]/40"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-full flex items-center gap-2 pl-3 pr-2.5 rounded-l-lg hover:bg-gray-100/70 transition-colors shrink-0"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${selected.name} ${selected.dial}`}
        >
          <Flag iso={selected.iso} />
          <span className="text-[13px] font-medium text-gray-800 tabular-nums">
            {selected.dial}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        <span className="w-px h-5 bg-gray-200 shrink-0" />
        <input
          ref={phoneRef}
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          placeholder="917 123 4567"
          className="flex-1 min-w-0 h-full px-3 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl bg-white border border-gray-100 shadow-[0_12px_32px_-8px_rgba(11,31,58,0.18)] overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg bg-gray-50 border border-gray-100 focus-within:border-[#1E90FF]/40 focus-within:bg-white transition-colors">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filtered[0]) choose(filtered[0].iso);
                  }
                }}
                placeholder="Search country or code"
                className="flex-1 min-w-0 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-[12px] text-gray-400">
                No country found
              </li>
            ) : (
              filtered.map((c) => {
                const active = c.iso === selected.iso;
                return (
                  <li key={c.iso} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => choose(c.iso)}
                      className={`w-full flex items-center gap-3 px-3 h-9 text-left text-[13px] transition-colors ${
                        active ? "bg-[#E8F3FF] text-[#0B1F3A]" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Flag iso={c.iso} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-[12px] text-gray-400 tabular-nums">{c.dial}</span>
                      <Check
                        className={`w-3.5 h-3.5 text-[#1E90FF] shrink-0 ${active ? "opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
