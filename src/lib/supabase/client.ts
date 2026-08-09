"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Untyped client. We attach concrete types (Property, Media, etc.) at the call
 * site via `as` casts — cleaner than fighting @supabase/supabase-js's Database
 * generic, which resolves inserts/updates to `never` when the shape doesn't
 * exactly match the generated types.
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
