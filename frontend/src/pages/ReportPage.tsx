import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Paper, Button, 
  Divider, Chip, Tab, Tabs, IconButton, CircularProgress,
  List, ListItem, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  position: 'relative',
  padding: theme.spacing(3),
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
  borderRadius: 12,
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
    transform: 'translateY(-50%)',
    filter: 'blur(30px)',
    borderRadius: '50%',
  },
}));

const TruthChip = styled(Chip)<{ score: number }>(({ theme, score }) => {
  // Color ranges from green (high truth) to red (low truth)
  const getColor = () => {
    if (score >= 0.8) return theme.palette.success.main;
    if (score >= 0.6) return theme.palette.success.light;
    if (score >= 0.4) return theme.palette.warning.main;
    if (score >= 0.2) return theme.palette.warning.dark;
    return theme.palette.error.main;
  };
  
  return {
    backgroundColor: `${getColor()}33`, // 20% opacity
    color: getColor(),
    fontWeight: 600,
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Simulated session data
  const [sessionData, setSessionData] = useState<any>(null);
  
  // Load session data
  useEffect(() => {
    // Simulate API call to fetch session data
    const fetchSessionData = async () => {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock data
      const mockSessionData = {
        id: sessionId,
        startTime: Date.now() - 1000 * 60 * 20, // 20 minutes ago
        endTime: Date.now() - 1000 * 60 * 2, // 2 minutes ago
        duration: 18, // minutes
        subject: 'Interview Subject',
        mode: 'standard',
        emotionSummary: {
          dominant: 'neutral',
          stressAverage: 0.47,
          emotionBreakdown: {
            neutral: 0.45,
            happy: 0.15,
            sad: 0.05,
            angry: 0.12,
            fear: 0.18,
            surprise: 0.03,
            disgust: 0.02,
          },
          stressSpikes: [
            { timestamp: Date.now() - 1000 * 60 * 15, value: 0.82, question: 'Do you know the suspect personally?' },
            { timestamp: Date.now() - 1000 * 60 * 8, value: 0.74, question: 'Have you ever lied to authorities before?' },
          ],
        },
        questions: [
          {
            id: 'q1',
            text: 'What is your full name and occupation?',
            timestamp: Date.now() - 1000 * 60 * 19,
            response: 'My name is Alex Thompson and I work as a software developer.',
            truthScore: 0.92,
            emotion: 'neutral',
            stressLevel: 'low',
          },
          {
            id: 'q2',
            text: 'Where were you on the night of March 15th?',
            timestamp: Date.now() - 1000 * 60 * 17,
            response: 'I was at home watching a movie with my roommate.',
            truthScore: 0.86,
            emotion: 'neutral',
            stressLevel: 'low',
          },
          {
            id: 'q3',
            text: 'Do you know the suspect personally?',
            timestamp: Date.now() - 1000 * 60 * 15,
            response: 'Yes, we worked together about two years ago at the same company.',
            truthScore: 0.65,
            emotion: 'fear',
            stressLevel: 'high',
          },
          {
            id: 'q4',
            text: 'Have you spoken with the suspect in the last month?',
            timestamp: Date.now() - 1000 * 60 * 12,
            response: 'No, I haven\'t been in contact with them for over a year now.',
            truthScore: 0.45,
            emotion: 'neutral',
            stressLevel: 'medium',
          },
          {
            id: 'q5',
            text: 'Have you ever lied to authorities before?',
            timestamp: Date.now() - 1000 * 60 * 8,
            response: 'No, I have always been honest with authorities.',
            truthScore: 0.34,
            emotion: 'fear',
            stressLevel: 'high',
          },
          {
            id: 'q6',
            text: 'Is there anything else you think we should know?',
            timestamp: Date.now() - 1000 * 60 * 5,
            response: 'No, I\'ve told you everything I know about the situation.',
            truthScore: 0.72,
            emotion: 'neutral',
            stressLevel: 'medium',
          },
        ],
        agenticInsights: [
          'Subject displayed heightened stress when discussing personal knowledge of the suspect',
          'Potential deception detected in questions regarding recent contact with the suspect',
          'Subject exhibited avoidant attachment patterns during questioning',
          'Emotional reactivity increased when discussing past interactions with authorities',
          'Consistent baseline for neutral questions suggests general truthfulness about identity and routine matters',
        ],
        truthAnalysis: {
          overallScore: 0.65,
          confidenceInterval: 0.15,
          areas: {
            identity: 0.92,
            alibi: 0.86,
            relationships: 0.58,
            history: 0.34,
          },
        },
        emotionTimeline: [
          { time: '12:00', neutral: 0.7, happy: 0.1, sad: 0.05, angry: 0.05, fear: 0.1, stress: 0.2 },
          { time: '12:02', neutral: 0.8, happy: 0.05, sad: 0.05, angry: 0.05, fear: 0.05, stress: 0.15 },
          { time: '12:05', neutral: 0.6, happy: 0.1, sad: 0.05, angry: 0.05, fear: 0.2, stress: 0.3 },
          { time: '12:08', neutral: 0.4, happy: 0.05, sad: 0.05, angry: 0.1, fear: 0.4, stress: 0.6 },
          { time: '12:11', neutral: 0.5, happy: 0.05, sad: 0.05, angry: 0.1, fear: 0.3, stress: 0.45 },
          { time: '12:14', neutral: 0.45, happy: 0.05, sad: 0.05, angry: 0.15, fear: 0.3, stress: 0.5 },
          { time: '12:17', neutral: 0.25, happy: 0.05, sad: 0.05, angry: 0.15, fear: 0.5, stress: 0.75 },
          { time: '12:20', neutral: 0.4, happy: 0.05, sad: 0.05, angry: 0.1, fear: 0.4, stress: 0.55 },
        ],
      };
      
      setSessionData(mockSessionData);
      setLoading(false);
    };
    
    fetchSessionData();
  }, [sessionId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  // Calculates the emotion color
  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'happy': return '#10b981'; // success
      case 'sad': return '#3b82f6'; // info
      case 'angry': return '#ef4444'; // error
      case 'fear': return '#f59e0b'; // warning
      case 'surprise': return '#ec4899'; // secondary
      case 'disgust': return '#dc2626'; // error dark
      default: return '#64748b'; // text secondary
    }
  };
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="h6">Loading session data...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box 
        sx={{ 
          py: 2, 
          px: 3, 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 16, 30, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="primary" 
            onClick={handleGoBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box>
            <Typography variant="h5">
              Session Report #{sessionId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(sessionData.startTime).toLocaleString()} • {sessionData.duration} minutes
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <IconButton color="primary" sx={{ mr: 1 }}>
            <PrintIcon />
          </IconButton>
          <IconButton color="primary" sx={{ mr: 1 }}>
            <ShareIcon />
          </IconButton>
          <IconButton color="primary">
            <FileDownloadIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {/* Truth Assessment */}
              <Grid item xs={12} md={4}>
                <GlassPaper>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InsightsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Truth Assessment</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {Math.round(sessionData.truthAnalysis.overallScore * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall Truth Probability
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ±{Math.round(sessionData.truthAnalysis.confidenceInterval * 100)}% confidence interval
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    {Object.entries(sessionData.truthAnalysis.areas).map(([area, score]: [string, any]) => (
                      <Box key={area} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 100 }}>
                          {area.charAt(0).toUpperCase() + area.slice(1)}:
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: `${score * 100}%`,
                                bgcolor: score > 0.7 ? 'success.main' : score > 0.4 ? 'warning.main' : 'error.main',
                                borderRadius: 4,
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {Math.round(score * 100)}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </GlassPaper>
              </Grid>
              
              {/* Emotion Breakdown */}
              <Grid item xs={12} md={4}>
                <GlassPaper>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Emotion Analysis</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(sessionData.emotionSummary.emotionBreakdown).map(([emotion, score]: [string, any]) => (
                      <Box key={emotion} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: `${score * 100}%`,
                                bgcolor: getEmotionColor(emotion),
                                borderRadius: 4,
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2">
                          {Math.round(score * 100)}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Stress Level Analysis
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      Average:
                    </Typography>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${sessionData.emotionSummary.stressAverage * 100}%`,
                            bgcolor: sessionData.emotionSummary.stressAverage > 0.7 
                              ? 'error.main' 
                              : sessionData.emotionSummary.stressAverage > 0.4 
                                ? 'warning.main' 
                                : 'success.main',
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      {Math.round(sessionData.emotionSummary.stressAverage * 100)}%
                    </Typography>
                  </Box>
                </GlassPaper>
              </Grid>
              
              {/* Agentic Insights */}
              <Grid item xs={12} md={4}>
                <GlassPaper>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <QuestionAnswerIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Agentic Insights</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List disablePadding>
                    {sessionData.agenticInsights.map((insight: string, index: number) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          px: 0,
                          py: 0.75, 
                          borderLeft: '2px solid', 
                          borderColor: 'primary.main',
                          pl: 2,
                          mb: 1,
                          bgcolor: 'rgba(99, 102, 241, 0.05)',
                          borderRadius: '0 8px 8px 0'
                        }}
                      >
                        <ListItemText 
                          primary={insight} 
                          primaryTypographyProps={{
                            variant: 'body2'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Stress Spikes
                  </Typography>
                  
                  {sessionData.emotionSummary.stressSpikes.map((spike: any, index: number) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        bgcolor: 'rgba(239, 68, 68, 0.1)', 
                        borderRadius: 2,
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {spike.question}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box 
                          sx={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: '50%', 
                            bgcolor: 'error.main', 
                            mr: 1 
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(spike.timestamp).toLocaleTimeString()} • Stress {Math.round(spike.value * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </GlassPaper>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Tabs */}
          <Grid item xs={12}>
            <GlassPaper>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                  },
                }}
              >
                <Tab 
                  icon={<InsightsIcon />}
                  label="Emotion Timeline" 
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'none',
                  }}
                />
                <Tab 
                  icon={<QuestionAnswerIcon />}
                  label="Question Analysis" 
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'none',
                  }}
                />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                <Typography variant="subtitle1" gutterBottom>
                  Emotional Response Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This chart shows how emotional states and stress levels changed throughout the session.
                </Typography>
                
                <Box sx={{ height: 400, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sessionData.emotionTimeline}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="time" 
                        stroke="rgba(255, 255, 255, 0.2)"
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.2)"
                        domain={[0, 1]}
                      />
                      <Tooltip />
                      <ReferenceLine y={0.7} stroke="rgba(239, 68, 68, 0.5)" strokeDasharray="3 3" label="High Stress" />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#dc2626" 
                        name="Stress Level"
                        strokeWidth={3}
                        dot={true}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="neutral" 
                        stroke="#64748b" 
                        name="Neutral"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="happy" 
                        stroke="#10b981" 
                        name="Happy"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sad" 
                        stroke="#3b82f6" 
                        name="Sad"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="angry" 
                        stroke="#ef4444" 
                        name="Angry"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fear" 
                        stroke="#f59e0b" 
                        name="Fear"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Question & Response Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Detailed analysis of each question asked during the session, with truth assessment scores.
                </Typography>
                
                {sessionData.questions.map((question: any, index: number) => (
                  <GradientBox key={question.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Question {index + 1}: {question.text}
                      </Typography>
                      <TruthChip
                        label={`Truth: ${Math.round(question.truthScore * 100)}%`}
                        score={question.truthScore}
                        size="small"
                      />
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        my: 2, 
                        px: 2, 
                        py: 1.5, 
                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                        borderRadius: 2,
                        borderLeft: '3px solid',
                        borderColor: question.truthScore > 0.7 
                          ? 'success.main' 
                          : question.truthScore > 0.4 
                            ? 'warning.main' 
                            : 'error.main',
                      }}
                    >
                      {question.response}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`Emotion: ${question.emotion}`}
                        size="small"
                        sx={{ 
                          bgcolor: `${getEmotionColor(question.emotion)}33`,
                          color: getEmotionColor(question.emotion),
                        }}
                      />
                      
                      <Chip 
                        label={`Stress: ${question.stressLevel}`}
                        size="small"
                        sx={{ 
                          bgcolor: question.stressLevel === 'low' 
                            ? 'rgba(16, 185, 129, 0.2)'
                            : question.stressLevel === 'medium'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                          color: question.stressLevel === 'low' 
                            ? 'rgb(16, 185, 129)' 
                            : question.stressLevel === 'medium'
                            ? 'rgb(245, 158, 11)'
                            : 'rgb(239, 68, 68)',
                        }}
                      />
                      
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {new Date(question.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </GradientBox>
                ))}
              </TabPanel>
            </GlassPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportPage;
