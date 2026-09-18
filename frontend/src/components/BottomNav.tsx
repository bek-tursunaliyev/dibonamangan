import { NavLink } from 'react-router-dom'
import { Store, Scale, Bot, CirclePlus, CircleUserRound } from 'lucide-react'

const items = [
  { to: '/', label: "Do'kon", Icon: Store },
  { to: '/compare', label: 'Taqqoslash', Icon: Scale },
  { to: '/quiz', label: 'AI tanlov', Icon: Bot },
  { to: '/sell', label: 'Sotish', Icon: CirclePlus },
  { to: '/profile', label: 'Profil', Icon: CircleUserRound },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur safe-bottom dark:border-white/10 dark:bg-[#151821]/95">
      <div className="mx-auto flex max-w-[1280px] items-stretch justify-between px-1">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
