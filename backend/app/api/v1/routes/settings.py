import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import lookup as crud
from app.models.user import User
from app.schemas.lookup import LookupCreate, LookupOut, LookupUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


# ── Income Sources ────────────────────────────────────────────────────────────

@router.get("/income-sources", response_model=list[LookupOut])
def list_income_sources(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.get_income_sources(db, current_user.id)


@router.post("/income-sources", response_model=LookupOut, status_code=status.HTTP_201_CREATED)
def create_income_source(
    data: LookupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_income_source(db, data, current_user.id)


@router.put("/income-sources/{id}", response_model=LookupOut)
def update_income_source(
    id: uuid.UUID,
    data: LookupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = crud.update_income_source(db, id, data, current_user.id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source not found")
    return obj


@router.delete("/income-sources/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income_source(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = crud.delete_income_source(db, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source not found")


# ── Expense Categories ────────────────────────────────────────────────────────

@router.get("/expense-categories", response_model=list[LookupOut])
def list_expense_categories(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.get_expense_categories(db, current_user.id)


@router.post("/expense-categories", response_model=LookupOut, status_code=status.HTTP_201_CREATED)
def create_expense_category(
    data: LookupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_expense_category(db, data, current_user.id)


@router.put("/expense-categories/{id}", response_model=LookupOut)
def update_expense_category(
    id: uuid.UUID,
    data: LookupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = crud.update_expense_category(db, id, data, current_user.id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense category not found")
    return obj


@router.delete("/expense-categories/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_category(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = crud.delete_expense_category(db, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense category not found")


# ── Investment Types ──────────────────────────────────────────────────────────

@router.get("/investment-types", response_model=list[LookupOut])
def list_investment_types(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.get_investment_types(db, current_user.id)


@router.post("/investment-types", response_model=LookupOut, status_code=status.HTTP_201_CREATED)
def create_investment_type(
    data: LookupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.create_investment_type(db, data, current_user.id)


@router.put("/investment-types/{id}", response_model=LookupOut)
def update_investment_type(
    id: uuid.UUID,
    data: LookupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = crud.update_investment_type(db, id, data, current_user.id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment type not found")
    return obj


@router.delete("/investment-types/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment_type(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = crud.delete_investment_type(db, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment type not found")
