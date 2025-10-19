import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Chip, Divider, 
  Fade, Collapse, Button, IconButton 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useAgentic, AgenticMode, AttachmentStyle } from '../context/AgenticContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.5)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  color: '#ffffff',
  width: '100%',
  boxShadow: theme.shadows[3],
  position: 'relative',
  overflow: 'hidden'
}));

const InsightChip = styled(Chip)<{ mode: AgenticMode | null }>(({ theme, mode }) => {
  let bgColor = theme.palette.primary.main;
  
  switch (mode) {
    case 'analytical':
      bgColor = theme.palette.info.main;
      break;
    case 'emotional':
      bgColor = theme.palette.error.main;
      break;
    case 'motivational':
      bgColor = theme.palette.warning.main;
      break;
  }
  
  return {
    backgroundColor: `${bgColor}40`, // 25% opacity
    color: bgColor,
    fontWeight: 500,
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

const AttachmentChip = styled(Chip)<{ attachmentStyle: AttachmentStyle | null }>(({ theme, attachmentStyle }) => {
  let bgColor = theme.palette.success.main;
  
  if (!attachmentStyle) {
    return {
      backgroundColor: `${theme.palette.grey[500]}40`,
      color: theme.palette.grey[500],
      fontWeight: 500,
      '& .MuiChip-label': {
        padding: '0 12px',
      },
    };
  }
  
  switch (attachmentStyle) {
    case 'secure':
      bgColor = theme.palette.success.main;
      break;
    case 'anxious':
      bgColor = theme.palette.warning.main;
      break;
    case 'avoidant':
      bgColor = theme.palette.info.main;
      break;
    case 'fearful':
      bgColor = theme.palette.error.main;
      break;
  }
  
  return {
    backgroundColor: `${bgColor}40`, // 25% opacity
    color: bgColor,
    fontWeight: 500,
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

const InsightCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  background: 'rgba(99, 102, 241, 0.1)',
  marginBottom: theme.spacing(1.5),
}));

interface AgenticOverlayProps {}

const AgenticOverlay: React.FC<AgenticOverlayProps> = () => {
  const { 
    agenticMode, 
    attachmentStyle,
    currentEmotion,
    truthProbability,
    emotionHistory,
    getRecommendedApproach,
    getEmotionalInsight
  } = useAgentic();
  
  const [insightExpanded, setInsightExpanded] = useState(true); // Default to expanded
  const [showDetails, setShowDetails] = useState(false);
  const [pulseHighlight, setPulseHighlight] = useState(false);
  const [emotionalInsight, setEmotionalInsight] = useState('');
  const [recommendedApproach, setRecommendedApproach] = useState('');
  
  // Update insights when attachment style or emotions change
  useEffect(() => {
    // Pulse animation when new insights available
    if (agenticMode || attachmentStyle) {
      setPulseHighlight(true);
      const timer = setTimeout(() => setPulseHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [agenticMode, attachmentStyle]);
  
  // Generate and update insights
  useEffect(() => {
    if (emotionHistory.length > 0) {
      try {
        const insightText = getEmotionalInsight();
        setEmotionalInsight(insightText);
      } catch (error) {
        console.error('Error getting emotional insight:', error);
      }
      
      try {
        const approachText = getRecommendedApproach();
        setRecommendedApproach(approachText);
      } catch (error) {
        console.error('Error getting recommended approach:', error);
      }
    }
  }, [emotionHistory, getEmotionalInsight, getRecommendedApproach, currentEmotion]);
  
  const getAgenticModeLabel = (mode: AgenticMode | null) => {
    switch (mode) {
      case 'analytical':
        return 'Analytical';
      case 'emotional':
        return 'Emotional';
      case 'motivational':
        return 'Motivational';
      default:
        return 'Processing';
    }
  };
  
  const getAttachmentLabel = (style: AttachmentStyle | null) => {
    switch (style) {
      case 'secure':
        return 'Secure';
      case 'anxious':
        return 'Anxious';
      case 'avoidant':
        return 'Avoidant';
      case 'fearful':
        return 'Fearful';
      default:
        return 'Analyzing';
    }
  };
  
  const getAttachmentInsight = () => {
    switch (attachmentStyle) {
      case 'secure':
        return 'Subject appears secure and balanced in their emotional responses. They are likely to be truthful and open to direct questioning.';
      case 'anxious':
        return 'Subject displays anxious attachment patterns. They may show heightened emotional responses even when being truthful. Focus on providing reassurance to get accurate answers.';
      case 'avoidant':
        return 'Subject shows avoidant patterns, displaying emotional detachment. Lack of emotional response does not necessarily indicate truth-telling. Use more direct challenges to evoke authentic responses.';
      case 'fearful':
        return 'Subject exhibits fearful attachment, with disorganized emotional reactions. Their high stress may indicate defensiveness rather than deception. Approach with supportive framing for best results.';
      default:
        return 'Still analyzing interaction patterns...';
    }
  };
  
  return (
    <GlassPaper 
      elevation={3} 
      sx={{ 
        p: 2,
        transition: 'all 0.3s ease-in-out',
        boxShadow: pulseHighlight 
          ? '0 0 0 2px rgba(99, 102, 241, 0.8)' 
          : 'none'
      }}
    >
      <Button 
        onClick={() => setInsightExpanded(!insightExpanded)}
        variant="text" 
        color="primary"
        startIcon={insightExpanded ? <CloseIcon fontSize="small" /> : <InfoIcon fontSize="small" />}
        sx={{ mb: 1, color: '#fff' }}
      >
        {insightExpanded ? 'Hide Insights' : 'Show Insights'}
      </Button>
      
      <Collapse in={insightExpanded}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Agentic Insights
            <LightbulbIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" sx={{ mr: 1, minWidth: 170 }}>
                Psychological Framework:
              </Typography>
              <InsightChip 
                label={getAgenticModeLabel(agenticMode)} 
                size="small" 
                mode={agenticMode} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" sx={{ mr: 1, minWidth: 170 }}>
                Attachment Pattern:
              </Typography>
              <AttachmentChip 
                label={getAttachmentLabel(attachmentStyle)} 
                size="small" 
                attachmentStyle={attachmentStyle} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" sx={{ mr: 1, minWidth: 170 }}>
                Truth Assessment:
              </Typography>
              <Chip 
                label={`${Math.round(truthProbability)}% ${truthProbability > 70 ? 'Truthful' : 
                       truthProbability > 40 ? 'Uncertain' : 'Deceptive'}`}
                size="small"
                color={truthProbability > 70 ? 'success' : 
                       truthProbability > 40 ? 'warning' : 'error'}
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            {currentEmotion && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ mr: 1, minWidth: 170 }}>
                  Dominant Emotion:
                </Typography>
                <Chip 
                  label={currentEmotion.dominant}
                  size="small"
                  color={currentEmotion.dominant === 'happy' ? 'success' : 
                         currentEmotion.dominant === 'neutral' ? 'info' : 
                         currentEmotion.dominant === 'sad' ? 'secondary' : 'warning'}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Attachment Analysis:
            </Typography>
            
            <InsightCard>
              <Typography variant="body2">
                {getAttachmentInsight()}
              </Typography>
            </InsightCard>
            
            <Button 
              variant="text" 
              color="primary" 
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{ mt: 1, color: '#fff' }}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            
            <Collapse in={showDetails}>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Emotional Insight:
                </Typography>
                <InsightCard sx={{ borderLeft: '3px solid #60a5fa' }}>
                  <Typography variant="body2">
                    {emotionalInsight || 'Still analyzing emotional patterns...'}
                  </Typography>
                </InsightCard>
                
                <Typography variant="body2" sx={{ mb: 1, mt: 1.5, fontWeight: 500 }}>
                  Recommended Approach:
                </Typography>
                <InsightCard sx={{ borderLeft: '3px solid #10b981' }}>
                  <Typography variant="body2">
                    {recommendedApproach || 'Building optimal approach strategy...'}
                  </Typography>
                </InsightCard>
              </Box>
            </Collapse>
          </Box>
          
          <InsightCard>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>
              Recommended Approach:
            </Typography>
            <Typography variant="body2">
              {recommendedApproach ? recommendedApproach : 'Waiting for emotional data...'}
            </Typography>
          </InsightCard>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Fade in={insightExpanded} timeout={500}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Analysis Confidence: {currentEmotion ? `${Math.round(currentEmotion.confidence * 100)}%` : 'Calculating...'}
            </Typography>
          </Box>
        </Fade>
      </Collapse>
    </GlassPaper>
  );
};

export default AgenticOverlay;
