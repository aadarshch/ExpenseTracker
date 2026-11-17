import { ChartPie, List, Plus } from 'lucide-react'

export type Tab = 'add' | 'list' | 'stats'

const TABS = [
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'list', label: 'History', icon: List },
  { id: 'stats', label: 'Stats', icon: ChartPie },
] as const

type Props = {
  tab: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex w-20 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                active ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
