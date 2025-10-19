import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, 
  List, ListItem, Divider, Chip, Collapse,
  Stack, Badge, IconButton, Tooltip,
  Grid, LinearProgress, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import VerifiedIcon from '@mui/icons-material/Verified';
import VoiceIcon from '@mui/icons-material/RecordVoiceOver';
import TextIcon from '@mui/icons-material/TextFields';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VoiceAnalyzer from './VoiceAnalyzer';
import VideoAnalyzer from './VideoAnalyzer';
import QuestionInputBar from './QuestionInputBar';
import { useAgentic } from '../context/AgenticContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  overflow: 'hidden',
  position: 'relative',
}));

const ResponseItem = styled(ListItem)<{ stress?: 'low' | 'medium' | 'high' | 'very-high' }>(({ theme, stress = 'low' }) => {
  let borderColor = theme.palette.success.main;
  let bgColor = `rgba(16, 185, 129, 0.05)`;
  
  if (stress === 'medium') {
    borderColor = theme.palette.warning.main;
    bgColor = `rgba(245, 158, 11, 0.05)`;
  } else if (stress === 'high') {
    borderColor = theme.palette.error.main;
    bgColor = `rgba(239, 68, 68, 0.05)`;
  } else if (stress === 'very-high') {
    borderColor = theme.palette.error.dark;
    bgColor = `rgba(220, 38, 38, 0.05)`;
  }
  
  return {
    borderLeft: `3px solid ${borderColor}`,
    backgroundColor: bgColor,
    borderRadius: 8,
    marginBottom: theme.spacing(1),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: `${bgColor.replace('0.05', '0.1')}`,
    },
  };
});

const AnalysisBox = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: 8,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  textAlign: 'right',
}));

const StyledProgress = styled(LinearProgress)<{ value: number }>(({ theme, value }) => {
  // Define colors based on value ranges
  let color = theme.palette.success.main;
  if (value > 75) color = theme.palette.error.main;
  else if (value > 50) color = theme.palette.warning.main;
  
  return {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
      transition: 'transform 0.5s ease',
    },
  };
});

const predefinedQuestions = [
  "What is your full name and date of birth?",
  "Where were you on the night of the incident?",
  "Do you know the person involved in this matter?",
  "Have you ever lied about something important?",
  "Are you hiding any information from us right now?",
  "Have you discussed this matter with anyone else?",
  "Is there anything else you think we should know?",
  "Are you telling the complete truth right now?"
];

// Define types for voice metrics
interface VoiceMetrics {
  pitch: number;
  volume: number;
  tempo: number;
  stress: number;
  confidence: number;
  timestamp?: number;
}

interface QuestionPanelProps {
  isRecording?: boolean;
  mode?: 'calibration' | 'standard' | 'intensive';
  onQuestionAsked?: (question: string) => void;
  onResponseCaptured?: (text: string) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({ 
  isRecording = false,
  mode = 'standard',
  onQuestionAsked,
  onResponseCaptured
}) => {
  // State management
  const [question, setQuestion] = useState('');
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [showPredefined, setShowPredefined] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [responseMode, setResponseMode] = useState<'voice' | 'text'>('text');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    question: string;
    response?: string;
    timestamp: number;
    stress?: 'low' | 'medium' | 'high' | 'very-high';
    truthScore?: number;
    mode?: 'text' | 'voice';
  }>>([]);
  
