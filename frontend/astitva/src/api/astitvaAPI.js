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

// Simple API calls without authentication (since your backend doesn't require it)
export const studentAPI = {
  // Add new student - matches your backend endpoint
  addStudent: async (studentData) => {
    try {
      // Convert studentId to number as your backend expects integer
      const studentId = parseInt(studentData.studentId, 10);
      
      if (isNaN(studentId)) {
        throw new Error('Student ID must be a number');
      }

      const response = await api.post('/add-student', {
        student_id: studentId,
        full_name: studentData.fullName,
        department: studentData.department || null,
        email: studentData.email || null,
        phone: studentData.phone || null,
        year: studentData.year || null,
      });
      
      return response.data;
    } catch (error) {
      console.error('Add student error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to add student';
      throw new Error(errorMsg);
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
      throw new Error(error.response?.data?.detail || 'Face enrollment failed');
    }
  },

  // Register student with complete information
  registerStudentComplete: async (studentData, faceImages = []) => {
    try {
      console.log('Starting student registration...', studentData);

      // Step 1: Add student basic info to backend
      const addStudentResponse = await studentAPI.addStudent(studentData);
      
      console.log('Student added to backend:', addStudentResponse);

      // Step 2: If we have face images, enroll the first one
      if (faceImages.length > 0) {
        try {
          // Convert first face image data URL to blob
          const firstFaceImage = faceImages[0];
          const blob = dataURLtoBlob(firstFaceImage.image);
          
          // Generate a dummy filename
          const file = new File([blob], `face-${studentData.studentId}.jpg`, { type: 'image/jpeg' });
          
          await studentAPI.enrollFace(studentData.studentId, file);
          console.log('Face enrolled successfully');
        } catch (faceError) {
          console.warn('Face enrollment failed (continuing without face):', faceError);
          // Continue even if face enrollment fails
        }
      }

      return {
        success: true,
        message: 'Student registered successfully',
        studentId: studentData.studentId,
        backendResponse: addStudentResponse,
      };
    } catch (error) {
      console.error('Complete registration error:', error);
      throw error;
    }
  },
};

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
  // Handle both data URLs and mock images
  if (dataURL.startsWith('data:')) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } else {
    // For mock images, create a simple blob
    return new Blob(['mock-image'], { type: 'image/jpeg' });
  }
}

export default {
  studentAPI,
};