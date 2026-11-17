import type { CSSProperties } from 'react'
import Sheet from './Sheet'

type Props = {
  percent: number
  blurPx: number
  dust: boolean
  onChange: (percent: number) => void
  onToggleDust: () => void
  onReset: () => void
  onClose: () => void
}

export default function SettingsSheet({
  percent,
  blurPx,
  dust,
  onChange,
  onToggleDust,
  onReset,
  onClose,
}: Props) {
  const fill = ((percent - 25) / 75) * 100

  return (
    <Sheet onClose={onClose}>
      <h2 className="text-lg font-semibold tracking-tight text-white">Appearance</h2>
      <p className="mt-1 text-xs leading-relaxed text-white/45">
        Matte glass panels, tuned for iPhone. The app stays dark to match iOS.
      </p>

      <div className="glass mt-4 rounded-2xl p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold text-white/75">Glass blur</p>
          <p className="text-xs font-semibold tabular-nums text-[#f0d29a]">
            {percent}% · {blurPx}px
          </p>
        </div>
        <input
          type="range"
          min={25}
          max={100}
          step={5}
          value={percent}
          onChange={(event) => onChange(Number(event.target.value))}
          className="range mt-4"
          style={{ '--pct': `${fill}%` } as CSSProperties}
          aria-label="Glass blur strength"
        />
        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/30">
          <span>Subtle</span>
          <span>Frosted</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div>
            <p className="text-xs font-semibold text-white/75">Golden dust</p>
            <p className="mt-0.5 text-[10px] text-white/35">
              Slow drifting particles behind the glass
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dust}
            aria-label="Golden dust background"
            onClick={onToggleDust}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              dust ? 'bg-[#e8c27a]' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                dust ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onReset}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/75 transition active:scale-[0.99]"
        >
          Reset to 70%
        </button>
        <button
          onClick={onClose}
          className="btn-gold flex-1 rounded-xl py-3 text-sm font-semibold"
        >
          Done
        </button>
      </div>
    </Sheet>
  )
}
