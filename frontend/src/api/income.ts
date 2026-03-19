import client from './client'
import type { Income, IncomeCreate, IncomeUpdate } from '@/types/finance'

export const incomeApi = {
  list: (month: number, year: number) =>
    client.get<Income[]>('/income/', { params: { month, year } }).then((r) => r.data),
  create: (data: IncomeCreate) =>
    client.post<Income>('/income/', data).then((r) => r.data),
  update: (id: string, data: IncomeUpdate) =>
    client.put<Income>(`/income/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    client.delete(`/income/${id}`),
}
