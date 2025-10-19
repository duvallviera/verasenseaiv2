import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Paper, Typography, TextField, Button, 
  Divider, Fade, CircularProgress, Alert, IconButton, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  overflow: 'hidden',
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: '0 auto',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: 28,
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: 16,
  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #5a5de8 30%, #7c4dea 90%)',
    boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)',
  }
}));

const Login: React.FC = () => {
  const navigate = useNavigate();
  // const { login } = useAuth(); // Commented out to avoid network calls
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.email && formData.password) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        setError('Please enter both email and password');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

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
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <GlassPaper>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LoginIcon sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                TESTING LAB
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Access the VeriSense AI Testing Laboratory
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255,255,255,0.7)' }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { color: 'white' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255,255,255,0.7)' }
                }}
              />

              <GradientButton
                type="submit"
                fullWidth
                disabled={loading}
                sx={{ mb: 3 }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Access Testing Lab'
                )}
              </GradientButton>
            </form>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                Don't have access? Contact your administrator
              </Typography>
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ color: '#6366f1' }}
              >
                Back to Home
              </Button>
            </Box>
          </GlassPaper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
