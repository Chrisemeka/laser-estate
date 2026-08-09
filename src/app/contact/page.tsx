import { InquiryForm } from "@/components/InquiryForm";
import { BRAND } from "@/lib/constants";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24 grid md:grid-cols-2 gap-16">
      <div>
        <div className="eyebrow mb-4">Get in touch</div>
        <h1 className="font-serif text-5xl mb-8">Speak with us</h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-10">
          Whether you&apos;re buying, selling, letting, or exploring — we&apos;d be
          delighted to hear from you.
        </p>
        <div className="space-y-6 text-sm">
          <div>
            <div className="eyebrow mb-1">Office</div>
            <address className="not-italic text-ink-soft leading-relaxed">{BRAND.address}</address>
          </div>
          <div>
            <div className="eyebrow mb-1">Phone</div>
            <div className="text-ink-soft">{BRAND.phones.join(" · ")}</div>
          </div>
          <div>
            <div className="eyebrow mb-1">Email</div>
            <a href={`mailto:${BRAND.email}`} className="text-ink-soft hover:text-accent">{BRAND.email}</a>
          </div>
          <div>
            <div className="eyebrow mb-1">WhatsApp</div>
            <a href={`https://wa.me/${BRAND.whatsapp}`} className="text-ink-soft hover:text-accent" target="_blank" rel="noopener noreferrer">
              Message on WhatsApp →
            </a>
          </div>
        </div>
      </div>
      <div className="bg-ivory-warm/60 p-8 border border-ivory-line">
        <div className="eyebrow mb-4">Send a message</div>
        <InquiryForm />
      </div>
    </div>
  );
}
