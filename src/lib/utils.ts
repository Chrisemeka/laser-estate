export function formatNaira(amount: number | bigint | string): string {
  const n = typeof amount === "string" ? Number(amount) : Number(amount);
  if (!isFinite(n)) return "₦—";
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 2)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

export function formatNairaFull(amount: number | bigint | string): string {
  const n = typeof amount === "string" ? Number(amount) : Number(amount);
  if (!isFinite(n)) return "₦—";
  return `₦${n.toLocaleString("en-NG")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function labelForListingType(t: string): string {
  return {
    sale: "For Sale",
    rent: "For Let",
    lease: "For Lease",
  }[t] ?? t;
}

export function labelForPropertyType(t: string): string {
  return {
    detached_house: "Detached House",
    semi_detached: "Semi-Detached",
    terrace: "Terrace",
    duplex: "Duplex",
    bungalow: "Bungalow",
    apartment: "Apartment",
    penthouse: "Penthouse",
    serviced_apartment: "Serviced Apartment",
    land: "Bare Land",
    commercial: "Commercial",
    warehouse: "Warehouse",
    filling_station: "Filling Station",
    hotel: "Hotel",
    event_center: "Event Center",
    mixed_use: "Mixed Use",
  }[t] ?? t;
}

export function statusColor(status: string): string {
  return {
    draft: "bg-ink-faint/20 text-ink-muted",
    available: "bg-green-100 text-green-800",
    under_offer: "bg-amber-100 text-amber-800",
    sold: "bg-accent-soft text-accent-dark",
    rented: "bg-accent-soft text-accent-dark",
  }[status] ?? "bg-ink-faint/20 text-ink-muted";
}
