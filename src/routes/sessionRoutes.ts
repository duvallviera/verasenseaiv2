import express from 'express';

const router = express.Router();

// Mock sessions database (in a real app, this would be in a database)
const sessions: any[] = [];

// Middleware to verify JWT token
const verifyToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  // In a real app, you would verify the token with JWT
  // For now, we'll just continue
  next();
};

// Create a new session
router.post('/', verifyToken, (req, res) => {
  const { mode } = req.body;
  
  const newSession = {
    id: `session-${Date.now()}`,
    startTime: Date.now(),
    mode: mode || 'standard',
    userId: 'user123', // In a real app, this would come from the JWT token
    emotionData: [],
    questions: [],
    status: 'active'
  };
  
  // Add to mock database
  sessions.push(newSession);
  
  res.status(201).json({
    success: true,
    session: newSession
  });
});

// Get all sessions for a user
router.get('/', verifyToken, (req, res) => {
  const userId = 'user123'; // In a real app, this would come from the JWT token
  
  // Filter sessions by userId
  const userSessions = sessions.filter(s => s.userId === userId);
  
  res.json({
    success: true,
    sessions: userSessions
  });
});

// Get a specific session
router.get('/:sessionId', verifyToken, (req, res) => {
  const { sessionId } = req.params;
  
  // Find session by ID
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  res.json({
    success: true,
    session
  });
});

// End a session
router.put('/:sessionId/end', verifyToken, (req, res) => {
  const { sessionId } = req.params;
  
  // Find session by ID
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  // Update session
  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    endTime: Date.now(),
    status: 'completed'
  };
  
  res.json({
    success: true,
    session: sessions[sessionIndex]
  });
});

// Add a question to a session
router.post('/:sessionId/questions', verifyToken, (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body;
  
  // Find session by ID
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  // Check if session is active
  if (sessions[sessionIndex].status !== 'active') {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot add question to a completed session' 
    });
  }
  
  // Create new question
  const newQuestion = {
    id: `q-${Date.now()}`,
    text,
    timestamp: Date.now()
  };
  
  // Add question to session
  sessions[sessionIndex].questions.push(newQuestion);
  
  res.status(201).json({
    success: true,
    question: newQuestion
  });
});

// Add a response to a question
router.put('/:sessionId/questions/:questionId/response', verifyToken, (req, res) => {
  const { sessionId, questionId } = req.params;
  const { response, emotionData } = req.body;
  
  // Find session by ID
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  // Check if session is active
  if (sessions[sessionIndex].status !== 'active') {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot add response to a completed session' 
    });
  }
  
  // Find question by ID
  const questionIndex = sessions[sessionIndex].questions.findIndex((q: any) => q.id === questionId);
  
  if (questionIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Question not found' 
    });
  }
  
  // Update question with response
  sessions[sessionIndex].questions[questionIndex] = {
    ...sessions[sessionIndex].questions[questionIndex],
    response,
    responseTime: Date.now(),
    emotionAtResponse: emotionData
  };
  
  res.json({
    success: true,
    question: sessions[sessionIndex].questions[questionIndex]
  });
});

// Add emotion data to a session
router.post('/:sessionId/emotions', verifyToken, (req, res) => {
  const { sessionId } = req.params;
  const { emotionData } = req.body;
  
  // Find session by ID
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Session not found' 
    });
  }
  
  // Check if session is active
  if (sessions[sessionIndex].status !== 'active') {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot add emotion data to a completed session' 
    });
  }
  
  // Add emotion data to session
  sessions[sessionIndex].emotionData.push({
    ...emotionData,
    timestamp: Date.now()
  });
  
  res.status(201).json({
    success: true,
    emotionData: sessions[sessionIndex].emotionData[sessions[sessionIndex].emotionData.length - 1]
  });
});

export default router;
