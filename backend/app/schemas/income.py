import uuid
import datetime
from typing import Optional

from pydantic import BaseModel, field_serializer
from decimal import Decimal


class IncomeCreate(BaseModel):
    name: str
    amount: Decimal
    date: datetime.date
    income_source_id: uuid.UUID
    description: Optional[str] = None


class IncomeUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[datetime.date] = None
    income_source_id: Optional[uuid.UUID] = None
    description: Optional[str] = None


class IncomeOut(BaseModel):
    id: uuid.UUID
    name: str
    amount: Decimal
    date: datetime.date
    month: int
    year: int
    income_source_id: uuid.UUID
    description: Optional[str]
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

    @field_serializer("amount")
    def serialize_amount(self, v: Decimal) -> float:
        return float(v)
