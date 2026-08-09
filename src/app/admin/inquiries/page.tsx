import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { markInquiryHandled } from "../actions";

export default async function InquiriesPage() {
  const supabase = await createSupabaseServer();
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, properties(slug,title)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="mb-8">
        <h2 className="font-serif text-3xl">Inquiries</h2>
        <p className="text-ink-muted text-sm mt-1">All enquiries submitted through the site.</p>
      </div>

      <div className="space-y-4">
        {(inquiries ?? []).map((q: any) => (
          <div key={q.id} className={`p-6 border ${q.handled ? "border-ivory-line bg-ivory-warm/30" : "border-accent/40 bg-accent/5"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-serif text-xl">{q.name}</div>
                <div className="text-xs text-ink-muted mt-1">
                  <a href={`mailto:${q.email}`} className="hover:text-accent">{q.email}</a>
                  {q.phone && <> · <a href={`tel:${q.phone}`} className="hover:text-accent">{q.phone}</a></>}
                  {q.phone && <> · <a href={`https://wa.me/${q.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">WhatsApp</a></>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-muted">{new Date(q.created_at).toLocaleString("en-NG")}</div>
                {q.properties && (
                  <Link href={`/properties/${q.properties.slug}`} className="eyebrow text-xs hover:text-accent">{q.properties.title} →</Link>
                )}
              </div>
            </div>
            <p className="text-sm text-ink-soft whitespace-pre-line">{q.message}</p>
            <form
              action={async () => {
                "use server";
                await markInquiryHandled(q.id, !q.handled);
              }}
              className="mt-4"
            >
              <button className="text-xs eyebrow hover:text-accent">
                {q.handled ? "Mark as unread" : "Mark as handled"}
              </button>
            </form>
          </div>
        ))}
        {(!inquiries || inquiries.length === 0) && (
          <p className="font-serif text-2xl italic text-center py-16 text-ink-muted">No inquiries yet.</p>
        )}
      </div>
    </>
  );
}
