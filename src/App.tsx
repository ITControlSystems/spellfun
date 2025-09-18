import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsModal from './components/SettingsModal';
import { indexedDBService } from './services/IndexedDBService';
import { voiceService } from './services/VoiceService';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import LessonPractice from './components/LessonPractice';
import PuzzleGallery from './components/PuzzleGallery';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceId, setVoiceId] = useState<string>(() => localStorage.getItem('ttsVoiceId') || 'en_US-hfc_female-medium');

  useEffect(() => {
    // Initialize IndexedDB when app starts
    indexedDBService.init().catch(console.error);
    
    // Initialize voice service with saved method
    const voiceMethod = localStorage.getItem('voiceMethod') || 'built-in';
    voiceService.setVoiceMethod(voiceMethod as 'built-in' | 'vits-web');
  }, []);

  useEffect(() => {
    localStorage.setItem('ttsVoiceId', voiceId);
  }, [voiceId]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App" style={{ margin: 0, padding: 0 }}>
          <IconButton 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 1100,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              }
            }}
            onClick={() => setSettingsOpen(true)} 
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton>
          <Routes>
            <Route path="/" element={<UserManagement />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/lesson/:lessonId/practice/:userId" element={<LessonPractice />} />
            <Route path="/secret-puzzle-gallery" element={<PuzzleGallery />} />
          </Routes>
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} value={voiceId} onChange={setVoiceId} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
