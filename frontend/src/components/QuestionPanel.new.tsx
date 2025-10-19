import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, 
  List, ListItem, Divider, Chip, Collapse,
  Stack, Badge, IconButton, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import VerifiedIcon from '@mui/icons-material/Verified';
import VoiceIcon from '@mui/icons-material/RecordVoiceOver';
import TextIcon from '@mui/icons-material/TextFields';
import VoiceAnalyzer from './VoiceAnalyzer';
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
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [responseMode, setResponseMode] = useState<'voice' | 'text'>('text');
  
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
  
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState<{
    id: string;
    question: string;
    response?: string;
    timestamp: number;
    stress?: 'low' | 'medium' | 'high' | 'very-high';
    truthScore?: number;
    mode?: 'voice' | 'text';
  }[]>([]);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);
  
  // Update chat history when session changes
  useEffect(() => {
    if (currentSession && currentSession.questions) {
      const history = currentSession.questions.map(q => ({
        id: q.id,
        question: q.text,
        response: q.response,
        timestamp: q.timestamp,
        stress: q.emotionAtResponse?.stressLevel,
        truthScore: Math.round(Math.random() * 100) // Simulated for now
      }));
      setChatHistory(history);
    }
  }, [currentSession]);
  
  // Simulate speech-to-text when voice analysis is active
  useEffect(() => {
    if (isAudioRecording && currentVoiceAnalysis) {
      // In a real implementation, we would get this from a speech recognition service
      // For now, we'll just simulate a response based on predefined phrases
      const simulatedPhrases = [
        "Yes, I understand the question.",
        "No, I don't recall that information.",
        "I was at home during that time.",
        "That's not something I feel comfortable discussing.",
        "I'm being completely honest with you.",
        "Let me think about that for a moment."
      ];
      
      const randomPhrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setCurrentTranscript(randomPhrase);
    }
  }, [isAudioRecording, currentVoiceAnalysis]);
  
  // Process audio data when voice analysis is active
  useEffect(() => {
    if (isAudioRecording && currentVoiceAnalysis && currentTranscript) {
      // Add the response to the last question
      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            response: currentTranscript
          };
        }
        return updated;
      });
      
      // Call the response callback
      if (onResponseCaptured) {
        onResponseCaptured(currentTranscript);
      }
      
      // Store the response
      if (chatHistory.length > 0) {
        const lastQuestion = chatHistory[chatHistory.length - 1];
        recordResponse(lastQuestion.id, currentTranscript);
      }
      
      // Reset for next question
      setCurrentTranscript('');
    }
  }, [isAudioRecording, currentVoiceAnalysis, currentTranscript, onResponseCaptured, recordResponse, chatHistory]);
  
  // Check microphone permissions when component mounts
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermission(true);
      } catch (err) {
        console.error('Microphone permission error:', err);
        setMicPermission(false);
      }
    };
    
    checkMicPermission();
  }, []);
  
  // For debugging
  useEffect(() => {
    console.log('isRecording:', isRecording);
    console.log('Current session:', currentSession);
  }, [isRecording, currentSession]);
  
  // Function to speak responses
  const speakResponse = (text: string) => {
    if (speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Use a more natural voice if available
      const voices = speechSynthesisRef.current.getVoices();
      const preferredVoice = voices.find(voice => voice.name.includes('Google') || voice.name.includes('Natural'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Speak the text
      speechSynthesisRef.current.speak(utterance);
    }
  };
  
  // Toggle between voice and text response mode
  const toggleResponseMode = () => {
    const newMode = responseMode === 'text' ? 'voice' : 'text';
    setResponseMode(newMode);
    
    // Announce mode change
    if (newMode === 'voice' && speechSynthesisRef.current) {
      speakResponse('Voice response mode activated. I will speak my responses.');
    } else if (speechSynthesisRef.current) {
      // Cancel any ongoing speech when switching to text mode
      speechSynthesisRef.current.cancel();
    }
  };
  
  // Function to toggle microphone
  const toggleMicrophone = () => {
    if (!micPermission) return;
    
    setIsAudioRecording(!isAudioRecording);
    
    // Start/stop voice analysis
    if (!isAudioRecording) {
      startVoiceAnalysis();
      
      // For voice response mode, provide audio feedback
      if (responseMode === 'voice') {
        speakResponse('Voice recording started. Please speak clearly.');
      }
    } else {
      stopVoiceAnalysis();
    }
  };
  
  // Handle predefined questions
  const handlePredefinedQuestion = (q: string) => {
    setQuestion(q);
    setShowPredefined(false);
    
    // Automatically ask the question after a short delay
    setTimeout(() => {
      handleAskQuestion();
    }, 300);
  };
  
  // Handle asking a question - either text or voice input
  const handleAskQuestion = async () => {
    if (!question.trim() && !isAudioRecording) return;
    
    const questionId = `q-${Date.now()}`;
    const timestamp = Date.now();
    
    // Add question to chat history
    const historyItem = {
      id: questionId,
      question: question || 'Voice question...',
      timestamp,
      truthScore: 0,
      mode: responseMode
    };
    
    setChatHistory([...chatHistory, historyItem]);
    
    // If using the voice analyzer, it will handle the response
    if (!isAudioRecording) {
      // Call the handler if provided
      if (onQuestionAsked) {
        onQuestionAsked(question);
      }
      
      // Register question with agentic context
      askQuestion(questionId, question, timestamp);
      
      // For voice response mode, initiate speech
      if (responseMode === 'voice') {
        speakResponse(`I'm analyzing your question: ${question}. Please provide your response when ready.`);
      }
      
      // Clear input field
      setQuestion('');
    }
  };
  
  return (
    <GlassPaper elevation={3}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Question Panel
        </Typography>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Voice Analyzer Component */}
          <Box sx={{ mb: 2 }}>
            <VoiceAnalyzer />
          </Box>
          
          {/* Chat history list */}
          <List sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: 0, 
            '& .MuiListItem-root': { 
              flexDirection: 'column', 
              alignItems: 'flex-start' 
            } 
          }}>
            {chatHistory.map((chat, index) => (
              <React.Fragment key={chat.id || index}>
                {/* Question */}
                <ListItem>
                  <Box sx={{ 
                    backgroundColor: 'rgba(30, 30, 60, 0.5)', 
                    padding: 1.5, 
                    borderRadius: 2,
                    maxWidth: '85%',
                    alignSelf: 'flex-start'
                  }}>
                    <Typography variant="body1" sx={{ color: 'primary.light' }}>
                      {chat.question}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </ListItem>
                
                {/* Response (if any) */}
                {chat.response && (
                  <ListItem>
                    <Box sx={{ 
                      ml: 'auto',
                      backgroundColor: 'rgba(20, 120, 220, 0.2)', 
                      padding: 1.5, 
                      borderRadius: 2,
                      maxWidth: '85%',
                      alignSelf: 'flex-end'
                    }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">
                          {chat.response}
                        </Typography>
                        
                        {/* Truth indicator badge */}
                        {chat.truthScore !== undefined && (
                          <Badge 
                            badgeContent={`${chat.truthScore}%`} 
                            color={chat.truthScore > 70 ? 'success' : 
                                  chat.truthScore > 40 ? 'warning' : 'error'}
                            sx={{ ml: 1 }}
                          >
                            {chat.truthScore > 70 ? 
                              <VerifiedIcon color="success" /> : 
                              <ErrorIcon color="error" />}
                          </Badge>
                        )}
                      </Stack>
                      
                      {/* Analysis indicators */}
                      <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 0.5 }}>
                        {/* Stress indicator */}
                        {chat.stress && (
                          <Chip 
                            label={`Stress: ${chat.stress}`}
                            size="small"
                            color={
                              chat.stress === 'very-high' ? 'error' :
                              chat.stress === 'high' ? 'warning' :
                              chat.stress === 'medium' ? 'info' : 'success'
                            }
                          />
                        )}
                        
                        {/* Truth assessment chip */}
                        {chat.truthScore !== undefined && (
                          <Chip 
                            label={chat.truthScore > 80 ? 'Very Likely True' :
                                  chat.truthScore > 60 ? 'Likely True' :
                                  chat.truthScore > 40 ? 'Uncertain' :
                                  chat.truthScore > 20 ? 'Likely False' : 'Very Likely False'}
                            size="small"
                            color={chat.truthScore > 70 ? 'success' : 
                                  chat.truthScore > 40 ? 'warning' : 'error'}
                          />
                        )}
                      </Stack>
                      
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {chat.response && new Date(chat.timestamp + 2000).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </ListItem>
                )}
                
                {index < chatHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
        
        <Collapse in={showPredefined}>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {predefinedQuestions.map((q, index) => (
              <Chip 
                key={index}
                label={q.length > 30 ? q.substring(0, 30) + '...' : q} 
                onClick={() => handlePredefinedQuestion(q)}
                sx={{ 
                  background: 'rgba(99, 102, 241, 0.2)',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.3)',
                  }
                }}
              />
            ))}
          </Box>
        </Collapse>
        
        {/* Mode toggle button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title={`Switch to ${responseMode === 'text' ? 'voice' : 'text'} response mode`}>
            <IconButton 
              onClick={toggleResponseMode}
              color="primary"
              sx={{ 
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                }
              }}
            >
              {responseMode === 'text' ? <VoiceIcon /> : <TextIcon />}
            </IconButton>
          </Tooltip>
          
          <Chip 
            label={responseMode === 'text' ? 'Text Mode' : 'Voice Mode'}
            color="primary"
            size="small"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
        
        {/* Enhanced question input bar */}
        <QuestionInputBar 
          isRecording={isRecording}
          isListening={isAudioRecording}
          question={question}
          setQuestion={setQuestion}
          onAskQuestion={handleAskQuestion}
          onToggleMic={toggleMicrophone}
          onTogglePredefined={() => setShowPredefined(!showPredefined)}
        />
      </Box>
    </GlassPaper>
  );
};

export default QuestionPanel;
