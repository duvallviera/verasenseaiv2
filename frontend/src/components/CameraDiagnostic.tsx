import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert, Paper, Chip, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import Webcam from 'react-webcam';

const DiagnosticPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(15, 16, 30, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const CameraDiagnostic: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isHttps, setIsHttps] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    checkCameraStatus();
    checkBrowserInfo();
    checkDevices();
  }, []);

  const checkCameraStatus = async () => {
    try {
      // Check if we're on HTTPS
      setIsHttps(window.location.protocol === 'https:' || window.location.hostname === 'localhost');

      // Check camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      setCameraStatus('granted');
      setDeviceInfo({
        videoTracks: stream.getVideoTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      // Stop the stream after checking
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      setCameraStatus('error');
      setErrorMessage(error.message || 'Unknown camera error');
      console.error('Camera access error:', error);
    }
  };

  const checkBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    setBrowserInfo(`${browser} - ${userAgent}`);
  };

  const checkDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  const testCameraAccess = async () => {
    setCameraStatus('checking');
    await checkCameraStatus();
  };

  const getStatusColor = () => {
    switch (cameraStatus) {
      case 'granted': return 'success';
      case 'denied': return 'error';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getStatusMessage = () => {
    switch (cameraStatus) {
      case 'granted': return 'Camera access granted ✅';
      case 'denied': return 'Camera access denied ❌';
      case 'error': return `Camera error: ${errorMessage} ❌`;
      default: return 'Checking camera access...';
    }
  };

  const getHttpsRequirements = () => {
    const requirements = [
      { browser: 'Chrome 47+', https: 'Required (localhost exception)', status: isHttps || window.location.hostname === 'localhost' },
      { browser: 'Firefox 68+', https: 'Required (localhost exception)', status: isHttps || window.location.hostname === 'localhost' },
      { browser: 'Safari 11+', https: 'Required (NO exceptions)', status: isHttps },
      { browser: 'Mobile browsers', https: 'Required (ALL)', status: isHttps }
    ];
    return requirements;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
        📹 Camera Diagnostic Tool
      </Typography>

      {/* Camera Status */}
      <DiagnosticPaper>
        <Typography variant="h6" gutterBottom>Camera Status</Typography>
        <Chip 
          label={getStatusMessage()} 
          color={getStatusColor() as any}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={testCameraAccess}
          sx={{ ml: 2 }}
        >
          Test Camera Access
        </Button>
      </DiagnosticPaper>

      {/* HTTPS Requirements */}
      <DiagnosticPaper>
        <Typography variant="h6" gutterBottom>HTTPS Requirements</Typography>
        <Alert severity={isHttps ? 'success' : 'error'} sx={{ mb: 2 }}>
          Current protocol: {window.location.protocol} on {window.location.hostname}
          {isHttps ? ' ✅ HTTPS Compliant' : ' ❌ HTTPS Required for camera access'}
        </Alert>
        
        <List dense>
          {getHttpsRequirements().map((req, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={req.browser}
                secondary={req.https}
              />
              <Chip 
                label={req.status ? '✅' : '❌'} 
                color={req.status ? 'success' : 'error'}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </DiagnosticPaper>

      {/* Browser Information */}
      <DiagnosticPaper>
        <Typography variant="h6" gutterBottom>Browser Information</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
          {browserInfo}
        </Typography>
      </DiagnosticPaper>

      {/* Available Devices */}
      <DiagnosticPaper>
        <Typography variant="h6" gutterBottom>Available Camera Devices</Typography>
        {availableDevices.length > 0 ? (
          <List dense>
            {availableDevices.map((device, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={device.label || `Camera ${index + 1}`}
                  secondary={`Device ID: ${device.deviceId.substring(0, 20)}...`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">No camera devices found</Typography>
        )}
      </DiagnosticPaper>

      {/* Camera Test */}
      {cameraStatus === 'granted' && (
        <DiagnosticPaper>
          <Typography variant="h6" gutterBottom>Camera Test</Typography>
          <Box sx={{ 
            position: 'relative', 
            maxWidth: 640, 
            mx: 'auto',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Webcam
              ref={webcamRef}
              width={640}
              height={480}
              mirrored
              screenshotFormat="image/jpeg"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </Box>
          <Button 
            variant="contained" 
            onClick={() => {
              const imageSrc = webcamRef.current?.getScreenshot();
              if (imageSrc) {
                const link = document.createElement('a');
                link.download = 'camera-test.jpg';
                link.href = imageSrc;
                link.click();
              }
            }}
            sx={{ mt: 2 }}
          >
            Take Test Photo
          </Button>
        </DiagnosticPaper>
      )}

      {/* Device Information */}
      {deviceInfo && (
        <DiagnosticPaper>
          <Typography variant="h6" gutterBottom>Camera Settings</Typography>
          <pre style={{ color: 'white', fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(deviceInfo, null, 2)}
          </pre>
        </DiagnosticPaper>
      )}

      {/* Solutions */}
      <DiagnosticPaper>
        <Typography variant="h6" gutterBottom>Common Solutions</Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="1. Enable HTTPS"
              secondary="Deploy to HTTPS server or use localhost for development"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="2. Grant Camera Permissions"
              secondary="Click the camera icon in browser address bar and allow camera access"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="3. Check Browser Compatibility"
              secondary="Use Chrome 47+, Firefox 68+, Safari 11+, or modern mobile browsers"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="4. Disable Ad Blockers"
              secondary="Some ad blockers may interfere with camera access"
            />
          </ListItem>
        </List>
      </DiagnosticPaper>
    </Box>
  );
};

export default CameraDiagnostic;
