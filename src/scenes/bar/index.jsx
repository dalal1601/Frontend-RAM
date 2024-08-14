import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";

const App = () => {
  
    return (
      <Box m="20px">
        <Header title="Carte thermique" subtitle="MongoDB Atlas Dashboard" />
        <Box
          height="75vh"
          sx={{
            iframe: {
              background: "#F1F5F4",
              border: "none",
              borderRadius: "2px",
              boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
              width: "100vw",
              height: "100vh",
            },
          }}
        >
          <iframe
            src="https://charts.mongodb.com/charts-project-0-kdgpwce/embed/charts?id=66bbd933-de7d-4e76-82a2-f5bc93eaeb3b&maxDataAge=3600&theme=light&autoRefresh=true"
            style={{
              background: "#F1F5F4",
              border: "none",
              borderRadius: "2px",
              boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
              width: "100%",
              height: "100%",
            }}
            title="MongoDB Atlas Dashboard"
          ></iframe>
        </Box>
      </Box>
    );
  };

export default App;
