import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import PopUpRED from "../../components/PopUpRED";
import Select from "react-select";
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AdminAudite from "../adminvisfiles/AdminAudite";
import AdminAuditeur from "../adminvisfiles/AdminAuditeur";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import Tooltip from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import fr from '@fullcalendar/core/locales/fr'; 
 
const Calendar = () => {

   
  const [openPopup, setOpenPopup] = useState(false);
  const [openEventPopup, setOpenEventPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({});
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [auditeurs, setAuditeurs] = useState([]);
  const [formulaires, setFormulaires] = useState([]);
  const [test,settest]=useState('');
  const [test1,settest1]=useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [test2,settest2]=useState('');
  const [audit, setAudit] = useState({
    dateDebut: "",
    dateFin: "",
    escaleVille: "",
    formulaire: "",
    auditeur: "",
    handlingProvider:"",
    typeAudit:""


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
      const auditeur = data.filter(user=>user.role.includes("AUDITEUR"))
      setAuditeurs(auditeur.map(auditeur => ({ value: auditeur.id, label: auditeur.fullname })));
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
        .filter(audit => audit.auditeur && audit.auditeur.fullname && audit.dateDebut && audit.dateFin  )
        .map(audit => ({
          id: audit.id,
          title: `${audit.escaleVille || 'Unknown'} - ${audit.auditeur.fullname}`,
          start: new Date(audit.dateDebut),
          end: addOneDay(new Date(audit.dateFin)), // Add one day to make the end date inclusive
          allDay: true,
          backgroundColor: '#C2002F', // Red background color
          borderColor: '#ffffff', // Red border color
          textColor: '#ffffff',
          classNames: ['audit-event'], // Apply class for styling
          extendedProps: {
            escaleVille: audit.escaleVille || 'Unknown',
            auditeur: audit.auditeur.fullname,
            audite: audit.audite ? audit.audite.fullname : '',
            formulaire: audit.formulaire.nom, // Assuming formulaire has a nom field
            dateDebut: audit.dateDebut,
            dateFin: audit.dateFin,
          },
        }));
      setCurrentEvents(events);
    } catch (error) {
      console.error("Error fetching Audits:", error);
    }
  };

  const navigate = useNavigate();

  const resetAuditState = () => {
    setAudit({
      dateDebut: "",
      dateFin: "",
      escaleVille: "",
      formulaire: "",
      auditeur: "",
      handlingProvider: "",
    typeAudit: ""
    });
  };

  const handleCreateAudit = () => {
    setEditMode(false);
    resetAuditState();
    setOpenPopup(true);
  };


  const handleEventClick = (info) => {
    setSelectedAudit(info.event);
    setPopupContent({
      nomFormulaire: info.event.extendedProps.formulaire,
      escaleVille: info.event.extendedProps.escaleVille,
      aeroport: info.event.extendedProps.aeroport,
      dateDebut: info.event.extendedProps.dateDebut,
      dateFin: info.event.extendedProps.dateFin,
      auditeur: info.event.extendedProps.auditeur,
      audite: info.event.extendedProps.audite
    });
    setOpenEventPopup(true);
  };



  const handleEdit = () => {
    setEditMode(true);
    setOpenEventPopup(false);
    setAudit({
      dateDebut: selectedAudit.extendedProps.dateDebut,
      dateFin: selectedAudit.extendedProps.dateFin,
      escaleVille: selectedAudit.extendedProps.escaleVille,
      formulaire: formulaires.find(f => f.label === selectedAudit.extendedProps.formulaire).value,
      auditeur: auditeurs.find(a => a.label === selectedAudit.extendedProps.auditeur).value,
      aeroport:selectedAudit.extendedProps.aeroport,
    });
    setOpenPopup(true);
  };

 const handleEnregistre = async () => {
    try {
      const auditData = {
        ...audit,
        dateDebut: new Date(audit.dateDebut).toISOString(),
        dateFin: new Date(audit.dateFin).toISOString(),
        formulaire: { id: audit.formulaire },
        auditeur: { id: audit.auditeur },
        typeAudit: audit.typeAudit,
        handlingProvider: audit.handlingProvider
      };

      let response;
      if (editMode) {
        response = await fetch(`http://localhost:8080/Audit/${selectedAudit.id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(auditData)
        });
      } else {
        response = await fetch("http://localhost:8080/Audit", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(auditData)
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save audit");
      }
      const savedAudit = await response.json();

      const newEvent = {
        id: savedAudit.id,
        title: `${savedAudit.escaleVille || 'Unknown'} - ${savedAudit.auditeur.fullname}`,
        start: new Date(savedAudit.dateDebut),
        end: addOneDay(new Date(savedAudit.dateFin)),
        allDay: true,
        backgroundColor: '#C2002F',
        borderColor: '#ffffff',
        textColor: '#ffffff',
        classNames: ['audit-event'],
        extendedProps: {
          escaleVille: savedAudit.escaleVille || 'Unknown',
          auditeur: savedAudit.auditeur.fullname,
          audite: savedAudit.audite ? savedAudit.audite.fullname : '',
          formulaire: savedAudit.formulaire.nom,
          dateDebut: savedAudit.dateDebut,
          aeroport: savedAudit.aeroport,
          dateFin: savedAudit.dateFin,
          handlingProvider:savedAudit.handlingProvider,
          typeAudit:savedAudit.typeAudit
        },
      };

      if (editMode) {
        setCurrentEvents(currentEvents.map(event =>
          event.id === savedAudit.id ? newEvent : event
        ));
      } else {
        setCurrentEvents(prevEvents => [...prevEvents, newEvent]);
      }

      setOpenPopup(false);
      setEditMode(false);
      resetAuditState();
    } catch (error) {
      console.error("Error saving audit:", error);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Calendrier" subtitle="Page du Calendrier" />
        <Button
          variant="contained"
          sx={{
            padding: "10px 30px",
            backgroundColor: '#C2002F',
            '&:hover': {
              backgroundColor: '#A5002A',
            },
            '&:disabled': {
              backgroundColor: '#FFB3B3',
            }
          }}
          onClick={handleCreateAudit}
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
          locale={fr} // Apply French locale
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
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            new Tooltip(info.el, {
              title: `${info.event.extendedProps.escaleVille} - ${info.event.extendedProps.auditeur}`,
              placement: 'top',
              trigger: 'hover',
              container: 'body'
            });
          }}
        />
      </Box>

     
      <PopUpRED
        open={openPopup}
        onClose={() => {
          setOpenPopup(false);
          setEditMode(false);
          resetAuditState();
        }}
        title={editMode ? "Modifier un Audit" : "Créer un Audit"}
        content={
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
    value={audit.dateDebut}
    onChange={(e) => {
      const newDateDebut = e.target.value;
      const minDateFin = new Date(new Date(newDateDebut).getTime() + 86400000).toISOString().split('T')[0];
      setAudit(prev => ({
        ...prev,
        dateDebut: newDateDebut,
        dateFin: prev.dateFin < minDateFin ? minDateFin : prev.dateFin
      }));
    }}
    fullWidth
  />
            </div>
            <div>
            <label htmlFor="dateFin">Date Fin:</label>
  <TextField
    id="dateFin"
    type="date"
    value={audit.dateFin}
    onChange={(e) => setAudit({ ...audit, dateFin: e.target.value })}
    inputProps={{
      min: audit.dateDebut ? new Date(new Date(audit.dateDebut).getTime() + 86400000).toISOString().split('T')[0] : undefined
    }}
    fullWidth
  />
            </div>
            <div>
              <label htmlFor="escaleVille">Ville d'escale:</label>
              <TextField
                id="escaleVille"
                placeholder="Ville d'escale"
                value={audit.escaleVille}
                onChange={(e) => setAudit({ ...audit, escaleVille: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="aeroport">Aéroport</label>
              <TextField
                id="aeroport"
                placeholder="Aéroport"
                value={audit.aeroport}
                onChange={(e) => setAudit({ ...audit, aeroport: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="HandlingProvider">Prestataire de services de manutention:</label>
              <TextField
                id="handlingProvider"
                placeholder="Prestataire de services de manutention"
                value={audit.handlingProvider}
                onChange={(e) => setAudit({ ...audit, handlingProvider: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="typeAudit">Type d'audit:</label>
              <Select
                id="typeAudit"
                options={[
                  { value: 'INITIAL', label: 'Initial' },
                  { value: 'RECURRENT', label: 'Récurrent' }
                ]}
                value={{ value: audit.typeAudit, label: audit.typeAudit === 'INITIAL' ? 'Initial' : 'Récurrent' }}
                onChange={(selectedOption) => setAudit({ ...audit, typeAudit: selectedOption.value })}
              />
            </div>
            <div>
              <label htmlFor="formulaire">Formulaire:</label>
              <Select
                id="formulaire"
                options={formulaires}
                value={formulaires.find(f => f.value === audit.formulaire)}
                onChange={(selectedOption) => setAudit({ ...audit, formulaire: selectedOption.value })}
              />
            </div>
            <div>
              <label htmlFor="auditeur">Auditeur:</label>
              <Select
                id="auditeur"
                options={auditeurs}
                value={auditeurs.find(a => a.value === audit.auditeur)}
                onChange={(selectedOption) => setAudit({ ...audit, auditeur: selectedOption.value })}
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <Button
                variant="contained"
                onClick={handleEnregistre}
                sx={{
                  backgroundColor: '#C2002F',
                  '&:hover': {
                    backgroundColor: '#A5002A',
                  },
                  '&:disabled': {
                    backgroundColor: '#FFB3B3',
                  },
                  width: "100%"
                }}
              >
                {editMode ? "Modifier" : "Enregistrer"}
              </Button>
            </div>
          </form>
        }
      />
      <PopUpRED
        open={openEventPopup}
        onClose={() => setOpenEventPopup(false)}
        title="Audit Details"
        content={
          <div>
          

            <Typography variant="h6" sx={{ marginTop: '16px' }}>Formulaire: {popupContent.nomFormulaire}</Typography>
            <Typography variant="h6">Ville d'escale: {popupContent.escaleVille}</Typography>
            <Typography variant="h6">Date de Début: {new Date(popupContent.dateDebut).toLocaleDateString("fr-FR")}</Typography>
            <Typography variant="h6">Date de Fin: {new Date(popupContent.dateFin).toLocaleDateString("fr-FR")}</Typography>
            <Typography variant="h6">Auditeur: {popupContent.auditeur}</Typography>
            <Typography variant="h6">Audite: {popupContent.audite}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            {new Date()< new Date(popupContent.dateDebut)?(

              <Button
                variant="contained"
                onClick={handleEdit}
                sx={{
                  marginTop: "20px",
                  backgroundColor: '#C2002F',
                  '&:hover': {
                    backgroundColor: '#A5002A',
                  },
                }}
              >
                Modifier
              </Button>


            ):(
                <>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/AdminAuditeur/${selectedAudit.id}`)}
                 sx={{
                        backgroundColor: '#C2002F',
                        '&:hover': {
                         backgroundColor: '#A5002A',
                                  }
                     }}
                >
                           Info Auditeur

                </Button>


               <Button
  variant="contained"
  onClick={() => navigate(`/AdminAudite/${selectedAudit.id}`)}
  sx={{
    backgroundColor: '#C2002F',
    '&:hover': {
      backgroundColor: '#A5002A',
    }
  }}
>
  Info Audite
</Button>
                </>
            
            )}
            </Box>
          </div>
        }
      />
      
   




    </Box>
  );
};

export default Calendar;