import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress,
  Divider,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimerIcon from '@mui/icons-material/Timer';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { useAgenticInsights } from '../../context/AgenticInsightsContext';
import { AgenticInsight, AttachmentStyle } from '../../services/agenticService';

interface AgenticInsightPanelProps {
  sessionId: string;
  userText?: string;
  refreshTrigger?: number;
}

const AgenticInsightPanel: React.FC<AgenticInsightPanelProps> = ({ 
  sessionId, 
  userText,
  refreshTrigger = 0
}) => {
  const theme = useTheme();
  const { 
    insights, 
    fetchInsights, 
    loadingInsights, 
    analyzeText,
    attachmentStyle 
  } = useAgenticInsights();
  
  const [realtimeInsight, setRealtimeInsight] = useState<{
    style: AttachmentStyle;
    confidence: number;
    fadeIn: boolean;
  }>({
    style: AttachmentStyle.UNKNOWN,
    confidence: 0,
    fadeIn: false
  });
  
  // Fetch insights when session ID changes or refresh is triggered
  useEffect(() => {
    if (sessionId) {
      fetchInsights(sessionId);
    }
  }, [sessionId, refreshTrigger, fetchInsights]);
  
  // Analyze text in real-time when it changes
  useEffect(() => {
    const analyzeUserText = async () => {
      if (userText && userText.length > 10) {
        try {
          // Set fade out
          setRealtimeInsight(prev => ({ ...prev, fadeIn: false }));
          
          // Wait for animation
          setTimeout(async () => {
            const result = await analyzeText(userText);
            setRealtimeInsight({
              style: result.style,
              confidence: result.confidence,
              fadeIn: true
            });
          }, 300);
        } catch (error) {
          console.error('Error analyzing text:', error);
        }
      }
    };
    
    analyzeUserText();
  }, [userText, analyzeText]);
  
  // Helper to get attachment style info
  const getStyleInfo = (style: AttachmentStyle) => {
    const styles: Record<string, any> = {
      [AttachmentStyle.SECURE]: {
        label: 'Secure',
        color: theme.palette.success.main,
        icon: <SentimentSatisfiedAltIcon />
      },
      [AttachmentStyle.ANXIOUS]: {
        label: 'Anxious',
        color: theme.palette.warning.main,
        icon: <TimerIcon />
      },
      [AttachmentStyle.AVOIDANT]: {
        label: 'Avoidant',
        color: theme.palette.info.main,
        icon: <PsychologyIcon />
      },
      [AttachmentStyle.FEARFUL]: {
        label: 'Fearful',
        color: theme.palette.error.main,
        icon: <LightbulbIcon />
      },
      [AttachmentStyle.UNKNOWN]: {
        label: 'Analyzing',
        color: theme.palette.grey[500],
        icon: <PsychologyIcon />
      }
    };
    
    return styles[style] || styles[AttachmentStyle.UNKNOWN];
  };
  
  // Get style info for current realtime insight
  const styleInfo = getStyleInfo(realtimeInsight.style);
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%',
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PsychologyIcon sx={{ mr: 1 }} />
        Psychological Insights
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Real-time attachment style analysis */}
      <Fade in={realtimeInsight.fadeIn}>
        <Box 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            borderRadius: 1,
            bgcolor: alpha(styleInfo.color, 0.1),
            border: `1px solid ${alpha(styleInfo.color, 0.2)}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" color={styleInfo.color} sx={{ display: 'flex', alignItems: 'center' }}>
              {styleInfo.icon}
              <Box component="span" sx={{ ml: 1 }}>Real-time Analysis</Box>
            </Typography>
            <Chip 
              size="small" 
              label={`${Math.round(realtimeInsight.confidence * 100)}%`}
              sx={{ 
                bgcolor: alpha(styleInfo.color, 0.2),
                color: styleInfo.color
              }}
            />
          </Box>
          <Typography variant="body2">
            {styleInfo.label} communication pattern detected in current text.
          </Typography>
        </Box>
      </Fade>
      
      {/* Session insights */}
      <Typography variant="subtitle1" gutterBottom>
        Session Insights
      </Typography>
      
      {loadingInsights ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : insights.length > 0 ? (
        <List dense sx={{ flex: 1, overflow: 'auto' }}>
          {insights.map((insight, index) => (
            <ListItem 
              key={index}
              sx={{ 
                borderRadius: 1, 
                mb: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LightbulbIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={insight.category}
                secondary={insight.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No insights available yet. Continue the session to generate insights.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AgenticInsightPanel;
