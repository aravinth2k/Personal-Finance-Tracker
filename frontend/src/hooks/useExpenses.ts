import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { expensesApi } from '@/api/expenses'
import type { ExpenseCreate, ExpenseUpdate } from '@/types/finance'

export function useExpenses(month: number, year: number) {
  return useQuery({
    queryKey: ['expenses', month, year],
    queryFn: () => expensesApi.list(month, year),
  })
}

export function useCreateExpense(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ExpenseCreate) => expensesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', month, year] }),
  })
}

export function useUpdateExpense(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseUpdate }) => expensesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', month, year] }),
  })
}

export function useDeleteExpense(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', month, year] }),
  })
}
