import {
  Gamepad2, Briefcase, GraduationCap, Palette, BarChart3, Wallet, Laptop,
  Code2, Globe, Feather, Settings2, Rocket, Gem, Crown, DollarSign,
  Sparkles as SparklesIcon,
} from 'lucide-react'
import type { Category } from './types'

export const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  gaming: Gamepad2,
  business: Briefcase,
  student: GraduationCap,
  design: Palette,
  office: BarChart3,
  budget: Wallet,
  other: Laptop,
}

export const CATEGORY_TEXT_LABELS: Record<Category, string> = {
  gaming: 'Gaming',
  business: 'Biznes',
  student: 'Talaba',
  design: 'Dizayn',
  office: 'Ofis',
  budget: "Byudjet",
  other: 'Boshqa',
}

// Keyed by "<question key>:<option value>" to avoid collisions between
// questions that reuse the same option value (e.g. budget vs performance "high").
export const QUIZ_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'purpose:gaming': Gamepad2,
  'purpose:design': Palette,
  'purpose:programming': Code2,
  'purpose:office': BarChart3,
  'purpose:student': GraduationCap,
  'purpose:browsing': Globe,
  'budget:low': DollarSign,
  'budget:mid': Wallet,
  'budget:high': Gem,
  'budget:premium': Crown,
  'performance:light': Feather,
  'performance:medium': Settings2,
  'performance:high': Rocket,
  'ram:8': Feather,
  'ram:16': Settings2,
  'ram:32': Rocket,
  'portability:ultrabook': Feather,
  'portability:any': SparklesIcon,
  'portability:big': Laptop,
  'condition:new': SparklesIcon,
  'condition:used': Wallet,
  'condition:any': SparklesIcon,
}
