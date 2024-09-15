import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  Button,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadWidget from './UploadWidget'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #000',
  padding: '10px',
  verticalAlign: 'top',
}));

const StyledTextField = styled(TextField)({
  width: '100%',
  marginTop: '5px',
});

const CorrectiveActionForm = () => {
  const [isAuditee, setIsAuditee] = useState(false);
  const [rules, setRules] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const { userId } = useParams();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formDataList, setFormDataList] = useState([]);
  const [submittedForms, setSubmittedForms] = useState([]);

  const handleFileUploaded = (newFile) => {
    setUploadedFiles(prevFiles => [...prevFiles, newFile]);
  };

  useEffect(() => {
    const fetchAuditDetails = async () => {
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        const auditResponse = await fetch(`http://localhost:8080/Audit/audite/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!auditResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const auditData = await auditResponse.json();
        console.log('Fetched Audit Data:', auditData);

        if (auditData && Array.isArray(auditData) && auditData.length > 0) {
          const audit = auditData.find(a => a.audite && a.audite.id === userId);

          if (audit) {
            setIsAuditee(true);
            setAuditData(audit);

            if (audit.id) {
              const responseResponse = await fetch(`http://localhost:8080/Reponse/audit/${audit.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!responseResponse.ok) {
                throw new Error('Network response was not ok');
              }

              const responsesData = await responseResponse.json();
              console.log('Fetched Responses Data:', responsesData);

              if (responsesData && Array.isArray(responsesData.reponses)) {
                const filteredRules = responsesData.reponses.filter(rule => rule.value !== 'CONFORME');
                setRules(filteredRules);
                setFormDataList(filteredRules.map(() => ({
                  rootCause: '',
                  implementationOfCorrectiveAction: '',
                  responsable: '',
                  responsibleOfTheProcessus: '',
                })));

                // Fetch submitted forms
                const submittedFormsResponse = await fetch(`http://localhost:8080/ActionCorrectiveRegister/audit/${audit.id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (!submittedFormsResponse.ok) {
                  throw new Error('Network response was not ok');
                }

                const submittedFormsData = await submittedFormsResponse.json();
                setSubmittedForms(submittedFormsData);
              } else {
                console.error('Responses data is not in the expected format:', responsesData);
                setRules([]);
              }
            }
          } else {
            console.log('No matching audit data found for this user.');
            setIsAuditee(false);
          }
        } else {
          console.log('Audit data is empty or not in expected format.');
          setIsAuditee(false);
        }
      } catch (error) {
        console.error('Error fetching audit details:', error);
      }
    };

    fetchAuditDetails();
  }, [userId]);

  if (!userId) {
    return <Typography>User ID is not available.</Typography>;
  }

  if (!isAuditee) {
    return <Typography>You are not authorized to view this form.</Typography>;
  }



  const OverlayBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }));


  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    setFormDataList(prevState => {
      const newState = [...prevState];
      newState[index] = { ...newState[index], [name]: value };
      return newState;
    });
  };

  const handleSubmit = async (index) => {
    if (!auditData || !auditData.id) {
      console.error('Audit data is not available');
      return;
    }

    const actionCorrectiveRegister = {
      audit: auditData,
      rootcause: formDataList[index].rootCause,
      implementationofthecorrectiveaction: formDataList[index].implementationOfCorrectiveAction,
      responsable: formDataList[index].responsable,
      responsibleoftheprocessus: formDataList[index].responsibleOfTheProcessus,
      uploadedFiles: uploadedFiles,
      registerdornot: {
        isSubmitted: true,
        index: index
      }
    };

    try {
      const response = await fetch('http://localhost:8080/ActionCorrectiveRegister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionCorrectiveRegister),
      });

      if (!response.ok) {
        throw new Error('Failed to submit corrective action');
      }

      const result = await response.json();
      console.log('Corrective action registered:', result);
      
      // Update submittedForms state
      setSubmittedForms(prevState => [...prevState, result]);

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error submitting corrective action:', error);
    }
  };

  const isFormSubmitted = (index) => {
    return submittedForms.some(form => form.registerdornot && form.registerdornot.index === index);
  };

  return (
    <Box sx={{ width: '80%', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', color: '#a00', marginBottom: '20px' }}>
        Formulaire Fiche d'action corrective
      </Typography>
      {Array.isArray(rules) && rules.length === 0 ? (
        <Typography>No rules available for this audit.</Typography>
      ) : (
        rules.map((rule, index) => {
          const isSubmitted = isFormSubmitted(index);
          const submittedForm = submittedForms.find(form => form.registerdornot && form.registerdornot.index === index);

          return (
            <Box key={rule.regle._id} sx={{ marginBottom: '20px' }}>
          
              <Typography variant="h5">Form {index + 1}</Typography>
              <TableContainer component={Paper} sx={{ position: 'relative' }}>
              {isSubmitted && (
                  <OverlayBox>
                    <Typography variant="h4" sx={{ color: '#C2002F', fontWeight: 'bold',fontSize:80 }}>
                    Currently being verified
                    </Typography>
                  </OverlayBox>
                )}
                <Table>
                  <TableBody>
                    <TableRow>
                      <StyledTableCell>
                        <Typography color="error"><strong>Corrective action:</strong> N° {index + 1}</Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography color="error"><strong>Audit Station:</strong> {auditData?.escaleVille || 'XXX'}</Typography>
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>
                        <Typography color="error"><strong>Subject: </strong>Audit of the Ground handler:</Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography color="error"><strong>Date:</strong> {auditData?.dateDebut || 'XXX'}</Typography>
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Typography color="error"><strong>Audited Process:</strong> Ground Handling</Typography>
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>
                        <Typography color="error" component="span"><strong>Non-Conformity:</strong></Typography>
                        <Checkbox checked={rule.value === 'NON_CONFORME'} disabled />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography color="error" component="span"><strong>Note:</strong></Typography>
                        <Checkbox checked={rule.value === 'OBSERVATION' || rule.value === 'AMELIORATION'} disabled />
                        <Typography color="error" component="span"><strong>CAT: </strong></Typography>
                        <Checkbox checked={rule.nonConformeLevel === 1} disabled /> 1
                        <Checkbox checked={rule.nonConformeLevel === 2} disabled /> 2
                        <Checkbox checked={rule.nonConformeLevel === 3} disabled /> 3
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Typography color="error"><strong>Finding:</strong></Typography>
                        <StyledTextField
                          multiline
                          rows={3}
                          defaultValue={rule.regle.description || ''}
                          InputProps={{readOnly:true, disableUnderline:true}}
                        />
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Typography color="error"><strong>Root Cause:</strong></Typography>
                        <StyledTextField
                          multiline
                          rows={3}
                          name="rootCause"
                          value={isSubmitted ? submittedForm.rootcause : formDataList[index]?.rootCause || ''}
                          onChange={(e) => handleInputChange(index, e)}
                          InputProps={{ readOnly: isSubmitted }}
                        />
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Typography color="error"><strong>Responsible of the Audit: </strong></Typography>
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>
                        <Typography><strong>Auditor:</strong> {auditData?.auditeur.fullname || 'XXX'}</Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography><strong>Audited:</strong> {auditData?.audite.fullname || 'XXX'}</Typography>
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Typography color="error"><strong>Definition of Corrective Action: </strong></Typography>
                        <StyledTextField
                          multiline
                          rows={3}
                          defaultValue={rule.regle.actionCorrective || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>
                        <Typography color="error"><strong>Responsable:</strong></Typography>
                        <StyledTextField
                          name="responsable"
                          value={isSubmitted ? submittedForm.responsable : formDataList[index]?.responsable || ''}
                          onChange={(e) => handleInputChange(index, e)}
                          InputProps={{ readOnly: isSubmitted }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography color="error"><strong>Deadline:</strong></Typography>
                        <Typography>02/10/2024</Typography>
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Typography color="error"><strong>Implementation of the Corrective Action:</strong></Typography>
                        <StyledTextField
                          multiline
                          rows={3}
                          name="implementationOfCorrectiveAction"
                          value={isSubmitted ? submittedForm.implementationofthecorrectiveaction : formDataList[index]?.implementationOfCorrectiveAction || ''}
                          onChange={(e) => handleInputChange(index, e)}
                          InputProps={{ readOnly: isSubmitted }}
                        />
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>
                        <Typography color="error"><strong>Responsible of the Processus:</strong></Typography>
                        <StyledTextField
                          name="responsibleOfTheProcessus"
                          value={isSubmitted ? submittedForm.responsibleoftheprocessus : formDataList[index]?.responsibleOfTheProcessus || ''}
                          onChange={(e) => handleInputChange(index, e)}
                          InputProps={{ readOnly: isSubmitted }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography color="error"><strong>Date:</strong></Typography>
                        <TextField
                          type="date"
                          fullWidth
                          sx={{ marginTop: '5px' }}
                          InputProps={{ readOnly: isSubmitted }}
                        />
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                      <UploadWidget onFileUploaded={handleFileUploaded} disabled={isSubmitted} />                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell colSpan={2}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleSubmit(index)}
                          disabled={isSubmitted}
                          sx={{
                            marginTop: 6,
                            marginBottom: 5,
                            backgroundColor: '#C2002F',
                            '&:hover': {
                              backgroundColor: '#A5002A',
                            },
                            '&:disabled': {
                              backgroundColor: '#FFB3B3',
                            },
                            padding: 2
                          }}
                        >
                          Corrective action taken
                        </Button>
                      </StyledTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          );
        })
      )}
    </Box>
  );
};


export default CorrectiveActionForm;