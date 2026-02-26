from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


# =====================================
# Get all courses (with pagination)
# =====================================
@router.get("/", response_model=List[schemas.CourseResponse])
def get_courses(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    courses = db.query(models.Course).offset(skip).limit(limit).all()
    return courses


# =====================================
# Get single course by ID
# =====================================
@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(models.Course, course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return course


# =====================================
# Create course
# =====================================
@router.post(
    "/",
    response_model=schemas.CourseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db)
):
    db_course = models.Course(**course.dict())

    db.add(db_course)
    db.commit()
    db.refresh(db_course)

    return db_course


# =====================================
# Update course
# =====================================
@router.put("/{course_id}", response_model=schemas.CourseResponse)
def update_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    db: Session = Depends(get_db)
):
    db_course = db.get(models.Course, course_id)

    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    update_data = course_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_course, key, value)

    db.commit()
    db.refresh(db_course)

    return db_course


# =====================================
# Delete course
# =====================================
@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(models.Course, course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return None