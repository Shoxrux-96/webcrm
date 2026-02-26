from fastapi import FastAPI
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from app.routes import (
    courses,
    students,
    teachers,
    groups,
    enrollments,
    vacancies,
    blogs
)


# =====================================
# CORS
# =====================================
app = FastAPI(
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ]
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