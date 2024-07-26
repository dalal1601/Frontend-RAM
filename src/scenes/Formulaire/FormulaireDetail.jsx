import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  Typography,
  Box,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import Header from "../../components/Header";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const SectionRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
}));

const FormulaireDetail = () => {
  const [formulaire, setFormulaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    fetchFormulaireDetail();
  }, [id]);

  const fetchFormulaireDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/Formulaire/${id}`, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch Formulaire details");
      }
      const data = await response.json();
      setFormulaire(data);
    } catch (error) {
      console.error("Error fetching Formulaire details:", error);
      setError("Une erreur est survenue lors du chargement des détails du formulaire.");
    } finally {
      setLoading(false);
    }
  };

  const addTextRow = (sectionIndex) => {
    setFormulaire(prevFormulaire => {
      const newFormulaire = { ...prevFormulaire };
      newFormulaire.sectionList[sectionIndex].regles.push({ description: '' });
      return newFormulaire;
    });
  };
  
  const removeSection = (sectionIndex) => {
    setFormulaire(prevFormulaire => {
      const newFormulaire = { ...prevFormulaire };
      if (newFormulaire.sectionList.length > 1) {
        newFormulaire.sectionList.splice(sectionIndex, 1);
      } else {
        setSnackbar({ open: true, message: "Vous ne pouvez pas supprimer la dernière section", severity: 'warning' });
      }
      return newFormulaire;
    });
  };

  const addSectionRow = (sectionIndex) => {
    setFormulaire(prevFormulaire => {
      const newFormulaire = { ...prevFormulaire };
      newFormulaire.sectionList.splice(sectionIndex + 1, 0, { description: '', regles: [] });
      return newFormulaire;
    });
  };

  const removeNextSection = (sectionIndex) => {
    setFormulaire(prevFormulaire => {
      const newFormulaire = { ...prevFormulaire };
      if (sectionIndex < newFormulaire.sectionList.length - 1) {
        newFormulaire.sectionList.splice(sectionIndex + 1, 1);
      }
      return newFormulaire;
    });
  };

  const removeLastTextRow = (sectionIndex) => {
    setFormulaire(prevFormulaire => {
      const newFormulaire = { ...prevFormulaire };
      if (newFormulaire.sectionList[sectionIndex].regles.length > 0) {
        newFormulaire.sectionList[sectionIndex].regles.pop();
      }
      return newFormulaire;
    });
  };
  

  const handleContentChange = (sectionIndex, regleIndex, newContent) => {
    setFormulaire(prevFormulaire => {
      const newFormulaire = { ...prevFormulaire };
      if (regleIndex === -1) {
        newFormulaire.sectionList[sectionIndex].description = newContent;
      } else {
        newFormulaire.sectionList[sectionIndex].regles[regleIndex].description = newContent;
      }
      return newFormulaire;
    });
  };


  const handleFormulaireNameChange = (newName) => {
    setFormulaire(prevFormulaire => ({
      ...prevFormulaire,
      nom: newName
    }));
  };

  const isFormValid = () => {
    if (!formulaire.nom) return false;
    for (const section of formulaire.sectionList) {
      if (!section.description) return false;
      if (section.regles.length === 0) return false; // Vérifie qu'il y a au moins une règle
      for (const regle of section.regles) {
        if (!regle.description) return false;
      }
    }
    return true;
  };

  const saveFormulaire = async () => {

    if (!isFormValid()) {
        setSnackbar({ open: true, message: "Veuillez remplir tous les champs obligatoires", severity: 'error' });
        return;
      }

    try {
      const response = await fetch(`http://localhost:8080/Formulaire/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulaire),
      });
      if (!response.ok) {
        throw new Error("Failed to update Formulaire");
      }
      const updatedFormulaire = await response.json();
      setFormulaire(updatedFormulaire);
      setSnackbar({ open: true, message: 'Formulaire mis à jour avec succès', severity: 'success' });
    
        navigate('/formulaires');  // Assurez-vous que ce chemin correspond à votre route pour la liste des formulaires
      
      console.log('Formulaire mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du formulaire:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!formulaire) return <Typography>Aucun formulaire trouvé.</Typography>;

 
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', padding: 2 }}>
      <Header title="Détails du formulaire" subtitle="Modifier votre formulaire" />
      
      <TextField 
        label="Nom du formulaire"
        value={formulaire.nom}
        onChange={(e) => handleFormulaireNameChange(e.target.value)}
        fullWidth
        margin="normal"
      />
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Sections et Règles</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formulaire.sectionList.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <SectionRow>
                  <StyledTableCell colSpan={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          value={section.description}
                          onChange={(e) => handleContentChange(sectionIndex, -1, e.target.value)}
                          variant="standard"
                          placeholder="Nom de la section"
                          error={!section.description}
                        />
                        <IconButton onClick={() => addTextRow(sectionIndex)}>
                          <ArrowDropDownCircleIcon fontSize='large' sx={{ color: '#C2002F' }} />
                        </IconButton>
                        <IconButton onClick={() => removeLastTextRow(sectionIndex)}>
                          <ArrowCircleUpIcon fontSize='large' sx={{ color: '#C2002F' }} />
                        </IconButton>
                      </Box>
                      <Box>
                        <IconButton onClick={() => addSectionRow(sectionIndex)}>  
                          <AddCircleIcon fontSize='large' sx={{ color: '#C2002F' }} />
                        </IconButton>
                        <IconButton onClick={() => removeSection(sectionIndex)}>
                          <RemoveCircleIcon fontSize='large' sx={{ color: '#C2002F' }}/>
                        </IconButton>
                      </Box>
                    </Box>
                  </StyledTableCell>
                </SectionRow>
                {section.regles.map((regle, regleIndex) => (
                  <StyledTableRow key={regleIndex}>
                    <StyledTableCell>
                      <TextField
                        value={regle.description}
                        onChange={(e) => handleContentChange(sectionIndex, regleIndex, e.target.value)}
                        fullWidth
                        variant="standard"
                        placeholder="Description de la règle"
                        error={!regle.description}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
          onClick={saveFormulaire}
          disabled={!isFormValid()}
        >
          Enregistrer
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

export default FormulaireDetail;