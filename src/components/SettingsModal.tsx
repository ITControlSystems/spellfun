import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, LinearProgress, Box, Typography, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import { voiceService, VoiceMethod } from '../services/VoiceService';
import { indexedDBService } from '../services/IndexedDBService';

const AVAILABLE_VOICES = [
  'en_US-hfc_female-medium',
  'en_US-hfc_male-medium',
];

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (voiceId: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, value, onChange }) => {
  const [downloading, setDownloading] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [voiceMethod, setVoiceMethod] = useState<string>(() => 
    localStorage.getItem('voiceMethod') || 'vits-web'
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(() => 
    localStorage.getItem('ttsVoiceId') || 'en_US-hfc_female-medium'
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const cacheSelectedVoice = async () => {
    if (voiceMethod === 'built-in') return; // No caching needed for built-in
    
    setDownloading(true);
    try {
      await voiceService.init(selectedVoice, (p) => {
        const pct = p.total ? Math.round((p.loaded * 100) / p.total) : 0;
        setProgressText(`Downloading voice… ${pct}%`);
      });
    } finally {
      setDownloading(false);
      setProgressText('');
    }
  };

  const handleVoiceMethodChange = (method: string) => {
    setVoiceMethod(method);
    localStorage.setItem('voiceMethod', method);
    // Update the voice service immediately
    voiceService.setVoiceMethod(method as VoiceMethod);
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('ttsVoiceId', voiceId);
    onChange(voiceId);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
    setResetError(null);
  };

  const handleResetConfirm = async () => {
    if (resetting) return; // Prevent double-clicking
    
    setResetting(true);
    setResetError(null);
    
    try {
      // Clear localStorage first
      localStorage.clear();
      
      // Clear the database
      await indexedDBService.clearDatabase();
      
      // Add a small delay to ensure database clear completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Close both dialogs
      setShowResetConfirm(false);
      onClose();
      
      // Navigate to main page
      window.location.href = '/';
    } catch (error) {
      console.error('Error resetting database:', error);
      setResetError(error instanceof Error ? error.message : 'Failed to reset database');
      setResetting(false);
    }
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
    setResetError(null);
  };

  useEffect(() => {
    if (!open) return;
    setProgressText('');
    setDownloading(false);
    // Sync voice service with current settings when modal opens
    voiceService.setVoiceMethod(voiceMethod as VoiceMethod);
  }, [open, voiceMethod]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ mt: 1 }}>
          <Typography variant="h6" gutterBottom>Voice Synthesizer</Typography>
          <RadioGroup
            value={voiceMethod}
            onChange={(e) => handleVoiceMethodChange(e.target.value)}
          >
            <FormControlLabel 
              value="built-in" 
              control={<Radio />} 
              label="Built-in Browser Voice (Faster, No Download)" 
            />
            <FormControlLabel 
              value="vits-web" 
              control={<Radio />} 
              label="VITS-Web (Higher Quality, Requires Download)" 
            />
          </RadioGroup>
        </FormControl>

        {voiceMethod === 'vits-web' && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="voice-select-label">VITS Voice</InputLabel>
            <Select
              labelId="voice-select-label"
              label="VITS Voice"
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value as string)}
            >
              {AVAILABLE_VOICES.map(v => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {downloading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>{progressText || 'Preparing download…'}</Typography>
            <LinearProgress />
          </Box>
        )}

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will permanently delete all users, lessons, and progress data. This action cannot be undone.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={handleResetClick}
            disabled={resetting}
            fullWidth
          >
            {resetting ? 'Resetting...' : 'Reset Application'}
          </Button>
          {resetError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {resetError}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {voiceMethod === 'vits-web' && (
          <Button onClick={cacheSelectedVoice} variant="contained" disabled={downloading}>
            Cache Voice
          </Button>
        )}
      </DialogActions>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={showResetConfirm}
        onClose={handleResetCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">
          ⚠️ Confirm Application Reset
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to reset the application? This will:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Delete all users and their data</li>
            <li>Delete all lessons and progress</li>
            <li>Clear all settings and preferences</li>
            <li>Reload the application to start fresh</li>
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>This action cannot be undone!</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetCancel} disabled={resetting}>
            Cancel
          </Button>
          <Button 
            onClick={handleResetConfirm} 
            color="error" 
            variant="contained"
            disabled={resetting}
          >
            {resetting ? 'Resetting...' : 'Yes, Reset Everything'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default SettingsModal;



