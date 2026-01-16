import cv2
import os
import sys
import numpy as np
from datetime import datetime
import multiprocessing

import face_recognition
import dlib
from scipy.spatial import distance as dist
from imutils import face_utils

print("📷 Camera Service Python:", sys.executable)

# ===================== SETTINGS =====================
STUDENTS_FOLDER = "Students Faces"
THRESHOLD = 0.55
REQUIRED_FRAMES = 3

PREDICTOR_PATH = "shape_predictor_68_face_landmarks.dat"
EYE_AR_THRESH = 0.20
EYE_AR_CONSEC_FRAMES = 1

# ===================== ATTENDANCE FILE =====================


def get_today_file():
    today = datetime.now().strftime("%Y-%m-%d")
    return f"attendance_{today}.csv"


ATTENDANCE_FILE = get_today_file()

# ===================== LOAD MARKED STUDENTS =====================


def load_marked_students(file_path):
    marked = set()
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            lines = f.readlines()[1:]
            for line in lines:
                marked.add(line.split(",")[0])
    return marked


marked_students = load_marked_students(ATTENDANCE_FILE)

# ===================== BLINK HELPERS =====================


def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

# ===================== CHECK FILES =====================


if not os.path.exists(PREDICTOR_PATH):
    print("❌ shape_predictor_68_face_landmarks.dat missing")
    sys.exit(1)

if not os.path.exists(STUDENTS_FOLDER):
    print("❌ Students Faces folder missing")
    sys.exit(1)

# ===================== LOAD MODELS =====================

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(PREDICTOR_PATH)

(lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

# ===================== LOAD STUDENTS =====================

known_encodings = []
known_names = []

print("📌 Loading student faces...")

for student in os.listdir(STUDENTS_FOLDER):
    folder = os.path.join(STUDENTS_FOLDER, student)
    if not os.path.isdir(folder):
        continue

    for img in os.listdir(folder):
        if img.lower().endswith((".jpg", ".png", ".jpeg")):
            path = os.path.join(folder, img)
            image = face_recognition.load_image_file(path)
            encs = face_recognition.face_encodings(image)
            if encs:
                known_encodings.append(encs[0])
                known_names.append(student)
                print(f"✅ Loaded {student}/{img}")

print(f"✅ Total samples loaded: {len(known_encodings)}")

# ===================== ATTENDANCE =====================


def mark_attendance(name):
    if name in marked_students:
        print(f"🟡 {name} already marked")
        return False

    marked_students.add(name)
    now = datetime.now()

    new_file = not os.path.exists(ATTENDANCE_FILE)
    with open(ATTENDANCE_FILE, "a") as f:
        if new_file:
            f.write("Name,Date,Time\n")
        f.write(f"{name},{now.date()},{now.time().strftime('%H:%M:%S')}\n")

    print(f"🟢 Attendance marked: {name}")
    return True

# ===================== CAMERA WORKER =====================


def run_camera():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Camera not accessible")
        return

    match_counter = {}
    blink_count = 0
    closed_frames = 0

    print("🎥 Camera started")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rects = detector(gray, 0)

        for rect in rects:
            shape = predictor(gray, rect)
            shape = face_utils.shape_to_np(shape)

            leftEye = shape[lStart:lEnd]
            rightEye = shape[rStart:rEnd]
            ear = (eye_aspect_ratio(leftEye) +
                   eye_aspect_ratio(rightEye)) / 2.0

            if ear < EYE_AR_THRESH:
                closed_frames += 1
            else:
                if closed_frames >= EYE_AR_CONSEC_FRAMES:
                    blink_count += 1
                closed_frames = 0

        small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

        locs = face_recognition.face_locations(rgb)
        encs = face_recognition.face_encodings(rgb, locs)

        for enc in encs:
            dists = face_recognition.face_distance(known_encodings, enc)
            idx = np.argmin(dists)

            if dists[idx] < THRESHOLD:
                name = known_names[idx]
                match_counter[name] = match_counter.get(name, 0) + 1

                if match_counter[name] >= REQUIRED_FRAMES and blink_count >= 1:
                    mark_attendance(name)
                    break

        cv2.imshow("Attendance Camera", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

# ===================== CONTROLLER =====================


camera_process = None


def start_camera():
    global camera_process
    if camera_process is None or not camera_process.is_alive():
        camera_process = multiprocessing.Process(target=run_camera)
        camera_process.start()
        print("▶ Camera process started")


def stop_camera():
    global camera_process
    if camera_process and camera_process.is_alive():
        camera_process.terminate()
        camera_process.join()
        camera_process = None
        print("⏹ Camera process stopped")

# ===================== MAIN =====================


if __name__ == "__main__":
    start_camera()
