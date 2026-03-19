import client from './client'
import type { Expense, ExpenseCreate, ExpenseUpdate } from '@/types/finance'

export const expensesApi = {
  list: (month: number, year: number) =>
    client.get<Expense[]>('/expenses/', { params: { month, year } }).then((r) => r.data),
  create: (data: ExpenseCreate) =>
    client.post<Expense>('/expenses/', data).then((r) => r.data),
  update: (id: string, data: ExpenseUpdate) =>
    client.put<Expense>(`/expenses/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    client.delete(`/expenses/${id}`),
}
