"use client";
import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErr(null);

    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setState("error");
      setErr(error.message);
      return;
    }
    setState("sent");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center"><Logo /></div>

        {state === "sent" ? (
          <div className="text-center">
            <div className="eyebrow mb-3 text-accent">Check your inbox</div>
            <h1 className="font-serif text-3xl mb-4">Reset link sent</h1>
            <p className="text-ink-muted text-sm leading-relaxed">
              If an account exists for that email, you&apos;ll receive a link to
              reset your password shortly. Check spam if it doesn&apos;t arrive
              within a minute.
            </p>
            <Link href="/login" className="mt-8 inline-block eyebrow text-xs hover:text-accent">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="eyebrow text-center mb-2">Password reset</div>
            <h1 className="font-serif text-3xl text-center mb-10">Forgot password</h1>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="eyebrow mb-2 block">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2"
                />
              </div>
              {err && <p className="text-sm text-accent">{err}</p>}
              <button
                disabled={state === "sending"}
                className="w-full bg-ink text-ivory py-3 hover:bg-accent transition-colors text-sm eyebrow disabled:opacity-50"
              >
                {state === "sending" ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <Link
              href="/login"
              className="mt-6 block text-center text-xs text-ink-muted hover:text-accent"
            >
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
