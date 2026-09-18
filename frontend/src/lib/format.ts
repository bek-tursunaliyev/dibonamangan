export function formatPrice(price: number, currency = 'UZS'): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(Math.round(price))
  if (currency === 'USD') return `$${formatted}`
  const symbol = currency === 'UZS' ? "so'm" : currency
  return `${formatted} ${symbol}`
}

export function discountPercent(price: number, discountPrice: number | null | undefined): number | null {
  if (discountPrice == null || discountPrice >= price || price <= 0) return null
  return Math.round((1 - discountPrice / price) * 100)
}
