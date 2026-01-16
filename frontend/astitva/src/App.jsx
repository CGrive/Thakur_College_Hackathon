// App.jsx (Updated)
import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import theme from "./theme";
import SplashScreen from "./components/SplashScreen";
import AdminDashboard from "./components/AdminDashboard";
import StudentRegistrationPage from "./components/StudentRegistrationPage";
// import FacialRecognitionScanner from "./components/FacialRecognitionScanner";
// import FaceRegistration from "./components/FaceRegistration";
// import StudentDashboard from "./components/StudentDashboard";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [registeredStudents, setRegisteredStudents] = useState([]);

  if (showSplash) {
    return (
      <ThemeProvider theme={theme}>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/register" element={<StudentRegistrationPage />} />
          {/* <Route path="/student" element={<StudentDashboard />} /> */}
          {/* <Route path="/verify/face" element={<FacialRecognitionScanner />} /> */}
          {/* <Route 
            path="/register/face" 
            element={
              <FaceRegistration 
                onComplete={(data) => {
                  // Add to registered students
                  setRegisteredStudents(prev => [...prev, data]);
                  // Navigate to verification page
                  window.location.href = '/verify/face';
                }}
                onCancel={() => window.history.back()}
              />
            } 
          /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;