import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Add type definition for the global window object
declare global {
  interface Window {
    emotionCallback: ((data: any) => void) | null;
    faceDetectionInterval: number | null;
  }
}

// Define types for the Agentic Framework
export type AgenticMode = 'analytical' | 'emotional' | 'motivational';
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'fearful';
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'disgust';
export type StressLevel = 'low' | 'medium' | 'high' | 'very-high';
export type TruthProbability = number; // 0-100 percentage

// Voice analysis results
export interface VoiceAnalysisResult {
  stressLevel: number; // 0-100
  pitch: number; // normalized value
  volume: number; // normalized value
  speed: number; // words per minute
  irregularities: number; // detected irregularities in speech pattern
  confidence: number; // confidence in analysis
  timestamp: number;
}

// Emotion detection results based on detection
export interface EmotionResult {
  dominant: EmotionType;
  scores: {
    [key in EmotionType]?: number;
  };
  stressLevel: StressLevel;
  confidence: number;
  timestamp: number;
}

// Session data structure
interface Session {
  id: string;
  startTime: number;
  endTime?: number;
  emotionData: EmotionResult[];
  questions: {
    id: string;
    text: string;
    timestamp: number;
    response?: string;
    responseTime?: number;
    emotionAtQuestion?: EmotionResult;
    emotionAtResponse?: EmotionResult;
  }[];
}

interface AgenticContextType {
  // Current state
  currentEmotion: EmotionResult | null;
  currentVoiceAnalysis: VoiceAnalysisResult | null;
  truthProbability: TruthProbability;
  currentSession: Session | null;
  emotionHistory: EmotionResult[];
  voiceAnalysisHistory: VoiceAnalysisResult[];
  agenticMode: AgenticMode;
  attachmentStyle: AttachmentStyle | null;
  isRecording: boolean;
  isListening: boolean;

  // Methods for emotion detection
  startEmotionDetection: () => void;
  stopEmotionDetection: () => void;
  
  // Methods for voice analysis
  startVoiceAnalysis: () => void;
  stopVoiceAnalysis: () => void;
  processVoiceInput: (audioData: Float32Array) => void;
  
  // Session management
  startSession: () => void;
  endSession: () => Promise<string>;
  
  // Question/response handling
  askQuestion: (question: string) => void;
  recordResponse: (questionId: string, response: string) => void;
  
  // Analysis methods
  getRecommendedApproach: () => string;
  getEmotionalInsight: () => string;
  
  // Face analysis methods
  captureBaseline: (faceImage: string) => void;
  compareWithBaseline: (faceImage: string) => Promise<number>;
  
  // Data storage
  storeInteractionData: (data: any) => void;
}

const AgenticContext = createContext<AgenticContextType | null>(null);

// Custom hook to use the Agentic context
export const useAgentic = () => {
  const context = useContext(AgenticContext);
  if (!context) {
    throw new Error('useAgentic must be used within an AgenticProvider');
  }
  return context;
};

// Default emotion state
const defaultEmotion: EmotionResult = {
  dominant: 'neutral',
  scores: {
    neutral: 0.8,
    happy: 0.1, 
    sad: 0.05,
    angry: 0.02,
    fear: 0.01,
    surprise: 0.01,
    disgust: 0.01
  },
  stressLevel: 'low',
  confidence: 0.8,
  timestamp: Date.now()
};

