export function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--ds-text)]">{title}</h2>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
