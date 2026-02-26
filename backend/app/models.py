from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey,
    DateTime, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


# ================================
# Base mixin (timestamps)
# ================================
class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ================================
# Course
# ================================
class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    duration = Column(String, nullable=False)
    audience = Column(String, nullable=False)
    description = Column(Text)

    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete")


# ================================
# Student
# ================================
class Student(Base, TimestampMixin):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    school = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    address = Column(String)

    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete")
    groups = relationship("GroupStudent", back_populates="student", cascade="all, delete")


# ================================
# Teacher
# ================================
class Teacher(Base, TimestampMixin):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    image = Column(String)
    tags = Column(String)
    quote = Column(Text)

    groups = relationship("Group", back_populates="teacher", cascade="all, delete")


# ================================
# Group
# ================================
class Group(Base, TimestampMixin):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)

    course = relationship("Course")
    teacher = relationship("Teacher", back_populates="groups")
    students = relationship("GroupStudent", back_populates="group", cascade="all, delete")


# ================================
# Group ↔ Student (many-to-many)
# ================================
class GroupStudent(Base, TimestampMixin):
    __tablename__ = "group_students"

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("group_id", "student_id", name="unique_group_student"),
    )

    group = relationship("Group", back_populates="students")
    student = relationship("Student", back_populates="groups")


# ================================
# Enrollment (student ↔ course)
# ================================
class Enrollment(Base, TimestampMixin):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(String, default="active")

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="unique_enrollment"),
    )

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


# ================================
# User (Admin)
# ================================
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="admin")


# ================================
# Vacancy
# ================================
class Vacancy(Base, TimestampMixin):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    salary = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    status = Column(String, default="faol")


# ================================
# Blog
# ================================
class Blog(Base, TimestampMixin):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image = Column(String)
    youtube_link = Column(String)
    short_text = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, default="draft")