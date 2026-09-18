import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: "Do'kon", icon: '🏠' },
  { to: '/compare', label: 'Taqqoslash', icon: '⚖️' },
  { to: '/quiz', label: 'AI tanlov', icon: '🤖' },
  { to: '/sell', label: 'Sotish', icon: '➕' },
  { to: '/profile', label: 'Profil', icon: '👤' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur safe-bottom dark:border-white/10 dark:bg-[#151821]/95">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
