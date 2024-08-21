import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import PopUpRED from "../../components/PopUpRED";
import Select from "react-select";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import Tooltip from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Import the French locale
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
  const [test2,settest2]=useState('');
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
        .filter(audit => audit.auditeur && audit.auditeur.fullname && audit.dateDebut && audit.dateFin)
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

  const handleEventClick = (info) => {
    setPopupContent({
      nomFormulaire: info.event.extendedProps.formulaire,
      escaleVille: info.event.extendedProps.escaleVille,
      dateDebut: info.event.extendedProps.dateDebut,
      dateFin: info.event.extendedProps.dateFin,
    });
    setOpenEventPopup(true);
  };

  const handleEnregistre = async () => {
    try {

      console.log('hhhhhh ',audit.auditeur.ID)
      console.log('hhhhhh ',audit.auditeur.id)
      console.log('hhhhhh ',audit.auditeur)
      console.log('hhhhhh ',audit.auditeur.IdMongo)

      const auditData = {
        ...audit,
        dateDebut: new Date(audit.dateDebut).toISOString(),
        dateFin: new Date(audit.dateFin).toISOString(),
        formulaire: { id: audit.formulaire },
        auditeur: { id: audit.auditeur },

        



        


      };

      console.log('hhhhhh ',audit.auditeur.ID)
      console.log('hhhhhh ',audit.auditeur.id)
      console.log('hhhhhh ',audit.auditeur.IdMongo)
     

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

      
      console.log('hhhhhh ',savedAudit.auditeur.idMongo)


      const adminId = "0c755a60-3f25-4f03-b77e-822d16dd1f29";

      await fetch(`http://localhost:8080/User/addNotification?userId=${savedAudit.auditeur.idMongo}`, {
        

        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: adminId,
          desciption: `vous avez été choisi pour faire une audite a ${savedAudit.escaleVille} du ${savedAudit.dateDebut} a ${savedAudit.dateFin} `
        })
      });


      setCurrentEvents([...currentEvents, {
        id: savedAudit.id,
        title: `${savedAudit.escaleVille || 'Unknown'} - ${savedAudit.auditeur.fullname}`,
        start: new Date(savedAudit.dateDebut),
        end: addOneDay(new Date(savedAudit.dateFin)), // Add one day to make the end date inclusive
        allDay: true,
        classNames: ['audit-event'], // Apply class for styling
        extendedProps: {
          escaleVille: savedAudit.escaleVille || 'Unknown',
          auditeur: savedAudit.auditeur.fullname,
          formulaire: savedAudit.formulaire.nom,
          dateDebut: savedAudit.dateDebut,
          dateFin: savedAudit.dateFin,
        },
      }]);
      setOpenPopup(false);
    } catch (error) {
      console.error("Error saving audit:", error);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Calendar" subtitle="Full Calendar Interactive Page" />
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
          onClick={() => setOpenPopup(true)}
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
        onClose={() => setOpenPopup(false)}
        title="Créer un Audit"
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
                placeholder="Ville d'escale"
                onChange={(e) => setAudit({ ...audit, escaleVille: e.target.value })}
                fullWidth
              />
            </div>
            <div>
              <label htmlFor="formulaire">Formulaire:</label>
              <Select
                id="formulaire"
                options={formulaires}
                onChange={(selectedOption) => setAudit({ ...audit, formulaire: selectedOption.value })}
              />
            </div>
            <div>
              <label htmlFor="auditeur">Auditeur:</label>
              <Select
                id="auditeur"
                options={auditeurs}
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
                Enregistrer
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
          </div>
        }
      />
    </Box>
  );
};

export default Calendar;
