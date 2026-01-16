from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
import uuid

# ------------------ APP INIT ------------------

app = FastAPI(title="Astitva - Attendance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ DATABASE ------------------

DATABASE_URL = "sqlite:///./attendance.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# ------------------ JWT ------------------

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ------------------ MODELS ------------------


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True)
    full_name = Column(String)
    department = Column(String)

    face_data = Column(String, nullable=True)
    fingerprint_data = Column(String, nullable=True)
    id_card_data = Column(String, nullable=True)


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    room = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lecture_id = Column(Integer, ForeignKey("lectures.id"))
    verification_method = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

# ------------------ SCHEMAS ------------------


class UserCreate(BaseModel):
    student_id: str
    full_name: str
    department: str


class AdminCreate(BaseModel):
    email: str
    password: str


class AdminLogin(BaseModel):
    email: str
    password: str


class MarkAttendance(BaseModel):
    student_id: str
    lecture_id: int
    verification_method: str


# ------------------ DEPENDENCY ------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------ UTILS ------------------


def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# ------------------ ADMIN ENDPOINTS ------------------


@app.post("/admin/register")
def register_admin(data: AdminCreate, db: Session = Depends(get_db)):

    admin = Admin(
        email=data.email,
        hashed_password=hash_password(data.password)
    )

    db.add(admin)
    db.commit()

    return {"message": "Admin created"}


@app.post("/admin/login")
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):

    admin = db.query(Admin).filter(Admin.email == data.email).first()

    if not admin or not verify_password(data.password, admin.hashed_password):
        raise HTTPException(401, "Invalid admin credentials")

    token = create_token({"sub": admin.email})

    return {"access_token": token}


# ------------------ USER (STUDENT) MANAGEMENT ------------------

@app.post("/users/create")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    exists = db.query(Users).filter(
        Users.student_id == user.student_id).first()

    if exists:
        raise HTTPException(400, "Student already exists")

    new_user = Users(
        student_id=user.student_id,
        full_name=user.full_name,
        department=user.department
    )

    db.add(new_user)
    db.commit()

    return {"message": "Student user created"}


@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(Users).all()


# ------------------ VERIFICATION ENROLLMENT ------------------

@app.post("/users/enroll-face/{student_id}")
def enroll_face(student_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.student_id == student_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    user.face_data = f"face-{uuid.uuid4()}"
    db.commit()

    return {"message": "Face enrolled"}


@app.post("/users/enroll-fingerprint/{student_id}")
def enroll_fingerprint(student_id: str, db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.student_id == student_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    user.fingerprint_data = f"fp-{uuid.uuid4()}"
    db.commit()

    return {"message": "Fingerprint enrolled"}


@app.post("/users/enroll-idcard/{student_id}")
def enroll_id(student_id: str, db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.student_id == student_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    user.id_card_data = f"id-{uuid.uuid4()}"
    db.commit()

    return {"message": "ID Card enrolled"}


# ------------------ ATTENDANCE ------------------

@app.post("/attendance/mark")
def mark_attendance(req: MarkAttendance, db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.student_id == req.student_id).first()

    if not user:
        raise HTTPException(404, "Student not found")

    attendance = Attendance(
        user_id=user.id,
        lecture_id=req.lecture_id,
        verification_method=req.verification_method
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Attendance marked",
        "student": user.full_name
    }


@app.get("/attendance/history/{student_id}")
def history(student_id: str, db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.student_id == student_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    records = db.query(Attendance).filter(Attendance.user_id == user.id).all()

    return records


# ------------------ RUN ------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
