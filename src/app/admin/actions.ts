"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { deleteObject } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import type { PropertyType, ListingType, PropertyStatus } from "@/lib/supabase/types";

async function assertAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("unauth");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") throw new Error("forbidden");
  return { supabase, userId: user.id };
}

interface PropertyPayload {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  price: number;
  listing_type: ListingType;
  property_type: PropertyType;
  status: PropertyStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  size_sqm: number | null;
  area: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  caution_deposit: number | null;
  agency_fee_percent: number | null;
  legal_fee_percent: number | null;
  service_charge: number | null;
  featured: boolean;
  media: { url: string; public_id: string | null; type: "image" | "video"; display_order: number }[];
}

export async function saveProperty(payload: PropertyPayload) {
  const { supabase, userId } = await assertAdmin();

  const slug = payload.slug || slugify(`${payload.title}-${payload.area}`);

  const row = {
    title: payload.title,
    slug,
    description: payload.description,
    price: payload.price,
    listing_type: payload.listing_type,
    property_type: payload.property_type,
    status: payload.status,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    toilets: payload.toilets,
    size_sqm: payload.size_sqm,
    area: payload.area,
    address: payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude,
    amenities: payload.amenities,
    caution_deposit: payload.caution_deposit,
    agency_fee_percent: payload.agency_fee_percent,
    legal_fee_percent: payload.legal_fee_percent,
    service_charge: payload.service_charge,
    featured: payload.featured,
    created_by: userId,
  };

  let propertyId = payload.id;
  if (propertyId) {
    const { error } = await supabase.from("properties").update(row).eq("id", propertyId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("properties").insert(row).select("id").single();
    if (error) throw error;
    propertyId = data.id;
  }

  // Replace media (delete rows + reinsert). Also clean up R2 for removed keys.
  if (propertyId) {
    const { data: existing } = await supabase
      .from("media")
      .select("public_id")
      .eq("property_id", propertyId);
    const keptKeys = new Set(payload.media.map((m) => m.public_id).filter(Boolean));
    const removed = (existing ?? []).filter((m) => m.public_id && !keptKeys.has(m.public_id));

    await supabase.from("media").delete().eq("property_id", propertyId);
    if (payload.media.length > 0) {
      const rows = payload.media.map((m, i) => ({
        property_id: propertyId!,
        url: m.url,
        public_id: m.public_id,
        type: m.type,
        display_order: i,
      }));
      const { error } = await supabase.from("media").insert(rows);
      if (error) throw error;
    }

    for (const m of removed) {
      if (m.public_id) { try { await deleteObject(m.public_id); } catch {} }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/properties/${slug}`);
  redirect("/admin");
}

export async function deleteProperty(id: string) {
  const { supabase } = await assertAdmin();
  const { data: media } = await supabase.from("media").select("public_id").eq("property_id", id);
  await supabase.from("properties").delete().eq("id", id);
  // Best-effort R2 cleanup — public_id holds the object key
  for (const m of media ?? []) {
    if (m.public_id) { try { await deleteObject(m.public_id); } catch {} }
  }
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/properties");
  redirect("/admin");
}

export async function markInquiryHandled(id: string, handled: boolean) {
  const { supabase } = await assertAdmin();
  await supabase.from("inquiries").update({ handled }).eq("id", id);
  revalidatePath("/admin/inquiries");
}
