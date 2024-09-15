import React, { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  createTheme,
  ThemeProvider,
  Alert,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
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
      if (data.access_token) {
        const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
        const userId = tokenPayload.sub;

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("idmongo", data.idMongo);
        localStorage.setItem("id", userId);

        // Fetch user details to determine the role
        const userResponse = await fetch(`http://localhost:8080/User/${userId}`, {
          headers: { "Authorization": `Bearer ${data.access_token}` }
        });
        
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }
        
        const userData = await userResponse.json();

        // Redirect based on the user's role
        switch (userData.role) {
          case 'ADMIN':
            navigate("/dashboard");
            break;
          case 'AUDITEUR':
            navigate(`/Audits/${userId}`);
            break;
          case 'AUDITE':
            navigate(`/form/${userId}`);
            break;
          default:
            throw new Error("Unknown user role");
        }
      } else {
        throw new Error("Login successful but required data is missing");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Les informations que vous avez saisies sont incorrectes");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url('/assets/voleImage.jpg')",
            backgroundRepeat: "no-repeat",
            backgroundColor: t => t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box sx={{ my: 8, mx: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img 
              src="/assets/images.png"
              alt="logo"
              style={{ 
                width: '30%',
                height: 'auto',
                objectFit: 'contain',   
                marginBottom: "50px"
              }}
            />
            <Typography component="h1" variant="h5">Bienvenue à Votre Application</Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mt: 3, 
                  mb: 2,    
                  backgroundColor: '#C2002F',
                  '&:hover': {
                    backgroundColor: '#A5002A',
                  },
                  '&:disabled': {
                    backgroundColor: '#FFB3B3',
                  }
                }}
              >
                Se connecter
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{width:'100%'}}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}