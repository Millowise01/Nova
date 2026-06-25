import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'nova-button-primary' : 'nova-button-secondary';

  return <button className={`nova-button ${variantClass} ${className}`.trim()} {...props} />;
}