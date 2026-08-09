"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Verify the recovery session actually exists (user came via valid link)
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErr("This reset link is invalid or has expired. Please request a new one.");
        setState("error");
      }
      setReady(true);
    });
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    setErr(null);

    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    const confirm = String(f.get("confirm"));

    if (password.length < 8) {
      setErr("Password must be at least 8 characters");
      setState("error");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords don't match");
      setState("error");
      return;
    }

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
      setState("error");
      return;
    }
    setState("done");
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1200);
  }

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="eyebrow text-ink-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center"><Logo /></div>

        {state === "done" ? (
          <div className="text-center">
            <div className="eyebrow mb-3 text-accent">Success</div>
            <h1 className="font-serif text-3xl mb-4">Password updated</h1>
            <p className="text-ink-muted text-sm">Redirecting to the dashboard…</p>
          </div>
        ) : (
          <>
            <div className="eyebrow text-center mb-2">New password</div>
            <h1 className="font-serif text-3xl text-center mb-10">Set a new password</h1>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="eyebrow mb-2 block">New password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2"
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block">Confirm password</label>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2"
                />
              </div>
              {err && <p className="text-sm text-accent">{err}</p>}
              <button
                disabled={state === "saving"}
                className="w-full bg-ink text-ivory py-3 hover:bg-accent transition-colors text-sm eyebrow disabled:opacity-50"
              >
                {state === "saving" ? "Saving…" : "Update password"}
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
