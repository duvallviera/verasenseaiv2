'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Paper, Button, Alert, Chip } from '@mui/material';
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

const OverlayTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const landmarksRef = useRef<HTMLCanvasElement>(null);
  const meshRef = useRef<HTMLCanvasElement>(null);
  const debugRef = useRef<HTMLCanvasElement>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [overlayCount, setOverlayCount] = useState(0);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testMode, setTestMode] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Loading face-api.js models from CDN...');
        
        // Use CDN models instead of local files
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        console.log('📦 Loading Tiny Face Detector...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log('✅ Tiny Face Detector loaded');
        
        console.log('📦 Loading Face Landmark 68 Net...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('✅ Face Landmark 68 Net loaded');
        
        console.log('📦 Loading Face Expression Net...');
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('✅ Face Expression Net loaded');
        
        setModelsLoaded(true);
        console.log('✅ All models loaded successfully');
        addTestResult('✅ Face-api.js models loaded from CDN');
      } catch (error) {
        console.error('❌ Error loading models:', error);
        addTestResult(`❌ Failed to load face-api.js models: ${error}`);
        
        // Try fallback with local models
        try {
          console.log('🔄 Trying local models as fallback...');
          const LOCAL_MODEL_URL = '/models';
          
          await faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL);
          await faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_MODEL_URL);
          
          setModelsLoaded(true);
          console.log('✅ Local models loaded successfully');
          addTestResult('✅ Face-api.js models loaded from local files');
        } catch (localError) {
          console.error('❌ Local models also failed:', localError);
          addTestResult(`❌ Both CDN and local models failed: ${localError}`);
        }
      }
    };

    loadModels();
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Start camera
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      addTestResult('🎥 Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setCameraActive(true);
        addTestResult('✅ Camera started successfully');
        console.log('✅ Camera started');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      addTestResult(`❌ Camera error: ${error}`);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      addTestResult('⏹️ Camera stopped');
    }
  };

  // Setup canvas dimensions
  const setupCanvasDimensions = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvases = [canvasRef, overlayRef, landmarksRef, meshRef, debugRef];

    canvases.forEach(canvasRef => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        console.log(`📐 Canvas ${canvas.id} dimensions: ${canvas.width}x${canvas.height}`);
      }
    });
  }, []);

  // Video loaded handler
  const handleVideoLoaded = () => {
    console.log('📹 Video loaded');
    addTestResult('📹 Video element loaded');
    setupCanvasDimensions();
    startDetection();
  };

  // Start face detection
  const startDetection = () => {
    if (!cameraActive) return;

    console.log('🔍 Starting detection...');
    addTestResult('🔍 Starting detection...');

    const detectLoop = async () => {
      if (!videoRef.current || !cameraActive) return;

      const video = videoRef.current;
      
      try {
        // Test 1: Basic video element
        drawTestOverlay(debugRef.current, 'TEST 1: Video Element', 0, 0, '#00ff00');
        
        // Test 2: Canvas overlay
        drawTestOverlay(overlayRef.current, 'TEST 2: Canvas Overlay', 0, 30, '#ff0000');
        
        // Test 3: Face detection (only if models loaded)
        if (modelsLoaded) {
          const detections = await faceapi.detectAllFaces(
            video, 
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceExpressions();

          if (detections.length > 0) {
            setFaceDetected(true);
            addTestResult(`✅ Face detected: ${detections.length} face(s)`);
            
            // Test 4: Landmarks
            drawLandmarks(landmarksRef.current, detections);
            drawTestOverlay(landmarksRef.current, 'TEST 4: Landmarks', 0, 60, '#0000ff');
            
            // Test 5: Mesh
            drawMesh(meshRef.current, detections);
            drawTestOverlay(meshRef.current, 'TEST 5: Mesh', 0, 90, '#ffff00');
            
            // Test 6: Face boxes
            drawFaceBoxes(canvasRef.current, detections);
            drawTestOverlay(canvasRef.current, 'TEST 6: Face Boxes', 0, 120, '#ff00ff');
            
          } else {
            setFaceDetected(false);
            drawTestOverlay(debugRef.current, 'TEST 3: No Face Detected', 0, 60, '#ff6600');
          }
        } else {
          // Test mode - draw mock overlays that follow face-like patterns
          setFaceDetected(true);
          drawTestOverlay(debugRef.current, 'TEST 3: Mock Face Detection', 0, 60, '#ff6600');
          
          // Draw mock landmarks that follow a face-like pattern
          drawMockLandmarks(landmarksRef.current);
          drawTestOverlay(landmarksRef.current, 'TEST 4: Mock Landmarks', 0, 90, '#0000ff');
          
          // Draw mock mesh that follows face-like pattern
          drawMockMesh(meshRef.current);
          drawTestOverlay(meshRef.current, 'TEST 5: Mock Mesh', 0, 120, '#ffff00');
          
          // Draw mock face box
          drawMockFaceBox(canvasRef.current);
          drawTestOverlay(canvasRef.current, 'TEST 6: Mock Face Boxes', 0, 150, '#ff00ff');
        }

        // Test 7: Overlay counter
        setOverlayCount(prev => prev + 1);
        drawTestOverlay(debugRef.current, `TEST 7: Overlay Count: ${overlayCount}`, 0, 180, '#00ffff');

        // Test 8: Canvas status
        drawCanvasStatus();

      } catch (error) {
        console.error('❌ Detection error:', error);
        addTestResult(`❌ Detection error: ${error}`);
      }

      requestAnimationFrame(detectLoop);
    };

    detectLoop();
  };

  // Draw test overlay with number
  const drawTestOverlay = (canvas: HTMLCanvasElement | null, text: string, x: number, y: number, color: string) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(text, x, y);
  };

  // Draw landmarks
  const drawLandmarks = (canvas: HTMLCanvasElement | null, detections: any[]) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, faceIndex) => {
      const landmarks = detection.landmarks;
      if (!landmarks || !landmarks.positions) return;

      // Draw all 68 landmarks
      landmarks.positions.forEach((point: any, index: number) => {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw landmark number
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(index.toString(), point.x + 5, point.y - 5);
      });
    });
  };

  // Draw mesh
  const drawMesh = (canvas: HTMLCanvasElement | null, detections: any[]) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, faceIndex) => {
      const landmarks = detection.landmarks;
      if (!landmarks || !landmarks.positions) return;

      // Enhanced mesh with better visibility
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 3;

      // Draw mesh connections
      const positions = landmarks.positions;
      
      // Jaw line with enhanced visibility
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const point = positions[i];
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Right eyebrow
      ctx.beginPath();
      for (let i = 17; i <= 21; i++) {
        const point = positions[i];
        if (i === 17) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Left eyebrow
      ctx.beginPath();
      for (let i = 22; i <= 26; i++) {
        const point = positions[i];
        if (i === 22) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Nose with enhanced lines
      ctx.beginPath();
      for (let i = 27; i <= 35; i++) {
        const point = positions[i];
        if (i === 27) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Right eye
      ctx.beginPath();
      for (let i = 36; i <= 41; i++) {
        const point = positions[i];
        if (i === 36) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Left eye
      ctx.beginPath();
      for (let i = 42; i <= 47; i++) {
        const point = positions[i];
        if (i === 42) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      for (let i = 48; i <= 67; i++) {
        const point = positions[i];
        if (i === 48) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Add additional mesh lines for better face tracking
      // Connect key facial features
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 2;

      // Connect eyes to nose
      if (positions[36] && positions[27]) {
        ctx.beginPath();
        ctx.moveTo(positions[36].x, positions[36].y);
        ctx.lineTo(positions[27].x, positions[27].y);
        ctx.stroke();
      }

      if (positions[42] && positions[27]) {
        ctx.beginPath();
        ctx.moveTo(positions[42].x, positions[42].y);
        ctx.lineTo(positions[27].x, positions[27].y);
        ctx.stroke();
      }

      // Connect nose to mouth
      if (positions[27] && positions[48]) {
        ctx.beginPath();
        ctx.moveTo(positions[27].x, positions[27].y);
        ctx.lineTo(positions[48].x, positions[48].y);
        ctx.stroke();
      }

      // Reset shadow
      ctx.shadowBlur = 0;
    });
  };

  // Draw face boxes
  const drawFaceBoxes = (canvas: HTMLCanvasElement | null, detections: any[]) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, index) => {
      const box = detection.detection.box;
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Face ${index + 1}`, box.x, box.y - 10);
    });
  };

  // Draw mock landmarks that follow a face-like pattern
  const drawMockLandmarks = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get canvas center for face-like positioning
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001; // For subtle animation

    // Draw 68 mock landmarks in face-like positions
    const landmarks = [];
    
    // Jaw line (0-16)
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI;
      const x = centerX + Math.cos(angle) * 80 + Math.sin(time) * 5;
      const y = centerY + Math.sin(angle) * 40 + Math.cos(time * 0.5) * 3;
      landmarks.push({ x, y });
    }

    // Right eyebrow (17-21)
    for (let i = 17; i <= 21; i++) {
      const t = (i - 17) / 4;
      const x = centerX - 40 + t * 20 + Math.sin(time * 0.3) * 2;
      const y = centerY - 60 + Math.sin(t * Math.PI) * 10 + Math.cos(time * 0.4) * 2;
      landmarks.push({ x, y });
    }

    // Left eyebrow (22-26)
    for (let i = 22; i <= 26; i++) {
      const t = (i - 22) / 4;
      const x = centerX + 20 + t * 20 + Math.sin(time * 0.3) * 2;
      const y = centerY - 60 + Math.sin(t * Math.PI) * 10 + Math.cos(time * 0.4) * 2;
      landmarks.push({ x, y });
    }

    // Nose (27-35)
    for (let i = 27; i <= 35; i++) {
      const t = (i - 27) / 8;
      const x = centerX + Math.sin(time * 0.2) * 3;
      const y = centerY - 40 + t * 30 + Math.cos(time * 0.3) * 2;
      landmarks.push({ x, y });
    }

    // Right eye (36-41)
    for (let i = 36; i <= 41; i++) {
      const angle = ((i - 36) / 6) * 2 * Math.PI;
      const x = centerX - 25 + Math.cos(angle) * 15 + Math.sin(time * 0.5) * 2;
      const y = centerY - 30 + Math.sin(angle) * 8 + Math.cos(time * 0.4) * 1;
      landmarks.push({ x, y });
    }

    // Left eye (42-47)
    for (let i = 42; i <= 47; i++) {
      const angle = ((i - 42) / 6) * 2 * Math.PI;
      const x = centerX + 25 + Math.cos(angle) * 15 + Math.sin(time * 0.5) * 2;
      const y = centerY - 30 + Math.sin(angle) * 8 + Math.cos(time * 0.4) * 1;
      landmarks.push({ x, y });
    }

    // Mouth (48-67)
    for (let i = 48; i <= 67; i++) {
      const t = (i - 48) / 19;
      const angle = t * Math.PI;
      const x = centerX + Math.cos(angle) * 25 + Math.sin(time * 0.3) * 3;
      const y = centerY + 20 + Math.sin(angle) * 15 + Math.cos(time * 0.2) * 2;
      landmarks.push({ x, y });
    }

    // Draw all landmarks
    landmarks.forEach((point, index) => {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw landmark number
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px Arial';
      ctx.fillText(index.toString(), point.x + 5, point.y - 5);
    });
  };

  // Draw mock mesh that follows face-like pattern
  const drawMockMesh = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;

    // Draw face outline
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI;
      const x = centerX + Math.cos(angle) * 80 + Math.sin(time) * 5;
      const y = centerY + Math.sin(angle) * 40 + Math.cos(time * 0.5) * 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw eyebrows
    ctx.beginPath();
    for (let i = 17; i <= 26; i++) {
      const t = (i - 17) / 9;
      const x = centerX - 40 + t * 80 + Math.sin(time * 0.3) * 2;
      const y = centerY - 60 + Math.sin(t * Math.PI) * 10 + Math.cos(time * 0.4) * 2;
      if (i === 17) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw nose
    ctx.beginPath();
    for (let i = 27; i <= 35; i++) {
      const t = (i - 27) / 8;
      const x = centerX + Math.sin(time * 0.2) * 3;
      const y = centerY - 40 + t * 30 + Math.cos(time * 0.3) * 2;
      if (i === 27) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw eyes
    ctx.beginPath();
    for (let i = 36; i <= 47; i++) {
      const angle = ((i - 36) / 12) * 2 * Math.PI;
      const x = centerX + (i < 42 ? -25 : 25) + Math.cos(angle) * 15 + Math.sin(time * 0.5) * 2;
      const y = centerY - 30 + Math.sin(angle) * 8 + Math.cos(time * 0.4) * 1;
      if (i === 36) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw mouth
    ctx.beginPath();
    for (let i = 48; i <= 67; i++) {
      const t = (i - 48) / 19;
      const angle = t * Math.PI;
      const x = centerX + Math.cos(angle) * 25 + Math.sin(time * 0.3) * 3;
      const y = centerY + 20 + Math.sin(angle) * 15 + Math.cos(time * 0.2) * 2;
      if (i === 48) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  // Draw mock face box
  const drawMockFaceBox = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Draw animated face box
    const boxWidth = 160 + Math.sin(time * 0.5) * 10;
    const boxHeight = 200 + Math.cos(time * 0.3) * 15;
    const x = centerX - boxWidth / 2 + Math.sin(time * 0.2) * 5;
    const y = centerY - boxHeight / 2 + Math.cos(time * 0.4) * 3;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, boxWidth, boxHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Mock Face', x, y - 10);
  };

  // Draw canvas status
  const drawCanvasStatus = () => {
    const canvases = [
      { ref: canvasRef, name: 'Main Canvas', color: '#ff0000' },
      { ref: overlayRef, name: 'Overlay Canvas', color: '#00ff00' },
      { ref: landmarksRef, name: 'Landmarks Canvas', color: '#0000ff' },
      { ref: meshRef, name: 'Mesh Canvas', color: '#ffff00' },
      { ref: debugRef, name: 'Debug Canvas', color: '#ff00ff' }
    ];

    canvases.forEach((canvas, index) => {
      if (canvas.ref.current) {
        const ctx = canvas.ref.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = canvas.color;
          ctx.font = 'bold 12px Arial';
          ctx.fillText(`${canvas.name}: ACTIVE`, 10, canvas.ref.current.height - 20 - (index * 20));
        }
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
          Overlay Test - All Components Numbered
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Testing all video overlays and components with clear numbering
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Video Section */}
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <GlassPaper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Video with All Overlays
            </Typography>
            
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto' }}>
              {/* Video Element */}
              <video
                ref={videoRef}
                width={640}
                height={480}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 8,
                  border: '2px solid #00ff00'
                }}
                onLoadedMetadata={handleVideoLoaded}
                playsInline
                muted
              />
              
              {/* Canvas Overlays */}
              <canvas
                ref={canvasRef}
                id="main-canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  border: '2px solid #ff0000',
                  zIndex: 1
                }}
              />
              
              <canvas
                ref={overlayRef}
                id="overlay-canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  border: '2px solid #00ff00',
                  zIndex: 2
                }}
              />
              
              <canvas
                ref={landmarksRef}
                id="landmarks-canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  border: '2px solid #0000ff',
                  zIndex: 3
                }}
              />
              
              <canvas
                ref={meshRef}
                id="mesh-canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  border: '2px solid #ffff00',
                  zIndex: 4
                }}
              />
              
              <canvas
                ref={debugRef}
                id="debug-canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  border: '2px solid #ff00ff',
                  zIndex: 5
                }}
              />
            </Box>
            
            {/* Control Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={startCamera}
                disabled={cameraActive}
                sx={{ minWidth: 120 }}
              >
                {cameraActive ? 'Camera Active' : 'Start Camera'}
              </Button>
              
              <Button
                variant="contained"
                color="error"
                onClick={stopCamera}
                disabled={!cameraActive}
                sx={{ minWidth: 120 }}
              >
                Stop Camera
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setTestMode(!testMode)}
                sx={{ minWidth: 120 }}
              >
                {testMode ? 'Disable Test Mode' : 'Enable Test Mode'}
              </Button>
            </Box>
            
            {/* Status Indicators */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip 
                label={modelsLoaded ? 'Models: ✅' : 'Models: ❌'} 
                color={modelsLoaded ? 'success' : 'error'}
                size="small"
              />
              <Chip 
                label={cameraActive ? 'Camera: ✅' : 'Camera: ❌'} 
                color={cameraActive ? 'success' : 'error'}
                size="small"
              />
              <Chip 
                label={faceDetected ? 'Face: ✅' : 'Face: ❌'} 
                color={faceDetected ? 'success' : 'error'}
                size="small"
              />
              <Chip 
                label={`Overlays: ${overlayCount}`} 
                color="info"
                size="small"
              />
              <Chip 
                label={testMode ? 'Test Mode: ✅' : 'Test Mode: ❌'} 
                color={testMode ? 'warning' : 'default'}
                size="small"
              />
            </Box>
          </GlassPaper>
        </Box>

        {/* Test Results */}
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <GlassPaper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Test Results
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {testResults.map((result, index) => (
                <Alert 
                  key={index} 
                  severity={result.includes('✅') ? 'success' : result.includes('❌') ? 'error' : 'info'}
                  sx={{ mb: 1, fontSize: '12px' }}
                >
                  {result}
                </Alert>
              ))}
            </Box>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setTestResults([])}
              sx={{ mt: 2 }}
            >
              Clear Results
            </Button>
          </GlassPaper>
        </Box>
      </Box>

      {/* Component Legend */}
      <GlassPaper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          Component Legend:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#00ff00', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>Video Element</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ff0000', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>Main Canvas (Face Boxes)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#00ff00', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>Overlay Canvas</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#0000ff', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>Landmarks Canvas</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ffff00', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>Mesh Canvas</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ff00ff', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>Debug Canvas</Typography>
          </Box>
        </Box>
      </GlassPaper>
    </Container>
  );
};

export default OverlayTest;
