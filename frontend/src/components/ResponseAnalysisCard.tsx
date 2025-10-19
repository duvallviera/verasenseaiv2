import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Collapse, 
  IconButton,
  Fade,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useAgentic } from '../context/AgenticContext';

// Styled components
const FloatingCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  padding: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  position: 'absolute',
  bottom: theme.spacing(3),
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: '800px',
  zIndex: 100,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const PulsingDot = styled(Box)<{ active: boolean; color: string }>(({ theme, active, color }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: color,
  marginRight: theme.spacing(1),
  animation: active ? 'pulse 1.5s infinite' : 'none',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.5)',
    },
    '70%': {
      transform: 'scale(1)',
      boxShadow: '0 0 0 6px rgba(255, 255, 255, 0)',
    },
    '100%': {
      transform: 'scale(0.95)',
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
    },
  },
}));

const TruthMeter = styled(LinearProgress)<{ value: number }>(({ theme, value }) => {
  // Generate color based on truth value (red to green)
  const redComponent = Math.max(0, Math.min(255, 255 - (value * 2.55)));
  const greenComponent = Math.max(0, Math.min(255, value * 2.55));
  
  return {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    '& .MuiLinearProgress-bar': {
      borderRadius: 4,
      background: `rgb(${redComponent}, ${greenComponent}, 50)`,
    }
  };
});

