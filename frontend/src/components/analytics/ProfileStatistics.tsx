import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useAgenticInsights } from '../../context/AgenticInsightsContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StatCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: 12,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  height: '100%',
}));

interface ProfileStatisticsProps {
  userId?: string;
}

const ProfileStatistics: React.FC<ProfileStatisticsProps> = ({ userId }) => {
  const theme = useTheme();
  const { 
    attachmentStyle, 
    getAttachmentStyleInfo,
    analyzePsychologicalProfile
  } = useAgenticInsights();
  
  // Get attachment style information for display
  const styleInfo = getAttachmentStyleInfo();

  const sessionStats = {
    totalSessions: 24,
    averageDuration: '18 min',
    totalInteractions: 432,
    accuracyRate: '87%',
    lastSession: '2 days ago',
    stressLevelAvg: 'Medium'
  };

  const emotionDistribution = {
    neutral: 45,
    happy: 22,
    sad: 12,
    surprised: 8,
    angry: 7,
    fearful: 4,
    disgusted: 2
  };

  const behavioralPatterns = [
    'Tends to speak slowly when under pressure',
    'Shows increased eye movement during complex questions', 
    'More vocal variations when discussing familiar topics',
    'Prefers analytical approach to emotional questions',
    'Displays consistent non-verbal communication patterns'
  ];

  // Use state to prevent flickering on re-renders
  const [stressData, setStressData] = useState<number[]>([]);
  const [maxStress, setMaxStress] = useState(0);
  
  // Generate random data for visualization demo only once on component mount
  useEffect(() => {
    const generateRecentStressData = () => {
      return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
    };
    
    const data = generateRecentStressData();
    setStressData(data);
    setMaxStress(Math.max(...data));
  }, []);
  
  return (
    <Grid container spacing={3}>
      {/* Session Statistics */}
      <Grid item xs={12}>
        <StyledPaper>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <EqualizerIcon sx={{ mr: 1 }} /> Session Statistics
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Sessions
                </Typography>
                <Typography variant="h4" color="primary">
                  {sessionStats.totalSessions}
                </Typography>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Avg. Duration
                </Typography>
                <Typography variant="h4" color="primary">
                  {sessionStats.averageDuration}
                </Typography>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Interactions
                </Typography>
                <Typography variant="h4" color="primary">
                  {sessionStats.totalInteractions}
                </Typography>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Accuracy Rate
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.success.main }}>
                  {sessionStats.accuracyRate}
                </Typography>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Session
                </Typography>
                <Typography variant="h6" color="text.primary">
                  {sessionStats.lastSession}
                </Typography>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Avg. Stress Level
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {sessionStats.stressLevelAvg}
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </StyledPaper>
      </Grid>
      
      {/* Recent Stress Levels */}
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <ShowChartIcon sx={{ mr: 1 }} /> Recent Stress Levels
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 2 }}>
            {stressData.map((level, index) => (
              <Box 
                key={index}
                sx={{ 
                  width: '12%', 
                  height: `${(level / maxStress) * 100}%`,
                  minHeight: 20,
                  bgcolor: level > 70 
                    ? 'error.main' 
                    : level > 40 
                      ? 'warning.main' 
                      : 'success.main',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  pb: 0.5
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {level}%
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">7 days ago</Typography>
            <Typography variant="caption" color="text.secondary">Today</Typography>
          </Box>
        </StyledPaper>
      </Grid>
      
      {/* Emotion Distribution */}
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PieChartIcon sx={{ mr: 1 }} /> Emotion Distribution
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {Object.entries(emotionDistribution).map(([emotion, percentage]) => (
              <Box 
                key={emotion}
                sx={{ 
                  bgcolor: 'rgba(30, 41, 59, 0.5)', 
                  borderRadius: 2, 
                  p: 1.5, 
                  width: '45%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box 
                  sx={{ 
                    width: 15, 
                    height: 15, 
                    borderRadius: '50%',
                    bgcolor: emotion === 'happy' 
                      ? 'success.main' 
                      : emotion === 'angry' || emotion === 'disgusted'
                        ? 'error.main'
                        : emotion === 'sad' || emotion === 'fearful'
                          ? 'warning.main'
                          : 'info.main',
                    mr: 1
                  }} 
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" textTransform="capitalize">
                    {emotion}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {percentage}%
                </Typography>
              </Box>
            ))}
          </Box>
        </StyledPaper>
      </Grid>
      
      {/* Attachment Style */}
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1 }} /> Attachment Style
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 2
          }}>
            <Box sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `8px solid ${styleInfo.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              position: 'relative'
            }}>
              <Typography variant="h4" sx={{ color: styleInfo.color, fontWeight: 'bold' }}>
                {styleInfo.label[0]}
              </Typography>
              <CircularProgress 
                variant="determinate" 
                value={75} 
                sx={{ 
                  position: 'absolute',
                  color: styleInfo.color,
                  left: -8,
                  top: -8,
                  width: '136px !important',
                  height: '136px !important',
                }}
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {styleInfo.label} Attachment
            </Typography>
            
            <Typography variant="body2" color="text.secondary" align="center">
              {styleInfo.description}
            </Typography>
          </Box>
        </StyledPaper>
      </Grid>
      
      {/* Behavioral Patterns */}
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ mr: 1 }} /> Behavioral Patterns
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List dense>
            {behavioralPatterns.map((pattern, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {index + 1}
                    </Typography>
                  </Box>
                </ListItemIcon>
                <ListItemText primary={pattern} />
              </ListItem>
            ))}
          </List>
        </StyledPaper>
      </Grid>
    </Grid>
  );
};

export default ProfileStatistics;
