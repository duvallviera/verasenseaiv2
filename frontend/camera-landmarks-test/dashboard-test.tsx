'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardCamera from './dashboard-camera';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  position: 'relative',
  overflow: 'hidden',
}));

const DashboardTest: React.FC = () => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureCount, setCaptureCount] = useState(0);

  const handleFaceDetected = (detected: boolean) => {
    setFaceDetected(detected);
    console.log('Face detected:', detected);
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setCaptureCount(prev => prev + 1);
    console.log('Image captured successfully');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
          Dashboard Camera Test
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Testing camera functionality with landmarks and mesh from Dashboard
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Camera Section */}
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <GlassPaper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Camera with Landmarks & Mesh
            </Typography>
            
            <DashboardCamera
              onFaceDetected={handleFaceDetected}
              onCapture={handleCapture}
              width={640}
              height={480}
            />
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Alert 
                severity={faceDetected ? 'success' : 'warning'}
                sx={{ flex: 1, minWidth: 200 }}
              >
                {faceDetected ? 'Face Detected' : 'No Face Detected'}
              </Alert>
              
              <Alert 
                severity="info"
                sx={{ flex: 1, minWidth: 200 }}
              >
                Captures: {captureCount}
              </Alert>
            </Box>
          </GlassPaper>
        </Box>

        {/* Captured Image Section */}
        {capturedImage && (
          <Box sx={{ flex: 1, minWidth: 400 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2 }}>
                Captured Image
              </Typography>
              
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 8,
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = capturedImage;
                      link.download = `captured-image-${Date.now()}.jpg`;
                      link.click();
                    }}
                    sx={{ mr: 2 }}
                  >
                    Download Image
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setCapturedImage(null)}
                  >
                    Clear Image
                  </Button>
                </Box>
              </Box>
            </GlassPaper>
          </Box>
        )}
      </Box>

      {/* Instructions */}
      <GlassPaper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Instructions:
        </Typography>
        <Box component="ul" sx={{ color: 'rgba(255, 255, 255, 0.8)', pl: 2 }}>
          <li>Look at the camera to detect your face</li>
          <li>Use the "Show/Hide Landmarks" button to toggle facial landmark visualization</li>
          <li>Use the "Show/Hide Mesh" button to toggle facial mesh triangulation</li>
          <li>Click "Capture Image" to take a photo when a face is detected</li>
          <li>The captured image will appear in the right panel</li>
        </Box>
      </GlassPaper>
    </Container>
  );
};

export default DashboardTest;
