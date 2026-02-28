from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
import json


# ================================
# Course
# ================================
class CourseBase(BaseModel):
    name: str
    price: int
    duration: str
    audience: str
    description: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    duration: Optional[str] = None
    audience: Optional[str] = None
    description: Optional[str] = None


class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Student
# ================================
class StudentBase(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    school: str
    grade: str
    address: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    school: Optional[str] = None
    grade: Optional[str] = None
    address: Optional[str] = None


class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Teacher
# ================================
class TeacherBase(BaseModel):
    full_name: str
    specialty: str
    experience: str
    phone: str
    image: Optional[str] = None
    tags: Optional[str] = None
    quote: Optional[str] = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    experience: Optional[str] = None
    phone: Optional[str] = None
    image: Optional[str] = None
    tags: Optional[str] = None
    quote: Optional[str] = None


class TeacherResponse(TeacherBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Group
# ================================
class GroupCreate(BaseModel):
    name: str
    course_id: int
    teacher_id: int


class GroupResponse(GroupCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Enrollment
# ================================
class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int
    status: str = "active"


class EnrollmentResponse(EnrollmentCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# User
# ================================
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "admin"


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Vacancy
# ================================
class VacancyCreate(BaseModel):
    title: str
    type: str
    salary: str
    location: str
    description: Optional[str] = None
    requirements: Optional[List[str]] = []
    status: str = "active"
    date: Optional[str] = None

    @field_validator('requirements', mode='before')
    @classmethod
    def parse_requirements(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []


class VacancyResponse(VacancyCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Blog
# ================================
class BlogCreate(BaseModel):
    title: str
    image: Optional[str] = None
    youtube_link: Optional[str] = None
    short_text: str
    content: str
    status: str = "draft"


class BlogResponse(BlogCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Application
# ================================
class ApplicationCreate(BaseModel):
    full_name: str
    phone: str
    address: Optional[str] = None
    school: str
    grade: str
    course_id: int
    course_name: Optional[str] = None
    comment: Optional[str] = None
    status: str = "pending"


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    comment: Optional[str] = None


class ApplicationResponse(ApplicationCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# GroupStudent
# ================================
class GroupStudentBase(BaseModel):
    group_id: int
    student_id: int


class GroupStudentCreate(GroupStudentBase):
    pass


class GroupStudentResponse(GroupStudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ================================
# Vacancy Application
# ================================
class VacancyApplicationBase(BaseModel):
    full_name: str
    phone: str
    education: str
    certificates: List[str] = []
    certificate_level: Optional[str] = None
    vacancy_id: int
    status: str = "pending"
    notes: Optional[str] = None

    @field_validator('certificates', mode='before')
    @classmethod
    def parse_certificates(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []


class VacancyApplicationCreate(VacancyApplicationBase):
    pass


class VacancyApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class VacancyApplicationResponse(VacancyApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    vacancy_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ================================
# Payment (To'lovlar)
# ================================
# Bu kodni schemas.py fayliga oxiriga qo'shing

class PaymentCreate(BaseModel):
    student_id: int
    course_id: int
    amount: int
    month: str          # "2026-02" formatida
    status: str = "pending"
    note: Optional[str] = None


class PaymentUpdate(BaseModel):
    amount: Optional[int] = None
    month: Optional[str] = None
    status: Optional[str] = None
    note: Optional[str] = None


class PaymentResponse(PaymentCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# O'quvchining kursi va to'lovlari birgalikda
class StudentCourseWithPayments(BaseModel):
    course_id: int
    course_name: str
    course_price: int          # Oylik to'lov summasi
    enrollment_id: int
    enrollment_status: str
    payments: List[PaymentResponse] = []

    model_config = ConfigDict(from_attributes=True)