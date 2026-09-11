export function formatDopMinor(amountMinor: number): string {
  return new Intl.NumberFormat('es-DO', {
    currency: 'DOP',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
    style: 'currency',
  }).format(amountMinor / 100);
}
