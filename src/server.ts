import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import analysisRoutes from './routes/analysisRoutes';
import embeddingRoutes from './routes/embeddingRoutes';
import agenticRoutes from './routes/agenticRoutes';
import './keepAlive'; // Import keep-alive service

// Load environment variables
dotenv.config();

// Initialize express app before connecting to DB to avoid crash on DB connection failure
const app = express();

// Attempt MongoDB connection
connectDB().catch(err => {
  console.error('Initial MongoDB connection failed, but server will continue:', err.message);
});

// Set APP_URL for keep-alive service if not already set
if (!process.env.APP_URL && process.env.HEROKU_APP_NAME) {
  process.env.APP_URL = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' })); // For handling image and audio data
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/embedding', embeddingRoutes);
app.use('/api/agentic', agenticRoutes);

// Root route for basic verification
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'VeriSense AI API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VeriSense AI API is running' });
});

// Version info route
app.get('/api/version', (req, res) => {
  res.status(200).json({
    version: '1.0.0',
    apiStatus: 'online',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

// Start server
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid port conflict
app.listen(PORT, () => {
  console.log(`VeriSense AI API server running on port ${PORT}`);
});

export default app;
