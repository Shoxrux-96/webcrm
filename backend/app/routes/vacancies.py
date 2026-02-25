from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/vacancies", tags=["vacancies"])

@router.get("/", response_model=list[schemas.VacancyResponse])
def get_vacancies(db: Session = Depends(get_db)):
    return db.query(models.Vacancy).all()


@router.post("/", response_model=schemas.VacancyResponse)
def create_vacancy(vacancy: schemas.VacancyCreate, db: Session = Depends(get_db)):
    db_vac = models.Vacancy(**vacancy.dict())
    db.add(db_vac)
    db.commit()
    db.refresh(db_vac)
    return db_vac


@router.delete("/{vacancy_id}")
def delete_vacancy(vacancy_id: int, db: Session = Depends(get_db)):
    vac = db.query(models.Vacancy).get(vacancy_id)
    if vac:
        db.delete(vac)
        db.commit()
    return {"message": "deleted"}