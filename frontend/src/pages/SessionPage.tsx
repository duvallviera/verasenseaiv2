import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Container, Grid, Typography, Button, Stepper, 
  Step, StepLabel, Paper, IconButton, Tooltip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import FaceIcon from '@mui/icons-material/Face';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';

import WebcamCapture from '../components/WebcamCapture';
import InterviewQuestionsPanel from '../components/InterviewQuestionsPanel';
import EmotionGraph from '../components/EmotionGraph';
import QuestionPanel from '../components/QuestionPanel';
import FixedQuestionPanel from '../components/FixedQuestionPanel';
import AgenticOverlay from '../components/AgenticOverlay';
import AgenticInsightPanel from '../components/session/AgenticInsightPanel';
import { useAgentic } from '../context/AgenticContext';
import { useAgenticInsights } from '../context/AgenticInsightsContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  position: 'relative',
}));

const ButtonGradient = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6366f1 30%, #4f46e5 90%)',
  color: 'white',
  padding: '10px 20px',
  borderRadius: 50,
  boxShadow: '0 3px 10px rgba(99, 102, 241, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(99, 102, 241, 0.5)',
  },
}));

const GlassStepper = styled(Stepper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.4)',
  backdropFilter: 'blur(10px)',
  borderRadius: 12,
  padding: theme.spacing(3, 2),
  marginBottom: theme.spacing(4),
}));

// Session modes
const sessionModes = {
  'calibration': {
    title: 'Calibration Mode',
    description: 'Establish baseline emotional responses with neutral questions',
    icon: <FaceIcon />,
  },
  'standard': {
    title: 'Standard Analysis',
    description: 'Balanced questioning for typical deception analysis',
    icon: <RecordVoiceOverIcon />,
  },
  'intensive': {
    title: 'Intensive Interrogation',
    description: 'High-stress questioning for experienced subjects',
    icon: <AssessmentIcon />,
  }
};

// Define the steps for the session
const sessionSteps = [
  'Preparation',
  'Baseline Recording',
  'Main Questioning',
  'Review & Analysis'
];

