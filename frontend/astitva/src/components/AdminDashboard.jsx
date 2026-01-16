import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ClassIcon from "@mui/icons-material/Class";
import VerifiedIcon from "@mui/icons-material/Verified";
import ErrorIcon from "@mui/icons-material/Error";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { dashboardAPI, facultyAPI, studentAPI, attendanceAPI } from "../api/astitvaAPI";
import StudentRegistrationPage from "./StudentRegistrationPage";

const drawerWidth = 240;

// Dashboard View Component
const DashboardView = ({ stats, recentAttendance, onRefresh, isLoading }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Overview</Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={onRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                      <GroupIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Total Students
                      </Typography>
                      <Typography variant="h4">
                        {stats?.total_students || 0}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>
                      <VerifiedIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Today's Attendance
                      </Typography>
                      <Typography variant="h4">
                        {stats?.attendance_today || "0"}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.attendance_today || 0} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e8f5e9' }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#ed6c02', mr: 2 }}>
                      <ClassIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Active Lectures
                      </Typography>
                      <Typography variant="h4">
                        {stats?.active_sessions || 0}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#fff3e0' }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#d32f2f', mr: 2 }}>
                      <ErrorIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        Anomalies
                      </Typography>
                      <Typography variant="h4" color="error">
                        {stats?.anomalies || 0}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={20} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#ffebee' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Attendance
            </Typography>
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Confidence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAttendance?.length > 0 ? (
                    recentAttendance.map((attendance, index) => (
                      <TableRow key={index}>
                        <TableCell>{attendance.studentName}</TableCell>
                        <TableCell>{attendance.studentId}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={attendance.method === 'Face' ? <VerifiedIcon /> : 
                                  attendance.method === 'Fingerprint' ? <FingerprintIcon /> : 
                                  <QrCodeIcon />}
                            label={attendance.method}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={attendance.status}
                            size="small"
                            color={attendance.status === 'Verified' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{attendance.time}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={attendance.confidence}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="body2">
                              {attendance.confidence}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary">
                          No attendance records yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
};

// Students View Component
const StudentsView = ({ students, onAddStudent }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toString().includes(searchTerm)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Student Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={onAddStudent}
        >
          Add New Student
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search students by name or ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    {student.full_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {student.full_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ID: {student.student_id}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Department:</strong> {student.department || "Not specified"}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Year:</strong> {student.year || "Not specified"}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Email:</strong> {student.email || "Not available"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Face Enrolled:</strong> {student.face_encoding ? "Yes" : "No"}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                  <Button size="small" variant="outlined" color="secondary">
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Reports View Component
const ReportsView = () => {
  const [dateRange, setDateRange] = useState("today");
  const [reportData, setReportData] = useState({
    dailyAttendance: [],
    lectureStats: [],
    anomalies: []
  });

  const generateReport = () => {
    // Mock data - replace with API call
    setReportData({
      dailyAttendance: [
        { date: "2024-01-17", present: 85, absent: 15 },
        { date: "2024-01-16", present: 82, absent: 18 },
        { date: "2024-01-15", present: 88, absent: 12 },
      ],
      lectureStats: [
        { subject: "Mathematics", attendance: 92 },
        { subject: "Physics", attendance: 85 },
        { subject: "Computer Science", attendance: 96 },
      ],
      anomalies: [
        { student: "John Doe", time: "10:30 AM", reason: "Multiple face matches" },
        { student: "Jane Smith", time: "11:15 AM", reason: "Low confidence score" },
      ]
    });
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Attendance Reports
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Date Range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
          <MenuItem value="custom">Custom Range</MenuItem>
        </TextField>
        <Button variant="contained" onClick={generateReport}>
          Generate Report
        </Button>
        <Button variant="outlined">
          Export CSV
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Attendance Trend
              </Typography>
              {reportData.dailyAttendance.map((day, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{day.date}</Typography>
                    <Typography variant="body2">{day.present}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={day.present}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lecture-wise Attendance
              </Typography>
              {reportData.lectureStats.map((lecture, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{lecture.subject}</Typography>
                    <Typography variant="body2">{lecture.attendance}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={lecture.attendance}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e8f5e9' }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Anomalies Detected
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.anomalies.map((anomaly, index) => (
                    <TableRow key={index}>
                      <TableCell>{anomaly.student}</TableCell>
                      <TableCell>{anomaly.time}</TableCell>
                      <TableCell>
                        <Chip 
                          label={anomaly.reason} 
                          size="small" 
                          color="warning"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Settings View Component
const SettingsView = () => {
  const [settings, setSettings] = useState({
    attendanceThreshold: 75,
    notificationEnabled: true,
    autoMarkEnabled: false,
    cameraQuality: "high",
    dataRetention: 30
  });

  const handleSettingChange = (setting) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [setting]: value });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Settings
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Minimum Confidence Threshold
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={settings.attendanceThreshold}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography>{settings.attendanceThreshold}%</Typography>
                </Box>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.attendanceThreshold}
                  onChange={handleSettingChange('attendanceThreshold')}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </Box>

              <TextField
                fullWidth
                select
                label="Data Retention Period"
                value={settings.dataRetention}
                onChange={handleSettingChange('dataRetention')}
                sx={{ mb: 2 }}
              >
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={365}>1 year</MenuItem>
                <MenuItem value={0}>Never delete</MenuItem>
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Enable Email Notifications
                </Typography>
                <Button
                  variant={settings.notificationEnabled ? "contained" : "outlined"}
                  onClick={() => setSettings({ ...settings, notificationEnabled: !settings.notificationEnabled })}
                  size="small"
                >
                  {settings.notificationEnabled ? "Enabled" : "Disabled"}
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Auto-mark Attendance
                </Typography>
                <Button
                  variant={settings.autoMarkEnabled ? "contained" : "outlined"}
                  onClick={() => setSettings({ ...settings, autoMarkEnabled: !settings.autoMarkEnabled })}
                  size="small"
                  color="secondary"
                >
                  {settings.autoMarkEnabled ? "Enabled" : "Disabled"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      API Version
                    </Typography>
                    <Typography variant="h6">
                      1.0.0
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Database
                    </Typography>
                    <Typography variant="h6">
                      SQLite
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Last Backup
                    </Typography>
                    <Typography variant="h6">
                      2 hours ago
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      System Status
                    </Typography>
                    <Chip label="Operational" color="success" size="small" />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Logout Confirmation Dialog
const LogoutDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to logout from the admin dashboard?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Fetch initial data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsData = await dashboardAPI.getStats();
      setStats(statsData);

      // Fetch students
      const studentsData = await studentAPI.getAllStudents();
      setStudents(studentsData);

      // Mock recent attendance data
      setRecentAttendance([
        { studentName: "Amit Sharma", studentId: "2024001", method: "Face", status: "Verified", time: "10:42 AM", confidence: 98 },
        { studentName: "Neha Verma", studentId: "2024002", method: "Fingerprint", status: "Verified", time: "10:39 AM", confidence: 92 },
        { studentName: "Rahul Mehta", studentId: "2024003", method: "ID Card", status: "Rejected", time: "10:35 AM", confidence: 45 },
        { studentName: "Priya Singh", studentId: "2024004", method: "Face", status: "Verified", time: "10:30 AM", confidence: 96 },
        { studentName: "Karan Patel", studentId: "2024005", method: "QR Code", status: "Verified", time: "10:25 AM", confidence: 88 },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showSnackbar("Failed to fetch data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLogout = () => {
    // Clear any auth tokens or session data
    localStorage.removeItem("adminToken");
    // Redirect to login page
    window.location.href = "/login";
  };

  const handleAddStudent = () => {
    setCurrentView("addStudent");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    fetchDashboardData(); // Refresh data when returning
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            stats={stats}
            recentAttendance={recentAttendance}
            onRefresh={fetchDashboardData}
            isLoading={isLoading}
          />
        );
      case "students":
        return <StudentsView students={students} onAddStudent={handleAddStudent} />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SettingsView />;
      case "addStudent":
        return (
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToDashboard}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            <StudentRegistrationPage />
          </Box>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: "border-box",
            bgcolor: "#1a237e",
            color: "white",
          },
        }}
      >
        <Toolbar />

        <Box sx={{ textAlign: "center", p: 2 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              m: "auto",
              bgcolor: "white",
              color: "#1a237e",
              fontSize: 24,
              fontWeight: "bold"
            }}
          >
            A
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
            Admin Panel
          </Typography>
        </Box>

        <List>
          {[
            { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
            { id: "students", label: "Students", icon: <GroupIcon /> },
            { id: "reports", label: "Reports", icon: <AnalyticsIcon /> },
            { id: "settings", label: "Settings", icon: <SettingsIcon /> },
          ].map((item) => (
            <ListItem 
              button 
              key={item.id}
              selected={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
              sx={{
                color: currentView === item.id ? "#1a237e" : "white",
                bgcolor: currentView === item.id ? "white" : "transparent",
                "&:hover": {
                  bgcolor: currentView === item.id ? "white" : "rgba(255,255,255,0.1)",
                }
              }}
            >
              <ListItemIcon sx={{ color: currentView === item.id ? "#1a237e" : "white" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontWeight: currentView === item.id ? 600 : 400
                }}
              />
            </ListItem>
          ))}

          <ListItem 
            button 
            onClick={() => setLogoutDialogOpen(true)}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              }
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        bgcolor: "#f5f7fb", 
        minHeight: "100vh",
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`
      }}>
        {/* Top Bar */}
        <AppBar 
          position="static" 
          sx={{ 
            bgcolor: "white", 
            color: "#1a237e",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {currentView === "dashboard" && "Dashboard"}
              {currentView === "students" && "Student Management"}
              {currentView === "reports" && "Attendance Reports"}
              {currentView === "settings" && "System Settings"}
              {currentView === "addStudent" && "Register New Student"}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={isLoading ? "Loading..." : "System Online"} 
                color={isLoading ? "warning" : "success"} 
                size="small"
              />
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchDashboardData}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content */}
        <Box sx={{ p: 3 }}>
          {renderView()}
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Import ArrowBackIcon if needed
import { ArrowBack } from "@mui/icons-material";
const ArrowBackIcon = ArrowBack;

export default AdminDashboard;