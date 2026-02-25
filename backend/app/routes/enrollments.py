from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("/", response_model=schemas.EnrollmentResponse)
def enroll(enroll: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    db_enroll = models.Enrollment(**enroll.dict())
    db.add(db_enroll)
    db.commit()
    db.refresh(db_enroll)
    return db_enroll