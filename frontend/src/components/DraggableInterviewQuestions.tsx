import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse, 
  List, 
  FormControl,
  SvgIcon
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SendIcon from '@mui/icons-material/Send';

interface DraggableInterviewQuestionsProps {
  initialPosition?: { x: number, y: number };
  onQuestionSubmit?: (question: string) => void;
}

const DraggableInterviewQuestions: React.FC<DraggableInterviewQuestionsProps> = ({ 
  initialPosition = { x: 611, y: 30 },
  onQuestionSubmit 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [question, setQuestion] = useState('');
  const [upcomingQuestions, setUpcomingQuestions] = useState<string[]>([]);
  const [position, setPosition] = useState(initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Handle minimizing the panel
  const handleMinimize = () => {
    setIsOpen(!isOpen);
  };

  // Handle question text change
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  // Handle question submission
  const handleSubmitQuestion = () => {
    if (question.trim()) {
      console.log('Submitting question from DraggableInterviewQuestions:', question);
      if (onQuestionSubmit) {
        onQuestionSubmit(question);
        console.log('Question submitted via onQuestionSubmit');
      } else {
        console.warn('No onQuestionSubmit handler provided');
      }
      setQuestion(''); // Clear the input field after submission
    } else {
      console.log('Cannot submit empty question');
    }
  };

  // Handle keyboard events for submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && question.trim()) {
      handleSubmitQuestion();
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only process drag if clicking on the handle
    if (!(e.target as HTMLElement).closest('.draggable-handle')) return;
    
    e.preventDefault();
    
    // Get the initial mouse position and panel position
    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    
    // Get the panel's current position
    const panelRect = containerRef.current?.getBoundingClientRect();
    if (!panelRect) return;
    
    // Calculate the offset from mouse to panel corner
    const offsetX = initialMouseX - panelRect.left;
    const offsetY = initialMouseY - panelRect.top;
    
    // Set dragging state
    isDraggingRef.current = true;
    
    // Function to handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      // Calculate new position based on mouse position minus the initial offset
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      // Ensure the panel stays within viewport bounds
      const maxX = window.innerWidth - panelRect.width;
      const maxY = window.innerHeight - panelRect.height;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      // Update the component's position
      setPosition({ x: boundedX, y: boundedY });
    };
    
    // Function to handle mouse up
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      isDraggingRef.current = false;
    };
    
    // Add event listeners for drag and drop
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box 
      ref={containerRef}
      className="draggable-container MuiBox-root css-irncn9" 
      id="question-input-container"
      style={{
        position: 'fixed',
        inset: `${position.y}px auto auto ${position.x}px`,
        transform: 'none',
        transition: isDraggingRef.current ? 'none' : '0.3s'
      }}
      onMouseDown={handleMouseDown}
    >
      <Box className="MuiBox-root css-1skt5fd">
        <Box className="draggable-handle MuiBox-root css-hip6rv">
          <Box className="MuiBox-root css-70qvj9">
            <DragIndicatorIcon className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-8ctiju-MuiSvgIcon-root" />
            <Typography variant="subtitle2" className="MuiTypography-root MuiTypography-subtitle2 css-1iej7du-MuiTypography-root">
              Interview Questions
            </Typography>
          </Box>
          <Box className="MuiBox-root css-0">
            <IconButton
              size="small"
              onClick={handleMinimize}
              className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeSmall css-1oofjc3-MuiButtonBase-root-MuiIconButton-root"
              tabIndex={0}
              type="button"
            >
              <MinimizeIcon className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall css-ptiqhd-MuiSvgIcon-root" />
              <span className="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"></span>
            </IconButton>
          </Box>
        </Box>
        
        <Collapse 
          in={isOpen} 
          className="MuiCollapse-root MuiCollapse-vertical MuiCollapse-hidden css-bz4dnt-MuiCollapse-root"
          style={{ minHeight: '0px' }}
        >
          <div className="MuiCollapse-wrapper MuiCollapse-vertical css-smkl36-MuiCollapse-wrapper">
            <div className="MuiCollapse-wrapperInner MuiCollapse-vertical css-9l5vo-MuiCollapse-wrapperInner">
              <Box className="MuiBox-root css-15077r4">
                <Typography variant="caption" className="MuiTypography-root MuiTypography-caption css-vnvqzo-MuiTypography-root">
                  Upcoming Questions:
                </Typography>
                <List dense className="MuiList-root MuiList-dense css-1mk9mw3-MuiList-root">
                  {upcomingQuestions.map((q, index) => (
                    <li key={index}>{q}</li>
                  ))}
                </List>
              </Box>
            </div>
          </div>
        </Collapse>
        
        <Box className="MuiBox-root css-1601d32"></Box>
        
        <Box className="MuiBox-root css-70qvj9">
          <FormControl className="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root css-5qpxh2-MuiFormControl-root-MuiTextField-root">
            <div className="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary MuiInputBase-fullWidth MuiInputBase-formControl css-acumps-MuiInputBase-root-MuiOutlinedInput-root">
              <input 
                aria-invalid="false" 
                id=":r11:" 
                placeholder="Type your question here..." 
                type="text" 
                className="MuiInputBase-input MuiOutlinedInput-input css-6zssa0-MuiInputBase-input-MuiOutlinedInput-input" 
                value={question}
                onChange={handleQuestionChange}
                onKeyPress={handleKeyPress}
              />
              <fieldset aria-hidden="true" className="MuiOutlinedInput-notchedOutline css-9425fu-MuiOutlinedInput-notchedOutline">
                <legend className="css-ihdtdm"><span className="notranslate">​</span></legend>
              </fieldset>
            </div>
          </FormControl>
          <IconButton
            color="primary"
            onClick={handleSubmitQuestion}
            disabled={!question.trim()}
            style={{
              backgroundColor: question.trim() ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
              marginLeft: '8px',
              borderRadius: '50%',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              minWidth: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SendIcon style={{ fontSize: '20px' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DraggableInterviewQuestions;
