import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { investmentsApi } from '@/api/investments'
import type { InvestmentCreate, InvestmentUpdate } from '@/types/finance'

export function useInvestments(month: number, year: number) {
  return useQuery({
    queryKey: ['investments', month, year],
    queryFn: () => investmentsApi.list(month, year),
  })
}

export function useCreateInvestment(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: InvestmentCreate) => investmentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments', month, year] }),
  })
}

export function useUpdateInvestment(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvestmentUpdate }) =>
      investmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments', month, year] }),
  })
}

export function useDeleteInvestment(month: number, year: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => investmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments', month, year] }),
  })
}
