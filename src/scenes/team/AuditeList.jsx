import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const AuditeList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/User/Audite');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      let url;
      if (action === 'create' || action === 'activate') {
        url = `http://localhost:8080/User/enable/${userId}`;
      } else if (action === 'deactivate') {
        url = `http://localhost:8080/User/${userId}/deactivate`;
      }

      const response = await fetch(url, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, enabled: action !== 'deactivate' } : user
      ));
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      setError(`Failed to ${action} user. Please try again.`);
    }
  };

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "fullname",
      headerName: "Nom Complet",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        if (!params.row.enabled && params.row.createdTimestamp === null) {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUserAction(params.row.id, 'create')}
            >
              Créer
            </Button>
          );
        } else if (params.row.enabled) {
          return (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleUserAction(params.row.id, 'deactivate')}
            >
              Désactiver
            </Button>
          );
        } else {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUserAction(params.row.id, 'activate')}
            >
              Creer
            </Button>
          );
        }
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="AUDITÉS" subtitle="Gestion des comptes audités" />
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
        }}
      >
        <DataGrid rows={users} columns={columns} />
      </Box>
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AuditeList;