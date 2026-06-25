export function formatPhone(value: string) {
  const compact = value.replace(/\s+/g, '');

  if (!compact.startsWith('+232')) {
    return value;
  }

  return `${compact.slice(0, 4)} ${compact.slice(4, 6)} ${compact.slice(6, 9)} ${compact.slice(9, 12)}`.trim();
}