import { Dialog, DialogContent, DialogTitle, Box, Fade } from "@mui/material";
import React, { useEffect, useRef } from "react";

export default function Popup(props) {
  const { title, children, openPopup, setOpenPopup } = props;
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setOpenPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenPopup]);

  return (
    <Dialog
      open={openPopup}
      TransitionComponent={Fade}
      PaperProps={{ style: { maxWidth: "100%", height: "600px" } }}
    >
      <DialogTitle>
        <Box textAlign="center" paddingTop={2} paddingBottom={2}>
          {title}
        </Box>
      </DialogTitle>
      <DialogContent ref={dialogRef}>{children}</DialogContent>
    </Dialog>
  );
}
