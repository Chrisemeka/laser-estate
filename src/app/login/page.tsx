"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/admin";
  const urlErr = params.get("error");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [err, setErr] = useState<string | null>(urlErr);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return; // guard against double-submit
    setLoading(true); setErr(null);
    const f = new FormData(e.currentTarget);
    const email = f.get("email") as string;
    const password = f.get("password") as string;
    const supabase = createSupabaseBrowser();

    const { error } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      return setErr(error.message);
    }
    // Keep the button disabled while the router navigates so it can't be
    // clicked a second time mid-redirect.
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center"><Logo /></div>
        <div className="eyebrow text-center mb-2">{mode === "signin" ? "Sign in" : "Create account"}</div>
        <h1 className="font-serif text-3xl text-center mb-10">
          {mode === "signin" ? "Welcome back" : "Get started"}
        </h1>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input name="email" type="email" required className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="eyebrow">Password</label>
              {mode === "signin" && (
                <Link href="/forgot-password" className="text-xs text-ink-muted hover:text-accent">
                  Forgot?
                </Link>
              )}
            </div>
            <input name="password" type="password" required minLength={8} className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2" />
          </div>
          {err && <p className="text-sm text-accent">{err}</p>}
          <button
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-ink text-ivory py-3 hover:bg-accent transition-colors text-sm eyebrow disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                <span>{mode === "signin" ? "Signing in…" : "Creating account…"}</span>
              </>
            ) : (
              <span>{mode === "signin" ? "Sign in" : "Create account"}</span>
            )}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); }}
          disabled={loading}
          className="mt-6 w-full text-xs text-ink-muted hover:text-accent disabled:opacity-50"
        >
          {mode === "signin" ? "No account? Create one" : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
