import { PropertyForm } from "../PropertyForm";

export default function NewPropertyPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="font-serif text-3xl">New listing</h2>
        <p className="text-ink-muted text-sm mt-1">Draft and publish a new property.</p>
      </div>
      <PropertyForm />
    </>
  );
}
