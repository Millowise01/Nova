import type { ReactNode } from 'react';

export function PageState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="nova-card p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {description ? <p className="mt-2 text-gray-600">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}