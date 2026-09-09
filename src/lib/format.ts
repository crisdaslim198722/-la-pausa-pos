export function formatCurrency(value: number): string {
  if (value === null || value === undefined) return "$0";
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}
