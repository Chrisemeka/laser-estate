import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PropertyGallery } from "@/components/PropertyGallery";
import { InquiryForm } from "@/components/InquiryForm";
import { ViewTracker } from "@/components/ViewTracker";
import { CostBreakdown } from "@/components/CostBreakdown";
import MapView from "@/components/MapViewLazy";
import type { Property, Media } from "@/lib/supabase/types";
import { formatNairaFull, labelForListingType, labelForPropertyType, statusColor } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

export const revalidate = 30;

interface Params { slug: string; }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("properties").select("title,description,area").eq("slug", slug).single();
  if (!data) return {};
  return {
    title: data.title,
    description: `${data.title} in ${data.area}. ${data.description.slice(0, 140)}`,
  };
}

export default async function PropertyDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const { data: p, error } = await supabase
    .from("properties")
    .select("*, media(*)")
    .eq("slug", slug)
    .single();

  if (error || !p) {
    // Also fetch the raw row list to see if the slug matches anything at all
    const { data: peek } = await supabase
      .from("properties")
      .select("slug,status,id")
      .ilike("slug", `%${slug.slice(0, 20)}%`);

    return (
      <div className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="font-serif text-3xl mb-4">Listing not found</h1>
        <p className="text-ink-muted mb-6">Debug info (temporary):</p>
        <pre className="text-xs bg-ivory-warm p-4 border border-ivory-line overflow-auto">
{JSON.stringify({
  requested_slug: slug,
  data: p,
  error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null,
  similar_slugs_seen: peek,
}, null, 2)}
        </pre>
        <Link href="/" className="eyebrow hover:text-accent mt-6 inline-block">← Home</Link>
      </div>
    );
  }

  const property = p as Property & { media: Media[] };
  const sortedMedia = [...(property.media ?? [])].sort((a, b) => a.display_order - b.display_order);

  const whatsappHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    `Hello, I'm interested in the property: ${property.title} (${property.area}) — ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/properties/${property.slug}`,
  )}`;

  return (
    <article className="mx-auto max-w-7xl px-6 py-12">
      <ViewTracker propertyId={property.id} />

      <div className="mb-6 flex items-center justify-between">
        <Link href="/properties" className="eyebrow text-ink-muted hover:text-accent">← All properties</Link>
        <span className={`px-3 py-1 text-[10px] eyebrow ${statusColor(property.status)}`}>
          {property.status.replace("_", " ")}
        </span>
      </div>

      <PropertyGallery media={sortedMedia} />

      <div className="grid md:grid-cols-12 gap-12 mt-16">
        <div className="md:col-span-8">
          <div className="eyebrow mb-3">{property.area}</div>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6">{property.title}</h1>
          <div className="flex flex-wrap gap-3 text-xs mb-8">
            <span className="eyebrow bg-ivory-warm px-3 py-1.5">{labelForListingType(property.listing_type)}</span>
            <span className="eyebrow bg-ivory-warm px-3 py-1.5">{labelForPropertyType(property.property_type)}</span>
            {property.bedrooms != null && <span className="eyebrow bg-ivory-warm px-3 py-1.5">{property.bedrooms} bedrooms</span>}
            {property.bathrooms != null && <span className="eyebrow bg-ivory-warm px-3 py-1.5">{property.bathrooms} bathrooms</span>}
            {property.size_sqm != null && <span className="eyebrow bg-ivory-warm px-3 py-1.5">{property.size_sqm} sqm</span>}
          </div>

          <div className="hairline my-8" />

          <h2 className="font-serif text-2xl mb-4">Description</h2>
          <p className="text-ink-soft leading-relaxed whitespace-pre-line">{property.description}</p>

          {property.amenities.length > 0 && (
            <>
              <div className="hairline my-8" />
              <h2 className="font-serif text-2xl mb-4">Amenities</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                {property.amenities.map((a) => (
                  <li key={a} className="text-ink-soft before:content-['—'] before:mr-2 before:text-accent">{a}</li>
                ))}
              </ul>
            </>
          )}

          {property.latitude && property.longitude ? (
            <>
              <div className="hairline my-8" />
              <h2 className="font-serif text-2xl mb-4">Location</h2>
              {property.address && <p className="text-sm text-ink-muted mb-4">{property.address}</p>}
              <MapView lat={property.latitude} lng={property.longitude} label={property.title} />
            </>
          ) : (
            /* No map → inline form on DESKTOP only, so users don't scroll past
               a tall empty sidebar. On mobile the form still sits at the very
               end of the page (rendered inside the sidebar below). */
            <div className="hidden md:block">
              <div className="hairline my-8" />
              <div className="bg-ivory-warm/40 p-8 border border-ivory-line">
                <div className="eyebrow mb-4">Request more information</div>
                <InquiryForm propertyId={property.id} propertyTitle={property.title} />
              </div>
            </div>
          )}
        </div>

        <aside className="md:col-span-4">
          <div className="sticky top-28 space-y-6">
            <div className="bg-ivory-warm/60 p-8 border border-ivory-line">
              <div className="eyebrow mb-2">Price</div>
              <div className="font-serif text-3xl tabular">{formatNairaFull(property.price)}</div>
              {property.listing_type === "rent" && <div className="text-xs text-ink-muted mt-1">per annum</div>}
              {property.listing_type === "lease" && <div className="text-xs text-ink-muted mt-1">lease terms</div>}

              <div className="hairline my-6" />

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-ink text-ivory py-3 hover:bg-accent transition-colors text-sm eyebrow mb-3"
              >
                Enquire via WhatsApp
              </a>
              <a
                href={`tel:${BRAND.phones[0]}`}
                className="block w-full text-center border border-ink py-3 hover:bg-ink hover:text-ivory transition-colors text-sm eyebrow"
              >
                Call {BRAND.phones[0]}
              </a>
            </div>

            <CostBreakdown property={property} />

            {/*
              Inquiry form placement rules:
              - Desktop + map present   → show here (only place)
              - Desktop + no map        → already rendered inline above; hide here
              - Mobile (any)            → always show here so it sits LAST (below cost breakdown)
            */}
            <div className={property.latitude && property.longitude ? "" : "md:hidden"}>
              <div className="bg-ivory p-8 border border-ivory-line">
                <div className="eyebrow mb-4">Request more information</div>
                <InquiryForm propertyId={property.id} propertyTitle={property.title} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
