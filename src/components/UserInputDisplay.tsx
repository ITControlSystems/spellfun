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
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: disabled ? '#f5f5f5' : 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        textAlign: 'center',
        justifyContent: 'center',
        mb: 2,
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
          variant="body1"
          sx={{
            letterSpacing: '2px',
            fontFamily: 'monospace',
            color: disabled ? 'text.secondary' : 'text.primary',
            fontSize: '16px'
          }}
        >
          {userInput}
        </Typography>
      )}
    </Box>
  );
};

export default UserInputDisplay;
