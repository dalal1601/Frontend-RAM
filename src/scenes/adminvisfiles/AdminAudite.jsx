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
  Button,
  Checkbox,
  TextField,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #000',
  padding: '10px',
  verticalAlign: 'top',
}));

const StyledTextField = styled(TextField)({
  width: '100%',
  marginTop: '5px',
});

const AdminAudite = () => {
  const [submittedForms, setSubmittedForms] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const { auditId } = useParams();

  useEffect(() => {
    const fetchSubmittedForms = async () => {
      try {
        const response = await fetch(`http://localhost:8080/ActionCorrectiveRegister/audit/${auditId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submitted forms');
        }
        const data = await response.json();
        setSubmittedForms(data);
        if (data.length > 0) {
          setAuditData(data[0].audit);
        }
      } catch (error) {
        console.error('Error fetching submitted forms:', error);
      }
    };

    fetchSubmittedForms();
  }, [auditId]);

  if (submittedForms.length === 0) {
    return <Typography>No submitted forms found for this audit.</Typography>;
  }

  return (
    <Box sx={{ width: '80%', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', color: '#a00', marginBottom: '20px' }}>
        Formulaires d'action corrective soumis
      </Typography>
      {submittedForms.map((form, index) => (
        <Box key={form._id} sx={{ marginBottom: '40px' }}>
          <Typography variant="h5">Form {index + 1}</Typography>
          <TableContainer component={Paper}>
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
                  <StyledTableCell colSpan={2}>
                    <Typography color="error"><strong>Root Cause:</strong></Typography>
                    <StyledTextField
                      multiline
                      rows={3}
                      value={form.rootcause}
                      InputProps={{ readOnly: true }}
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
                  <StyledTableCell>
                    <Typography color="error"><strong>Responsable:</strong></Typography>
                    <StyledTextField
                      value={form.responsable}
                      InputProps={{ readOnly: true }}
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
                      value={form.implementationofthecorrectiveaction}
                      InputProps={{ readOnly: true }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>
                    <Typography color="error"><strong>Responsible of the Processus:</strong></Typography>
                    <StyledTextField
                      value={form.responsibleoftheprocessus}
                      InputProps={{ readOnly: true }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography color="error"><strong>Date:</strong></Typography>
                    <TextField
                      type="date"
                      fullWidth
                      sx={{ marginTop: '5px' }}
                      InputProps={{ readOnly: true }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell colSpan={2}>
                    <Typography color="error"><strong>Uploaded Files:</strong></Typography>
                    {form.uploadedFiles && form.uploadedFiles.map((file, fileIndex) => (
                      <Typography key={fileIndex}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.publicId}</a>
                      </Typography>
                    ))}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
  <StyledTableCell colSpan={2}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap:14  // Espace entre les éléments
    }}>
      <Typography sx={{ flexGrow: 1,fontWeight:'bold',fontSize:40 }}>
        EFFICACITY VERIFICATION :
      </Typography>
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#C2002F',
          '&:hover': {
            backgroundColor: '#A5002A',
          },
          '&:disabled': {
            backgroundColor: '#FFB3B3',
          },
          padding: '10px 20px',
        }}
      >
        Yes
      </Button>
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#C2002F',
          '&:hover': {
            backgroundColor: '#A5002A',
          },
          '&:disabled': {
            backgroundColor: '#FFB3B3',
          },
          padding: '10px 20px',
        }}
      >
        No
      </Button>
    </Box>
  </StyledTableCell>
</TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

export default AdminAudite;