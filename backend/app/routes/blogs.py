from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/blogs",
    tags=["Blogs"]
)


# =====================================
# Get all blogs (pagination)
# =====================================
@router.get("/", response_model=List[schemas.BlogResponse])
def get_blogs(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    blogs = db.query(models.Blog).offset(skip).limit(limit).all()
    return blogs


# =====================================
# Get blog by ID
# =====================================
@router.get("/{blog_id}", response_model=schemas.BlogResponse)
def get_blog(
    blog_id: int,
    db: Session = Depends(get_db)
):
    blog = db.get(models.Blog, blog_id)

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    return blog


# =====================================
# Create blog
# =====================================
@router.post(
    "/",
    response_model=schemas.BlogResponse,
    status_code=status.HTTP_201_CREATED
)
def create_blog(
    blog: schemas.BlogCreate,
    db: Session = Depends(get_db)
):
    db_blog = models.Blog(**blog.dict())

    db.add(db_blog)

    try:
        db.commit()
        db.refresh(db_blog)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog creation error"
        )

    return db_blog


# =====================================
# Update blog
# =====================================
@router.put("/{blog_id}", response_model=schemas.BlogResponse)
def update_blog(
    blog_id: int,
    blog_update: schemas.BlogCreate,
    db: Session = Depends(get_db)
):
    db_blog = db.get(models.Blog, blog_id)

    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    update_data = blog_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_blog, key, value)

    try:
        db.commit()
        db.refresh(db_blog)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog update error"
        )

    return db_blog


# =====================================
# Delete blog
# =====================================
@router.delete(
    "/{blog_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db)
):
    blog = db.get(models.Blog, blog_id)

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )

    db.delete(blog)
    db.commit()

    return None