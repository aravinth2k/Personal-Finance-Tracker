import uuid
from datetime import datetime

from pydantic import BaseModel


class LookupCreate(BaseModel):
    name: str


class LookupUpdate(BaseModel):
    name: str


class LookupOut(BaseModel):
    id: uuid.UUID
    name: str
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}
