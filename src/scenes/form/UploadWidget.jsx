import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

const UploadWidget = ({ onFileUploaded, disabled }) => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: 'diujth5dh', 
        uploadPreset: 'ml_default'
      },
      function (error, result) {
        if (error) {
          console.error('Upload error:', error);
        } else if (result && result.event === 'success') {
          console.log('Upload success:', result.info);
          const newFile = {
            publicId: result.info.public_id,
            url: result.info.secure_url,
            resourceType: result.info.resource_type,
            format: result.info.format
          };
          setUploadedFiles(prevFiles => [...prevFiles, newFile]);
          onFileUploaded(newFile);
        }
      }
    );
  }, [onFileUploaded]);

  const handleUpload = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.error('Upload widget not initialized');
    }
  };

  return (
    <div>
      <Button 
        variant="contained"
        color="primary"
        sx={{ marginTop: 3 }}
        onClick={handleUpload}
        disabled={disabled}
      >
        Add evidence
      </Button>
    </div>
  );
};

export default UploadWidget;