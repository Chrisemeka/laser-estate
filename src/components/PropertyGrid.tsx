"use client";
import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { PropertyCard } from "./PropertyCard";
import { loadMoreProperties, type PropertyFilters } from "@/app/actions/properties";
import type { Property, Media } from "@/lib/supabase/types";

interface Props {
  initial: (Property & { media: Media[] })[];
  initialHasMore: boolean;
  filters?: PropertyFilters;
}

export function PropertyGrid({ initial, initialHasMore, filters }: Props) {
  const pathname = usePathname();
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const { properties, hasMore: more } = await loadMoreProperties({
        offset: items.length,
        filters,
      });
      setItems((prev) => [...prev, ...properties]);
      setHasMore(more);
    });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-ink-muted">
        <p className="font-serif text-2xl italic mb-2">No properties match those criteria.</p>
        <a href={pathname} className="eyebrow hover:text-accent">Clear filters →</a>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.8,
              delay: Math.min(i, 5) * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <PropertyCard property={p} />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-16">
          <button
            onClick={loadMore}
            disabled={pending}
            className="rounded-full bg-ink text-ivory px-10 py-4 hover:bg-accent transition-colors eyebrow text-sm disabled:opacity-50"
          >
            {pending ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
