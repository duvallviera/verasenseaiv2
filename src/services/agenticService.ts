import Session from '../models/Session';
import User from '../models/User';
import embeddingService from './embeddingService';

// Define our agentic insight types
export enum InsightCategory {
  EMOTION = 'emotion',
  VOICE = 'voice',
  FACIAL = 'facial',
  CONTENT = 'content',
  ATTACHMENT = 'attachment',
  DECEPTION = 'deception',
  PSYCHOLOGICAL = 'psychological'
}

export enum AttachmentStyle {
  SECURE = 'secure',
  ANXIOUS = 'anxious',
  AVOIDANT = 'avoidant',
  FEARFUL = 'fearful',
  UNKNOWN = 'unknown'
}

export interface AgenticInsight {
  category: string;
  description: string;
  confidence: number;
  timestamp?: number;
  metadata?: any;
}

export class AgenticService {
  // Generate insights for a session
  async generateSessionInsights(sessionId: string): Promise<AgenticInsight[]> {
    try {
      // Retrieve session data with user details
      const session = await Session.findById(sessionId).populate('user');
      if (!session) {
        throw new Error('Session not found');
      }

      // Combine different types of insights
      const emotionInsights = this.analyzeEmotions(session.emotionData || []);
      const voiceInsights = this.analyzeVoice(session.voiceAnalysisData || []);
      const contentInsights = this.analyzeContent(session.transcript || []);
      const attachmentInsights = await this.analyzeAttachmentStyle(session);
      
      // Store combined insights
      const allInsights = [
        ...emotionInsights,
        ...voiceInsights,
        ...contentInsights,
        ...attachmentInsights
      ];
      
      // Generate embeddings for insight storage and retrieval
      await this.generateSessionEmbeddings(session);
      
      // Update session with insights
      session.insights = allInsights;
      await session.save();
      
      return allInsights;
    } catch (error) {
      console.error('Error generating session insights:', error);
      throw error;
    }
  }
  
