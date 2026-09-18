import type { Category, Product } from './types'

export interface QuizOption {
  value: string
  label: string
  emoji: string
}

export interface QuizQuestion {
  key: keyof QuizAnswers
  question: string
  options: QuizOption[]
}

export interface QuizAnswers {
  purpose: string
  budget: string
  performance: string
  ram: string
  portability: string
  condition: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: 'purpose',
    question: 'Kompyuterni asosan nima uchun ishlatasiz?',
    options: [
      { value: 'gaming', label: "O'yin o'ynash", emoji: '🎮' },
      { value: 'design', label: 'Dizayn / video montaj', emoji: '🎨' },
      { value: 'programming', label: 'Dasturlash', emoji: '💻' },
      { value: 'office', label: "Ish / ofis dasturlari", emoji: '📊' },
      { value: 'student', label: "O'qish / talaba", emoji: '🎓' },
      { value: 'browsing', label: 'Internet / kundalik ishlar', emoji: '🌐' },
    ],
  },
  {
    key: 'budget',
    question: 'Byudjetingiz qancha?',
    options: [
      { value: 'low', label: "8 mln so'mgacha", emoji: '💵' },
      { value: 'mid', label: "8 - 15 mln so'm", emoji: '💰' },
      { value: 'high', label: "15 - 25 mln so'm", emoji: '💎' },
      { value: 'premium', label: "25 mln so'mdan yuqori", emoji: '👑' },
    ],
  },
  {
    key: 'performance',
    question: 'Qanday unumdorlik kerak?',
    options: [
      { value: 'light', label: "Yengil ishlar (matn, brauzer)", emoji: '🍃' },
      { value: 'medium', label: "O'rtacha (office, video ko'rish)", emoji: '⚙️' },
      { value: 'high', label: "Yuqori (render, og'ir o'yinlar, AI)", emoji: '🚀' },
    ],
  },
  {
    key: 'ram',
    question: "Qancha xotira (RAM) kerak bo'ladi?",
    options: [
      { value: '8', label: '8 GB yetarli', emoji: '🔹' },
      { value: '16', label: '16 GB', emoji: '🔸' },
      { value: '32', label: "32 GB va undan ko'p", emoji: '🔶' },
    ],
  },
  {
    key: 'portability',
    question: 'Portativlik sizga qanchalik muhim?',
    options: [
      { value: 'ultrabook', label: 'Yengil va kichik bo’lsin', emoji: '🪶' },
      { value: 'any', label: "Farqi yo'q", emoji: '🤷' },
      { value: 'big', label: 'Katta ekran muhim', emoji: '🖥️' },
    ],
  },
  {
    key: 'condition',
    question: 'Qanday holatdagi noutbuk qidiryapsiz?',
    options: [
      { value: 'new', label: 'Faqat yangi', emoji: '✨' },
      { value: 'used', label: "Ishlatilgan ham bo'ladi (arzonroq)", emoji: '♻️' },
      { value: 'any', label: "Farqi yo'q", emoji: '🤝' },
    ],
  },
]

const PURPOSE_CATEGORY: Record<string, Category> = {
  gaming: 'gaming',
  design: 'design',
  programming: 'business',
  office: 'office',
  student: 'student',
  browsing: 'budget',
}

const BUDGET_RANGE: Record<string, [number, number]> = {
  low: [0, 8_000_000],
  mid: [8_000_000, 15_000_000],
  high: [15_000_000, 25_000_000],
  premium: [25_000_000, Infinity],
}

const USD_TO_UZS = 12700

function priceInUZS(product: Product): number {
  return product.currency === 'USD' ? product.price * USD_TO_UZS : product.price
}

export function scoreProduct(product: Product, answers: QuizAnswers): number {
  let score = 0

  const purposeCategory = PURPOSE_CATEGORY[answers.purpose]
  if (product.category === purposeCategory) score += 4
  if (product.tags?.includes(answers.purpose)) score += 2

  const [min, max] = BUDGET_RANGE[answers.budget] ?? [0, Infinity]
  const priceUZS = priceInUZS(product)
  if (priceUZS >= min && priceUZS <= max) {
    score += 3
  } else {
    const distance = priceUZS < min ? min - priceUZS : priceUZS - max
    score -= Math.min(3, distance / 5_000_000)
  }

  if (product.tags?.includes(`perf-${answers.performance}`)) score += 3
  const requiredRam = Number(answers.ram)
  if (product.ram_gb != null) {
    if (product.ram_gb >= requiredRam) score += 2
    else score -= 2
  }

  if (product.screen_size != null) {
    if (answers.portability === 'ultrabook' && product.screen_size <= 14.5) score += 2
    if (answers.portability === 'big' && product.screen_size >= 15.6) score += 2
  }

  if (answers.condition !== 'any') {
    if (product.condition === answers.condition) score += 1
    else score -= 1
  }

  if (!product.in_stock) score -= 5

  return score
}

export function getRecommendations(products: Product[], answers: QuizAnswers, count = 3): Product[] {
  return [...products]
    .filter((p) => p.status === 'approved')
    .map((p) => ({ product: p, score: scoreProduct(p, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.product)
}
