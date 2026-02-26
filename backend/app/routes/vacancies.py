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


# =====================================
# Get all vacancies (pagination)
# =====================================
@router.get("/", response_model=List[schemas.VacancyResponse])
def get_vacancies(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    vacancies = db.query(models.Vacancy).offset(skip).limit(limit).all()
    return vacancies


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

    return vacancy


# =====================================
# Create vacancy
# =====================================
@router.post(
    "/",
    response_model=schemas.VacancyResponse,
    status_code=status.HTTP_201_CREATED
)
def create_vacancy(
    vacancy: schemas.VacancyCreate,
    db: Session = Depends(get_db)
):
    db_vac = models.Vacancy(**vacancy.dict())

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

    return db_vac


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

    update_data = vacancy_update.dict(exclude_unset=True)

    for key, value in update_data.items():
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

    return db_vac


# =====================================
# Delete vacancy
# =====================================
@router.delete(
    "/{vacancy_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
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