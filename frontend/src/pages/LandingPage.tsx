import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Container, Grid,
  Paper, Divider, useTheme, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Neural network animation component
const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Neural network nodes
    const nodes: {x: number; y: number; connections: number[]}[] = [];
    const numNodes = 80;
    
    // Create nodes at random positions
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        connections: []
      });
    }
    
    // Create connections between nodes
    nodes.forEach((node, i) => {
      for (let j = 0; j < nodes.length; j++) {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - nodes[j].x, 2) + 
            Math.pow(node.y - nodes[j].y, 2)
          );
          
          if (distance < 200) {
            node.connections.push(j);
          }
        }
      }
    });
    
    // Animation loop
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      nodes.forEach((node, i) => {
        node.connections.forEach(j => {
          const targetNode = nodes[j];
          
          // Calculate pulse effect
          const pulse = Math.sin(time + i * 0.1) * 0.5 + 0.5;
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * pulse})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });
      
      // Draw nodes
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time + i * 0.2) * 0.5 + 0.5;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2 + pulse * 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${0.5 + 0.5 * pulse})`;
        ctx.fill();
      });
      
      time += 0.01;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 0
      }} 
    />
  );
};

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #030b17 0%, #0f172a 100%)',
  padding: theme.spacing(4, 0)
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  zIndex: 1
}));

const FeatureCard = styled(motion.div)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold'
}));

const PulseCircle = styled(motion.div)({
  position: 'absolute',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
});

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

// Landing page component
const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Go to login page - Updated to point to the correct login route
  const handleLogin = () => {
    navigate('/login');
  };
  
  // Go to register page - Updated to point to the signup page
  const handleRegister = () => {
    navigate('/signup');
  };
  
  // Go to camera landmarks test page
  const handleCameraTest = () => {
    navigate('/camera-landmarks-test');
  };
  
  // Go to overlay test page
  const handleOverlayTest = () => {
    navigate('/overlay-test');
  };
  
  // Go to setup profile page
  const handleSetupProfile = () => {
    navigate('/setup_profile');
  };
  
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8 + i * 0.2,
        duration: 0.5
      }
    })
  };
  
  const pulseVariants = {
    initial: { scale: 0, opacity: 0.7 },
    animate: { 
      scale: 4, 
      opacity: 0,
      transition: { 
        repeat: Infinity,
        duration: 3,
        ease: 'easeOut',
        repeatType: 'loop' as const
      }
    }
  };
  
  const features = [
    {
      title: "Advanced Emotion Analysis",
      icon: <PsychologyIcon sx={{ fontSize: 46, color: '#60a5fa' }} />,
      description: "Detect subtle emotional shifts through advanced facial expression analysis, providing real-time feedback on emotional responses."
    },
    {
      title: "Voice Pattern Detection",
      icon: <RecordVoiceOverIcon sx={{ fontSize: 46, color: '#34d399' }} />,
      description: "Analyze vocal patterns, stress indicators, and speech irregularities to identify potential deception markers."
    },
    {
      title: "AI-Powered Truth Assessment",
      icon: <VerifiedUserIcon sx={{ fontSize: 46, color: '#f472b6' }} />,
      description: "Sophisticated algorithms combine multiple data points to provide a comprehensive truthfulness probability assessment."
    },
    {
      title: "Adaptive Questioning Framework",
      icon: <SmartToyIcon sx={{ fontSize: 46, color: '#fbbf24' }} />,
      description: "The agentic system adapts its questioning strategy based on real-time emotional and vocal analysis."
    }
  ];
  
  return (
    <Box sx={{ overflow: 'hidden', bgcolor: '#030712', color: 'white', minHeight: '100vh' }}>
      <HeroSection>
        <NeuralNetworkBackground />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                onAnimationComplete={() => setAnimationComplete(true)}
              >
                <motion.div variants={itemVariants}>
                  <GradientText variant="h1" sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, textAlign: { xs: 'center', md: 'left' } }}>
                    VeraAiSense
                  </GradientText>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      mb: 3, 
                      color: 'rgba(255,255,255,0.9)',
                      textAlign: { xs: 'center', md: 'left' },
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    AI-Powered Truth Detection System
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 4, 
                      color: alpha(theme.palette.common.white, 0.7),
                      textAlign: { xs: 'center', md: 'left' },
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      maxWidth: '600px'
                    }}
                  >
                    Harness the power of advanced AI to analyze facial expressions, voice patterns, 
                    and emotional responses for comprehensive truth assessment in real-time.
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', gap: '16px', justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GradientButton 
                        variant="contained"
                        onClick={handleRegister}
                      >
                        Get Started
                      </GradientButton>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outlined"
                        onClick={handleCameraTest}
                        sx={{ 
                          borderColor: alpha(theme.palette.secondary.main, 0.5),
                          color: 'white',
                          borderRadius: 28,
                          padding: '12px 32px',
                          textTransform: 'none',
                          fontSize: 16,
                          background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                          border: 'none',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                          }
                        }}
                      >
                        🎥 Camera Test
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outlined"
                        onClick={handleOverlayTest}
                        sx={{ 
                          borderColor: alpha(theme.palette.secondary.main, 0.5),
                          color: 'white',
                          borderRadius: 28,
                          padding: '12px 32px',
                          textTransform: 'none',
                          fontSize: 16,
                          background: 'linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)',
                          border: 'none',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #7c3aed 30%, #8b5cf6 90%)',
                            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                          }
                        }}
                      >
                        🧪 Overlay Test
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outlined"
                        onClick={handleLogin}
                        sx={{ 
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          color: 'white',
                          borderRadius: 28,
                          padding: '12px 32px',
                          textTransform: 'none',
                          fontSize: 16,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        TESTING LAB
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outlined"
                        onClick={handleSetupProfile}
                        sx={{ 
                          borderColor: alpha(theme.palette.secondary.main, 0.5),
                          color: 'white',
                          borderRadius: 28,
                          padding: '12px 32px',
                          textTransform: 'none',
                          fontSize: 16,
                          background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                          border: 'none',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #d97706 30%, #f59e0b 90%)',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
                          }
                        }}
                      >
                        👤 Setup Profile
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'relative' }}>
                <AnimatePresence>
                  {animationComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                    >
                      <GlassPaper>
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 3 }}>
                          <SecurityIcon sx={{ fontSize: 80, color: '#6366f1' }} />
                          <PulseCircle
                            variants={pulseVariants}
                            initial="initial"
                            animate="animate"
                            style={{ width: 80, height: 80 }}
                          />
                        </Box>
                        
                        <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                          99.7% Accuracy
                        </Typography>
                        
                        <Typography variant="body2" align="center" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                          Our AI models have been trained on millions of data points to provide 
                          the highest level of truth detection accuracy in the industry.
                        </Typography>
                      </GlassPaper>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>
      
      <Box sx={{ py: 10, background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Typography variant="h2" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
              Key Features
            </Typography>
            
            <Divider sx={{ 
              width: '80px', 
              margin: '0 auto', 
              mb: 6, 
              borderColor: theme.palette.primary.main,
              borderWidth: 2
            }} />
          </motion.div>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={featureVariants}
                >
                  <FeatureCard
                    whileHover={{ 
                      y: -10, 
                      boxShadow: '0 8px 30px rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      <Box sx={{ py: 8, bgcolor: '#020617', textAlign: 'center' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
              Ready to detect the truth?
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: alpha(theme.palette.common.white, 0.7) }}>
              Join thousands of professionals who trust VeraAiSense for accurate truth assessment.
            </Typography>
            
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GradientButton 
                    variant="contained"
                    size="large"
                    onClick={handleRegister}
                  >
                  Create Account
                  </GradientButton>
                </motion.div>
              </Grid>
              <Grid item>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={handleCameraTest}
                    sx={{ 
                      borderColor: alpha(theme.palette.secondary.main, 0.5),
                      color: 'white',
                      background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                      border: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                      }
                    }}
                  >
                  🎥 Camera Test
                  </Button>
                </motion.div>
              </Grid>
              <Grid item>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={handleOverlayTest}
                    sx={{ 
                      borderColor: alpha(theme.palette.secondary.main, 0.5),
                      color: 'white',
                      background: 'linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)',
                      border: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7c3aed 30%, #8b5cf6 90%)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                      }
                    }}
                  >
                  🧪 Overlay Test
                  </Button>
                </motion.div>
              </Grid>
              <Grid item>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={handleLogin}
                    sx={{ 
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      color: 'white',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                  TESTING LAB
                  </Button>
                </motion.div>
              </Grid>
              <Grid item>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={handleSetupProfile}
                    sx={{ 
                      borderColor: alpha(theme.palette.secondary.main, 0.5),
                      color: 'white',
                      background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                      border: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #d97706 30%, #f59e0b 90%)',
                        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
                      }
                    }}
                  >
                  👤 Setup Profile
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
