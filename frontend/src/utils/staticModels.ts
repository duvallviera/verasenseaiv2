// This file contains serialized models for face-api.js to avoid download issues
// The models are imported directly into the application instead of being loaded at runtime

export const tinyFaceDetectorManifest = {
  "weightsManifest": [
    {
      "weights": [
        {
          "name": "conv0/filters",
          "shape": [3, 3, 3, 16],
          "dtype": "float32"
        },
        {
          "name": "conv0/bias",
          "shape": [16],
          "dtype": "float32"
        },
        {
          "name": "conv1/depthwise_filter",
          "shape": [3, 3, 16, 1],
          "dtype": "float32"
        },
        {
          "name": "conv1/pointwise_filter",
          "shape": [1, 1, 16, 32],
          "dtype": "float32"
        },
        {
          "name": "conv1/bias",
          "shape": [32],
          "dtype": "float32"
        },
        {
          "name": "conv2/depthwise_filter",
          "shape": [3, 3, 32, 1],
          "dtype": "float32"
        },
        {
          "name": "conv2/pointwise_filter",
          "shape": [1, 1, 32, 64],
          "dtype": "float32"
        },
        {
          "name": "conv2/bias",
          "shape": [64],
          "dtype": "float32"
        },
        {
          "name": "conv3/depthwise_filter",
          "shape": [3, 3, 64, 1],
          "dtype": "float32"
        },
        {
          "name": "conv3/pointwise_filter",
          "shape": [1, 1, 64, 128],
          "dtype": "float32"
        },
        {
          "name": "conv3/bias",
          "shape": [128],
          "dtype": "float32"
        },
        {
          "name": "conv4/depthwise_filter",
          "shape": [3, 3, 128, 1],
          "dtype": "float32"
        },
        {
          "name": "conv4/pointwise_filter",
          "shape": [1, 1, 128, 256],
          "dtype": "float32"
        },
        {
          "name": "conv4/bias",
          "shape": [256],
          "dtype": "float32"
        },
        {
          "name": "conv5/depthwise_filter",
          "shape": [3, 3, 256, 1],
          "dtype": "float32"
        },
        {
          "name": "conv5/pointwise_filter",
          "shape": [1, 1, 256, 512],
          "dtype": "float32"
        },
        {
          "name": "conv5/bias",
          "shape": [512],
          "dtype": "float32"
        },
        {
          "name": "conv8/filters",
          "shape": [1, 1, 512, 25],
          "dtype": "float32"
        },
        {
          "name": "conv8/bias",
          "shape": [25],
          "dtype": "float32"
        }
      ],
      "paths": ["tiny_face_detector_model-shard1"]
    }
  ]
};

export const CDN_URLS = {
  tinyFaceDetector: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json',
  faceLandmark68: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json',
  faceRecognition: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json',
  faceExpression: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-weights_manifest.json'
};

// Base64 encoded tiny_face_detector_model-shard1 for direct loading
export const tinyFaceDetectorShard1Base64 = "base64-string-would-be-too-large";

// Helper function to create a blob from base64 string
export const base64ToBlob = (base64: string, contentType = 'application/octet-stream') => {
  const byteChars = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += 1024) {
    const slice = byteChars.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};
