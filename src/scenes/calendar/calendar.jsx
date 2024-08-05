import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Box, Button, TextField, Typography, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const Calendar = () => {
  const [openCreatePopup, setOpenCreatePopup] = useState(false);
  const [openDetailsPopup, setOpenDetailsPopup] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const theme = useTheme();
  const [currentEvents, setCurrentEvents] = useState([]);
  const [auditeurs, setAuditeurs] = useState([]);
  const [formulaires, setFormulaires] = useState([]);
  const [audit, setAudit] = useState({
    dateDebut: "",
    dateFin: "",
    escaleVille: "",
    formulaire: "",
    auditeur: "",
  });

  useEffect(() => {
    fetchAuditeurs();
    fetchFormulaires();
    fetchAudits();
  }, []);

  const addOneDay = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  };

  const fetchAuditeurs = async () => {
    try {
      const response = await fetch("http://localhost:8080/User");
      if (!response.ok) {
        throw new Error("Failed to fetch auditeurs");
      }
      const data = await response.json();
      setAuditeurs(data.map(auditeur => ({ value: auditeur.id, label: auditeur.nom_complet })));
    } catch (error) {
      console.error("Error fetching auditeurs:", error);
    }
  };

  const fetchFormulaires = async () => {
    try {
      const response = await fetch("http://localhost:8080/Formulaire");
      if (!response.ok) {
        throw new Error("Failed to fetch Formulaires");
      }
      const data = await response.json();
      setFormulaires(data.map(formulaire => ({ value: formulaire.id, label: formulaire.nom })));
    } catch (error) {
      console.error("Error fetching Formulaire:", error);
    }
  };

  const fetchAudits = async () => {
    try {
      const response = await fetch("http://localhost:8080/Audit");
      if (!response.ok) {
        throw new Error("Failed to fetch Audits");
      }
      const data = await response.json();
      const events = data
        .filter(audit => audit.auditeur && audit.auditeur.nom_complet && audit.dateDebut && audit.dateFin)
        .map(audit => ({
          id: audit.id,
          title: `${audit.escaleVille || 'Unknown'} - ${audit.auditeur.nom_complet}`,
          start: new Date(audit.dateDebut),
          end: addOneDay(new Date(audit.dateFin)), // Add one day to make the end date inclusive
          allDay: true,
          backgroundColor: '#C2002F', // Red background color
          borderColor: '#ffffff', // Red border color
          textColor: '#ffffff', // White text color for contrast
          extendedProps: {
            escaleVille: audit.escaleVille || 'Unknown',
            auditeur: audit.auditeur.nom_complet,
            formulaire: audit.formulaire.nom || 'Unknown Formulaire', // Assuming formulaire has a 'nom' field
          },
        }));
      setCurrentEvents(events);
    } catch (error) {
      console.error("Error fetching Audits:", error);
    }
  };

  const handleEnregistre = async () => {
    try {
      const auditData = {
        ...audit,
        dateDebut: new Date(audit.dateDebut).toISOString(),
        dateFin: new Date(audit.dateFin).toISOString(),
        formulaire: { id: audit.formulaire },
        auditeur: { id: audit.auditeur }
      };

      const response = await fetch("http://localhost:8080/Audit", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(auditData)
      });

      if (!response.ok) {
        throw new Error("Failed to save audit");
      }
      const savedAudit = await response.json();
      setCurrentEvents([...currentEvents, {
        id: savedAudit.id,
        title: `${savedAudit.escaleVille || 'Unknown'} - ${savedAudit.auditeur.nom_complet}`,
        start: new Date(savedAudit.dateDebut),
        end: addOneDay(new Date(savedAudit.dateFin)), // Add one day to make the end date inclusive
        allDay: true,
        extendedProps: {
          escaleVille: savedAudit.escaleVille || 'Unknown',
          auditeur: savedAudit.auditeur.nom_complet,
          formulaire: savedAudit.formulaire.nom || 'Unknown Formulaire',
        },
      }]);
      setOpenCreatePopup(false);
    } catch (error) {
      console.error("Error saving audit:", error);
    }
  };

  const handleEventClick = (info) => {
    const audit = currentEvents.find(event => event.id === info.event.id);
    setSelectedAudit(audit);
    setOpenDetailsPopup(true);
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Calendrier</Typography>
        <Button
          variant="contained"
          sx={{
            padding: "10px 30px",
            backgroundColor: '#C2002F',
            '&:hover': {
              backgroundColor: '#A5002A',
            },
          }}
          onClick={() => setOpenCreatePopup(true)}
        >
          Créer un Audit
        </Button>
      </Box>

      <Box flex="1 1 100%" ml="15px">
        <FullCalendar
          height="75vh"
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={false}
          events={currentEvents}
          eventContent={(eventInfo) => {
            return (
              <div>
                <b>{eventInfo.timeText}</b>
                <i>{eventInfo.event.title}</i>
              </div>
            );
          }}
          eventDidMount={(info) => {
            new Tooltip(info.el, {
              title: `${info.event.extendedProps.escaleVille} - ${info.event.extendedProps.auditeur}`,
              placement: 'top',
              trigger: 'hover',
              container: 'body'
            });
          }}
          eventClick={handleEventClick}
        />
      </Box>

      <Dialog
        open={openCreatePopup}
        onClose={() => setOpenCreatePopup(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '90%',
            maxWidth: '800px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#C2002F',
            color: 'white',
            textAlign: 'center',
            padding: '16px',
            position: 'relative',
          }}
        >
          Créer un Audit
          <IconButton
            onClick={() => setOpenCreatePopup(false)}
            sx={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            overflowY: 'auto',
          }}
        >
          <form style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}>
            <div>
              <label htmlFor="dateDebut">Date Début:</label>
              <TextField
                id="dateDebut"
                type="date"
                onChange={(e) => setAudit({ ...audit, dateDebut: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="dateFin">Date Fin:</label>
              <TextField
                id="dateFin"
                type="date"
                onChange={(e) => setAudit({ ...audit, dateFin: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="escaleVille">Ville d'escale:</label>
              <TextField
                id="escaleVille"
                onChange={(e) => setAudit({ ...audit, escaleVille: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="auditeur">Auditeur:</label>
              <Select
                id="auditeur"
                value={audit.auditeur}
                onChange={(e) => setAudit({ ...audit, auditeur: e.target.value })}
                fullWidth
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400, // Adjust height to fit your needs
                    },
                  },
                }}
              >
                {auditeurs.map((auditeur) => (
                  <MenuItem key={auditeur.value} value={auditeur.value}>
                    {auditeur.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="formulaire">Formulaire:</label>
              <Select
                id="formulaire"
                value={audit.formulaire}
                onChange={(e) => setAudit({ ...audit, formulaire: e.target.value })}
                fullWidth
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400, // Adjust height to fit your needs
                    },
                  },
                }}
              >
                {formulaires.map((formulaire) => (
                  <MenuItem key={formulaire.value} value={formulaire.value}>
                    {formulaire.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </form>
        </DialogContent>
        <DialogActions
          sx={{
            padding: '8px',
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={handleEnregistre}
            variant="contained"
            color="secondary"
            sx={{
              margin: '8px',
              backgroundColor: '#C2002F',
              color: 'white',
              '&:hover': {
                backgroundColor: '#A5002A',
              },
            }}
          >
            Enregistrer
          </Button>
          <Button
            onClick={() => setOpenCreatePopup(false)}
            variant="outlined"
            sx={{
              margin: '8px',
            }}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetailsPopup}
        onClose={() => setOpenDetailsPopup(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '90%',
            maxWidth: '800px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#C2002F',
            color: 'white',
            textAlign: 'center',
            padding: '16px',
            position: 'relative',
          }}
        >
          Détails de l'Audit
          <IconButton
            onClick={() => setOpenDetailsPopup(false)}
            sx={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            overflowY: 'auto',
          }}
        >
          {selectedAudit && (
            <Box>
              <Typography variant="h6" sx={{ marginTop: '16px' }}>
                Nom du Formulaire: {selectedAudit.extendedProps.formulaire}
              </Typography>
              <Typography variant="h6">Ville d'escale: {selectedAudit.extendedProps.escaleVille}</Typography>
              <Typography variant="h6">Auditeur: {selectedAudit.extendedProps.auditeur}</Typography>
              <Typography variant="h6">Date Début: {new Date(selectedAudit.start).toLocaleDateString()}</Typography>
              <Typography variant="h6">Date Fin: {new Date(selectedAudit.end).toLocaleDateString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            padding: '8px',
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={() => setOpenDetailsPopup(false)}
            variant="outlined"
            sx={{
              margin: '8px',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
