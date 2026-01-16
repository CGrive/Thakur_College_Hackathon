from verify import verify
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from camera_service import start_camera, stop_camera
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from typing import Optional
import bcrypt
from jose import jwt
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

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    department = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String)
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
    is_verified = Column(Boolean)
    confidence_score = Column(Float, default=0.0)
    status = Column(String, default="verified")


class Students(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, unique=True, index=True)
    full_name = Column(String)
    face_encoding = Column(String, nullable=True)
    qr_encoding = Column(String, nullable=True)
    id_card_hash = Column(String, nullable=True)
    fingerprint_data = Column(String, nullable=True)


Base.metadata.create_all(bind=engine)


# -------------------- SCHEMAS --------------------

class FacultyCreate(BaseModel):
    full_name: str
    faculty_id: str
    department: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AttendanceRequest(BaseModel):
    student_id: int
    lecture_id: int
    is_verified: bool
    confidence_score: float
    status: str


class AddStudent(BaseModel):
    student_id: int
    full_name: str


class UpdateStudent(BaseModel):
    full_name: Optional[str] = None
    face_encoding: Optional[str] = None
    qr_encoding: Optional[str] = None
    id_card_hash: Optional[str] = None
    fingerprint_data: Optional[str] = None


class AddLecture(BaseModel):
    subject_name: str
    room: str
    start_time: datetime
    end_time: datetime
    is_active: bool
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

@app.post("/camera/start")
def start():
    start_camera()
    return {"status": "camera started"}


@app.post("/camera/stop")
def stop():
    stop_camera()
    return {"status": "camera stopped"}


@app.post("/add-student")
def add_student(student: AddStudent, db: Session = Depends(get_db)):
    exists = db.query(Students).filter(
        (Students.full_name == student.full_name) |
        (Students.student_id == student.student_id)
    ).first()

    if exists:
        raise HTTPException(400, "Student already exists")

    new_student = Students(
        full_name=student.full_name,
        student_id=student.student_id,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)


@app.patch("/students/{student_id}")
def update_student(
    student_id: int,
    data: UpdateStudent,
    db: Session = Depends(get_db)
):
    student = db.query(Students).filter(
        Students.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)

    return {
        "message": "Student updated successfully",
        "student_id": student.student_id,
        "updated_fields": list(update_data.keys())
    }


@app.post("/add-lecture")
def add_lecture(lecture: AddLecture, db: Session = Depends(get_db)):
    exists = db.query(Lecture).filter(
        Lecture.subject_name == lecture.subject_name).first()
    if exists:
        raise HTTPException(400, "Lecture already exists")

    new_lecture = Lecture(
        subject_name=lecture.subject_name,
        room=lecture.room,
        start_time=lecture.start_time,
        end_time=lecture.end_time,
        is_active=lecture.is_active
    )
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)

    return {"message": "lecture added successfully"}


@app.post("/verify-fingerprint")
def verify_fingerprint(student_id: int, query_path: str, db: Session = Depends(get_db)):

    student = db.query(Students).filter(
        Students.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrolled_path = student.fingerprint_data

    is_verified: bool = verify(enrolled_path, query_path)
    if is_verified:
        return {
            "200": "Attendance is valid"
        }
    else:
        return {
            "200": "Attendance is not valid"
        }


@app.post("/register")
def register_faculty(faculty: FacultyCreate, db: Session = Depends(get_db)):

    exists = db.query(Faculty).filter(
        (Faculty.email == faculty.email) |
        (Faculty.faculty_id == faculty.faculty_id)
    ).first()

    if exists:
        raise HTTPException(400, "Faculty already exists")

    new_faculty = Faculty(
        full_name=faculty.full_name,
        faculty_id=faculty.faculty_id,
        department=faculty.department,
        email=faculty.email,
        hashed_password=hash_password(faculty.password)
    )

    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return {"message": "Student registered successfully"}


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    faculty = db.query(Faculty).filter(Faculty.email == data.email).first()

    if not faculty:
        raise HTTPException(401, "Invalid credentials")

    if not verify_password(data.password, faculty.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": faculty.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "faculty_id": faculty.faculty_id
    }


@app.post("/mark-attendance")
def mark_attendance(req: AttendanceRequest, db: Session = Depends(get_db)):

    student = db.query(Students).filter(
        Students.student_id == req.student_id).first()
    lecture = db.query(Lecture).filter(
        Lecture.id == req.lecture_id).first()

    if not student:
        raise HTTPException(404, "Student not found")
    if not lecture:
        raise HTTPException(404, "Lecture not found")

    attendance = Attendance(
        student_id=req.student_id,
        lecture_id=req.lecture_id,
        is_verified=req.is_verified,
        confidence_score=req.confidence_score,
        status=req.status
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Attendance marked",
        "student": student.full_name
    }


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    students = db.query(Students).count()
    faculty = db.query(Faculty).count()
    attendance = db.query(Attendance).count()

    return {
        "total_faculty": faculty,
        "total_students": students,
        "total_attendance": attendance
    }


@app.get("/")
def root():
    return {
        "Status": "Working.."
    }
# -------------------- RUN --------------------


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
