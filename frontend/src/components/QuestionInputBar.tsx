import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  CircularProgress, 
  Typography,
  Chip,
  Fade,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AddIcon from '@mui/icons-material/Add';
import TimerIcon from '@mui/icons-material/Timer';
import { styled } from '@mui/material/styles';

const VoiceIndicator = styled(Box)(({ theme }) => ({
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

interface QuestionInputBarProps {
  isRecording?: boolean;
  isListening?: boolean;
  question?: string;
  setQuestion?: (value: string) => void;
  onAskQuestion: (text: string) => void;
  onToggleMic?: () => void;
  onTogglePredefined?: () => void;
  predefinedQuestions?: string[];
  showPredefined?: boolean;
  remainingTime?: number; // For countdown display
}

const QuestionInputBar: React.FC<QuestionInputBarProps> = ({
  isRecording = false,
  isListening = false,
  question = '',
  setQuestion,
  onAskQuestion,
  onToggleMic,
  onTogglePredefined,
  remainingTime
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop the timer when recording changes
  useEffect(() => {
    if (isListening) {
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Voice recording indicator */}
      <Fade in={isListening}>
        <VoiceIndicator>
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
            Recording
          </Typography>
          <Chip 
            label={formatTime(elapsedTime)} 
            size="small"
            icon={<TimerIcon fontSize="small" />} 
            color="error"
            variant="outlined"
          />
        </VoiceIndicator>
      </Fade>

      {/* Question input field */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          placeholder="Type your question here..."
          variant="outlined"
          value={question}
          onChange={(e) => setQuestion && setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && question.trim() && onAskQuestion(question)}
          InputProps={{
            sx: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              color: '#fff',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }
            }
          }}
          disabled={!isRecording || isListening}
        />
        
        <Box sx={{ display: 'flex', ml: 1 }}>
          <Tooltip title={!isRecording ? 'Start a session to use microphone' : isListening ? 'Stop recording' : 'Start recording'}>
            <IconButton
              onClick={onToggleMic}
              color={isListening ? 'error' : 'primary'}
              disabled={!isRecording}
              sx={{ mr: 1 }}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={!isRecording ? 'Start a session to see predefined questions' : 'Show predefined questions'}>
            <IconButton
              onClick={onTogglePredefined}
              color="primary"
              disabled={!isRecording}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Ask question">
            <IconButton
              onClick={() => question.trim() && onAskQuestion(question)}
              color="primary"
              disabled={(!question.trim() && !isListening) || !isRecording}
              sx={{
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default QuestionInputBar;
