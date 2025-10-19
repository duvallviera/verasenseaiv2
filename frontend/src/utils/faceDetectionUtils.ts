import * as faceapi from 'face-api.js';
import { CDN_URLS } from './staticModels';

// This utility handles model loading with better error handling and retries
export const loadFaceDetectionModels = async (): Promise<boolean> => {
  console.log('Starting face detection model loading...');
  
  // Check if models are already loaded
  if (
    faceapi.nets.tinyFaceDetector.isLoaded && 
    faceapi.nets.faceLandmark68Net.isLoaded && 
    faceapi.nets.faceExpressionNet.isLoaded
  ) {
    console.log('Face-api models are already loaded');
    return true;
  }
  
  try {
    // Use direct CDN URLs for each model to avoid redirect issues
    console.log('Loading face-api.js models from CDN...');
    
    // Load the models directly from the CDN URLs
    await faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URLS.tinyFaceDetector);
    console.log('✅ Successfully loaded tiny face detector model');
    
    await faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URLS.faceLandmark68);
    console.log('✅ Successfully loaded face landmark model');
    
    await faceapi.nets.faceExpressionNet.loadFromUri(CDN_URLS.faceExpression);
    console.log('✅ Successfully loaded face expression model');
    
    await faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URLS.faceRecognition);
    console.log('✅ Successfully loaded face recognition model');
    
    console.log('✅ All face-api models successfully loaded from CDN');
    return true;
  } catch (error) {
    console.error('❌ Failed to load face detection models from CDN:', error);
    
    // Fallback to local paths if CDN fails
    try {
      console.log('Attempting to load models from local paths...');
      
      const modelPaths = [
        '/models',
        './models',
        '../models',
      ];
      
      for (const modelPath of modelPaths) {
        try {
          console.log(`Trying path: ${modelPath}`);
          
          // Load all required models from this path
          await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
          await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
          await faceapi.nets.faceExpressionNet.loadFromUri(modelPath);
          await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
          
          console.log(`✅ All models loaded from ${modelPath}`);
          return true;
        } catch (pathError) {
          console.warn(`Failed with path ${modelPath}:`, pathError);
        }
      }
      
      throw new Error('All local paths failed');
    } catch (fallbackError) {
      console.error('❌ All model loading attempts failed:', fallbackError);
      return false;
    }
  }  
};

// Helper to get a face detection message for display
export const getFaceDetectionMessage = (
  isLoading: boolean, 
  modelsLoaded: boolean, 
  faceDetected: boolean
): { message: string; severity: 'success' | 'info' | 'warning' | 'error' } => {
  if (isLoading) {
    return { 
      message: 'Loading face detection models...', 
      severity: 'info' 
    };
  }
  
  if (!modelsLoaded) {
    return { 
      message: 'Failed to load face detection models. Please check if the model files exist in the public/models directory.', 
      severity: 'error' 
    };
  }
  
  if (!faceDetected) {
    return { 
      message: 'No face detected. Please position your face in the camera view.', 
      severity: 'warning' 
    };
  }
  
  return { 
    message: 'Face detected! Analysis in progress.', 
    severity: 'success' 
  };
};
