import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, field_serializer

ExpenseType = Literal["Need", "Want"]


class ExpenseCreate(BaseModel):
    name: str
    amount: Decimal
    date: date
    expense_category_id: uuid.UUID
    expense_type: ExpenseType
    description: Optional[str] = None


class ExpenseUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[date] = None
    expense_category_id: Optional[uuid.UUID] = None
    expense_type: Optional[ExpenseType] = None
    description: Optional[str] = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    name: str
    amount: Decimal
    date: date
    month: int
    year: int
    expense_category_id: uuid.UUID
    expense_type: str
    description: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("amount")
    def serialize_amount(self, v: Decimal) -> float:
        return float(v)
