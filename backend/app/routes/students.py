from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


# =====================================
# Get all students (with pagination)
# =====================================
@router.get("/", response_model=List[schemas.StudentResponse])
def get_students(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students


# =====================================
# Get single student by ID
# =====================================
@router.get("/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(models.Student, student_id)

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return student


# =====================================
# Create student
# =====================================
@router.post(
    "/",
    response_model=schemas.StudentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db)
):
    db_student = models.Student(**student.dict())

    db.add(db_student)

    try:
        db.commit()
        db.refresh(db_student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone or email already exists"
        )

    return db_student


# =====================================
# Update student
# =====================================
@router.put("/{student_id}", response_model=schemas.StudentResponse)
def update_student(
    student_id: int,
    student_update: schemas.StudentUpdate,
    db: Session = Depends(get_db)
):
    db_student = db.get(models.Student, student_id)

    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    update_data = student_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_student, key, value)

    try:
        db.commit()
        db.refresh(db_student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone or email already exists"
        )

    return db_student


# =====================================
# Delete student
# =====================================
@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(models.Student, student_id)

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return None