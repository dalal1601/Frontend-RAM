import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme, isToday, isAccessible }) => ({
  cursor: isAccessible ? 'pointer' : 'not-allowed',
  marginBottom: theme.spacing(2),
  backgroundColor: isToday ? 'rgba(255, 0, 0, 0.2)' : 'inherit',
  opacity: isAccessible ? 1 : 0.5,
  '&:hover': {
    backgroundColor: isAccessible ? theme.palette.action.hover : 'inherit',
  },
}));

const isToday = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return today.toDateString() === date.toDateString();
};

const isFuture = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return date > today;
};

const isWithinPeriod = (startStr, endStr) => {
  const today = new Date();
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  return today >= startDate && today <= endDate;
};

const UserAudits = () => {
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState('');
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        if (!userId) {
          console.error('User ID is missing');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/Audit/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched audits:', data);

        // Filter audits based on whether they are in the future or not
        const filteredAudits = data.filter(audit => 
          isToday(audit.dateFin) || isWithinPeriod(audit.dateDebut, audit.dateFin) || isFuture(audit.dateFin)
        );

        console.log('Filtered audits:', filteredAudits);
        setAudits(filteredAudits);
      } catch (error) {
        setError('Error fetching audits: ' + error.message);
      }
    };

    fetchAudits();
  }, [userId]);

  const handleAuditClick = (auditId) => {
    navigate(`/reponse/${auditId}`);
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 1000, margin: 'auto' }}>
      <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        Audits à faire 
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2}>
        {audits.length > 0 ? (
          audits.map((audit) => {
            const endDate = new Date(audit.dateFin);
            const isTodayAudit = endDate.toDateString() === new Date().toDateString();
            const isAccessible = !isFuture(audit.dateFin) || isTodayAudit || isWithinPeriod(audit.dateDebut, audit.dateFin);

            return (
              <Grid item xs={12} sm={6} md={4} key={audit.id}>
                <StyledCard 
                  onClick={() => isAccessible && handleAuditClick(audit.id)} 
                  isToday={isTodayAudit} 
                  isAccessible={isAccessible}
                >
                  <CardContent>
                    <Typography variant="h6">Le nom du Formulaire: {audit.formulaire.nom}</Typography>
                    <Typography>Ville d'escale: {audit.escaleVille}</Typography>
                    <Typography>Date de début : {audit.dateDebut}</Typography>
                    <Typography>Date de fin : {audit.dateFin}</Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            );
          })
        ) : (
          <Typography>No audits à faire.</Typography>
        )}
      </Grid>
    </Paper>
  );
};

export default UserAudits;
