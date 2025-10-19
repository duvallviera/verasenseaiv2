import * as tf from '@tensorflow/tfjs-node';
import Embedding from '../models/Embedding';
import fs from 'fs';
import path from 'path';

export class EmbeddingService {
  private textModel: any;
  private faceModel: any;
  private modelPath: string;
  
  constructor() {
    this.modelPath = process.env.MODEL_PATH || './models';
    this.loadModels();
  }
  
  private async loadModels() {
    try {
      // In a production environment, you'd load actual pre-trained models
      // For development, we'll use basic embeddings
      
      console.log('Embedding service initialized');
      
      // Create models directory if it doesn't exist
      if (!fs.existsSync(this.modelPath)) {
        fs.mkdirSync(this.modelPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error initializing embedding service:', error);
    }
  }
  
  // Generate text embeddings
  async generateTextEmbedding(text: string) {
    try {
      // In a production system, this would use a pre-trained model
      // For now, we'll create a simple embedding
      
      // Simple word frequency based embedding (just for demonstration)
      const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      const uniqueWords = Array.from(new Set(words));
      
      // Create a 100-dimension vector (padded or truncated)
      const vector = new Array(100).fill(0);
      
      // Fill vector with word frequencies
      uniqueWords.slice(0, 100).forEach((word, index) => {
        const frequency = words.filter(w => w === word).length / words.length;
        vector[index] = frequency;
      });
      
      return vector;
    } catch (error) {
      console.error('Error generating text embedding:', error);
      throw new Error('Text embedding generation failed');
    }
  }
  
  // Generate face embeddings from base64 image
  async generateFaceEmbedding(faceImage: string) {
    try {
      // In a production system, this would use a pre-trained model
      // For development/demo purposes, we'll generate a placeholder embedding
      
      // Extract a simple hash from the image data to create a pseudo-embedding
      const base64Data = faceImage.split(',')[1] || faceImage;
      const hash = this.simpleHash(base64Data);
      
      // Create a 128-dimension vector (common for face embeddings)
      const vector = new Array(128).fill(0);
      
      // Populate with hash-derived values
      for (let i = 0; i < 128; i++) {
        // Use the hash to generate a deterministic but seemingly random value
        vector[i] = (Math.sin(hash * (i + 1)) + 1) / 2;
      }
      
      return vector;
    } catch (error) {
      console.error('Error generating face embedding:', error);
      throw new Error('Face embedding generation failed');
    }
  }
  
  // Generate voice embeddings from audio data
  async generateVoiceEmbedding(audioData: Float32Array) {
    try {
      // For development, we'll create a simple placeholder embedding
      
      // Create a 64-dimension vector
      const vector = new Array(64).fill(0);
      
      // Extract some simple audio features
      const samples = Array.from(audioData).slice(0, Math.min(audioData.length, 1000));
      
      // Calculate some basic audio features
      const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
      const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
      const energy = samples.reduce((sum, val) => sum + Math.pow(val, 2), 0) / samples.length;
      
      // Use these features to populate our vector
      vector[0] = mean;
      vector[1] = Math.sqrt(variance);
      vector[2] = energy;
      
      // Fill remaining positions with derived values
      for (let i = 3; i < 64; i++) {
        vector[i] = (Math.sin(i * mean * 100) + 1) / 2;
      }
      
      return vector;
    } catch (error) {
      console.error('Error generating voice embedding:', error);
      throw new Error('Voice embedding generation failed');
    }
  }
  
  // Store an embedding in the database
  async storeEmbedding(
    sourceType: string,
    sourceId: string,
    vector: number[],
    metadata: any = {}
  ) {
    try {
      const embedding = new Embedding({
        sourceType,
        sourceId,
        vector,
        dimension: vector.length,
        metadata
      });
      
      return await embedding.save();
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw new Error('Failed to store embedding');
    }
  }
  
  // Find similar embeddings using cosine similarity
  async findSimilarEmbeddings(vector: number[], sourceType: string, limit = 10) {
    try {
      // Get all embeddings of the specified source type
      const embeddings = await Embedding.find({ sourceType });
      
      // Calculate cosine similarity for each embedding
      const results = embeddings.map(embedding => {
        const similarity = this.cosineSimilarity(vector, embedding.vector);
        return {
          _id: embedding._id,
          sourceId: embedding.sourceId,
          sourceType: embedding.sourceType,
          metadata: embedding.metadata,
          score: similarity
        };
      });
      
      // Sort by similarity score (descending) and take top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding similar embeddings:', error);
      throw new Error('Similarity search failed');
    }
  }
  
  // Helper function: cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += Math.pow(a[i], 2);
      normB += Math.pow(b[i], 2);
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }
  
  // Simple hash function for deterministic vector generation
  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
}

export default new EmbeddingService();
