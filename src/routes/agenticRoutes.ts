import express from 'express';
import agenticService from '../services/agenticService';
import Session from '../models/Session';
import mongoose from 'mongoose';

const router = express.Router();

// Generate insights for a session
router.post('/insights/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sessionId format'
      });
    }
    
    // Check if session exists
    const sessionExists = await Session.findById(sessionId);
    if (!sessionExists) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Generate insights
    const insights = await agenticService.generateSessionInsights(sessionId);
    
    res.json({
      success: true,
      insights,
      sessionId
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
});

// Get attachment style for a user
router.get('/attachment/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }
    
    // Get all sessions for this user
    const sessions = await Session.find({ user: userId });
    
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sessions found for this user'
      });
    }
    
    // Get the latest session with attachment insights
    const sessionsWithAttachment = sessions
      .filter(session => session.attachmentInsights && session.attachmentInsights.primaryStyle)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    if (sessionsWithAttachment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attachment data available'
      });
    }
    
    const latestSession = sessionsWithAttachment[0];
    
    // Ensure attachmentInsights exists before accessing properties
    if (!latestSession.attachmentInsights) {
      return res.status(404).json({
        success: false,
        message: 'Attachment insights data is incomplete'
      });
    }
    
    res.json({
      success: true,
      attachmentStyle: latestSession.attachmentInsights.primaryStyle,
      confidence: latestSession.attachmentInsights.confidence,
      indicators: latestSession.attachmentInsights.indicators,
      lastUpdated: latestSession.updatedAt
    });
  } catch (error) {
    console.error('Error retrieving attachment style:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attachment style'
    });
  }
});

// Get emotion patterns for a session
router.get('/emotions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sessionId format'
      });
    }
    
    // Get session data
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    if (!session.emotionData || session.emotionData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No emotion data available for this session'
      });
    }
    
    // Process emotion data to find patterns
    const emotionCounts: {[key: string]: number} = {};
    session.emotionData.forEach((data: any) => {
      const dominant = data.dominant || 'unknown';
      emotionCounts[dominant] = (emotionCounts[dominant] || 0) + 1;
    });
    
    const total = session.emotionData.length;
    const emotionPercentages = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      percentage: (count / total) * 100,
      count
    }));
    
    // Calculate transitions between emotions
    const transitions: {[key: string]: {[key: string]: number}} = {};
    
    for (let i = 1; i < session.emotionData.length; i++) {
      const prevEmotion = session.emotionData[i-1].dominant || 'unknown';
      const currEmotion = session.emotionData[i].dominant || 'unknown';
      
      if (!transitions[prevEmotion]) {
        transitions[prevEmotion] = {};
      }
      
      transitions[prevEmotion][currEmotion] = (transitions[prevEmotion][currEmotion] || 0) + 1;
    }
    
    res.json({
      success: true,
      sessionId,
      emotions: emotionPercentages,
      transitions,
      timespan: {
        start: session.emotionData[0].timestamp,
        end: session.emotionData[session.emotionData.length - 1].timestamp
      }
    });
  } catch (error) {
    console.error('Error analyzing emotion patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze emotion patterns'
    });
  }
});

// Get psychological profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }
    
    // Find all sessions for this user
    const sessions = await Session.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sessions found for this user'
      });
    }
    
    // Compile profile data
    const profileData = {
      sessionCount: sessions.length,
      lastSessionDate: sessions[0].createdAt,
      emotionalTrends: await aggregateEmotionalTrends(sessions),
      attachmentStyle: await getAttachmentStyle(sessions),
      communicationPatterns: await getCommunicationPatterns(sessions),
      suggestedApproach: await getSuggestedApproach(sessions)
    };
    
    res.json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Error retrieving psychological profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve psychological profile'
    });
  }
});

// Helper function to aggregate emotional trends
async function aggregateEmotionalTrends(sessions: any[]) {
  // Combine emotion data from all sessions
  const allEmotions: any[] = [];
  sessions.forEach(session => {
    if (session.emotionData && session.emotionData.length > 0) {
      allEmotions.push(...session.emotionData);
    }
  });
  
  if (allEmotions.length === 0) {
    return { dominant: 'unknown', confidence: 0 };
  }
  
  // Count emotions
  const emotionCounts: {[key: string]: number} = {};
  allEmotions.forEach(data => {
    emotionCounts[data.dominant] = (emotionCounts[data.dominant] || 0) + 1;
  });
  
  // Find most common emotion
  let dominantEmotion = '';
  let highestCount = 0;
  
  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    if (count > highestCount) {
      highestCount = count;
      dominantEmotion = emotion;
    }
  });
  
  return {
    dominant: dominantEmotion,
    confidence: highestCount / allEmotions.length,
    distribution: Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      percentage: (count / allEmotions.length) * 100
    }))
  };
}

// Helper function to get attachment style
async function getAttachmentStyle(sessions: any[]) {
  // Find the latest session with attachment insights
  const sessionsWithAttachment = sessions
    .filter(session => session.attachmentInsights && session.attachmentInsights.primaryStyle)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  if (sessionsWithAttachment.length === 0) {
    return { style: 'unknown', confidence: 0 };
  }
  
  const latestSession = sessionsWithAttachment[0];
  
  return {
    style: latestSession.attachmentInsights.primaryStyle,
    confidence: latestSession.attachmentInsights.confidence,
    indicators: latestSession.attachmentInsights.indicators
  };
}

// Helper function to analyze communication patterns
async function getCommunicationPatterns(sessions: any[]) {
  // Analyze transcript data across sessions
  const transcripts: any[] = [];
  sessions.forEach(session => {
    if (session.transcript && session.transcript.length > 0) {
      transcripts.push(...session.transcript);
    }
  });
  
  if (transcripts.length === 0) {
    return { patterns: [] };
  }
  
  // Extract some basic patterns (this would be more sophisticated in a real system)
  const avgResponseLength = transcripts.reduce((sum, t) => 
    sum + (t.text ? t.text.length : 0), 0) / transcripts.length;
  
  const patterns = [
    {
      name: 'Response Length',
      value: avgResponseLength > 100 ? 'Detailed' : avgResponseLength > 50 ? 'Moderate' : 'Brief',
      confidence: 0.7
    }
  ];
  
  return { patterns };
}

// Helper function to suggest communication approach
async function getSuggestedApproach(sessions: any[]) {
  // This would use more sophisticated logic in a real system
  // For now, base it on attachment style
  
  const attachmentStyle = await getAttachmentStyle(sessions);
  
  let approach = '';
  let description = '';
  
  switch (attachmentStyle.style) {
    case 'secure':
      approach = 'Direct and Balanced';
      description = 'Use clear communication with a balance of emotional and logical content';
      break;
    case 'anxious':
      approach = 'Reassuring and Consistent';
      description = 'Provide frequent reassurance and maintain predictable communication patterns';
      break;
    case 'avoidant':
      approach = 'Respectful of Space';
      description = 'Allow personal space and avoid emotional pressure; focus on logic and facts';
      break;
    case 'fearful':
      approach = 'Gentle and Gradual';
      description = 'Build trust gradually with gentle, non-threatening communication';
      break;
    default:
      approach = 'Balanced';
      description = 'Use a balanced approach until more data is available';
  }
  
  return {
    approach,
    description,
    confidence: attachmentStyle.confidence
  };
}

export default router;
