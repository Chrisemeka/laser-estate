import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PropertyGrid } from "@/components/PropertyGrid";
import { FilterBar } from "@/components/FilterBar";
import { Reveal, Enter } from "@/components/Reveal";
import type { Property, Media } from "@/lib/supabase/types";
import type { PropertyFilters } from "@/app/actions/properties";

const PAGE_SIZE = 6;

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<PropertyFilters> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("properties")
    .select("*, media(*)")
    .neq("status", "draft")
    // Featured listings surface first, then most recent
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.area) query = query.eq("area", params.area);
  if (params.listing_type) query = query.eq("listing_type", params.listing_type as any);
  if (params.property_type) query = query.eq("property_type", params.property_type as any);
  if (params.min_price) query = query.gte("price", Number(params.min_price));
  if (params.max_price) query = query.lte("price", Number(params.max_price));
  if (params.bedrooms) query = query.gte("bedrooms", Number(params.bedrooms));
  if (params.q) query = query.ilike("title", `%${params.q}%`);

  const { data: initial } = await query.range(0, PAGE_SIZE - 1);
  const initialProperties = (initial ?? []) as (Property & { media: Media[] })[];
  const isFiltered = Object.values(params).some((v) => v && String(v).trim() !== "");

  return (
    <>
      {/* Page header */}
      <section className="border-b border-ivory-line">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Enter><div className="eyebrow mb-3">Portfolio</div></Enter>
          <Enter delay={0.1}>
            <h1 className="font-serif text-5xl md:text-6xl">Properties</h1>
          </Enter>
          <Enter delay={0.2}>
            <p className="mt-6 max-w-xl text-ink-muted leading-relaxed">
              Full listing details for every property — no signup required.
              Enquire when you&apos;re ready.
            </p>
          </Enter>
        </div>
      </section>

      {/* Filter bar */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Reveal>
          <FilterBar defaults={params} />
        </Reveal>
      </section>

      {/* Listings + Load More — full viewport width */}
      <section id="listings" className="w-full pb-24 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 mb-8">
          <Reveal>
            <div className="flex items-end justify-between">
              <div className="text-sm text-ink-muted">
                {isFiltered ? "Showing filtered results" : `Showing all properties`}
              </div>
              {isFiltered && (
                <Link href="/properties" className="text-sm eyebrow hover:text-accent">Clear filters ×</Link>
              )}
            </div>
          </Reveal>
        </div>
        <div className="w-full px-4 md:px-6">
          <PropertyGrid
            key={JSON.stringify(params)}
            initial={initialProperties}
            initialHasMore={initialProperties.length === PAGE_SIZE}
            filters={params}
          />
        </div>
      </section>
    </>
  );
}
