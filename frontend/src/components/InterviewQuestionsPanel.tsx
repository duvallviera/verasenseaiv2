import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField,
  Paper,
  Chip,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import TimerIcon from '@mui/icons-material/Timer';
import { useAgentic } from '../context/AgenticContext';

// Declare the processVoiceResponseCallback on the Window interface
declare global {
  interface Window {
    processVoiceResponseCallback?: () => void;
  }
}

// Voice recording indicator component
const RecordingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '-40px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(15, 16, 30, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(1, 2),
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  zIndex: 10
}));

interface InterviewQuestionsPanelProps {
  onQuestionSubmit?: (question: string) => void;
}

const InterviewQuestionsPanel: React.FC<InterviewQuestionsPanelProps> = ({ 
  onQuestionSubmit 
}) => {
  // Get all the necessary functions from AgenticContext
  const { 
    isListening, 
    startVoiceAnalysis, 
    stopVoiceAnalysis,
    askQuestion
  } = useAgentic();

  const [question, setQuestion] = useState('');
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const handleSubmitQuestion = () => {
    if (question.trim()) {
      console.log('Submitting question:', question);
      
      // 1. First - submit to parent component if available (Dashboard/SessionPage) - this is CRITICAL
      if (onQuestionSubmit) {
        try {
          onQuestionSubmit(question);
          console.log('Question submitted via onQuestionSubmit handler to parent component');
        } catch (error) {
          console.error('Error in onQuestionSubmit:', error);
        }
      } else {
        console.warn('No onQuestionSubmit handler provided');
      }
      
      // 2. Also submit directly to AgenticContext as a backup
      if (askQuestion) {
        try {
          askQuestion(question);
          console.log('Question submitted via askQuestion to AgenticContext');
        } catch (error) {
          console.error('Error in askQuestion:', error);
        }
      }
      
      // 3. Start recording the answer regardless of submission method
      console.log('Starting to record answer');
      startRecordingAnswer();
      
      setQuestion(''); // Clear the input field after submission
    } else {
      console.log('Cannot submit empty question');
    }
  };
  
  // Functions for handling answer recording
  const startRecordingAnswer = () => {
    console.log('Starting to record answer...');
    setIsRecordingAnswer(true);
    setElapsedTime(0);
    
    // Start the voice analysis - CRITICAL: This must work for recording to happen
    if (startVoiceAnalysis) {
      try {
        // Clear any previous recordings first
        if (isListening && stopVoiceAnalysis) {
          stopVoiceAnalysis();
        }
        
        // Small delay to make sure previous recording is cleared
        setTimeout(() => {
          startVoiceAnalysis();
          console.log('Successfully started voice analysis');
        }, 100);
      } catch (error) {
        console.error('Error starting voice analysis:', error);
      }
    } else {
      console.warn('startVoiceAnalysis function not available from AgenticContext');
    }
    
    // Start timer for UI
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    console.log('Recording answer setup complete');
  };
  
  const stopRecordingAnswer = () => {
    setIsRecordingAnswer(false);
    
    // Stop the voice analysis and process the recorded answer
    if (stopVoiceAnalysis) {
      try {
        // Stop the voice recording
        stopVoiceAnalysis();
        console.log('Stopped voice analysis');
        
        // Explicitly trigger Dashboard's processVoiceResponse through the global window
        if (window.processVoiceResponseCallback) {
          console.log('Triggering voice response processing callback');
          window.processVoiceResponseCallback();
        } else {
          console.warn('processVoiceResponseCallback not found on window object');
        }
      } catch (error) {
        console.error('Error stopping voice analysis:', error);
      }
    }
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (isListening && stopVoiceAnalysis) {
        stopVoiceAnalysis();
      }
    };
  }, [isListening, stopVoiceAnalysis]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && question.trim()) {
      handleSubmitQuestion();
    }
  };

  // Component matching the exact UI shown in the screenshot with recording functionality
  return (
    <Paper sx={{
      width: '100%',
      borderRadius: '12px',
      backgroundColor: 'rgba(15, 16, 30, 0.6)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Recording indicator */}
      {isRecordingAnswer && (
        <Fade in={isRecordingAnswer}>
          <RecordingIndicator>
            <Box sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: 'error.main',
              animation: 'pulse 1.5s infinite',
              mr: 1,
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.5,
                  transform: 'scale(0.8)'
                },
                '50%': {
                  opacity: 1,
                  transform: 'scale(1.2)'
                },
                '100%': {
                  opacity: 0.5,
                  transform: 'scale(0.8)'
                }
              }
            }} />
            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
              Recording Answer
            </Typography>
            <Chip 
              label={formatTime(elapsedTime)} 
              size="small"
              icon={<TimerIcon fontSize="small" />} 
              color="error"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </RecordingIndicator>
        </Fade>
      )}

      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center">
            <DragIndicatorIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
              Interview Questions
            </Typography>
          </Box>
          
          {isRecordingAnswer && (
            <IconButton 
              size="small" 
              color="error"
              onClick={stopRecordingAnswer}
              sx={{ ml: 1 }}
            >
              <MicOffIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        <Box display="flex" alignItems="center" sx={{ mt: 1, position: 'relative' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={isRecordingAnswer ? "Record your answer-and stop recording" : "Type your question here..."}
            value={question}
            onChange={handleQuestionChange}
            onKeyPress={handleKeyPress}
            disabled={isRecordingAnswer}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1',
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                  padding: '10px 14px',
                },
                borderRadius: '8px',
              },
            }}
            InputProps={{
              sx: { pr: 1 }
            }}
          />
          {isRecordingAnswer ? (
            <IconButton
              color="error"
              onClick={stopRecordingAnswer}
              sx={{ 
                ml: 1,
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                color: '#fff',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.2)',
                }
              }}
            >
              <MicOffIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box 
              component="div" 
              sx={{
                ml: 1, 
                minWidth: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: question.trim() ? 'pointer' : 'default',
                borderRadius: '50%',
                backgroundColor: question.trim() ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': question.trim() ? {
                  backgroundColor: '#4F46E5',
                } : {},
              }}
              onClick={question.trim() ? handleSubmitQuestion : undefined}
            >
              <SendIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default InterviewQuestionsPanel;
