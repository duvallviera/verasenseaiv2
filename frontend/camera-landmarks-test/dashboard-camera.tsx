'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Box, Paper, Typography, Button, CircularProgress, Chip, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as faceapi from 'face-api.js';

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

interface DashboardCameraProps {
  isForLogin?: boolean;
  onFaceDetected?: (faceDetected: boolean) => void;
  onCapture?: (imageSrc: string) => void;
  width?: number;
  height?: number;
}

type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';
type StressLevel = 'low' | 'medium' | 'high' | 'very-high';

const DashboardCamera: React.FC<DashboardCameraProps> = ({
  isForLogin = false,
  onFaceDetected,
  onCapture,
  width = 640,
  height = 480
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarksCanvasRef = useRef<HTMLCanvasElement>(null);

  // States for face detection
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionStarted, setDetectionStarted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [emotionScores, setEmotionScores] = useState<{ [key: string]: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showMesh, setShowMesh] = useState(true);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setErrorMessage(null);
        setLoadingModels(true);
        
        const MODEL_URL = '/models';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        
        setModelsLoaded(true);
        setLoadingModels(false);
        console.log('Face detection models loaded successfully');
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
  };

  const detectFace = async () => {
    if (!webcamRef.current || !canvasRef.current || !landmarksCanvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const landmarksCanvas = landmarksCanvasRef.current;

    if (!video || video.paused || video.ended || !video.readyState) {
      return;
    }

    try {
      // Set canvas dimensions to match the video element's displayed size
      const videoBoundingRect = video.getBoundingClientRect();
      canvas.width = videoBoundingRect.width;
      canvas.height = videoBoundingRect.height;
      landmarksCanvas.width = videoBoundingRect.width;
      landmarksCanvas.height = videoBoundingRect.height;
      
      // Get video dimensions for detection processing
      const displaySize = { width: canvas.width, height: canvas.height };
      faceapi.matchDimensions(canvas, displaySize);
      faceapi.matchDimensions(landmarksCanvas, displaySize);
      
      // Make detections
      const detections = await faceapi.detectAllFaces(
        video, 
        new faceapi.SsdMobilenetv1Options()
      )
        .withFaceLandmarks()
        .withFaceExpressions();

      // Resize detections to match canvas size
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear canvas before drawing new detections
      const ctx = canvas.getContext('2d');
      const landmarksCtx = landmarksCanvas.getContext('2d');
      
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (landmarksCtx) landmarksCtx.clearRect(0, 0, landmarksCanvas.width, landmarksCanvas.height);

      // Draw detection results with proper positioning
      if (showLandmarks) {
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }

      // Draw landmarks and mesh on separate canvas
      if (showLandmarks && landmarksCtx && resizedDetections.length > 0) {
        drawLandmarksAndMesh(landmarksCtx, resizedDetections);
      }

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

        // Send emotion data to global callback
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

  // Draw landmarks and mesh with enhanced visualization
  const drawLandmarksAndMesh = (ctx: CanvasRenderingContext2D, detections: any[]) => {
    detections.forEach((detection, faceIndex) => {
      const landmarks = detection.landmarks;
      
      if (!landmarks || !landmarks.positions) return;

      // Draw face detection box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 10;
      const box = detection.detection.box;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.shadowBlur = 0;

      // Draw landmarks with different colors for different facial features
      const positions = landmarks.positions;
      
      // Jaw line (points 0-16) - Green
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const point = positions[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Right eyebrow (points 17-21) - Blue
      ctx.strokeStyle = '#0066ff';
      ctx.beginPath();
      for (let i = 17; i <= 21; i++) {
        const point = positions[i];
        if (i === 17) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Left eyebrow (points 22-26) - Blue
      ctx.strokeStyle = '#0066ff';
      ctx.beginPath();
      for (let i = 22; i <= 26; i++) {
        const point = positions[i];
        if (i === 22) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Nose (points 27-35) - Yellow
      ctx.strokeStyle = '#ffff00';
      ctx.beginPath();
      for (let i = 27; i <= 35; i++) {
        const point = positions[i];
        if (i === 27) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Right eye (points 36-41) - Red
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      for (let i = 36; i <= 41; i++) {
        const point = positions[i];
        if (i === 36) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Left eye (points 42-47) - Red
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      for (let i = 42; i <= 47; i++) {
        const point = positions[i];
        if (i === 42) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Mouth (points 48-67) - Magenta
      ctx.strokeStyle = '#ff00ff';
      ctx.beginPath();
      for (let i = 48; i <= 67; i++) {
        const point = positions[i];
        if (i === 48) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Draw mesh if enabled
      if (showMesh) {
        drawFacialMesh(ctx, positions);
      }

      // Draw landmark points
      positions.forEach((point: any, index: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw center dot
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw face index
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Face ${faceIndex + 1}`, box.x, box.y - 10);
    });
  };

  // Draw facial mesh triangulation
  const drawFacialMesh = (ctx: CanvasRenderingContext2D, positions: any[]) => {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 3;

    // Draw mesh lines connecting key facial points
    const meshConnections = [
      // Jaw connections
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16],
      // Eyebrow connections
      [17, 18], [18, 19], [19, 20], [20, 21], [22, 23], [23, 24], [24, 25], [25, 26],
      // Nose connections
      [27, 28], [28, 29], [29, 30], [30, 31], [31, 32], [32, 33], [33, 34], [34, 35],
      // Eye connections
      [36, 37], [37, 38], [38, 39], [39, 40], [40, 41], [41, 36],
      [42, 43], [43, 44], [44, 45], [45, 46], [46, 47], [47, 42],
      // Mouth connections
      [48, 49], [49, 50], [50, 51], [51, 52], [52, 53], [53, 54], [54, 55], [55, 56], [56, 57], [57, 58], [58, 59], [59, 60], [60, 61], [61, 62], [62, 63], [63, 64], [64, 65], [65, 66], [66, 67], [67, 48]
    ];

    meshConnections.forEach(([start, end]) => {
      if (positions[start] && positions[end]) {
        ctx.beginPath();
        ctx.moveTo(positions[start].x, positions[start].y);
        ctx.lineTo(positions[end].x, positions[end].y);
        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;
  };

  // Handle capturing a face image
  const handleCapture = useCallback(() => {
    console.log('Capture face button clicked');
    if (webcamRef.current && faceDetected) {
      console.log('Webcam reference and face detected, capturing image...');
      const imageSrc = webcamRef.current.getScreenshot();
      console.log('Image captured:', imageSrc ? 'SUCCESS' : 'FAILED');
      if (imageSrc && onCapture) {
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

  // Get face detection message
  const getFaceDetectionMessage = (loading: boolean, modelsLoaded: boolean, faceDetected: boolean) => {
    if (loading) {
      return { message: 'Loading face detection models...', severity: 'info' as const };
    }
    if (!modelsLoaded) {
      return { message: 'Face detection models not loaded', severity: 'error' as const };
    }
    if (!faceDetected) {
      return { message: 'Please look at the camera', severity: 'warning' as const };
    }
    return { message: 'Face detected successfully', severity: 'success' as const };
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
        
        {/* Detection canvas */}
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
        
        {/* Landmarks canvas */}
        <canvas
          ref={landmarksCanvasRef}
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 8,
            zIndex: 3,
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
        
        {/* Control buttons */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          zIndex: 5,
          display: 'flex',
          gap: 1,
          justifyContent: 'center'
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
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setShowLandmarks(!showLandmarks)}
            sx={{
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(147, 51, 234, 0.8)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(126, 34, 206, 0.9)',
              }
            }}
          >
            {showLandmarks ? 'Hide Landmarks' : 'Show Landmarks'}
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setShowMesh(!showMesh)}
            sx={{
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(5, 150, 105, 0.9)',
              }
            }}
          >
            {showMesh ? 'Hide Mesh' : 'Show Mesh'}
          </Button>
        </Box>
      </Box>
    </GlassPaper>
  );
};

export default DashboardCamera;
