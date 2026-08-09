import Link from "next/link";
import Image from "next/image";
import type { Property, Media } from "@/lib/supabase/types";
import { formatNaira, labelForListingType, labelForPropertyType } from "@/lib/utils";

interface Props {
  property: Property & { media?: Media[] };
}

/**
 * Stewart-style overlay card. Prefers an image for the cover; if the listing
 * only has video, we render a muted <video> element instead (never passed to
 * next/image, which would try to optimize the .mp4 and time out).
 */
export function PropertyCard({ property }: Props) {
  const media = property.media ?? [];
  const firstImage = media.find((m) => m.type === "image");
  const firstVideo = media.find((m) => m.type === "video");
  const cover = firstImage ?? firstVideo ?? null;

  return (
    <Link href={`/properties/${property.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden bg-ivory-warm">
        {cover?.type === "image" ? (
          <Image
            src={cover.url}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : cover?.type === "video" ? (
          <video
            src={cover.url}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-faint font-serif italic">
            no image
          </div>
        )}

        {/* Gradient veil for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />

        {/* Top-left chips */}
        <div className="absolute top-5 left-5 flex gap-2">
          {property.featured && (
            <span className="eyebrow bg-accent text-ivory px-3 py-1 text-[10px]">Featured</span>
          )}
          <span className="eyebrow bg-ivory/90 text-ink px-3 py-1 text-[10px]">
            {labelForListingType(property.listing_type)}
          </span>
        </div>

        {/* Overlaid caption */}
        <div className="absolute inset-x-5 bottom-5 text-ivory">
          <div className="flex items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="eyebrow text-ivory/70 mb-2 text-[10px]">{property.area}</div>
              <h3 className="font-serif text-2xl md:text-3xl leading-tight tracking-tight uppercase group-hover:text-accent transition-colors line-clamp-2">
                {property.title}
              </h3>
              <div className="mt-2 tabular font-medium text-base md:text-lg">
                {formatNaira(property.price)}
                {property.listing_type === "rent" && <span className="text-ivory/70 text-xs ml-2">p.a.</span>}
              </div>
            </div>

            <div className="text-right text-xs md:text-sm text-ivory/85 shrink-0">
              {property.bedrooms != null && <div>{String(property.bedrooms).padStart(2, "0")} Bedrooms</div>}
              {property.bathrooms != null && <div>{String(property.bathrooms).padStart(2, "0")} Bathrooms</div>}
              {property.size_sqm != null && <div className="mt-1 text-ivory/60">{property.size_sqm} sqm</div>}
              {(property.bedrooms == null && property.bathrooms == null && property.size_sqm == null) && (
                <div className="text-ivory/70">{labelForPropertyType(property.property_type)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
