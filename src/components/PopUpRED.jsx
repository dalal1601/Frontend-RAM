import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const PopUpRED = ({ open, onClose, title, content, onConfirm, confirmText = "Enregistrer", confirmColor = "secondary" }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        {title}
        <IconButton
          onClick={onClose}
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
        {content}
      </DialogContent>
      <DialogActions
        sx={{
          padding: '8px',
          justifyContent: 'center',
        }}
      >
        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color={confirmColor}
            sx={{
              margin: '8px',
              backgroundColor: '#C2002F',
              color: 'white',
              '&:hover': {
                backgroundColor: '#A5002A',
              },
            }}
          >
            {confirmText}
          </Button>
        )}
        
      </DialogActions>
    </Dialog>
  );
};

export default PopUpRED;
