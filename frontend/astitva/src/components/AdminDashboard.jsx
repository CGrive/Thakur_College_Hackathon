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
  Button
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

const AdminDashboard = () => {
  return (
    <Box sx={{ display: "flex" }}>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />

        <Box sx={{ textAlign: "center", p: 2, fontFamily: "'Poppins', sans-serif" }}>
          <Avatar sx={{ width: 64, height: 64, m: "auto",fontFamily: "'Poppins', sans-serif" }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            Admin
          </Typography>
        </Box>

        <List>
          <ListItem button selected>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem button>
            <ListItemIcon><GroupIcon /></ListItemIcon>
            <ListItemText primary="Students" />
          </ListItem>

          <ListItem button>
            <ListItemIcon><AnalyticsIcon /></ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>

          <ListItem button>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>

          <ListItem button>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#f5f7fb", minHeight: "100vh",fontFamily: "'Poppins', sans-serif" }}>

        {/* Top Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: "'Poppins', sans-serif"}}>
              Admin Dashboard
            </Typography>

            <Button color="inherit">Refresh</Button>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content */}
        <Box sx={{ p: 3 }}>

          <Typography variant="h5" sx={{ mb: 3 }}>
            Overview
          </Typography>

          <Grid container spacing={3}>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography>Total Students</Typography>
                  <Typography variant="h4">245</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography>Attendance Today</Typography>
                  <Typography variant="h4">84%</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography>Active Sessions</Typography>
                  <Typography variant="h4">5</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography>Anomalies</Typography>
                  <Typography variant="h4" color="error">12</Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>

          {/* Recent Activity Table */}
          <Box sx={{ mt: 4, fontFamily: "'Poppins', sans-serif" }}>

            <Typography variant="h6" sx={{ mb: 2,fontFamily: "'Poppins', sans-serif" }}>
              Recent Attendance
            </Typography>

            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow>
                    <TableCell>Amit Sharma</TableCell>
                    <TableCell>Face Verification</TableCell>
                    <TableCell style={{ color: "green" }}>Verified</TableCell>
                    <TableCell>10:42 AM</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Neha Verma</TableCell>
                    <TableCell>Fingerprint</TableCell>
                    <TableCell style={{ color: "green" }}>Verified</TableCell>
                    <TableCell>10:39 AM</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Rahul Mehta</TableCell>
                    <TableCell>ID Card</TableCell>
                    <TableCell style={{ color: "red" }}>Rejected</TableCell>
                    <TableCell>10:35 AM</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
