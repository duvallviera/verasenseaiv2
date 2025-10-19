// FIXED VERSION: VideoAnalyzer.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress,
  Grid, LinearProgress, Chip, Stack, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAgentic } from '../context/AgenticContext';

// Styled components
const VideoContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  aspectRatio: '16/9',
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'relative',
  margin: theme.spacing(0, 0, 2, 0),
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  textAlign: 'right',
}));

const StyledProgress = styled(LinearProgress)<{ value: number }>(({ theme, value }) => {
  let color = theme.palette.success.main;
  if (value > 75) color = theme.palette.error.main;
  else if (value > 50) color = theme.palette.warning.main;

  return {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
      transition: 'transform 0.5s ease',
    },
  };
});

const AnalysisBox = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: 8,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const VideoOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  zIndex: 1,
}));

const CameraButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  minWidth: 0,
  width: 40,
  height: 40,
  borderRadius: '50%',
  zIndex: 2,
}));

// Types for facial analysis results
interface FacialMetrics {
  blinkRate: number;
  eyeContact: number;
  facialTension: number;
  mouthAsymmetry: number;
  browMovement: number;
  microExpressions: number;
}

interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fear: number;
  disgust: number;
  surprise: number;
}

interface FacialAnalysisResult {
  dominant: string;
  scores: EmotionScores;
  facialMetrics: FacialMetrics;
  stressLevel: string;
  deceptionIndicators: string;
  confidence: number;
  timestamp: number;
}

