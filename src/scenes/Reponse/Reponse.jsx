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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { useMediaQuery } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: '1.25rem',
    padding: theme.spacing(2),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

const SectionRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  '& > td': {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: theme.spacing(1, 2),
  },
}));

const ConfirmationDialog = ({ open, onClose, onConfirm, formulaire, checkedItems }) => {
  const theme = useTheme();
  
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Confirmation des réponses</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Règle</StyledTableCell>
                <StyledTableCell align="center">Réponse</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formulaire.sectionList.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <SectionRow>
                    <TableCell colSpan={2}>{section.description}</TableCell>
                  </SectionRow>
                  {section.regles.map((regle, regleIndex) => (
                    <TableRow key={`${sectionIndex}-${regleIndex}`}>
                      <TableCell>{regle.description}</TableCell>
                      <TableCell align="center">
                        <Typography color={checkedItems[regle.id] === 'Conform' ? 'success.main' : 'error.main'} fontWeight="bold">
                          {checkedItems[regle.id] === 'Conform' ? 'Conforme' : 'Non-Conforme'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={onConfirm}  variant="contained"  sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}>
          Confirmer
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

const Reponse = () => {
  const theme = useTheme();
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [audit, setAudit] = useState(null);
  const [formulaire, setFormulaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [checkedItems, setCheckedItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const auditId = '66a623f195dcbf298b724519'; // Assurez-vous que cet ID est mis à jour correctement

  const fetchAuditAndFormulaire = async () => {
    try {
      setLoading(true);
      setError(null);
      setCheckedItems({}); // Réinitialiser checkedItems

      const auditResponse = await fetch(`http://localhost:8080/Audit/${auditId}`);
      if (!auditResponse.ok) {
        throw new Error(`Failed to fetch audit: ${auditResponse.statusText}`);
      }
      const auditData = await auditResponse.json();
      setAudit(auditData);

      const formulaireId = auditData.formulaire.id;
      const formulaireResponse = await fetch(`http://localhost:8080/Formulaire/${formulaireId}`);
      if (!formulaireResponse.ok) {
        throw new Error(`Failed to fetch formulaire: ${formulaireResponse.statusText}`);
      }
      const formulaireData = await formulaireResponse.json();
      setFormulaire(formulaireData);

      console.log('Formulaire chargé:', formulaireData);
    } catch (error) {
      setError(`Une erreur est survenue lors du chargement des détails. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditAndFormulaire();
  }, [auditId]);

  const handleCheckboxChange = (regleId, value) => {
    setCheckedItems(prev => {
      const newCheckedItems = {
        ...prev,
        [regleId]: value,
      };
      console.log('Checked items updated:', newCheckedItems);
      return newCheckedItems;
    });
  };

  const isAllRulesAnswered = () => {
    if (!formulaire) return false;
    
    const allRegleIds = formulaire.sectionList.flatMap(section => 
      section.regles.map(regle => regle.id)
    );
    
    const answeredRegleIds = Object.keys(checkedItems);
    
    console.log('Toutes les règles:', allRegleIds);
    console.log('Règles répondues:', answeredRegleIds);
    
    const allAnswered = allRegleIds.every(regleId => answeredRegleIds.includes(regleId));
    console.log('Toutes les règles ont été répondues:', allAnswered);
    
    return allAnswered;
  };

  const handleSave = () => {
    if (isAllRulesAnswered()) {
      setOpenConfirmDialog(true);
    } else {
      setSnackbar({ open: true, message: 'Veuillez répondre à toutes les règles avant d\'enregistrer.', severity: 'warning' });
    }
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    setOpenConfirmDialog(false);
    
    const reponses = Object.entries(checkedItems).map(([regleId, value]) => ({
      [regleId]: value === 'Conform'
    }));

    const payload = {
      audit: { id: auditId },
      reponses: reponses,
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save data');
      }

      const result = await response.json();
      setSnackbar({ open: true, message: 'Données enregistrées avec succès!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Erreur lors de l'enregistrement des données: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!formulaire || !audit) return <Typography>Aucune donnée trouvée.</Typography>;

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
      <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#C2002F' }}>
        Détails de l'Audit
      </Typography>

      <Typography variant="h2" component="h2" sx={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '20px', color: theme.palette.text.primary }}>
        Formulaire: {formulaire.nom}
      </Typography>

      <TableContainer component={Paper} sx={{ marginBottom: '20px' }}>
        <Table sx={{ minWidth: 700 }} aria-label="form details">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sections</StyledTableCell>
              <StyledTableCell>Règles</StyledTableCell>
              <StyledTableCell>Conforme</StyledTableCell>
              <StyledTableCell>Non-Conforme</StyledTableCell>
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
                        checked={checkedItems[regle.id] === 'Conform'}
                        onChange={() => handleCheckboxChange(regle.id, 'Conform')}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={checkedItems[regle.id] === 'Non-Conform'}
                        onChange={() => handleCheckboxChange(regle.id, 'Non-Conform')}
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

      <ConfirmationDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmSave}
        formulaire={formulaire}
        checkedItems={checkedItems}
      />

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