import React from 'react';
import { Box, Typography } from '@mui/material';

interface UserInputDisplayProps {
  userInput: string;
  disabled?: boolean;
}

const UserInputDisplay: React.FC<UserInputDisplayProps> = ({
  userInput,
  disabled = false
}) => {
  return (
    <Box
      sx={{
        minHeight: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        border: '2px solid #ccc',
        borderRadius: '4px',
        backgroundColor: disabled ? '#f5f5f5' : 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textAlign: 'center',
        justifyContent: 'center',
        mb: 3,
        position: 'relative',
      }}
    >
      {userInput.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ 
            fontStyle: 'italic',
            opacity: 0.7
          }}
        >
          Your typed letters will appear here...
        </Typography>
      ) : (
        <Typography
          variant="h6"
          sx={{
            letterSpacing: '3px',
            fontFamily: 'monospace',
            color: disabled ? 'text.secondary' : 'text.primary'
          }}
        >
          {userInput}
        </Typography>
      )}
    </Box>
  );
};

export default UserInputDisplay;
