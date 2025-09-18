import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PuzzleGallery: React.FC = () => {
  const navigate = useNavigate();

  // Generate array of puzzle image numbers (1-54 based on the file structure)
  const puzzleNumbers = Array.from({ length: 54 }, (_, i) => i + 1);
  
  // State to track which images failed to load
  const [failedImages, setFailedImages] = React.useState<Set<number>>(new Set());
  
  // State for enlarged image modal
  const [enlargedImageOpen, setEnlargedImageOpen] = React.useState(false);
  const [selectedPuzzleNumber, setSelectedPuzzleNumber] = React.useState<number | null>(null);
  
  const handleImageError = (puzzleNumber: number) => {
    setFailedImages(prev => new Set(prev).add(puzzleNumber));
  };

  const handlePuzzleClick = (puzzleNumber: number) => {
    setSelectedPuzzleNumber(puzzleNumber);
    setEnlargedImageOpen(true);
  };

  const handleCloseEnlargedImage = () => {
    setEnlargedImageOpen(false);
    setSelectedPuzzleNumber(null);
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Puzzle Gallery (Secret)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            All puzzle images un-hidden for testing and viewing
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(6, 1fr)',
          },
          gap: 3,
        }}
      >
        {puzzleNumbers
          .filter(puzzleNumber => !failedImages.has(puzzleNumber))
          .map((puzzleNumber) => (
            <Card 
              key={puzzleNumber}
              onClick={() => handlePuzzleClick(puzzleNumber)}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 6,
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={`/images/puzzle-${puzzleNumber.toString().padStart(2, '0')}.png`}
                alt={`Puzzle ${puzzleNumber}`}
                sx={{
                  objectFit: 'cover',
                  backgroundColor: 'grey.100',
                }}
                onError={() => handleImageError(puzzleNumber)}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="h6" component="h3" align="center">
                  Puzzle {puzzleNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Image: puzzle-{puzzleNumber.toString().padStart(2, '0')}.png
                </Typography>
              </CardContent>
            </Card>
          ))}
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {puzzleNumbers.length - failedImages.size} puzzle images loaded
          {failedImages.size > 0 && ` (${failedImages.size} failed to load)`}
        </Typography>
      </Box>

      {/* Enlarged Image Modal */}
      <Dialog
        open={enlargedImageOpen}
        onClose={handleCloseEnlargedImage}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            maxHeight: '90vh',
          },
        }}
        BackdropProps={{
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
            Puzzle {selectedPuzzleNumber}
          </Typography>
          <IconButton
            onClick={handleCloseEnlargedImage}
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
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          {selectedPuzzleNumber && (
            <Box
              component="img"
              src={`/images/puzzle-${selectedPuzzleNumber.toString().padStart(2, '0')}.png`}
              alt={`Puzzle ${selectedPuzzleNumber} - Enlarged`}
              sx={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 4,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Click outside or press Escape to close
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PuzzleGallery;
