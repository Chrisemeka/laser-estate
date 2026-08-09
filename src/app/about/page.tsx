import { BRAND } from "@/lib/constants";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <div className="eyebrow mb-4">About</div>
      <h1 className="font-serif text-5xl mb-12">{BRAND.name}</h1>
      <div className="space-y-6 text-lg text-ink-soft leading-relaxed">
        <p>
          {BRAND.name} is a Lagos-based real estate consultancy specialising in
          high-end residential and commercial property across Ikoyi, Victoria
          Island, Banana Island, and Lekki.
        </p>
        <p>
          For over two decades, we have quietly represented buyers, sellers,
          tenants, and landlords on some of the city&apos;s most sought-after
          streets. Every mandate is handled personally by our principal, with
          discretion and attention to detail.
        </p>
        <p>
          We advise on sales, rentals, lease, and shortlets — as well as bare
          land, commercial space, and specialised assets such as filling
          stations and mixed-use developments.
        </p>
      </div>
      <div className="hairline my-12" />
      <div className="grid grid-cols-2 gap-8 text-sm">
        <div>
          <div className="eyebrow mb-2">Office</div>
          <div className="text-ink-soft">{BRAND.address}</div>
        </div>
        <div>
          <div className="eyebrow mb-2">Contact</div>
          <div className="text-ink-soft">{BRAND.phones.join(" · ")}</div>
          <div className="text-ink-soft">{BRAND.email}</div>
        </div>
      </div>
    </div>
  );
}
