from fastapi import FastAPI
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from app.database import Base, engine

# ✅ MODELS IMPORT - bu qator qo'shildi!
from app import models  
from app.routes.payments import router as payments_router
from app.routes.courses import router as courses_router
from app.routes.students import router as students_router
from app.routes.teachers import router as teachers_router
from app.routes.groups import router as groups_router
from app.routes.enrollments import router as enrollments_router
from app.routes.vacancies import router as vacancies_router
from app.routes.blogs import router as blogs_router
from app.routes.applications import router as applications_router
from app.routes import group_students
from app.routes import vacancy_applications

app = FastAPI(
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ]
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(courses_router)
app.include_router(students_router)
app.include_router(teachers_router)
app.include_router(groups_router)
app.include_router(enrollments_router)
app.include_router(vacancies_router)
app.include_router(blogs_router)
app.include_router(applications_router)
app.include_router(group_students.router)
app.include_router(vacancy_applications.router)
app.include_router(payments_router)

@app.get("/")
def root():
    return {"message": "FastAPI ishlayapti"}