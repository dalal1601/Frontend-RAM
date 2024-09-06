import React, { useState, useEffect,useMemo } from 'react';
import { useParams } from 'react-router-dom'; 
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
  Modal,
  TextField,
  IconButton 
} from '@mui/material';
import { Select, MenuItem } from '@mui/material';

 import { styled, useTheme } from '@mui/system';
import { useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';




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



const id = localStorage.getItem("id")


const InitialPopup = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  const { auditId } = useParams();

  const handleSubmit = async () => {
    if (name && email) {
      setLoading(true);
      setError(null);
    try{
      const response = await fetch(`http://localhost:8080/User/addAudit?auditId=${encodeURIComponent(auditId)}`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({fullname:name,email:email}),
      });

      if(!response.ok){
        throw new Error('Failed to create user');
      }

      const userData = await response.json();
      onClose({name,email,id:userData.id})
    }catch(error){
      console.log(error)
    }finally{
      setLoading(false)
    }
    }
  };
  

  return (
    <Modal 
      open={open}
      onClose={onClose} 
      aria-labelledby="initial-popup-title"
      aria-describedby="initial-popup-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          boxShadow: 24,
          p: 4,
          width: 300,
          borderRadius: 2,
        }}
      >
        <Typography id="initial-popup-title" variant="h6" component="h2" gutterBottom>
          Veuillez entrer les informations d'audité
        </Typography>
        <TextField
          fullWidth
          label="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
        />
          <TextField
          fullWidth
          label="Emploi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />


        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

         <TextField
          fullWidth
          label="Numero de telephone"
          type="numeric"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        
<TextField
  fullWidth
  label="Observation sur place Date"
  type="date"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  margin="normal"
  required
  InputLabelProps={{
    shrink: true,
  }}
