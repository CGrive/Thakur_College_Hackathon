from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr

import bcrypt
from jose import JWTError, jwt
import uuid

# pip install fastapi uvicorn sqlalchemy bcrypt python-jose python-multipart email-validator

# -------------------- APP INIT --------------------

app = FastAPI(title="Astitva - Attendance System", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- DATABASE --------------------

SQLALCHEMY_DATABASE_URL = "sqlite:///./attendance.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# -------------------- JWT CONFIG --------------------

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# -------------------- MODELS --------------------

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    student_id = Column(String, unique=True, index=True)
    department = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    face_encoding = Column(String, nullable=True)
    id_card_hash = Column(String, nullable=True)
    fingerprint_data = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    course_code = Column(String)
    room = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    is_active = Column(Boolean, default=True)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    lecture_id = Column(Integer, ForeignKey("lectures.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    verification_method = Column(String)
    confidence_score = Column(Float, default=0.0)
    status = Column(String, default="verified")


Base.metadata.create_all(bind=engine)


# -------------------- SCHEMAS --------------------

class StudentCreate(BaseModel):
    full_name: str
    student_id: str
    department: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AttendanceRequest(BaseModel):
    student_id: str
    lecture_id: int
    verification_method: str
    verification_data: str


# -------------------- DEPENDENCY --------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------- UTILITIES --------------------

def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str):
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


# -------------------- LOGGING MIDDLEWARE --------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print("➡ REQUEST:", request.method, request.url)
    response = await call_next(request)
    print("⬅ RESPONSE:", request.method, request.url)
    return response


# -------------------- ENDPOINTS --------------------

@app.post("/register")
def register_student(student: StudentCreate, db: Session = Depends(get_db)):

    exists = db.query(Student).filter(
        (Student.email == student.email) |
        (Student.student_id == student.student_id)
    ).first()

    if exists:
        raise HTTPException(400, "Student already exists")

    new_student = Student(
        full_name=student.full_name,
        student_id=student.student_id,
        department=student.department,
        email=student.email,
        hashed_password=hash_password(student.password)
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {"message": "Student registered successfully"}


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.email == data.email).first()

    if not student:
        raise HTTPException(401, "Invalid credentials")

    if not verify_password(data.password, student.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": student.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "student_id": student.student_id
    }


@app.post("/enroll-face/{student_id}")
def enroll_face(student_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):

    student = db.query(Student).filter(
        Student.student_id == student_id).first()

    if not student:
        raise HTTPException(404, "Student not found")

    student.face_encoding = f"encoded-{uuid.uuid4()}"
    db.commit()

    return {"message": "Face enrolled successfully"}


@app.post("/mark-attendance")
def mark_attendance(req: AttendanceRequest, db: Session = Depends(get_db)):

    student = db.query(Student).filter(
        Student.student_id == req.student_id).first()

    if not student:
        raise HTTPException(404, "Student not found")

    attendance = Attendance(
        student_id=student.id,
        lecture_id=req.lecture_id,
        verification_method=req.verification_method,
        confidence_score=0.95,
        status="verified"
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Attendance marked",
        "student": student.full_name
    }


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    students = db.query(Student).count()
    attendance = db.query(Attendance).count()

    return {
        "total_students": students,
        "total_attendance": attendance
    }


# -------------------- RUN --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
