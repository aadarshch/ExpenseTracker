import type { ReactNode } from 'react'

type Props = {
  onClose: () => void
  children: ReactNode
}

export default function Sheet({ onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-50 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        {children}
      </div>
    </div>
  )
}
