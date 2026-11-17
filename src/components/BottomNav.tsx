import { CalendarDays, ChartPie, List, Plus, Users } from 'lucide-react'

export type Tab = 'add' | 'list' | 'calendar' | 'people' | 'stats'

const TABS = [
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'list', label: 'History', icon: List },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'people', label: 'People', icon: Users },
  { id: 'stats', label: 'Stats', icon: ChartPie },
] as const

type Props = {
  tab: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="nav-glass fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto flex max-w-md items-stretch justify-around pb-[max(0.55rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-1 landscape:max-w-2xl">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium tracking-tight transition-colors ${
                active ? 'text-[#f0d29a]' : 'text-white/35'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