// COMPONENT
const VideoAnalyzer: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [facialAnalysis, setFacialAnalysis] = useState<FacialAnalysisResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isFirstFrame = useRef(true);

  const {
    storeInteractionData,
    captureBaseline,
    compareWithBaseline
  } = useAgentic();

  const simulateFacialAnalysis = useCallback(() => {
    const blinkRate = Math.random();
    const eyeContact = Math.random();
    const facialTension = Math.random();
    const mouthAsymmetry = Math.random();

    const analysis = {
      dominant: 'neutral',
      scores: {
        neutral: 0.5, happy: 0.2, sad: 0.1, angry: 0.05, fear: 0.05, disgust: 0.05, surprise: 0.05
      },
      facialMetrics: {
        blinkRate,
        eyeContact,
        facialTension,
        mouthAsymmetry,
        browMovement: Math.random(),
        microExpressions: Math.random()
      },
      stressLevel: facialTension > 0.7 ? 'high' : facialTension > 0.4 ? 'medium' : 'low',
      deceptionIndicators: mouthAsymmetry > 0.6 ? 'high' : 'low',
      confidence: Math.random(),
      timestamp: Date.now()
    };

    setFacialAnalysis(analysis);
    storeInteractionData({ type: 'facial', data: analysis, timestamp: Date.now() });
    return analysis;
  }, [storeInteractionData]);

  const analyzeVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.srcObject) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const facialData = simulateFacialAnalysis();
    if (isFirstFrame.current) {
      isFirstFrame.current = false;
      captureBaseline(canvas.toDataURL('image/jpeg', 0.8));
    }
    compareWithBaseline(canvas.toDataURL('image/jpeg', 0.8));
  }, [simulateFacialAnalysis, captureBaseline, compareWithBaseline]);

  const startFaceAnalysis = useCallback(() => {
    isFirstFrame.current = true;
    let lastTime = 0;
    const loop = (ts: number) => {
      if (ts - lastTime > 500) {
        analyzeVideoFrame();
        lastTime = ts;
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [analyzeVideoFrame]);

  const stopFaceAnalysis = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const initializeCamera = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraPermission(true);
      if (isRecording) startFaceAnalysis();
    } catch (e) {
      setCameraError('Permission denied');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    stopFaceAnalysis();
  };

  const toggleCamera = () => {
    if (cameraActive) stopCamera();
    else initializeCamera();
  };

  useEffect(() => {
    if (isRecording && cameraActive) startFaceAnalysis();
    else stopFaceAnalysis();
    return () => stopFaceAnalysis();
  }, [isRecording, cameraActive, startFaceAnalysis, stopFaceAnalysis]);

  // Get status text for stress level
  const getStressLevelText = (level: string) => {
    switch (level) {
      case 'high': return 'High Stress';
      case 'medium': return 'Moderate Stress';
      case 'low': return 'Low Stress';
      default: return 'Unknown';
    }
  };

  // Get status text for deception indicators
  const getDeceptionText = (level: string) => {
    switch (level) {
      case 'high': return 'High Risk';
      case 'medium': return 'Moderate Risk';
      case 'low': return 'Low Risk';
      default: return 'Unknown';
    }
  };

  return (
    <Box>
      {/* Video container */}
      <VideoContainer>
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {!cameraActive && (
          <VideoOverlay>
            {loading ? (
              <CircularProgress size={40} color="primary" />
            ) : (
              <>
                <VideocamOffIcon sx={{ fontSize: 40, opacity: 0.7, mb: 2 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: '80%' }}>
                  {cameraError || 'Camera is turned off'}
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>
                  Click the camera button to enable facial analysis
                </Typography>
              </>
            )}
          </VideoOverlay>
        )}

        {/* Status indicator for active facial analysis */}
        {cameraActive && facialAnalysis && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 10, 
            left: 10, 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 2,
            padding: '4px 8px'
          }}>
            <Chip 
              size="small" 
              color={facialAnalysis.stressLevel === 'high' ? 'error' : 
                   facialAnalysis.stressLevel === 'medium' ? 'warning' : 'success'}
              label={facialAnalysis.stressLevel === 'high' ? 'High Stress' : 
                    facialAnalysis.stressLevel === 'medium' ? 'Medium Stress' : 'Low Stress'} 
              icon={facialAnalysis.stressLevel === 'high' ? <WarningIcon /> : <CheckCircleIcon />}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        )}

        {/* Camera toggle button */}
        <CameraButton
          variant="contained"
          color={cameraActive ? "secondary" : "primary"}
          onClick={toggleCamera}
          disabled={loading}
        >
          {cameraActive ? <VideocamIcon /> : <VideocamOffIcon />}
        </CameraButton>

        {/* Analysis details toggle button */}
        {cameraActive && (
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            startIcon={showAnalysisDetails ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
            sx={{ 
              position: 'absolute', 
              bottom: 10, 
              right: 60,
              minWidth: 0,
              width: 40,
              height: 40,
              borderRadius: '50%',
              padding: 1.2
            }}
          />
        )}
      </VideoContainer>

      {/* Facial Analysis Metrics Display */}
      {cameraActive && showAnalysisDetails && facialAnalysis && (
        <AnalysisBox>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Facial Analysis
            <Stack direction="row" spacing={1}>
              <Chip 
                size="small" 
                color={facialAnalysis.stressLevel === 'high' ? 'error' : 
                      facialAnalysis.stressLevel === 'medium' ? 'warning' : 'success'}
                label={getStressLevelText(facialAnalysis.stressLevel)}
                variant="outlined"
              />
              <Chip 
                size="small" 
                color={facialAnalysis.deceptionIndicators === 'high' ? 'error' : 'success'}
                label={getDeceptionText(facialAnalysis.deceptionIndicators)}
                variant="outlined"
              />
            </Stack>
          </Typography>
          
          <Grid container spacing={2}>
            {/* Microexpression Metrics */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Microexpression Analysis
              </Typography>
            </Grid>
            
            {/* Facial Tension */}
            <Grid item xs={6}>
              <Tooltip title="Tension in facial muscles can indicate stress or anxiety" arrow>
                <Box>
                  <MetricLabel>
                    Facial Tension
                    <MetricValue>{Math.round(facialAnalysis.facialMetrics.facialTension * 100)}%</MetricValue>
                  </MetricLabel>
                  <StyledProgress 
                    variant="determinate" 
                    value={facialAnalysis.facialMetrics.facialTension * 100} 
                    sx={{ mb: 1.5 }}
                  />
                </Box>
              </Tooltip>
            </Grid>
            
            {/* Blink Rate */}
            <Grid item xs={6}>
              <Tooltip title="Increased blinking can indicate stress or deception" arrow>
                <Box>
                  <MetricLabel>
                    Blink Rate
                    <MetricValue>{Math.round(facialAnalysis.facialMetrics.blinkRate * 100)}%</MetricValue>
                  </MetricLabel>
                  <StyledProgress 
                    variant="determinate" 
                    value={facialAnalysis.facialMetrics.blinkRate * 100} 
                    sx={{ mb: 1.5 }}
                  />
                </Box>
              </Tooltip>
            </Grid>
            
            {/* Eye Contact */}
            <Grid item xs={6}>
              <Tooltip title="Reduced eye contact may indicate deception or discomfort" arrow>
                <Box>
                  <MetricLabel>
                    Eye Contact
                    <MetricValue>{Math.round(facialAnalysis.facialMetrics.eyeContact * 100)}%</MetricValue>
                  </MetricLabel>
                  <StyledProgress 
                    variant="determinate" 
                    value={facialAnalysis.facialMetrics.eyeContact * 100} 
                    sx={{ mb: 1.5 }}
                  />
                </Box>
              </Tooltip>
            </Grid>
            
            {/* Mouth Asymmetry */}
            <Grid item xs={6}>
              <Tooltip title="Asymmetrical expressions often occur during deception" arrow>
                <Box>
                  <MetricLabel>
                    Mouth Asymmetry
                    <MetricValue>{Math.round(facialAnalysis.facialMetrics.mouthAsymmetry * 100)}%</MetricValue>
                  </MetricLabel>
                  <StyledProgress 
                    variant="determinate" 
                    value={facialAnalysis.facialMetrics.mouthAsymmetry * 100} 
                    sx={{ mb: 1.5 }}
                  />
                </Box>
              </Tooltip>
            </Grid>
            
            {/* Emotion Distribution */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 1, display: 'block' }}>
                Dominant Emotion: <strong>{facialAnalysis.dominant.charAt(0).toUpperCase() + facialAnalysis.dominant.slice(1)}</strong>
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(facialAnalysis.scores)
                  .sort(([,a], [,b]) => b - a) // Sort by value, highest first
                  .slice(0, 4) // Only show top 4 emotions
                  .map(([emotion, value]) => (
                    <Chip 
                      key={emotion}
                      size="small"
                      label={`${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${Math.round(value * 100)}%`}
                      sx={{ 
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: theme => 
                          value > 0.5 ? theme.palette.error.main : 
                          value > 0.3 ? theme.palette.warning.main : 
                          theme.palette.success.main
                      }}
                    />
                  ))}
              </Stack>
            </Grid>
          </Grid>
        </AnalysisBox>
      )}
    </Box>
  );
};

export default VideoAnalyzer;
