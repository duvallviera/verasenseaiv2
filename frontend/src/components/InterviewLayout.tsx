import React, { ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import InterviewQuestionsPanel from './InterviewQuestionsPanel';

// Create a specialized layout component for the interview interface
// This will ensure the webcam and question panel are properly positioned

const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'auto',
  position: 'relative',
}));

const WebcamContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const InterviewQuestionsPanelContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(2),
  zIndex: 15, // Higher z-index to ensure it appears above other elements if needed
}));

const QuestionPanelContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(2),
  zIndex: 10, // Ensure it appears above other elements
}));

const AdditionalContent = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  marginTop: theme.spacing(2),
}));

interface InterviewLayoutProps {
  webcam: ReactNode;
  questionPanel: ReactNode;
  onQuestionSubmit?: (question: string) => void;
  children?: ReactNode;
}

const InterviewLayout: React.FC<InterviewLayoutProps> = ({ 
  webcam, 
  questionPanel, 
  onQuestionSubmit,
  children 
}) => {
  return (
    <LayoutContainer>
      <WebcamContainer>
        {webcam}
      </WebcamContainer>
      
      <InterviewQuestionsPanelContainer>
        <InterviewQuestionsPanel onQuestionSubmit={onQuestionSubmit} />
      </InterviewQuestionsPanelContainer>
      
      <QuestionPanelContainer>
        {questionPanel}
      </QuestionPanelContainer>
      
      {children && (
        <AdditionalContent>
          {children}
        </AdditionalContent>
      )}
    </LayoutContainer>
  );
};

export default InterviewLayout;
