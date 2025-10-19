const fs = require('fs');
const path = require('path');

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, '../public/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Model URLs from face-api.js
const models = {
  'tiny_face_detector_model-weights_manifest.json': {
    modelTopology: 'tiny_face_detector_model.json',
    weightsManifest: [
      {
        paths: ['tiny_face_detector_model-shard1'],
        weights: []
      }
    ]
  },
  'face_landmark_68_model-weights_manifest.json': {
    modelTopology: 'face_landmark_68_model.json',
    weightsManifest: [
      {
        paths: ['face_landmark_68_model-shard1'],
        weights: []
      }
    ]
  },
  'face_expression_model-weights_manifest.json': {
    modelTopology: 'face_expression_model.json',
    weightsManifest: [
      {
        paths: ['face_expression_model-shard1'],
        weights: []
      }
    ]
  },
  'face_recognition_model-weights_manifest.json': {
    modelTopology: 'face_recognition_model.json',
    weightsManifest: [
      {
        paths: ['face_recognition_model-shard1', 'face_recognition_model-shard2'],
        weights: []
      }
    ]
  }
};

// Write manifest files
Object.entries(models).forEach(([filename, content]) => {
  const filePath = path.join(modelsDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`✅ Created ${filename}`);
});

console.log('🎉 All model manifest files created successfully!');
console.log('📁 Models directory:', modelsDir);