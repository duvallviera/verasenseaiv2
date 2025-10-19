import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, useTheme, Chip, Grid, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { useAgentic, EmotionType, StressLevel, EmotionResult } from '../context/AgenticContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  overflow: 'hidden',
  position: 'relative',
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '30%',
  background: 'linear-gradient(to top, rgba(15, 16, 30, 0.9), rgba(15, 16, 30, 0))',
  pointerEvents: 'none',
  zIndex: 1,
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(2),
}));

const LegendColor = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: theme.spacing(1),
}));

const StressIndicator = styled(Chip)<{ level: StressLevel }>(({ theme, level }) => {
  let bgColor = 'rgba(16, 185, 129, 0.8)'; // low - success
  
  if (level === 'medium') {
    bgColor = 'rgba(245, 158, 11, 0.8)'; // medium - warning
  } else if (level === 'high') {
    bgColor = 'rgba(239, 68, 68, 0.6)'; // high - error
  } else if (level === 'very-high') {
    bgColor = 'rgba(220, 38, 38, 0.8)'; // very-high - dark error
  }
  
  return {
    backgroundColor: bgColor,
    color: '#ffffff',
    fontWeight: 500,
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

const EmotionGraph: React.FC = () => {
  const theme = useTheme();
  const { currentEmotion, currentSession, emotionHistory } = useAgentic();
  
  // Local state for graph data
  const [graphData, setGraphData] = useState<any[]>([]);
  const [dominantEmotion, setDominantEmotion] = useState<EmotionType | null>(null);
  const [emotionBreakdown, setEmotionBreakdown] = useState<{
    [key in EmotionType]?: number
  }>({});
  const [stressLevel, setStressLevel] = useState<StressLevel>('low');
  
  // Update graph data when emotion history changes
  useEffect(() => {
    if (emotionHistory.length === 0) return;
    
    // Process emotion history for graph
    const data = emotionHistory.slice(-30).map((emotion: EmotionResult, index: number) => {
      // Get all emotion scores
      const neutralScore = emotion.scores?.neutral || 0;
      const happyScore = emotion.scores?.happy || 0;
      const sadScore = emotion.scores?.sad || 0;
      const angryScore = emotion.scores?.angry || 0;
      const fearScore = emotion.scores?.fear || 0;
      const surpriseScore = emotion.scores?.surprise || 0;
      const disgustScore = emotion.scores?.disgust || 0;
      
      // Calculate a stress value (0-100) based on emotional response
      // High values for negative emotions increase stress
      // Happy emotion reduces stress
      const stressValue = 
        (fearScore * 100) + 
        (angryScore * 80) + 
        (disgustScore * 70) + 
        (sadScore * 60) - 
        (happyScore * 40) + 50; // baseline of 50
      
      // Keep the value between 0-100
      const normalizedStress = Math.max(0, Math.min(100, stressValue)) / 100;
      
      return {
        name: index,
        time: new Date(emotion.timestamp).toLocaleTimeString(),
        neutral: neutralScore,
        happy: happyScore,
        sad: sadScore,
        angry: angryScore,
        fear: fearScore,
        surprise: surpriseScore,
        disgust: disgustScore,
        stress: normalizedStress,
        dominant: emotion.dominant
      };
    });
    
    setGraphData(data);
    
    // Update dominant emotion
    if (currentEmotion) {
      setDominantEmotion(currentEmotion.dominant);
      setStressLevel(currentEmotion.stressLevel);
      
      // Use real emotion breakdown from the current detection
      setEmotionBreakdown(currentEmotion.scores || {});
    }
  }, [emotionHistory, currentEmotion]);
  
  // Convert stress level to numeric value for charting
  const calculateStressValue = (level: StressLevel): number => {
    switch (level) {
      case 'low': return 0.25;
      case 'medium': return 0.5;
      case 'high': return 0.75;
      case 'very-high': return 1.0;
      default: return 0.25;
    }
  };
  
  // Format stress level for display
  const getStressLevelText = (level: StressLevel): string => {
    switch (level) {
      case 'low': return 'Low Stress';
      case 'medium': return 'Medium Stress';
      case 'high': return 'High Stress';
      case 'very-high': return 'Very High Stress';
      default: return 'Unknown';
    }
  };
  
  // Get color for emotion
  const getEmotionColor = (emotion: EmotionType): string => {
    switch (emotion) {
      case 'happy': return theme.palette.success.main;
      case 'sad': return theme.palette.info.main;
      case 'angry': return theme.palette.error.main;
      case 'fear': return theme.palette.warning.dark;
      case 'surprise': return theme.palette.secondary.main;
      case 'disgust': return theme.palette.error.dark;
      default: return theme.palette.text.secondary;
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const emotionData = payload[0].payload;
      
      // Find dominant emotion with highest score
      let dominantEmotion = emotionData.dominant;
      
      // Get all emotion values for display
      const emotions = [
        { name: 'Neutral', value: emotionData.neutral, color: '#9ca3af' },
        { name: 'Happy', value: emotionData.happy, color: '#10b981' },
        { name: 'Sad', value: emotionData.sad, color: '#60a5fa' },
        { name: 'Angry', value: emotionData.angry, color: '#f43f5e' },
        { name: 'Fear', value: emotionData.fear, color: '#c026d3' },
        { name: 'Surprise', value: emotionData.surprise, color: '#facc15' },
        { name: 'Disgust', value: emotionData.disgust, color: '#65a30d' }
      ];
      
      // Sort by value descending
      emotions.sort((a, b) => b.value - a.value);
      
      return (
        <Box sx={{ 
          bgcolor: 'rgba(10, 10, 30, 0.9)', 
          p: 1.5, 
          borderRadius: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: 180
        }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {emotionData.time}
          </Typography>
          
          <Typography variant="body2" color="primary.light" sx={{ mb: 1 }}>
            Dominant: <strong>{dominantEmotion}</strong>
          </Typography>
          
          <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
            Stress Level: <strong>{(emotionData.stress * 100).toFixed(0)}%</strong>
          </Typography>
          
          <Box sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          {/* Display all emotions */}
          {emotions.map(emotion => (
            <Box key={emotion.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: emotion.color, mr: 1 }} />
                <Typography variant="caption">{emotion.name}:</Typography>
              </Box>
              <Typography variant="caption" fontWeight="bold">
                {(emotion.value * 100).toFixed(0)}%
              </Typography>
            </Box>
          ))}
          {/* Emotion breakdown is already displayed above */}
        </Box>
      );
    }
  
    return null;
  };
  
  return (
    <GlassPaper elevation={3} sx={{ height: 400 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Emotional Response Analysis
      </Typography>
      
      {currentEmotion ? (
        <StressIndicator 
          label={getStressLevelText(currentEmotion.stressLevel)}
          level={currentEmotion.stressLevel}
          sx={{ mb: 2 }}
        />
      ) : (
        <Chip 
          label="Awaiting Analysis"
          sx={{ mb: 2, bgcolor: 'rgba(100, 116, 139, 0.2)' }}
        />
      )}
      
      {graphData.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
          <CircularProgress size={40} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Waiting for emotion data...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                stroke="rgba(255, 255, 255, 0.2)"
                tickCount={5}
              />
              <YAxis 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                stroke="rgba(255, 255, 255, 0.2)"
                domain={[0, 1]}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Dynamic reference lines based on emotion thresholds */}
              <ReferenceLine y={0.7} stroke="rgba(239, 68, 68, 0.5)" strokeDasharray="3 3" />
              <ReferenceLine y={0.4} stroke="rgba(245, 158, 11, 0.5)" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="stress" 
                stroke="#dc2626" 
                name="Stress Level"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                stroke="#9ca3af" 
                name="Neutral"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="happy" 
                stroke={theme.palette.success.main} 
                name="Happy"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="sad" 
                stroke="#60a5fa" 
                name="Sad"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="angry" 
                stroke="#f43f5e" 
                name="Angry"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="fear" 
                stroke="#c026d3" 
                name="Fear"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="surprise" 
                stroke="#facc15" 
                name="Surprise"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="disgust" 
                stroke="#65a30d" 
                name="Disgust"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="fear" 
                stroke={theme.palette.warning.dark} 
                name="Fear"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <GradientOverlay />
        </Box>
      )}
      
      <Grid container spacing={1} sx={{ mt: 2 }}>
        <Grid item>
          <LegendItem>
            <LegendColor color="#dc2626" />
            <Typography variant="caption">Stress</Typography>
          </LegendItem>
        </Grid>
        <Grid item>
          <LegendItem>
            <LegendColor color={theme.palette.success.main} />
            <Typography variant="caption">Happy</Typography>
          </LegendItem>
        </Grid>
        <Grid item>
          <LegendItem>
            <LegendColor color={theme.palette.info.main} />
            <Typography variant="caption">Sad</Typography>
          </LegendItem>
        </Grid>
        <Grid item>
          <LegendItem>
            <LegendColor color={theme.palette.error.main} />
            <Typography variant="caption">Angry</Typography>
          </LegendItem>
        </Grid>
        <Grid item>
          <LegendItem>
            <LegendColor color={theme.palette.warning.dark} />
            <Typography variant="caption">Fear</Typography>
          </LegendItem>
        </Grid>
      </Grid>
    </GlassPaper>
  );
};

export default EmotionGraph;
