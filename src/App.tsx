import { Settings2, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import BalanceCard from './components/BalanceCard'
import BottomNav, { type Tab } from './components/BottomNav'
import DustLayer from './components/DustLayer'
import SettingsSheet from './components/SettingsSheet'
import { useAppearance } from './hooks/useAppearance'
import { useLedger } from './hooks/useLedger'
import AddPage from './pages/AddPage'
import CalendarPage from './pages/CalendarPage'
import ListPage from './pages/ListPage'
import PeoplePage from './pages/PeoplePage'
import StatsPage from './pages/StatsPage'
import { monthKey } from './utils/format'

export default function App() {
  const [tab, setTab] = useState<Tab>('list')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentMonthKey] = useState(() => monthKey(new Date()))
  const appearance = useAppearance()
  const { expenses, balance, ready } = useLedger()

  const spentThisMonth = expenses
    .filter((expense) => expense.date.startsWith(currentMonthKey))
    .reduce((sum, expense) => sum + expense.amount, 0)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      {appearance.dust && <DustLayer />}

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-md flex-col landscape:max-w-2xl">
        <header className="app-header sticky top-0 z-30 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#e8c27a]">
                <Wallet size={17} />
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-semibold tracking-tight text-white">Expenses</p>
                <p className="header-subtitle text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
                  Private · On-device
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="icon-btn"
              aria-label="Appearance settings"
            >
              <Settings2 size={17} />
            </button>
          </div>

          <div className="mt-2.5">
            <BalanceCard
              balance={balance}
              spentThisMonth={spentThisMonth}
              ready={ready}
              showInsight={tab === 'list'}
            />
          </div>
        </header>

        <main className="app-main flex-1 pb-32 pt-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <div key={tab} className="page-enter">
            {tab === 'add' && <AddPage onSaved={() => setTab('list')} />}
            {tab === 'list' && <ListPage onGoAdd={() => setTab('add')} />}
            {tab === 'calendar' && <CalendarPage />}
            {tab === 'people' && <PeoplePage />}
            {tab === 'stats' && <StatsPage />}
          </div>
        </main>

        <BottomNav tab={tab} onChange={setTab} />
      </div>

      {settingsOpen && (
        <SettingsSheet
          percent={appearance.percent}
          blurPx={appearance.blurPx}
          dust={appearance.dust}
          onChange={appearance.setPercent}
          onToggleDust={appearance.toggleDust}
          onReset={appearance.reset}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  )
}
