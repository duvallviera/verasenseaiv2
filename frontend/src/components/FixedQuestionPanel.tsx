import React from 'react';
import { Box, styled } from '@mui/material';
import QuestionPanel from './QuestionPanel';

// Create a wrapper component that ensures the QuestionPanel
// is positioned directly below the webcam with the same width
const FixedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: 0,
  marginBottom: theme.spacing(2),
  position: 'relative',
  zIndex: 999, // Higher z-index to ensure visibility
  display: 'block',
  left: 0,
  right: 0,
  boxSizing: 'border-box',
  '& > *': {
    width: '100% !important',
    position: 'relative !important',
    left: '0 !important',
    right: '0 !important',
    transform: 'none !important', // Prevent any transform positioning
    maxWidth: '100% !important'
  }
}));

interface FixedQuestionPanelProps {
  isRecording?: boolean;
  mode?: 'calibration' | 'standard' | 'intensive';
  onQuestionAsked?: (question: string) => void;
  onResponseCaptured?: (text: string) => void;
}

const FixedQuestionPanel: React.FC<FixedQuestionPanelProps> = (props) => {
  return (
    <FixedContainer>
      <QuestionPanel {...props} />
    </FixedContainer>
  );
};

export default FixedQuestionPanel;
