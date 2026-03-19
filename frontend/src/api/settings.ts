import client from './client'
import type { ExpenseCategory, IncomeSource, InvestmentType } from '@/types/finance'

export const settingsApi = {
  // Income Sources
  getIncomeSources: () =>
    client.get<IncomeSource[]>('/settings/income-sources').then((r) => r.data),
  createIncomeSource: (name: string) =>
    client.post<IncomeSource>('/settings/income-sources', { name }).then((r) => r.data),
  updateIncomeSource: (id: string, name: string) =>
    client.put<IncomeSource>(`/settings/income-sources/${id}`, { name }).then((r) => r.data),
  deleteIncomeSource: (id: string) =>
    client.delete(`/settings/income-sources/${id}`),

  // Expense Categories
  getExpenseCategories: () =>
    client.get<ExpenseCategory[]>('/settings/expense-categories').then((r) => r.data),
  createExpenseCategory: (name: string) =>
    client.post<ExpenseCategory>('/settings/expense-categories', { name }).then((r) => r.data),
  updateExpenseCategory: (id: string, name: string) =>
    client.put<ExpenseCategory>(`/settings/expense-categories/${id}`, { name }).then((r) => r.data),
  deleteExpenseCategory: (id: string) =>
    client.delete(`/settings/expense-categories/${id}`),

  // Investment Types
  getInvestmentTypes: () =>
    client.get<InvestmentType[]>('/settings/investment-types').then((r) => r.data),
  createInvestmentType: (name: string) =>
    client.post<InvestmentType>('/settings/investment-types', { name }).then((r) => r.data),
  updateInvestmentType: (id: string, name: string) =>
    client.put<InvestmentType>(`/settings/investment-types/${id}`, { name }).then((r) => r.data),
  deleteInvestmentType: (id: string) =>
    client.delete(`/settings/investment-types/${id}`),
}
