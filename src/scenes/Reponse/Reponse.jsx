import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,
  Button,
  LinearProgress,
  Grid
} from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { useMediaQuery } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const Reponse = () => {
  const theme = useTheme();
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [formulaire, setFormulaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [checkedItems, setCheckedItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auditId = '66a547c4551a436bdb5c66f2';

  const fetchFormulaire = async () => {
    try {
      setLoading(true);
      setError(null);
      const auditResponse = await fetch(`http://localhost:8080/Audit/${auditId}`);
      if (!auditResponse.ok) {
        throw new Error(`Failed to fetch audit: ${auditResponse.statusText}`);
      }
      const auditData = await auditResponse.json();
      const formulaireId = auditData.formulaire.id;

      const response = await fetch(`http://localhost:8080/Formulaire/${formulaireId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch formulaire: ${response.statusText}`);
      }
      const data = await response.json();
      setFormulaire(data);
    } catch (error) {
      setError(`Une erreur est survenue lors du chargement des détails du formulaire. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulaire();
  }, []);

  const handleCheckboxChange = (sectionIndex, regleIndex, value) => {
    const key = `${sectionIndex}-${regleIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const formattedData = formulaire.sectionList.flatMap((section, sectionIndex) =>
      section.regles.map((regle, regleIndex) => ({
        regle: { id: regle.id },
        value: checkedItems[`${sectionIndex}-${regleIndex}`] === 'Conform'
      }))
    );

    const payload = {
      audit: { id: auditId },
      reponses: formattedData,
    };

    try {
      const response = await fetch('http://localhost:8080/Reponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const result = await response.json();
      setSnackbar({ open: true, message: 'Données enregistrées avec succès!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement des données.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!formulaire) return <Typography>Aucun formulaire trouvé.</Typography>;

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        padding: 3,
        margin: 'auto',
        maxWidth: 1000,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px',
          color: '#C2002F',
        }}
      >
        Détails du Formulaire
      </Typography>

      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontSize: '1.8rem',
          textAlign: 'center',
          marginBottom: '20px',
          color: theme.palette.text.primary,
        }}
      >
        Nom: {formulaire.nom}
      </Typography>

      <TableContainer component={Paper} sx={{ marginBottom: '20px' }}>
        <Table sx={{ minWidth: 700 }} aria-label="form details">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sections</StyledTableCell>
              <StyledTableCell>Règles</StyledTableCell>
              <StyledTableCell>Conform</StyledTableCell>
              <StyledTableCell>Non-Conform</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formulaire.sectionList.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 'bold', backgroundColor: theme.palette.action.hover }}>
                    {section.description}
                  </TableCell>
                </TableRow>
                {section.regles.map((regle, regleIndex) => (
                  <TableRow key={regleIndex}>
                    <TableCell></TableCell>
                    <TableCell>{regle.description}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={checkedItems[`${sectionIndex}-${regleIndex}`] === 'Conform'}
                        onChange={() => handleCheckboxChange(sectionIndex, regleIndex, 'Conform')}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={checkedItems[`${sectionIndex}-${regleIndex}`] === 'Non-Conform'}
                        onChange={() => handleCheckboxChange(sectionIndex, regleIndex, 'Non-Conform')}
                        color="secondary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justifyContent="center">
        <Button
          variant="contained"
          sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
        </Button>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Reponse;
