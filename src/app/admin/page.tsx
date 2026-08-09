import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatNaira, labelForListingType, statusColor } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer();
  const { data: properties } = await supabase
    .from("properties")
    .select("*, media(url)")
    .order("created_at", { ascending: false });

  const { count: unhandledInquiries } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("handled", false);

  const stats = {
    total: properties?.length ?? 0,
    available: properties?.filter((p) => p.status === "available").length ?? 0,
    draft: properties?.filter((p) => p.status === "draft").length ?? 0,
    sold: properties?.filter((p) => p.status === "sold" || p.status === "rented").length ?? 0,
    views: properties?.reduce((s, p) => s + (p.view_count ?? 0), 0) ?? 0,
  };

  return (
    <>
      <div className="grid md:grid-cols-5 gap-4 mb-10">
        <Stat label="Total" value={stats.total} />
        <Stat label="Live" value={stats.available} />
        <Stat label="Draft" value={stats.draft} />
        <Stat label="Sold / Rented" value={stats.sold} />
        <Stat label="Total views" value={stats.views} />
      </div>

      {unhandledInquiries ? (
        <Link
          href="/admin/inquiries"
          className="block mb-8 p-4 bg-accent/10 border-l-4 border-accent hover:bg-accent/20 transition-colors"
        >
          <div className="eyebrow text-accent-dark">
            {unhandledInquiries} unread {unhandledInquiries === 1 ? "inquiry" : "inquiries"} →
          </div>
        </Link>
      ) : null}

      <div className="border border-ivory-line">
        <table className="w-full text-sm">
          <thead className="bg-ivory-warm/50 eyebrow text-ink-muted">
            <tr>
              <th className="text-left px-4 py-3">Property</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Area</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Views</th>
              <th className="text-left px-4 py-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-line">
            {(properties ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-ivory-warm/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/properties/${p.id}/edit`} className="font-medium hover:text-accent inline-flex items-center gap-2">
                    {p.featured && (
                      <span
                        className="text-accent leading-none"
                        title="Featured on homepage"
                        aria-label="Featured"
                      >
                        ★
                      </span>
                    )}
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{labelForListingType(p.listing_type)}</td>
                <td className="px-4 py-3 text-ink-muted">{p.area}</td>
                <td className="px-4 py-3 text-right tabular">{formatNaira(p.price)}</td>
                <td className="px-4 py-3 text-right tabular text-ink-muted">{p.view_count}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-[10px] eyebrow ${statusColor(p.status)}`}>{p.status.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/properties/${p.id}/edit`} className="eyebrow text-xs hover:text-accent">Edit →</Link>
                </td>
              </tr>
            ))}
            {(!properties || properties.length === 0) && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-ink-muted">
                  <p className="font-serif text-xl italic mb-4">No properties yet.</p>
                  <Link href="/admin/properties/new" className="eyebrow hover:text-accent">Create your first listing →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-5 border border-ivory-line bg-ivory">
      <div className="eyebrow text-ink-muted mb-2">{label}</div>
      <div className="font-serif text-3xl tabular">{value}</div>
    </div>
  );
}
