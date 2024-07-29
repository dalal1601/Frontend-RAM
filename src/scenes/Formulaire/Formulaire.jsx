import BackspaceIcon from '@mui/icons-material/Backspace'; // Import the new icon
import React, { useState } from 'react';
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
  Snackbar,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.black,
    color: theme.palette.common.white,
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const SectionRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
}));

const AuditForm = () => {
  const theme = useTheme();
  const [formName, setFormName] = useState('');
  const [rows, setRows] = useState([{ type: 'section', content: '' }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addTextRow = (sectionIndex) => {
    const newRows = [...rows];
    let insertIndex = sectionIndex + 1;
    while (insertIndex < newRows.length && newRows[insertIndex].type !== 'section') {
      insertIndex++;
    }
    newRows.splice(insertIndex, 0, { type: 'question', content: '', correctiveAction: '' });
    setRows(newRows);
  };

  const addSectionRow = (sectionIndex) => {
    const newRows = [...rows];
    let insertIndex = sectionIndex + 1;
    while (insertIndex < newRows.length && newRows[insertIndex].type !== 'section') {
      insertIndex++;
    }
    newRows.splice(insertIndex, 0, { type: 'section', content: '' });
    setRows(newRows);
  };

  const removeSectionRow = (sectionIndex) => {
    // Ensure there are multiple sections before allowing deletion
    if (rows.length <= 1) {
      setError("Vous devez avoir au moins une section.");
      return;
    }
  
    const newRows = [...rows];
    let endIndex = sectionIndex + 1;
  
    // Find the end index of the section to remove
    while (endIndex < newRows.length && newRows[endIndex].type !== 'section') {
      endIndex++;
    }
  
    // Remove the section and its associated rows
    newRows.splice(sectionIndex, endIndex - sectionIndex);
    setRows(newRows);
  };

  const removeTextRow = (rowIndex) => {
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    setRows(newRows);
  };

  const handleContentChange = (index, field, newContent) => {
    const newRows = [...rows];
    newRows[index][field] = newContent;
    setRows(newRows);
  };

  const isFormValid = () => {
    if (!formName) {
      setError('Le nom du formulaire est obligatoire.');
      return false;
    }

    let hasSectionWithRules = false;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].type === 'section') {
        if (!rows[i].content) {
          setError(`La section ${i + 1} n'a pas de nom.`);
          return false;
        }
        let hasRules = false;
        for (let j = i + 1; j < rows.length && rows[j].type !== 'section'; j++) {
          if (rows[j].type === 'question') {
            if (!rows[j].content || !rows[j].correctiveAction) {
              setError(`La règle dans la section "${rows[i].content}" n'a pas de contenu ou d'action corrective.`);
              return false;
            }
            hasRules = true;
          }
        }
        if (!hasRules) {
          setError(`La section "${rows[i].content}" n'a pas de règles.`);
          return false;
        }
        hasSectionWithRules = true;
      }
    }

    if (!hasSectionWithRules) {
      setError('Le formulaire doit avoir au moins une section avec des règles.');
      return false;
    }

    setError('');
    return true;
  };

  const saveFormulaire = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      // Sauvegarder les règles
      const regles = rows.filter((row) => row.type === 'question').map((row) => ({
        description: row.content,
        actionCorrective: row.correctiveAction, // Now just a string
      }));

      const savedRegles = await Promise.all(
        regles.map((regle) =>
          fetch('http://localhost:8080/Regle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(regle),
          }).then((response) => response.json())
        )
      );

      // Sauvegarder les sections
      let sectionIndex = -1;
      const sections = rows.reduce((acc, row, index) => {
        if (row.type === 'section') {
          sectionIndex++;
          acc.push({ description: row.content, regles: [] });
        } else if (row.type === 'question') {
          acc[sectionIndex].regles.push(savedRegles[index - sectionIndex - 1]);
        }
        return acc;
      }, []);

      const savedSections = await Promise.all(
        sections.map((section) =>
          fetch('http://localhost:8080/Section', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(section),
          }).then((response) => response.json())
        )
      );

      // Sauvegarder le formulaire
      const formulaire = {
        nom: formName,
        sectionList: savedSections,
      };

      const savedFormulaire = await fetch('http://localhost:8080/Formulaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulaire),
      }).then((response) => response.json());

      console.log('Formulaire sauvegardé avec succès:', savedFormulaire);
      navigate('/formulaires');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du formulaire:', error);
      setError('Une erreur est survenue lors de la sauvegarde du formulaire.');
    }
  };

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        padding: 2,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontSize: '3rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '40px',
          marginBottom: '40px',
          width: '100%',
          color: theme.palette.primary.main,
        }}
      >
        Créer Votre Formulaire
      </Typography>

      <TextField
        label="Nom du formulaire"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        error={!formName}
        helperText={!formName ? 'Le nom du formulaire est obligatoire' : ''}
        sx={{
          marginBottom: '20px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: '1px',
              borderColor: theme.palette.text.primary,
            },
          },
        }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700, tableLayout: 'fixed' }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell colSpan={3}>{formName}</StyledTableCell>
            </TableRow>
            {/* Add headers for each column if needed */}
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <React.Fragment key={index}>
                {row.type === 'section' ? (
                  <SectionRow>
                    <StyledTableCell colSpan={3}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            value={row.content}
                            onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                            variant="standard"
                            placeholder="Entrez le nom de la section"
                            fullWidth
                            sx={{ marginRight: 2 }}
                          />
                          <IconButton onClick={() => addTextRow(index)}>
                            <AddCircleIcon sx={{ fontSize: 30 }} style={{ color: '#C2002F' }} />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton onClick={() => addSectionRow(index)}>
                            <AddBoxIcon sx={{ fontSize: 30 }} style={{ color: '#C2002F' }} />
                          </IconButton>
                          <IconButton 
                            onClick={() => removeSectionRow(index)}
                            disabled={rows.length <= 1} // Disable button if there's only one section
                          >
                            <BackspaceIcon sx={{ fontSize: 30 }} style={{ color: '#C2002F' }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </StyledTableCell>
                  </SectionRow>
                ) : (
                  <StyledTableRow>
                    <StyledTableCell>
                      <TextField
                        value={row.content}
                        onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                        variant="standard"
                        placeholder="Entrez le contenu de la règle"
                        fullWidth
                        sx={{ marginRight: 2 }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <TextField
                        value={row.correctiveAction}
                        onChange={(e) => handleContentChange(index, 'correctiveAction', e.target.value)}
                        variant="standard"
                        placeholder="Entrez l'action corrective"
                        fullWidth
                        sx={{ marginRight: 2 }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <IconButton onClick={() => removeTextRow(index)}>
                        <RemoveCircleIcon sx={{ fontSize: 30 }} style={{ color: '#C2002F' }} />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Button variant="contained" color="primary" onClick={saveFormulaire}>
          Sauvegarder le formulaire
        </Button>
      </Box>
    </Paper>
  );
};

export default AuditForm;
