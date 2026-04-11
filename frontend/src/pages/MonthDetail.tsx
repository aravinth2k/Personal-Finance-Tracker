import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { useIncome, useCreateIncome, useUpdateIncome, useDeleteIncome } from '@/hooks/useIncome'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses'
import { useInvestments, useCreateInvestment, useUpdateInvestment, useDeleteInvestment } from '@/hooks/useInvestments'
import { useIncomeSources } from '@/hooks/useSettings'
import { useExpenseCategories } from '@/hooks/useSettings'
import { useInvestmentTypes } from '@/hooks/useSettings'

import type { Income, Expense, Investment } from '@/types/finance'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Income Tab ────────────────────────────────────────────────────────────────

const incomeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Must be positive'),
  date: z.string().min(1, 'Date is required'),
  income_source_id: z.string().min(1, 'Source is required'),
  description: z.string().optional(),
})
type IncomeForm = z.infer<typeof incomeSchema>

function IncomeTab({ month, year }: { month: number; year: number }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)

  const { data: entries = [], isLoading } = useIncome(month, year)
  const { data: sources = [] } = useIncomeSources()
  const create = useCreateIncome(month, year)
  const update = useUpdateIncome(month, year)
  const del = useDeleteIncome(month, year)

  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<IncomeForm>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { date: defaultDate },
  })

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          name: editing.name,
          amount: editing.amount,
          date: editing.date,
          income_source_id: editing.income_source_id,
          description: editing.description ?? ''
        })
      } else {
        reset({ date: defaultDate, name: '', amount: undefined as unknown as number, income_source_id: '', description: '' })
      }
    }
  }, [open, editing, reset, defaultDate])

  const openAdd = () => { setEditing(null); setOpen(true) }
  const openEdit = (e: Income) => { setEditing(e); setOpen(true) }

  const onSubmit = async (data: IncomeForm) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, data })
      else await create.mutateAsync(data)
      setOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const total = entries.reduce((s, e) => s + e.amount, 0)
  const sourceName = (id: string) => sources.find((s) => s.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Total: <span className="text-green-600 font-semibold">{formatCurrency(total)}</span></p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Income</Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No income entries for this month.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="text-green-600 font-medium">{formatCurrency(e.amount)}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(e.date)}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{sourceName(e.income_source_id)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del.mutate(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Income' : 'Add Income'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1"><Label>Amount (₹)</Label><Input type="number" step="0.01" {...register('amount')} />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
            <div className="space-y-1"><Label>Date</Label><Input type="date" {...register('date')} />{errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}</div>
            <div className="space-y-1">
              <Label>Source</Label>
              <Controller name="income_source_id" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>{sources.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.income_source_id && <p className="text-xs text-destructive">{errors.income_source_id.message}</p>}
            </div>
            <div className="space-y-1"><Label>Description <span className="text-muted-foreground">(optional)</span></Label><Textarea {...register('description')} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (editing ? 'Updating...' : 'Saving...') : (editing ? 'Update' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Expense Tab ───────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Must be positive'),
  date: z.string().min(1, 'Date is required'),
  expense_category_id: z.string().min(1, 'Category is required'),
  expense_type: z.enum(['Need', 'Want']),
  description: z.string().optional(),
})
type ExpenseForm = z.infer<typeof expenseSchema>

function ExpenseTab({ month, year }: { month: number; year: number }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  const { data: entries = [], isLoading } = useExpenses(month, year)
  const { data: categories = [] } = useExpenseCategories()
  const create = useCreateExpense(month, year)
  const update = useUpdateExpense(month, year)
  const del = useDeleteExpense(month, year)

  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: defaultDate, expense_type: 'Need' },
  })

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          name: editing.name,
          amount: editing.amount,
          date: editing.date,
          expense_category_id: editing.expense_category_id,
          expense_type: editing.expense_type,
          description: editing.description ?? ''
        })
      } else {
        reset({ date: defaultDate, name: '', amount: undefined as unknown as number, expense_category_id: '', expense_type: 'Need', description: '' })
      }
    }
  }, [open, editing, reset, defaultDate])

  const openAdd = () => { setEditing(null); setOpen(true) }
  const openEdit = (e: Expense) => { setEditing(e); setOpen(true) }

  const onSubmit = async (data: ExpenseForm) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, data })
      else await create.mutateAsync(data)
      setOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const total = entries.reduce((s, e) => s + e.amount, 0)
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Total: <span className="text-red-500 font-semibold">{formatCurrency(total)}</span></p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Expense</Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No expense entries for this month.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="text-red-500 font-medium">{formatCurrency(e.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{catName(e.expense_category_id)}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(e.date)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={e.expense_type === 'Need' ? 'info' : 'warning'}>{e.expense_type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del.mutate(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1"><Label>Amount (₹)</Label><Input type="number" step="0.01" {...register('amount')} />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Controller name="expense_category_id" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.expense_category_id && <p className="text-xs text-destructive">{errors.expense_category_id.message}</p>}
            </div>
            <div className="space-y-1"><Label>Date</Label><Input type="date" {...register('date')} /></div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Controller name="expense_type" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Need">Need</SelectItem>
                    <SelectItem value="Want">Want</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1"><Label>Description <span className="text-muted-foreground">(optional)</span></Label><Textarea {...register('description')} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (editing ? 'Updating...' : 'Saving...') : (editing ? 'Update' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Investment Tab ────────────────────────────────────────────────────────────

const investmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Must be positive'),
  date: z.string().min(1, 'Date is required'),
  investment_type_id: z.string().min(1, 'Type is required'),
  risk_type: z.enum(['Low', 'Medium', 'High', 'Very High']),
  description: z.string().optional(),
})
type InvestmentForm = z.infer<typeof investmentSchema>

const RISK_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'destructive'> = {
  Low: 'success', Medium: 'info', High: 'warning', 'Very High': 'destructive',
}

function InvestmentTab({ month, year }: { month: number; year: number }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)

  const { data: entries = [], isLoading } = useInvestments(month, year)
  const { data: types = [] } = useInvestmentTypes()
  const create = useCreateInvestment(month, year)
  const update = useUpdateInvestment(month, year)
  const del = useDeleteInvestment(month, year)

  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<InvestmentForm>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { date: defaultDate, risk_type: 'Medium' },
  })

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          name: editing.name,
          amount: editing.amount,
          date: editing.date,
          investment_type_id: editing.investment_type_id,
          risk_type: editing.risk_type,
          description: editing.description ?? ''
        })
      } else {
        reset({ date: defaultDate, name: '', amount: undefined as unknown as number, investment_type_id: '', risk_type: 'Medium', description: '' })
      }
    }
  }, [open, editing, reset, defaultDate])

  const openAdd = () => { setEditing(null); setOpen(true) }
  const openEdit = (e: Investment) => { setEditing(e); setOpen(true) }

  const onSubmit = async (data: InvestmentForm) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, data })
      else await create.mutateAsync(data)
      setOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const total = entries.reduce((s, e) => s + e.amount, 0)
  const typeName = (id: string) => types.find((t) => t.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Total: <span className="text-blue-600 font-semibold">{formatCurrency(total)}</span></p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Investment</Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No investment entries for this month.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Risk</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="text-blue-600 font-medium">{formatCurrency(e.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{typeName(e.investment_type_id)}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(e.date)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={RISK_VARIANTS[e.risk_type] ?? 'secondary'}>{e.risk_type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del.mutate(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Investment' : 'Add Investment'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1"><Label>Amount (₹)</Label><Input type="number" step="0.01" {...register('amount')} />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Controller name="investment_type_id" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.investment_type_id && <p className="text-xs text-destructive">{errors.investment_type_id.message}</p>}
            </div>
            <div className="space-y-1"><Label>Date</Label><Input type="date" {...register('date')} /></div>
            <div className="space-y-1">
              <Label>Risk Level</Label>
              <Controller name="risk_type" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Low', 'Medium', 'High', 'Very High'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1"><Label>Description <span className="text-muted-foreground">(optional)</span></Label><Textarea {...register('description')} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (editing ? 'Updating...' : 'Saving...') : (editing ? 'Update' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function MonthDetail() {
  const { year: yearStr, month: monthStr } = useParams<{ year: string; month: string }>()
  const navigate = useNavigate()

  const year = parseInt(yearStr ?? String(new Date().getFullYear()))
  const month = parseInt(monthStr ?? String(new Date().getMonth() + 1))

  const goToPrev = () => {
    if (month === 1) navigate(`/month/${year - 1}/12`)
    else navigate(`/month/${year}/${month - 1}`)
  }
  const goToNext = () => {
    if (month === 12) navigate(`/month/${year + 1}/1`)
    else navigate(`/month/${year}/${month + 1}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goToPrev}><ChevronLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold">{MONTHS[month - 1]} {year}</h1>
        <Button variant="ghost" size="icon" onClick={goToNext}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      <Tabs defaultValue="income">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="income" className="flex-1 sm:flex-none">Income</TabsTrigger>
          <TabsTrigger value="expenses" className="flex-1 sm:flex-none">Expenses</TabsTrigger>
          <TabsTrigger value="investments" className="flex-1 sm:flex-none">Investments</TabsTrigger>
        </TabsList>
        <TabsContent value="income"><IncomeTab month={month} year={year} /></TabsContent>
        <TabsContent value="expenses"><ExpenseTab month={month} year={year} /></TabsContent>
        <TabsContent value="investments"><InvestmentTab month={month} year={year} /></TabsContent>
      </Tabs>
    </div>
  )
}
