import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  CircularProgress
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
  const { id } = useParams();

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
    const newFormulaire = { ...formulaire };
    newFormulaire.sectionList[sectionIndex].regles.push({ description: '' });
    setFormulaire(newFormulaire);
  };

  const addSectionRow = (sectionIndex) => {
    const newFormulaire = { ...formulaire };
    newFormulaire.sectionList.splice(sectionIndex + 1, 0, { description: '', regles: [] });
    setFormulaire(newFormulaire);
  };

  const removeNextSection = (sectionIndex) => {
    const newFormulaire = { ...formulaire };
    if (sectionIndex < newFormulaire.sectionList.length - 1) {
      newFormulaire.sectionList.splice(sectionIndex + 1, 1);
      setFormulaire(newFormulaire);
    }
  };

  const removeLastTextRow = (sectionIndex) => {
    const newFormulaire = { ...formulaire };
    if (newFormulaire.sectionList[sectionIndex].regles.length > 0) {
      newFormulaire.sectionList[sectionIndex].regles.pop();
      setFormulaire(newFormulaire);
    }
  };

  const handleContentChange = (sectionIndex, regleIndex, newContent) => {
    const newFormulaire = { ...formulaire };
    if (regleIndex === -1) {
      newFormulaire.sectionList[sectionIndex].description = newContent;
    } else {
      newFormulaire.sectionList[sectionIndex].regles[regleIndex].description = newContent;
    }
    setFormulaire(newFormulaire);
  };

  const saveFormulaire = async () => {
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
      console.log('Formulaire mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du formulaire:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!formulaire) {
    return (
      <Box m="20px">
        <Typography>Aucun formulaire trouvé.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', padding: 2 }}>
      <Header title={formulaire.nom} subtitle="Détails du formulaire" />
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>{formulaire.nom}</StyledTableCell>
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
                        <IconButton onClick={() => removeNextSection(sectionIndex)}>
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
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '20px',
        }}
      >
        <Button
          sx={{
            padding: '10px 30px',
            color: 'white',
            backgroundColor: '#C2002F',
            '&:hover': {
              backgroundColor: '#C2002F', 
            },
          }}
          variant="contained"
          onClick={saveFormulaire}
        >
          Enregistrer
        </Button>
      </Box>
    </Paper>
  );
};

export default FormulaireDetail;