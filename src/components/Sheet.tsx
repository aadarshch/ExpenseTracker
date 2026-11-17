import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  onClose: () => void
  children: ReactNode
  translucent?: boolean
}

export default function Sheet({ onClose, children, translucent = false }: Props) {
  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${
        translucent ? 'bg-black/30 backdrop-blur-sm' : 'bg-black/65 backdrop-blur-md'
      }`}
      onClick={onClose}
    >
      <div
        className={`sheet-panel max-h-[90svh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 ${
          translucent ? 'sheet-panel-soft' : ''
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        {children}
      </div>
    </div>,
    document.body,
  )
}