  // Voice metrics state
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics>({
    pitch: 0,
    volume: 0,
    tempo: 0,
    stress: 0,
    confidence: 0,
    timestamp: Date.now()
  });
  const [metricsHistory, setMetricsHistory] = useState<VoiceMetrics[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState<string[]>([]);
  
  // Context and refs
  const { 
    currentEmotion,
    currentVoiceAnalysis,
    truthProbability,
    currentSession,
    askQuestion,
    recordResponse,
    isListening,
    startVoiceAnalysis,
    stopVoiceAnalysis
  } = useAgentic();
  
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Load current session questions when available
  useEffect(() => {
    if (currentSession && currentSession.questions) {
      const sessionQuestions = currentSession.questions.map((q: any) => ({
        id: q.id,
        question: q.text,
        timestamp: q.timestamp,
        ...(q.response && { response: q.response }),
        mode: 'text' as const
      }));
      
      setChatHistory(sessionQuestions);
    }
  }, [currentSession]);
  
  // Process voice metrics when recording
  useEffect(() => {
    if (isAudioRecording) {
      setIsAnalyzing(true);
      
      // Simulate voice metrics for demonstration
      const interval = setInterval(() => {
        if (metricsHistory.length > 0) {
          // Random fluctuations to simulate real voice analysis
          const lastMetrics = metricsHistory[metricsHistory.length - 1];
          
          // Generate slight variations for realistic metrics
          const newMetrics: VoiceMetrics = {
            pitch: Math.max(0, Math.min(100, lastMetrics.pitch + (Math.random() * 20 - 10))),
            volume: Math.max(0, Math.min(100, lastMetrics.volume + (Math.random() * 15 - 7.5))),
            tempo: Math.max(0, Math.min(100, lastMetrics.tempo + (Math.random() * 10 - 5))),
            stress: Math.max(0, Math.min(100, lastMetrics.stress + (Math.random() * 15 - 5))),
            confidence: Math.max(0, Math.min(100, lastMetrics.confidence + (Math.random() * 10 - 5))),
            timestamp: Date.now()
          };
          
          setVoiceMetrics(newMetrics);
          setMetricsHistory(prev => [...prev.slice(-20), newMetrics]); // Keep last 20 readings
        } else {
          // Initial metrics with random starting values
          const initialMetrics: VoiceMetrics = {
            pitch: 30 + Math.random() * 40, // 30-70 range
            volume: 40 + Math.random() * 30, // 40-70 range
            tempo: 40 + Math.random() * 30, // 40-70 range
            stress: 20 + Math.random() * 30, // 20-50 range 
            confidence: 50 + Math.random() * 30, // 50-80 range
            timestamp: Date.now()
          };
          
          setVoiceMetrics(initialMetrics);
          setMetricsHistory([initialMetrics]);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isAudioRecording, currentVoiceAnalysis, isAnalyzing, metricsHistory]);
  
  // Process audio data when voice analysis is active
  useEffect(() => {
    if (isAudioRecording && currentVoiceAnalysis && isAnalyzing) {
      // Calculate average metrics over the last few readings
      if (metricsHistory.length > 5) {
        const recentMetrics = metricsHistory.slice(-5);
        
        // Calculate averages for each metric
        const avgPitch = recentMetrics.reduce((sum, m) => sum + m.pitch, 0) / recentMetrics.length;
        const avgVolume = recentMetrics.reduce((sum, m) => sum + m.volume, 0) / recentMetrics.length;
        const avgTempo = recentMetrics.reduce((sum, m) => sum + m.tempo, 0) / recentMetrics.length;
        const avgStress = recentMetrics.reduce((sum, m) => sum + m.stress, 0) / recentMetrics.length;
        const avgConfidence = recentMetrics.reduce((sum, m) => sum + m.confidence, 0) / recentMetrics.length;
        
        // Set the average metrics
        const avgMetrics: VoiceMetrics = {
          pitch: avgPitch,
          volume: avgVolume,
          tempo: avgTempo,
          stress: avgStress,
          confidence: avgConfidence,
          timestamp: Date.now()
        };
        
        setVoiceMetrics(avgMetrics);
      }
    }
  }, [isAudioRecording, currentVoiceAnalysis, isAnalyzing, metricsHistory]);
  
  // Generate analysis notes based on voice metrics
  useEffect(() => {
    if (isAudioRecording && currentVoiceAnalysis) {
      // Generate insights based on the current metrics
      const generateInsight = () => {
        setChatHistory(prev => {
          const lastEntry = prev[prev.length - 1];
          if (lastEntry && !lastEntry.response && currentTranscript) {
            // Update the last question with the response
            return prev.map((item, index) => 
              index === prev.length - 1 
                ? { ...item, response: currentTranscript, stress: determineStressLevel(), truthScore: truthProbability }
                : item
            );
          }
          return prev;
        });
        
        setCurrentTranscript('');
        
        // Generate analysis notes based on current metrics
        if (voiceMetrics.stress > 70) {
          setAnalysisNotes(prev => [...prev, "High stress levels detected. Subject may be experiencing anxiety or withholding information."]);
        } else if (voiceMetrics.pitch > 65 && voiceMetrics.tempo > 60) {
          setAnalysisNotes(prev => [...prev, "Elevated pitch and speaking rate suggest potential emotional arousal."]);
        } else if (voiceMetrics.confidence < 40) {
          setAnalysisNotes(prev => [...prev, "Low confidence indicators present. Subject may be uncertain or hesitant."]);
        } else if (voiceMetrics.volume < 30) {
          setAnalysisNotes(prev => [...prev, "Low speaking volume could indicate submissiveness or discomfort with the topic."]);
        } else if (voiceMetrics.stress < 30 && voiceMetrics.confidence > 70) {
          setAnalysisNotes(prev => [...prev, "Subject appears calm and confident in their responses."]);
        }
      };
      
      // Generate new insights every 5 seconds
      const insightInterval = setInterval(generateInsight, 5000);
      return () => clearInterval(insightInterval);
    }
  }, [isAudioRecording, currentVoiceAnalysis, voiceMetrics, currentTranscript, truthProbability]);
  
  // Check for microphone permissions
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(permissionStatus.state === 'granted');
        
        permissionStatus.addEventListener('change', () => {
          setMicPermission(permissionStatus.state === 'granted');
        });
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setMicPermission(null);
      }
    };
    
    checkMicPermission().catch(() => setMicPermission(false));
  }, []);
  
  // Update analysis based on current session
  useEffect(() => {
    const sessionActive = isRecording || (currentSession && currentSession.questions.length > 0);
    
    if (isRecording && currentSession) {
      if (speechSynthesisRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    }
    
    return () => {
      if (speechSynthesisRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [isRecording, currentSession]);
  
  // Speak the question aloud using text-to-speech
  const speakQuestion = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Get available voices and select a voice
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(voice => voice.lang.includes('en-US') && voice.name.includes('Female'));
    const backupVoice = voices.find(voice => voice.lang.includes('en'));
    const defaultVoice = voices.find(voice => voice.default);
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.voice = voice || backupVoice || defaultVoice || voices[0];
      speechSynthesisRef.current.text = text;
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.0;
      speechSynthesisRef.current.volume = 1.0;
      
      speechSynthesis.speak(speechSynthesisRef.current);
    }
  };
  
  // Toggle between voice and text response modes
  const toggleResponseMode = () => {
    setResponseMode(prev => prev === 'text' ? 'voice' : 'text');
  };
  
  // Stop speaking if already in progress
  const stopSpeaking = () => {
    if (speechSynthesisRef.current && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };
  
  // Determine stress level based on metrics
  const determineStressLevel = (): 'low' | 'medium' | 'high' | 'very-high' => {
    const stressValue = voiceMetrics.stress;
    
    if (stressValue < 30) return 'low';
    if (stressValue < 50) return 'medium';
    if (stressValue < 75) return 'high';
    return 'very-high';
  };
  
  // Toggle microphone for voice analysis
  const toggleMicrophone = () => {
    setIsAudioRecording(!isAudioRecording);
    
    // Request microphone permission if needed
    if (!micPermission) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setMicPermission(true))
        .catch(() => setMicPermission(false));
    }
    
    if (!isAudioRecording) {
      setIsAnalyzing(true);
      startVoiceAnalysis();
      
      // If in voice mode, add the question to the chat
      if (responseMode === 'voice') {
        // Handle voice response logic
      }
    } else {
      setIsAnalyzing(false);
      
      // Generate final analysis notes based on overall metrics
      const finalStressLevel = determineStressLevel();
      
      // If there was a recent question, add the voice analysis results
      if (chatHistory.length > 0) {
        const lastQuestion = chatHistory[chatHistory.length - 1];
        recordResponse(lastQuestion.id, currentTranscript || '[Voice analysis only]');
      }
      
      setChatHistory(prev => {
        if (prev.length > 0) {
          const lastEntry = prev[prev.length - 1];
          return prev.map((item, index) => 
            index === prev.length - 1 
              ? { 
                ...item, 
                stress: finalStressLevel,
                truthScore: truthProbability
              }
              : item
          );
        }
        return prev;
      });
      
      // Add final analysis note
      const stressNote = `Final analysis: ${finalStressLevel.toUpperCase()} stress level. `;
      const confidenceNote = `Confidence level: ${Math.round(voiceMetrics.confidence)}%. `;
      const truthNote = `Truth assessment: ${Math.round(truthProbability || 50)}% probability of truthfulness.`;
      
      setAnalysisNotes(prev => [...prev, stressNote + confidenceNote + truthNote]);
      
      stopVoiceAnalysis();
    }
  };
  
  // Handle asking a question
  const handleAskQuestion = (text: string) => {
    setQuestion(text);
    setShowPredefined(false);
    
    // Speak the question if audio is enabled
    if (responseMode === 'voice') {
      speakQuestion(text);
    }
    
    // Add question to chat history
    const questionId = `q-${Date.now()}`;
    const newQuestion = {
      id: questionId,
      question: text,
      timestamp: Date.now(),
      mode: responseMode
    };
    
    setChatHistory([...chatHistory, newQuestion]);
    
    // Start recording if in voice mode
    if (!isAudioRecording && responseMode === 'voice') {
      toggleMicrophone();
    }
    
    // Call parent handler if provided
    if (onQuestionAsked) {
      onQuestionAsked(text);
    }
    
    // Use context functions
    askQuestion(text);
    
    // Voice mode handling
    if (responseMode === 'voice') {
      // Set timeout to allow the spoken question to complete
      setTimeout(() => {
        if (question.trim() !== '') {
          // Voice response logic will be handled by the microphone toggle
        }
      }, 1000);
    }
    
    setQuestion('');
  };
  
  return (
    <GlassPaper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <VoiceIcon sx={{ mr: 1, opacity: 0.7 }} />
          Voice Analysis Panel
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Analyze voice characteristics in real-time during the interview without recording content.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant={responseMode === 'voice' ? 'contained' : 'outlined'}
            color="primary"
            size="small"
            startIcon={<VoiceIcon />}
            onClick={() => setResponseMode('voice')}
          >
            Voice Mode
          </Button>
          
          <Button 
            variant={responseMode === 'text' ? 'contained' : 'outlined'}
            color="primary"
            size="small"
            startIcon={<TextIcon />}
            onClick={() => setResponseMode('text')}
          >
            Text Mode
          </Button>
        </Box>
      </Box>
      
      <Typography variant="subtitle2" sx={{ px: 3, pt: 2, pb: 1, color: 'text.secondary' }}>
        Real-Time Analysis
      </Typography>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Video Analyzer Component */}
        <Box sx={{ px: 3, mb: 2 }}>
          <VideoAnalyzer isRecording={isAudioRecording} />
        </Box>
        
        {/* Voice Analyzer Component */}
        <Box sx={{ px: 3, mb: 2 }}>
          <VoiceAnalyzer />
        </Box>
        
        {/* Voice Metrics Display */}
        <AnalysisBox sx={{ mx: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Voice Characteristics
          </Typography>
          
          <Grid container spacing={2}>
            {/* Pitch */}
            <Grid item xs={12}>
              <MetricLabel>
                Pitch
                <MetricValue>{Math.round(voiceMetrics.pitch)}%</MetricValue>
              </MetricLabel>
              <StyledProgress 
                variant="determinate" 
                value={voiceMetrics.pitch} 
                sx={{ mb: 1.5 }}
              />
            </Grid>
            
            {/* Volume */}
            <Grid item xs={12}>
              <MetricLabel>
                Volume
                <MetricValue>{Math.round(voiceMetrics.volume)}%</MetricValue>
              </MetricLabel>
              <StyledProgress 
                variant="determinate" 
                value={voiceMetrics.volume} 
                sx={{ mb: 1.5 }}
              />
            </Grid>
            
            {/* Speaking Rate */}
            <Grid item xs={12}>
              <MetricLabel>
                Speaking Rate
                <MetricValue>{Math.round(voiceMetrics.tempo)}%</MetricValue>
              </MetricLabel>
              <StyledProgress 
                variant="determinate" 
                value={voiceMetrics.tempo} 
                sx={{ mb: 1.5 }}
              />
            </Grid>
            
            {/* Stress Level */}
            <Grid item xs={12}>
              <MetricLabel>
                Stress Level
                <MetricValue>{Math.round(voiceMetrics.stress)}%</MetricValue>
              </MetricLabel>
              <StyledProgress 
                variant="determinate" 
                value={voiceMetrics.stress} 
                sx={{ mb: 1.5 }}
              />
            </Grid>
            
            {/* Confidence */}
            <Grid item xs={12}>
              <MetricLabel>
                Response Confidence
                <MetricValue>{Math.round(voiceMetrics.confidence)}%</MetricValue>
              </MetricLabel>
              <StyledProgress 
                variant="determinate" 
                value={voiceMetrics.confidence} 
                sx={{ mb: 1.5 }}
              />
            </Grid>
            
            {/* Truth Probability */}
            <Grid item xs={12}>
              <MetricLabel>
                Truth Probability
                <MetricValue>{Math.round(truthProbability || 50)}%</MetricValue>
              </MetricLabel>
              <StyledProgress 
                variant="determinate" 
                value={truthProbability || 50} 
                sx={{ mb: 0.5 }}
              />
            </Grid>
          </Grid>
        </AnalysisBox>
        
        {/* Analysis Notes */}
        {analysisNotes.length > 0 && (
          <AnalysisBox sx={{ mx: 3, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ErrorIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
              Expert Analysis Notes
            </Typography>
            
            <List dense disablePadding>
              {analysisNotes.map((note, i) => (
                <ListItem key={i} sx={{ py: 0.5, px: 0 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {note}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </AnalysisBox>
        )}
        
        {/* Record Control */}
        <Box sx={{ p: 3, mt: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant={isAudioRecording ? "contained" : "outlined"}
              color={isAudioRecording ? "error" : "primary"}
              startIcon={isAudioRecording ? <MicOffIcon /> : <MicIcon />}
              onClick={toggleMicrophone}
              fullWidth
            >
              {isAudioRecording ? "Stop Analysis" : "Start Voice Analysis"}
            </Button>
          </Stack>
        </Box>
        
        {/* Question Input */}
        <Box sx={{ px: 3, pb: 3 }}>
          <QuestionInputBar 
            onAskQuestion={handleAskQuestion} 
            predefinedQuestions={predefinedQuestions}
            showPredefined={showPredefined}
            onTogglePredefined={() => setShowPredefined(!showPredefined)}
          />
        </Box>
      </Box>
    </GlassPaper>
  );
};

export default QuestionPanel;
