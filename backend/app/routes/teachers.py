from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"]
)


# =====================================
# Get all teachers (pagination optional)
# =====================================
@router.get("/", response_model=List[schemas.TeacherResponse])
def get_teachers(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    teachers = db.query(models.Teacher).offset(skip).limit(limit).all()
    return teachers


# =====================================
# Get teacher by ID
# =====================================
@router.get("/{teacher_id}", response_model=schemas.TeacherResponse)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db)
):
    teacher = db.get(models.Teacher, teacher_id)

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )

    return teacher


# =====================================
# Create teacher
# =====================================
@router.post(
    "/",
    response_model=schemas.TeacherResponse,
    status_code=status.HTTP_201_CREATED
)
def create_teacher(
    teacher: schemas.TeacherCreate,
    db: Session = Depends(get_db)
):
    db_teacher = models.Teacher(**teacher.dict())

    db.add(db_teacher)

    try:
        db.commit()
        db.refresh(db_teacher)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher with this phone already exists"
        )

    return db_teacher


# =====================================
# Update teacher
# =====================================
@router.put("/{teacher_id}", response_model=schemas.TeacherResponse)
def update_teacher(
    teacher_id: int,
    teacher_update: schemas.TeacherUpdate,
    db: Session = Depends(get_db)
):
    db_teacher = db.get(models.Teacher, teacher_id)

    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )

    update_data = teacher_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_teacher, key, value)

    try:
        db.commit()
        db.refresh(db_teacher)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update error (phone duplicate or invalid data)"
        )

    return db_teacher


# =====================================
# Delete teacher
# =====================================
@router.delete(
    "/{teacher_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db)
):
    teacher = db.get(models.Teacher, teacher_id)

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )

    db.delete(teacher)
    db.commit()

    return None