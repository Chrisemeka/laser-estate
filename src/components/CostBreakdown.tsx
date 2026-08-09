import type { Property } from "@/lib/supabase/types";
import { formatNairaFull } from "@/lib/utils";

interface Props { property: Property; }

/**
 * Nigerian real-estate cost breakdown. Uses only known / declared fields —
 * intentionally excludes Governor's Consent, C of O processing, survey fees,
 * etc. so the total isn't misleading.
 */
export function CostBreakdown({ property }: Props) {
  const base = Number(property.price);
  const agencyPct = property.agency_fee_percent ?? 0;
  const legalPct = property.legal_fee_percent ?? 0;
  const caution = Number(property.caution_deposit ?? 0);
  const service = property.service_charge != null ? Number(property.service_charge) : null;

  const agency = base * (agencyPct / 100);
  const legal = base * (legalPct / 100);
  const total = base + agency + legal + caution + (service ?? 0);

  // Only render if there's at least one fee declared
  const hasAnyFee = agencyPct > 0 || legalPct > 0 || caution > 0 || service != null;
  if (!hasAnyFee) return null;

  const isRentLike = property.listing_type === "rent" || property.listing_type === "lease";
  const heading = isRentLike ? "Upfront cost breakdown" : "Total cost of purchase";
  const baseLabel = isRentLike ? "Annual rent" : "Purchase price";

  return (
    <div className="bg-ivory-warm/60 p-8 border border-ivory-line">
      <div className="eyebrow mb-4">{heading}</div>

      <dl className="space-y-3 text-sm">
        <Row label={baseLabel} value={formatNairaFull(base)} />
        {agencyPct > 0 && (
          <Row label={`Agency fee (${agencyPct}%)`} value={formatNairaFull(agency)} />
        )}
        {legalPct > 0 && (
          <Row label={`Legal fee (${legalPct}%)`} value={formatNairaFull(legal)} />
        )}
        {caution > 0 && (
          <Row
            label="Caution deposit"
            value={formatNairaFull(caution)}
            hint="refundable"
          />
        )}
        {service != null && service > 0 && (
          <Row
            label="Service charge"
            value={formatNairaFull(service)}
            hint={isRentLike ? "per annum" : undefined}
          />
        )}
      </dl>

      <div className="hairline my-6" />

      <div className="flex items-baseline justify-between">
        <div>
          <div className="eyebrow text-ink-muted mb-1">
            {isRentLike ? "Estimated year-one outlay" : "Estimated total"}
          </div>
          <div className="text-[10px] text-ink-faint">
            Excludes statutory & registration fees.
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-2xl tabular">{formatNairaFull(total)}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-muted">
        {label}
        {hint && <span className="text-[10px] text-ink-faint ml-2 uppercase tracking-wider">{hint}</span>}
      </dt>
      <dd className="tabular text-ink">{value}</dd>
    </div>
  );
}
