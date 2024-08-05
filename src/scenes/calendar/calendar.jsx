import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import Popup from "../../components/Popup";
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

const Calendar = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
      setAuditeurs(data.map(auditeur => ({ value: auditeur.id, label: auditeur.fullname })));
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
          extendedProps: {
            escaleVille: audit.escaleVille || 'Unknown',
            auditeur: audit.auditeur.fullname,
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
        title: `${savedAudit.escaleVille || 'Unknown'} - ${savedAudit.auditeur.fullname}`,
        start: new Date(savedAudit.dateDebut),
        end: addOneDay(new Date(savedAudit.dateFin)), // Add one day to make the end date inclusive
        allDay: true,
        extendedProps: {
          escaleVille: savedAudit.escaleVille || 'Unknown',
          auditeur: savedAudit.auditeur.fullname,
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
        />
      </Box>

      <Popup
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        title="Créer un Audit"
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
              placeholder="Ville d'escale"
              onChange={(e) => setAudit({ ...audit, escaleVille: e.target.value })}
              fullWidth
            />
          </div>
          <div>
            <label htmlFor="auditeur">Auditeur:</label>
            <Select
              options={auditeurs}
              onChange={(selectedOption) => setAudit({ ...audit, auditeur: selectedOption.value })}
            />
          </div>
          <div>
            <label htmlFor="formulaire">Formulaire:</label>
            <Select
              options={formulaires}
              onChange={(selectedOption) => setAudit({ ...audit, formulaire: selectedOption.value })}
            />
          </div>
          <Button
            sx={{
              padding: '10px 30px',
              color: 'white',
              backgroundColor: '#C2002F',
              '&:hover': {
                backgroundColor: '#A5002A',
              },
            }}
            variant="contained"
            onClick={handleEnregistre}
          >
            Enregistrer
          </Button>
        </form>
      </Popup>
    </Box>
  );
};

export default Calendar;