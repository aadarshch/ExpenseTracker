import { Calculator, Check, Copy, Delete } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Sheet from './Sheet'

type Props = {
  value: string
  onApply: (value: string) => void
}

const OPERATOR = /[+\-*/]$/

const round2 = (value: number) => Math.round(value * 100) / 100

function formatPlain(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function evaluate(expression: string): number | null {
  if (!expression || !/^[\d+\-*/.]+$/.test(expression)) return null
  const tokens = expression.match(/\d*\.?\d+|[+\-*/]/g)
  if (!tokens || tokens.join('') !== expression) return null

  const numbers: number[] = []
  const operators: string[] = []
  const precedence = (operator: string) => (operator === '*' || operator === '/' ? 2 : 1)

  const applyTop = () => {
    const right = numbers.pop()
    const left = numbers.pop()
    const operator = operators.pop()
    if (left === undefined || right === undefined || operator === undefined) return
    numbers.push(
      operator === '+'
        ? left + right
        : operator === '-'
          ? left - right
          : operator === '*'
            ? left * right
            : left / right,
    )
  }

  let expectNumber = true
  for (const token of tokens) {
    if (/^[+\-*/]$/.test(token)) {
      if (expectNumber) return null
      while (
        operators.length > 0 &&
        precedence(operators[operators.length - 1]) >= precedence(token)
      ) {
        applyTop()
      }
      operators.push(token)
      expectNumber = true
    } else {
      if (!expectNumber) return null
      numbers.push(Number(token))
      expectNumber = false
    }
  }
  if (expectNumber) return null
  while (operators.length > 0) applyTop()

  const result = numbers[0]
  return result !== undefined && Number.isFinite(result) ? result : null
}

function CalculatorSheet({
  value: initial,
  onApply,
  onClose,
}: Props & { onClose: () => void }) {
  const [expression, setExpression] = useState(() =>
    initial.trim() && Number(initial.replace(/,/g, '')) >= 0 ? initial.trim() : '',
  )
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => evaluate(expression), [expression])
  const rounded = result === null ? null : round2(result)
  const displayValue = rounded === null ? null : formatPlain(rounded)
  const plainResult = rounded !== null && rounded > 0 ? displayValue : null
  const prettyExpression = expression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  const appendDigit = (digit: string) => {
    setExpression((previous) => {
      if (previous === '0') return digit
      if (previous.replace(/\D/g, '').length >= 9) return previous
      return previous + digit
    })
    setCopied(false)
  }

  const appendDot = () => {
    setExpression((previous) => {
      const current = previous.split(/[+\-*/]/).pop() ?? ''
      if (current.includes('.')) return previous
      if (!previous) return '0.'
      return current === '' ? `${previous}0.` : `${previous}.`
    })
    setCopied(false)
  }

  const appendOperator = (operator: string) => {
    setExpression((previous) => {
      if (!previous) return ''
      if (OPERATOR.test(previous)) return previous.slice(0, -1) + operator
      if (previous.endsWith('.')) return previous.slice(0, -1) + operator
      return previous + operator
    })
    setCopied(false)
  }

  const backspace = () => {
    setExpression((previous) => previous.slice(0, -1))
    setCopied(false)
  }

  const clear = () => {
    setExpression('')
    setCopied(false)
  }

  const calculate = () => {
    if (displayValue === null) return
    setExpression(displayValue)
    setCopied(false)
  }

  const copyResult = async () => {
    if (displayValue === null) return
    try {
      await navigator.clipboard.writeText(displayValue)
    } catch {
      const field = document.createElement('textarea')
      field.value = displayValue
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setCopied(true)
  }

  const applyAmount = () => {
    if (plainResult === null) return
    onApply(plainResult)
    onClose()
  }

  const keyBase =
    'flex h-11 items-center justify-center rounded-xl border text-base font-semibold transition active:scale-[0.97]'
  const digitKey = `${keyBase} border-white/10 bg-white/[0.045] text-white/90`
  const operatorKey = `${keyBase} border-[#e8c27a]/25 bg-[#e8c27a]/10 text-[#f0d29a]`
  const softKey = `${keyBase} border-white/10 bg-white/[0.025] text-[#ff8a80]`

  return (
    <Sheet onClose={onClose} translucent>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white">Calculator</h2>
        <button
          type="button"
          onClick={() => void copyResult()}
          disabled={displayValue === null}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70 transition active:bg-white/10 disabled:opacity-35"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#4ade80]" />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy amount
            </>
          )}
        </button>
      </div>

      <div className="glass mt-3 rounded-2xl px-4 py-2.5">
        <p className="min-h-4 truncate text-right text-[11px] tabular-nums text-white/30">
          {result !== null ? prettyExpression : ' '}
        </p>
        <p className="truncate text-right text-[1.75rem] font-semibold leading-tight tracking-tight tabular-nums text-white">
          {displayValue ?? (prettyExpression || '0')}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <button type="button" onClick={clear} className={`${softKey} col-span-2`}>
          Clear
        </button>
        <button
          type="button"
          onClick={backspace}
          aria-label="Backspace"
          className={softKey}
        >
          <Delete size={17} />
        </button>
        <button type="button" onClick={() => appendOperator('/')} className={operatorKey}>
          ÷
        </button>

        {['7', '8', '9'].map((digit) => (
          <button key={digit} type="button" onClick={() => appendDigit(digit)} className={digitKey}>
            {digit}
          </button>
        ))}
        <button type="button" onClick={() => appendOperator('*')} className={operatorKey}>
          ×
        </button>

        {['4', '5', '6'].map((digit) => (
          <button key={digit} type="button" onClick={() => appendDigit(digit)} className={digitKey}>
            {digit}
          </button>
        ))}
        <button type="button" onClick={() => appendOperator('-')} className={operatorKey}>
          −
        </button>

        {['1', '2', '3'].map((digit) => (
          <button key={digit} type="button" onClick={() => appendDigit(digit)} className={digitKey}>
            {digit}
          </button>
        ))}
        <button type="button" onClick={() => appendOperator('+')} className={operatorKey}>
          +
        </button>

        <button type="button" onClick={() => appendDigit('0')} className={`${digitKey} col-span-2`}>
          0
        </button>
        <button type="button" onClick={appendDot} className={digitKey}>
          .
        </button>
        <button
          type="button"
          onClick={calculate}
          disabled={displayValue === null}
          className="btn-gold rounded-xl text-lg font-semibold disabled:opacity-35"
        >
          =
        </button>
      </div>

      <p className="mt-1.5 px-1 text-center text-[10px] leading-snug text-white/25">
        × and ÷ are calculated before + and −.
      </p>

      <button
        type="button"
        onClick={applyAmount}
        disabled={plainResult === null}
        className="btn-gold mt-2 w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40"
      >
        {plainResult === null ? 'Enter an amount' : `Use amount · ${plainResult}`}
      </button>
    </Sheet>
  )
}

export default function AmountCalculator({ value, onApply }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open calculator"
        className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-[#f0d29a] transition active:bg-white/10"
      >
        <Calculator size={12} />
        Calc
      </button>

      {open && (
        <CalculatorSheet
          value={value}
          onApply={onApply}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
