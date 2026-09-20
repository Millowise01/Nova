export function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-[color:var(--color-foreground)]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">{description}</p>
    </div>
  );
}
