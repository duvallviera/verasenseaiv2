import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Box, Paper, Typography, Button, CircularProgress, Chip, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as faceapi from 'face-api.js';
import { useAgentic } from '../context/AgenticContext';
import { initFaceApi } from '../utils/initFaceApi';
import { getFaceDetectionMessage } from '../utils/faceDetectionUtils';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  position: 'relative',
  overflow: 'hidden',
}));

const EmotionChip = styled(Chip)<{ color: 'info' | 'success' | 'warning' | 'error' }>(({ theme, color }) => {
  let bgColor = theme.palette.info.main;
  
  if (color === 'success') {
    bgColor = theme.palette.success.main;
  } else if (color === 'warning') {
    bgColor = theme.palette.warning.main;
  } else if (color === 'error') {
    bgColor = theme.palette.error.main;
  }
  
  return {
    position: 'absolute',
    top: 10,
    right: 10,
    backdropFilter: 'blur(5px)',
    backgroundColor: color === 'error' 
      ? 'rgba(239, 68, 68, 0.8)' 
      : color === 'warning' 
        ? 'rgba(245, 158, 11, 0.8)' 
        : color === 'success' 
          ? 'rgba(16, 185, 129, 0.8)' 
          : 'rgba(59, 130, 246, 0.8)',
    color: '#ffffff',
    fontWeight: 500,
    zIndex: 3,
  };
});

interface WebcamCaptureProps {
  isForLogin?: boolean;
  onFaceDetected?: (faceDetected: boolean) => void;
  onCapture?: (imageSrc: string) => void;
  width?: number;
  height?: number;
}

