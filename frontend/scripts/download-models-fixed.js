const fs = require('fs');
const path = require('path');
const https = require('https');

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, '../public/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('Created models directory');
}

// Define the face-api.js models to download
const models = [
  {
    name: 'tiny_face_detector_model',
    files: [
      'tiny_face_detector_model-shard1',
      'tiny_face_detector_model-weights_manifest.json'
    ]
  },
  {
    name: 'face_landmark_68_model',
    files: [
      'face_landmark_68_model-shard1',
      'face_landmark_68_model-weights_manifest.json'
    ]
  },
  {
    name: 'face_recognition_model',
    files: [
      'face_recognition_model-shard1',
      'face_recognition_model-shard2',
      'face_recognition_model-weights_manifest.json'
    ]
  },
  {
    name: 'face_expression_model',
    files: [
      'face_expression_model-shard1',
      'face_expression_model-weights_manifest.json'
    ]
  }
];

// Base URL for the model files
const baseUrl = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights';

// Function to download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filePath}`);
    
    const file = fs.createWriteStream(filePath);
    
    const request = https.get(url, (response) => {
      // Check if the response is a redirect
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow the redirect
        console.log(`Following redirect to ${response.headers.location}`);
        file.close();
        fs.unlinkSync(filePath); // Delete the empty file
        
        // Download from the new location
        downloadFile(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Check if we got a successful response
      if (response.statusCode !== 200) {
        fs.unlinkSync(filePath); // Delete the empty file
        reject(new Error(`Failed to download ${url}. Status Code: ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          // Check if the file is not empty
          fs.stat(filePath, (err, stats) => {
            if (err) {
              reject(err);
              return;
            }
            
            if (stats.size === 0) {
              console.error(`Downloaded file is empty: ${filePath}`);
              fs.unlinkSync(filePath);
              reject(new Error(`Downloaded file is empty: ${filePath}`));
              return;
            }
            
            console.log(`Successfully downloaded ${url} (${stats.size} bytes)`);
            resolve();
          });
        });
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      fs.unlinkSync(filePath);
      reject(err);
    });
    
    request.end();
  });
}

// Main download function
async function downloadModels() {
  try {
    console.log('Starting download of face-api.js models...');
    
    for (const model of models) {
      console.log(`Processing model: ${model.name}`);
      
      for (const file of model.files) {
        const fileUrl = `${baseUrl}/${file}`;
        const filePath = path.join(modelsDir, `${file}`);
        
        // Skip if file already exists and is not empty
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            console.log(`File ${file} already exists with ${stats.size} bytes. Skipping.`);
            continue;
          } else {
            console.log(`File ${file} exists but is empty. Re-downloading.`);
            fs.unlinkSync(filePath);
          }
        }
        
        try {
          await downloadFile(fileUrl, filePath);
          console.log(`Downloaded ${file}`);
        } catch (error) {
          console.error(`Failed to download ${file}: ${error.message}`);
          
          // Try alternate URL from jsdelivr CDN
          const alternateUrl = `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/${file}`;
          console.log(`Trying alternate URL: ${alternateUrl}`);
          
          try {
            await downloadFile(alternateUrl, filePath);
            console.log(`Downloaded ${file} from alternate source`);
          } catch (alternateError) {
            console.error(`Failed to download from alternate source: ${alternateError.message}`);
            throw new Error(`Could not download ${file} from either source`);
          }
        }
      }
    }
    
    // Verify all files exist and have content
    let allFilesValid = true;
    for (const model of models) {
      for (const file of model.files) {
        const filePath = path.join(modelsDir, `${file}`);
        if (!fs.existsSync(filePath)) {
          console.error(`File ${file} does not exist after download attempts.`);
          allFilesValid = false;
          continue;
        }
        
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          console.error(`File ${file} exists but is empty (0 bytes).`);
          allFilesValid = false;
        } else {
          console.log(`Verified ${file}: ${stats.size} bytes`);
        }
      }
    }
    
    if (allFilesValid) {
      console.log('All model files downloaded and verified successfully!');
    } else {
      console.error('Some model files are missing or empty. Please run the script again.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

// Start the download process
downloadModels();
