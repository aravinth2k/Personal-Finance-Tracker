import uuid

from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def get_expense_list(db: Session, user_id: uuid.UUID, month: int, year: int) -> list[Expense]:
    return (
        db.query(Expense)
        .filter(Expense.user_id == user_id, Expense.month == month, Expense.year == year)
        .order_by(Expense.date.desc())
        .all()
    )


def create_expense(db: Session, data: ExpenseCreate, user_id: uuid.UUID) -> Expense:
    obj = Expense(
        user_id=user_id,
        name=data.name,
        amount=data.amount,
        date=data.date,
        month=data.date.month,
        year=data.date.year,
        expense_category_id=data.expense_category_id,
        expense_type=data.expense_type,
        description=data.description,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_expense(db: Session, expense_id: uuid.UUID, user_id: uuid.UUID) -> Expense | None:
    return db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()


def update_expense(
    db: Session, expense_id: uuid.UUID, data: ExpenseUpdate, user_id: uuid.UUID
) -> Expense | None:
    obj = get_expense(db, expense_id, user_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    if data.date is not None:
        obj.month = data.date.month
        obj.year = data.date.year
    db.commit()
    db.refresh(obj)
    return obj


def delete_expense(db: Session, expense_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    obj = get_expense(db, expense_id, user_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
