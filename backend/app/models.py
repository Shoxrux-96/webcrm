from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, Boolean, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


# =====================================
# Course
# =====================================
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    duration = Column(String, nullable=False)
    audience = Column(String, nullable=False)
    description = Column(Text)


# =====================================
# Student
# =====================================
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True)
    school = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    address = Column(String)

    enrollments = relationship("Enrollment", back_populates="student")


# =====================================
# Teacher
# =====================================
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    image = Column(String)
    tags = Column(String)
    quote = Column(Text)

    groups = relationship("Group", back_populates="teacher")


# =====================================
# Group
# =====================================
class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    course_id = Column(Integer, ForeignKey("courses.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))

    course = relationship("Course")
    teacher = relationship("Teacher", back_populates="groups")
    students = relationship("GroupStudent", back_populates="group")


# =====================================
# Group ↔ Student (many-to-many)
# =====================================
class GroupStudent(Base):
    __tablename__ = "group_students"

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    student_id = Column(Integer, ForeignKey("students.id"))

    group = relationship("Group", back_populates="students")
    student = relationship("Student")


# =====================================
# Enrollment (student ↔ course)
# =====================================
class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    status = Column(String, default="active")  # active, completed

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course")


# =====================================
# User (admin)
# =====================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="admin")  # admin, manager


# =====================================
# Vacancy
# =====================================
class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    salary = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    status = Column(String, default="faol")  # faol / yopilgan


# =====================================
# Blog
# =====================================
class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image = Column(String)
    youtube_link = Column(String)
    short_text = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="draft")  # publish / draft