const fs = require('fs');
const path = require('path');

console.log('Starting copy-face-api-models script...');

// Define source and target directories
const sourceDir = path.join(__dirname, '../node_modules/face-api.js/weights');
const targetDir = path.join(__dirname, '../public/models');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all files from source to target
try {
  const modelFiles = fs.readdirSync(sourceDir);
  console.log(`Found ${modelFiles.length} model files in source directory`);
  
  let copiedCount = 0;
  
  modelFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Skip if the target file already exists and has the same size
    if (fs.existsSync(targetPath)) {
      const sourceStats = fs.statSync(sourcePath);
      const targetStats = fs.statSync(targetPath);
      
      if (sourceStats.size === targetStats.size) {
        console.log(`Skipping ${file} (already exists with same size)`);
        return;
      }
    }
    
    // Copy the file
    try {
      fs.copyFileSync(sourcePath, targetPath);
      copiedCount++;
      console.log(`Copied ${file}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err);
    }
  });
  
  console.log(`Successfully copied ${copiedCount} model files to ${targetDir}`);
} catch (err) {
  console.error('Error accessing source directory:', err);
  
  // If the source directory doesn't exist, try to find face-api.js models in node_modules
  console.log('Attempting to find face-api.js models in node_modules...');
  try {
    const nodeModulesDir = path.join(__dirname, '../node_modules');
    const findFaceApiDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          if (item === 'weights' && fs.existsSync(path.join(itemPath, 'tiny_face_detector_model-weights_manifest.json'))) {
            return itemPath;
          }
          
          // Don't go too deep to avoid long search
          if (dir.split(path.sep).length < nodeModulesDir.split(path.sep).length + 3) {
            const found = findFaceApiDir(itemPath);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    const foundDir = findFaceApiDir(nodeModulesDir);
    if (foundDir) {
      console.log(`Found face-api.js weights at: ${foundDir}`);
      
      // Copy files from found directory
      const modelFiles = fs.readdirSync(foundDir);
      let copiedCount = 0;
      
      modelFiles.forEach(file => {
        const sourcePath = path.join(foundDir, file);
        const targetPath = path.join(targetDir, file);
        
        try {
          fs.copyFileSync(sourcePath, targetPath);
          copiedCount++;
          console.log(`Copied ${file}`);
        } catch (err) {
          console.error(`Error copying ${file}:`, err);
        }
      });
      
      console.log(`Successfully copied ${copiedCount} model files to ${targetDir}`);
    } else {
      console.error('Could not find face-api.js weights directory');
    }
  } catch (findErr) {
    console.error('Error finding alternative model location:', findErr);
  }
}

// Verify the models are in place
try {
  const targetFiles = fs.readdirSync(targetDir);
  const requiredFiles = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
  ];
  
  const missingFiles = requiredFiles.filter(file => !targetFiles.includes(file));
  
  if (missingFiles.length > 0) {
    console.error('Missing required model files:', missingFiles);
    console.error('Face detection may not work correctly!');
  } else {
    console.log('All required model files are present. Face detection should work properly.');
  }
} catch (verifyErr) {
  console.error('Error verifying model files:', verifyErr);
}
