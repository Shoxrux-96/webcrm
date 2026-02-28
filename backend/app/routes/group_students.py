# app/routes/group_students.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/group-students",
    tags=["Group Students"]
)


# =====================================
# Get all group-student relations
# =====================================
@router.get("/", response_model=List[schemas.GroupStudentResponse])
def get_group_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Barcha guruh-student bog'lanishlarini olish"""
    return db.query(models.GroupStudent).offset(skip).limit(limit).all()


# =====================================
# Get students by group ID
# =====================================
@router.get("/group/{group_id}", response_model=List[schemas.GroupStudentResponse])
def get_group_students_by_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    """Guruh ID bo'yicha studentlarni olish"""
    return db.query(models.GroupStudent).filter(
        models.GroupStudent.group_id == group_id
    ).all()


# =====================================
# Get groups by student ID
# =====================================
@router.get("/student/{student_id}", response_model=List[schemas.GroupStudentResponse])
def get_student_groups(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Student ID bo'yicha guruhlarni olish"""
    return db.query(models.GroupStudent).filter(
        models.GroupStudent.student_id == student_id
    ).all()


# =====================================
# Add student to group
# =====================================
@router.post(
    "/",
    response_model=schemas.GroupStudentResponse,
    status_code=status.HTTP_201_CREATED
)
def add_student_to_group(
    group_student: schemas.GroupStudentCreate,
    db: Session = Depends(get_db)
):
    """Studentni guruhga qo'shish"""
    
    # Check group exists
    group = db.get(models.Group, group_student.group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    # Check student exists
    student = db.get(models.Student, group_student.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Check if student already in this group
    existing = db.query(models.GroupStudent).filter(
        models.GroupStudent.group_id == group_student.group_id,
        models.GroupStudent.student_id == group_student.student_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already in this group"
        )

    db_group_student = models.GroupStudent(**group_student.dict())

    db.add(db_group_student)

    try:
        db.commit()
        db.refresh(db_group_student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not add student to group"
        )

    return db_group_student


# =====================================
# Remove student from group
# =====================================
@router.delete(
    "/{relation_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remove_student_from_group(
    relation_id: int,
    db: Session = Depends(get_db)
):
    """Studentni guruhdan o'chirish"""
    
    relation = db.get(models.GroupStudent, relation_id)

    if not relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group-student relation not found"
        )

    db.delete(relation)
    db.commit()

    return None


# =====================================
# Remove student from group by IDs
# =====================================
@router.delete(
    "/group/{group_id}/student/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def remove_student_from_group_by_ids(
    group_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):
    """Group ID va Student ID bo'yicha studentni guruhdan o'chirish"""
    
    relation = db.query(models.GroupStudent).filter(
        models.GroupStudent.group_id == group_id,
        models.GroupStudent.student_id == student_id
    ).first()

    if not relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found in this group"
        )

    db.delete(relation)
    db.commit()

    return None