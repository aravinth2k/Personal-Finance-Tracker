import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import income as crud
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeOut, IncomeUpdate

router = APIRouter(prefix="/income", tags=["Income"])


@router.get("/", response_model=list[IncomeOut])
def list_income(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_income_list(db, current_user.id, month, year)


@router.post("/", response_model=IncomeOut, status_code=status.HTTP_201_CREATED)
def create_income(
    data: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_income(db, data, current_user.id)


@router.put("/{id}", response_model=IncomeOut)
def update_income(
    id: uuid.UUID,
    data: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = crud.update_income(db, id, data, current_user.id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found")
    return obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not crud.delete_income(db, id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found")
