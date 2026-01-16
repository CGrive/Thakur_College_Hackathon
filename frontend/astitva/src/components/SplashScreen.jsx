import React, { useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import logo from "../assets/logo.png";
import Avatar from "@mui/material/Avatar";

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #6a11cb 0%, #ddc0e0 100%)",
                fontFamily: "'Poppins', sans-serif",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                },
            }}
        >
            {/* Floating elements for glassmorphism effect */}
            <Box
                sx={{
                    position: "absolute",
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    backdropFilter: "blur(10px)",
                    top: "10%",
                    left: "10%",
                    zIndex: 1,
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(168, 239, 255, 0.15) 0%, rgba(168, 239, 255, 0.05) 100%)",
                    backdropFilter: "blur(10px)",
                    bottom: "15%",
                    right: "15%",
                    zIndex: 1,
                }}
            />

            {/* Main glass card */}
            <Box
                sx={{
                    textAlign: "center",
                    backdropFilter: "blur(16px) saturate(180%)",
                    WebkitBackdropFilter: "blur(16px) saturate(180%)",
                    background: "rgba(255, 255, 255, 0.12)",
                    borderRadius: "32px",
                    padding: { xs: "35px 45px", md: "45px 70px" },
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: `
                        0 25px 50px rgba(0, 0, 0, 0.25),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3),
                        inset 0 0 20px rgba(255, 255, 255, 0.1)
                    `,
                    zIndex: 2,
                    position: "relative",
                    width: { xs: "85%", sm: "70%", md: "auto" },
                    maxWidth: "550px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        background: "rgba(255, 255, 255, 0.15)",
                        boxShadow: `
                            0 30px 60px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.4),
                            inset 0 0 25px rgba(255, 255, 255, 0.15)
                        `,
                    },
                }}
            >
                {/* Inner glow effect */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "32px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
                        pointerEvents: "none",
                        zIndex: -1,
                    }}
                />

                <Avatar
                    src={logo}
                    alt="Astitva Logo"
                    sx={{
                        width: { xs: 140, md: 180 },
                        height: { xs: 140, md: 180 },
                        margin: "auto",
                        bgcolor: "transparent",
                        filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))",
                        animation: "fade 1s ease-in-out infinite",

                        
                    }}
                />

                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: "#FFFFFF",
                        mt: 3,
                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                        background: "linear-gradient(90deg, #FFFFFF, #E0E7FF)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: { xs: "1.75rem", md: "2.125rem" },
                    }}
                >
                    Astitva Attendance System
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        mt: 2,
                        color: "rgba(255, 255, 255, 0.85)",
                        fontWeight: 300,
                        letterSpacing: "0.5px",
                        fontSize: { xs: "1rem", md: "1.1rem" },
                    }}
                >
                    Initializing Platform...
                </Typography>

                <CircularProgress
                    size={32}
                    sx={{
                        mt: 4,
                        color: "#FFFFFF",
                        "& .MuiCircularProgress-circle": {
                            strokeLinecap: "round",
                        },
                    }}
                />

                {/* Decorative line */}
                <Box
                    sx={{
                        width: "60%",
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                        margin: "30px auto 0",
                    }}
                />
            </Box>

            {/* Bottom text */}
            <Typography
                variant="caption"
                sx={{
                    position: "absolute",
                    bottom: "30px",
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "0.85rem",
                    zIndex: 2,
                    letterSpacing: "0.5px",
                }}
            >
                Secure • Efficient • Reliable
            </Typography>
        </Box>
    );
};

export default SplashScreen;