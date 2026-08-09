"use client";
import { useRouter, usePathname } from "next/navigation";
import { AREAS, PROPERTY_TYPES, LISTING_TYPES } from "@/lib/constants";
import type { PropertyFilters } from "@/app/actions/properties";

interface Props { defaults?: PropertyFilters; }

/** Stewart-style pill filter. Submits back to whichever page it's on (home or /properties). */
export function FilterBar({ defaults = {} }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of f.entries()) {
      const s = String(v).trim();
      if (s) params.set(k, s);
    }
    router.push(`${pathname}?${params.toString()}#listings`);
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Pill name="q" placeholder="Search…" defaultValue={defaults.q} />
      <PillSelect name="area" defaultValue={defaults.area}>
        <option value="">Location</option>
        {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
      </PillSelect>
      <PillSelect name="property_type" defaultValue={defaults.property_type}>
        <option value="">Property Type</option>
        {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </PillSelect>

      <PillSelect name="listing_type" defaultValue={defaults.listing_type}>
        <option value="">Sale / Let / Lease</option>
        {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </PillSelect>
      <PillSelect name="bedrooms" defaultValue={defaults.bedrooms}>
        <option value="">Bedrooms</option>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{String(n).padStart(2, "0")}{n === 7 ? "+" : ""}</option>)}
      </PillSelect>
      <PillSelect name="max_price" defaultValue={defaults.max_price}>
        <option value="">Price Range</option>
        <option value="50000000">Up to ₦50M</option>
        <option value="100000000">Up to ₦100M</option>
        <option value="250000000">Up to ₦250M</option>
        <option value="500000000">Up to ₦500M</option>
        <option value="1000000000">Up to ₦1B</option>
        <option value="9999999999">₦1B+</option>
      </PillSelect>

      <button
        type="submit"
        className="md:col-span-3 rounded-full bg-ink text-ivory py-4 px-10 hover:bg-accent transition-colors eyebrow text-sm mt-2"
      >
        Search
      </button>
    </form>
  );
}

function Pill({ name, placeholder, defaultValue }: { name: string; placeholder: string; defaultValue?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
      </span>
      <input
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-full bg-ivory border border-ivory-line pl-14 pr-6 py-4 text-sm placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors"
      />
    </div>
  );
}

function PillSelect({ name, children, defaultValue }: { name: string; children: React.ReactNode; defaultValue?: string }) {
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full appearance-none rounded-full bg-ivory border border-ivory-line pl-6 pr-12 py-4 text-sm text-ink focus:border-accent focus:outline-none transition-colors cursor-pointer"
      >
        {children}
      </select>
      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
