"use client";
import Image from "next/image";
import { useState } from "react";

type MediaItem = { url: string; public_id: string | null; type: "image" | "video"; display_order: number };

interface Props {
  media: MediaItem[];
  setMedia: (m: MediaItem[]) => void;
}

export function MediaUploader({ media, setMedia }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErr(null); setUploading(true);
    const list = Array.from(files);
    setProgress({ current: 0, total: list.length });
    try {
      const uploaded: MediaItem[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        setProgress({ current: i + 1, total: list.length });

        // 1. Ask server for a presigned R2 upload URL
        const signRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, content_type: file.type || "application/octet-stream", size: file.size }),
        });
        const sig = await signRes.json();
        if (!signRes.ok || !sig.ok) throw new Error(sig.error ?? "Could not sign upload");

        // 2. PUT the file straight to R2
        const putRes = await fetch(sig.uploadUrl, {
          method: "PUT",
          headers: { "content-type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

        uploaded.push({
          url: sig.publicUrl,
          public_id: sig.key,        // R2 object key stored for later deletion
          type: sig.type,
          display_order: media.length + uploaded.length,
        });
      }
      setMedia([...media, ...uploaded]);
    } catch (e: any) {
      setErr(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function move(idx: number, delta: number) {
    const next = [...media];
    const to = idx + delta;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    next.forEach((m, i) => (m.display_order = i));
    setMedia(next);
  }

  function remove(idx: number) {
    const next = media.filter((_, i) => i !== idx);
    next.forEach((m, i) => (m.display_order = i));
    setMedia(next);
  }

  return (
    <div>
      <label className="block border-2 border-dashed border-ink-faint hover:border-accent transition-colors p-8 text-center cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        <div className="eyebrow mb-2">
          {uploading
            ? `Uploading ${progress?.current}/${progress?.total}…`
            : "Click or drop to upload"}
        </div>
        <p className="text-xs text-ink-muted">Images ≤ 15MB · Video ≤ 100MB. First item is the cover.</p>
      </label>
      {err && <p className="text-sm text-accent mt-3">{err}</p>}

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {media.map((m, i) => (
            <div key={i} className="relative group">
              <div className="relative aspect-square bg-ivory-warm overflow-hidden">
                {m.type === "video" ? (
                  <video src={m.url} className="w-full h-full object-cover" />
                ) : (
                  <Image src={m.url} alt="" fill sizes="25vw" className="object-cover" />
                )}
                {i === 0 && <span className="absolute top-2 left-2 eyebrow bg-accent text-ivory px-2 py-0.5 text-[9px]">Cover</span>}
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <div>
                  <button type="button" onClick={() => move(i, -1)} className="text-ink-muted hover:text-accent px-1">←</button>
                  <button type="button" onClick={() => move(i, 1)} className="text-ink-muted hover:text-accent px-1">→</button>
                </div>
                <button type="button" onClick={() => remove(i)} className="text-accent hover:underline">remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
