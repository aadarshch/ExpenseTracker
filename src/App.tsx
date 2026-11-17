import { useState } from 'react'
import { Wallet } from 'lucide-react'
import BottomNav, { type Tab } from './components/BottomNav'
import AddPage from './pages/AddPage'
import ListPage from './pages/ListPage'
import PeoplePage from './pages/PeoplePage'
import StatsPage from './pages/StatsPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('list')

  return (
    <div className="mx-auto min-h-svh max-w-md bg-slate-50 shadow-xl shadow-slate-200/60 dark:bg-slate-950 dark:shadow-none">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-50/85 px-4 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/85">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-300 dark:shadow-none">
            <Wallet size={17} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Expense Tracker
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Private · Offline
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-4">
        {tab === 'add' && <AddPage onSaved={() => setTab('list')} />}
        {tab === 'list' && <ListPage onGoAdd={() => setTab('add')} />}
        {tab === 'people' && <PeoplePage />}
        {tab === 'stats' && <StatsPage />}
      </main>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
