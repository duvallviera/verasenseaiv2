// Simple utility to keep the Heroku dyno awake
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const PING_INTERVAL = 20 * 60 * 1000; // 20 minutes
const APP_URL = process.env.APP_URL || 'https://verisense-ai-backend.herokuapp.com';

/**
 * Sends a ping to the server to keep it awake
 */
async function pingServer() {
  try {
    const response = await axios.get(`${APP_URL}/health`);
    console.log(`[${new Date().toISOString()}] Server pinged successfully: ${response.data.status}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error pinging server:`, error);
  }
}

// Start the keep-alive process if this is the production environment
if (process.env.NODE_ENV === 'production') {
  console.log(`Starting keep-alive service for ${APP_URL}`);
  pingServer(); // Initial ping
  setInterval(pingServer, PING_INTERVAL);
}

export default pingServer;
