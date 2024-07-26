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
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

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

const AuditForm = () => {
  const [formName, setFormName] = useState('');
  const [rows, setRows] = useState([
    { type: 'section', content: '' }
  ]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addTextRow = (sectionIndex) => {
    const newRows = [...rows];
    let insertIndex = sectionIndex + 1;
    while (insertIndex < newRows.length && newRows[insertIndex].type !== 'section') {
      insertIndex++;
    }
    newRows.splice(insertIndex, 0, { type: 'question', content: '' });
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

  const removeNextSection = (sectionIndex) => {
    const newRows = [...rows];
    let nextSectionIndex = sectionIndex + 1;
    while (nextSectionIndex < newRows.length && newRows[nextSectionIndex].type !== 'section') {
      nextSectionIndex++;
    }
    if (nextSectionIndex < newRows.length) {
      let endIndex = nextSectionIndex + 1;
      while (endIndex < newRows.length && newRows[endIndex].type !== 'section') {
        endIndex++;
      }
      newRows.splice(nextSectionIndex, endIndex - nextSectionIndex);
      setRows(newRows);
    }
  };

  const removeLastTextRow = (sectionIndex) => {
    const newRows = [...rows];
    let lastQuestionIndex = -1;
    for (let i = sectionIndex + 1; i < newRows.length; i++) {
      if (newRows[i].type === 'section') break;
      if (newRows[i].type === 'question') lastQuestionIndex = i;
    }
    if (lastQuestionIndex !== -1) {
      newRows.splice(lastQuestionIndex, 1);
      setRows(newRows);
    }
  };

  const handleContentChange = (index, newContent) => {
    const newRows = [...rows];
    newRows[index].content = newContent;
    setRows(newRows);
  };

  const isFormValid = () => {
    if (!formName) {
      setError("Le nom du formulaire est obligatoire.");
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
            if (!rows[j].content) {
              setError(`La règle dans la section "${rows[i].content}" n'a pas de contenu.`);
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
      setError("Le formulaire doit avoir au moins une section avec des règles.");
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
      const regles = rows.filter(row => row.type === 'question').map(row => ({ description: row.content }));
      const savedRegles = await Promise.all(regles.map(regle => 
        fetch('http://localhost:8080/Regle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(regle),
        }).then(response => response.json())
      ));

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

      const savedSections = await Promise.all(sections.map(section => 
        fetch('http://localhost:8080/Section', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(section),
        }).then(response => response.json())
      ));

      // Sauvegarder le formulaire
      const formulaire = {
        nom: formName,
        sectionList: savedSections
      };

      const savedFormulaire = await fetch('http://localhost:8080/Formulaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulaire),
      }).then(response => response.json());

      console.log('Formulaire sauvegardé avec succès:', savedFormulaire);
      navigate('/formulaires');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du formulaire:', error);
      setError('Une erreur est survenue lors de la sauvegarde du formulaire.');
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', padding: 2 }}>
      <Typography 
        variant="h1" 
        component="h1"
        sx={{
          fontSize: "3rem",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "40px",
          marginBottom: "40px",
          width: "100%",
          color: "#C2002F",
        }}
      >
        Creer Votre Formulaire
      </Typography>
 
      <TextField 
        label="nom du formulaire"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        error={!formName}
        helperText={!formName ? "Le nom du formulaire est obligatoire" : ""}
        sx={{
          marginLeft: "500px",
          marginBottom: "20px",
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: "1px",
              borderColor: "black", 
            },
          },
        }}
      />
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>{formName}</StyledTableCell>
            </TableRow>
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
                            onChange={(e) => handleContentChange(index, e.target.value)}
                            variant="standard"
                            placeholder="Entrez le nom de la section"
                            error={!row.content}
                          />
                          <IconButton onClick={() => addTextRow(index)}>
                            <ArrowDropDownCircleIcon fontSize='large' sx={{ color: '#C2002F' }} />
                          </IconButton>
                          <IconButton onClick={() => removeLastTextRow(index)}>
                            <ArrowCircleUpIcon fontSize='large' sx={{ color: '#C2002F' }} />
                          </IconButton>
                        </Box>
                        <Box>
                          <IconButton onClick={() => addSectionRow(index)}>  
                            <AddCircleIcon fontSize='large' sx={{ color: '#C2002F' }} />
                          </IconButton>
                          <IconButton onClick={() => removeNextSection(index)}>
                            <RemoveCircleIcon fontSize='large' sx={{ color: '#C2002F' }}/>
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
                        onChange={(e) => handleContentChange(index, e.target.value)}
                        fullWidth
                        variant="standard"
                        placeholder="Entrez votre question"
                        error={!row.content}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                )}
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
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AuditForm;