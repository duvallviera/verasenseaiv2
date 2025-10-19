import express from 'express';
import embeddingService from '../services/embeddingService';
import mongoose from 'mongoose';

const router = express.Router();

// Create a text embedding
router.post('/text', async (req, res) => {
  try {
    const { text, sessionId } = req.body;
    
    if (!text || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Text and sessionId are required'
      });
    }
    
    // Validate sessionId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sessionId format'
      });
    }
    
    // Generate embedding
    const embedding = await embeddingService.generateTextEmbedding(text);
    
    // Store embedding
    const result = await embeddingService.storeEmbedding(
      'text',
      sessionId,
      embedding,
      { type: 'session_text', timestamp: new Date() }
    );
    
    res.json({
      success: true,
      embeddingId: result._id,
      dimensions: embedding.length
    });
  } catch (error) {
    console.error('Error creating text embedding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create embedding'
    });
  }
});

// Create a face embedding
router.post('/face', async (req, res) => {
  try {
    const { faceImage, userId } = req.body;
    
    if (!faceImage || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Face image and userId are required'
      });
    }
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }
    
    // Generate embedding
    const embedding = await embeddingService.generateFaceEmbedding(faceImage);
    
    // Store embedding
    const result = await embeddingService.storeEmbedding(
      'face',
      userId,
      embedding,
      { type: 'user_face', timestamp: new Date() }
    );
    
    res.json({
      success: true,
      embeddingId: result._id,
      dimensions: embedding.length
    });
  } catch (error) {
    console.error('Error creating face embedding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create face embedding'
    });
  }
});

// Create a voice embedding
router.post('/voice', async (req, res) => {
  try {
    const { audioData, sessionId } = req.body;
    
    if (!audioData || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Audio data and sessionId are required'
      });
    }
    
    // Validate sessionId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sessionId format'
      });
    }
    
    // Convert audio data to Float32Array if it's not already
    const audioFloat32Array = Array.isArray(audioData) 
      ? new Float32Array(audioData) 
      : audioData;
    
    // Generate embedding
    const embedding = await embeddingService.generateVoiceEmbedding(audioFloat32Array);
    
    // Store embedding
    const result = await embeddingService.storeEmbedding(
      'voice',
      sessionId,
      embedding,
      { type: 'session_voice', timestamp: new Date() }
    );
    
    res.json({
      success: true,
      embeddingId: result._id,
      dimensions: embedding.length
    });
  } catch (error) {
    console.error('Error creating voice embedding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create voice embedding'
    });
  }
});

// Find similar embeddings
router.post('/search', async (req, res) => {
  try {
    const { vector, sourceType, limit = 10 } = req.body;
    
    if (!vector || !sourceType) {
      return res.status(400).json({
        success: false,
        message: 'Vector and sourceType are required'
      });
    }
    
    if (!Array.isArray(vector)) {
      return res.status(400).json({
        success: false,
        message: 'Vector must be an array of numbers'
      });
    }
    
    // Find similar embeddings
    const results = await embeddingService.findSimilarEmbeddings(
      vector,
      sourceType,
      limit
    );
    
    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching embeddings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search embeddings'
    });
  }
});

export default router;
