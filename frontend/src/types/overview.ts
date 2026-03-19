export interface MonthSummary {
  month: number
  month_name: string
  income: number
  expenses: number
  investments: number
  net_savings: number
}

export interface ExpenseByCategory {
  category_name: string
  amount: number
}

export interface ExpenseByType {
  expense_type: string
  amount: number
}

export interface InvestmentByRisk {
  risk_type: string
  amount: number
}

export interface InvestmentByType {
  investment_type_name: string
  amount: number
}

export interface YearlyOverview {
  year: number
  total_income: number
  total_expenses: number
  total_investments: number
  net_savings: number
  months: MonthSummary[]
  expense_by_category: ExpenseByCategory[]
  expense_by_type: ExpenseByType[]
  investment_by_risk: InvestmentByRisk[]
  investment_by_type: InvestmentByType[]
}
