import { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const AllFormulaire = () => {
  const [formulaires, setFormulaires] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const columns = [
    { field: "nom", headerName: "Nom du formulaire", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/formulaire/${params.row.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchFormulaires();
  }, []);

  const fetchFormulaires = async () => {
    try {
      const response = await fetch("http://localhost:8080/Formulaire", {
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch formulaires");
      }
      const data = await response.json();
      setFormulaires(data);
    } catch (error) {
      console.error("Error fetching formulaires:", error);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="FORMULAIRE" subtitle="Gérer vos formulaires" />
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#C2002F',
            '&:hover': {
              backgroundColor: '#A5002A', // Une teinte légèrement plus foncée pour l'effet hover
            },
            '&:disabled': {
              backgroundColor: '#FFB3B3', // Une teinte plus claire pour l'état désactivé
            }
          }}
          onClick={() => navigate('/AuditForm')}
        >
          Créer un formulaire
        </Button>
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={formulaires}
          columns={columns}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </Box>
    </Box>
  );
};

export default AllFormulaire;
