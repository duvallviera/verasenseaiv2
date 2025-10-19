const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('Starting face-api.js model download process...');

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, '../public/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('Created models directory at', modelsDir);
}

// Define the face-api.js models to download
const modelFiles = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

// Base URL for the model files
const baseUrl = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights';

// Function to download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filePath}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url} with status code ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          console.log(`Successfully downloaded ${url}`);
          resolve();
        });
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Main download function
async function downloadModels() {
  let successCount = 0;
  let failCount = 0;
  
  // Clear any existing model files first
  console.log('Clearing any existing model files...');
  try {
    const existingFiles = fs.readdirSync(modelsDir);
    for (const file of existingFiles) {
      fs.unlinkSync(path.join(modelsDir, file));
      console.log(`Deleted ${file}`);
    }
  } catch (err) {
    console.error('Error clearing existing files:', err);
  }
  
  // Download each model file
  for (const file of modelFiles) {
    const url = `${baseUrl}/${file}`;
    const filePath = path.join(modelsDir, file);
    
    try {
      await downloadFile(url, filePath);
      
      // Verify file was downloaded and has content
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        console.log(`Verified ${file}: ${stats.size} bytes`);
        successCount++;
      } else {
        console.error(`Downloaded ${file} but file is empty!`);
        failCount++;
      }
    } catch (err) {
      console.error(`Failed to download ${file}:`, err.message);
      failCount++;
    }
  }
  
  console.log(`\nDownload complete! Successfully downloaded ${successCount}/${modelFiles.length} files.`);
  
  if (failCount > 0) {
    console.error(`Failed to download ${failCount} files.`);
    console.error('Face detection may not work correctly!');
  } else {
    console.log('All model files were downloaded successfully. Face detection should now work properly.');
  }
}

// Start the download process
downloadModels().catch(err => {
  console.error('An error occurred during the download process:', err);
});
