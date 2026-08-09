import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { makeObjectKey, presignPutUrl, publicUrlFor } from "@/lib/r2";

const schema = z.object({
  filename: z.string().min(1).max(255),
  content_type: z.string().min(1).max(100),
  size: z.number().int().nonnegative().optional(),
});

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });

  const { filename, content_type, size } = parsed.data;
  const isVideo = content_type.startsWith("video/");
  const isImage = content_type.startsWith("image/");
  if (!isImage && !isVideo) return NextResponse.json({ ok: false, error: "Only images or video" }, { status: 400 });
  if (size != null && size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
    return NextResponse.json({ ok: false, error: `File too large (max ${isVideo ? 100 : 15}MB)` }, { status: 400 });
  }

  const key = makeObjectKey(filename);
  const uploadUrl = await presignPutUrl(key, content_type);

  return NextResponse.json({
    ok: true,
    uploadUrl,
    key,
    publicUrl: publicUrlFor(key),
    type: isVideo ? "video" : "image",
  });
}
