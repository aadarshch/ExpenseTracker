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
    <div className="glass rounded-2xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Data</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => exportExpensesCsv(expenses)}
          className="glass-soft flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold text-white/65 transition active:scale-[0.98]"
        >
          <Download size={15} />
          Export CSV
        </button>
        <button
          onClick={() => void handleExportBackup()}
          className="glass-soft flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold text-white/65 transition active:scale-[0.98]"
        >
          <ArchiveRestore size={15} />
          Backup all
        </button>
        <button
          onClick={() => csvInput.current?.click()}
          className="glass-soft flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold text-white/65 transition active:scale-[0.98]"
        >
          <Upload size={15} />
          Import CSV
        </button>
        <button
          onClick={() => backupInput.current?.click()}
          className="glass-soft flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold text-white/65 transition active:scale-[0.98]"
        >
          <ArchiveRestore size={15} />
          Restore backup
        </button>
      </div>

      <button
        onClick={() => void handleClear()}
        className="btn-danger mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-semibold"
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
        <p className="mt-2 text-center text-[11px] font-medium text-white/55">{status}</p>
      )}
      <p className="mt-2 text-center text-[11px] text-white/30">
        Data lives on this device. Back up before clearing Safari data.
      </p>
    </div>
  )
}
