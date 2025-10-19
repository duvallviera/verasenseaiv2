import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  CircularProgress,
  Grid,
  Button,
  Divider,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useAgenticInsights } from '../../context/AgenticInsightsContext';
import { AttachmentStyle } from '../../services/agenticService';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
  },
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1.2, 2),
  transition: 'all 0.3s ease',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledPsychButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(145deg, #2A235A 0%, #424899 100%)',
  color: 'white',
  borderRadius: 10,
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    background: 'linear-gradient(145deg, #383076 0%, #4c52b5 100%)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
  },
}));

interface StyledChipProps {
  customColor?: string;
}

const StyledChip = styled(Chip)<StyledChipProps>(({ theme, customColor }) => ({
  backgroundColor: customColor ? `${customColor}20` : undefined,
  color: customColor || undefined,
  fontWeight: 500,
  borderRadius: 8,
}));

interface PsychologicalProfileCardProps {
  userId?: string;
  sessionId?: string;
}

const PsychologicalProfileCard: React.FC<PsychologicalProfileCardProps> = ({ 
  userId,
  sessionId 
}) => {
  const navigate = useNavigate();
  const { 
    attachmentStyle, 
    getUserAttachmentStyle, 
    getAttachmentStyleInfo,
    getRecommendedApproach 
  } = useAgenticInsights();
  
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState<AttachmentStyle>(AttachmentStyle.UNKNOWN);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Get attachment style (from user ID or session ID)
        const userStyle = await getUserAttachmentStyle(userId);
        setStyle(userStyle);
        
        // Get recommendations based on style
        const approachRecs = await getRecommendedApproach(userId);
        setRecommendations(approachRecs);
      } catch (error) {
        console.error('Error loading psychological profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, sessionId, getUserAttachmentStyle, getRecommendedApproach]);
  
  // Get style info for current attachment style
  const styleInfo = getAttachmentStyleInfo(style);
  
  // Get icon component based on style info
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'SentimentSatisfiedAlt':
        return <SentimentSatisfiedAltIcon />;
      case 'Timer':
        return <TimerIcon />;
      case 'Warning':
        return <WarningIcon />;
      case 'Psychology':
      default:
        return <PsychologyIcon />;
    }
  };
  
  const handleViewFullProfile = () => {
    // Change button style first
    setButtonClicked(true);
    
    // Navigate after a short delay to show the button style change
    setTimeout(() => {
      // Use tab=1 to directly open the Psychological Profile tab
      navigate('/profile?tab=1', { replace: true }); 
    }, 300);
  };
  
  if (loading) {
    return (
      <StyledCard>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%' 
        }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Analyzing psychological profile...
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }
  
  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Psychological Profile
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2, 
          p: 1.5, 
          borderRadius: 2,
          bgcolor: `${styleInfo.color}10`,
          border: `1px solid ${styleInfo.color}30`
        }}>
          <Box sx={{ mr: 2, color: styleInfo.color }}>
            {getIconComponent(styleInfo.icon)}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                {styleInfo.label} Attachment Style
              </Typography>
              <StyledChip 
                label="Primary" 
                size="small" 
                color="primary"
                customColor={styleInfo.color}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {styleInfo.description}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Communication Recommendations
        </Typography>
        
        <Box>
          {recommendations.slice(0, 2).map((rec, index) => (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                mb: 1 
              }}
            >
              <InfoIcon fontSize="small" sx={{ mr: 1, mt: 0.2, color: 'primary.main' }} />
              <Typography variant="body2">
                {rec}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
      
      <Box sx={{ mt: 'auto', p: 2, pt: 0 }}>
        {buttonClicked ? (
          <StyledPsychButton
            fullWidth
            startIcon={<PsychologyIcon />}
            onClick={handleViewFullProfile}
          >
            Psychological Profile
          </StyledPsychButton>
        ) : (
          <ProfileButton 
            variant="outlined" 
            color="primary"
            fullWidth
            onClick={handleViewFullProfile}
          >
            View Full Psychological Profile
          </ProfileButton>
        )}
      </Box>
    </StyledCard>
  );
};

export default PsychologicalProfileCard;
