import uuid

from sqlalchemy.orm import Session

from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeUpdate


def get_income_list(db: Session, user_id: uuid.UUID, month: int, year: int) -> list[Income]:
    return (
        db.query(Income)
        .filter(Income.user_id == user_id, Income.month == month, Income.year == year)
        .order_by(Income.date.desc())
        .all()
    )


def create_income(db: Session, data: IncomeCreate, user_id: uuid.UUID) -> Income:
    obj = Income(
        user_id=user_id,
        name=data.name,
        amount=data.amount,
        date=data.date,
        month=data.date.month,
        year=data.date.year,
        income_source_id=data.income_source_id,
        description=data.description,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_income(db: Session, income_id: uuid.UUID, user_id: uuid.UUID) -> Income | None:
    return db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()


def update_income(
    db: Session, income_id: uuid.UUID, data: IncomeUpdate, user_id: uuid.UUID
) -> Income | None:
    obj = get_income(db, income_id, user_id)
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


def delete_income(db: Session, income_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    obj = get_income(db, income_id, user_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
