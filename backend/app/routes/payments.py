# app/routes/payments.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# =====================================
# Get all payments (filter by student)
# =====================================
@router.get("/", response_model=List[schemas.PaymentResponse])
def get_payments(
    student_id: int = None,
    course_id: int = None,
    month: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Payment)
    if student_id:
        query = query.filter(models.Payment.student_id == student_id)
    if course_id:
        query = query.filter(models.Payment.course_id == course_id)
    if month:
        query = query.filter(models.Payment.month == month)
    return query.order_by(models.Payment.created_at.desc()).all()


# =====================================
# Get student's courses with payments
# (GroupStudent -> Group -> Course orqali)
# =====================================
@router.get("/student/{student_id}/courses", response_model=List[schemas.StudentCourseWithPayments])
def get_student_courses_with_payments(
    student_id: int,
    db: Session = Depends(get_db)
):
    """
    O'quvchi guruhlariga qarab kurslarini va to'lovlarini qaytaradi.
    Enrollment emas, GroupStudent -> Group -> Course zanjiri ishlatiladi.
    """
    student = db.get(models.Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student topilmadi")

    # O'quvchi qaysi guruhlarda bor
    group_students = db.query(models.GroupStudent).filter(
        models.GroupStudent.student_id == student_id
    ).all()

    # Takrorlanmasin: bir kurs bir marta ko'rinsin
    seen_course_ids = set()
    result = []

    for gs in group_students:
        group = db.get(models.Group, gs.group_id)
        if not group:
            continue

        course = db.get(models.Course, group.course_id)
        if not course or course.id in seen_course_ids:
            continue

        seen_course_ids.add(course.id)

        payments = db.query(models.Payment).filter(
            models.Payment.student_id == student_id,
            models.Payment.course_id == course.id
        ).order_by(models.Payment.created_at.desc()).all()

        result.append({
            "course_id": course.id,
            "course_name": course.name,
            "course_price": course.price,
            "enrollment_id": gs.id,       # group_student id ishlatamiz
            "enrollment_status": "active",
            "payments": payments
        })

    return result


# =====================================
# Get payment by ID
# =====================================
@router.get("/{payment_id}", response_model=schemas.PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.get(models.Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    return payment


# =====================================
# Create payment
# =====================================
@router.post("/", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db)
):
    # Student mavjudmi?
    student = db.get(models.Student, payment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student topilmadi")

    # Course mavjudmi?
    course = db.get(models.Course, payment.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Kurs topilmadi")

    # O'quvchi shu kurs bilan bog'liq guruhda bormi?
    group_with_course = db.query(models.Group).join(
        models.GroupStudent,
        models.GroupStudent.group_id == models.Group.id
    ).filter(
        models.GroupStudent.student_id == payment.student_id,
        models.Group.course_id == payment.course_id
    ).first()

    if not group_with_course:
        raise HTTPException(
            status_code=400,
            detail="O'quvchi bu kursga tegishli guruhda emas"
        )

    db_payment = models.Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


# =====================================
# Update payment
# =====================================
@router.patch("/{payment_id}", response_model=schemas.PaymentResponse)
def update_payment(
    payment_id: int,
    update: schemas.PaymentUpdate,
    db: Session = Depends(get_db)
):
    payment = db.get(models.Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="To'lov topilmadi")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(payment, key, value)

    from datetime import datetime
    payment.updated_at = datetime.now()

    db.commit()
    db.refresh(payment)
    return payment


# =====================================
# Delete payment
# =====================================
@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.get(models.Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    db.delete(payment)
    db.commit()
    return None


# =====================================
# Get monthly summary for a student
# =====================================
@router.get("/student/{student_id}/summary")
def get_student_payment_summary(
    student_id: int,
    month: str,   # "2026-02"
    db: Session = Depends(get_db)
):
    """
    O'quvchining berilgan oy uchun to'lov holati (har kurs uchun)
    """
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == student_id
    ).all()

    summary = []
    for enrollment in enrollments:
        course = db.get(models.Course, enrollment.course_id)
        if not course:
            continue

        # Shu oy uchun to'lovlar
        payments = db.query(models.Payment).filter(
            models.Payment.student_id == student_id,
            models.Payment.course_id == enrollment.course_id,
            models.Payment.month == month
        ).all()

        total_paid = sum(p.amount for p in payments if p.status == "paid")
        is_complete = total_paid >= course.price

        summary.append({
            "course_id": course.id,
            "course_name": course.name,
            "course_price": course.price,
            "total_paid": total_paid,
            "remaining": max(0, course.price - total_paid),
            "is_complete": is_complete,
            "payments": payments
        })

    return summary