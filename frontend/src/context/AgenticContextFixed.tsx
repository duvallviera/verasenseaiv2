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
  currentSession: Session | null;
  emotionHistory: EmotionResult[];
  agenticMode: AgenticMode;
  attachmentStyle: AttachmentStyle | null;
  isRecording: boolean;

  // Methods for emotion detection
  startEmotionDetection: () => void;
  stopEmotionDetection: () => void;
  
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
  
  // State for sessions
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  
  // State for agentic framework
  const [agenticMode, setAgenticMode] = useState<AgenticMode>('analytical');
  const [attachmentStyle, setAttachmentStyle] = useState<AttachmentStyle | null>(null);
  const [baselineImage, setBaselineImage] = useState<string | null>(null);
  
  // Initialize with default emotion once
  useEffect(() => {
    if (!currentEmotion) {
      setCurrentEmotion(defaultEmotion);
      setEmotionHistory([defaultEmotion]);
    }
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
  
  const value = {
    currentEmotion,
    currentSession,
    emotionHistory,
    agenticMode,
    attachmentStyle,
    isRecording,
    startEmotionDetection,
    stopEmotionDetection,
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
