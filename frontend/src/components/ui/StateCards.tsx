export function LoadingCard({ label = 'Loading content' }: { label?: string }) {
  return <div className="nova-card animate-pulse p-6 text-sm text-gray-500">{label}...</div>;
}

export function ErrorCard({ title, message }: { title: string; message?: string }) {
  return (
    <div className="nova-card border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-1 text-red-600">{message}</p> : null}
    </div>
  );
}