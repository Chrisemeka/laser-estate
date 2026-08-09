"use client";
import { useState } from "react";

export function InquiryForm({ propertyId, propertyTitle }: { propertyId?: string; propertyTitle?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setErr(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        property_id: propertyId ?? null,
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        message: f.get("message") || `I'd like more information about ${propertyTitle ?? "your listings"}.`,
      }),
    });
    const j = await res.json();
    if (!j.ok) { setState("error"); setErr(j.error ?? "Could not send"); return; }
    setState("sent");
    (e.target as HTMLFormElement).reset();
  }

  if (state === "sent") {
    return (
      <div className="p-6 bg-ivory-warm border-l-4 border-accent">
        <div className="eyebrow text-accent mb-1">Sent</div>
        <p className="font-serif text-lg">Thank you. We&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="eyebrow mb-2 block">Name</label>
        <input name="name" required className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="eyebrow mb-2 block">Email</label>
          <input name="email" type="email" required className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2" />
        </div>
        <div>
          <label className="eyebrow mb-2 block">Phone</label>
          <input name="phone" className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2" />
        </div>
      </div>
      <div>
        <label className="eyebrow mb-2 block">Message</label>
        <textarea name="message" rows={4} className="w-full bg-transparent border-b border-ink-faint focus:border-accent outline-none py-2 resize-none" />
      </div>
      {err && <p className="text-sm text-accent">{err}</p>}
      <button
        disabled={state === "sending"}
        className="w-full bg-ink text-ivory py-3 hover:bg-accent transition-colors text-sm eyebrow disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
