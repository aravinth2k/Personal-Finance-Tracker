export interface IncomeSource {
  id: string
  name: string
  is_default: boolean
  created_at: string
}

export interface ExpenseCategory {
  id: string
  name: string
  is_default: boolean
  created_at: string
}

export interface InvestmentType {
  id: string
  name: string
  is_default: boolean
  created_at: string
}

export interface Income {
  id: string
  name: string
  amount: number
  date: string
  month: number
  year: number
  income_source_id: string
  description: string | null
  created_at: string
}

export interface IncomeCreate {
  name: string
  amount: number
  date: string
  income_source_id: string
  description?: string
}

export interface IncomeUpdate {
  name?: string
  amount?: number
  date?: string
  income_source_id?: string
  description?: string
}

export interface Expense {
  id: string
  name: string
  amount: number
  date: string
  month: number
  year: number
  expense_category_id: string
  expense_type: 'Need' | 'Want'
  description: string | null
  created_at: string
}

export interface ExpenseCreate {
  name: string
  amount: number
  date: string
  expense_category_id: string
  expense_type: 'Need' | 'Want'
  description?: string
}

export interface ExpenseUpdate {
  name?: string
  amount?: number
  date?: string
  expense_category_id?: string
  expense_type?: 'Need' | 'Want'
  description?: string
}

export interface Investment {
  id: string
  name: string
  amount: number
  date: string
  month: number
  year: number
  investment_type_id: string
  risk_type: 'Low' | 'Medium' | 'High' | 'Very High'
  description: string | null
  created_at: string
}

export interface InvestmentCreate {
  name: string
  amount: number
  date: string
  investment_type_id: string
  risk_type: 'Low' | 'Medium' | 'High' | 'Very High'
  description?: string
}

export interface InvestmentUpdate {
  name?: string
  amount?: number
  date?: string
  investment_type_id?: string
  risk_type?: 'Low' | 'Medium' | 'High' | 'Very High'
  description?: string
}
