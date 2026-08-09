"use client";
import { useState, useTransition } from "react";
import { saveProperty, deleteProperty } from "../actions";
import { AREAS, COMMON_AMENITIES, LISTING_TYPES, PROPERTY_TYPES, STATUSES } from "@/lib/constants";
import type { Property, Media } from "@/lib/supabase/types";
import { MediaUploader } from "./MediaUploader";

interface Props { property?: Property & { media: Media[] }; }

type MediaItem = { url: string; public_id: string | null; type: "image" | "video"; display_order: number };

export function PropertyForm({ property }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaItem[]>(
    (property?.media ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((m) => ({ url: m.url, public_id: m.public_id, type: m.type, display_order: m.display_order })),
  );
  const [amenities, setAmenities] = useState<string[]>(property?.amenities ?? []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        setError(null);
        await saveProperty({
          id: property?.id,
          title: String(f.get("title")),
          slug: property?.slug,
          description: String(f.get("description")),
          price: Number(f.get("price")),
          listing_type: f.get("listing_type") as any,
          property_type: f.get("property_type") as any,
          status: f.get("status") as any,
          bedrooms: numOrNull(f.get("bedrooms")),
          bathrooms: numOrNull(f.get("bathrooms")),
          toilets: numOrNull(f.get("toilets")),
          size_sqm: numOrNull(f.get("size_sqm")),
          area: String(f.get("area")),
          address: strOrNull(f.get("address")),
          latitude: numOrNull(f.get("latitude")),
          longitude: numOrNull(f.get("longitude")),
          amenities,
          caution_deposit: numOrNull(f.get("caution_deposit")),
          agency_fee_percent: numOrNull(f.get("agency_fee_percent")),
          legal_fee_percent: numOrNull(f.get("legal_fee_percent")),
          service_charge: numOrNull(f.get("service_charge")),
          featured: f.get("featured") === "on",
          media,
        });
      } catch (err: any) {
        setError(err.message ?? "Could not save");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8 max-w-4xl">
      <Section title="Basics">
        <Field label="Title" name="title" defaultValue={property?.title} required />
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Listing type" name="listing_type" as="select" required defaultValue={property?.listing_type ?? "sale"}>
            {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Field>
          <Field label="Property type" name="property_type" as="select" required defaultValue={property?.property_type ?? "apartment"}>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Field>
          <Field label="Status" name="status" as="select" required defaultValue={property?.status ?? "draft"}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Field>
        </div>
        <Field label="Description" name="description" as="textarea" rows={5} defaultValue={property?.description} />
      </Section>

      <Section title="Price & specs">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Price (₦)" name="price" type="number" defaultValue={property?.price} required />
          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" name="featured" defaultChecked={property?.featured} />
            <span className="text-sm">Featured on homepage</span>
          </label>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <Field label="Bedrooms" name="bedrooms" type="number" defaultValue={property?.bedrooms ?? ""} />
          <Field label="Bathrooms" name="bathrooms" type="number" defaultValue={property?.bathrooms ?? ""} />
          <Field label="Toilets" name="toilets" type="number" defaultValue={property?.toilets ?? ""} />
          <Field label="Size (sqm)" name="size_sqm" type="number" defaultValue={property?.size_sqm ?? ""} />
        </div>
      </Section>

      <Section title="Location">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Area" name="area" as="select" required defaultValue={property?.area ?? "Ikoyi"}>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Field>
          <Field label="Street address" name="address" defaultValue={property?.address ?? ""} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Latitude" name="latitude" type="number" step="any" defaultValue={property?.latitude ?? ""} />
          <Field label="Longitude" name="longitude" type="number" step="any" defaultValue={property?.longitude ?? ""} />
        </div>
        <p className="text-xs text-ink-muted">Tip: right-click a spot on Google Maps to copy coordinates.</p>
      </Section>

      <Section title="Fees & charges">
        <p className="text-xs text-ink-muted -mt-2">
          Any field left blank is simply hidden from the cost breakdown clients see.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Caution deposit (₦)" name="caution_deposit" type="number" defaultValue={property?.caution_deposit ?? ""} placeholder="e.g. 5000000" />
          <Field label="Service charge (₦ / year)" name="service_charge" type="number" defaultValue={property?.service_charge ?? ""} placeholder="Leave blank for TBD" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Agency fee (%)" name="agency_fee_percent" type="number" step="0.01" defaultValue={property?.agency_fee_percent ?? ""} placeholder="e.g. 10" />
          <Field label="Legal fee (%)" name="legal_fee_percent" type="number" step="0.01" defaultValue={property?.legal_fee_percent ?? ""} placeholder="e.g. 10" />
        </div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {COMMON_AMENITIES.map((a) => {
            const on = amenities.includes(a);
            return (
              <button
                type="button"
                key={a}
                onClick={() => setAmenities(on ? amenities.filter((x) => x !== a) : [...amenities, a])}
                className={`px-3 py-1.5 text-xs border transition-colors ${on ? "bg-ink text-ivory border-ink" : "border-ink-faint text-ink-muted hover:border-ink"}`}
              >
                {a}
              </button>
            );
          })}
        </div>
        <input
          placeholder="Add custom amenity, press Enter"
          className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2 text-sm mt-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              if (v && !amenities.includes(v)) setAmenities([...amenities, v]);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </Section>

      <Section title="Photos & video">
        <MediaUploader media={media} setMedia={setMedia} />
      </Section>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center justify-between pt-6 border-t border-ivory-line">
        {property && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete this listing? This cannot be undone.")) return;
              await deleteProperty(property.id);
            }}
            className="text-sm text-accent hover:underline"
          >
            Delete listing
          </button>
        )}
        <div className="ml-auto flex gap-3">
          <button
            disabled={pending}
            className="px-8 py-3 bg-ink text-ivory hover:bg-accent transition-colors text-sm eyebrow disabled:opacity-50"
          >
            {pending ? "Saving…" : property ? "Save changes" : "Create listing"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="eyebrow mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, name, as, children, ...rest }: any) {
  const cls = "w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2 text-sm";
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      {as === "textarea" ? (
        <textarea name={name} className={cls + " resize-none"} {...rest} />
      ) : as === "select" ? (
        <select name={name} className={cls} {...rest}>{children}</select>
      ) : (
        <input name={name} className={cls} {...rest} />
      )}
    </label>
  );
}

function numOrNull(v: FormDataEntryValue | null) { if (v == null || v === "") return null; const n = Number(v); return isFinite(n) ? n : null; }
function strOrNull(v: FormDataEntryValue | null) { if (!v || String(v).trim() === "") return null; return String(v); }
