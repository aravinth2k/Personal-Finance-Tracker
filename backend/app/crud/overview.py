import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income
from app.models.investment import Investment
from app.models.lookup import ExpenseCategory
from app.schemas.overview import (
    ExpenseByCategory,
    MonthlyOverview,
    MonthSummary,
    MONTH_NAMES,
    YearlyOverview,
)


def get_yearly_overview(db: Session, user_id: uuid.UUID, year: int) -> YearlyOverview:
    # Aggregate income by month
    income_rows = (
        db.query(Income.month, func.sum(Income.amount).label("total"))
        .filter(Income.user_id == user_id, Income.year == year)
        .group_by(Income.month)
        .all()
    )
    # Aggregate expenses by month
    expense_rows = (
        db.query(Expense.month, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == user_id, Expense.year == year)
        .group_by(Expense.month)
        .all()
    )
    # Aggregate investments by month
    investment_rows = (
        db.query(Investment.month, func.sum(Investment.amount).label("total"))
        .filter(Investment.user_id == user_id, Investment.year == year)
        .group_by(Investment.month)
        .all()
    )
    # Expenses grouped by category name
    category_rows = (
        db.query(ExpenseCategory.name, func.sum(Expense.amount).label("total"))
        .join(Expense, Expense.expense_category_id == ExpenseCategory.id)
        .filter(Expense.user_id == user_id, Expense.year == year)
        .group_by(ExpenseCategory.name)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    income_map = {r.month: float(r.total) for r in income_rows}
    expense_map = {r.month: float(r.total) for r in expense_rows}
    investment_map = {r.month: float(r.total) for r in investment_rows}

    months = []
    for m in range(1, 13):
        inc = income_map.get(m, 0.0)
        exp = expense_map.get(m, 0.0)
        inv = investment_map.get(m, 0.0)
        months.append(
            MonthSummary(
                month=m,
                month_name=MONTH_NAMES[m - 1],
                income=inc,
                expenses=exp,
                investments=inv,
                net_savings=inc - exp - inv,
            )
        )

    total_income = sum(income_map.values())
    total_expenses = sum(expense_map.values())
    total_investments = sum(investment_map.values())

    return YearlyOverview(
        year=year,
        total_income=total_income,
        total_expenses=total_expenses,
        total_investments=total_investments,
        net_savings=total_income - total_expenses - total_investments,
        months=months,
        expense_by_category=[
            ExpenseByCategory(category_name=r.name, amount=float(r.total))
            for r in category_rows
        ],
    )


def get_monthly_overview(
    db: Session, user_id: uuid.UUID, month: int, year: int
) -> MonthlyOverview:
    def _sum(model, amount_col):
        row = (
            db.query(func.sum(amount_col).label("total"))
            .filter(model.user_id == user_id, model.month == month, model.year == year)
            .first()
        )
        return float(row.total or 0)

    inc = _sum(Income, Income.amount)
    exp = _sum(Expense, Expense.amount)
    inv = _sum(Investment, Investment.amount)

    return MonthlyOverview(
        month=month,
        year=year,
        total_income=inc,
        total_expenses=exp,
        total_investments=inv,
        net_savings=inc - exp - inv,
    )
