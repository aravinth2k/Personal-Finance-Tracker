from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud.overview import get_monthly_overview, get_yearly_overview
from app.models.user import User
from app.schemas.overview import MonthlyOverview, YearlyOverview

router = APIRouter(prefix="/overview", tags=["Overview"])


@router.get("/", response_model=YearlyOverview)
def yearly_overview(
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_yearly_overview(db, current_user.id, year)


@router.get("/month", response_model=MonthlyOverview)
def monthly_overview(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monthly_overview(db, current_user.id, month, year)
