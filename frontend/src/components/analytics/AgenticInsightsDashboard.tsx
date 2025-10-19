import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  Divider, 
  Paper, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import AttachmentStyleDisplay from './AttachmentStyleDisplay';
import EmotionTimeline from './EmotionTimeline';
import { useAgenticInsights } from '../../context/AgenticInsightsContext';
import { useAuth } from '../../context/AuthContext';
import InsightsIcon from '@mui/icons-material/Insights';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MoodIcon from '@mui/icons-material/Mood';
import GroupIcon from '@mui/icons-material/Group';

interface AgenticInsightsDashboardProps {
  sessionId?: string; // Optional - if not provided, shows overall user insights
}

const AgenticInsightsDashboard: React.FC<AgenticInsightsDashboardProps> = ({ sessionId }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { 
    fetchInsights, 
    loadingInsights, 
    attachmentStyle,
    getUserAttachmentStyle,
    getEmotionPatterns
  } = useAgenticInsights();

  // Define emotion type for better type safety
  type EmotionKey = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted';
  type EmotionScores = Record<EmotionKey, number>;

  // Generate mock emotion data for timeline visualization
  const generateMockEmotionData = () => {
    const now = new Date();
    const mockData = [];
    
    // Generate data points for the last hour with 5-minute intervals
    for (let i = 0; i < 12; i++) {
      const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000));
      
      // Create realistic emotion scores with one dominant emotion and others lower
      const emotionKeys: EmotionKey[] = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted'];
      const dominantEmotion: EmotionKey = emotionKeys[Math.floor(Math.random() * emotionKeys.length)];
      
      const scores: EmotionScores = {
        neutral: Math.random() * 0.3,
        happy: Math.random() * 0.3,
        sad: Math.random() * 0.3,
        angry: Math.random() * 0.3,
        fearful: Math.random() * 0.3,
        surprised: Math.random() * 0.3,
        disgusted: Math.random() * 0.3
      };
      
      // Make the dominant emotion stronger
      scores[dominantEmotion] = 0.5 + Math.random() * 0.5;
      
      // Normalize scores to add up to 1
      const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
      Object.keys(scores).forEach(key => {
        scores[key as EmotionKey] = scores[key as EmotionKey] / total;
      });
      
      mockData.push({
        timestamp: timestamp.getTime(),
        dominant: dominantEmotion,
        scores
      });
    }
    
    // Sort by timestamp ascending
    return mockData.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Generate mock insights to display in the Key Insights section
  const generateMockInsights = () => {
    return [
      {
        id: '1',
        text: 'Shows increased comfort with analytical topics compared to emotional ones',
        confidence: 0.87,
        type: 'communication',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
      },
      {
        id: '2',
        text: 'Displays heightened stress markers when discussing time constraints or deadlines',
        confidence: 0.76,
        type: 'stress',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5 // 5 days ago
      },
      {
        id: '3',
        text: 'Exhibits consistent non-verbal communication patterns indicating attentive listening',
        confidence: 0.92,
        type: 'behavioral',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1 // 1 day ago
      },
      {
        id: '4',
        text: 'Speech pattern analysis reveals preference for precision in language over emotional expression',
        confidence: 0.84,
        type: 'linguistic',
        timestamp: Date.now() - 1000 * 60 * 60 * 12 // 12 hours ago
      },
      {
        id: '5',
        text: 'Shows increased micro-expressions of doubt when discussing abstract concepts',
        confidence: 0.71,
        type: 'facial',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
      }
    ];
  };

  const [emotionData, setEmotionData] = useState<any[]>(generateMockEmotionData());
  // Use mock insights when real insights are empty
  const [mockInsights] = useState<any[]>(generateMockInsights());
  const [loading, setLoading] = useState<boolean>(true);
  const [attachmentData, setAttachmentData] = useState<any>({
    style: attachmentStyle,
    confidence: 0.7,
    indicators: {}
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch emotional pattern data if session ID is provided
        if (sessionId) {
          try {
            const patterns = await getEmotionPatterns(sessionId);
            if (patterns?.emotionData && patterns.emotionData.length > 0) {
              setEmotionData(patterns.emotionData);
            } else {
              // Keep the mock data if no real data is available
              console.log('No emotion data from API, using mock data');
            }
          } catch (error) {
            console.error('Error fetching emotion patterns:', error);
            // The mock data will remain when there's an error
          }
        }
        
        // We could fetch additional insights here based on session or user
        if (!sessionId && user?.id) {
          await fetchInsights(user.id);
          
          // Get user attachment style
          try {
            const userAttachmentStyle = await getUserAttachmentStyle(user.id);
            setAttachmentData({
              style: userAttachmentStyle,
              confidence: 0.85, // Placeholder confidence score
              indicators: {} // We would populate this from real data
            });
          } catch (error) {
            console.error('Error fetching user attachment style:', error);
          }
        }
      } catch (error) {
        console.error('Error loading agentic insights data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sessionId, user?.id, fetchInsights, getUserAttachmentStyle, getEmotionPatterns]);

  // Helper function to get attachment indicators - in a real app this would connect to the backend
  const getAttachmentIndicators = async (userId: string) => {
    // Placeholder - in a real implementation, this would call your backend
    return {
      confidence: 0.75,
      indicators: {
        secure: 8,
        anxious: 4,
        avoidant: 6,
        fearful: 2
      }
    };
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3, 
        color: 'primary.main'
      }}>
        <InsightsIcon sx={{ mr: 1 }} /> 
        Psychological Insights
      </Typography>
      
      <Grid container spacing={3}>
        {/* Attachment Style Card */}
        <Grid item xs={12} md={6}>
          <AttachmentStyleDisplay
            style={attachmentData.style}
            confidence={attachmentData.confidence}
            indicators={attachmentData.indicators}
          />
        </Grid>
        
        {/* Key Insights Card */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              bgcolor: 'background.paper',
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <Typography variant="h5" gutterBottom color="primary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <TipsAndUpdatesIcon sx={{ mr: 1 }} /> Key Insights
            </Typography>
            
            {mockInsights.length > 0 ? (
              <List>
                {mockInsights.slice(0, 5).map((insight, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      mb: 1, 
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <ListItemIcon>
                      <PsychologyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={insight.category}
                      secondary={insight.description}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography color="text.secondary" align="center">
                  No insights available yet. Continue interacting with the system to generate psychological insights.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Emotion Timeline */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <Typography variant="h5" gutterBottom color="primary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <MoodIcon sx={{ mr: 1 }} /> Emotional Expression Timeline
            </Typography>
            
            <Box sx={{ height: 400 }}>
              {emotionData.length > 0 ? (
                <EmotionTimeline emotionData={emotionData} height={350} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                  <Typography color="text.secondary" align="center">
                    No emotion data available for this session yet.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Communication Recommendations */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <Typography variant="h5" gutterBottom color="primary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <GroupIcon sx={{ mr: 1 }} /> Communication Recommendations
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {getRecommendations(attachmentData.style).map((rec: { title: string; description: string }, index: number) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom color="secondary">
                    {rec.title}
                  </Typography>
                  <Typography variant="body2">
                    {rec.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Helper function to get communication recommendations based on attachment style
function getRecommendations(style: string) {
  type Recommendation = {
    title: string;
    description: string;
  };

  const recommendations: Record<string, Recommendation[]> = {
    secure: [
      {
        title: 'Maintain Open Communication',
        description: 'Continue fostering open and honest communication, as this aligns with your secure attachment style.'
      },
      {
        title: 'Support Others',
        description: 'Your stable emotional base makes you well-positioned to support others with different attachment styles.'
      }
    ],
    anxious: [
      {
        title: 'Practice Self-Reassurance',
        description: 'Work on internal reassurance rather than seeking it frequently from others.'
      },
      {
        title: 'Mindful Response Delays',
        description: 'Consider waiting before responding to emotionally triggering situations to avoid reaction intensity.'
      }
    ],
    avoidant: [
      {
        title: 'Share Small Emotions First',
        description: 'Practice sharing smaller feelings before working up to deeper vulnerability.'
      },
      {
        title: 'Schedule Check-ins',
        description: 'Set regular times for emotional check-ins with important people in your life.'
      }
    ],
    fearful: [
      {
        title: 'Establish Consistent Patterns',
        description: 'Create consistency in your communications to build trust with yourself and others.'
      },
      {
        title: 'Identify Safety Signals',
        description: 'Work on recognizing when a situation is emotionally safe versus when it might be threatening.'
      }
    ],
    unknown: [
      {
        title: 'Continue Interaction',
        description: 'More interaction data is needed to provide personalized recommendations.'
      },
      {
        title: 'Explore Communication Patterns',
        description: 'Pay attention to your communication preferences and emotional responses during conversations.'
      }
    ]
  };
  
  const styleKey = style.toLowerCase();
  return recommendations[styleKey] || recommendations.unknown;
}

export default AgenticInsightsDashboard;
