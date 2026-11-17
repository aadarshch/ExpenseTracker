import { ChartPie, List, Plus, Users } from 'lucide-react'

export type Tab = 'add' | 'list' | 'people' | 'stats'

const TABS = [
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'list', label: 'History', icon: List },
  { id: 'people', label: 'People', icon: Users },
  { id: 'stats', label: 'Stats', icon: ChartPie },
] as const

type Props = {
  tab: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex w-16 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 1.9} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
