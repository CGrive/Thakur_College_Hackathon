# 🌟 Astitwa – Smart Attendance System

Astitwa is an **intelligent, secure, and automated attendance management system** designed to replace traditional manual attendance methods with a **technology-driven solution**.  
It integrates **biometric data, camera input, ML models and backend APIs** to ensure accurate, reliable, and tamper-proof attendance tracking.

---

## 🚀 Features

- 🧑‍🎓 **Student Management**
  - Add, update, and manage student records
  - Store biometric / fingerprint data securely

- 📸 **Camera-Based Attendance**
  - Real-time camera feed for attendance capture
  - Automated attendance marking
  - Preventing proxy attendance

- 🔐 **Secure Authentication**
  - REST API-based access control
  - Token-based authentication using JWT and bcrypt

- 🗄️ **Database Integration**
  - Structured relational database using SQLAlchemy
  - Efficient querying and updates

- ⚡ **FastAPI Backend**
  - High-performance asynchronous APIs
  - Clean and modular project structure

- 🌐 **CORS Enabled**
  - Seamless integration with frontend applications

---

## 🛠️ Tech Stack

| Layer          | Technology |
|----------------|------------|
| Backend        | FastAPI    |
| Database       | SQLite     |
| ORM            | SQLAlchemy |
| Authentication | bcrypt, JWT|
| Camera & Vision| OpenCV     |
| Language       | Python     |
| Server         | Uvicorn    |
| Package Manager| yarn, uv   |
---

## 📂 Project Structure

```text
Astitwa/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── camera_worker.py
│   └── routers/
│
├── frontend/
│   └── public
│   └── src
|   └── (frontend code)
│
├── requirements.txt
└── README.md
