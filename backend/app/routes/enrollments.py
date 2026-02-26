from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/enrollments",
    tags=["Enrollments"]
)


# =====================================
# Get all enrollments
# =====================================
@router.get("/", response_model=List[schemas.EnrollmentResponse])
def get_enrollments(db: Session = Depends(get_db)):
    return db.query(models.Enrollment).all()


# =====================================
# Enroll student to course
# =====================================
@router.post(
    "/",
    response_model=schemas.EnrollmentResponse,
    status_code=status.HTTP_201_CREATED
)
def enroll(
    enroll: schemas.EnrollmentCreate,
    db: Session = Depends(get_db)
):
    # Check student exists
    student = db.get(models.Student, enroll.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Check course exists
    course = db.get(models.Course, enroll.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    db_enroll = models.Enrollment(**enroll.dict())

    db.add(db_enroll)

    try:
        db.commit()
        db.refresh(db_enroll)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already enrolled in this course"
        )

    return db_enroll


# =====================================
# Delete enrollment
# =====================================
@router.delete(
    "/{enrollment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    enrollment = db.get(models.Enrollment, enrollment_id)

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    db.delete(enrollment)
    db.commit()

    return None