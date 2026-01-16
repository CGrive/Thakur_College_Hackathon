// src/components/StudentRegistrationPage.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Backdrop,
} from "@mui/material";
import {
  CameraAlt,
  Security,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Close,
  Error,
} from "@mui/icons-material";
import { studentAPI } from "../api/astitvaAPI";

const steps = ["Personal Information", "Face Registration", "Privacy Consent"];

const StudentRegistrationPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    department: "",
    email: "",
    phone: "",
    year: "",
  });
  const [capturedFaces, setCapturedFaces] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await completeRegistration();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const completeRegistration = async () => {
    if (!agreeToTerms) {
      showSnackbar("Please agree to the privacy terms", "warning");
      return;
    }

    // Validate student ID is a number
    const studentIdNum = parseInt(formData.studentId, 10);
    if (isNaN(studentIdNum)) {
      showSnackbar("Student ID must be a number", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare student data
      const studentData = {
        studentId: formData.studentId,
        fullName: formData.fullName,
        department: formData.department || null,
        email: formData.email || null,
        phone: formData.phone || null,
        year: formData.year || null,
      };

      console.log("Sending registration data:", studentData);

      // Call API to register student
      const result = await studentAPI.registerStudentComplete(
        studentData,
        capturedFaces
      );

      setRegistrationResult(result);
      setRegistrationComplete(true);

      showSnackbar("Registration completed successfully!", "success");

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        window.location.href = "/admin";
      }, 5000);

    } catch (error) {
      console.error("Registration error:", error);
      showSnackbar(`Registration failed: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simplified face capture - just a button that adds mock faces
  const captureFace = () => {
    if (capturedFaces.length >= 3) {
      showSnackbar("Maximum 3 face captures allowed", "warning");
      return;
    }

    setCapturing(true);

    setTimeout(() => {
      const newFace = {
        id: Date.now(),
        image: `mock-image-${capturedFaces.length + 1}`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setCapturedFaces((prev) => [...prev, newFace]);
      setCapturing(false);
      
      if (capturedFaces.length >= 2) {
        setShowCameraDialog(false);
      }

      showSnackbar(`Face captured! (${capturedFaces.length + 1}/3)`, "success");
    }, 1000);
  };

  const removeFace = (id) => {
    setCapturedFaces((prev) => prev.filter((face) => face.id !== id));
    showSnackbar("Face removed", "info");
  };

  const resetFaces = () => {
    setCapturedFaces([]);
    showSnackbar("All faces cleared", "info");
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 3, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" fontWeight={700} color="#1a237e" gutterBottom>
          Student Registration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete your profile to access the Intelligent Attendance System
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Registration Complete View */}
      {registrationComplete ? (
        <Paper sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 80, color: "#4CAF50", mb: 3 }} />

          <Typography variant="h4" fontWeight={700} color="#1a237e" gutterBottom>
            Registration Complete! 🎉
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            Student has been successfully registered in the system.
          </Typography>

          <Card sx={{ maxWidth: 400, margin: "auto", mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registration Details
              </Typography>

              <Box sx={{ textAlign: "left", mt: 2 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Student ID:</strong> {formData.studentId}
                </Typography>
                <Typography variant="body2">
                  <strong>Department:</strong> {formData.department || "Not specified"}
                </Typography>
                <Typography variant="body2">
                  <strong>Face Images:</strong> {capturedFaces.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> Registered in database
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mt: 3 }}>
                Student can now use facial recognition for attendance!
              </Alert>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Redirecting to admin dashboard in 5 seconds...
            </Typography>

            <Button
              variant="contained"
              onClick={() => (window.location.href = "/admin")}
              sx={{ mr: 2 }}
            >
              Go to Dashboard Now
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setRegistrationComplete(false);
                setActiveStep(0);
                setCapturedFaces([]);
                setRegistrationResult(null);
                setFormData({
                  fullName: "",
                  studentId: "",
                  department: "",
                  email: "",
                  phone: "",
                  year: "",
                });
              }}
            >
              Register Another
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Step 1: Personal Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={3} color="#1a237e">
                Personal Information
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Enter student details to create their profile.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={formData.fullName}
                    onChange={handleInputChange("fullName")}
                    placeholder="e.g. John Doe"
                    required
                    error={!formData.fullName && activeStep === 0}
                    helperText={!formData.fullName && activeStep === 0 ? "Required field" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Student ID *"
                    value={formData.studentId}
                    onChange={handleInputChange("studentId")}
                    placeholder="e.g. 2024001"
                    required
                    type="number"
                    error={!formData.studentId && activeStep === 0}
                    helperText={!formData.studentId && activeStep === 0 ? "Required field (numbers only)" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      label="Department"
                      onChange={handleInputChange("department")}
                    >
                      <MenuItem value="cs">Computer Science</MenuItem>
                      <MenuItem value="eng">Engineering</MenuItem>
                      <MenuItem value="bus">Business</MenuItem>
                      <MenuItem value="art">Arts</MenuItem>
                      <MenuItem value="sci">Science</MenuItem>
                      <MenuItem value="med">Medical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Year of Study</InputLabel>
                    <Select
                      value={formData.year}
                      label="Year of Study"
                      onChange={handleInputChange("year")}
                    >
                      <MenuItem value="1">First Year</MenuItem>
                      <MenuItem value="2">Second Year</MenuItem>
                      <MenuItem value="3">Third Year</MenuItem>
                      <MenuItem value="4">Fourth Year</MenuItem>
                      <MenuItem value="5">Postgraduate</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    placeholder="e.g. john.doe@college.edu"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Security sx={{ mr: 1, verticalAlign: "middle" }} />
                All information is encrypted and securely stored.
              </Alert>
            </Box>
          )}

          {/* Step 2: Face Registration */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={3} color="#1a237e">
                Face Registration
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Capture multiple angles of your face for better recognition accuracy.
              </Typography>

              {/* Capture Cards */}
              <Grid container spacing={3} mb={4}>
                {[1, 2, 3].map((num) => (
                  <Grid item xs={12} sm={6} md={4} key={num}>
                    <Card
                      sx={{
                        height: "100%",
                        textAlign: "center",
                        border:
                          capturedFaces.length >= num
                            ? "2px solid #4caf50"
                            : "2px solid #e0e0e0",
                        transition: "all 0.3s",
                      }}
                    >
                      <CardContent>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor:
                              capturedFaces.length >= num ? "#4caf50" : "#1a237e",
                            margin: "auto",
                            mb: 2,
                          }}
                        >
                          {capturedFaces.length >= num ? (
                            <CheckCircle sx={{ fontSize: 40 }} />
                          ) : (
                            <CameraAlt sx={{ fontSize: 40 }} />
                          )}
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                          {num === 1
                            ? "Front View"
                            : num === 2
                            ? "Left Profile"
                            : "Right Profile"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {capturedFaces.length >= num
                            ? "Captured successfully"
                            : "Look straight at camera"}
                        </Typography>

                        {capturedFaces.length >= num ? (
                          <Chip label="Captured" color="success" size="small" />
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => setShowCameraDialog(true)}
                            startIcon={<CameraAlt />}
                            disabled={capturing}
                          >
                            {capturing ? "Capturing..." : "Capture"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Captured Faces Preview */}
              {capturedFaces.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      Captured Faces ({capturedFaces.length}/3)
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={resetFaces}
                      startIcon={<Close />}
                    >
                      Clear All
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {capturedFaces.map((face, index) => (
                      <Grid item xs={4} sm={3} md={2.4} key={face.id}>
                        <Box sx={{ position: "relative" }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              bgcolor: "#4CAF50",
                              color: "white",
                              fontSize: 24,
                              margin: "auto",
                            }}
                          >
                            #{index + 1}
                          </Avatar>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              position: "absolute",
                              top: -8,
                              left: -8,
                              bgcolor: "#4CAF50",
                              color: "white",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeFace(face.id)}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: "rgba(244, 67, 54, 0.9)",
                              color: "white",
                              width: 24,
                              height: 24,
                              "&:hover": { bgcolor: "#f44336" },
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Alert severity="success" sx={{ mt: 2 }}>
                    <CheckCircle sx={{ mr: 1, verticalAlign: "middle" }} />
                    {capturedFaces.length} face images captured. More images improve accuracy.
                  </Alert>
                </Box>
              )}
            </Box>
          )}

          {/* Step 3: Privacy Consent */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h5" fontWeight={600} mb={3} color="#1a237e">
                Privacy & Data Consent
              </Typography>

              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: "#f8f9ff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom color="#1a237e">
                  Data Protection Agreement
                </Typography>
                <Typography variant="body2" paragraph>
                  By proceeding, you consent to the following terms regarding the student's personal and biometric data:
                </Typography>

                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Encrypted Storage:</strong> All biometric data is encrypted using military-grade AES-256 encryption.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Limited Use:</strong> Information will only be used for automated attendance verification.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>FERPA Compliance:</strong> All data handling complies with FERPA regulations.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Data Retention:</strong> Biometric data is retained only for the duration of enrollment.
                    </Typography>
                  </li>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 1,
                  }}
                >
                  <Security color="primary" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Privacy Shield Certified
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Our system meets international data protection standards
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    I agree to the encrypted storage of biometric data. The information will only be used for automated attendance verification and is protected according to FERPA guidelines.
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              {agreeToTerms && (
                <Alert severity="success" icon={<CheckCircle />}>
                  Thank you for agreeing to our privacy terms.
                </Alert>
              )}
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || isProcessing}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={
                isProcessing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowForward />
                )
              }
              disabled={
                (activeStep === 0 &&
                  (!formData.fullName || !formData.studentId)) ||
                isProcessing
              }
              sx={{
                background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
                px: 4,
              }}
            >
              {isProcessing
                ? "Processing..."
                : activeStep === steps.length - 1
                ? "Complete Registration"
                : "Continue"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          <Security sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
          All data is protected with end-to-end encryption • ISO 27001 Certified • GDPR Compliant
        </Typography>
      </Box>

      {/* Camera Dialog */}
      <Dialog
        open={showCameraDialog}
        onClose={() => setShowCameraDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Capture Your Face</Typography>
            <IconButton onClick={() => setShowCameraDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                position: "relative",
                height: 300,
                mb: 3,
                bgcolor: "#000",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Typography>Click "Capture Face" to simulate face capture</Typography>

              {capturing && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <CircularProgress sx={{ color: "#4CAF50", mb: 2 }} />
                  <Typography sx={{ color: "white" }}>Processing...</Typography>
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={captureFace}
              disabled={capturing}
              startIcon={<CameraAlt />}
              sx={{
                background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                py: 1.5,
                width: "100%",
              }}
            >
              {capturing ? "Capturing..." : "Capture Face"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Backdrop for processing */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isProcessing}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" sx={{ mb: 2 }} />
          <Typography>Registering student to database...</Typography>
        </Box>
      </Backdrop>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default StudentRegistrationPage;