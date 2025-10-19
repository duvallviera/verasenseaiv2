import React, { useState, useEffect, useRef } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
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
  top: '50%',  // Position in the middle of the screen vertically
  left: '50%',
  transform: 'translate(-50%, -50%)',  // Center both horizontally and vertically
  width: '90%',
  maxWidth: '800px',
  zIndex: 1000, // Higher z-index to ensure it's above other content
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const PulsingDot = styled(Box)<{ active: boolean; color: string }>(({ theme, active, color }) => ({
  width: 8,
  height: 8,
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

const TruthMeter = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  }
}));

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

interface TruthAnalysisCardProps {
  active?: boolean;
  question?: string;
  response?: string;
  timestamp?: number;
  truthProbability?: number;
  stressLevel?: number;
  confidenceScore?: number;
  deceptionMarkers?: string[];
  deceptionStatement?: string;
  facialDeceptionMarkers?: string[];
  facialData?: any;
  questionAnalysis?: any;
  onClose?: () => void;
  onMinimize?: () => void;
}

const TruthAnalysisCard: React.FC<TruthAnalysisCardProps> = ({
  active = false,
  question = '',
  response = '',
  timestamp = Date.now(),
  truthProbability = 50,
  stressLevel = 30,
  confidenceScore = 80,
  deceptionMarkers = [],
  deceptionStatement = "No assessment available",
  facialDeceptionMarkers = [],
  facialData = null,
  questionAnalysis = { isConsistent: true },
  onClose, 
  onMinimize 
}) => {
  const { 
    truthProbability: contextTruthProbability,
    currentEmotion,
    currentVoiceAnalysis,
    currentSession
  } = useAgentic();
  
  // Use custom truth probability if provided, otherwise use from context
  const truthProbabilityValue = truthProbability !== undefined ? truthProbability : contextTruthProbability;
  
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(active);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [analysisPoints, setAnalysisPoints] = useState<Array<{text: string, truthLevel: 'high' | 'medium' | 'low'}>>([]);
  
  // Ref for the card element
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Get the appropriate truth label based on probability
  const getTruthLabel = () => {
    if (truthProbabilityValue > 80) return { text: 'Very Likely True', level: 'high' as const };
    if (truthProbabilityValue > 60) return { text: 'Likely True', level: 'high' as const };
    if (truthProbabilityValue > 40) return { text: 'Uncertain', level: 'medium' as const };
    if (truthProbabilityValue > 20) return { text: 'Likely False', level: 'low' as const };
    return { text: 'Very Likely False', level: 'low' as const };
  };
  
  // Generate analysis points based on voice, facial data, and response content
  useEffect(() => {
    if (!active) return;
    
    const points: Array<{text: string, truthLevel: 'high' | 'medium' | 'low'}> = [];
    
    // Add custom deception markers if provided
    if (deceptionMarkers && deceptionMarkers.length > 0) {
      deceptionMarkers.forEach(marker => {
        points.push({
          text: marker,
          truthLevel: 'low'
        });
      });
    }
    
    // Analyze response text for potential deception markers
    if (response) {
      const responseText = response.toLowerCase();
      
      // Check for hesitation markers in text
      const hesitationPhrases = ['i think', 'maybe', 'possibly', 'i guess', 'sort of', 'kind of', 'i believe'];
      const hasHesitation = hesitationPhrases.some(phrase => responseText.includes(phrase));
      if (hasHesitation) {
        points.push({
          text: 'Hesitation markers detected in language',
          truthLevel: 'medium'
        });
      }
      
      // Check for self-reference (using "I" a lot can indicate truthfulness)
      const wordCount = responseText.split(' ').length;
      const iCount = (responseText.match(/\bi\b/g) || []).length;
      const iRatio = wordCount > 0 ? (iCount / wordCount) : 0;
      
      if (iRatio > 0.15) {
        points.push({
          text: 'High self-reference suggests personal involvement',
          truthLevel: 'high'
        });
      } else if (iRatio < 0.05 && wordCount > 10) {
        points.push({
          text: 'Low self-reference may indicate distancing',
          truthLevel: 'medium'
        });
      }
      
      // Check for overly detailed responses (can indicate fabrication)
      if (wordCount > 50 && question.split(' ').length < 10) {
        points.push({
          text: 'Unusually detailed response to simple question',
          truthLevel: 'low'
        });
      }
    }
    
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
      
      // Check for speech rate changes during key parts of response
      if ((currentVoiceAnalysis.speed > 160 || (stressLevel && stressLevel > 70)) && response.length > 20) { // Fast talking
        points.push({
          text: 'Rapid speech may indicate rehearsed response',
          truthLevel: 'medium'
        });
      }
      
      // Use custom stress level if provided
      const stressLevelValue = stressLevel !== undefined ? stressLevel : (currentVoiceAnalysis?.stressLevel || 0);
      
      // Low volume indications
      if (stressLevelValue < 30 && truthProbabilityValue < 50) {
        points.push({ 
          text: 'Low speaking volume suggests uncertainty', 
          truthLevel: 'medium' 
        });
      }
      
      // High stress indications
      if (stressLevelValue > 70) {
        points.push({ 
          text: 'High stress detected in vocal patterns', 
          truthLevel: 'low' 
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
      
      // Check for emotional mismatch with response content
      if (response.toLowerCase().includes('happy') && currentEmotion.dominant !== 'happy') {
        points.push({
          text: 'Emotional mismatch with stated feelings',
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
      if (happyScore > 0.6 && truthProbabilityValue < 40) {
        points.push({ 
          text: 'Inappropriate positive emotion during deceptive response', 
          truthLevel: 'low' 
        });
      }
    }
    
    // Add truth-supporting points when probability is high
    if (truthProbabilityValue > 70) {
      points.push({ 
        text: 'Consistent voice and facial emotional patterns', 
        truthLevel: 'high' 
      });
      
      // Get confidence level (either custom or from context)
      const confidenceLevel = confidenceScore !== undefined ? confidenceScore : (currentVoiceAnalysis?.confidence || 0);
      
      // Add confidence-related insight if available
      if (confidenceLevel > 70) {
        points.push({ 
          text: 'High confidence in truthful response', 
          truthLevel: 'high' 
        });
      }
      
      // Use stress level (either custom or from context)
      const stressLevelValue = stressLevel !== undefined ? stressLevel : (currentVoiceAnalysis?.stressLevel || 0);
      
      if (stressLevelValue < 30) {
        points.push({ 
          text: 'Low stress indicators in vocal patterns', 
          truthLevel: 'high' 
        });
      }
    }
    
    // Consider question type in analysis
    if (question) {
      const isPersonalQuestion = question.toLowerCase().includes('you') || 
                               question.toLowerCase().includes('your');
      
      if (isPersonalQuestion && (currentVoiceAnalysis?.stressLevel || 0) > 60) {
        points.push({
          text: 'Heightened stress on personal questions',
          truthLevel: 'low'
        });
      }
    }
    
    // Set a default if no points were generated
    if (points.length === 0) {
      const defaultPoint = (truthProbabilityValue > 50) 
        ? { text: 'No significant deception indicators detected', truthLevel: 'high' as const }
        : { text: 'Multiple subtle deception indicators present', truthLevel: 'low' as const };
      points.push(defaultPoint);
    }
    
    setAnalysisPoints(points);
  }, [active, currentVoiceAnalysis, currentEmotion, truthProbabilityValue, response, question]);
  
  // Handle visibility
  useEffect(() => {
    setVisible(active || false);
  }, [active]);
  
  useEffect(() => {
    if (visible && cardRef.current) {
      // Position at the top of the screen by default
      cardRef.current.style.position = 'fixed';
      cardRef.current.style.top = '20px';
      cardRef.current.style.left = '50%';
      cardRef.current.style.transform = 'translateX(-50%)';
      cardRef.current.style.width = '800px';
      cardRef.current.style.maxWidth = '90%';
    }
  }, [visible]);
  
  // Handle minimizing
  const handleMinimize = () => {
    const newMinimizedState = !minimized;
    setMinimized(newMinimizedState);
    
    // Update card position/sizing based on minimize state
    if (newMinimizedState) {
      // When minimizing, move to bottom right
      if (cardRef.current) {
        cardRef.current.style.top = 'auto';
        cardRef.current.style.bottom = '20px';
        cardRef.current.style.left = 'auto';
        cardRef.current.style.transform = 'none';
        cardRef.current.style.width = '300px'; // Smaller when minimized
      }
    } else {
      // When maximizing, restore normal size
      if (cardRef.current) {
        cardRef.current.style.width = '800px';
        
        // If it was previously dragged, keep its position
        if (!isDragging) {
          // If not dragged, reset to center
          cardRef.current.style.position = 'fixed';
          cardRef.current.style.top = '50%';
          cardRef.current.style.left = '50%';
          cardRef.current.style.bottom = 'auto';
          cardRef.current.style.transform = 'translate(-50%, -50%)';
        }
      }
    }
    
    // Call onMinimize if provided
    if (onMinimize) onMinimize();
  };
  
  // Handle closing
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  // Handle dragging functions
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection during drag
    if (cardRef.current) {
      setIsDragging(true);
      // Store the initial mouse position relative to the card
      setPosition({ 
        x: e.clientX - (cardRef.current.offsetLeft || 0), 
        y: e.clientY - (cardRef.current.offsetTop || 0) 
      });
      
      // Set cursor style to indicate dragging
      document.body.style.cursor = 'grabbing';
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && cardRef.current) {
      e.preventDefault();
      
      // Calculate new position
      const newLeft = e.clientX - position.x;
      const newTop = e.clientY - position.y;
      
      // Apply new position
      cardRef.current.style.left = `${newLeft}px`;
      cardRef.current.style.top = `${newTop}px`;
      cardRef.current.style.bottom = 'auto'; // Remove bottom positioning
      cardRef.current.style.transform = 'none'; // Remove default transform
      cardRef.current.style.position = 'fixed'; // Use fixed positioning for consistent behavior
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset cursor style
    document.body.style.cursor = 'default';
  };
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);
  
  // Format the timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const truthInfo = getTruthLabel();
  
  if (!visible && !active) return null;

  // Get the color for the truth meter
  const getTruthBarColor = () => {
    if (truthProbabilityValue > 80) return '#10b981'; // green
    if (truthProbabilityValue > 60) return '#3b82f6'; // blue
    if (truthProbabilityValue > 40) return '#f59e0b'; // orange
    if (truthProbabilityValue > 20) return '#f43f5e'; // light red
    return '#ef4444'; // red
  };
  
  return (
    <Fade in={visible} timeout={500}>
      <FloatingCard elevation={4} ref={cardRef}>
        {/* Card header with draggable handle and control buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1,
            cursor: isDragging ? 'grabbing' : 'grab',
            width: '100%',
            padding: '8px 4px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            marginTop: '-16px',
            marginLeft: '-16px',
            marginRight: '-16px',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
          onMouseDown={handleMouseDown}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', mr: 1 }} />
            <PulsingDot 
              active={active} 
              color={truthInfo.level === 'high' ? '#10b981' : 
                    truthInfo.level === 'medium' ? '#f59e0b' : '#ef4444'} 
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#fff' }}>
              {active ? 'Live Analysis' : 'Response Analysis'}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            {!minimized && (
              <Chip
                label={`${Math.round(truthProbabilityValue)}% Truth Probability`}
                size="small"
                icon={truthInfo.level === 'low' ? <WarningIcon /> : <CheckCircleIcon />}
                color={truthInfo.level === 'high' ? 'success' : 
                      truthInfo.level === 'medium' ? 'warning' : 'error'}
                variant="outlined"
                sx={{ mr: 1 }}
              />
            )}
            <IconButton 
              size="small" 
              onClick={handleMinimize} 
              sx={{ color: 'rgba(255,255,255,0.7)' }}
              title={minimized ? "Maximize" : "Minimize"}
            >
              {minimized ? <OpenInFullIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
            </IconButton>
            {!minimized && (
              <IconButton 
                size="small" 
                onClick={() => setExpanded(!expanded)} 
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <IconButton 
              size="small" 
              onClick={handleClose} 
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        
        {minimized ? (
          // Minimized view - just show truth probability with small indicator
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TruthMeter 
                variant="determinate" 
                value={truthProbabilityValue} 
                sx={{ 
                  flexGrow: 1, 
                  mr: 1,
                  height: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getTruthBarColor()
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'white', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                {Math.round(truthProbabilityValue)}%
              </Typography>
            </Box>
            
            {/* Maximize button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={handleMinimize} 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <OpenInFullIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Maximize</Typography>
              </IconButton>
            </Box>
          </Box>
        ) : !expanded ? (
          // Normal collapsed view
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TruthMeter 
              variant="determinate" 
              value={truthProbabilityValue} 
              sx={{ 
                flexGrow: 1, 
                mr: 2,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getTruthBarColor()
                }
              }}
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
                        value={stressLevel !== undefined ? stressLevel : (currentVoiceAnalysis?.stressLevel || 0)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: (stressLevel !== undefined ? stressLevel : (currentVoiceAnalysis?.stressLevel || 0)) > 70 ? '#ef4444' : 
                                 (stressLevel !== undefined ? stressLevel : (currentVoiceAnalysis?.stressLevel || 0)) > 40 ? '#f59e0b' : '#10b981'
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ width: '48%' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Analysis Confidence
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={confidenceScore !== undefined ? confidenceScore : ((() => {
                          // If no confidence score, calculate from emotional response or use default
                          if (currentVoiceAnalysis?.confidence) return currentVoiceAnalysis.confidence;
                          if (!currentEmotion?.scores) return 50;
                          const neutral = currentEmotion.scores.neutral || 0;
                          // Higher confidence with non-neutral emotions
                          return 50 + Math.min(50, Math.max(0, (1 - neutral) * 50));
                        })())} 
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

export default TruthAnalysisCard;
