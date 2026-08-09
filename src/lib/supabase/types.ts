// Hand-written types for MVP. Regenerate with `npm run db:types` once your Supabase project is up.

export type PropertyType =
  | "detached_house" | "semi_detached" | "terrace" | "duplex"
  | "bungalow" | "apartment" | "penthouse" | "serviced_apartment"
  | "land" | "commercial" | "warehouse" | "filling_station"
  | "hotel" | "event_center" | "mixed_use";

export type ListingType = "sale" | "rent" | "lease";
export type PropertyStatus = "draft" | "available" | "under_offer" | "sold" | "rented";
export type UserRole = "admin" | "client";
export type MediaType = "image" | "video";

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
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
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  property_id: string;
  url: string;
  public_id: string | null;
  type: MediaType;
  display_order: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface PropertyWithMedia extends Property {
  media: Media[];
}

/**
 * Hand-written Database shape for the Supabase clients.
 * `@supabase/supabase-js` v2's type inference requires every schema key
 * (Views, Functions, Enums, CompositeTypes) to be present — otherwise
 * `.from().select()` narrows to `never` on strict builds. Regenerate with
 * `npm run db:types` when the schema changes for full accuracy.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at" | "view_count"> & { id?: string };
        Update: Partial<Property>;
        Relationships: [];
      };
      media: {
        Row: Media;
        Insert: Omit<Media, "id" | "created_at"> & { id?: string };
        Update: Partial<Media>;
        Relationships: [];
      };
      inquiries: {
        Row: Inquiry;
        Insert: Omit<Inquiry, "id" | "created_at" | "handled"> & { id?: string; handled?: boolean };
        Update: Partial<Inquiry>;
        Relationships: [];
      };
      property_views: {
        Row: { id: string; property_id: string; session_id: string; user_id: string | null; viewed_at: string };
        Insert: { property_id: string; session_id: string; user_id?: string | null };
        Update: Partial<{ id: string; property_id: string; session_id: string; user_id: string | null; viewed_at: string }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      property_type: PropertyType;
      listing_type: ListingType;
      property_status: PropertyStatus;
      user_role: UserRole;
      media_type: MediaType;
    };
    CompositeTypes: Record<string, never>;
  };
}
