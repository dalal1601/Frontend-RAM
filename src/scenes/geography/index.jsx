// src/pages/Geography.js
import React from 'react';
import { Box, useTheme } from "@mui/material";
import PowerBIReport from "../../components/GeographyChart";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="Carte Géographique" subtitle="Visualisez le nombre d'audits réalisés dans chaque ville" />
      <Box 
        height="75vh" 
        border={`1px solid ${colors.grey[100]}`} 
        borderRadius="4px"
      >
        <PowerBIReport />
      </Box>
    </Box>
  );
};

export default Geography;
