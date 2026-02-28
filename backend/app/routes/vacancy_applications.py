# app/routes/vacancy_applications.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/vacancy-applications",
    tags=["Vacancy Applications"]
)


@router.get("/", response_model=List[schemas.VacancyApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    applications = db.query(models.VacancyApplication).order_by(
        models.VacancyApplication.created_at.desc()
    ).all()
    
    # Vakansiya nomlarini qo'shish
    result = []
    for app in applications:
        app_dict = {
            "id": app.id,
            "full_name": app.full_name,
            "phone": app.phone,
            "education": app.education,
            "certificates": json.loads(app.certificates) if app.certificates else [],
            "certificate_level": app.certificate_level,
            "vacancy_id": app.vacancy_id,
            "status": app.status,
            "notes": app.notes,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "vacancy_title": app.vacancy.title if app.vacancy else None
        }
        result.append(app_dict)
    
    return result


@router.get("/{app_id}", response_model=schemas.VacancyApplicationResponse)
def get_application(app_id: int, db: Session = Depends(get_db)):
    app = db.get(models.VacancyApplication, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    
    return {
        "id": app.id,
        "full_name": app.full_name,
        "phone": app.phone,
        "education": app.education,
        "certificates": json.loads(app.certificates) if app.certificates else [],
        "certificate_level": app.certificate_level,
        "vacancy_id": app.vacancy_id,
        "status": app.status,
        "notes": app.notes,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
        "vacancy_title": app.vacancy.title if app.vacancy else None
    }


@router.post("/", response_model=schemas.VacancyApplicationResponse, status_code=201)
def create_application(
    application: schemas.VacancyApplicationCreate,
    db: Session = Depends(get_db)
):
    # Vakansiya mavjudligini tekshirish
    vacancy = db.get(models.Vacancy, application.vacancy_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vakansiya topilmadi")

    # Certificates ni JSON string ga aylantirish
    app_data = application.dict()
    app_data["certificates"] = json.dumps(application.certificates)

    db_app = models.VacancyApplication(**app_data)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    
    return {
        "id": db_app.id,
        "full_name": db_app.full_name,
        "phone": db_app.phone,
        "education": db_app.education,
        "certificates": json.loads(db_app.certificates) if db_app.certificates else [],
        "certificate_level": db_app.certificate_level,
        "vacancy_id": db_app.vacancy_id,
        "status": db_app.status,
        "notes": db_app.notes,
        "created_at": db_app.created_at,
        "updated_at": db_app.updated_at,
        "vacancy_title": vacancy.title
    }


@router.patch("/{app_id}", response_model=schemas.VacancyApplicationResponse)
def update_application(
    app_id: int,
    update: schemas.VacancyApplicationUpdate,
    db: Session = Depends(get_db)
):
    db_app = db.get(models.VacancyApplication, app_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(db_app, key, value)

    db.commit()
    db.refresh(db_app)
    
    return {
        "id": db_app.id,
        "full_name": db_app.full_name,
        "phone": db_app.phone,
        "education": db_app.education,
        "certificates": json.loads(db_app.certificates) if db_app.certificates else [],
        "certificate_level": db_app.certificate_level,
        "vacancy_id": db_app.vacancy_id,
        "status": db_app.status,
        "notes": db_app.notes,
        "created_at": db_app.created_at,
        "updated_at": db_app.updated_at,
        "vacancy_title": db_app.vacancy.title if db_app.vacancy else None
    }


@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    db_app = db.get(models.VacancyApplication, app_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    db.delete(db_app)
    db.commit()
    return None