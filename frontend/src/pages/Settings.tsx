import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Switch,
  FormControlLabel, Divider, Slider, Select, MenuItem,
  InputLabel, FormControl, Button, Tabs, Tab, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '@/context/AuthContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  '& .MuiSlider-thumb': {
    width: 14,
    height: 14,
  },
  '& .MuiSlider-rail': {
    opacity: 0.3,
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: 'white',
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.7)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'rgba(255,255,255,0.6)',
  '&.Mui-selected': {
    color: '#fff',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [saved, setSaved] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Detection settings
    faceDetectionEnabled: true,
    faceDetectionInterval: 100,
    minDetectionConfidence: 60,
    voiceAnalysisEnabled: true,
    minAudioSensitivity: 40,
    emotionSensitivity: 75,
    truthDetectionThreshold: 70,
    
    // Display settings
    darkMode: true,
    highContrastMode: false,
    animationsEnabled: true,
    fontSize: 'medium',
    graphUpdateInterval: 1000,
    
    // Data & privacy settings
    saveSessionData: true,
    anonymizeData: false,
    dataRetentionPeriod: 30,
    shareAnalytics: true,
    
    // Notification settings
    emailNotifications: true,
    sessionSummaries: true,
    securityAlerts: true,
    
    // Security settings
    autoLogout: true,
    autoLogoutTime: 30,
    sessionRecording: true,
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSliderChange = (setting: string) => (event: Event, newValue: number | number[]) => {
    setSettings({
      ...settings,
      [setting]: newValue as number
    });
  };
  
  const handleSwitchChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked
    });
  };
  
  const handleSelectChange = (setting: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setSettings({
      ...settings,
      [setting]: event.target.value
    });
  };
  
  const handleSaveSettings = () => {
    // Save settings to backend or localStorage
    console.log('Saving settings:', settings);
    
    // Show success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <Box sx={{ minHeight: '100vh', pt: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 1 }}
          >
            Return to Dashboard
          </Button>
        </Box>
        
        {saved && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(46, 125, 50, 0.2)', 
              color: '#fff',
              '& .MuiAlert-icon': {
                color: '#4caf50'
              }
            }}
          >
            Your settings have been saved successfully!
          </Alert>
        )}
        
        <GlassPaper>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '.MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              }
            }}
          >
            <StyledTab icon={<TuneIcon />} label="Detection" iconPosition="start" />
            <StyledTab icon={<DisplaySettingsIcon />} label="Display" iconPosition="start" />
            <StyledTab icon={<DataUsageIcon />} label="Data & Privacy" iconPosition="start" />
            <StyledTab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
            <StyledTab icon={<SecurityIcon />} label="Security" iconPosition="start" />
          </Tabs>
          
          {/* Detection Settings */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Face Detection
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.faceDetectionEnabled}
                      onChange={handleSwitchChange('faceDetectionEnabled')}
                      color="primary"
                    />
                  }
                  label="Enable Face Detection"
                  sx={{ mb: 2, color: 'white' }}
                />
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Detection Interval: {settings.faceDetectionInterval}ms
                </Typography>
                <StyledSlider
                  value={settings.faceDetectionInterval}
                  onChange={handleSliderChange('faceDetectionInterval')}
                  min={50}
                  max={500}
                  step={50}
                  disabled={!settings.faceDetectionEnabled}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Min Detection Confidence: {settings.minDetectionConfidence}%
                </Typography>
                <StyledSlider
                  value={settings.minDetectionConfidence}
                  onChange={handleSliderChange('minDetectionConfidence')}
                  min={30}
                  max={90}
                  disabled={!settings.faceDetectionEnabled}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Emotion Sensitivity: {settings.emotionSensitivity}%
                </Typography>
                <StyledSlider
                  value={settings.emotionSensitivity}
                  onChange={handleSliderChange('emotionSensitivity')}
                  min={10}
                  max={100}
                  disabled={!settings.faceDetectionEnabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Voice Analysis
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.voiceAnalysisEnabled}
                      onChange={handleSwitchChange('voiceAnalysisEnabled')}
                      color="primary"
                    />
                  }
                  label="Enable Voice Analysis"
                  sx={{ mb: 2, color: 'white' }}
                />
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Audio Sensitivity: {settings.minAudioSensitivity}%
                </Typography>
                <StyledSlider
                  value={settings.minAudioSensitivity}
                  onChange={handleSliderChange('minAudioSensitivity')}
                  min={10}
                  max={100}
                  disabled={!settings.voiceAnalysisEnabled}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="h6" gutterBottom sx={{ color: 'white', mt: 4 }}>
                  Truth Detection
                </Typography>
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Truth Detection Threshold: {settings.truthDetectionThreshold}%
                </Typography>
                <StyledSlider
                  value={settings.truthDetectionThreshold}
                  onChange={handleSliderChange('truthDetectionThreshold')}
                  min={50}
                  max={95}
                />
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Display Settings */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Appearance
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.darkMode}
                      onChange={handleSwitchChange('darkMode')}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.highContrastMode}
                      onChange={handleSwitchChange('highContrastMode')}
                      color="primary"
                    />
                  }
                  label="High Contrast Mode"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.animationsEnabled}
                      onChange={handleSwitchChange('animationsEnabled')}
                      color="primary"
                    />
                  }
                  label="Enable Animations"
                  sx={{ mb: 3, color: 'white', display: 'block' }}
                />
                
                <StyledFormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="font-size-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>Font Size</InputLabel>
                  <StyledSelect
                    labelId="font-size-label"
                    value={settings.fontSize}
                    onChange={handleSelectChange('fontSize') as any}
                    label="Font Size"
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </StyledSelect>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Performance
                </Typography>
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Graph Update Interval: {settings.graphUpdateInterval}ms
                </Typography>
                <StyledSlider
                  value={settings.graphUpdateInterval}
                  onChange={handleSliderChange('graphUpdateInterval')}
                  min={100}
                  max={2000}
                  step={100}
                  sx={{ mb: 3 }}
                />
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Data & Privacy Settings */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Data Storage
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.saveSessionData}
                      onChange={handleSwitchChange('saveSessionData')}
                      color="primary"
                    />
                  }
                  label="Save Session Data"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Data Retention Period: {settings.dataRetentionPeriod} days
                </Typography>
                <StyledSlider
                  value={settings.dataRetentionPeriod}
                  onChange={handleSliderChange('dataRetentionPeriod')}
                  min={1}
                  max={90}
                  disabled={!settings.saveSessionData}
                  sx={{ mb: 3 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Privacy
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.anonymizeData}
                      onChange={handleSwitchChange('anonymizeData')}
                      color="primary"
                    />
                  }
                  label="Anonymize Session Data"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.shareAnalytics}
                      onChange={handleSwitchChange('shareAnalytics')}
                      color="primary"
                    />
                  }
                  label="Share Anonymous Analytics"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}>
                  By enabling analytics, you help us improve VeraAiSense by sharing anonymous usage data.
                  No personal information or session content is ever shared.
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Notification Settings */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Email Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.emailNotifications}
                      onChange={handleSwitchChange('emailNotifications')}
                      color="primary"
                    />
                  }
                  label="Enable Email Notifications"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.sessionSummaries}
                      onChange={handleSwitchChange('sessionSummaries')}
                      color="primary"
                    />
                  }
                  label="Session Summary Reports"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                  disabled={!settings.emailNotifications}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.securityAlerts}
                      onChange={handleSwitchChange('securityAlerts')}
                      color="primary"
                    />
                  }
                  label="Security Alerts"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                  disabled={!settings.emailNotifications}
                />
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Security Settings */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Session Security
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.autoLogout}
                      onChange={handleSwitchChange('autoLogout')}
                      color="primary"
                    />
                  }
                  label="Auto Logout on Inactivity"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
                
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Auto Logout Time: {settings.autoLogoutTime} minutes
                </Typography>
                <StyledSlider
                  value={settings.autoLogoutTime}
                  onChange={handleSliderChange('autoLogoutTime')}
                  min={5}
                  max={60}
                  step={5}
                  disabled={!settings.autoLogout}
                  sx={{ mb: 3 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.sessionRecording}
                      onChange={handleSwitchChange('sessionRecording')}
                      color="primary"
                    />
                  }
                  label="Enable Session Recording"
                  sx={{ mb: 2, color: 'white', display: 'block' }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Account Security
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{ mb: 2, display: 'block' }}
                >
                  Change Password
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{ mb: 2, display: 'block' }}
                >
                  Enable Two-Factor Authentication
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="error"
                  sx={{ mb: 2, display: 'block' }}
                >
                  Revoke All Sessions
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button 
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save All Settings
            </Button>
          </Box>
        </GlassPaper>
      </Container>
    </Box>
  );
};

export default SettingsPage;
