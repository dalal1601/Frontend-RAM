import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Snackbar, Alert, Checkbox, Button, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

// Fetch audits by userId
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

// Fetch action correctives by auditId
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

// Fetch action corrective status by userId and auditId
const fetchActionCorrectiveStatus = async (userId, auditId) => {
  try {
    const response = await fetch(`http://localhost:8080/ActionCorrectiveStatus/${userId}/${auditId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Fetching action corrective status failed: ${error.message}`);
  }
};

// Save or update action correctives .........
const saveActionCorrectiveStatus = async (actionCorrectiveStatus) => {
  try {
    const response = await fetch('http://localhost:8080/ActionCorrectiveStatus/saveOrUpdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actionCorrectiveStatus),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Save or update failed:', errorText);
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error(`Saving or updating action correctives failed: ${error.message}`);
    throw new Error(`Saving or updating action correctives failed: ${error.message}`);
  }
};

const ActionsCorrectives = () => {
  const [actionCorrectives, setActionCorrectives] = useState([]);
  const [actionCorrectiveStatus, setActionCorrectiveStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { userId } = useParams();

  // Fetch audits, action correctives, and their statuses
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const audits = await fetchAuditsByUserId(userId);

      if (audits.length > 0) {
        const auditId = audits[0].id;
        const actions = await fetchActionCorrectivesByAuditId(auditId);
        const status = await fetchActionCorrectiveStatus(userId, auditId);

        // Map action IDs to their `done` status
        const actionStatusMap = status.actionsState || {};

        // Update action correctives with their status
        const updatedActions = actions.map(action => ({
          ...action,
          done: actionStatusMap[action.id] || false
        }));

        setActionCorrectives(updatedActions);
        setActionCorrectiveStatus(status);
      } else {
        setError('Aucun audit trouvé pour cet utilisateur.');
      }
    } catch (err) {
      setError(`Erreur lors de la récupération des données: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (id) => {
    setActionCorrectives(prevActions =>
      prevActions.map(action =>
        action.id === id ? { ...action, done: !action.done } : action
      )
    );
  };

  // Save action corrective status
  const handleSave = async () => {
    const actionCorrectiveStatus = {
      userId: userId,
      auditId: actionCorrectives[0]?.auditId,
      actionsState: actionCorrectives.reduce((acc, action) => {
        acc[action.id] = action.done;
        return acc;
      }, {}),
    };
  
    console.log('Payload being sent:', JSON.stringify(actionCorrectiveStatus));
  
    // Send the save request
    const response = await fetch('http://localhost:8080/ActionCorrectiveStatus/saveOrUpdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actionCorrectiveStatus),
    });
  
    // Check if the response is OK
    if (response.ok) {
      setSuccess('Les actions correctives ont été mises à jour avec succès.');
    } else {
      const errorText = await response.text();
      setSuccess(`Erreur lors de la sauvegarde: ${errorText}`);
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