const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const { 
    currentEmotion, 
    currentSession,
    startSession,
    endSession,
    askQuestion
  } = useAgentic();
  
  const [activeStep, setActiveStep] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [insightRefresh, setInsightRefresh] = useState(0);
  
  // Start session when component mounts
  useEffect(() => {
    if (!currentSession) {
      startSession();
    }
    return () => {
      // Cleanup if navigating away without ending
      if (currentSession && !sessionCompleted) {
        endSession().catch(console.error);
      }
    };
  }, [currentSession, sessionCompleted, startSession, endSession]);
  
  // Validate that mode is valid
  const sessionMode = mode as keyof typeof sessionModes;
  if (!sessionModes[sessionMode]) {
    navigate('/dashboard');
  }
  
  const handleGoBack = () => {
    // Show confirmation if session in progress
    if (currentSession && !sessionCompleted) {
      if (window.confirm('Are you sure you want to exit? Your session data will be lost.')) {
        endSession().catch(console.error);
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };
  
  const handleNextStep = () => {
    // If on last step, complete session
    if (activeStep === sessionSteps.length - 1) {
      handleCompleteSession();
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handlePreviousStep = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };
  
  const handleCompleteSession = async () => {
    try {
      const sessionId = await endSession();
      setSessionCompleted(true);
      // Navigate to report page with session ID
      navigate(`/reports/${sessionId}`);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };
  
  // Get the current stress level for UI highlighting
  const getCurrentStressLevel = () => {
    if (!currentEmotion) return 'low';
    return currentEmotion.stressLevel;
  };
  
  // Steps content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <GlassPaper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Session Preparation
                </Typography>
                <Typography variant="body1" paragraph>
                  Welcome to a {sessionModes[sessionMode].title} session. Before beginning:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                    Ensure the subject is positioned clearly in view of the camera
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                    Minimize background noise and distractions
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                    Explain the process and obtain verbal consent
                  </Typography>
                  <Typography component="li" variant="body1">
                    Ensure adequate lighting for proper facial analysis
                  </Typography>
                </Box>
                <Alert
                  severity="info"
                  icon={<HelpOutlineIcon />}
                  sx={{ mt: 3 }}
                >
                  <Typography variant="body2">
                    This {sessionMode} session is designed for {sessionModes[sessionMode].description.toLowerCase()}
                  </Typography>
                </Alert>
              </GlassPaper>
            </Grid>
            <Grid item xs={12} md={6}>
              <WebcamCapture />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* Interview Questions Panel positioned ABOVE the webcam */}
              <Box sx={{ mb: 2 }}>
                <InterviewQuestionsPanel onQuestionSubmit={(question: string) => {
                  // Handle question submission using askQuestion from AgenticContext
                  askQuestion(question);
                }} />
              </Box>
              
              {/* Camera below the interview questions */}
              <WebcamCapture />
              
              {/* Agentic Overlay */}
              <Box sx={{ mt: 2 }}>
                <AgenticOverlay />
              </Box>
              
              {/* Baseline Instructions */}
              <Box sx={{ mt: 2 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Baseline Instructions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Ask these neutral questions to establish baseline emotional responses:
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      "What is your full name and occupation?"
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      "Where were you born and raised?"
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      "What's your favorite color and why?"
                    </Typography>
                    <Typography component="li" variant="body2">
                      "Describe your typical morning routine."
                    </Typography>
                  </Box>
                </GlassPaper>
              </Box>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Camera at the top */}
              <WebcamCapture />
              
              {/* Question Panel fixed directly below camera */}
              <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
                <FixedQuestionPanel 
                  mode={sessionMode} 
                  onQuestionAsked={(question) => {
                    // Refresh insights panel when new questions are asked
                    setInsightRefresh(prev => prev + 1);
                  }}
                  onResponseCaptured={(text) => {
                    // Update current text for real-time analysis
                    setCurrentText(text);
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <GlassPaper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Emotional Analysis
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <EmotionGraph />
                    </Box>
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)' 
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Current Dominant Emotion
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {currentEmotion?.dominant || 'Analyzing...'}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Stress Level:
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          label={getCurrentStressLevel().toUpperCase()}
                          color={getCurrentStressLevel() === 'high' ? 'error' : 
                                  getCurrentStressLevel() === 'medium' ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </GlassPaper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ height: 350 }}>
                    {currentSession?.id && (
                      <AgenticInsightPanel 
                        sessionId={currentSession.id} 
                        userText={currentText}
                        refreshTrigger={insightRefresh}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <EmotionGraph />
            </Grid>
            <Grid item xs={12} md={4}>
              <GlassPaper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Session Summary
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'success.main', 
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2">
                    Questions asked: {currentSession?.questions.length || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'info.main', 
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2">
                    Session duration: {currentSession 
                      ? Math.floor((Date.now() - currentSession.startTime) / 60000) 
                      : 0} minutes
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: getCurrentStressLevel() === 'low' 
                        ? 'success.main' 
                        : getCurrentStressLevel() === 'medium'
                          ? 'warning.main'
                          : 'error.main', 
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2">
                    Current stress level: {getCurrentStressLevel()}
                  </Typography>
                </Box>
                
                <Alert
                  severity="warning"
                  icon={<WarningIcon />}
                  sx={{ mt: 3 }}
                >
                  <Typography variant="body2">
                    Review the session data carefully before proceeding to generate the final report.
                  </Typography>
                </Alert>
              </GlassPaper>
              <Box sx={{ mt: 3 }}>
                <AgenticOverlay />
              </Box>
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  // Render the help dialog
  const renderHelpDialog = () => (
    <Dialog
      open={showHelp}
      onClose={() => setShowHelp(false)}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 16, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Session Help</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          About {sessionModes[sessionMode].title}
        </Typography>
        <Typography variant="body2" paragraph>
          {sessionModes[sessionMode].description}. This mode will guide you through a structured protocol designed for optimal results.
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Session Steps:
        </Typography>
        
        <Box component="ol" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <b>Preparation:</b> Review instructions and prepare the subject
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <b>Baseline Recording:</b> Establish normal emotional responses
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <b>Main Questioning:</b> Conduct the primary deception analysis
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <b>Review & Analysis:</b> Examine results and prepare final report
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Tips:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Observe the emotional analysis panel for real-time insights
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Ask follow-up questions when stress levels increase
          </Typography>
          <Typography component="li" variant="body2">
            Use the agentic recommendations to adapt your questioning style
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setShowHelp(false)} 
          color="primary"
          variant="contained"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box 
        sx={{ 
          py: 2, 
          px: 3, 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 16, 30, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="primary" 
            onClick={handleGoBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box>
            <Typography variant="h5">
              {sessionModes[sessionMode].title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sessionCompleted 
                ? 'Session completed' 
                : currentSession 
                  ? `Session in progress - ${Math.floor((Date.now() - currentSession.startTime) / 60000)} min` 
                  : 'Starting session...'}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Session Information">
          <IconButton 
            color="primary" 
            onClick={() => setShowHelp(true)}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Stepper */}
        <GlassStepper activeStep={activeStep} alternativeLabel>
          {sessionSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </GlassStepper>
        
        {/* Content */}
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handlePreviousStep}
            variant="outlined"
          >
            Back
          </Button>
          
          <ButtonGradient
            variant="contained"
            onClick={handleNextStep}
            startIcon={activeStep === sessionSteps.length - 1 ? <CheckCircleOutlineIcon /> : undefined}
          >
            {activeStep === sessionSteps.length - 1 ? 'Complete Session' : 'Next Step'}
          </ButtonGradient>
        </Box>
      </Container>
      
      {renderHelpDialog()}
    </Box>
  );
};

export default SessionPage;
