import { Box, Typography, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const AuditeList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/User/Audite');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('There was an error fetching the users:', error);
        setError('Failed to fetch users. Please try again.');
      }
    };

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
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/User/enable/${userId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to activate user');
      }
      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, enabled: true } : user
      ));
    } catch (error) {
      console.error('Error activating user:', error);
      setError('Failed to activate user. Please try again.');
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
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center">
          {!params.row.enabled && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleActivateUser(params.row.id)}
            >
              Activer
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null); // Clear selected user when closing dialog
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    handleOpen();
  };



  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      let response;
      
        response = await fetch(`http://localhost:8080/User/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullname: `${values.firstName} ${values.lastName}`,
            email: values.email,
            mdp: values.mdp,
            role: "AUDITEUR", // Adjust as needed
          }),
        });
      

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(selectedUser ? 'User updated:' : 'User created:', data);
      handleClose();
      resetForm();
      setError(""); // Clear any previous errors
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('There was an error:', error);
      setError(selectedUser ? 'Failed to update user. Please try again.' : 'Failed to create user. Please try again.');
    }
  };



  const checkoutSchema = yup.object().shape({
    firstName: yup.string().required("required"),
    lastName: yup.string().required("required"),
    email: yup.string().email("invalid email").required("required"),
    mdp: yup.string().required("required"),
  });

  const initialValues = {
    firstName: selectedUser ? selectedUser.fullname.split(' ')[0] : "",
    lastName: selectedUser ? selectedUser.fullname.split(' ')[1] : "",
    email: selectedUser ? selectedUser.email : "",
    mdp: selectedUser ? selectedUser.mdp : "", 
  };

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      <Box display="flex" justifyContent="flex-end" m="20px 0">
       
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
        <DataGrid rows={users} columns={columns} />
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? "Vous voulez activer le comtpe de: " : "Create Auditor"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="20px"
                  gridTemplateColumns="repeat(2, 1fr)"
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="Prénom"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.firstName}
                    name="firstName"
                    error={!!touched.firstName && !!errors.firstName}
                    helperText={touched.firstName && errors.firstName}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="Nom"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.lastName}
                    name="lastName"
                    error={!!touched.lastName && !!errors.lastName}
                    helperText={touched.lastName && errors.lastName}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="email"
                    label="Email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                 
                </Box>
                <DialogActions sx={{ mt: 2 }}>
                  <Button onClick={handleClose} color="secondary">
                    Annuler
                  </Button>
                  <Button type="submit" color="primary">
                    {selectedUser ? "Sauvegarder" : "Créer"}
                  </Button>
                </DialogActions>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AuditeList;