export function AgenticProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State for emotion tracking
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // State for voice analysis
  const [currentVoiceAnalysis, setCurrentVoiceAnalysis] = useState<VoiceAnalysisResult | null>(null);
  const [voiceAnalysisHistory, setVoiceAnalysisHistory] = useState<VoiceAnalysisResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  // State for truth detection
  const [truthProbability, setTruthProbability] = useState<TruthProbability>(50); // Default to neutral 50%
  
  // State for sessions
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  
  // State for agentic framework
  const [agenticMode, setAgenticMode] = useState<AgenticMode>('analytical');
  const [attachmentStyle, setAttachmentStyle] = useState<AttachmentStyle | null>(null);
  const [baselineImage, setBaselineImage] = useState<string | null>(null);
  
  // Initialize with default emotion and agentic framework settings
  useEffect(() => {
    if (!currentEmotion) {
      setCurrentEmotion(defaultEmotion);
      setEmotionHistory([defaultEmotion]);
    }
    
    // Set initial agentic mode to analytical (default)
    setAgenticMode('analytical');
    
    // Initialize attachment style as null (will be determined after gathering data)
    setAttachmentStyle(null);
  }, []);
  
  // Real emotion detection using face-api.js
  useEffect(() => {
    // Set up global callback for the WebcamCapture component to send emotion data
    window.emotionCallback = (emotionData: EmotionResult) => {
      if (!isRecording) return;
      
      // Use the real emotion data from face-api.js
      const newEmotion: EmotionResult = {
        dominant: emotionData.dominant,
        scores: emotionData.scores,
        stressLevel: emotionData.stressLevel,
        confidence: emotionData.confidence,
        timestamp: Date.now()
      };
      
      setCurrentEmotion(newEmotion);
      setEmotionHistory(prev => [...prev, newEmotion]);
      
      // If in a session, update the session emotion data
      if (currentSession) {
        setCurrentSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            emotionData: [...prev.emotionData, newEmotion]
          };
        });
      }
    };
    
    // Cleanup
    return () => {
      window.emotionCallback = null;
    };
  }, [isRecording, currentSession]);
  
  // Initialize the global callback for the WebcamCapture component
  useEffect(() => {
    // Initialize the global window properties if they don't exist
    if (typeof window !== 'undefined') {
      window.emotionCallback = null;
      window.faceDetectionInterval = null;
    }
  }, []);
  
  // Session management functions
  const startSession = useCallback(() => {
    if (currentSession) {
      console.warn('Session already in progress');
      return;
    }
    
    const newSession: Session = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      emotionData: [],
      questions: []
    };
    
    setCurrentSession(newSession);
    
    // Start emotion recording if not already started
    if (!isRecording) {
      setIsRecording(true);
    }
    
    console.log('Session started:', newSession.id);
  }, [currentSession, isRecording]);
  
  const endSession = useCallback(async (): Promise<string> => {
    if (!currentSession) {
      throw new Error('No active session to end');
    }
    
    // Update session end time
    const endedSession: Session = {
      ...currentSession,
      endTime: Date.now()
    };
    
    // Update session history
    setSessionHistory(prev => [...prev, endedSession]);
    
    // Clear current session
    setCurrentSession(null);
    
    // Stop emotion recording
    if (isRecording) {
      setIsRecording(false);
    }
    
    console.log('Session ended:', endedSession.id);
    
    return endedSession.id;
  }, [currentSession, isRecording]);
  
  // Question and response handling
  const askQuestion = useCallback((question: string) => {
    if (!currentSession) throw new Error('No active session');
    
    const questionObj = {
      id: `q_${Date.now()}`,
      text: question,
      timestamp: Date.now(),
      emotionAtQuestion: currentEmotion || undefined
    };
    
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        questions: [...prev.questions, questionObj]
      };
    });
    
    console.log('Question added:', questionObj.id);
    
    return questionObj.id;
  }, [currentSession, currentEmotion]);
  
  const recordResponse = useCallback((questionId: string, response: string) => {
    if (!currentSession) throw new Error('No active session');
    
    setCurrentSession(prev => {
      if (!prev) return null;
      
      // Find question and update response
      const updatedQuestions = prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            response,
            responseTime: Date.now(),
            emotionAtResponse: currentEmotion || undefined
          };
        }
        return q;
      });
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
    
    console.log('Response recorded for question:', questionId);
  }, [currentSession, currentEmotion]);
  
  // Analysis methods
  const getRecommendedApproach = useCallback(() => {
    // Implement later: Generate recommendation based on emotional data
    return 'Based on emotional response analysis, a direct but empathetic approach is recommended.';
  }, []);
  
  const getEmotionalInsight = useCallback(() => {
    // Implement later: Generate emotional insights based on session data
    return 'Emotional response patterns indicate potential anxiety around certain topics.';
  }, []);
  
  // Face analysis methods (stubs for future implementation)
  const captureBaseline = useCallback((faceImage: string) => {
    setBaselineImage(faceImage);
    console.log('Baseline face image captured');
  }, []);
  
  const compareWithBaseline = useCallback(async (faceImage: string): Promise<number> => {
    // Implement later: Compare current face with baseline
    return 0.85; // Example confidence score
  }, []);
  
  // Data storage function (stub for future implementation)
  const storeInteractionData = useCallback((data: any) => {
    console.log('Storing interaction data:', data);
    // Implement API call to store data
  }, []);
  
  // Emotion detection control functions
  const startEmotionDetection = useCallback(() => {
    setIsRecording(true);
  }, []);
  
  const stopEmotionDetection = useCallback(() => {
    setIsRecording(false);
  }, []);
  
  // Voice analysis control functions
  const startVoiceAnalysis = useCallback(() => {
    console.log('Starting voice analysis in context');
    setIsListening(true);
  }, []);
  
  const stopVoiceAnalysis = useCallback(() => {
    // We'll keep the underlying processing active but just change the UI state
    console.log('Pausing voice analysis in context (microphone remains active)');
    setIsListening(false);
  }, []);
  
  // Process voice data from microphone
  const processVoiceInput = useCallback((audioData: Float32Array) => {
    // Process voice data even when not actively listening to maintain microphone connection
    // This prevents the mic from disconnecting between recording sessions
    
    // In a real implementation, this would analyze the audio data for speech patterns
    // Here we'll simulate the analysis for demonstration purposes
    
    // Calculate stress indicators from audio (simulated)
    const pitchVariation = Math.random() * 0.3 + 0.7; // 0.7-1.0 normalized
    const volumeLevel = Math.random() * 0.5 + 0.5; // 0.5-1.0 normalized
    const speakingSpeed = Math.random() * 30 + 120; // 120-150 wpm
    const patternIrregularities = Math.random() * 0.4; // 0-0.4 normalized
    
    // Calculate stress level from audio cues
    const stressFromAudio = 
      patternIrregularities * 100 + 
      (pitchVariation > 0.85 ? 20 : 0) + 
      (volumeLevel > 0.8 ? 15 : 0);
    
    // Create voice analysis result
    const voiceAnalysis: VoiceAnalysisResult = {
      stressLevel: Math.min(100, Math.max(0, stressFromAudio)),
      pitch: pitchVariation,
      volume: volumeLevel,
      speed: speakingSpeed,
      irregularities: patternIrregularities,
      confidence: 0.7 + Math.random() * 0.3,
      timestamp: Date.now()
    };
    
    setCurrentVoiceAnalysis(voiceAnalysis);
    setVoiceAnalysisHistory(prev => [...prev, voiceAnalysis]);
    
    // Update truth probability based on combined facial and voice analysis
    updateTruthProbability(currentEmotion, voiceAnalysis);
    
    // Analyze and update attachment style based on emotional patterns
    updateAttachmentStyle();
    
    // If in a session, update the session data
    if (currentSession) {
      // You would need to add voice data to your session structure
      // This would be an enhancement to the current Session interface
    }
  }, [isListening, currentEmotion, currentSession]);
  
  // Calculate truth probability based on emotion and voice analysis
  const updateTruthProbability = useCallback((emotion: EmotionResult | null, voice: VoiceAnalysisResult | null) => {
    if (!emotion || !voice) return;
    
    // Base truth probability starts at 75% (assuming generally truthful)
    let truthProb = 75;
    
    // Integrated analysis factors that might indicate deception:
    // 1. High stress levels in both face and voice
    // 2. Incongruence between facial emotions and voice tone
    // 3. Irregular speech patterns
    // 4. Microexpressions (mouth asymmetry, reduced eye contact, etc.)
    // 5. Vocal inconsistencies (pitch variations, volume inconsistencies)
    
    // Extract facial emotion scores
    const fearScore = emotion.scores?.fear || 0;
    const surpriseScore = emotion.scores?.surprise || 0;
    const disgustScore = emotion.scores?.disgust || 0;
    
    // Get facial microexpression indicators if available in the emotion data
    const facialData = emotion as any; // Cast to access potential extended properties
    
    // Microexpression indicators (if available in the emotion data)
    const eyeContact = facialData.facialMetrics?.eyeContact || 0.9; // Default to high if not available
    const mouthAsymmetry = facialData.facialMetrics?.mouthAsymmetry || 0.1; // Default to low if not available
    const blinkRate = facialData.facialMetrics?.blinkRate || 0.3; // Default to normal if not available
    const facialTension = facialData.facialMetrics?.facialTension || 0.2; // Default to low if not available
    const microExpressions = facialData.facialMetrics?.microExpressions || 0.2; // Default to low if not available
    
    // --- VOCAL INDICATORS ---
    // Stress indicators in voice
    const vocalStressWeight = 15;
    if (voice.stressLevel > 80) truthProb -= vocalStressWeight * 1.0;
    else if (voice.stressLevel > 60) truthProb -= vocalStressWeight * 0.7;
    else if (voice.stressLevel > 40) truthProb -= vocalStressWeight * 0.3;
    
    // Irregular speech patterns
    const irregularitiesWeight = 15;
    if (voice.irregularities > 0.4) truthProb -= irregularitiesWeight * 1.0;
    else if (voice.irregularities > 0.25) truthProb -= irregularitiesWeight * 0.7;
    else if (voice.irregularities > 0.15) truthProb -= irregularitiesWeight * 0.3;
    
    // Pitch variations (higher variations can indicate stress or deception)
    const pitchWeight = 10;
    if (voice.pitch > 0.85) truthProb -= pitchWeight * 1.0;
    else if (voice.pitch > 0.75) truthProb -= pitchWeight * 0.6;
    
    // --- FACIAL INDICATORS ---
    // Fear is a strong deception indicator
    const fearWeight = 15;
    if (fearScore > 0.5) truthProb -= fearWeight * 1.0;
    else if (fearScore > 0.3) truthProb -= fearWeight * 0.7;
    else if (fearScore > 0.2) truthProb -= fearWeight * 0.3;
    
    // Disgust can indicate deception
    const disgustWeight = 8;
    if (disgustScore > 0.4) truthProb -= disgustWeight * 1.0;
    else if (disgustScore > 0.2) truthProb -= disgustWeight * 0.5;
    
    // Surprise can indicate being caught off-guard
    const surpriseWeight = 5;
    if (surpriseScore > 0.6) truthProb -= surpriseWeight * 1.0;
    else if (surpriseScore > 0.4) truthProb -= surpriseWeight * 0.5;
    
    // --- MICROEXPRESSION INDICATORS ---
    // Reduced eye contact
    const eyeContactWeight = 20;
    if (eyeContact < 0.4) truthProb -= eyeContactWeight * 1.0;
    else if (eyeContact < 0.6) truthProb -= eyeContactWeight * 0.5;
    
    // Mouth asymmetry (strong indicator of deception)
    const mouthAsymmetryWeight = 25;
    if (mouthAsymmetry > 0.6) truthProb -= mouthAsymmetryWeight * 1.0;
    else if (mouthAsymmetry > 0.4) truthProb -= mouthAsymmetryWeight * 0.6;
    
    // Blink rate (increased blinking often indicates stress/deception)
    const blinkRateWeight = 10;
    if (blinkRate > 0.7) truthProb -= blinkRateWeight * 1.0;
    else if (blinkRate > 0.5) truthProb -= blinkRateWeight * 0.5;
    
    // Facial tension
    const facialTensionWeight = 12;
    if (facialTension > 0.7) truthProb -= facialTensionWeight * 1.0;
    else if (facialTension > 0.5) truthProb -= facialTensionWeight * 0.6;
    
    // Micro expressions (fleeting expressions that contradict primary expression)
    const microExpressionsWeight = 18;
    if (microExpressions > 0.6) truthProb -= microExpressionsWeight * 1.0;
    else if (microExpressions > 0.4) truthProb -= microExpressionsWeight * 0.6;
    
    // Add points for consistency and calmness
    truthProb += (emotion.dominant === 'neutral' ? 10 : 0); // Neutral expression
    truthProb += (voice.stressLevel < 30 ? 15 : 0); // Low vocal stress
    
    // Special case: sometimes people smile when lying (duping delight)
    if (emotion.dominant === 'happy' && voice.stressLevel > 60) {
      truthProb -= 25; // Significant deduction for potential duping delight
    }
    
    // Ensure the value stays within 0-100 range
    truthProb = Math.min(100, Math.max(0, truthProb));
    
    setTruthProbability(truthProb);
  }, []);
  
  // Analyze and update attachment style based on emotional patterns
  const updateAttachmentStyle = useCallback(() => {
    // Need at least a few emotional data points to determine attachment style
    if (emotionHistory.length < 3) return;
    
    // Get the last several emotion readings
    const recentEmotions = emotionHistory.slice(-10);
    
    // Calculate average scores for key emotions
    const avgFear = recentEmotions.reduce((sum, e) => sum + (e.scores?.fear || 0), 0) / recentEmotions.length;
    const avgAngry = recentEmotions.reduce((sum, e) => sum + (e.scores?.angry || 0), 0) / recentEmotions.length;
    const avgHappy = recentEmotions.reduce((sum, e) => sum + (e.scores?.happy || 0), 0) / recentEmotions.length;
    const avgNeutral = recentEmotions.reduce((sum, e) => sum + (e.scores?.neutral || 0), 0) / recentEmotions.length;
    const avgSad = recentEmotions.reduce((sum, e) => sum + (e.scores?.sad || 0), 0) / recentEmotions.length;
    
    // Calculate emotional stability (consistency across readings)
    const emotionalVariance = recentEmotions.reduce((variance, emotion) => {
      const dominant = emotion.dominant;
      // Calculate how different this reading is from the previous
      return variance + (dominant !== recentEmotions[0].dominant ? 1 : 0);
    }, 0) / recentEmotions.length;
    
    // Determine attachment style based on emotional patterns
    let newAttachmentStyle: AttachmentStyle | null = null;
    
    // Secure attachment: balanced emotions, lower anxiety markers
    if (avgNeutral > 0.4 && avgFear < 0.2 && emotionalVariance < 0.3) {
      newAttachmentStyle = 'secure';
    }
    // Anxious attachment: higher fear/sad, emotional volatility
    else if ((avgFear > 0.25 || avgSad > 0.3) && emotionalVariance > 0.4) {
      newAttachmentStyle = 'anxious';
    }
    // Avoidant attachment: high neutral, low emotional expression overall
    else if (avgNeutral > 0.6 && avgHappy < 0.15 && avgSad < 0.15 && avgFear < 0.1) {
      newAttachmentStyle = 'avoidant';
    }
    // Fearful attachment: high fear and anger, emotional dysregulation
    else if (avgFear > 0.3 && avgAngry > 0.25 && emotionalVariance > 0.5) {
      newAttachmentStyle = 'fearful';
    }
    // Default if no clear pattern has emerged yet
    else if (emotionHistory.length > 15) {
      // After sufficient data, default to secure if no concerning patterns
      newAttachmentStyle = 'secure';
    }
    
    // Update attachment style if it has changed or was previously null
    if (newAttachmentStyle && (attachmentStyle !== newAttachmentStyle || !attachmentStyle)) {
      setAttachmentStyle(newAttachmentStyle);
      console.log('Attachment style updated:', newAttachmentStyle);
      
      // Also update agentic mode based on attachment style
      if (newAttachmentStyle === 'secure' || newAttachmentStyle === 'avoidant') {
        setAgenticMode('analytical'); // More logical approach works better
      } else if (newAttachmentStyle === 'anxious') {
        setAgenticMode('emotional'); // Emotional approach works better
      } else if (newAttachmentStyle === 'fearful') {
        setAgenticMode('motivational'); // Motivational approach works better
      }
    }
  }, [emotionHistory, attachmentStyle]);
  
  const value = {
    currentEmotion,
    currentVoiceAnalysis,
    truthProbability,
    currentSession,
    emotionHistory,
    voiceAnalysisHistory,
    agenticMode,
    attachmentStyle,
    isRecording,
    isListening,
    startEmotionDetection,
    stopEmotionDetection,
    startVoiceAnalysis,
    stopVoiceAnalysis,
    processVoiceInput,
    startSession,
    endSession,
    askQuestion,
    recordResponse,
    getRecommendedApproach,
    getEmotionalInsight,
    captureBaseline,
    compareWithBaseline,
    storeInteractionData
  };
  
  return (
    <AgenticContext.Provider value={value}>
      {children}
    </AgenticContext.Provider>
  );
}

export default AgenticContext;
