import React from 'react';
import { Box } from '@mui/material';
import WebcamCapture from './WebcamCapture';
import InterviewQuestionsPanel from './InterviewQuestionsPanel';
import { useAgentic } from '../context/AgenticContext';

interface WebcamWithQuestionsProps {
  width?: number;
  height?: number;
}

const WebcamWithQuestions: React.FC<WebcamWithQuestionsProps> = ({ 
  width, 
  height 
}) => {
  const { askQuestion } = useAgentic();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Interview Questions Panel positioned ABOVE the webcam */}
      <Box sx={{ mb: 2 }}>
        <InterviewQuestionsPanel onQuestionSubmit={(question: string) => {
          // Handle question submission using askQuestion from AgenticContext
          askQuestion(question);
        }} />
      </Box>
      
      {/* Webcam below the question panel */}
      <WebcamCapture width={width} height={height} />
    </Box>
  );
};

export default WebcamWithQuestions;