  // Analyze emotion data patterns
  private analyzeEmotions(emotionData: any[]): AgenticInsight[] {
    if (!emotionData || emotionData.length === 0) {
      return [];
    }
    
    const insights: AgenticInsight[] = [];
    
    try {
      // Count dominant emotions
      const emotionCounts: {[key: string]: number} = {};
      emotionData.forEach(data => {
        emotionCounts[data.dominant] = (emotionCounts[data.dominant] || 0) + 1;
      });
      
      // Find most frequent emotion
      let mostFrequentEmotion = '';
      let highestCount = 0;
      
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostFrequentEmotion = emotion;
        }
      });
      
      if (mostFrequentEmotion) {
        insights.push({
          category: InsightCategory.EMOTION,
          description: `Dominant emotion throughout session: ${mostFrequentEmotion}`,
          confidence: highestCount / emotionData.length
        });
      }
      
      // Detect emotional volatility
      const emotionChanges = emotionData
        .slice(1)
        .reduce((changes, data, index) => {
          return changes + (data.dominant !== emotionData[index].dominant ? 1 : 0);
        }, 0);
      
      const volatilityRate = emotionChanges / (emotionData.length - 1);
      
      if (volatilityRate > 0.3) {
        insights.push({
          category: InsightCategory.EMOTION,
          description: 'High emotional volatility detected',
          confidence: Math.min(volatilityRate, 0.9)
        });
      } else if (volatilityRate < 0.1) {
        insights.push({
          category: InsightCategory.EMOTION,
          description: 'Very stable emotional state throughout session',
          confidence: 1 - volatilityRate
        });
      }
      
      // Check for stress patterns
      const stressPoints = emotionData.filter(data => 
        data.stressLevel === 'high' || data.stressLevel === 'very-high'
      );
      
      if (stressPoints.length > emotionData.length * 0.4) {
        insights.push({
          category: InsightCategory.EMOTION,
          description: 'High stress levels observed frequently',
          confidence: stressPoints.length / emotionData.length
        });
      }
    } catch (error) {
      console.error('Error analyzing emotions:', error);
    }
    
    return insights;
  }
  
  // Analyze voice characteristics
  private analyzeVoice(voiceData: any[]): AgenticInsight[] {
    if (!voiceData || voiceData.length === 0) {
      return [];
    }
    
    const insights: AgenticInsight[] = [];
    
    try {
      // Calculate average stress level
      const avgStressLevel = voiceData.reduce((sum, data) => 
        sum + data.stressLevel, 0) / voiceData.length;
      
      if (avgStressLevel > 70) {
        insights.push({
          category: InsightCategory.VOICE,
          description: 'Voice indicates significant stress throughout session',
          confidence: avgStressLevel / 100
        });
      } else if (avgStressLevel < 30) {
        insights.push({
          category: InsightCategory.VOICE,
          description: 'Voice indicates calm and measured responses',
          confidence: 1 - (avgStressLevel / 100)
        });
      }
      
      // Detect speech irregularities
      const irregularitySamples = voiceData.filter(data => data.irregularities > 3);
      if (irregularitySamples.length > voiceData.length * 0.3) {
        insights.push({
          category: InsightCategory.VOICE,
          description: 'Multiple speech irregularities detected, may indicate anxiety or deception',
          confidence: irregularitySamples.length / voiceData.length
        });
      }
      
      // Analyze pitch variations
      const pitchValues = voiceData.map(data => data.pitch);
      const avgPitch = pitchValues.reduce((sum, pitch) => sum + pitch, 0) / pitchValues.length;
      const pitchVariation = Math.sqrt(
        pitchValues.reduce((sum, pitch) => sum + Math.pow(pitch - avgPitch, 2), 0) / pitchValues.length
      );
      
      if (pitchVariation > 0.2) {
        insights.push({
          category: InsightCategory.VOICE,
          description: 'Significant vocal pitch variations observed, indicating emotional engagement',
          confidence: Math.min(pitchVariation, 0.9)
        });
      }
    } catch (error) {
      console.error('Error analyzing voice data:', error);
    }
    
    return insights;
  }
  
  // Analyze transcript content
  private analyzeContent(transcript: any[]): AgenticInsight[] {
    if (!transcript || transcript.length === 0) {
      return [];
    }
    
    const insights: AgenticInsight[] = [];
    
    try {
      // Count words that indicate uncertainty
      const uncertaintyWords = ['maybe', 'perhaps', 'possibly', 'not sure', 'i think', 'probably', 'i guess'];
      
      let uncertaintyCount = 0;
      let totalWords = 0;
      
      transcript.forEach(entry => {
        if (!entry.text) return;
        
        const words = entry.text.toLowerCase().split(/\s+/);
        totalWords += words.length;
        
        uncertaintyWords.forEach(term => {
          const regex = new RegExp(term, 'i');
          if (regex.test(entry.text)) {
            uncertaintyCount++;
          }
        });
      });
      
      if (uncertaintyCount > 5) {
        insights.push({
          category: InsightCategory.CONTENT,
          description: 'Language shows multiple signs of uncertainty',
          confidence: Math.min(uncertaintyCount / 10, 0.9)
        });
      }
      
      // Simple sentiment analysis
      const positiveWords = ['yes', 'good', 'great', 'definitely', 'absolutely', 'agree', 'happy', 'sure'];
      const negativeWords = ['no', 'not', 'never', 'bad', 'wrong', 'disagree', 'cannot', "can't", 'wouldn\'t'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      transcript.forEach(entry => {
        if (!entry.text) return;
        
        const words = entry.text.toLowerCase().split(/\s+/);
        
        words.forEach((word: string) => {
          if (positiveWords.includes(word)) positiveCount++;
          if (negativeWords.includes(word)) negativeCount++;
        });
      });
      
      const sentimentScore = totalWords > 0 
        ? (positiveCount - negativeCount) / totalWords
        : 0;
      
      if (sentimentScore > 0.1) {
        insights.push({
          category: InsightCategory.CONTENT,
          description: 'Overall positive sentiment detected in responses',
          confidence: Math.min(Math.abs(sentimentScore) * 5, 0.9)
        });
      } else if (sentimentScore < -0.1) {
        insights.push({
          category: InsightCategory.CONTENT,
          description: 'Overall negative sentiment detected in responses',
          confidence: Math.min(Math.abs(sentimentScore) * 5, 0.9)
        });
      }
    } catch (error) {
      console.error('Error analyzing transcript content:', error);
    }
    
    return insights;
  }
  
  // Analyze attachment style based on various indicators
  private async analyzeAttachmentStyle(session: any): Promise<AgenticInsight[]> {
    const insights: AgenticInsight[] = [];
    
    try {
      // We'd use a more sophisticated model in production
      // For now, we'll use simple heuristics based on emotion and voice data
      
      if (!session.emotionData || session.emotionData.length === 0) {
        return insights;
      }
      
      // Count emotion frequencies
      const emotionCounts: {[key: string]: number} = {};
      session.emotionData.forEach((data: any) => {
        emotionCounts[data.dominant] = (emotionCounts[data.dominant] || 0) + 1;
      });
      
      // Emotion-based attachment indicators
      let anxiousIndicators = (emotionCounts['fear'] || 0) + (emotionCounts['sad'] || 0);
      let avoidantIndicators = (emotionCounts['neutral'] || 0) * 2;
      let secureIndicators = (emotionCounts['happy'] || 0) * 1.5;
      let fearfulIndicators = (emotionCounts['fear'] || 0) * 1.5 + (emotionCounts['angry'] || 0);
      
      // Add voice-based indicators if available
      if (session.voiceAnalysisData && session.voiceAnalysisData.length > 0) {
        const avgStressLevel = session.voiceAnalysisData.reduce((sum: number, data: any) => 
          sum + data.stressLevel, 0) / session.voiceAnalysisData.length;
        
        // High stress often correlates with anxious or fearful styles
        if (avgStressLevel > 70) {
          anxiousIndicators += 3;
          fearfulIndicators += 2;
        } else if (avgStressLevel < 30) {
          secureIndicators += 3;
        }
      }
      
      // Determine most likely attachment style
      const styles = [
        { style: AttachmentStyle.ANXIOUS, score: anxiousIndicators },
        { style: AttachmentStyle.AVOIDANT, score: avoidantIndicators },
        { style: AttachmentStyle.SECURE, score: secureIndicators },
        { style: AttachmentStyle.FEARFUL, score: fearfulIndicators }
      ];
      
      // Sort by score
      styles.sort((a, b) => b.score - a.score);
      
      const totalScore = styles.reduce((sum, s) => sum + s.score, 0);
      const confidence = totalScore > 0 ? styles[0].score / totalScore : 0.5;
      
      // Add attachment style insight
      insights.push({
        category: InsightCategory.ATTACHMENT,
        description: `Attachment style appears to be ${styles[0].style}`,
        confidence: Math.min(confidence, 0.8)
      });
      
      // Update session's attachment insights
      session.attachmentInsights = {
        primaryStyle: styles[0].style,
        indicators: this.getAttachmentIndicators(styles[0].style),
        confidence: confidence
      };
      
      // If user exists, update their psychological profile
      if (session.user && session.user._id) {
        const user = await User.findById(session.user._id);
        if (user) {
          user.attachmentStyle = styles[0].style;
          
          // Initialize or update psychological profile
          if (!user.psychologicalProfile) {
            user.psychologicalProfile = {};
          }
          
          user.psychologicalProfile.attachmentData = {
            style: styles[0].style,
            confidence: confidence,
            lastUpdated: new Date()
          };
          
          await user.save();
        }
      }
    } catch (error) {
      console.error('Error analyzing attachment style:', error);
    }
    
    return insights;
  }
  
  // Get descriptive indicators for attachment styles
  private getAttachmentIndicators(style: string): string[] {
    switch (style) {
      case AttachmentStyle.SECURE:
        return [
          'Consistent emotional responses',
          'Low anxiety levels',
          'Comfortable with closeness',
          'Clear communication patterns'
        ];
      case AttachmentStyle.ANXIOUS:
        return [
          'Heightened emotional responses',
          'Fear of rejection or abandonment',
          'Seeks reassurance',
          'Hypervigilance to emotional cues'
        ];
      case AttachmentStyle.AVOIDANT:
        return [
          'Emotional detachment',
          'Preference for independence',
          'Suppression of negative emotions',
          'Discomfort with emotional intimacy'
        ];
      case AttachmentStyle.FEARFUL:
        return [
          'Approach-avoidance conflicts',
          'High emotional volatility',
          'Fear of rejection alongside fear of intimacy',
          'Inconsistent emotional responses'
        ];
      default:
        return ['Insufficient data to determine specific indicators'];
    }
  }
  
  // Generate and store embeddings for long-term learning
  private async generateSessionEmbeddings(session: any): Promise<void> {
    try {
      // Generate text embedding from transcript if available
      if (session.transcript && session.transcript.length > 0) {
        const fullText = session.transcript
          .map((t: any) => t.text)
          .join(' ');
          
        if (fullText.trim()) {
          const textEmbedding = await embeddingService.generateTextEmbedding(fullText);
          
          // Store the embedding
          await embeddingService.storeEmbedding(
            'text',
            session._id,
            textEmbedding,
            {
              type: 'session_transcript',
              sessionMode: session.mode,
              timestamp: new Date()
            }
          );
        }
      }
      
      // Generate combined session embedding (could combine multiple data sources)
      // This is more advanced and would be implemented in a production system
    } catch (error) {
      console.error('Error generating session embeddings:', error);
    }
  }
}

export default new AgenticService();
