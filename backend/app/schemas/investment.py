import uuid
import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, field_serializer

RiskType = Literal["Low", "Medium", "High", "Very High"]


class InvestmentCreate(BaseModel):
    name: str
    amount: Decimal
    date: datetime.date
    investment_type_id: uuid.UUID
    risk_type: RiskType
    description: Optional[str] = None


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[datetime.date] = None
    investment_type_id: Optional[uuid.UUID] = None
    risk_type: Optional[RiskType] = None
    description: Optional[str] = None


class InvestmentOut(BaseModel):
    id: uuid.UUID
    name: str
    amount: Decimal
    date: datetime.date
    month: int
    year: int
    investment_type_id: uuid.UUID
    risk_type: str
    description: Optional[str]
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

    @field_serializer("amount")
    def serialize_amount(self, v: Decimal) -> float:
        return float(v)
