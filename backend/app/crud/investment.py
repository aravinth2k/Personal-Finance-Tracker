import uuid

from sqlalchemy.orm import Session

from app.models.investment import Investment
from app.schemas.investment import InvestmentCreate, InvestmentUpdate


def get_investment_list(db: Session, user_id: uuid.UUID, month: int, year: int) -> list[Investment]:
    return (
        db.query(Investment)
        .filter(Investment.user_id == user_id, Investment.month == month, Investment.year == year)
        .order_by(Investment.date.desc())
        .all()
    )


def create_investment(db: Session, data: InvestmentCreate, user_id: uuid.UUID) -> Investment:
    obj = Investment(
        user_id=user_id,
        name=data.name,
        amount=data.amount,
        date=data.date,
        month=data.date.month,
        year=data.date.year,
        investment_type_id=data.investment_type_id,
        risk_type=data.risk_type,
        description=data.description,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_investment(db: Session, inv_id: uuid.UUID, user_id: uuid.UUID) -> Investment | None:
    return db.query(Investment).filter(Investment.id == inv_id, Investment.user_id == user_id).first()


def update_investment(
    db: Session, inv_id: uuid.UUID, data: InvestmentUpdate, user_id: uuid.UUID
) -> Investment | None:
    obj = get_investment(db, inv_id, user_id)
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


def delete_investment(db: Session, inv_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    obj = get_investment(db, inv_id, user_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
