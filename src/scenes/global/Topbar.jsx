import React, { useContext, useState, useEffect } from "react";
import { 
  Box, 
  IconButton, 
  useTheme, 
  InputBase,
  Popover,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge
} from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const idMongo = localStorage.getItem('idmongo');
    if (idMongo) {
      fetchNotifications(idMongo);
    }
  }, []);

  

  const fetchNotifications = async (idMongo) => {
    try {
      const response = await axios.get(`http://localhost:8080/User/notification?idMongo=${idMongo}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response && error.response.status === 404) {
        setNotifications([]); // Set empty array if user not found
      }
    }
  };






  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('idMongo');
    navigate('/');
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
  

      {/* ICONS */}
      <Box display="flex" marginLeft="1100px">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton onClick={handleNotificationClick}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <IconButton onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* Notifications Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 300, maxWidth: '100%' }}>
          <Box sx={{ bgcolor: 'error.main', color: 'white', p: 2 }}>
            <Typography variant="h6">Notifications</Typography>
          </Box>
          <List sx={{ bgcolor: 'background.paper' }}>
            {notifications.map((notification, index) => (
              <ListItemButton 
                key={index}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? colors.primary[600] 
                      : colors.redAccent[900],
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ bgcolor: colors.blueAccent[500] }}
                  >
                    <SettingsOutlinedIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={notification.description}
                  secondary={new Date(notification.dateTime).toLocaleString()}
                />
              </ListItemButton>
            ))}
          </List>
          {notifications.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>No notifications</Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default Topbar;