import Link from "next/link";
import { Logo } from "./Logo";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const profile = data as { role: string } | null;
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-40 bg-ivory/85 backdrop-blur border-b border-ivory-line">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-10">
          <nav className="hidden md:flex items-center gap-10 text-sm">
            <Link href="/properties?listing_type=sale" className="hover:text-accent transition-colors">For Sale</Link>
            <Link href="/properties?listing_type=rent" className="hover:text-accent transition-colors">For Let</Link>
            <Link href="/properties?listing_type=lease" className="hover:text-accent transition-colors">For Lease</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
          </nav>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm px-4 py-2 border border-ink hover:bg-ink hover:text-ivory transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
