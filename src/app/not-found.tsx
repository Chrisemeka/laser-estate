import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <div className="eyebrow mb-4">404</div>
      <h1 className="font-serif text-4xl italic mb-6">Page not found.</h1>
      <p className="text-ink-muted mb-8">The listing may have been removed or the link mistyped.</p>
      <Link href="/" className="eyebrow hover:text-accent">← Return home</Link>
    </div>
  );
}
