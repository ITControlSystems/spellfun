import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface VirtualKeyboardProps {
  onKeyPress: (letter: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  disabled?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  disabled = false
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Real keyboard event handler
  const handleRealKeyPress = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    const key = event.key.toLowerCase();
    
    // Only handle letter keys
    if (key >= 'a' && key <= 'z') {
      event.preventDefault();
      onKeyPress(key.toUpperCase());
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      onBackspace();
    } else if (event.key === 'Enter' && onEnter) {
      event.preventDefault();
      onEnter();
    }
  }, [onKeyPress, onBackspace, onEnter, disabled]);

  // Add real keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleRealKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleRealKeyPress);
    };
  }, [handleRealKeyPress]);

  const handleKeyDown = (letter: string) => {
    if (disabled) return;
    setPressedKey(letter);
  };

  const handleKeyUp = (letter: string) => {
    if (disabled) return;
    setPressedKey(null);
    onKeyPress(letter);
  };

  const handleBackspaceDown = () => {
    if (disabled) return;
    setPressedKey('BACKSPACE');
  };

  const handleBackspaceUp = () => {
    if (disabled) return;
    setPressedKey(null);
    onBackspace();
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getKeyStyle = (letter: string) => ({
    minWidth: '32px',
    minHeight: '32px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: pressedKey === letter ? '#1976d2' : '#f5f5f5',
    color: pressedKey === letter ? 'white' : 'black',
    border: '1px solid #ccc',
    borderRadius: '4px',
    transition: 'all 0.1s ease',
    padding: '4px',
    '&:hover': {
      backgroundColor: pressedKey === letter ? '#1976d2' : '#e0e0e0',
    },
    '&:active': {
      backgroundColor: '#1976d2',
      color: 'white',
    },
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  });

  const getBackspaceStyle = () => ({
    minWidth: '60px',
    minHeight: '32px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: pressedKey === 'BACKSPACE' ? '#d32f2f' : '#f5f5f5',
    color: pressedKey === 'BACKSPACE' ? 'white' : 'black',
    border: '1px solid #ccc',
    borderRadius: '4px',
    transition: 'all 0.1s ease',
    padding: '4px',
    '&:hover': {
      backgroundColor: pressedKey === 'BACKSPACE' ? '#d32f2f' : '#e0e0e0',
    },
    '&:active': {
      backgroundColor: '#d32f2f',
      color: 'white',
    },
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      backgroundColor: '#fafafa',
      borderRadius: 1,
      border: '1px solid #e0e0e0'
    }}>
      <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}>
        Virtual Keyboard
      </Typography>
      
      {/* Letter keys in rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* Row 1: A-M */}
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          {letters.slice(0, 13).map((letter) => (
            <Button
              key={letter}
              variant="outlined"
              sx={getKeyStyle(letter)}
              onMouseDown={() => handleKeyDown(letter)}
              onMouseUp={() => handleKeyUp(letter)}
              onMouseLeave={() => setPressedKey(null)}
              disabled={disabled}
            >
              {letter}
            </Button>
          ))}
        </Box>
        
        {/* Row 2: N-Z */}
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          {letters.slice(13).map((letter) => (
            <Button
              key={letter}
              variant="outlined"
              sx={getKeyStyle(letter)}
              onMouseDown={() => handleKeyDown(letter)}
              onMouseUp={() => handleKeyUp(letter)}
              onMouseLeave={() => setPressedKey(null)}
              disabled={disabled}
            >
              {letter}
            </Button>
          ))}
        </Box>
        
        {/* Backspace and Enter keys */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
          <Button
            variant="outlined"
            sx={getBackspaceStyle()}
            onMouseDown={handleBackspaceDown}
            onMouseUp={handleBackspaceUp}
            onMouseLeave={() => setPressedKey(null)}
            disabled={disabled}
          >
            ⌫
          </Button>
          {onEnter && (
            <Button
              variant="outlined"
              sx={{
                minWidth: '60px',
                minHeight: '32px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: pressedKey === 'ENTER' ? '#4caf50' : '#f5f5f5',
                color: pressedKey === 'ENTER' ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                transition: 'all 0.1s ease',
                padding: '4px',
                '&:hover': {
                  backgroundColor: pressedKey === 'ENTER' ? '#4caf50' : '#e0e0e0',
                },
                '&:active': {
                  backgroundColor: '#4caf50',
                  color: 'white',
                },
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
              onMouseDown={() => {
                if (disabled) return;
                setPressedKey('ENTER');
              }}
              onMouseUp={() => {
                if (disabled) return;
                setPressedKey(null);
                onEnter();
              }}
              onMouseLeave={() => setPressedKey(null)}
              disabled={disabled}
            >
              ↵
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualKeyboard;
