import { useState } from 'react'
import { Pencil, Plus, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useIncomeSources, useCreateIncomeSource, useUpdateIncomeSource, useDeleteIncomeSource,
  useExpenseCategories, useCreateExpenseCategory, useUpdateExpenseCategory, useDeleteExpenseCategory,
  useInvestmentTypes, useCreateInvestmentType, useUpdateInvestmentType, useDeleteInvestmentType,
} from '@/hooks/useSettings'
import type { IncomeSource, ExpenseCategory, InvestmentType } from '@/types/finance'

type LookupItem = IncomeSource | ExpenseCategory | InvestmentType

interface LookupListProps {
  title: string
  items: LookupItem[] | undefined
  isLoading: boolean
  onCreate: (name: string) => void
  onUpdate: (id: string, name: string) => void
  onDelete: (id: string) => void
  deleteError: string | null
  clearDeleteError: () => void
}

function LookupList({
  title, items, isLoading, onCreate, onUpdate, onDelete, deleteError, clearDeleteError,
}: LookupListProps) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    onCreate(trimmed)
    setNewName('')
  }

  const startEdit = (item: LookupItem) => {
    setEditingId(item.id)
    setEditName(item.name)
    clearDeleteError()
  }

  const commitEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deleteError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{deleteError}</p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <ul className="space-y-1">
            {items?.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                {editingId === item.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      className="h-8 flex-1"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={commitEdit}><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{item.name}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { clearDeleteError(); onDelete(item.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 pt-1">
          <Input
            placeholder="Add new..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            className="h-8"
          />
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function Settings() {
  const [incomeDeleteError, setIncomeDeleteError] = useState<string | null>(null)
  const [expenseDeleteError, setExpenseDeleteError] = useState<string | null>(null)
  const [investmentDeleteError, setInvestmentDeleteError] = useState<string | null>(null)

  const { data: incomeSources, isLoading: loadingIncome } = useIncomeSources()
  const createSource = useCreateIncomeSource()
  const updateSource = useUpdateIncomeSource()
  const deleteSource = useDeleteIncomeSource()

  const { data: expenseCategories, isLoading: loadingExpense } = useExpenseCategories()
  const createCategory = useCreateExpenseCategory()
  const updateCategory = useUpdateExpenseCategory()
  const deleteCategory = useDeleteExpenseCategory()

  const { data: investmentTypes, isLoading: loadingInvestment } = useInvestmentTypes()
  const createType = useCreateInvestmentType()
  const updateType = useUpdateInvestmentType()
  const deleteType = useDeleteInvestmentType()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <LookupList
        title="Income Sources"
        items={incomeSources}
        isLoading={loadingIncome}
        onCreate={(name) => createSource.mutate(name)}
        onUpdate={(id, name) => updateSource.mutate({ id, name })}
        onDelete={(id) =>
          deleteSource.mutate(id, {
            onError: (err: unknown) => {
              const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
              setIncomeDeleteError(msg ?? 'Delete failed')
            },
          })
        }
        deleteError={incomeDeleteError}
        clearDeleteError={() => setIncomeDeleteError(null)}
      />

      <LookupList
        title="Expense Categories"
        items={expenseCategories}
        isLoading={loadingExpense}
        onCreate={(name) => createCategory.mutate(name)}
        onUpdate={(id, name) => updateCategory.mutate({ id, name })}
        onDelete={(id) =>
          deleteCategory.mutate(id, {
            onError: (err: unknown) => {
              const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
              setExpenseDeleteError(msg ?? 'Delete failed')
            },
          })
        }
        deleteError={expenseDeleteError}
        clearDeleteError={() => setExpenseDeleteError(null)}
      />

      <LookupList
        title="Investment Types"
        items={investmentTypes}
        isLoading={loadingInvestment}
        onCreate={(name) => createType.mutate(name)}
        onUpdate={(id, name) => updateType.mutate({ id, name })}
        onDelete={(id) =>
          deleteType.mutate(id, {
            onError: (err: unknown) => {
              const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
              setInvestmentDeleteError(msg ?? 'Delete failed')
            },
          })
        }
        deleteError={investmentDeleteError}
        clearDeleteError={() => setInvestmentDeleteError(null)}
      />
    </div>
  )
}
