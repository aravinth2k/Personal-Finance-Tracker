import client from './client'
import type { Investment, InvestmentCreate, InvestmentUpdate } from '@/types/finance'

export const investmentsApi = {
  list: (month: number, year: number) =>
    client.get<Investment[]>('/investments/', { params: { month, year } }).then((r) => r.data),
  create: (data: InvestmentCreate) =>
    client.post<Investment>('/investments/', data).then((r) => r.data),
  update: (id: string, data: InvestmentUpdate) =>
    client.put<Investment>(`/investments/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    client.delete(`/investments/${id}`),
}
