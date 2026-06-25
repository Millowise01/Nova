export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mx-auto mt-20 w-full max-w-lg rounded-2xl bg-white p-4 shadow-soft dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-slate-500">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
