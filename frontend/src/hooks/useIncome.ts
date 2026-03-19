import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { incomeApi } from '@/api/income'
import type { IncomeCreate, IncomeUpdate } from '@/types/finance'

export function useIncome(month: number, year: number) {
  return useQuery({
    queryKey: ['income', month, year],
    queryFn: () => incomeApi.list(month, year),
  })
}

export function useCreateIncome(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: IncomeCreate) => incomeApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income', month, year] }),
  })
}

export function useUpdateIncome(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncomeUpdate }) => incomeApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income', month, year] }),
  })
}

export function useDeleteIncome(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income', month, year] }),
  })
}
