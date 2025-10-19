import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, Paper, Typography, LinearProgress, Chip, Stack, Grid, Tooltip,
  Button, Collapse, Divider, IconButton, TextField, FormControl, List, InputBase
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SendIcon from '@mui/icons-material/Send';

import { useAgentic } from '../context/AgenticContext';
import InterviewQuestionsPanel from './InterviewQuestionsPanel';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  overflow: 'hidden',
  position: 'relative',
  padding: theme.spacing(2),
}));

const AnalysisBox = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: 12,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.08)',
}));

const MetricLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.7)',
}));

const MetricValue = styled(Box)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  color: 'white',
}));

const StyledProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  },
}));

const AudioWave = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  height: '40px',
  marginBottom: theme.spacing(1),
  '& .wave-bar': {
    width: '4px',
    backgroundColor: active ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    transition: 'height 0.1s ease-in-out',
  },
}));

const TruthIndicator = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '30px',
  marginTop: theme.spacing(2),
  borderRadius: '15px',
  overflow: 'hidden',
}));

const TruthBackground = styled(Box)<{ value: number }>(({ theme, value }) => {
  // Red to green gradient based on truth probability
  const redComponent = Math.max(0, Math.min(255, 255 - (value * 2.55)));
  const greenComponent = Math.max(0, Math.min(255, value * 2.55));
  
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, rgba(${redComponent}, ${greenComponent}, 0, 0.8) 0%, rgba(${redComponent}, ${greenComponent}, 0, 0.8) ${value}%, rgba(60, 60, 70, 0.4) ${value}%, rgba(60, 60, 70, 0.4) 100%)`,
  };
});

const TruthLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.9rem',
  textShadow: '0 1px 2px rgba(0,0,0,0.7)',
}));

// Interface for voice metrics objects with analytical data
interface VoiceMetrics {
  pitch: number;
  volume: number;
  tempo: number;
  stress: number;
  confidence: number;
  timestamp: number;
}

interface DeceptionIndicators {
  contradictions: number;
  hesitations: number;
  uncertainties: number;
}

const VoiceAnalyzer: React.FC = () => {
  const { 
    isListening, 
    startVoiceAnalysis, 
    stopVoiceAnalysis, 
    processVoiceInput,
    truthProbability,
    currentVoiceAnalysis,
    currentEmotion, // For combined analysis with facial data
    storeInteractionData, // To store analysis events
    askQuestion // For handling interview questions
  } = useAgentic();
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number[]>(Array(20).fill(5));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics>({
    pitch: 50,
    volume: 50,
    tempo: 50,
    stress: 50,
    confidence: 50,
    timestamp: Date.now()
  });
  const [metricsHistory, setMetricsHistory] = useState<VoiceMetrics[]>([]);
  const [deceptionIndicators, setDeceptionIndicators] = useState<DeceptionIndicators>({
    contradictions: 0,
    hesitations: 0,
    uncertainties: 0
  });
  

  
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  
  // Initialize audio context and request microphone access
  useEffect(() => {
    // Only initialize audio when the component mounts
    // This ensures we only create the audio context once
    const initAudio = async () => {
      try {
        // Create audio context
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        });
        setAudioStream(stream);
        
        // Create analyzer
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        
        // Create buffer
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        
        // Connect microphone to analyzer
        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);
        
        // Store references
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        
        console.log('Microphone access granted and audio analyzer initialized');
      } catch (error) {
        console.error('Error initializing microphone:', error);
        setErrorMessage('Failed to access microphone. Please check your browser permissions.');
      }
    };
    
    initAudio();
    
    // Cleanup only on component unmount, not on each render
    return () => {
      if (audioStream) {
        // Only stop tracks when component is unmounted completely
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopVoiceAnalysis();
    };
  }, []); // Empty dependency array ensures this only runs on mount/unmount
  
  // Handle starting/stopping the voice analysis based on isListening state
  useEffect(() => {
    // When isListening changes, start or stop the analysis
    if (isListening) {
      // Start the analysis when isListening is true
      console.log('Voice analysis started');
    } else {
      // Stop the animation frame when isListening is false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      console.log('Voice analysis paused');
    }
  }, [isListening]);
  
  // Separate effect for the actual audio analysis
  useEffect(() => {
    // Return early if we don't have the analyzer set up yet
    // or we're not supposed to be listening
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    const analyzeAudio = () => {
      // Don't proceed if we're not actively listening or the refs are gone
      if (!isListening || !analyserRef.current || !dataArrayRef.current) {
        return;
      }
      
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      
      // Get audio data
      analyser.getFloatTimeDomainData(dataArray);
      
      // Calculate RMS (root mean square) for volume level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      
      // Scale to 0-100 for visualization (adjust factor as needed)
      const scaledVolume = Math.min(100, Math.max(5, rms * 500));
      
      // Update volume bars
      setVolumeLevel(prev => {
        const newLevels = [...prev];
        newLevels.shift();
        newLevels.push(scaledVolume);
        return newLevels;
      });
      
      // Generate more detailed voice metrics
      const now = Date.now();
      
      // Calculate a variety of metrics from the audio data
      // In a real app, these would come from actual audio processing algorithms
      // Here we use the raw data and randomization to simulate realistic values
      
      // Extract pitch information (in a real app, would use pitch detection algorithm)
      const pitchValue = Math.min(100, Math.max(0, 50 + (Math.random() * 30 - 15) + rms * 50));
      
      // Use the current volume level
      const volumeValue = scaledVolume;
      
      // Calculate tempo based on zero-crossings in the signal
      let zeroCrossings = 0;
      for (let i = 1; i < dataArray.length; i++) {
        if ((dataArray[i] > 0 && dataArray[i - 1] <= 0) || 
            (dataArray[i] < 0 && dataArray[i - 1] >= 0)) {
          zeroCrossings++;
        }
      }
      const tempoValue = Math.min(100, Math.max(0, zeroCrossings / 10));
      
      // Stress level can be derived from variations in pitch and volume
      const stressValue = Math.min(100, Math.max(0, 
        (pitchValue > 70 ? pitchValue : 0) * 0.3 + 
        (volumeValue > 60 ? volumeValue : 0) * 0.3 + 
        (tempoValue > 60 ? tempoValue : 0) * 0.4 + 
        (Math.random() * 15)
      ));
      
      // Confidence is inversely related to stress and variability
      const confidenceValue = Math.min(100, Math.max(0, 
        100 - stressValue * 0.7 + (Math.random() * 20 - 10)
      ));
      
      // Create new metrics object
      const newMetrics: VoiceMetrics = {
        pitch: pitchValue,
        volume: volumeValue,
        tempo: tempoValue,
        stress: stressValue,
        confidence: confidenceValue,
        timestamp: now
      };
      
      // Update metrics state
      setVoiceMetrics(newMetrics);
      setMetricsHistory(prev => [...prev.slice(-20), newMetrics]);
      
      // Generate deception indicators based on voice patterns
      // In a real app, these would be based on scientific voice analysis algorithms
      const newDeceptionIndicators = {
        contradictions: stressValue > 70 ? (Math.random() * 0.5 + 0.5) : (Math.random() * 0.4),
        hesitations: pitchValue < 40 && volumeValue < 40 ? (Math.random() * 0.6 + 0.4) : (Math.random() * 0.3),
        uncertainties: confidenceValue < 40 ? (Math.random() * 0.7 + 0.3) : (Math.random() * 0.2)
      };
      setDeceptionIndicators(newDeceptionIndicators);
      
      // Store interaction data for analysis
      storeInteractionData({
        type: 'voice',
        data: {
          metrics: newMetrics,
          deceptionIndicators: newDeceptionIndicators,
          correlatedEmotion: currentEmotion
        },
        timestamp: now
      });
      
      // Always process voice input when analyzing
      processVoiceInput(dataArray);
      
      // Continue analyzing
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    // Only start the analysis loop if we're supposed to be listening
    if (isListening) {
      analyzeAudio();
    }
    
    // Clean up when the component unmounts or dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isListening, processVoiceInput]);
  
  // Determine truth/lie label based on probability
  const getTruthLabel = () => {
    if (truthProbability > 80) return 'Very Likely True ('+Math.round(truthProbability)+'%)';
    if (truthProbability > 60) return 'Likely True ('+Math.round(truthProbability)+'%)';
    if (truthProbability > 40) return 'Uncertain ('+Math.round(truthProbability)+'%)';
    if (truthProbability > 20) return 'Likely False ('+Math.round(truthProbability)+'%)';
    return 'Very Likely False ('+Math.round(truthProbability)+'%)';
  };
  
  // Determine color for truth indicator
  const getTruthColor = () => {
    if (truthProbability > 80) return 'success';
    if (truthProbability > 60) return 'info';
    if (truthProbability > 40) return 'warning';
    return 'error';
  };
  

  
  // Toggle microphone on/off
  const toggleMicrophone = () => {
    if (isListening) {
      stopVoiceAnalysis();
    } else {
      startVoiceAnalysis();
    }
  };
  
  const isAnalysisActive = isListening;

  return (
    <GlassPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Voice Analysis
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '0.75rem', mx: 1, flexGrow: 1, textAlign: 'center' }}>
          Analyze voice characteristics in real-time during the interview without recording content.
        </Typography>
        <IconButton 
          onClick={toggleMicrophone}
          size="small"
          color={isAnalysisActive ? "error" : "primary"}
          aria-label={isAnalysisActive ? "Stop recording" : "Start recording"}
          sx={{ 
            backgroundColor: isAnalysisActive ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)',
            '&:hover': {
              backgroundColor: isAnalysisActive ? 'rgba(244, 67, 54, 0.2)' : 'rgba(33, 150, 243, 0.2)',
            }
          }}
        >
          {isAnalysisActive ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
      </Box>


        
        {/* Voice waveform visualization */}
        <AudioWave active={isListening}>
          {volumeLevel.map((level, index) => (
            <Box 
              key={index} 
              className="wave-bar" 
              sx={{ 
                height: `${level}%`,
                backgroundColor: level > 70 ? '#ef4444' : 
                               level > 50 ? '#f59e0b' : 
                               level > 30 ? '#3b82f6' : 
                               'rgba(255, 255, 255, 0.3)'
              }} 
            />
          ))}
        </AudioWave>
          
          {/* Status indicators */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              icon={isListening ? <MicIcon /> : <MicOffIcon />}
              label={isListening ? 'Listening' : 'Microphone Off'}
              color={isListening ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
            
            {currentVoiceAnalysis && (
              <>
                <Chip
                  icon={currentVoiceAnalysis.stressLevel > 70 ? <WarningIcon /> : <CheckCircleIcon />}
                  label={`Stress: ${Math.round(currentVoiceAnalysis.stressLevel)}%`}
                  color={currentVoiceAnalysis.stressLevel > 70 ? 'error' : 
                         currentVoiceAnalysis.stressLevel > 40 ? 'warning' : 'success'}
                  size="small"
                  variant="outlined"
                />
                
                <Chip
                  label={`Pitch: ${voiceMetrics.pitch > 70 ? 'High' : voiceMetrics.pitch < 30 ? 'Low' : 'Normal'}`}
                  color={voiceMetrics.pitch > 70 ? 'warning' : 
                         voiceMetrics.pitch < 30 ? 'info' : 'success'}
                  size="small"
                  variant="outlined"
                />
              </>
            )}
          </Stack>
          
          {/* Truth assessment visualization */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ 
              mb: 0.5, 
              color: '#bbb', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span>Truth Assessment</span>
              <Tooltip title="Based on voice patterns, stress indicators, and micro-expressions">
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)', padding: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <TruthIndicator>
              <TruthBackground value={truthProbability} />
              <TruthLabel>
                {getTruthLabel()}
              </TruthLabel>
            </TruthIndicator>
          </Box>
          
          {/* Deception indicators summary */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, color: '#bbb' }}>
              Deception Risk Factors
            </Typography>
            
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Tooltip title="Contradictions in voice patterns and emotional response">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Contradictions
                    </Typography>
                    <Box sx={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 'bold',
                      color: deceptionIndicators.contradictions > 0.7 ? '#ef4444' : 
                             deceptionIndicators.contradictions > 0.4 ? '#f59e0b' : '#10b981'
                    }}>
                      {deceptionIndicators.contradictions > 0.7 ? 'High' : 
                       deceptionIndicators.contradictions > 0.4 ? 'Medium' : 'Low'}
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={4}>
                <Tooltip title="Hesitations in speech and irregular pauses">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Hesitations
                    </Typography>
                    <Box sx={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 'bold',
                      color: deceptionIndicators.hesitations > 0.7 ? '#ef4444' : 
                             deceptionIndicators.hesitations > 0.4 ? '#f59e0b' : '#10b981'
                    }}>
                      {deceptionIndicators.hesitations > 0.7 ? 'High' : 
                       deceptionIndicators.hesitations > 0.4 ? 'Medium' : 'Low'}
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={4}>
                <Tooltip title="Uncertainty markers in voice tone and modulation">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Uncertainty
                    </Typography>
                    <Box sx={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 'bold',
                      color: deceptionIndicators.uncertainties > 0.7 ? '#ef4444' : 
                             deceptionIndicators.uncertainties > 0.4 ? '#f59e0b' : '#10b981'
                    }}>
                      {deceptionIndicators.uncertainties > 0.7 ? 'High' : 
                       deceptionIndicators.uncertainties > 0.4 ? 'Medium' : 'Low'}
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
          
          {/* Detailed voice metrics panel */}
          <Collapse in={showAnalysisDetails} timeout="auto">
            <AnalysisBox>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Detailed Voice Metrics
              </Typography>
              
              <Grid container spacing={2}>
                {/* Pitch */}
                <Grid item xs={6}>
                  <Tooltip title="Voice pitch level - higher values may indicate stress or excitement" arrow>
                    <Box>
                      <MetricLabel>
                        Pitch
                        <MetricValue>{Math.round(voiceMetrics.pitch)}%</MetricValue>
                      </MetricLabel>
                      <StyledProgress 
                        variant="determinate" 
                        value={voiceMetrics.pitch} 
                        sx={{ mb: 1.5, '& .MuiLinearProgress-bar': { backgroundColor: '#3b82f6' } }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
                
                {/* Volume */}
                <Grid item xs={6}>
                  <Tooltip title="Voice volume - sudden changes may indicate emotional response" arrow>
                    <Box>
                      <MetricLabel>
                        Volume
                        <MetricValue>{Math.round(voiceMetrics.volume)}%</MetricValue>
                      </MetricLabel>
                      <StyledProgress 
                        variant="determinate" 
                        value={voiceMetrics.volume} 
                        sx={{ mb: 1.5, '& .MuiLinearProgress-bar': { backgroundColor: '#10b981' } }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
                
                {/* Tempo */}
                <Grid item xs={6}>
                  <Tooltip title="Speaking rate - faster speech can indicate nervousness" arrow>
                    <Box>
                      <MetricLabel>
                        Tempo
                        <MetricValue>{Math.round(voiceMetrics.tempo)}%</MetricValue>
                      </MetricLabel>
                      <StyledProgress 
                        variant="determinate" 
                        value={voiceMetrics.tempo} 
                        sx={{ mb: 1.5, '& .MuiLinearProgress-bar': { backgroundColor: '#9333ea' } }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
                
                {/* Stress */}
                <Grid item xs={6}>
                  <Tooltip title="Vocal stress indicators - high stress may indicate deception" arrow>
                    <Box>
                      <MetricLabel>
                        Stress
                        <MetricValue>{Math.round(voiceMetrics.stress)}%</MetricValue>
                      </MetricLabel>
                      <StyledProgress 
                        variant="determinate" 
                        value={voiceMetrics.stress} 
                        sx={{ 
                          mb: 1.5, 
                          '& .MuiLinearProgress-bar': { 
                            backgroundColor: voiceMetrics.stress > 70 ? '#ef4444' : 
                                           voiceMetrics.stress > 40 ? '#f59e0b' : '#10b981' 
                          } 
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
                
                {/* Confidence */}
                <Grid item xs={12}>
                  <Tooltip title="Confidence measurement - low confidence may indicate uncertainty" arrow>
                    <Box>
                      <MetricLabel>
                        Confidence
                        <MetricValue>{Math.round(voiceMetrics.confidence)}%</MetricValue>
                      </MetricLabel>
                      <StyledProgress 
                        variant="determinate" 
                        value={voiceMetrics.confidence} 
                        sx={{ 
                          mb: 1.5, 
                          '& .MuiLinearProgress-bar': { 
                            backgroundColor: voiceMetrics.confidence < 30 ? '#ef4444' : 
                                           voiceMetrics.confidence < 60 ? '#f59e0b' : '#10b981' 
                          } 
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              </Grid>
              
              {/* Insights section */}
              <Typography variant="caption" sx={{ mt: 2, mb: 1, display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                Voice Pattern Analysis
              </Typography>
              
              <Box sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                {voiceMetrics.stress > 70 && (
                  <Box sx={{ mb: 1 }}>
                    ⚠️ High vocal stress detected - may indicate emotional tension or deception
                  </Box>
                )}
                
                {voiceMetrics.pitch > 70 && voiceMetrics.tempo > 60 && (
                  <Box sx={{ mb: 1 }}>
                    ⚠️ Elevated pitch and speaking rate suggest heightened emotional state
                  </Box>
                )}
                
                {voiceMetrics.volume < 30 && (
                  <Box sx={{ mb: 1 }}>
                    ℹ️ Low speaking volume may indicate uncertainty or discomfort
                  </Box>
                )}
                
                {voiceMetrics.confidence < 40 && (
                  <Box sx={{ mb: 1 }}>
                    ⚠️ Low confidence indicators present in vocal patterns
                  </Box>
                )}
                
                {voiceMetrics.stress < 30 && voiceMetrics.confidence > 70 && (
                  <Box sx={{ mb: 1 }}>
                    ✓ Low stress and high confidence suggest truthful communication
                  </Box>
                )}
              </Box>
            </AnalysisBox>
          </Collapse>
        
        {/* Status indicators */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            icon={isListening ? <MicIcon /> : <MicOffIcon />}
            label={isListening ? 'Listening' : 'Microphone Off'}
            color={isListening ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
          
          {currentVoiceAnalysis && (
            <>
              <Chip
                icon={currentVoiceAnalysis.stressLevel > 70 ? <WarningIcon /> : <CheckCircleIcon />}
                label={`Stress: ${Math.round(currentVoiceAnalysis.stressLevel)}%`}
                color={currentVoiceAnalysis.stressLevel > 70 ? 'error' : 
                       currentVoiceAnalysis.stressLevel > 40 ? 'warning' : 'success'}
                size="small"
                variant="outlined"
              />
              
              <Chip
                label={`Pitch: ${voiceMetrics.pitch > 70 ? 'High' : voiceMetrics.pitch < 30 ? 'Low' : 'Normal'}`}
                color={voiceMetrics.pitch > 70 ? 'warning' : 
                       voiceMetrics.pitch < 30 ? 'info' : 'success'}
                size="small"
                variant="outlined"
              />
            </>
          )}
        </Stack>
        
        {/* Truth assessment visualization */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ 
            mb: 0.5, 
            color: '#bbb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span>Truth Assessment</span>
            <Tooltip title="Based on voice patterns, stress indicators, and micro-expressions">
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)', padding: 0 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <TruthIndicator>
            <TruthBackground value={truthProbability} />
            <TruthLabel>
              {getTruthLabel()}
            </TruthLabel>
          </TruthIndicator>
        </Box>
        
        {/* Detailed voice metrics panel */}
        <Box sx={{ textAlign: 'right', mb: 1 }}>
          <Button 
            size="small" 
            startIcon={showAnalysisDetails ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
            sx={{ color: 'white', textTransform: 'none' }}
          >
            {showAnalysisDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </Box>
        
        <Collapse in={showAnalysisDetails} timeout="auto">
          <AnalysisBox>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
              Detailed Voice Metrics
            </Typography>
            
            <Grid container spacing={2}>
              {/* Pitch */}
              <Grid item xs={6}>
                <Tooltip title="Voice pitch level - higher values may indicate stress or excitement" arrow>
                  <Box>
                    <MetricLabel>
                      Pitch
                      <MetricValue>{Math.round(voiceMetrics.pitch)}%</MetricValue>
                    </MetricLabel>
                    <StyledProgress 
                      variant="determinate" 
                      value={voiceMetrics.pitch} 
                      sx={{ mb: 1.5, '& .MuiLinearProgress-bar': { backgroundColor: '#3b82f6' } }}
                    />
                  </Box>
                </Tooltip>
              </Grid>
              
              {/* Volume */}
              <Grid item xs={6}>
                <Tooltip title="Voice volume - sudden changes may indicate emotional response" arrow>
                  <Box>
                    <MetricLabel>
                      Volume
                      <MetricValue>{Math.round(voiceMetrics.volume)}%</MetricValue>
                    </MetricLabel>
                    <StyledProgress 
                      variant="determinate" 
                      value={voiceMetrics.volume} 
                      sx={{ mb: 1.5, '& .MuiLinearProgress-bar': { backgroundColor: '#10b981' } }}
                    />
                  </Box>
                </Tooltip>
              </Grid>
              
              {/* Tempo */}
              <Grid item xs={6}>
                <Tooltip title="Speech tempo - rapid changes may indicate nervousness" arrow>
                  <Box>
                    <MetricLabel>
                      Tempo
                      <MetricValue>{Math.round(voiceMetrics.tempo)}%</MetricValue>
                    </MetricLabel>
                    <StyledProgress 
                      variant="determinate" 
                      value={voiceMetrics.tempo} 
                      sx={{ mb: 1.5, '& .MuiLinearProgress-bar': { backgroundColor: '#f59e0b' } }}
                    />
                  </Box>
                </Tooltip>
              </Grid>
              
              {/* Stress */}
              <Grid item xs={6}>
                <Tooltip title="Vocal stress indicators" arrow>
                  <Box>
                    <MetricLabel>
                      Stress
                      <MetricValue>{Math.round(voiceMetrics.stress)}%</MetricValue>
                    </MetricLabel>
                    <StyledProgress 
                      variant="determinate" 
                      value={voiceMetrics.stress} 
                      sx={{ 
                        mb: 1.5, 
                        '& .MuiLinearProgress-bar': { 
                          backgroundColor: voiceMetrics.stress > 70 ? '#ef4444' : 
                                        voiceMetrics.stress > 50 ? '#f59e0b' : '#10b981' 
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </AnalysisBox>
        </Collapse>
      </GlassPaper>
    );
  };

export default VoiceAnalyzer;