/>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!name || !email || loading} 
          sx={{ mt: 2 }}
        >
           {loading ? <CircularProgress size={24} /> : 'Continuer'}
        </Button>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
};
const ConfirmationDialog = ({ open, onClose, onConfirm, formulaire, checkedItems, existingReponses = {} }) => {
  const getReponseStatus = (regleId) => {
    const response = checkedItems[regleId] || existingReponses[regleId];
    return response?.value || 'NON_CONFORME';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFORME': return 'success.main';
      case 'NON_CONFORME': return 'error.main';
      case 'OBSERVATION': return 'info.main';
      case 'AMELIORATION': return 'warning.main';
      default: return 'text.primary';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Confirmation des réponses</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Règle</TableCell>
                <TableCell align="center">Réponse</TableCell>
                <TableCell align="center">Commentaire</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formulaire.sectionList.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <TableRow>
                    <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>
                      {section.description}
                    </TableCell>
                  </TableRow>
                  {section.regles.map((regle, regleIndex) => {
                    const reponseStatus = getReponseStatus(regle.id);
                    const reponse = checkedItems[regle.id] || existingReponses[regle.id] || {};
                    return (
                      <TableRow key={`${sectionIndex}-${regleIndex}`}>
                        <TableCell>{regle.description}</TableCell>
                        <TableCell align="center">
                          <Typography color={getStatusColor(reponseStatus)} fontWeight="bold">
                            {reponseStatus}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{reponse.commentaire || ''}</TableCell>
                      </TableRow>
                    );
                  })}
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
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
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
   const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [fullname,setFullname]=useState(null);
  const [isEditable, setIsEditable] = useState(true);
  const [reponseId, setReponseId] = useState(null);
  const [existingReponses, setExistingReponses] = useState({});
  const [isGeneralitiesSent, setIsGeneralitiesSent] = useState(false);
  const [summaryOfAirlinesAssisted, setSummaryOfAirlinesAssisted] = useState('');
const [numberOfFlightsHandled, setNumberOfFlightsHandled] = useState('');
const [numberOfCheckInAgents, setNumberOfCheckInAgents] = useState('');
const [numberOfRampAgents, setNumberOfRampAgents] = useState('');
const [numberOfSupervisors, setNumberOfSupervisors] = useState('');
const [numberOfGSEMaintenance, setNumberOfGSEMaintenance] = useState('');
const [initialRowCount, setInitialRowCount] = useState(0);
const[observationsurplacedate,setObservationsurplacedate]=useState("");
const [isAuditeRegistered, setIsAuditeRegistered] = useState(false);
const [Fullnamo,setFullnamo]=useState("")




const [auditeInfo, setAuditeInfo] = useState({
  
   
  emploi: '',
  phonenumber: '',
});



const isAllFieldsFilled = useMemo(() => {
  return summaryOfAirlinesAssisted !== '' &&
         numberOfFlightsHandled !== '' &&
         numberOfCheckInAgents !== '' &&
         numberOfRampAgents !== '' &&
         numberOfSupervisors !== '' &&
         numberOfGSEMaintenance !== '';
}, [summaryOfAirlinesAssisted, numberOfFlightsHandled, numberOfCheckInAgents, numberOfRampAgents, numberOfSupervisors, numberOfGSEMaintenance]);
  
const loadExistingGeneralities = async () => {
  try {
    const response = await fetch(`http://localhost:8080/Audit/${auditId}/generalities`);
    if (response.ok) {
      const data = await response.json();
      setSummaryOfAirlinesAssisted(data.generalities.summaryofairlinesassisted || '');
      setNumberOfFlightsHandled(data.generalities.numberofflightshandledperdayinmonth?.toString() || '');
      setNumberOfCheckInAgents(data.generalities.numberofcheckinandboardingagents?.toString() || '');
      setNumberOfRampAgents(data.generalities.numberoframpagents?.toString() || '');
      setNumberOfSupervisors(data.generalities.numberofsupervisors?.toString() || '');
      setNumberOfGSEMaintenance(data.generalities.numberofgsemaintenance?.toString() || '');
      setIsGeneralitiesSent(data.isGeneralitiesSent);
    }
  } catch (error) {
    console.error('Error loading existing generalities:', error);
  }
};

  const handleSaveGeneralities = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8080/Audit/${auditId}/generalities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryofairlinesassisted: summaryOfAirlinesAssisted,
          numberofflightshandledperdayinmonth: numberOfFlightsHandled,
          numberofcheckinandboardingagents: numberOfCheckInAgents,
          numberoframpagents: numberOfRampAgents,
          numberofsupervisors: numberOfSupervisors,
          numberofgsemaintenance: numberOfGSEMaintenance,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save generalities');
      }
  
      setSnackbar({ open: true, message: 'Généralités sauvegardées avec succès!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendGeneraliteies = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8080/Audit/${auditId}/send-generalities`, {
        method: 'PUT',
      });
  
      if (!response.ok) {
        throw new Error('Failed to send generalities');
      }
  
      const updatedAudit = await response.json();
      setIsGeneralitiesSent(updatedAudit.generalitiesSent);
      setSnackbar({ open: true, message: 'Généralités envoyées avec succès!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleSavePersonnesRencontrees = async () => {
    setIsSubmitting(true);
    try {
      const personnesAEnregistrer = rows
        .filter(row => !row.isSaved && row.fullName && row.title)
        .map(row => ({
          fullname: row.fullName,
          title: row.title
        }));
  
      console.log("Données à envoyer:", personnesAEnregistrer);
      
      if (personnesAEnregistrer.length === 0) {
        setSnackbar({ open: true, message: 'Aucune nouvelle personne à enregistrer', severity: 'info' });
        return;
      }
  
      const response = await fetch(`http://localhost:8080/Audit/${auditId}/personnes-rencontrees`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personnesAEnregistrer),
      });
  
      if (!response.ok) {
        throw new Error("Échec de l'enregistrement des personnes rencontrées");
      }
  
      const updatedAudit = await response.json();
      setRows(updatedAudit.personneRencontresees.map(p => ({
        fullName: p.fullName,
        title: p.title,
        isSaved: true
      })));
  
      setSnackbar({ open: true, message: 'Personnes rencontrées enregistrées avec succès!', severity: 'success' });
    } catch (error) {
      console.error("Error details:", error);
      setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSave = async () => {
    setIsSubmitting(true);
    
    const invalidRules = Object.entries(checkedItems).filter(([_, value]) => 
      value.value !== 'CONFORME' && !value.commentaire.trim()
    );
  
    if (invalidRules.length > 0) {
      setSnackbar({ 
        open: true, 
        message: 'Veuillez ajouter un commentaire pour toutes les règles non conformes', 
        severity: 'error' 
      });
      setIsSubmitting(false);
      return;
    }
  
    const reponses = Object.entries(checkedItems).map(([regleId, value]) => {
      const reponse = {
        [regleId]: {
          value: value.value,
          commentaire: value.commentaire.trim()
        }
      };
      
      if (value.value === 'NON_CONFORME' && value.nonConformeLevel) {
        reponse[regleId].nonConformeLevel = value.nonConformeLevel;
      }
      
      return reponse;
    });
  
    const payload = {
      audit: { id: auditId },
      reponses: reponses,
      temporary: true
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
      setReponseId(result.id)
      setSnackbar({ open: true, message: 'Données enregistrées avec succès!', severity: 'success' });
  
      setExistingReponses(prev => ({
        ...prev,
        ...Object.fromEntries(reponses.map(r => [Object.keys(r)[0], Object.values(r)[0]]))
      }));
  
    } catch (error) {
      setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [rows, setRows] = useState([
    { fullName: '', title: '', isSaved: false },
  ]);

  const addRow = () => {
    setRows([...rows, { fullName: '', title: '', isSaved: false }]);
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    console.log(`Updated row ${index}, field ${field} to ${value}`);
    setRows(newRows);
  };


const handleSend = async () => {

 

setOpenConfirmDialog(true);
  
    
 
};

const loadExistingReponses = async () => {
  try {
    const response = await fetch(`http://localhost:8080/Reponse/audit/${auditId}`);
    if (!response.ok) {
      throw new Error('Failed to load existing responses');
    }
    const data = await response.json();
    if (data && data.reponses) {
      const reponses = data.reponses.reduce((acc, reponse) => {
        acc[reponse.regle.id] = {
          value: reponse.value,
          commentaire: reponse.commentaire,
          nonConformeLevel: reponse.nonConformeLevel
        };
        return acc;
      }, {});
      setExistingReponses(reponses);
      setCheckedItems(reponses);
      setReponseId(data.id);
      setIsEditable(data.temporary);
    }
  } catch (error) {
    console.error('Error loading existing responses:', error);
  }
};

  const { auditId } = useParams();

  const fetchAuditAndFormulaire = async () => {
    try {
      setLoading(true);
      setError(null);
      setCheckedItems({});

      const auditResponse = await fetch(`http://localhost:8080/Audit/${auditId}`);
      if (!auditResponse.ok) {
        throw new Error(`Failed to fetch audit: ${auditResponse.statusText}`);
      }
      const auditData = await auditResponse.json();
      
      console.log("-.-.-.- data:", auditData);
      console.log("-.-.-.- audit:", auditData.audite);
      setFullname(auditData.auditeur.fullname)
      
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

  const loadExistingPersonnesRencontrees = async () => {
    try {
      const response = await fetch(`http://localhost:8080/Audit/${auditId}/personnes-rencontrees`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const loadedRows = data.map(p => ({
            fullName: p.fullname,
            title: p.title,
            isSaved: true
          }));
          setRows(loadedRows);
          setInitialRowCount(loadedRows.length);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnes rencontrées:', error);
    }
  };
  


  useEffect(() => {
    fetchAuditAndFormulaire();
    loadExistingReponses();
    loadExistingGeneralities();
    loadExistingPersonnesRencontrees();

  }, [auditId]);

  const handleCheckboxChange = (regleId, value) => {
    if (isEditable) {
      setCheckedItems(prev => {
        const newCheckedItems = { ...prev };
        if (newCheckedItems[regleId]?.value === value) {
          delete newCheckedItems[regleId];
        } else {
          newCheckedItems[regleId] = { 
            value: value, 
            commentaire: newCheckedItems[regleId]?.commentaire || ''
          };
          if (value === 'NON_CONFORME') {
            newCheckedItems[regleId].nonConformeLevel = newCheckedItems[regleId]?.nonConformeLevel || 1;
          } else {
            delete newCheckedItems[regleId].nonConformeLevel;
          }
        }
        return newCheckedItems;
      });
    }
  };
  const isAllRulesAnswered = useMemo(() => {
    if (!formulaire) return false;
    
    const allRegleIds = formulaire.sectionList.flatMap(section => 
      section.regles.map(regle => regle.id)
    );
    
    const answeredRegleIds = Object.keys({...checkedItems, ...existingReponses});
    
    return allRegleIds.every(regleId => answeredRegleIds.includes(regleId));
  }, [formulaire, checkedItems, existingReponses]);


  const handleAuditeInfoChange = (field, value) => {
    setAuditeInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAuditeInfo = async () => {
    setIsSubmitting(true);
    setIsAuditeRegistered(true)
    try {
     const encodedDate = encodeURIComponent(observationsurplacedate);

     const response = await fetch(`http://localhost:8080/User/addAudit?auditId=${auditId} `, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:auditeInfo.email,
        fullname:Fullnamo
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save audite info');
    }

    const response2= await fetch(`http://localhost:8080/Audit/${auditId}/audite?localDate=${encodedDate}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditeInfo),
      });

      if (!response2.ok) {
        throw new Error('Failed to save audite info');
      }

      setSnackbar({ open: true, message: 'Informations de l\'audité enregistrées avec succès!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/Audit/${auditId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch audit details');
        }
        const auditData = await response.json();

        console.log("------------------->",auditData)
        setIsAuditeRegistered(auditData.auditeregistred);
        if (auditData.auditeregistred) {
          setAuditeInfo({
            email: auditData.audite.email,
            emploi: auditData.audite.emploi,
            phonenumber: auditData.audite.phonenumber,
          });
          setFullnamo(auditData.audite.fullname);
          setObservationsurplacedate(auditData.observationsurplacedate);
        }
      } catch (error) {
        console.error('Error fetching audit details:', error);
      }
    };

    fetchAuditDetails();
  }, [auditId]);



  const handleNonConformeLevelChange = (regleId, level) => {
    if (isEditable) {
      setCheckedItems(prev => ({
        ...prev,
        [regleId]: { 
          ...prev[regleId],
          nonConformeLevel: level 
        }
      }));
    }
  };


  const removeRow = () => {
    if (rows.length > initialRowCount) {
      setRows(rows.slice(0, -1));
    }
  };
  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    setOpenConfirmDialog(false);
  
    const reponses = Object.entries({...checkedItems, ...existingReponses}).map(([regleId, value]) => ({
      [regleId]: value
    }));
  
    const payload = {
      audit: { id: auditId },
      reponses: reponses,
    };
  
   try {
    // Save the response
    const saveResponse = await fetch('http://localhost:8080/Reponse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save data');
    }

    const result = await saveResponse.json();
    setAudit(result.audit);

    if (!result.id) {
      throw new Error('Missing reponseId from save response');
    }

    // Save the PDF
    const pdfResponse = await fetch('http://localhost:8080/Reponse/save-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rapportId: result.id,
      }),
    });

    if (!pdfResponse.ok) {
      throw new Error('Failed to save PDF');
    }


  

    // Send the first email
    const emailResponse1 = await fetch('http://localhost:8080/Reponse/send-pdf-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reponseId: result.id }),
    });

    if (!emailResponse1.ok) {
      throw new Error('Failed to send first email');
    }


   
    const finalise = await fetch(`http://localhost:8080/Reponse/finalize/${result.id}`, {
      method: 'PUT',
    });

    if (!finalise.ok) {
      throw new Error('Failed to finalize response');
    }

    setIsEditable(false);
    setSnackbar({ open: true, message: 'Données enregistrées, emails envoyés et notifications envoyées avec succès!', severity: 'success' });
  } catch (error) {
    setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
  } finally {
    setIsSubmitting(false);
  }
};
const handleCommentChange = (regleId, comment) => {
  if (isEditable) {
    setCheckedItems(prev => ({
      ...prev,
      [regleId]: { ...prev[regleId], commentaire: comment }
    }));
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
    

      <Box sx={{border : 'solid',width:'50%' ,marginLeft:30,justifyContent:'center'}}>
      <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#C2002F' }}>
      AUDIT DE TERRAIN <br/>OPÉRATIONNEL 
      </Typography>
    </Box>  

      <Typography variant="subtitle1" sx={{ textAlign: 'justify', marginBottom: '20px', marginTop: 5, fontSize: '1rem', lineHeight: '1.5', fontFamily: 'serif' }}>
    Ce document d'évaluation identifie les exigences en matière d'assistance en escale 
    vérifiées par l'auditeur de Royal Air Maroc lors d'un audit initial (évaluation) ou récurrent 
    d'un prestataire d'assistance en escale. Ce document est également utilisé lors d'un audit interne.
    Les éléments énumérés dans cette liste de contrôle sont censés répondre aux normes de l'OACI, 
    à la réglementation marocaine de l'aviation civile, aux normes IATA & aux règles particulières 
    de Royal Air Maroc.
</Typography>

      <TableContainer component={Paper} sx={{ marginBottom: 5, border: '1px solid #000000', overflow: 'hidden' }}>
    <Table
      sx={{
        minWidth: 650,
        borderCollapse: 'separate',
        borderSpacing: 0,
        '& .MuiTableCell-root': {
          borderRight: '1px solid #000000',
          borderBottom: '1px solid #000000',
          padding: '16px',
        },
        '& .MuiTableRow-root:last-child .MuiTableCell-root': {
          borderBottom: 'none',
        },
        '& .MuiTableCell-root:last-child': {
          borderRight: 'none',
        },
      }}
      aria-label="dynamic table"
    >
     
      
      <TableBody>
        
          <TableRow >
          <TableCell 
    sx={{ 
      fontWeight: 'bold',  
      backgroundColor: '#f5f5f5',
      padding: '22px',
      minWidth: '300px', // Ajout d'une largeur minimale
    }}
  >
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      flexWrap: 'nowrap', // Empêche le retour à la ligne
    }}>
      <Typography 
        sx={{ 
          marginRight: '8px',
          whiteSpace: 'nowrap', // Empêche le retour à la ligne du texte
          minWidth: 'fit-content', // Assure que le texte ne soit pas coupé
        }}
      >
        Nom complet :
      </Typography>
      <TextField

        fullWidth
        value={Fullnamo}
        onChange={(e) => setFullnamo(e.target.value)}
        variant="standard"
          InputProps={{
                    readOnly: isAuditeRegistered,
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
      />
    </div>
  </TableCell>

  <TableCell 
    sx={{ 
      fontWeight: 'bold',  
      backgroundColor: '#f5f5f5',
      padding: '22px',
      minWidth: '300px', // Ajout d'une largeur minimale
    }}
  >
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      flexWrap: 'nowrap', // Empêche le retour à la ligne
    }}>
      <Typography 
        sx={{ 
          marginRight: '8px',
          whiteSpace: 'nowrap', // Empêche le retour à la ligne du texte
          minWidth: 'fit-content', // Assure que le texte ne soit pas coupé
        }}
      >
        Emploi :
      </Typography>
      <TextField
        fullWidth
        variant="standard"
        value={auditeInfo.emploi}
        onChange={(e) => handleAuditeInfoChange('emploi', e.target.value)}
        InputProps={{
                    readOnly: isAuditeRegistered,
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
      />
    </div>
  </TableCell>
          
          </TableRow>
          <TableRow >
          <TableCell 
    sx={{ 
      fontWeight: 'bold',  
      backgroundColor: '#f5f5f5',
      padding: '22px',
      minWidth: '300px', // Ajout d'une largeur minimale
    }}
  >
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      flexWrap: 'nowrap', // Empêche le retour à la ligne
    }}>
      <Typography 
        sx={{ 
          marginRight: '8px',
          whiteSpace: 'nowrap', // Empêche le retour à la ligne du texte
          minWidth: 'fit-content', // Assure que le texte ne soit pas coupé
        }}
      >
        Email :
      </Typography>
      <TextField
        fullWidth
        variant="standard"
        value={auditeInfo.email}
        onChange={(e) => handleAuditeInfoChange('email', e.target.value)}
        InputProps={{
                    readOnly: isAuditeRegistered,
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
      />
    </div>
  </TableCell>

  <TableCell 
    sx={{ 
      fontWeight: 'bold',  
      backgroundColor: '#f5f5f5',
      padding: '22px',
      minWidth: '300px', // Ajout d'une largeur minimale
    }}
  >
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      flexWrap: 'nowrap', // Empêche le retour à la ligne
    }}>
      <Typography 
        sx={{ 
          marginRight: '8px',
          whiteSpace: 'nowrap', // Empêche le retour à la ligne du texte
          minWidth: 'fit-content', // Assure que le texte ne soit pas coupé
        }}
      >
        Numero de telephone :
      </Typography>
      <TextField
        fullWidth
        variant="standard"
        value={auditeInfo.phonenumber}
        onChange={(e) => handleAuditeInfoChange('phonenumber', e.target.value)}
        InputProps={{
                    readOnly: isAuditeRegistered,
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
      />
    </div>
  </TableCell>
          
          </TableRow>

          <TableRow>
          <TableCell 
            colSpan={2} 
            sx={{ 
              fontWeight: 'bold',  
              backgroundColor: '#f5f5f5',
              padding: '22px',
              minWidth: '300px',
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'nowrap',
            }}>
              <Typography 
  sx={{ 
    marginRight: '8px',
    whiteSpace: 'nowrap',
    minWidth: 'fit-content',
  }}
>
  Observation sur place Date :
</Typography>
<TextField
  value={observationsurplacedate}
  onChange={(e) => setObservationsurplacedate(e.target.value)}
  fullWidth
  type="date"
  variant="standard"
  InputProps={{
                    readOnly: isAuditeRegistered,
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
/>
            </div>
          </TableCell>
        </TableRow>
          
    
      </TableBody>
    </Table>
  </TableContainer>


  <Grid container justifyContent="center" spacing={2}  sx={{marginBottom:13}}>
     
        <>
        <Grid item>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}
          onClick={handleSaveAuditeInfo}
          disabled={isSubmitting || isAuditeRegistered}
          >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
         </Button>
      </Grid>
      <Grid item>
         

      </Grid>
      </>
 
      </Grid> 




      <Typography variant="h3" component="h1" sx={{ marginTop:5,fontWeight: 'bold', color: '#C2002F', marginBottom: '10px' }}>
        GENERALITIES
      </Typography>

      <TableContainer component={Paper} sx={{marginBottom:5}} >
  <Table 
    sx={{ 
      minWidth: 650,
      borderCollapse: 'collapse',
      '& .MuiTableCell-root': {
        borderRight: '1px solid rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
      },
      '& .MuiTableCell-root:last-child': {
        borderRight: 'none',
      },
      '& .MuiTableRow-root:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    }} 
    aria-label="simple table"
  >
    <TableHead>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell sx={{fontWeight: 'bold'}}>Summary of airlines assisted</TableCell>
        <TableCell><TextField sx={{width:"100%"}}  value={summaryOfAirlinesAssisted}
                                                   onChange={(e) => setSummaryOfAirlinesAssisted(e.target.value)}
                                                   disabled={isGeneralitiesSent}></TextField></TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{fontWeight: 'bold'}} >Number of flights handled per day/month</TableCell>
        <TableCell><TextField sx={{width:"100%"}}  value={numberOfFlightsHandled}
                                                   onChange={(e) => setNumberOfFlightsHandled(e.target.value)}
                                                   disabled={isGeneralitiesSent}></TextField></TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{fontWeight: 'bold'}} >Number of check-in and boarding agents</TableCell>
        <TableCell><TextField sx={{width:"100%"}}  value={numberOfCheckInAgents}
                                                   onChange={(e) => setNumberOfCheckInAgents(e.target.value)}
                                                   disabled={isGeneralitiesSent}></TextField></TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{fontWeight: 'bold'}} >Number of ramp agents</TableCell>
        <TableCell><TextField sx={{width:"100%"}} value={numberOfRampAgents}
                                                   onChange={(e) => setNumberOfRampAgents(e.target.value)}
                                                   disabled={isGeneralitiesSent}></TextField></TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{fontWeight: 'bold'}} >Number of supervisors</TableCell>
        <TableCell><TextField sx={{width:"100%"}} value={numberOfSupervisors}
                                                   onChange={(e) => setNumberOfSupervisors(e.target.value)}
                                                   disabled={isGeneralitiesSent}></TextField></TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{fontWeight: 'bold'}} >Number of GSE maintenance</TableCell>
        <TableCell><TextField sx={{width:"100%"}}value={numberOfGSEMaintenance}
                                                   onChange={(e) => setNumberOfGSEMaintenance(e.target.value)}
                                                   disabled={isGeneralitiesSent}></TextField></TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>

<Grid container justifyContent="center" spacing={2} sx={{marginBottom:13}}>
  <Grid item>
    <Button
      variant="contained"
      sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}
      onClick={handleSaveGeneralities}
      disabled={isSubmitting || isGeneralitiesSent}
    >
      {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
    </Button>
  </Grid>
  <Grid item>
    <Button
      variant="contained"
      sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
      onClick={handleSendGeneraliteies}
      disabled={isSubmitting || isGeneralitiesSent || !isAllFieldsFilled}
    >
      {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Envoyer'}
    </Button>
  </Grid>
</Grid>

<Typography variant="h3" component="h1" sx={{ marginTop:5,fontWeight: 'bold', color: '#C2002F', marginBottom: 2 }}>
            Les personnes rencontrées
      </Typography>

<>
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2, gap: 1 }}>
  <IconButton 
  onClick={removeRow} 
  size="small" 
  sx={{ 
    color: '#d32f2f', 
    border: '1px solid #d32f2f', 
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: '#d32f2f',
      color: 'white',
    }
  }}
  disabled={rows.length <= initialRowCount}
>
  <RemoveIcon />
</IconButton>
    <IconButton 
      onClick={addRow} 
      size="small" 
      sx={{ 
        color: '#1976d2', 
        border: '1px solid #1976d2', 
        borderRadius: '50%',
        '&:hover': {
          backgroundColor: '#1976d2',
          color: 'white',
        }
      }}
    >
      <AddIcon />
    </IconButton>
  </Box>
  
  <TableContainer component={Paper} sx={{ marginBottom:5, border: '1px solid #000000', overflow: 'hidden' }}>
    <Table
      sx={{
        minWidth: 650,
        borderCollapse: 'separate',
        borderSpacing: 0,
        '& .MuiTableCell-root': {
          borderRight: '1px solid #000000',
          borderBottom: '1px solid #000000',
          padding: '16px',
        },
        '& .MuiTableRow-root:last-child .MuiTableCell-root': {
          borderBottom: 'none',
        },
        '& .MuiTableCell-root:last-child': {
          borderRight: 'none',
        },
      }}
      aria-label="dynamic table"
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f5f5f5' }}>Full name</TableCell>
          <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f5f5f5' }}>Title</TableCell>
        </TableRow>
      </TableHead>
      
      <TableBody>
  {rows.map((row, index) => (
    <TableRow key={index}>
      <TableCell>
        <TextField 
          fullWidth 
          variant="standard"
          value={row.fullName} 
          onChange={(e) => handleChange(index, 'fullName', e.target.value)}
          disabled={row.isSaved}
          InputProps={{
            disableUnderline: true,
            style: { fontSize: '14px' }
          }}
        />
      </TableCell>
      <TableCell>
        <TextField 
          fullWidth 
          variant="standard"
          value={row.title} 
          onChange={(e) => handleChange(index, 'title', e.target.value)}
          disabled={row.isSaved}
          InputProps={{
            disableUnderline: true,
            style: { fontSize: '14px' }
          }}
        />
      </TableCell>
    </TableRow>
  ))}
</TableBody>
    </Table>
  </TableContainer>
</>


<Grid container justifyContent="center" spacing={2}  sx={{marginBottom:13}}>
     
     <>
     <Grid item>
     <Button
  variant="contained"
  sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}
  onClick={handleSavePersonnesRencontrees}
  disabled={isSubmitting || !rows.some(row => !row.isSaved && row.fullName && row.title)}
>
  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
</Button>
   </Grid>
  
   </>

   </Grid> 






<TableContainer component={Paper} sx={{ marginBottom: '20px' }}>
  <Table sx={{ minWidth: 700 }} aria-label="form details">
    <TableHead>
      <TableRow>
        <StyledTableCell>Sections</StyledTableCell>
        <StyledTableCell>Règles</StyledTableCell>
        <StyledTableCell>Conforme</StyledTableCell>
        <StyledTableCell>Non-Conforme</StyledTableCell>
        <StyledTableCell>Observation</StyledTableCell>
        <StyledTableCell>Amélioration</StyledTableCell>
        <StyledTableCell>Niveau</StyledTableCell>
        <StyledTableCell>Commentaire</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {formulaire.sectionList.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          <TableRow>
            <TableCell colSpan={8} sx={{ fontWeight: 'bold', backgroundColor: theme.palette.action.hover }}>
              {section.description}
            </TableCell>
          </TableRow>
          {section.regles.map((regle, regleIndex) => (
            <TableRow key={regleIndex}>
              <TableCell></TableCell>
              <TableCell>{regle.description}</TableCell>
              {['CONFORME', 'NON_CONFORME', 'OBSERVATION', 'AMELIORATION'].map((value) => (
                <TableCell key={value}>
                  <Checkbox
                    checked={checkedItems[regle.id]?.value === value || existingReponses[regle.id]?.value === value}
                    onChange={() => handleCheckboxChange(regle.id, value)}
                    disabled={!isEditable || isSubmitting}
                    color={
                      value === 'CONFORME' ? 'primary' :
                      value === 'NON_CONFORME' ? 'secondary' :
                      value === 'OBSERVATION' ? 'info' : 'warning'
                    }
                  />
                  {value.replace('_', ' ')}
                </TableCell>
              ))}
              <TableCell>
    <Select
      value={checkedItems[regle.id]?.nonConformeLevel || ''}
      onChange={(e) => handleNonConformeLevelChange(regle.id, e.target.value)}
      disabled={!isEditable || isSubmitting || checkedItems[regle.id]?.value !== 'NON_CONFORME'}
    >
      <MenuItem value={1}>1</MenuItem>
      <MenuItem value={2}>2</MenuItem>
      <MenuItem value={3}>3</MenuItem>
    </Select>
  </TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  label="Commentaire"
                  value={checkedItems[regle.id]?.commentaire || existingReponses[regle.id]?.commentaire || ''}
                  onChange={(e) => handleCommentChange(regle.id, e.target.value)}
                  disabled={!isEditable || isSubmitting}
                  error={checkedItems[regle.id]?.value !== 'CONFORME' && !checkedItems[regle.id]?.commentaire}
                  helperText={checkedItems[regle.id]?.value !== 'CONFORME' && !checkedItems[regle.id]?.commentaire ? "Commentaire obligatoire" : ""}
                />
              </TableCell>
            </TableRow>
          ))}
        </React.Fragment>
      ))}
    </TableBody>
  </Table>
</TableContainer>

      <Grid container justifyContent="center" spacing={2}>
      {isEditable ? (
        <>
              <Grid item>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#C2002F', '&:hover': { backgroundColor: '#A5002A' } }}
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
        </Button>
      </Grid>
      <Grid item>
        <Button
        variant="contained"
        sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
        onClick={handleSend}
        disabled={isSubmitting || !reponseId || !isAllRulesAnswered}
        >

          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Envoyer'}

        </Button>

      </Grid>
      </>
      ):(
        <Grid item>
            <Typography variant="body1" color="textSecondary">
              Merci pour votre travail, vous avez terminer votre audit
            </Typography>
          </Grid>
        )}
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