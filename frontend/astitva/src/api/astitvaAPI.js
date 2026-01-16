// src/api/astitvaAPI.js
import axios from 'axios';

// Base URL for your FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('faculty_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', {
        email: email,
        password: password,
      });
      
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('faculty_id', response.data.faculty_id);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.detail || 'Login failed';
    }
  },

  registerFaculty: async (facultyData) => {
    try {
      const response = await api.post('/register', facultyData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data?.detail || 'Registration failed';
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('faculty_id');
  },

  getCurrentUser: () => {
    return {
      token: localStorage.getItem('access_token'),
      faculty_id: localStorage.getItem('faculty_id'),
    };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// Student API
export const studentAPI = {
  // Add new student (basic info)
  addStudent: async (studentData) => {
    try {
      const response = await api.post('/add-student', {
        student_id: studentData.studentId,
        full_name: studentData.fullName,
      });
      return response.data;
    } catch (error) {
      console.error('Add student error:', error);
      throw error.response?.data?.detail || 'Failed to add student';
    }
  },

  // Update student with biometric data
  updateStudent: async (studentId, updateData) => {
    try {
      const response = await api.patch(`/students/${studentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update student error:', error);
      throw error.response?.data?.detail || 'Failed to update student';
    }
  },

  // Enroll face for student
  enrollFace: async (studentId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await api.post(`/enroll-face/${studentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Face enrollment error:', error);
      throw error.response?.data?.detail || 'Face enrollment failed';
    }
  },

  // Get all students (we'll create a mock function since endpoint doesn't exist)
  getAllStudents: async () => {
    try {
      // Mock response - in real app, you'd need to add this endpoint to backend
      const mockStudents = [
        {
          id: 1,
          student_id: "2024001",
          full_name: "John Smith",
          face_encoding: null,
          qr_encoding: null,
          id_card_hash: null,
          fingerprint_data: null,
        },
        {
          id: 2,
          student_id: "2024002",
          full_name: "Emma Johnson",
          face_encoding: "encoded-face-001",
          qr_encoding: "qr-code-001",
          id_card_hash: "hash-001",
          fingerprint_data: null,
        },
      ];
      
      return mockStudents;
    } catch (error) {
      console.error('Get students error:', error);
      throw error.response?.data?.detail || 'Failed to get students';
    }
  },

  // Get student by ID (mock)
  getStudentById: async (studentId) => {
    try {
      const allStudents = await studentAPI.getAllStudents();
      return allStudents.find(s => s.student_id === studentId.toString());
    } catch (error) {
      console.error('Get student error:', error);
      throw error.response?.data?.detail || 'Failed to get student';
    }
  },

  // Register student with complete information
  registerStudentComplete: async (studentData, faceImages = []) => {
    try {
      // Step 1: Add student basic info
      const addStudentResponse = await studentAPI.addStudent({
        studentId: studentData.studentId,
        fullName: studentData.fullName,
      });

      // Step 2: Update with additional info
      const updateData = {
        face_encoding: `face-${Date.now()}`,
        qr_encoding: `qr-${studentData.studentId}`,
        id_card_hash: `card-${studentData.studentId}`,
      };

      if (studentData.department) updateData.department = studentData.department;
      if (studentData.email) updateData.email = studentData.email;
      if (studentData.phone) updateData.phone = studentData.phone;
      if (studentData.year) updateData.year = studentData.year;

      await studentAPI.updateStudent(studentData.studentId, updateData);

      // Step 3: Enroll face images (if any)
      if (faceImages.length > 0) {
        for (const faceImage of faceImages) {
          // Convert data URL to blob
          const blob = dataURLtoBlob(faceImage.image);
          await studentAPI.enrollFace(studentData.studentId, blob);
        }
      }

      return {
        success: true,
        message: 'Student registered successfully',
        studentId: studentData.studentId,
      };
    } catch (error) {
      console.error('Complete registration error:', error);
      throw error;
    }
  },
};

// Lecture API
export const lectureAPI = {
  addLecture: async (lectureData) => {
    try {
      const response = await api.post('/add-lecture', lectureData);
      return response.data;
    } catch (error) {
      console.error('Add lecture error:', error);
      throw error.response?.data?.detail || 'Failed to add lecture';
    }
  },

  // Mock function to get all lectures
  getAllLectures: async () => {
    try {
      // Mock data - you should create this endpoint in backend
      const mockLectures = [
        {
          id: 1,
          subject_name: "Data Structures",
          room: "Room 101",
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        },
        {
          id: 2,
          subject_name: "Calculus II",
          room: "Room 205",
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        },
      ];
      
      return mockLectures;
    } catch (error) {
      console.error('Get lectures error:', error);
      throw error.response?.data?.detail || 'Failed to get lectures';
    }
  },
};

// Attendance API
export const attendanceAPI = {
  markAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/mark-attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw error.response?.data?.detail || 'Failed to mark attendance';
    }
  },

  // Mock function to get attendance records
  getAttendanceRecords: async (date) => {
    try {
      // Mock data - you should create this endpoint in backend
      const mockAttendance = [
        {
          id: 1,
          student_id: 2024001,
          student_name: "John Smith",
          lecture_id: 1,
          lecture_name: "Data Structures",
          timestamp: new Date().toISOString(),
          is_verified: true,
          confidence_score: 0.95,
          status: "verified",
        },
        {
          id: 2,
          student_id: 2024002,
          student_name: "Emma Johnson",
          lecture_id: 1,
          lecture_name: "Data Structures",
          timestamp: new Date().toISOString(),
          is_verified: true,
          confidence_score: 0.98,
          status: "verified",
        },
      ];
      
      return mockAttendance;
    } catch (error) {
      console.error('Get attendance error:', error);
      throw error.response?.data?.detail || 'Failed to get attendance';
    }
  },

  // Verify fingerprint (calls your Python verification)
  verifyFingerprint: async (enrolledPath, queryPath) => {
    try {
      const response = await api.post('/verify-fingerprint', {
        enrolled_path: enrolledPath,
        query_path: queryPath,
      });
      return response.data;
    } catch (error) {
      console.error('Verify fingerprint error:', error);
      throw error.response?.data?.detail || 'Fingerprint verification failed';
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error);
      
      // Return mock data if endpoint fails
      return {
        total_faculty: 5,
        total_students: 150,
        total_attendance: 1245,
      };
    }
  },

  // Get detailed analytics (mock)
  getAnalytics: async () => {
    try {
      // Mock analytics data
      return {
        dailyAttendance: [85, 92, 88, 95, 90, 60, 30],
        departmentDistribution: {
          "Computer Science": 35,
          "Engineering": 25,
          "Business": 20,
          "Arts": 15,
          "Science": 5,
        },
        attendanceTrend: [
          { date: "Mon", present: 85, absent: 15 },
          { date: "Tue", present: 92, absent: 8 },
          { date: "Wed", present: 88, absent: 12 },
          { date: "Thu", present: 95, absent: 5 },
          { date: "Fri", present: 90, absent: 10 },
        ],
      };
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  },
};

// Face Recognition API (for real-time verification)
export const faceRecognitionAPI = {
  // This would connect to your camera_worker.py
  startCamera: async () => {
    try {
      // In real implementation, this would start the Python camera worker
      console.log('Starting camera...');
      
      // Mock response
      return {
        status: 'success',
        message: 'Camera started',
        camera_id: 'cam-' + Date.now(),
      };
    } catch (error) {
      console.error('Start camera error:', error);
      throw error;
    }
  },

  stopCamera: async () => {
    try {
      console.log('Stopping camera...');
      
      // Mock response
      return {
        status: 'success',
        message: 'Camera stopped',
      };
    } catch (error) {
      console.error('Stop camera error:', error);
      throw error;
    }
  },

  verifyStudentFace: async (imageData) => {
    try {
      // This would send image to backend for verification
      // For now, mock the response
      
      // Simulate face verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful verification
      const mockStudents = await studentAPI.getAllStudents();
      const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
      
      return {
        verified: true,
        student_id: randomStudent.student_id,
        name: randomStudent.full_name,
        confidence: 0.92 + Math.random() * 0.06, // 0.92-0.98
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Face verification error:', error);
      throw error;
    }
  },
};

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

// Export all APIs
export default {
  authAPI,
  studentAPI,
  lectureAPI,
  attendanceAPI,
  dashboardAPI,
  faceRecognitionAPI,
};