import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import { ErrorMessage } from "formik";

const defaultTheme = createTheme();

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (event) => {
    event.preventDefault();
  

    try{

        const response = await fetch("http://localhost:8080/User/login", {
            method:"POST",
            headers:{
                "Content-Type": "application/json",
            },
            body:JSON.stringify({username:email,password}),
        });

        if(!response.ok){
            const errorData = await response.json();
            throw new Error ( errorData.error || "Login failed");
        }
        const data = await response.json();

        const idodi = JSON.parse(atob(data.access_token.split('.')[1]));

       const idm9ad=idodi.sub; console.log("------------ id: " + idodi.sub);
         console.log("all data : ßßßßßßßß :", data); 
         localStorage.setItem("token",data.access_token);
          localStorage.setItem("IdUser",idm9ad)



        navigate("/dashboard");
    }catch(error){
       
        setOpenSnackbar(true);
    }

  }

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
       
            <img src="/assets/images.png"
                alt="logo"
                style={{ width : '30%',
                         height:'30%',
                         objectFit : 'cover',   
                        marginBottom:"50px"
                         
                         }}
            />
           
            <Typography component="h1" variant="h7">Bienvenu a Votre Application</Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <Typography color="error">{error}</Typography>}
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 ,    backgroundColor: '#C2002F',
            '&:hover': {
              backgroundColor: '#A5002A', // Une teinte légèrement plus foncée pour l'effet hover
            },
            '&:disabled': {
              backgroundColor: '#FFB3B3', // Une teinte plus claire pour l'état désactivé
            }}}>Sign In</Button>
               
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{width:'100%'}}>
            <Typography>Les informations que vous avez saisies sont incorrectes</Typography>
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
