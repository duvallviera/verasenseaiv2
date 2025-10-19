import api from './api';

/**
 * Interface for agentic insights
 */
export interface AgenticInsight {
  category: string;
  description: string;
  confidence: number;
  timestamp?: number;
  metadata?: any;
}

/**
 * Enum for attachment styles
 */
export enum AttachmentStyle {
  SECURE = 'secure',
  ANXIOUS = 'anxious',
  AVOIDANT = 'avoidant',
  FEARFUL = 'fearful',
  UNKNOWN = 'unknown'
}

/**
 * Service for agentic analysis operations in the VeriSenseAI application
 * This service integrates with the backend agentic API endpoints
 */
export const agenticService = {
  // Generate insights for a session
  generateSessionInsights: async (sessionId: string) => {
    try {
      const response = await api.post(`/agentic/insights/${sessionId}`);
      return response.data.insights as AgenticInsight[];
    } catch (error) {
      console.error('Error generating session insights:', error);
      throw error;
    }
  },

  // Get attachment style for a user
  getAttachmentStyle: async (userId: string) => {
    try {
      const response = await api.get(`/agentic/attachment/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting attachment style:', error);
      throw error;
    }
  },

  // Get emotion patterns for a session
  getEmotionPatterns: async (sessionId: string) => {
    try {
      const response = await api.get(`/agentic/emotions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting emotion patterns:', error);
      throw error;
    }
  },

  // Get psychological profile for a user
  getPsychologicalProfile: async (userId: string) => {
    try {
      const response = await api.get(`/agentic/profile/${userId}`);
      return response.data.profile;
    } catch (error) {
      console.error('Error getting psychological profile:', error);
      throw error;
    }
  },

  // Get recommended communication approach
  getRecommendedApproach: async (userId: string) => {
    try {
      // We need to call the function directly, not through 'this' since we're in an arrow function
      const profileData = await agenticService.getPsychologicalProfile(userId);
      return profileData.suggestedApproach;
    } catch (error) {
      console.error('Error getting recommended approach:', error);
      throw error;
    }
  },

  // Analyze text for psychological indicators
  analyzeText: async (text: string, userId: string, sessionId?: string) => {
    try {
      // This would be a more sophisticated endpoint in a production system
      // For now, we'll implement a simplified version based on keyword matching
      
      // Check for indicators of different attachment styles
      const anxiousWords = ['worried', 'concerned', 'afraid', 'need', 'upset', 'anxious'];
      const avoidantWords = ['fine', 'independent', 'space', 'alone', 'freedom', 'distant'];
      const secureWords = ['trust', 'comfortable', 'confident', 'balanced', 'open', 'share'];
      
      const lowerText = text.toLowerCase();
      
      let anxiousCount = 0;
      let avoidantCount = 0;
      let secureCount = 0;
      
      anxiousWords.forEach(word => {
        if (lowerText.includes(word)) anxiousCount++;
      });
      
      avoidantWords.forEach(word => {
        if (lowerText.includes(word)) avoidantCount++;
      });
      
      secureWords.forEach(word => {
        if (lowerText.includes(word)) secureCount++;
      });
      
      // Determine most likely style from this text
      let dominantStyle = AttachmentStyle.UNKNOWN;
      let confidence = 0.5;
      
      if (anxiousCount > avoidantCount && anxiousCount > secureCount) {
        dominantStyle = AttachmentStyle.ANXIOUS;
        confidence = 0.5 + (0.1 * anxiousCount);
      } else if (avoidantCount > anxiousCount && avoidantCount > secureCount) {
        dominantStyle = AttachmentStyle.AVOIDANT;
        confidence = 0.5 + (0.1 * avoidantCount);
      } else if (secureCount > anxiousCount && secureCount > avoidantCount) {
        dominantStyle = AttachmentStyle.SECURE;
        confidence = 0.5 + (0.1 * secureCount);
      }
      
      return {
        style: dominantStyle,
        confidence: Math.min(confidence, 0.9),
        indicators: {
          anxious: anxiousCount,
          avoidant: avoidantCount,
          secure: secureCount
        }
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }
};

export default agenticService;
