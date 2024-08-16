// src/pages/ActionsCorrectives.js
import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Snackbar, Alert, Checkbox, Button, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const fetchAuditsByUserId = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8080/Audit/audite/${userId}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch failed:', errorText);
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetching audits failed: ${error.message}`);
    throw new Error(`Fetching audits failed: ${error.message}`);
  }
};

const fetchActionCorrectivesByAuditId = async (auditId) => {
  try {
    const response = await fetch(`http://localhost:8080/ActionCorrective/audit/${auditId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Fetching action correctives failed: ${error.message}`);
  }
};

const updateActionCorrectives = async (actionCorrectives) => {
  try {
    const response = await fetch(`http://localhost:8080/ActionCorrective/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actionCorrectives),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update failed:', errorText);
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error(`Updating action correctives failed: ${error.message}`);
    throw new Error(`Updating action correctives failed: ${error.message}`);
  }
};

const ActionsCorrectives = () => {
  const [actionCorrectives, setActionCorrectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { userId } = useParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const audits = await fetchAuditsByUserId(userId);

      if (audits.length > 0) {
        const auditId = audits[0].id;
        const actions = await fetchActionCorrectivesByAuditId(auditId);
        setActionCorrectives(actions);
      } else {
        setError('Aucun audit trouvé pour cet utilisateur.');
      }
    } catch (err) {
      setError(`Erreur lors de la récupération des données: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setActionCorrectives(prevActions =>
      prevActions.map(action =>
        action.id === id ? { ...action, done: !action.done } : action
      )
    );
  };

  const handleSave = async () => {
    try {
      await updateActionCorrectives(actionCorrectives);
      setSuccess('Les actions correctives ont été mises à jour avec succès.');
    } catch (err) {
      setError(`Erreur lors de la sauvegarde: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        padding: 3,
        margin: 'auto',
        maxWidth: 1000,
      }}
    >
      <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        Actions Correctives Non Conformes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Description(s)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actionCorrectives.map(action => (
              <TableRow key={action.id}>
                <TableCell>{action.descriptions.join(', ')}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={action.done}
                    onChange={() => handleCheckboxChange(action.id)}
                    sx={{
                      color: 'red',
                      '&.Mui-checked': {
                        color: 'red',
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Button
          variant="contained"
          color="error"
          onClick={handleSave}
        >
          Enregistrer
        </Button>
      </Box>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ActionsCorrectives;