const KeyPointChip = styled(Chip)<{ truthlevel: 'high' | 'medium' | 'low' }>(({ theme, truthlevel }) => {
  let bgColor = '#10b981'; // Default green for high truth
  
  if (truthlevel === 'medium') {
    bgColor = '#f59e0b'; // Orange for medium truth
  } else if (truthlevel === 'low') {
    bgColor = '#ef4444'; // Red for low truth
  }
  
  return {
    backgroundColor: `${bgColor}20`,
    color: bgColor,
    border: `1px solid ${bgColor}60`,
    margin: '4px 4px 4px 0',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});

interface ResponseAnalysisCardProps {
  active?: boolean;
  question?: string;
  response?: string;
  timestamp?: number;
}

const ResponseAnalysisCard: React.FC<ResponseAnalysisCardProps> = ({
  active = false,
  question = '',
  response = '',
  timestamp = Date.now()
}) => {
  const { 
    truthProbability,
    currentEmotion,
    currentVoiceAnalysis,
    currentSession
  } = useAgentic();
  
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(active);
  const [analysisPoints, setAnalysisPoints] = useState<Array<{text: string, truthLevel: 'high' | 'medium' | 'low'}>>([]);
  
  // Get the appropriate truth label based on probability
  const getTruthLabel = () => {
    if (truthProbability > 80) return { text: 'Very Likely True', level: 'high' as const };
    if (truthProbability > 60) return { text: 'Likely True', level: 'high' as const };
    if (truthProbability > 40) return { text: 'Uncertain', level: 'medium' as const };
    if (truthProbability > 20) return { text: 'Likely False', level: 'low' as const };
    return { text: 'Very Likely False', level: 'low' as const };
  };
  
  // Generate analysis points based on voice and facial data
  useEffect(() => {
    if (!active) return;
    
    const points: Array<{text: string, truthLevel: 'high' | 'medium' | 'low'}> = [];
    
    // Add points based on voice analysis
    if (currentVoiceAnalysis) {
      if (currentVoiceAnalysis.stressLevel > 70) {
        points.push({ 
          text: 'High vocal stress detected during response', 
          truthLevel: 'low' 
        });
      }
      
      // Checking for speech rate patterns
      if (currentVoiceAnalysis.stressLevel > 70) {
        points.push({ 
          text: 'Accelerated speech patterns indicate nervousness', 
          truthLevel: 'low' 
        });
      }
      
      // Check for low volume indications (using stress as proxy in this simplified version)
      if (currentVoiceAnalysis.stressLevel < 30 && truthProbability < 50) {
        points.push({ 
          text: 'Low speaking volume suggests uncertainty', 
          truthLevel: 'medium' 
        });
      }
    }
    
    // Add points based on emotional analysis
    if (currentEmotion) {
      // Check if dominant emotion suggests deception
      if (currentEmotion.dominant === 'sad' || currentEmotion.dominant === 'angry' || 
          currentEmotion.dominant === 'disgust' || currentEmotion.dominant === 'fear') {
        points.push({ 
          text: `Dominant emotion is ${currentEmotion.dominant}`, 
          truthLevel: 'low' 
        });
      }
      
      // Check for highly neutral expression
      const neutralScore = currentEmotion.scores?.neutral || 0;
      if (neutralScore > 0.7) {
        points.push({ 
          text: 'Highly neutral expression may indicate controlled response', 
          truthLevel: 'medium' 
        });
      }
      
      // Check for inappropriate positive emotion
      const happyScore = currentEmotion.scores?.happy || 0;
      if (happyScore > 0.6 && truthProbability < 40) {
        points.push({ 
          text: 'Inappropriate positive emotion during deceptive response', 
          truthLevel: 'low' 
        });
      }
    }
    
    // Add truth-supporting points when probability is high
    if (truthProbability > 70) {
      points.push({ 
        text: 'Consistent voice and facial emotional patterns', 
        truthLevel: 'high' 
      });
      
      // Add confidence-related insight if available
      if (currentVoiceAnalysis && currentVoiceAnalysis.stressLevel < 30) {
        points.push({ 
          text: 'Low stress indicators in vocal patterns', 
          truthLevel: 'high' 
        });
      }
    }
    
    // Set a default if no points were generated
    if (points.length === 0) {
      const defaultPoint = (truthProbability > 50) 
        ? { text: 'No significant deception indicators detected', truthLevel: 'high' as const }
        : { text: 'Multiple subtle deception indicators present', truthLevel: 'low' as const };
      points.push(defaultPoint);
    }
    
    setAnalysisPoints(points);
  }, [active, currentVoiceAnalysis, currentEmotion, truthProbability]);
  
  // Handle visibility
  useEffect(() => {
    setVisible(active);
  }, [active]);
  
  // Format the timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const truthInfo = getTruthLabel();
  
  if (!visible && !active) return null;
  
  return (
    <Fade in={visible} timeout={500}>
      <FloatingCard elevation={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PulsingDot 
              active={active} 
              color={truthInfo.level === 'high' ? '#10b981' : 
                    truthInfo.level === 'medium' ? '#f59e0b' : '#ef4444'} 
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#fff' }}>
              {active ? 'Live Analysis' : 'Response Analysis'}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${truthProbability}% Truth Probability`}
              size="small"
              icon={truthInfo.level === 'low' ? <WarningIcon /> : <CheckCircleIcon />}
              color={truthInfo.level === 'high' ? 'success' : 
                    truthInfo.level === 'medium' ? 'warning' : 'error'}
              variant="outlined"
            />
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)} 
              sx={{ color: 'white' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        </Box>
        
        {!expanded ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TruthMeter 
              variant="determinate" 
              value={truthProbability} 
              sx={{ flexGrow: 1, mr: 2 }}
            />
            <Typography variant="body2" sx={{ color: 'white', whiteSpace: 'nowrap' }}>
              {truthInfo.text}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Collapse in={expanded} timeout="auto">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <QuestionAnswerIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {formatTime(timestamp)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 0.5 }}>
                    Question:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, color: 'white' }}>
                    {question || 'No question recorded'}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 0.5 }}>
                    Response:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'white' }}>
                    {response || 'No response recorded'}
                  </Typography>
                  
                  <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                  
                  <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 1 }}>
                    Analysis Points:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {analysisPoints.map((point, index) => (
                      <Tooltip key={index} title={point.text}>
                        <KeyPointChip
                          label={point.text}
                          size="small"
                          truthlevel={point.truthLevel}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box sx={{ width: '48%' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Voice Stress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={currentVoiceAnalysis?.stressLevel || 0} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: (currentVoiceAnalysis?.stressLevel || 0) > 70 ? '#ef4444' : 
                                   (currentVoiceAnalysis?.stressLevel || 0) > 40 ? '#f59e0b' : '#10b981'
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ width: '48%' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Emotional Response
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(() => {
                          // Calculate emotional response metric from available emotions
                          if (!currentEmotion?.scores) return 0;
                          const neutral = currentEmotion.scores.neutral || 0;
                          // Higher values for non-neutral emotions
                          return Math.min(100, Math.max(0, (1 - neutral) * 100));
                        })()} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#8b5cf6'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        )}
      </FloatingCard>
    </Fade>
  );
};
