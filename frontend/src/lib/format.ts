export function formatPrice(price: number, currency = 'UZS'): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(Math.round(price))
  if (currency === 'USD') return `$${formatted}`
  const symbol = currency === 'UZS' ? "so'm" : currency
  return `${formatted} ${symbol}`
}

export const CATEGORY_LABELS: Record<string, string> = {
  gaming: '🎮 Gaming',
  business: '💼 Biznes',
  student: '🎓 Talaba',
  design: '🎨 Dizayn',
  office: '📊 Ofis',
  budget: '💵 Byudjet',
  other: '💻 Boshqa',
}
