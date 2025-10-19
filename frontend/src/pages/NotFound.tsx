import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(4),
  textAlign: 'center',
  maxWidth: 500,
  margin: '0 auto',
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #ec4899, #6366f1)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
}));

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(21, 21, 42) 0%, rgb(9, 9, 25) 90.2%)',
      }}
    >
      <Container maxWidth="sm">
        <GlassPaper elevation={3}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          
          <GlowingText variant="h3">
            404
          </GlowingText>
          
          <Typography variant="h5" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')} 
            sx={{ 
              mt: 2,
              background: 'linear-gradient(45deg, #6366f1 30%, #4f46e5 90%)',
            }}
          >
            Back to Dashboard
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/login')} 
            sx={{ ml: 2, mt: 2 }}
          >
            Go to Login
          </Button>
        </GlassPaper>
      </Container>
    </Box>
  );
};

export default NotFound;
