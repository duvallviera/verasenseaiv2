import React from 'react';
import { Container, Box } from '@mui/material';
import CameraDiagnostic from '../components/CameraDiagnostic';

const CameraTest: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      py: 2
    }}>
      <Container maxWidth="lg">
        <CameraDiagnostic />
      </Container>
    </Box>
  );
};

export default CameraTest;
