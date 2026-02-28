import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/vacancies",
    tags=["Vacancies"]
)


# ─── Helper: DB object → dict (requirements: str → list) ───
def _serialize(v: models.Vacancy) -> dict:
    data = {c.name: getattr(v, c.name) for c in v.__table__.columns}
    try:
        data["requirements"] = json.loads(data["requirements"] or "[]")
    except Exception:
        data["requirements"] = []
    return data


# =====================================
# Get all vacancies
# =====================================
@router.get("/", response_model=List[schemas.VacancyResponse])
def get_vacancies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    vacancies = db.query(models.Vacancy).offset(skip).limit(limit).all()
    return [_serialize(v) for v in vacancies]


# =====================================
# Get vacancy by ID
# =====================================
@router.get("/{vacancy_id}", response_model=schemas.VacancyResponse)
def get_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db)
):
    vacancy = db.get(models.Vacancy, vacancy_id)
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )
    return _serialize(vacancy)


# =====================================
# Create vacancy
# =====================================
@router.post("/", response_model=schemas.VacancyResponse, status_code=status.HTTP_201_CREATED)
def create_vacancy(
    vacancy: schemas.VacancyCreate,
    db: Session = Depends(get_db)
):
    data = vacancy.dict()
    data["requirements"] = json.dumps(data.get("requirements") or [])

    db_vac = models.Vacancy(**data)
    db.add(db_vac)

    try:
        db.commit()
        db.refresh(db_vac)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vacancy creation error"
        )

    return _serialize(db_vac)


# =====================================
# Update vacancy
# =====================================
@router.put("/{vacancy_id}", response_model=schemas.VacancyResponse)
def update_vacancy(
    vacancy_id: int,
    vacancy_update: schemas.VacancyCreate,
    db: Session = Depends(get_db)
):
    db_vac = db.get(models.Vacancy, vacancy_id)
    if not db_vac:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )

    data = vacancy_update.dict()
    data["requirements"] = json.dumps(data.get("requirements") or [])

    for key, value in data.items():
        setattr(db_vac, key, value)

    try:
        db.commit()
        db.refresh(db_vac)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vacancy update error"
        )

    return _serialize(db_vac)


# =====================================
# Delete vacancy
# =====================================
@router.delete("/{vacancy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db)
):
    vacancy = db.get(models.Vacancy, vacancy_id)
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )

    db.delete(vacancy)
    db.commit()
    return None