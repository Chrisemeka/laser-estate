import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createSupabaseServer } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";

const schema = z.object({
  property_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2, "Name is too short").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional().nullable(),
  message: z.string().min(1, "Message is required").max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Return the first friendly message as `error` so the client can display it
    const firstIssue = parsed.error.issues[0]?.message ?? "Please check the form";
    return NextResponse.json({ ok: false, error: firstIssue, issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("inquiries").insert(parsed.data);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Fire-and-forget email
  if (process.env.RESEND_API_KEY && process.env.INQUIRY_NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${BRAND.short} <notifications@laserestate.ng>`,
        to: process.env.INQUIRY_NOTIFICATION_EMAIL,
        subject: `New enquiry from ${parsed.data.name}`,
        text: `${parsed.data.name} (${parsed.data.email}${parsed.data.phone ? ", " + parsed.data.phone : ""}) wrote:\n\n${parsed.data.message}\n\nProperty: ${parsed.data.property_id ?? "general"}`,
      });
    } catch (e) {
      console.error("Resend failed", e);
    }
  }

  return NextResponse.json({ ok: true });
}
