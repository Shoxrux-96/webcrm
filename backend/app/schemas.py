from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ================================
# Base Config
# ================================
class BaseConfig:
    orm_mode = True


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

    class Config(BaseConfig):
        pass


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

    class Config(BaseConfig):
        pass


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

    class Config(BaseConfig):
        pass


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

    class Config(BaseConfig):
        pass


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

    class Config(BaseConfig):
        pass


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

    class Config(BaseConfig):
        pass


# ================================
# Vacancy
# ================================
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
    created_at: datetime
    updated_at: datetime

    class Config(BaseConfig):
        pass


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

    class Config(BaseConfig):
        pass