import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import PuzzleCanvas from './PuzzleCanvas';

interface PuzzleModalProps {
  open: boolean;
  onClose: () => void;
  earnedPieces: number;
  totalPieces: number;
  isComplete: boolean;
  imageId?: string;
  imageOrder?: number;
  lessonName?: string;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({
  open,
  onClose,
  earnedPieces,
  totalPieces,
  isComplete,
  imageId,
  imageOrder,
  lessonName,
}) => {
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop, not the content
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          maxHeight: '90vh',
        },
      }}
      BackdropProps={{
        onClick: handleBackdropClick,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px 8px 0 0',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6" component="div">
          {lessonName ? `${lessonName} - Puzzle` : 'Puzzle Progress'}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '0 0 8px 8px',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '500px',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            {earnedPieces}/{totalPieces} pieces earned
          </Typography>
          {isComplete && (
            <Typography variant="body2" color="success.main" align="center" sx={{ mt: 1 }}>
              🎉 Puzzle Complete! 🎉
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <PuzzleCanvas
            earnedPieces={earnedPieces}
            totalPieces={totalPieces}
            isComplete={isComplete}
            imageId={imageId}
            imageOrder={imageOrder}
            size="large"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          {isComplete
            ? 'Congratulations! You\'ve completed this puzzle!'
            : 'Keep practicing to unlock more pieces and reveal the full image!'
          }
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default PuzzleModal;
