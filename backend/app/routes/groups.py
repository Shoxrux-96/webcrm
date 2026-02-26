from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


# =====================================
# Get all groups
# =====================================
@router.get("/", response_model=List[schemas.GroupResponse])
def get_groups(
    db: Session = Depends(get_db)
):
    groups = db.query(models.Group).all()
    return groups


# =====================================
# Get group by ID
# =====================================
@router.get("/{group_id}", response_model=schemas.GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = db.get(models.Group, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    return group


# =====================================
# Create group
# =====================================
@router.post(
    "/",
    response_model=schemas.GroupResponse,
    status_code=status.HTTP_201_CREATED
)
def create_group(
    group: schemas.GroupCreate,
    db: Session = Depends(get_db)
):
    db_group = models.Group(**group.dict())

    db.add(db_group)

    try:
        db.commit()
        db.refresh(db_group)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group creation error (maybe duplicate or invalid FK)"
        )

    return db_group


# =====================================
# Update group
# =====================================
@router.put("/{group_id}", response_model=schemas.GroupResponse)
def update_group(
    group_id: int,
    group_update: schemas.GroupCreate,
    db: Session = Depends(get_db)
):
    db_group = db.get(models.Group, group_id)

    if not db_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    for key, value in group_update.dict().items():
        setattr(db_group, key, value)

    try:
        db.commit()
        db.refresh(db_group)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group update error"
        )

    return db_group


# =====================================
# Delete group
# =====================================
@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = db.get(models.Group, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    db.delete(group)
    db.commit()

    return None