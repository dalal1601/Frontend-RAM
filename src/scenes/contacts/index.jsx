import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { parse, format } from 'date-fns'; // Import date-fns
import { enUS } from 'date-fns/locale'; // Import locale for AM/PM format

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);

  // Fetch user data from Keycloak API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/User'); // Replace with actual Keycloak API endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Assuming the creation date is part of user data from Keycloak
        const usersWithDates = data.map(user => {
          const dateStr = user.creationDate; 
          let parsedDate = 'Invalid Date';

          try {
            const dateFormat = 'M/d/yyyy, h:mm:ss a';
            const date = parse(dateStr, dateFormat, new Date(), { locale: enUS });
            parsedDate = format(date, 'dd/MM/yyyy HH:mm:ss');
          } catch {
            parsedDate = 'Invalid Date';
          }

          return { ...user, dateCreation: parsedDate };
        });

        setUsers(usersWithDates);
      } catch (error) {
        console.error('There was an error fetching the users:', error);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "fullname", headerName: "Nom Complet", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    
    { field: "role", headerName: "Role", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header
        title="USERS"
        subtitle="List of Users with Their Details"
      />
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;
