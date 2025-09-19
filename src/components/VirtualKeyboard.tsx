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
    minWidth: '50px',
    minHeight: '50px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: pressedKey === letter ? '#1976d2' : '#f5f5f5',
    color: pressedKey === letter ? 'white' : 'black',
    border: '2px solid #ccc',
    borderRadius: '8px',
    transition: 'all 0.1s ease',
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
    minWidth: '80px',
    minHeight: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: pressedKey === 'BACKSPACE' ? '#d32f2f' : '#f5f5f5',
    color: pressedKey === 'BACKSPACE' ? 'white' : 'black',
    border: '2px solid #ccc',
    borderRadius: '8px',
    transition: 'all 0.1s ease',
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
      gap: 2,
      p: 2,
      backgroundColor: '#fafafa',
      borderRadius: 2,
      border: '1px solid #e0e0e0'
    }}>
      <Typography variant="h6" gutterBottom>
        Virtual Keyboard
      </Typography>
      
      {/* Letter keys in rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Row 1: A-M */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
          <Button
            variant="outlined"
            sx={getBackspaceStyle()}
            onMouseDown={handleBackspaceDown}
            onMouseUp={handleBackspaceUp}
            onMouseLeave={() => setPressedKey(null)}
            disabled={disabled}
          >
            ⌫ Backspace
          </Button>
          {onEnter && (
            <Button
              variant="outlined"
              sx={{
                minWidth: '80px',
                minHeight: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: pressedKey === 'ENTER' ? '#4caf50' : '#f5f5f5',
                color: pressedKey === 'ENTER' ? 'white' : 'black',
                border: '2px solid #ccc',
                borderRadius: '8px',
                transition: 'all 0.1s ease',
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
              ↵ Enter
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualKeyboard;
