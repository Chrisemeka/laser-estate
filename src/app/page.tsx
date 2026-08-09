import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PropertyGrid } from "@/components/PropertyGrid";
import { FilterBar } from "@/components/FilterBar";
import { Reveal, Enter } from "@/components/Reveal";
import type { Property, Media } from "@/lib/supabase/types";
import type { PropertyFilters } from "@/app/actions/properties";

const PAGE_SIZE = 6;


const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2400&q=80";

export default async function HomePage({ searchParams }: { searchParams: Promise<PropertyFilters> }) {
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
      {/* Hero — full-bleed background image, text overlaid */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-ink">
        {/* Background image — unoptimized to bypass Next's image optimizer
            (Unsplash serves optimized JPEGs already, and the optimizer was timing out on large hero shots). */}
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        {/* Dark veil for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/40" />

        <div className="relative mx-auto max-w-7xl w-full px-6 pt-32 pb-24">
          <div className="max-w-3xl text-ivory">
            <Enter>
              <div className="eyebrow mb-6 text-ivory/70">Lagos · Est. 2001</div>
            </Enter>
            <Enter delay={0.1}>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight">
                Prime addresses.
                <br />
                <span className="italic text-accent">Considered</span> counsel.
              </h1>
            </Enter>
            <Enter delay={0.25}>
              <p className="mt-8 max-w-lg text-ivory/85 text-lg leading-relaxed">
                Sales, rentals, and land in Ikoyi, Victoria Island, Banana Island,
                and Lekki. Represented with discretion and a deep understanding of
                the Lagos market.
              </p>
            </Enter>
          </div>
        </div>
      </section>

      {/* Intro write-up */}
      <section className="bg-ivory-warm">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <div className="eyebrow mb-6 text-ink-muted">Prime Lives Here</div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-serif text-2xl md:text-3xl leading-[1.35] text-ink-soft">
              For over two decades, {" "}
              <span className="italic text-accent">Laser Estate Services</span>{" "}
              has represented some of Lagos&apos; most coveted residential and
              commercial addresses. Known for discretion, deep local knowledge, and
              a personal approach to every mandate — we help clients buy, sell, and
              let with the care that comes from long relationships.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filter bar */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <FilterBar defaults={params} />
        </Reveal>
      </section>

      {/* Listings + Load More — full viewport width */}
      <section id="listings" className="w-full py-16 border-t border-ivory-line scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 mb-12">
          <Reveal>
            <div className="flex items-end justify-between">
              <div>
                <div className="eyebrow mb-3">Portfolio</div>
                <h2 className="font-serif text-4xl">
                  {isFiltered ? "Filtered results" : "Available properties"}
                </h2>
              </div>
              {isFiltered ? (
                <Link href="/" className="text-sm eyebrow hover:text-accent">Clear filters ×</Link>
              ) : (
                <Link href="/properties" className="text-sm eyebrow hover:text-accent">Full portfolio →</Link>
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

      {/* Value prop */}
      <section className="mx-auto max-w-5xl px-6 py-32 text-center">
        <Reveal>
          <div className="eyebrow mb-4">Our approach</div>
          <p className="font-serif text-3xl md:text-4xl leading-tight">
            Two decades of trusted relationships across Lagos&apos; most
            coveted addresses. Every mandate handled personally.
            Every enquiry answered with care.
          </p>
          <div className="hairline mt-16 mx-auto max-w-md" />
        </Reveal>
      </section>
    </>
  );
}
