import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import investment as crud
from app.models.user import User
from app.schemas.investment import InvestmentCreate, InvestmentOut, InvestmentUpdate

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.get("/", response_model=list[InvestmentOut])
def list_investments(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_investment_list(db, current_user.id, month, year)


@router.post("/", response_model=InvestmentOut, status_code=status.HTTP_201_CREATED)
def create_investment(
    data: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_investment(db, data, current_user.id)


@router.put("/{id}", response_model=InvestmentOut)
def update_investment(
    id: uuid.UUID,
    data: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = crud.update_investment(db, id, data, current_user.id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment entry not found")
    return obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not crud.delete_investment(db, id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment entry not found")
