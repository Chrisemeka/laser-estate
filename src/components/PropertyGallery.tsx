"use client";
import Image from "next/image";
import { useState } from "react";
import type { Media } from "@/lib/supabase/types";

export function PropertyGallery({ media }: { media: Media[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (media.length === 0) {
    return (
      <div className="aspect-[16/10] bg-ivory-warm flex items-center justify-center font-serif italic text-ink-faint">
        No images available
      </div>
    );
  }

  const current = media[active];

  return (
    <>
      <div className="grid md:grid-cols-4 gap-2">
        <button
          className="md:col-span-3 relative aspect-[16/10] overflow-hidden bg-ivory-warm"
          onClick={() => setLightbox(active)}
        >
          {current.type === "video" ? (
            <video src={current.url} controls className="w-full h-full object-cover" />
          ) : (
            <Image src={current.url} alt="" fill sizes="75vw" className="object-cover" priority />
          )}
        </button>
        <div className="grid grid-cols-4 md:grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-ivory-warm ${i === active ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"}`}
            >
              {m.type === "video" ? (
                <div className="w-full h-full bg-ink flex items-center justify-center text-ivory text-xs">▶ Video</div>
              ) : (
                <Image src={m.url} alt="" fill sizes="15vw" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-6xl w-full aspect-video">
            {media[lightbox].type === "video" ? (
              <video src={media[lightbox].url} controls autoPlay className="w-full h-full" />
            ) : (
              <Image src={media[lightbox].url} alt="" fill className="object-contain" />
            )}
          </div>
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-ivory text-3xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
