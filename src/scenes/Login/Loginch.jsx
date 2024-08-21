import React, { useState } from "react";
import { 
  Avatar, Button, CssBaseline, TextField, Paper, Box, Grid, 
  Typography, createTheme, ThemeProvider, Alert, Snackbar 
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");


  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/User/checkPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
       const data = await response.json();
      if (!data.exists) {
        showSnackbar("Il n'y a pas de compte associé à cet email.", "error");
      } else if (!data.enabled) {
        showSnackbar("Ce compte n'est pas activé.", "warning");
      } else if (data.hasPassword) {
        setStep("password");
      } else {
        setStep("newPassword");
      }
    } catch (error) {
      showSnackbar("Erreur lors de la vérification de l'email", "error");
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/User/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
  
      const data = await response.json();
      console.log("Login response:", data);
      
      const idodi = JSON.parse(atob(data.access_token.split('.')[1]));
      const idm9ad=idodi.sub;

      if (data.access_token && data.idMongo) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("idmongo", data.idMongo);
        localStorage.setItem("id",idm9ad)

        console.log("idMongo stored in localStorage:", data.idMongo);
        navigate("/dashboard");
      } else {
        throw new Error("Login successful but required data is missing");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      setOpenSnackbar(true);
    }
  };

  const handleNewPasswordSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      showSnackbar("Les mots de passe ne correspondent pas", "error");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/User/addpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mdp: password }),
      });
      if (response.ok) {
        showSnackbar("Mot de passe défini avec succès", "success");
        setTimeout(() => navigate("login"), 2000);
      } else {
        showSnackbar("Erreur lors de la définition du mot de passe", "error");
      }
    } catch (error) {
      showSnackbar("Erreur lors de la définition du mot de passe", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} sx={{
        backgroundImage: "url('/assets/voleImage.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundColor: t => t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box sx={{ my: 8, mx: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/assets/images.png" alt="logo" style={{ width: '30%', height: '30%', objectFit: 'cover', marginBottom: "50px" }} />
          <Typography sx={{marginBottom:"50px"}} component="h1" variant="h7">Bienvenue à Votre Application</Typography>
          <Box component="form" noValidate onSubmit={
            step === "email" ? handleEmailSubmit : 
            step === "password" ? handlePasswordSubmit : 
            handleNewPasswordSubmit
            } sx={{ mt: 1 }}>
              {step === "email" && (
                <TextField 
                  margin="normal" 
                  required 
                  fullWidth 
                  id="email" 
                  label="Adresse Email" 
                  name="email" 
                  autoComplete="email" 
                  autoFocus 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              )}
              {(step === "password" || step === "newPassword") && (
                <TextField 
                
                  margin="normal" 
                  required 
                  fullWidth 
                  name="password" 
                  label="Mot de passe" 
                  type="password" 
                  id="password" 
                  autoComplete="current-password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              )}
              {step === "newPassword" && (
                <TextField 
                  margin="normal" 
                  required 
                  fullWidth 
                  name="confirmPassword" 
                  label="Confirmer le mot de passe" 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              )}
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  backgroundColor: '#C2002F',
                  '&:hover': { backgroundColor: '#A5002A' },
                  '&:disabled': { backgroundColor: '#FFB3B3' }
                }}
              >
                {step === "email" ? "Suivant" : 
                 step === "password" ? "Se Connecter" : 
                 "Définir le mot de passe"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width:'100%'}}>
          <Typography>{snackbarMessage}</Typography>
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}