import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Paper, Typography, TextField, Button, 
  Divider, Fade, CircularProgress, Alert, Grid, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Person, Camera, Favorite, LocationOn, Star, ArrowForward } from '@mui/icons-material';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  overflow: 'hidden',
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: '0 auto',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: 28,
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: 16,
  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #d97706 30%, #f59e0b 90%)',
    boxShadow: '0 6px 25px rgba(245, 158, 11, 0.4)',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)'
  }
}));

const SetupProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const features = [
    {
      icon: <Person sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: "Personal Information",
      description: "Set up your basic profile details and preferences"
    },
    {
      icon: <Camera sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: "Photo Upload",
      description: "Add photos to showcase your personality"
    },
    {
      icon: <Favorite sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: "Interests & Hobbies",
      description: "Tell us about your interests and what you enjoy"
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: "Location & Preferences",
      description: "Set your location and dating preferences"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #030b17 0%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <GlassPaper>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Person sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}>
                Setup Your Profile
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Create your personalized dating profile with AI assistance
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
                Our AI-powered profile setup will help you create an amazing profile that attracts your perfect match. 
                We'll guide you through each step to ensure your profile stands out.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'white' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center' }}>
              <GradientButton
                onClick={handleGetStarted}
                disabled={loading}
                size="large"
                sx={{ mb: 3 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Setting up...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowForward sx={{ ml: 1 }} />
                  </>
                )}
              </GradientButton>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Back to Home
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ color: '#f59e0b' }}
                >
                  Already have an account?
                </Button>
              </Box>
            </Box>
          </GlassPaper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SetupProfile;
