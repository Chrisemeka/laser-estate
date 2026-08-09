"use client";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const supabase = createSupabaseBrowser();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="text-xs text-ink-muted hover:text-accent"
    >
      Sign out
    </button>
  );
}
