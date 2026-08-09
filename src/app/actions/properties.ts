"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Property, Media } from "@/lib/supabase/types";

const PAGE_SIZE = 6;

export interface PropertyFilters {
  area?: string;
  listing_type?: string;
  property_type?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  q?: string;
}

/** Fetch a page of publicly-visible properties, most-recent first, honouring filters. */
export async function loadMoreProperties({
  offset,
  filters = {},
}: {
  offset: number;
  filters?: PropertyFilters;
}) {
  const supabase = await createSupabaseServer();
  let query = supabase
    .from("properties")
    .select("*, media(*)")
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.area) query = query.eq("area", filters.area);
  if (filters.listing_type) query = query.eq("listing_type", filters.listing_type as any);
  if (filters.property_type) query = query.eq("property_type", filters.property_type as any);
  if (filters.min_price) query = query.gte("price", Number(filters.min_price));
  if (filters.max_price) query = query.lte("price", Number(filters.max_price));
  if (filters.bedrooms) query = query.gte("bedrooms", Number(filters.bedrooms));
  if (filters.q) query = query.ilike("title", `%${filters.q}%`);

  const { data } = await query.range(offset, offset + PAGE_SIZE - 1);

  return {
    properties: (data ?? []) as (Property & { media: Media[] })[],
    hasMore: (data?.length ?? 0) === PAGE_SIZE,
  };
}
