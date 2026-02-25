from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    courses,
    students,
    teachers,
    groups,
    enrollments,
    vacancies,
    blogs
)

app = FastAPI()

# =====================================
# CORS
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # productionda aniq domen yozasan
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# Routes
# =====================================
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(groups.router)
app.include_router(enrollments.router)
app.include_router(vacancies.router)
app.include_router(blogs.router)


@app.get("/")
def root():
    return {"message": "FastAPI backend ishlayapti"}