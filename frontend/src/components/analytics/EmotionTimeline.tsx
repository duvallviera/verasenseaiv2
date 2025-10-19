import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface EmotionTimelineProps {
  emotionData: any[];
  height?: number;
  title?: string;
}

const EmotionTimeline: React.FC<EmotionTimelineProps> = ({ 
  emotionData, 
  height = 300,
  title = 'Emotion Timeline' 
}) => {
  // Skip rendering if no data
  if (!emotionData || emotionData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No emotion data available
        </Typography>
      </Box>
    );
  }
  
  // Transform emotion data for visualization
  const timestamps = emotionData.map(d => {
    const date = new Date(d.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  
  const emotionTypes = ['neutral', 'happy', 'sad', 'angry', 'fear', 'surprise', 'disgust'];
  const datasets = emotionTypes.map(emotion => ({
    label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    data: emotionData.map(d => (d.scores && d.scores[emotion]) || 0),
    borderColor: getEmotionColor(emotion),
    backgroundColor: `${getEmotionColor(emotion)}33`,
    fill: false,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5
  }));
  
  const data = {
    labels: timestamps,
    datasets
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          color: 'rgba(200, 200, 200, 0.8)'
        }
      },
      x: {
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          color: 'rgba(200, 200, 200, 0.8)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(200, 200, 200, 0.8)'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `${context.dataset.label}: ${(value * 100).toFixed(1)}%`;
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          size: 16
        }
      }
    }
  };
  
  return (
    <Box sx={{ height }}>
      <Line data={data} options={options} />
    </Box>
  );
};

// Helper function to get color for each emotion
function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    neutral: '#9e9e9e',
    happy: '#4caf50',
    sad: '#2196f3',
    angry: '#f44336',
    fear: '#9c27b0',
    surprise: '#ff9800',
    disgust: '#795548'
  };
  return colors[emotion] || '#9e9e9e';
}

export default EmotionTimeline;
