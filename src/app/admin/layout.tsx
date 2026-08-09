import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase.from("profiles").select("role,full_name").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <div className="eyebrow mb-4">403</div>
        <h1 className="font-serif text-3xl mb-4">Admin access only</h1>
        <p className="text-ink-muted mb-6">This account isn&apos;t authorised for the dashboard.</p>
        <Link href="/" className="eyebrow hover:text-accent">← Home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-ivory-line">
        <div>
          <div className="eyebrow text-ink-muted">Dashboard</div>
          <h1 className="font-serif text-2xl">Welcome, {profile?.full_name ?? "Admin"}</h1>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/admin" className="hover:text-accent">Listings</Link>
          <Link href="/admin/inquiries" className="hover:text-accent">Inquiries</Link>
          <Link href="/admin/properties/new" className="px-4 py-2 bg-ink text-ivory hover:bg-accent transition-colors eyebrow text-xs">+ New listing</Link>
          <SignOutButton />
        </nav>
      </div>
      {children}
    </div>
  );
}
