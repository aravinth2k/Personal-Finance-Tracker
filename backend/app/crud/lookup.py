import uuid

from sqlalchemy.orm import Session

from app.models.lookup import ExpenseCategory, IncomeSource, InvestmentType
from app.schemas.lookup import LookupCreate, LookupUpdate

# ── Default seed data ─────────────────────────────────────────────────────────

DEFAULT_INCOME_SOURCES = [
    "Salary", "Freelance", "Bonus", "Dividend",
    "Bond Interest", "Investment Returns", "Other",
]

DEFAULT_EXPENSE_CATEGORIES = [
    "Food & Dining", "Rent/Housing", "Transportation", "Healthcare",
    "Shopping", "Entertainment", "Utilities", "Insurance", "Travel",
    "Tour", "Self Care", "Self Development", "Internet Bill",
    "Parents Health", "Parents Household", "Donation",
    "Wedding/Birthday Gift", "Other",
]

DEFAULT_INVESTMENT_TYPES = [
    "Stocks", "Mutual Fund", "Gold", "Bonds", "PPF", "Index SENSEX",
]


def seed_default_lookups(db: Session, user_id: uuid.UUID) -> None:
    for name in DEFAULT_INCOME_SOURCES:
        db.add(IncomeSource(user_id=user_id, name=name, is_default=True))
    for name in DEFAULT_EXPENSE_CATEGORIES:
        db.add(ExpenseCategory(user_id=user_id, name=name, is_default=True))
    for name in DEFAULT_INVESTMENT_TYPES:
        db.add(InvestmentType(user_id=user_id, name=name, is_default=True))
    db.commit()


# ── Income Sources ────────────────────────────────────────────────────────────

def get_income_sources(db: Session, user_id: uuid.UUID) -> list[IncomeSource]:
    return (
        db.query(IncomeSource)
        .filter(IncomeSource.user_id == user_id)
        .order_by(IncomeSource.created_at)
        .all()
    )


def create_income_source(db: Session, data: LookupCreate, user_id: uuid.UUID) -> IncomeSource:
    obj = IncomeSource(user_id=user_id, name=data.name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_income_source(
    db: Session, source_id: uuid.UUID, data: LookupUpdate, user_id: uuid.UUID
) -> IncomeSource | None:
    obj = db.query(IncomeSource).filter(
        IncomeSource.id == source_id, IncomeSource.user_id == user_id
    ).first()
    if not obj:
        return None
    obj.name = data.name
    db.commit()
    db.refresh(obj)
    return obj


def delete_income_source(
    db: Session, source_id: uuid.UUID, user_id: uuid.UUID
) -> bool | None:
    obj = db.query(IncomeSource).filter(
        IncomeSource.id == source_id, IncomeSource.user_id == user_id
    ).first()
    if not obj:
        return None
    from app.models.income import Income
    if db.query(Income).filter(Income.income_source_id == source_id).count() > 0:
        raise ValueError("Cannot delete: existing income entries reference this source")
    db.delete(obj)
    db.commit()
    return True


# ── Expense Categories ────────────────────────────────────────────────────────

def get_expense_categories(db: Session, user_id: uuid.UUID) -> list[ExpenseCategory]:
    return (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == user_id)
        .order_by(ExpenseCategory.created_at)
        .all()
    )


def create_expense_category(db: Session, data: LookupCreate, user_id: uuid.UUID) -> ExpenseCategory:
    obj = ExpenseCategory(user_id=user_id, name=data.name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_expense_category(
    db: Session, cat_id: uuid.UUID, data: LookupUpdate, user_id: uuid.UUID
) -> ExpenseCategory | None:
    obj = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == cat_id, ExpenseCategory.user_id == user_id
    ).first()
    if not obj:
        return None
    obj.name = data.name
    db.commit()
    db.refresh(obj)
    return obj


def delete_expense_category(
    db: Session, cat_id: uuid.UUID, user_id: uuid.UUID
) -> bool | None:
    obj = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == cat_id, ExpenseCategory.user_id == user_id
    ).first()
    if not obj:
        return None
    from app.models.expense import Expense
    if db.query(Expense).filter(Expense.expense_category_id == cat_id).count() > 0:
        raise ValueError("Cannot delete: existing expense entries reference this category")
    db.delete(obj)
    db.commit()
    return True


# ── Investment Types ──────────────────────────────────────────────────────────

def get_investment_types(db: Session, user_id: uuid.UUID) -> list[InvestmentType]:
    return (
        db.query(InvestmentType)
        .filter(InvestmentType.user_id == user_id)
        .order_by(InvestmentType.created_at)
        .all()
    )


def create_investment_type(db: Session, data: LookupCreate, user_id: uuid.UUID) -> InvestmentType:
    obj = InvestmentType(user_id=user_id, name=data.name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_investment_type(
    db: Session, type_id: uuid.UUID, data: LookupUpdate, user_id: uuid.UUID
) -> InvestmentType | None:
    obj = db.query(InvestmentType).filter(
        InvestmentType.id == type_id, InvestmentType.user_id == user_id
    ).first()
    if not obj:
        return None
    obj.name = data.name
    db.commit()
    db.refresh(obj)
    return obj


def delete_investment_type(
    db: Session, type_id: uuid.UUID, user_id: uuid.UUID
) -> bool | None:
    obj = db.query(InvestmentType).filter(
        InvestmentType.id == type_id, InvestmentType.user_id == user_id
    ).first()
    if not obj:
        return None
    from app.models.investment import Investment
    if db.query(Investment).filter(Investment.investment_type_id == type_id).count() > 0:
        raise ValueError("Cannot delete: existing investment entries reference this type")
    db.delete(obj)
    db.commit()
    return True
