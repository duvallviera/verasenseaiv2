import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Slider, Switch, FormControl, 
  FormControlLabel, Divider, Select, MenuItem, InputLabel,
  TextField, Button, IconButton, Collapse, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import { useAgentic } from '../context/AgenticContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(2),
  color: theme.palette.common.white,
}));

const SettingSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  '& .MuiSlider-thumb': {
    width: 14,
    height: 14,
  },
  '& .MuiSlider-rail': {
    opacity: 0.3,
  }
}));

const DetectionSettings: React.FC = () => {
  const { agenticMode, attachmentStyle } = useAgentic();
  
  // Settings state
  const [expanded, setExpanded] = useState(false); // Start minimized by default
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Detection settings
  const [settings, setSettings] = useState({
    // Face detection settings
    faceDetectionInterval: 100, // milliseconds
    minDetectionConfidence: 60, // percentage
    emotionSensitivity: 75, // percentage
    
    // Voice analysis settings
    voiceAnalysisEnabled: true,
    voiceAnalysisInterval: 500, // milliseconds
    minAudioSensitivity: 40, // percentage
    
    // Truth detection settings
    truthDetectionEnabled: true,
    truthDetectionThreshold: 70, // percentage
    baselineDuration: 30, // seconds
    
    // Advanced settings
    useHighResModel: false, // high resolution model
    detectionPrecision: 'balanced', // balanced, speed, or precision
    saveEmotionalProfiles: true,
  });
  
  // Handle settings changes
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
  
  // Save settings
  const saveSettings = () => {
    // In a real app, this would save to backend or localStorage
    console.log('Saving detection settings:', settings);
    
    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  return (
    <GlassPaper elevation={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Detection Settings</Typography>
        </Box>
        <IconButton 
          onClick={() => setExpanded(!expanded)} 
          sx={{ color: 'white' }}
        >
          <TuneIcon />
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        {saveSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 2, backgroundColor: 'rgba(46, 125, 50, 0.2)', color: '#fff' }}
          >
            Settings saved successfully!
          </Alert>
        )}
        
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Face Detection
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Detection Interval: {settings.faceDetectionInterval}ms
          </Typography>
          <SettingSlider
            value={settings.faceDetectionInterval}
            onChange={handleSliderChange('faceDetectionInterval')}
            min={50}
            max={500}
            step={50}
          />
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Min Detection Confidence: {settings.minDetectionConfidence}%
          </Typography>
          <SettingSlider
            value={settings.minDetectionConfidence}
            onChange={handleSliderChange('minDetectionConfidence')}
            min={30}
            max={90}
          />
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Emotion Sensitivity: {settings.emotionSensitivity}%
          </Typography>
          <SettingSlider
            value={settings.emotionSensitivity}
            onChange={handleSliderChange('emotionSensitivity')}
            min={10}
            max={100}
          />
        </Box>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Voice Analysis
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.voiceAnalysisEnabled}
                onChange={handleSwitchChange('voiceAnalysisEnabled')}
                color="primary"
              />
            }
            label="Enable Voice Analysis"
          />
          
          {settings.voiceAnalysisEnabled && (
            <>
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                Analysis Interval: {settings.voiceAnalysisInterval}ms
              </Typography>
              <SettingSlider
                value={settings.voiceAnalysisInterval}
                onChange={handleSliderChange('voiceAnalysisInterval')}
                min={100}
                max={1000}
                step={100}
                disabled={!settings.voiceAnalysisEnabled}
              />
              
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                Audio Sensitivity: {settings.minAudioSensitivity}%
              </Typography>
              <SettingSlider
                value={settings.minAudioSensitivity}
                onChange={handleSliderChange('minAudioSensitivity')}
                min={10}
                max={100}
                disabled={!settings.voiceAnalysisEnabled}
              />
            </>
          )}
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{ mt: 1, mb: 2 }}
          size="small"
        >
          {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
        </Button>
        
        <Collapse in={showAdvanced}>
          <Typography variant="subtitle2" gutterBottom>
            Advanced Settings
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={settings.useHighResModel}
                  onChange={handleSwitchChange('useHighResModel')}
                  color="primary"
                />
              }
              label="Use High Resolution Model"
            />
            
            <Box sx={{ mt: 2 }}>
              <InputLabel id="detection-precision-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Detection Precision Mode
              </InputLabel>
              <Select
                labelId="detection-precision-label"
                value={settings.detectionPrecision}
                onChange={handleSelectChange('detectionPrecision') as any}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ 
                  mt: 1, 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                <MenuItem value="speed">Speed (Fastest, Less Accurate)</MenuItem>
                <MenuItem value="balanced">Balanced (Recommended)</MenuItem>
                <MenuItem value="precision">Precision (Slower, Most Accurate)</MenuItem>
              </Select>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Truth Detection Threshold: {settings.truthDetectionThreshold}%
              </Typography>
              <SettingSlider
                value={settings.truthDetectionThreshold}
                onChange={handleSliderChange('truthDetectionThreshold')}
                min={50}
                max={95}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={settings.saveEmotionalProfiles}
                  onChange={handleSwitchChange('saveEmotionalProfiles')}
                  color="primary"
                />
              }
              label="Save Emotional Profile Data"
              sx={{ mt: 1 }}
            />
          </Box>
        </Collapse>
        
        <Button 
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          fullWidth
          sx={{ mt: 2 }}
        >
          Save Settings
        </Button>
      </Collapse>
    </GlassPaper>
  );
};

export default DetectionSettings;
