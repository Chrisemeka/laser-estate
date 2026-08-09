import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink text-ivory mt-32">
      <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <Logo dark />
          <p className="mt-6 max-w-sm text-ivory/70 leading-relaxed">
            Discreet, considered real estate consultancy for Lagos&apos; most sought-after
            addresses. Ikoyi. Victoria Island. Banana Island. Lekki.
          </p>
        </div>

        <div>
          <div className="eyebrow text-ivory/50 mb-4">Explore</div>
          <ul className="space-y-3 text-sm">
            <li><Link href="/properties?listing_type=sale" className="hover:text-accent">For Sale</Link></li>
            <li><Link href="/properties?listing_type=rent" className="hover:text-accent">For Let</Link></li>
            <li><Link href="/properties?listing_type=lease" className="hover:text-accent">For Lease</Link></li>
            <li><Link href="/about" className="hover:text-accent">About</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-ivory/50 mb-4">Contact</div>
          <address className="not-italic text-sm space-y-2 text-ivory/80 leading-relaxed">
            <div>{BRAND.address}</div>
            <div>{BRAND.phones.join(" · ")}</div>
            <div><a href={`mailto:${BRAND.email}`} className="hover:text-accent">{BRAND.email}</a></div>
          </address>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div>Built by <span className="text-ivory/70">Chukwuemeka Anyanwu</span></div>
          <div>Lagos, Nigeria</div>
        </div>
      </div>
    </footer>
  );
}
