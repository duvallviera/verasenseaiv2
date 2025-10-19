module.exports = {
  onPreBuild: ({ utils }) => {
    console.log('Creating mock model files for build...');
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Ensure models directory exists
      const modelsDir = path.join(__dirname, 'public/models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }
      
      // Create empty model files if they don't exist
      const modelFiles = [
        'face_expression_model-shard1',
        'face_expression_model-weights_manifest.json',
        'face_landmark_68_model-shard1',
        'face_landmark_68_model-weights_manifest.json',
        'face_recognition_model-shard1',
        'face_recognition_model-shard2',
        'face_recognition_model-weights_manifest.json',
        'tiny_face_detector_model-shard1',
        'tiny_face_detector_model-weights_manifest.json'
      ];
      
      modelFiles.forEach(file => {
        const filePath = path.join(modelsDir, file);
        if (!fs.existsSync(filePath)) {
          // For JSON files, create minimal valid JSON
          if (file.endsWith('.json')) {
            fs.writeFileSync(filePath, '{}');
          } else {
            // For binary files, create empty file
            fs.writeFileSync(filePath, '');
          }
          console.log(`Created placeholder for ${file}`);
        }
      });
      
      console.log('Mock model files created successfully');
    } catch (error) {
      console.error('Error setting up model files:', error);
      // Don't fail the build
    }
  }
};
