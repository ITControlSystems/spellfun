import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AndroidIcon from '@mui/icons-material/Android';
import InfoIcon from '@mui/icons-material/Info';

const DownloadPage: React.FC = () => {
  const handleDownload = () => {
    // Replace with your actual GitHub release URL
    const downloadUrl = 'https://github.com/yourusername/spellfun/releases/latest/download/spellfun-fire-kids.apk';
    window.open(downloadUrl, '_blank');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <AndroidIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Download SpellFun
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Get the Android app for the best experience
        </Typography>
      </Box>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
              SpellFun Fire Kids
            </Typography>
            <Chip label="Latest Version" color="primary" variant="outlined" />
          </Box>
          
          <Typography variant="body1" paragraph>
            A fun and educational spelling game designed for kids. Practice spelling with 
            interactive puzzles and engaging lessons.
          </Typography>

          <Box my={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ 
                py: 1.5, 
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 2
              }}
            >
              Download APK
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Alert severity="info" icon={<InfoIcon />} sx={{ textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Installation Instructions:</strong>
              <br />
              1. Download the APK file above
              <br />
              2. On your Android device, go to Settings → Security → Unknown Sources
              <br />
              3. Enable "Install from Unknown Sources" for your browser or file manager
              <br />
              4. Open the downloaded APK file and follow the installation prompts
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Requirements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Android 5.0 (API level 21) or higher
            <br />
            • 100MB available storage space
            <br />
            • Internet connection for voice features
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DownloadPage;
