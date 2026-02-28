from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


# =====================================
# Get all applications
# =====================================
@router.get("/", response_model=List[schemas.ApplicationResponse])
def get_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.Application).order_by(
        models.Application.created_at.desc()
    ).offset(skip).limit(limit).all()


# =====================================
# Get application by ID
# =====================================
@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    app = db.get(models.Application, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    return app


# =====================================
# Create application (public — no auth)
# =====================================
@router.post("/", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    db_app = models.Application(**application.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


# =====================================
# Update application (PUT - to'liq yangilash)
# =====================================
@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(
    application_id: int,
    update: schemas.ApplicationUpdate,
    db: Session = Depends(get_db)
):
    db_app = db.get(models.Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(db_app, key, value)

    db.commit()
    db.refresh(db_app)
    return db_app


# =====================================
# Helper: arizadan student yaratish
# =====================================
def _create_student_from_application(db: Session, db_app: models.Application) -> models.Student | None:
    """
    Ariza active bo'lganda student yaratadi.
    Agar student allaqachon mavjud bo'lsa (phone bo'yicha), qaytaradi.
    """
    # Telefon raqami bo'yicha student allaqachon bormi?
    existing = db.query(models.Student).filter(
        models.Student.phone == db_app.phone
    ).first()

    if existing:
        return existing  # Allaqachon bor, qayta yaratma

    new_student = models.Student(
        full_name=db_app.full_name,
        phone=db_app.phone,
        school=db_app.school or "—",
        grade=db_app.grade or "—",
        address=db_app.address,
        email=None,  # Arizada email yo'q
    )
    db.add(new_student)
    db.flush()  # ID olish uchun (commit qilmasdan)
    return new_student


# =====================================
# Update application status (PATCH - qisman yangilash)
# =====================================
@router.patch("/{application_id}", response_model=schemas.ApplicationResponse)
def patch_application(
    application_id: int,
    update: schemas.ApplicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Arizani qisman yangilash.
    Agar status 'active' ga o'zgarsa — student avtomatik yaratiladi.
    """
    db_app = db.get(models.Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")

    old_status = db_app.status

    # Faqat berilgan maydonlarni yangilash
    for key, value in update.dict(exclude_unset=True).items():
        setattr(db_app, key, value)

    # updated_at ni avtomatik yangilash
    from datetime import datetime
    setattr(db_app, "updated_at", datetime.now())

    # ✅ ASOSIY LOGIKA: status active bo'lsa student yarat
    new_status = update.dict(exclude_unset=True).get("status")
    if new_status == "active" and old_status != "active":
        _create_student_from_application(db, db_app)

    db.commit()
    db.refresh(db_app)

    return db_app


# =====================================
# Update application status (maxsus endpoint)
# =====================================
@router.patch("/{application_id}/status", response_model=schemas.ApplicationResponse)
def update_application_status(
    application_id: int,
    status_update: dict,  # {"status": "active"}
    db: Session = Depends(get_db)
):
    """
    Faqat statusni yangilash uchun maxsus endpoint.
    Agar status 'active' bo'lsa — student avtomatik yaratiladi.
    """
    db_app = db.get(models.Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")

    if "status" not in status_update:
        raise HTTPException(status_code=400, detail="status maydoni talab qilinadi")

    new_status = status_update["status"]
    if new_status not in ["pending", "active", "rejected"]:
        raise HTTPException(status_code=400, detail="Noto'g'ri status qiymati")

    old_status = db_app.status
    db_app.status = new_status

    from datetime import datetime
    db_app.updated_at = datetime.now()

    # ✅ ASOSIY LOGIKA: status active bo'lsa student yarat
    if new_status == "active" and old_status != "active":
        _create_student_from_application(db, db_app)

    db.commit()
    db.refresh(db_app)

    return db_app


# =====================================
# Delete application
# =====================================
@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    db_app = db.get(models.Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    db.delete(db_app)
    db.commit()
    return None


# =====================================
# Health check endpoint
# =====================================
@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Applications API ishlayapti"}