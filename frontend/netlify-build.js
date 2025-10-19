// This script sets up a minimal environment for Netlify build
const fs = require('fs');
const path = require('path');

console.log('Setting up Netlify build environment...');

// Create models directory for face-api.js
const modelsDir = path.join(__dirname, 'public/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('Created models directory');
}

// Create minimal model files to satisfy the build process
const modelFiles = [
  { name: 'face_expression_model-weights_manifest.json', content: '{}' },
  { name: 'face_landmark_68_model-weights_manifest.json', content: '{}' },
  { name: 'face_recognition_model-weights_manifest.json', content: '{}' },
  { name: 'tiny_face_detector_model-weights_manifest.json', content: '{}' }
];

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.content);
    console.log(`Created ${file.name}`);
  }
});

console.log('Netlify build environment setup complete!');
