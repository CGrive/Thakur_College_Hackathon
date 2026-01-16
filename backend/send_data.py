import requests

url = "http://127.0.0.1:8000/mark-attendance"

# stud_5 = {
# "student_id": 4,
# "full_name": "Om Om"
# }

fac_0 = {
    "full_name": "Omkar Lastname",
    "faculty_id": "F01",
    "department": "CS",
    "email": "faculty01@user.com",
    "password": "faculty01"
}
fac_1 = {
    "full_name": "Lokesh Bahad",
    "faculty_id": "F02",
    "department": "IT",
    "email": "faculty02@user.com",
    "password": "faculty02"
}
fac_3 = {
    "full_name": "Neha Kulkarni",
    "faculty_id": "F03",
    "department": "CS",
    "email": "faculty03@user.com",
    "password": "faculty03"
}
fac_4 = {
    "full_name": "Vaibhav sakpal",
    "faculty_id": "F04",
    "department": "CS",
    "email": "faculty04@user.com",
    "password": "faculty04"
}
fac_5 = {
    "full_name": "Neha Tiwari",
    "faculty_id": "F05",
    "department": "IT",
    "email": "faculty05@user.com",
    "password": "faculty05"
}
# requests.post(url, json=fac_0)
# requests.post(url, json=fac_1)
# requests.post(url, json=fac_3)
# requests.post(url, json=fac_4)
# requests.post(url, json=fac_5)

attd_0 = {
    "student_id": 0,
    "lecture_id": 1,
    "is_verified": True,
    "confidence_score": 0.23,
    "status": "present"
}
attd_1 = {
    "student_id": 1,
    "lecture_id": 2,
    "is_verified": False,
    "confidence_score": 0.85,
    "status": "absent"
}
attd_2 = {
    "student_id": 2,
    "lecture_id": 3,
    "is_verified": False,
    "confidence_score": 0.89,
    "status": "proxy"
}
attd_3 = {
    "student_id": 3,
    "lecture_id": 3,
    "is_verified": True,
    "confidence_score": 0.67,
    "status": "present"
}
attd_4 = {
    "student_id": 4,
    "lecture_id": 1,
    "is_verified": True,
    "confidence_score": 0.91,
    "status": "present"
}
requests.post(url, json=attd_0)
requests.post(url, json=attd_1)
requests.post(url, json=attd_2)
requests.post(url, json=attd_3)
requests.post(url, json=attd_4)
