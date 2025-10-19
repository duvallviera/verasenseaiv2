import * as faceapi from 'face-api.js';

// Function to initialize face-api.js models
export const initFaceApi = async (): Promise<boolean> => {
  try {
    console.log('Initializing face-api.js models...');

    // Use JSDelivr CDN which is more reliable for face-api models
    const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    console.log(`Loading models from: ${modelUrl}`);
    
    // Load all required models in sequence for better reliability
    await faceapi.nets.tinyFaceDetector.load(modelUrl);
    console.log('✅ Loaded tiny face detector model');
    
    await faceapi.nets.faceLandmark68Net.load(modelUrl);
    console.log('✅ Loaded face landmark model');
    
    await faceapi.nets.faceExpressionNet.load(modelUrl);
    console.log('✅ Loaded face expression model');
    
    await faceapi.nets.faceRecognitionNet.load(modelUrl);
    console.log('✅ Loaded face recognition model');
    
    console.log('🎉 All face-api.js models loaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error loading face-api.js models:', error);
    return false;
  }
};
