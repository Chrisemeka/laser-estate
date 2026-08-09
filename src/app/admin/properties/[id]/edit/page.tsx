import { createSupabaseServer } from "@/lib/supabase/server";
import { PropertyForm } from "../../PropertyForm";
import type { Property, Media } from "@/lib/supabase/types";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("properties")
    .select("*, media(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <h2 className="font-serif text-3xl mb-4">Could not load listing</h2>
        <p className="text-ink-muted mb-6">Debug info:</p>
        <pre className="text-xs bg-ivory-warm p-4 border border-ivory-line overflow-auto">
{JSON.stringify({
  requested_id: id,
  data,
  error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null,
}, null, 2)}
        </pre>
      </div>
    );
  }

  const property = data as Property & { media: Media[] };

  return (
    <>
      <div className="mb-8">
        <h2 className="font-serif text-3xl">Edit listing</h2>
        <p className="text-ink-muted text-sm mt-1">{property.title}</p>
      </div>
      <PropertyForm property={property} />
    </>
  );
}
