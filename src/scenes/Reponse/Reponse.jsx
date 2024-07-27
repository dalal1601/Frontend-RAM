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
  Button
} from '@mui/material';

const Reponse = () => {
  const [formulaire, setFormulaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [checkedItems, setCheckedItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auditId = '66a4395fc079a82b62de68ba';

  const fetchFormulaire = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching formulaire...');
      const response = await fetch('http://localhost:8080/Formulaire/66a41899c079a82b62de68b9');
      if (!response.ok) {
        throw new Error(`Failed to fetch formulaire: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Formulaire data:', data);
      setFormulaire(data);
    } catch (error) {
      console.error('Error fetching formulaire:', error);
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
      console.log('Data saved:', result);
      setSnackbar({ open: true, message: 'Données enregistrées avec succès!', severity: 'success' });
    } catch (error) {
      console.error('Error saving data:', error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement des données.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!formulaire) return <Typography>Aucun formulaire trouvé.</Typography>;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', padding: 2 }}>
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px',
          width: '100%',
          color: '#C2002F',
        }}
      >
        Détails du Formulaire
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="form details">
          <TableHead>
            <TableRow>
              <TableCell>Sections</TableCell>
              <TableCell>Règles</TableCell>
              <TableCell>Conform</TableCell>
              <TableCell>Non-Conform</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formulaire.sectionList.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>{section.description}</TableCell>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
        </Button>
      </Box>
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