type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';
type StressLevel = 'low' | 'medium' | 'high' | 'very-high';

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  isForLogin = false,
  onFaceDetected,
  onCapture,
  width = 640,
  height = 480
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startEmotionDetection, stopEmotionDetection } = useAgentic();

  // States for face detection
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionStarted, setDetectionStarted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [emotionScores, setEmotionScores] = useState<{ [key: string]: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);

  // Load face-api.js models using the direct CDN loading utility
  useEffect(() => {
    const loadModels = async () => {
      try {
        setErrorMessage(null);
        setLoadingModels(true);
        
        // Use the direct CDN loading utility
        const success = await initFaceApi();
        
        if (success) {
          setModelsLoaded(true);
          setLoadingModels(false);
          console.log('Face detection models loaded successfully');
        } else {
          throw new Error('Failed to load face detection models from CDN');
        }
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setErrorMessage('Failed to load face detection models. Please refresh the page or check your internet connection.');
        setLoadingModels(false);
      }
    };

    loadModels();
    
    // Cleanup function
    return () => {
      stopDetection();
    };
  }, []);

  // Start face detection once models are loaded
  useEffect(() => {
    if (modelsLoaded && !detectionStarted && webcamRef.current?.video) {
      startDetection();
    }
  }, [modelsLoaded, detectionStarted, webcamRef.current?.video]);

  const startDetection = () => {
    setDetectionStarted(true);
    startEmotionDetection(); // Notify the agentic context
    
    const interval = setInterval(async () => {
      await detectFace();
    }, 100);
    
    // Store interval ID to clear it later
    (window as any).faceDetectionInterval = interval;
  };

  const stopDetection = () => {
    if ((window as any).faceDetectionInterval) {
      clearInterval((window as any).faceDetectionInterval);
      (window as any).faceDetectionInterval = null;
    }
    setDetectionStarted(false);
    stopEmotionDetection(); // Notify the agentic context
  };

  const detectFace = async () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    if (!video || video.paused || video.ended || !video.readyState) {
      return;
    }

    try {
      // Set canvas dimensions to match the video element's displayed size
      // This ensures proper alignment of the face detection box
      const videoBoundingRect = video.getBoundingClientRect();
      canvas.width = videoBoundingRect.width;
      canvas.height = videoBoundingRect.height;
      
      // Get video dimensions for detection processing
      const displaySize = { width: canvas.width, height: canvas.height };
      faceapi.matchDimensions(canvas, displaySize);
      
      // Make detections
      const detections = await faceapi.detectAllFaces(
        video, 
        new faceapi.TinyFaceDetectorOptions()
      )
        .withFaceLandmarks()
        .withFaceExpressions();

      // Resize detections to match canvas size
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear canvas before drawing new detections
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw detection results with proper positioning
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      // Update state based on detections
      if (detections.length > 0) {
        setFaceDetected(true);
        if (onFaceDetected) {
          onFaceDetected(true);
        }

        // Get emotion scores from the first face
        const expressions = detections[0].expressions;
        
        // Convert FaceExpressions to a simple object with string keys and number values
        const emotionScoresObj: { [key: string]: number } = {};
        Object.entries(expressions).forEach(([emotion, score]) => {
          emotionScoresObj[emotion] = score;
        });
        
        setEmotionScores(emotionScoresObj);

        // Find dominant emotion
        let dominantEmotion: EmotionType = 'neutral';
        let highestScore = 0;

        Object.entries(expressions).forEach(([emotion, score]) => {
          if (score > highestScore) {
            highestScore = score;
            dominantEmotion = emotion as EmotionType;
          }
        });

        // Calculate stress level based on negative emotions
        let stressLevel: StressLevel = 'low';
        const fearScore = expressions.fearful || 0;
        const angryScore = expressions.angry || 0;
        const disgustScore = expressions.disgusted || 0;
        const sadScore = expressions.sad || 0;
        
        const totalNegativeScore = fearScore + angryScore + disgustScore + sadScore;
        
        if (totalNegativeScore > 0.8) {
          stressLevel = 'very-high';
        } else if (totalNegativeScore > 0.5) {
          stressLevel = 'high';
        } else if (totalNegativeScore > 0.2) {
          stressLevel = 'medium';
        }

        // Send emotion data to agentic context (through the parent component)
        if (window.emotionCallback) {
          window.emotionCallback({
            dominant: dominantEmotion,
            scores: expressions,
            stressLevel,
            confidence: highestScore,
            timestamp: Date.now()
          });
        }
      } else {
        setFaceDetected(false);
        if (onFaceDetected) {
          onFaceDetected(false);
        }
      }
    } catch (error) {
      console.error('Error processing face detection:', error);
    }
  };

  // Handle capturing a face image (for login/registration)
  const handleCapture = useCallback(() => {
    console.log('Capture face button clicked');
    if (webcamRef.current && faceDetected) {
      console.log('Webcam reference and face detected, capturing image...');
      const imageSrc = webcamRef.current.getScreenshot();
      console.log('Image captured:', imageSrc ? 'SUCCESS' : 'FAILED');
      if (imageSrc && onCapture) {
        // Make sure we're passing the image correctly to the parent component
        console.log('Calling onCapture with image data...');
        onCapture(imageSrc);
      }
    } else {
      console.log('Cannot capture: webcamRef.current =', !!webcamRef.current, 'faceDetected =', faceDetected);
    }
  }, [faceDetected, onCapture]);

  // Get emotion color based on dominant emotion
  const getEmotionColor = () => {
    if (!emotionScores) return 'info';
    
    let highestEmotion = '';
    let highestScore = 0;
    
    Object.entries(emotionScores).forEach(([emotion, score]) => {
      if (score > highestScore) {
        highestScore = score;
        highestEmotion = emotion;
      }
    });
    
    if (highestEmotion === 'happy' || highestEmotion === 'neutral') {
      return 'success';
    } else if (highestEmotion === 'sad' || highestEmotion === 'surprised') {
      return 'warning';
    } else {
      return 'error';
    }
  };

  return (
    <GlassPaper elevation={3}>
      <Box sx={{ position: 'relative' }}>
        {/* Status message based on detection state */}
        {(errorMessage || loadingModels || !faceDetected) && (
          <Alert 
            severity={getFaceDetectionMessage(loadingModels, modelsLoaded, faceDetected).severity}
            sx={{ 
              position: 'absolute',
              top: 10,
              left: 10,
              right: 10,
              zIndex: 10,
              opacity: 0.9
            }}
          >
            {errorMessage || getFaceDetectionMessage(loadingModels, modelsLoaded, faceDetected).message}
          </Alert>
        )}
        
        {loadingModels && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9,
            borderRadius: 2
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress color="primary" size={60} sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                Loading face detection models...
              </Typography>
            </Box>
          </Box>
        )}
        
        <Webcam
          ref={webcamRef}
          width={width}
          height={height}
          mirrored
          screenshotFormat="image/jpeg"
          style={{
            borderRadius: 8,
            width: '100%',
            height: 'auto',
          }}
        />
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 8,
            zIndex: 2,
          }}
        />

        {/* Emotion indicator */}
        {!isForLogin && (
          <EmotionChip 
            label={faceDetected 
              ? (emotionScores 
                ? `${Object.entries(emotionScores)
                    .sort((a, b) => b[1] - a[1])[0][0]}
                    ${Math.round((Object.entries(emotionScores)
                      .sort((a, b) => b[1] - a[1])[0][1]) * 100)}%` 
                : 'Analyzing...') 
              : 'No face detected'} 
            color={faceDetected ? getEmotionColor() as any : 'warning'} 
          />
        )}
        
        {/* Always show capture button regardless of login mode */}
        <Box sx={{ 
          mt: 2, 
          textAlign: 'center',
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          zIndex: 5
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCapture}
            disabled={!faceDetected}
            sx={{
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.9)',
              }
            }}
          >
            {faceDetected ? 'Capture Image' : 'Please look at camera'}
          </Button>
        </Box>
      </Box>
    </GlassPaper>
  );
};

export default WebcamCapture;
