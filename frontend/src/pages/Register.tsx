import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, 
  Divider, CircularProgress, Alert, Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import { useAuth } from '../context/AuthContext';
import { useAgentic } from '../context/AgenticContext';

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
}));

const GlowingTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #F5F7FA, #B8C6DB)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #6366f1, transparent)',
    borderRadius: 3,
  }
}));

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuth();
  const { captureBaseline } = useAgentic();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const validateFirstStep = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleNextStep = () => {
    if (validateFirstStep()) {
      setRegisterStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setRegisterStep(1);
    setError(null);
  };
  
  const handleFaceDetected = (detected: boolean) => {
    setFaceDetected(detected);
  };
  
  const handleFaceCapture = (imageSrc: string) => {
    setFaceImage(imageSrc);
    captureBaseline(imageSrc);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faceImage) {
      setError('Please capture your face for authentication');
      return;
    }
    
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };
  
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
      <Container maxWidth="md">
        <GlowingTitle variant="h3" align="center">
          VeraAiSense
        </GlowingTitle>
        
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Create your account for advanced analysis
        </Typography>
        
        <GlassPaper elevation={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              {registerStep === 1 ? 'Create Account' : 'Set Up Face Authentication'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {registerStep === 1 
                ? 'Enter your details to create your account' 
                : 'We\'ll use your face for quick login in the future'}
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 2 
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  position: 'relative',
                  width: 200,
                }}
              >
                <Box 
                  sx={{ 
                    height: 4, 
                    width: '100%', 
                    bgcolor: 'rgba(255, 255, 255, 0.1)', 
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)', 
                    zIndex: 0,
                  }} 
                />
                
                <Box 
                  sx={{ 
                    height: 4, 
                    width: registerStep === 1 ? '0%' : '100%', 
                    bgcolor: 'primary.main',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)', 
                    zIndex: 1,
                    transition: 'width 0.5s ease-in-out',
                  }} 
                />
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 14,
                    }}
                  >
                    1
                  </Box>
                  
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: registerStep >= 2 ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 14,
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    2
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          
          {registerStep === 1 ? (
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    InputProps={{
                      sx: {
                        backgroundColor: 'rgba(15, 16, 30, 0.3)',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    InputProps={{
                      sx: {
                        backgroundColor: 'rgba(15, 16, 30, 0.3)',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    InputProps={{
                      sx: {
                        backgroundColor: 'rgba(15, 16, 30, 0.3)',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    InputProps={{
                      sx: {
                        backgroundColor: 'rgba(15, 16, 30, 0.3)',
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleNextStep}
                sx={{ 
                  mt: 3, 
                  py: 1.5,
                  background: 'linear-gradient(45deg, #6366f1 30%, #4f46e5 90%)',
                }}
              >
                Next: Set Up Face Recognition
              </Button>
            </form>
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Capture your face for login
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Make sure your face is clearly visible and well-lit
              </Typography>
              
              <WebcamCapture 
                onFaceDetected={handleFaceDetected}
                onCapture={handleFaceCapture}
              />
              
              <Box sx={{ display: 'flex', mt: 3, gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handlePrevStep}
                  sx={{ flexGrow: 1 }}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isLoading || !faceImage}
                  sx={{ 
                    flexGrow: 1,
                    background: 'linear-gradient(45deg, #6366f1 30%, #4f46e5 90%)',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </Box>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Button
              color="primary"
              onClick={() => navigate('/login')}
              size="small"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Login
            </Button>
          </Typography>
        </GlassPaper>
      </Container>
    </Box>
  );
};

export default Register;
