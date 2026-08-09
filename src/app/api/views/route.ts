import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { property_id } = await req.json();
  if (!property_id) return NextResponse.json({ ok: false }, { status: 400 });

  const cookieStore = await cookies();
  let sessionId = cookieStore.get("le_sid")?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set("le_sid", sessionId, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  // Skip admin views
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const profile = data as { role: string } | null;
    if (profile?.role === "admin") return NextResponse.json({ ok: true, skipped: "admin" });
  }

  // Use service role so RLS insert always succeeds
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("property_views").insert({
    property_id,
    session_id: sessionId,
    user_id: user?.id ?? null,
  });

  // Unique-index violation on same day = already counted; treat as success
  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
