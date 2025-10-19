import api from './api';

/**
 * Service for handling embedding operations in the VeriSenseAI application
 * This service integrates with the backend embedding API endpoints
 */
export const embeddingService = {
  // Process and store text embeddings
  createTextEmbedding: async (text: string, sessionId: string) => {
    try {
      const response = await api.post('/embedding/text', { text, sessionId });
      return response.data;
    } catch (error) {
      console.error('Error creating text embedding:', error);
      throw error;
    }
  },

  // Process and store voice embeddings
  createVoiceEmbedding: async (audioData: Float32Array, sessionId: string) => {
    try {
      // Convert Float32Array to regular array for JSON serialization
      const audioArray = Array.from(audioData);
      const response = await api.post('/embedding/voice', { audioData: audioArray, sessionId });
      return response.data;
    } catch (error) {
      console.error('Error creating voice embedding:', error);
      throw error;
    }
  },

  // Process and store face embeddings
  createFaceEmbedding: async (faceImage: string, userId: string) => {
    try {
      const response = await api.post('/embedding/face', { faceImage, userId });
      return response.data;
    } catch (error) {
      console.error('Error creating face embedding:', error);
      throw error;
    }
  },

  // Search for similar embeddings
  findSimilar: async (vector: number[], sourceType: string, limit = 10) => {
    try {
      const response = await api.post('/embedding/search', { vector, sourceType, limit });
      return response.data.results;
    } catch (error) {
      console.error('Error finding similar embeddings:', error);
      throw error;
    }
  }
};

export default embeddingService;
