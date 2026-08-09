import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  const ink = dark ? "text-ivory" : "text-ink";
  const muted = dark ? "text-ivory/70" : "text-ink-muted";
  return (
    <Link href="/" className="inline-flex flex-col leading-none group">
      <span className={`font-serif text-2xl tracking-tight ${ink}`}>
        <span className="italic">L</span>aser
      </span>
      <span className="h-[2px] w-full bg-accent -mt-0.5 mb-0.5 transition-all group-hover:w-[110%]" />
      <span className={`eyebrow text-[9px] ${muted}`}>Estate Services</span>
    </Link>
  );
}
