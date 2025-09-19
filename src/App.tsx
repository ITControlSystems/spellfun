import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { indexedDBService } from './services/IndexedDBService';
import { voiceService } from './services/VoiceService';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import LessonPractice from './components/LessonPractice';
import PuzzleGallery from './components/PuzzleGallery';
import DownloadPage from './components/DownloadPage';
import './App.css';

// Capacitor imports
import { Capacitor } from '@capacitor/core';

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    console.log('Capacitor platform:', Capacitor.getPlatform());
    console.log('Capacitor is native:', Capacitor.isNativePlatform());
    
    // Add a small delay to ensure Capacitor is fully initialized
    const initializeApp = async () => {
      try {
        // Wait for Capacitor to be ready
        if (Capacitor.isNativePlatform()) {
          console.log('Waiting for Capacitor to initialize...');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Initialize IndexedDB when app starts
        await indexedDBService.init();
        console.log('IndexedDB initialized successfully');
        
        // Initialize voice service with saved method
        const voiceMethod = localStorage.getItem('voiceMethod') || 'built-in';
        voiceService.setVoiceMethod(voiceMethod as 'built-in' | 'vits-web');
        console.log('Voice service initialized with method:', voiceMethod);
        
        // Give voice service extra time to load voices in WebView
        if (Capacitor.isNativePlatform()) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('App initialization completed successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        // Don't let initialization errors crash the app
        setIsInitialized(true); // Still show the app even if initialization fails
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    localStorage.setItem('ttsVoiceId', voiceId);
  }, [voiceId]);

  // Show loading screen until app is initialized
  if (!isInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>🎮</div>
            <div>Loading SpellFun...</div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
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
              <Route path="/download" element={<DownloadPage />} />
            </Routes>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} value={voiceId} onChange={setVoiceId} />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
