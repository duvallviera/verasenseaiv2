import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import agenticService, { AgenticInsight, AttachmentStyle } from '../services/agenticService';
import { useAuth } from './AuthContext';

interface AgenticInsightsContextType {
  insights: AgenticInsight[];
  loadingInsights: boolean;
  attachmentStyle: AttachmentStyle;
  fetchInsights: (sessionId: string) => Promise<void>;
  getUserAttachmentStyle: (userId?: string) => Promise<AttachmentStyle>;
  getEmotionPatterns: (sessionId: string) => Promise<any>;
  analyzePsychologicalProfile: (userId?: string) => Promise<any>;
  analyzeText: (text: string) => Promise<{ style: AttachmentStyle; confidence: number }>;
  getRecommendedApproach: (userId?: string) => Promise<any>;
  getAttachmentStyleInfo: (style?: AttachmentStyle) => {
    label: string;
    color: string;
    description: string;
    icon: string;
  };
}

const AgenticInsightsContext = createContext<AgenticInsightsContextType | null>(null);

export const useAgenticInsights = () => {
  const context = useContext(AgenticInsightsContext);
  if (!context) {
    throw new Error('useAgenticInsights must be used within an AgenticInsightsProvider');
  }
  return context;
};

export const AgenticInsightsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [insights, setInsights] = useState<AgenticInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [attachmentStyle, setAttachmentStyle] = useState<AttachmentStyle>(AttachmentStyle.UNKNOWN);
  
  const { user } = useAuth();

  // Fetch session insights
  const fetchInsights = async (sessionId: string) => {
    if (!sessionId) return;
    
    setLoadingInsights(true);
    try {
      const sessionInsights = await agenticService.generateSessionInsights(sessionId);
      setInsights(sessionInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Get user attachment style
  const getUserAttachmentStyle = async (userId?: string) => {
    try {
      const targetUserId = userId || (user?.id ? user.id : '');
      if (!targetUserId) return AttachmentStyle.UNKNOWN;
      
      const attachmentData = await agenticService.getAttachmentStyle(targetUserId);
      const style = attachmentData.attachmentStyle as AttachmentStyle;
      
      // Cache the style in context state if it's for the current user
      if (!userId && user?.id) {
        setAttachmentStyle(style);
      }
      
      return style;
    } catch (error) {
      console.error('Error getting attachment style:', error);
      return AttachmentStyle.UNKNOWN;
    }
  };

  // Get emotion patterns for a session
  const getEmotionPatterns = async (sessionId: string) => {
    try {
      return await agenticService.getEmotionPatterns(sessionId);
    } catch (error) {
      console.error('Error getting emotion patterns:', error);
      return null;
    }
  };

  // Analyze psychological profile
  const analyzePsychologicalProfile = async (userId?: string) => {
    try {
      const targetUserId = userId || (user?.id ? user.id : '');
      if (!targetUserId) return null;
      
      return await agenticService.getPsychologicalProfile(targetUserId);
    } catch (error) {
      console.error('Error analyzing psychological profile:', error);
      return null;
    }
  };

  // Analyze text for psychological indicators
  const analyzeText = async (text: string) => {
    try {
      const userId = user?.id || '';
      const result = await agenticService.analyzeText(text, userId);
      return {
        style: result.style,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      return {
        style: AttachmentStyle.UNKNOWN,
        confidence: 0
      };
    }
  };

  // Get attachment style information for UI rendering
  const getAttachmentStyleInfo = (style?: AttachmentStyle) => {
    const targetStyle = style || attachmentStyle;
    
    const stylesInfo = {
      [AttachmentStyle.SECURE]: {
        label: 'Secure',
        color: '#10B981', // green
        description: 'Comfortable with intimacy and independence. Tends to be warm, loving, and emotionally available.',
        icon: 'SentimentSatisfiedAlt'
      },
      [AttachmentStyle.ANXIOUS]: {
        label: 'Anxious',
        color: '#F59E0B', // amber
        description: 'Seeks high levels of intimacy and approval. Tends to be overly dependent and fears rejection.',
        icon: 'Timer'
      },
      [AttachmentStyle.AVOIDANT]: {
        label: 'Avoidant',
        color: '#3B82F6', // blue
        description: 'Values independence and self-sufficiency. May have difficulty with emotional intimacy.',
        icon: 'Psychology'
      },
      [AttachmentStyle.FEARFUL]: {
        label: 'Fearful',
        color: '#EF4444', // red
        description: 'Uncomfortable with emotional closeness. Desires close relationships but has trust issues.',
        icon: 'Warning'
      },
      [AttachmentStyle.UNKNOWN]: {
        label: 'Analyzing',
        color: '#9CA3AF', // gray
        description: 'Insufficient data to determine attachment style.',
        icon: 'Psychology'
      }
    };
    
    return stylesInfo[targetStyle] || stylesInfo[AttachmentStyle.UNKNOWN];
  };

  // Get recommended approach based on attachment style
  const getRecommendedApproach = async (userId?: string) => {
    try {
      const style = await getUserAttachmentStyle(userId);
      
      // Return specific recommendations based on attachment style
      const recommendations = {
        [AttachmentStyle.SECURE]: [
          'Direct and straightforward communication',
          'Balance of task-focus and relationship-building',
          'Regular check-ins without micromanagement'
        ],
        [AttachmentStyle.ANXIOUS]: [
          'Clear, consistent communication',
          'Explicit reassurance and validation',
          'Predictable routines and expectations'
        ],
        [AttachmentStyle.AVOIDANT]: [
          'Respect for autonomy and space',
          'Task-focused rather than emotional discussions',
          'Written communication for complex topics'
        ],
        [AttachmentStyle.FEARFUL]: [
          'Gentle, non-confrontational approach',
          'Consistent reassurance without pressure',
          'Options rather than directives'
        ],
        [AttachmentStyle.UNKNOWN]: [
          'Balanced approach with mix of warmth and structure',
          'Clear expectations and regular feedback',
          'Observe responses and adjust accordingly'
        ]
      };
      
      return recommendations[style] || recommendations[AttachmentStyle.UNKNOWN];
    } catch (error) {
      console.error('Error getting recommended approach:', error);
      return [];
    }
  };

  // Load current user's attachment style on mount
  useEffect(() => {
    if (user?.id) {
      getUserAttachmentStyle();
    }
  }, [user?.id]);

  const value = {
    insights,
    loadingInsights,
    attachmentStyle,
    fetchInsights,
    getUserAttachmentStyle,
    getEmotionPatterns,
    analyzePsychologicalProfile,
    analyzeText,
    getRecommendedApproach,
    getAttachmentStyleInfo
  };

  return (
    <AgenticInsightsContext.Provider value={value}>
      {children}
    </AgenticInsightsContext.Provider>
  );
};

export default AgenticInsightsContext;
