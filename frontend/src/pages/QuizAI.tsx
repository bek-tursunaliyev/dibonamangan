import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'
import { QUIZ_QUESTIONS, getRecommendations, type QuizAnswers } from '../lib/recommend'
import ProductCard from '../components/ProductCard'
import { callApi } from '../lib/api'
import { haptic } from '../lib/telegram'

export default function QuizAI() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [results, setResults] = useState<Product[] | null>(null)

  useEffect(() => {
    supabase.from('products').select('*').eq('status', 'approved').eq('in_stock', true).then(({ data }) => setProducts((data as Product[]) ?? []))
  }, [])

  const question = QUIZ_QUESTIONS[step]
  const progress = ((step) / QUIZ_QUESTIONS.length) * 100

  function choose(value: string) {
    haptic()
    const next = { ...answers, [question.key]: value }
    setAnswers(next)
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      const finalAnswers = next as QuizAnswers
      const recs = getRecommendations(products, finalAnswers)
      setResults(recs)
      callApi('submitQuiz', { answers: finalAnswers, recommendedProductId: recs[0]?.id ?? null }).catch(() => {})
    }
  }

  function restart() {
    setStep(0)
    setAnswers({})
    setResults(null)
  }

  if (results) {
    return (
      <div className="px-4 pb-8 pt-6">
        <div className="mb-4 text-center">
          <span className="text-4xl">🤖</span>
          <h1 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Siz uchun tavsiya</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Javoblaringiz asosida eng mos noutbuklar</p>
        </div>
        {results.length === 0 && <p className="text-center text-sm text-slate-400">Hozircha mos mahsulot topilmadi</p>}
        <div className="grid grid-cols-2 gap-3">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <button onClick={restart} className="mt-6 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          🔄 Qaytadan boshlash
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col px-4 pb-8 pt-6">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>Savol {step + 1} / {QUIZ_QUESTIONS.length}</span>
        {step > 0 && <button onClick={() => setStep(step - 1)}>← Orqaga</button>}
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <h1 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">{question.question}</h1>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-700 ring-1 ring-black/5 transition-transform active:scale-[0.98] dark:bg-[#1a1d27] dark:text-slate-100 dark:ring-white/10"
          >
            <span className="text-xl">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      <Link to="/" className="mt-auto pt-6 text-center text-xs text-slate-400">Bekor qilish</Link>
    </div>
  )
}
