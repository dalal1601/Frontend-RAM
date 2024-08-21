import React,{useState,useEffect} from "react";
import { Box, Typography, Grid } from "@mui/material";
import { styled, useTheme } from "@mui/system";
import Header from "../../components/Header";

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));


 

const App = () => {
  const theme = useTheme(); // Access the current theme
  const [idMongo, setIdMongo] = useState(null);

  useEffect(() => {
    const storedIdMongo = localStorage.getItem('idmongo');
    
    if (storedIdMongo) {
      setIdMongo(storedIdMongo);
      console.log('idMongo from localStorage:', storedIdMongo);
    } else {
      console.log('idMongo not found in localStorage');
    }
  }, []);


  const chartTheme = theme.palette.mode === "dark" ? "dark" : "light";

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={4} // Adds margin bottom to create space below the header
      >
        <Header title="TABLEAU DE BORD" subtitle="" />
      </Box>
      <StyledBox>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            marginBottom: "20px",
            color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000",
          }}
        >
          Explorez les informations grâce à la visualisation des données en temps réel
        </Typography>

        {/* Grid for Tickets */}
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "75%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bcde68-9a98-44da-89ab-139624e23320&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 1"
              ></iframe>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "75%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bcdd2b-9a98-4139-8eb1-139624d0a47f&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 2"
              ></iframe>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "75%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bcddde-dda6-4c39-8dbc-7266a96c577c&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 3"
              ></iframe>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "75%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bbb857-160a-4214-871f-7bacdf2b64e6&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 4"
              ></iframe>
            </Box>
          </Grid>
        </Grid>

        {/* Grid for Larger Charts */}
        <Grid container spacing={2} mt={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "75%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bbb2bb-ee0b-4dc0-8b14-820a63b4373c&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 5"
              ></iframe>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "75%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bbd067-160a-4463-81ca-7bacdfbeef34&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 6"
              ></iframe>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "50%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <iframe
                src={`https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bbd933-de7d-4e76-82a2-f5bc93eaeb3b&maxDataAge=3600&theme=${chartTheme}&autoRefresh=true`}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                title="MongoDB Atlas Chart 7"
              ></iframe>
            </Box>
          </Grid>
        </Grid>
      </StyledBox>
    </Box>
  );
};

export default App;
