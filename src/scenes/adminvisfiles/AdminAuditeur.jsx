import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';

const AdminAuditeur = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { auditId } = useParams();

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/Audit/${auditId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch audit data');
        }
        const data = await response.json();
        setAuditData(data);
      } catch (error) {
        console.error('Error fetching audit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, [auditId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!auditData) {
    return <Typography>Aucune donnée trouvée pour cet audit.</Typography>;
  }

  return (
    <Paper sx={{ p: 3, m: 'auto', maxWidth: 1000 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#C2002F', mb: 3 }}>
        GENERALITIES
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 5 }}>
        <Table sx={{ minWidth: 650 }} aria-label="generalities table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Champ</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Summary of airlines assisted</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={auditData.generalities?.summaryofairlinesassisted || ''}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Number of flights handled per day/month</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={auditData.generalities?.numberofflightshandledperdayinmonth || ''}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Number of check-in and boarding agents</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={auditData.generalities?.numberofcheckinandboardingagents || ''}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Number of ramp agents</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={auditData.generalities?.numberoframpagents || ''}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Number of supervisors</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={auditData.generalities?.numberofsupervisors || ''}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Number of GSE maintenance</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={auditData.generalities?.numberofgsemaintenance || ''}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      
    </Paper>
  );
};

export default AdminAuditeur;