import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/api/settings'

// ── Income Sources ────────────────────────────────────────────────────────────

export function useIncomeSources() {
  return useQuery({ queryKey: ['income-sources'], queryFn: settingsApi.getIncomeSources })
}

export function useCreateIncomeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => settingsApi.createIncomeSource(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income-sources'] }),
  })
}

export function useUpdateIncomeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      settingsApi.updateIncomeSource(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income-sources'] }),
  })
}

export function useDeleteIncomeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteIncomeSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income-sources'] }),
  })
}

// ── Expense Categories ────────────────────────────────────────────────────────

export function useExpenseCategories() {
  return useQuery({ queryKey: ['expense-categories'], queryFn: settingsApi.getExpenseCategories })
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => settingsApi.createExpenseCategory(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
  })
}

export function useUpdateExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      settingsApi.updateExpenseCategory(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
  })
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteExpenseCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
  })
}

// ── Investment Types ──────────────────────────────────────────────────────────

export function useInvestmentTypes() {
  return useQuery({ queryKey: ['investment-types'], queryFn: settingsApi.getInvestmentTypes })
}

export function useCreateInvestmentType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => settingsApi.createInvestmentType(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment-types'] }),
  })
}

export function useUpdateInvestmentType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      settingsApi.updateInvestmentType(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment-types'] }),
  })
}

export function useDeleteInvestmentType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteInvestmentType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment-types'] }),
  })
}
