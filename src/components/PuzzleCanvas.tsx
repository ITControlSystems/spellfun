import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface PuzzleCanvasProps {
  earnedPieces: number;
  totalPieces: number;
  isComplete: boolean;
  imageId?: string; // Unique identifier for the image (deprecated, use imageOrder instead)
  imageOrder?: number; // Sequential order of the lesson (1-based)
  onClick?: () => void; // Optional click handler
  size?: 'small' | 'large'; // Size variant for different contexts
}

const PuzzleCanvas: React.FC<PuzzleCanvasProps> = ({ earnedPieces, totalPieces, isComplete, imageId, imageOrder, onClick, size = 'small' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = size === 'large' ? 600 : 300;
    const height = size === 'large' ? 400 : 200;
    canvas.width = width;
    canvas.height = height;

    // Calculate blur amount based on completion progress
    const blurAmount = Math.max(0, 20 - (earnedPieces / totalPieces) * 20);
    const grayscaleAmount = earnedPieces >= totalPieces ? 0 : 1;

    const selectImageIndex = (imageId?: string, imageOrder?: number): number => {
      // Prefer imageOrder for sequential assignment
      if (imageOrder !== undefined) {
        // Use sequential order (1-based), cycling through available images (1-54)
        return ((imageOrder - 1) % 54) + 1;
      }
      
      // Fallback to old random method for backward compatibility
      if (imageId) {
        // Use the provided imageId to select from pool (1-52)
        const hash = imageId.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return (Math.abs(hash) % 52) + 1; // 1-52
      }
      return 1; // Default to first image
    };

    const drawImage = () => {
      const imageIndex = selectImageIndex(imageId, imageOrder);
      const image = new Image();
      
      image.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw the image
        ctx.drawImage(image, 0, 0, width, height);
        
        // Apply blur effect
        if (blurAmount > 0) {
          ctx.filter = `blur(${blurAmount}px)`;
          ctx.drawImage(image, 0, 0, width, height);
          ctx.filter = 'none';
        }

        // Apply grayscale effect
        if (earnedPieces < totalPieces) {
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Convert to grayscale using luminance formula
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Mix original color with grayscale based on completion progress
            data[i] = r * (1 - grayscaleAmount) + gray * grayscaleAmount;     // Red
            data[i + 1] = g * (1 - grayscaleAmount) + gray * grayscaleAmount; // Green
            data[i + 2] = b * (1 - grayscaleAmount) + gray * grayscaleAmount; // Blue
          }

          ctx.putImageData(imageData, 0, 0);
        }
      };
      
      image.onerror = () => {
        // Fallback: draw a simple placeholder if image fails to load
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image Loading...', width / 2, height / 2);
      };
      
      // Try to load the image
      image.src = `/images/puzzle-${String(imageIndex).padStart(2, '0')}.png`;
    };

    drawImage();
  }, [earnedPieces, totalPieces, isComplete, imageId, imageOrder]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: size === 'large' ? 0 : 2 }}>
      <canvas
        ref={canvasRef}
        onClick={onClick}
        style={{
          border: '2px solid #ddd',
          borderRadius: '8px',
          height: 'auto',
          cursor: onClick ? 'pointer' : 'default',
          width: size === 'large' ? '100%' : 'auto',
          maxWidth: size === 'large' ? '600px' : '100%',
        }}
      />
    </Box>
  );
};

export default PuzzleCanvas;
