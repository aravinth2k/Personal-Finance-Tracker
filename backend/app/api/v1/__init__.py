from fastapi import APIRouter

from app.api.v1.routes import auth, expenses, income, investments, settings

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(settings.router)
api_router.include_router(income.router)
api_router.include_router(expenses.router)
api_router.include_router(investments.router)
