import React from 'react';
import { Box, Paper, Typography, Grid, LinearProgress, Tooltip } from '@mui/material';
import { AttachmentStyle } from '../../services/agenticService';

interface AttachmentStyleDisplayProps {
  style: AttachmentStyle;
  confidence: number;
  indicators?: {
    anxious?: number;
    avoidant?: number;
    secure?: number;
    fearful?: number;
  };
}

const AttachmentStyleDisplay: React.FC<AttachmentStyleDisplayProps> = ({ 
  style, 
  confidence, 
  indicators = {} 
}) => {
  const styleInfo = getAttachmentStyleInfo(style);
  
  // Calculate normalized scores for visualization
  const maxIndicator = Math.max(
    indicators.anxious || 0, 
    indicators.avoidant || 0, 
    indicators.secure || 0, 
    indicators.fearful || 0
  );
  
  const normalizeScore = (score?: number) => {
    if (!score) return 0;
    if (maxIndicator === 0) return 0;
    return (score / maxIndicator) * 100;
  };

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 2, 
      bgcolor: 'background.paper',
      boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
    }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Attachment Style Assessment
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Based on analysis of communication patterns and emotional responses
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3
      }}>
        <Box>
          <Typography variant="h6" color={styleInfo.color}>
            {styleInfo.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Primary Attachment Style
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: styleInfo.bgColor,
            color: styleInfo.textColor,
            width: 56,
            height: 56,
            borderRadius: '50%',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          {Math.round(confidence * 100)}%
        </Box>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
        {styleInfo.description}
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Style Indicators
          </Typography>
        </Grid>
        
        {[
          { key: 'secure', label: 'Secure', color: '#4caf50' },
          { key: 'anxious', label: 'Anxious', color: '#ff9800' },
          { key: 'avoidant', label: 'Avoidant', color: '#2196f3' },
          { key: 'fearful', label: 'Fearful', color: '#f44336' }
        ].map(item => (
          <Grid item xs={12} key={item.key}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ minWidth: 80 }}>
                {item.label}
              </Typography>
              <Box sx={{ flexGrow: 1, mx: 1 }}>
                <Tooltip title={`Score: ${indicators[item.key as keyof typeof indicators] || 0}`}>
                  <LinearProgress 
                    variant="determinate" 
                    value={normalizeScore(indicators[item.key as keyof typeof indicators])} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.05)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color
                      }
                    }} 
                  />
                </Tooltip>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {normalizeScore(indicators[item.key as keyof typeof indicators]).toFixed(0)}%
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// Helper function to get attachment style information
function getAttachmentStyleInfo(style: AttachmentStyle) {
  const styles: Record<string, any> = {
    [AttachmentStyle.SECURE]: {
      label: 'Secure',
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.15)',
      textColor: '#4caf50',
      description: 'You show characteristics of secure attachment: comfort with intimacy, trust in others, and emotional balance.'
    },
    [AttachmentStyle.ANXIOUS]: {
      label: 'Anxious',
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.15)',
      textColor: '#ff9800',
      description: 'Your communication patterns suggest anxious attachment: seeking reassurance and fearing abandonment.'
    },
    [AttachmentStyle.AVOIDANT]: {
      label: 'Avoidant',
      color: '#2196f3',
      bgColor: 'rgba(33, 150, 243, 0.15)',
      textColor: '#2196f3',
      description: 'Your patterns indicate avoidant attachment: valuing independence and sometimes keeping emotional distance.'
    },
    [AttachmentStyle.FEARFUL]: {
      label: 'Fearful',
      color: '#f44336',
      bgColor: 'rgba(244, 67, 54, 0.15)',
      textColor: '#f44336',
      description: 'Your communications show signs of fearful attachment: both desiring and fearing close relationships.'
    },
    [AttachmentStyle.UNKNOWN]: {
      label: 'Undefined',
      color: '#9e9e9e',
      bgColor: 'rgba(158, 158, 158, 0.15)',
      textColor: '#9e9e9e',
      description: 'Not enough data to determine your attachment style yet.'
    }
  };
  
  return styles[style] || styles[AttachmentStyle.UNKNOWN];
}

export default AttachmentStyleDisplay;
