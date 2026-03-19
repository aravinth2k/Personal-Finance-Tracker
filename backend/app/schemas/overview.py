from pydantic import BaseModel

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


class MonthSummary(BaseModel):
    month: int
    month_name: str
    income: float
    expenses: float
    investments: float
    net_savings: float


class ExpenseByCategory(BaseModel):
    category_name: str
    amount: float


class YearlyOverview(BaseModel):
    year: int
    total_income: float
    total_expenses: float
    total_investments: float
    net_savings: float
    months: list[MonthSummary]
    expense_by_category: list[ExpenseByCategory]


class MonthlyOverview(BaseModel):
    month: int
    year: int
    total_income: float
    total_expenses: float
    total_investments: float
    net_savings: float
