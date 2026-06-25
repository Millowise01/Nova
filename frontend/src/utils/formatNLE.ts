export function formatNLE(value: number) {
  return `NLE ${new Intl.NumberFormat('en-US').format(value / 100)}`;
}