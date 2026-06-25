import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'brand' | 'accent' | 'neutral';
};

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  const toneClass =
    tone === 'brand'
      ? 'bg-brand-50 text-brand-700'
      : tone === 'accent'
        ? 'bg-accent-50 text-accent-500'
        : 'bg-gray-100 text-gray-700';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass} ${className}`.trim()} {...props} />;
}