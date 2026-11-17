import { ArchiveRestore, Download, Trash2, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import type { Expense } from '../types'
import { clearAllData, createBackup, downloadBackup, restoreBackup } from '../utils/backup'
import { exportExpensesCsv } from '../utils/csv'
import { importExpensesCsv } from '../utils/csvImport'

type Props = {
  expenses: Expense[]
}

export default function DataTools({ expenses }: Props) {
  const csvInput = useRef<HTMLInputElement>(null)
  const backupInput = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = await importExpensesCsv(await file.text())
    if (result.error) {
      setStatus(result.error)
      return
    }
    setStatus(
      `Imported ${result.imported} expense${result.imported === 1 ? '' : 's'}, skipped ${result.skipped}.`,
    )
  }

  const handleExportBackup = async () => {
    downloadBackup(await createBackup())
    setStatus('Backup downloaded.')
  }

  const handleRestoreBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!window.confirm('Replace ALL data on this device with this backup?')) return
    try {
      await restoreBackup(await file.text())
      setStatus('Backup restored.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not restore this backup.')
    }
  }

  const handleClear = async () => {
    if (
      !window.confirm(
        'Delete all expenses, money-in records, balance updates and people records from this device? This cannot be undone.',
      )
    ) {
      return
    }
    await clearAllData()
    setStatus('All data cleared.')
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Data
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => exportExpensesCsv(expenses)}
          className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-semibold text-slate-600 transition active:scale-[0.98] dark:border-slate-800 dark:text-slate-300"
        >
          <Download size={15} />
          Export CSV
        </button>
        <button
          onClick={() => void handleExportBackup()}
          className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-semibold text-slate-600 transition active:scale-[0.98] dark:border-slate-800 dark:text-slate-300"
        >
          <ArchiveRestore size={15} />
          Backup all
        </button>
        <button
          onClick={() => csvInput.current?.click()}
          className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-semibold text-slate-600 transition active:scale-[0.98] dark:border-slate-800 dark:text-slate-300"
        >
          <Upload size={15} />
          Import CSV
        </button>
        <button
          onClick={() => backupInput.current?.click()}
          className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-semibold text-slate-600 transition active:scale-[0.98] dark:border-slate-800 dark:text-slate-300"
        >
          <ArchiveRestore size={15} />
          Restore backup
        </button>
      </div>

      <button
        onClick={() => void handleClear()}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 py-2.5 text-[11px] font-semibold text-red-500 transition active:scale-[0.98] dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
      >
        <Trash2 size={14} />
        Clear all data
      </button>

      <input ref={csvInput} type="file" accept=".csv,text/csv" hidden onChange={handleImportCsv} />
      <input
        ref={backupInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleRestoreBackup}
      />

      {status && (
        <p className="mt-2 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {status}
        </p>
      )}
      <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Data lives on this device. Back up before clearing Safari data.
      </p>
    </div>
  )
}
