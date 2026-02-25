from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# =====================================
# Course
# =====================================
class CourseCreate(BaseModel):
    name: str
    price: int
    duration: str
    audience: str
    description: Optional[str] = None


class CourseResponse(CourseCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# Student
# =====================================
class StudentCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    school: str
    grade: str
    address: Optional[str] = None


class StudentResponse(StudentCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# Teacher
# =====================================
class TeacherCreate(BaseModel):
    full_name: str
    specialty: str
    experience: str
    phone: str
    image: Optional[str] = None
    tags: Optional[str] = None
    quote: Optional[str] = None


class TeacherResponse(TeacherCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# Group
# =====================================
class GroupCreate(BaseModel):
    name: str
    course_id: int
    teacher_id: int


class GroupResponse(GroupCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# GroupStudent (many-to-many)
# =====================================
class GroupStudentCreate(BaseModel):
    group_id: int
    student_id: int


class GroupStudentResponse(GroupStudentCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# Enrollment
# =====================================
class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int
    status: str = "active"


class EnrollmentResponse(EnrollmentCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# User (admin)
# =====================================
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "admin"


class UserResponse(UserCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# Vacancy
# =====================================
class VacancyCreate(BaseModel):
    title: str
    type: str
    salary: str
    location: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    status: str = "faol"


class VacancyResponse(VacancyCreate):
    id: int

    class Config:
        orm_mode = True


# =====================================
# Blog
# =====================================
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

    class Config:
        orm_mode = True