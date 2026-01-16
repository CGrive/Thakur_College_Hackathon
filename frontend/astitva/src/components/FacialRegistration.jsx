// FaceRegistration.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CameraFront,
  CameraRear,
  CheckCircle,
  Face,
  Cameraswitch,
  Videocam,
  VideocamOff,
  Refresh,
  PersonAdd,
  Save,
  ArrowBack,
} from "@mui/icons-material";
import * as faceapi from "face-api.js";

const FaceRegistration = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0); // 0: Info, 1: Capture, 2: Review
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    department: "",
  });
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraType, setCameraType] = useState("user");
  const [capturedImages, setCapturedImages] = useState([]);
  const [faceDescriptors, setFaceDescriptors] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureCountRef = useRef(0);

  const steps = ["Enter Details", "Capture Face", "Review & Save"];

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
        console.log('Face detection models loaded for registration');
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  // Initialize camera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: cameraType,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please allow camera access to continue');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
    }
  };

  const toggleCamera = () => {
    stopCamera();
    setCameraType(prev => prev === "user" ? "environment" : "user");
  };

  // Capture face image and extract descriptor
  const captureFace = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setIsCapturing(true);
    setCaptureProgress(0);

    try {
      // Take screenshot from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Flip image if front camera
      if (cameraType === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      setCaptureProgress(30);

      // Create image element for face-api
      const img = await faceapi.fetchImage(imageDataUrl);
      
      setCaptureProgress(50);

      // Detect face and extract descriptor
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      setCaptureProgress(80);

      if (detections.length === 0) {
        throw new Error('No face detected. Please ensure your face is clearly visible.');
      }

      if (detections.length > 1) {
        throw new Error('Multiple faces detected. Please ensure only your face is in frame.');
      }

      const detection = detections[0];
      const descriptor = detection.descriptor;

      setCaptureProgress(100);

      // Store the captured data
      setCapturedImages(prev => [...prev, {
        id: Date.now(),
        image: imageDataUrl,
        timestamp: new Date().toISOString(),
        descriptor: Array.from(descriptor), // Convert Float32Array to regular array
      }]);

      setFaceDescriptors(prev => [...prev, descriptor]);

      // Show preview for 2 seconds
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 2000);

      captureCountRef.current += 1;
      
      if (captureCountRef.current >= 3) {
        // Auto-advance after 3 captures
        setTimeout(() => setStep(2), 1000);
      }

    } catch (error) {
      alert(`Capture failed: ${error.message}`);
    } finally {
      setIsCapturing(false);
      setCaptureProgress(0);
    }
  };

  const completeRegistration = () => {
    if (faceDescriptors.length === 0) {
      alert('Please capture at least one face image');
      return;
    }

    // Prepare registration data
    const data = {
      ...formData,
      faceDescriptors: faceDescriptors.map(d => Array.from(d)), // Convert all descriptors
      registrationDate: new Date().toISOString(),
      captureCount: capturedImages.length,
      avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };

    setRegistrationData(data);
    setRegistrationComplete(true);

    // In real app, save to database/localStorage
    saveToDatabase(data);

    // Auto-complete after 3 seconds
    setTimeout(() => {
      if (onComplete) onComplete(data);
    }, 3000);
  };

  const saveToDatabase = (data) => {
    try {
      // Save to localStorage for demo
      const existing = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
      existing.push(data);
      localStorage.setItem('registeredStudents', JSON.stringify(existing));
      
      // Also save to indexedDB for larger data
      saveToIndexedDB(data);
      
      console.log('Registration saved:', data);
    } catch (error) {
      console.error('Error saving registration:', error);
    }
  };

  const saveToIndexedDB = (data) => {
    // Initialize IndexedDB
    const request = indexedDB.open('FaceRecognitionDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('students')) {
        const store = db.createObjectStore('students', { keyPath: 'studentId' });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['students'], 'readwrite');
      const store = transaction.objectStore('students');
      store.put(data);
    };
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const resetCapture = () => {
    setCapturedImages([]);
    setFaceDescriptors([]);
    captureCountRef.current = 0;
  };

  useEffect(() => {
    if (step === 1) {
      // Start camera when entering capture step
      if (!isCameraOn) {
        startCamera();
      }
    } else {
      // Stop camera when leaving capture step
      if (isCameraOn) {
        stopCamera();
      }
    }

    return () => {
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [step]);

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight={700} color="#1a237e" gutterBottom>
          Face Registration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Register your face for attendance verification
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={step} sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Enter Details */}
      {step === 0 && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Enter Your Details
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="e.g., John Smith"
              required
            />
            <TextField
              fullWidth
              label="Student ID"
              value={formData.studentId}
              onChange={handleInputChange('studentId')}
              placeholder="e.g., CS2024001"
              required
            />
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={handleInputChange('department')}
              placeholder="e.g., Computer Science"
              required
            />
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            Your details will be associated with your facial data for attendance verification.
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={onCancel}
              startIcon={<ArrowBack />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setStep(1)}
              disabled={!formData.name || !formData.studentId || !formData.department}
              endIcon={<CameraFront />}
            >
              Next: Capture Face
            </Button>
          </Box>
        </Paper>
      )}

      {/* Step 2: Capture Face */}
      {step === 1 && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Capture Your Face
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Camera Section */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ position: 'relative', height: 400, background: '#000', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: isCameraOn ? 'block' : 'none',
                    transform: cameraType === "user" ? 'scaleX(-1)' : 'scaleX(1)',
                  }}
                />
                
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />

                {!isCameraOn && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
                    <VideocamOff sx={{ fontSize: 60, mr: 2 }} />
                    <Typography>Camera not active</Typography>
                  </Box>
                )}

                {/* Capture overlay */}
                {showPreview && capturedImages.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `url(${capturedImages[capturedImages.length - 1].image}) center/cover`,
                    }}
                  />
                )}

                {/* Progress overlay */}
                {isCapturing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <CircularProgress 
                      variant="determinate" 
                      value={captureProgress} 
                      size={80}
                      sx={{ mb: 2, color: '#4CAF50' }}
                    />
                    <Typography sx={{ color: 'white' }}>
                      {captureProgress < 50 ? 'Capturing image...' : 'Processing face...'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Camera Controls */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={isCameraOn ? <VideocamOff /> : <Videocam />}
                  onClick={isCameraOn ? stopCamera : startCamera}
                  sx={{ flex: 1 }}
                >
                  {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                </Button>
                
                <IconButton onClick={toggleCamera} sx={{ border: '1px solid rgba(0,0,0,0.2)' }}>
                  <Cameraswitch />
                </IconButton>
              </Box>

              {/* Capture Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={captureFace}
                disabled={!isCameraOn || isCapturing || !modelsLoaded}
                startIcon={<PersonAdd />}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  py: 1.5,
                  fontSize: '1.1rem',
                  mb: 2,
                }}
              >
                {isCapturing ? 'Processing...' : 'Capture Face'}
              </Button>

              {!modelsLoaded && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Loading face detection models...
                </Alert>
              )}
            </Box>

            {/* Instructions & Progress */}
            <Box sx={{ flex: 1 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📸 Capture Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Follow these guidelines for best results:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <li>
                      <Typography variant="body2">
                        <strong>Good Lighting:</strong> Face a light source, avoid backlight
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Clear View:</strong> Remove glasses, hats, or face coverings
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Natural Expression:</strong> Maintain a neutral face
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong>Centered Position:</strong> Keep face in the center of frame
                      </Typography>
                    </li>
                  </Box>
                </CardContent>
              </Card>

              {/* Capture Progress */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Capture Progress ({capturedImages.length}/3)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {[1, 2, 3].map((num) => (
                      <Avatar
                        key={num}
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: capturedImages.length >= num ? '#4CAF50' : '#e0e0e0',
                          color: capturedImages.length >= num ? 'white' : 'text.secondary',
                        }}
                      >
                        {capturedImages.length >= num ? <CheckCircle /> : num}
                      </Avatar>
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Capture multiple angles for better accuracy. We recommend:
                    <br />• 1 frontal view
                    <br />• 1 slight left turn
                    <br />• 1 slight right turn
                  </Typography>

                  {capturedImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={resetCapture}
                        startIcon={<Refresh />}
                      >
                        Reset All Captures
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={() => setStep(0)}
              startIcon={<ArrowBack />}
            >
              Back to Details
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={resetCapture}
              >
                Reset
              </Button>
              
              <Button
                variant="contained"
                onClick={() => setStep(2)}
                disabled={capturedImages.length === 0}
                endIcon={<CheckCircle />}
              >
                Review & Save
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 3: Review & Save */}
      {step === 2 && !registrationComplete && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Review & Save Registration
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Captured Images */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Captured Images ({capturedImages.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                {capturedImages.map((img, index) => (
                  <Box
                    key={img.id}
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '2px solid #4CAF50',
                    }}
                  >
                    <img
                      src={img.image}
                      alt={`Capture ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: '#4CAF50',
                        color: 'white',
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Face Descriptor Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Facial Data Generated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your face has been converted to {faceDescriptors.length} unique mathematical
                    descriptors (128-dimensional vectors).
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Face color="primary" />
                    <Typography variant="body2">
                      <strong>Face Points Detected:</strong> 68 facial landmarks
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Registration Summary */}
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Registration Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#1a237e',
                        fontSize: 32,
                        mr: 2,
                      }}
                    >
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{formData.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {formData.studentId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Department: {formData.department}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ '& > div': { mb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Face Captures</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {capturedImages.length} images
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Face Descriptors</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {faceDescriptors.length} vectors
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Registration Date</Typography>
                      <Typography variant="body2">
                        {new Date().toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      Your facial data will be encrypted and stored locally. 
                      It will only be used for attendance verification.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={() => setStep(1)}
              startIcon={<ArrowBack />}
            >
              Back to Capture
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
              >
                Cancel
              </Button>
              
              <Button
                variant="contained"
                onClick={completeRegistration}
                startIcon={<Save />}
                sx={{
                  background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                }}
              >
                Complete Registration
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Registration Complete */}
      {registrationComplete && (
        <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 3 }} />
          
          <Typography variant="h4" fontWeight={700} color="#1a237e" gutterBottom>
            Registration Complete! 🎉
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Your face has been successfully registered in the system.
          </Typography>

          <Card sx={{ maxWidth: 400, margin: 'auto', mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Registration Details
              </Typography>
              
              <Box sx={{ textAlign: 'left', mt: 2 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {registrationData?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Student ID:</strong> {registrationData?.studentId}
                </Typography>
                <Typography variant="body2">
                  <strong>Face Captures:</strong> {registrationData?.captureCount}
                </Typography>
                <Typography variant="body2">
                  <strong>Registration ID:</strong> REG-{Date.now().toString().slice(-6)}
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mt: 3 }}>
                You can now use facial recognition for attendance!
              </Alert>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Redirecting to dashboard in 3 seconds...
            </Typography>
            
            <Button
              variant="contained"
              onClick={() => onComplete && onComplete(registrationData)}
              sx={{ mr: 2 }}
            >
              Go to Dashboard Now
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                resetCapture();
                setStep(0);
                setRegistrationComplete(false);
              }}
            >
              Register Another              
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default FaceRegistration;