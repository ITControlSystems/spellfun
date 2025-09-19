import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { indexedDBService, Lesson, LessonProgress } from '../services/IndexedDBService';
import { voiceService } from '../services/VoiceService';
import FireworksAnimation from './FireworksAnimation';
import VirtualKeyboard from './VirtualKeyboard';
import UserInputDisplay from './UserInputDisplay';
 

interface PracticeState {
  currentWordIndex: number;
  userInput: string;
  isCorrect: boolean;
  showResult: boolean;
  completedWords: number;
  totalWords: number;
  practiceComplete: boolean;
}

const LessonPractice: React.FC = () => {
  const { lessonId, userId } = useParams<{ lessonId: string; userId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [practiceWords, setPracticeWords] = useState<string[]>([]);
  const [practiceState, setPracticeState] = useState<PracticeState>({
    currentWordIndex: 0,
    userInput: '',
    isCorrect: false,
    showResult: false,
    completedWords: 0,
    totalWords: 0,
    practiceComplete: false,
  });
  const [showFireworks, setShowFireworks] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLessonData = useCallback(async () => {
    if (!lessonId) return;

    try {
      const [lessonData, progressData] = await Promise.all([
        indexedDBService.getLessonById(lessonId),
        userId ? indexedDBService.getLessonProgress(lessonId, userId) : null,
      ]);

      if (!lessonData) {
        navigate('/');
        return;
      }

      setLesson(lessonData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
  }, [lessonId, userId, navigate]);

  useEffect(() => {
    if (lessonId) {
      loadLessonData();
    }
  }, [lessonId, loadLessonData]);

  // Shuffle helper (Fisher–Yates)
  const shuffleWords = (words: string[]): string[] => {
    const array = [...words];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Initialize shuffled practice words when lesson loads
  useEffect(() => {
    if (lesson) {
      const shuffled = shuffleWords(lesson.words);
      setPracticeWords(shuffled);
      setPracticeState(prev => ({
        ...prev,
        currentWordIndex: 0,
        totalWords: shuffled.length,
        userInput: '',
        isCorrect: false,
        showResult: false,
        completedWords: 0,
        practiceComplete: false,
      }));
    }
  }, [lesson]);

  useEffect(() => {
    if (practiceState.showResult && practiceState.isCorrect) {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 2000);
    }
  }, [practiceState.showResult, practiceState.isCorrect]);

  const defaultVoiceId = (typeof localStorage !== 'undefined' && localStorage.getItem('ttsVoiceId')) || 'en_US-hfc_female-medium';

  const [ttsDownloading, setTtsDownloading] = useState(false);
  const [ttsProgress, setTtsProgress] = useState<number>(0);

  // Sync voice service with current settings on mount
  useEffect(() => {
    const voiceMethod = localStorage.getItem('voiceMethod') || 'built-in';
    voiceService.setVoiceMethod(voiceMethod as 'built-in' | 'vits-web');
  }, []);


  const speakWord = async (word: string) => {
    try {
      // Always sync with current localStorage setting
      const voiceMethod = localStorage.getItem('voiceMethod') || 'built-in';
      voiceService.setVoiceMethod(voiceMethod as 'built-in' | 'vits-web');
      
      // Only show download progress for vits-web method
      if (voiceMethod === 'vits-web') {
        const needsInit = !voiceService.isInitialized || voiceService.currentVoiceId !== defaultVoiceId;
        
        if (needsInit) {
          setTtsProgress(0);
          setTtsDownloading(true);
        }
        
        await voiceService.init(defaultVoiceId, (p) => {
          const pct = p.total ? Math.round((p.loaded * 100) / p.total) : 0;
          setTtsProgress(pct);
          // Only show downloading state if we're actually downloading
          if (needsInit) {
            setTtsDownloading(true);
          }
        });
      } else {
        // For built-in voice, just initialize without download progress
        await voiceService.init(defaultVoiceId);
      }
      
      await voiceService.speak(word, defaultVoiceId);
    } catch (e) {
      console.error('TTS error', e);
    } finally {
      setTtsDownloading(false);
    }
  };



  const handleSpeakWord = async () => {
    if (practiceWords.length > 0) {
      const word = practiceWords[practiceState.currentWordIndex];
      if (word) {
        await speakWord(word);
      }
    }
  };



  const handleKeyPress = (letter: string) => {
    setPracticeState(prev => ({
      ...prev,
      userInput: prev.userInput + letter,
    }));
  };

  const handleBackspace = () => {
    setPracticeState(prev => ({
      ...prev,
      userInput: prev.userInput.slice(0, -1),
    }));
  };

  const handleSubmit = () => {
    if (!lesson) return;

    const currentWord = practiceWords[practiceState.currentWordIndex];
    const isCorrect = practiceState.userInput.toLowerCase().trim() === currentWord.toLowerCase().trim();

    setPracticeState(prev => ({
      ...prev,
      isCorrect,
      showResult: true,
    }));
  };

  const handleNextWord = () => {
    if (!lesson) return;

    const newCompletedWords = practiceState.completedWords + 1;
    const isLastWord = practiceState.currentWordIndex === practiceWords.length - 1;

    if (isLastWord) {
      // Lesson completed successfully
      setPracticeState(prev => ({
        ...prev,
        practiceComplete: true,
        completedWords: newCompletedWords,
      }));
      setShowCompletionDialog(true);
    } else {
      // Move to next word
      setPracticeState(prev => ({
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1,
        userInput: '',
        isCorrect: false,
        showResult: false,
        completedWords: newCompletedWords,
      }));
    }

  };

  const handleRestartLesson = () => {
    const reshuffled = lesson ? shuffleWords(lesson.words) : practiceWords;
    setPracticeWords(reshuffled);
    setPracticeState({
      currentWordIndex: 0,
      userInput: '',
      isCorrect: false,
      showResult: false,
      completedWords: 0,
      totalWords: reshuffled.length,
      practiceComplete: false,
    });
    setShowCompletionDialog(false);
  };

  const handleCompleteLesson = async () => {
    if (!lesson || !userId) return;

    const currentProgress = progress || {
      id: '',
      lessonId: lesson.id,
      userId: userId,
      successfulCompletions: 0,
      lastPracticed: new Date(),
    };

    const newSuccessfulCompletions = currentProgress.successfulCompletions + 1;
    
    try {
      await indexedDBService.updateLessonProgress(
        lesson.id,
        userId,
        newSuccessfulCompletions
      );
      
      setShowCompletionDialog(false);
      
      // Check if this is the 6th completion (puzzle unlock)
      const isPuzzleUnlocked = newSuccessfulCompletions === 6;
      
      navigate(`/user/${userId}`, {
        state: {
          lessonCompleted: lesson.id,
          isPuzzleUnlocked: isPuzzleUnlocked,
          completionCount: newSuccessfulCompletions
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleEnterKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !practiceState.showResult) {
      handleSubmit();
    } else if (event.key === 'Enter' && practiceState.showResult) {
      handleNextWord();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', pt: 2 }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', pt: 2 }}>
        <Typography variant="h4">Lesson not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to User Selection
        </Button>
      </Container>
    );
  }

  const currentWord = practiceWords[practiceState.currentWordIndex];
  const progressPercentage = (practiceState.completedWords / practiceState.totalWords) * 100;

  return (
    <Container maxWidth="md" sx={{ pt: 2 }}>
      {showFireworks && <FireworksAnimation />}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {lesson.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Practice your spelling words!
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Word {practiceState.currentWordIndex + 1} of {practiceState.totalWords}
            </Typography>
            <Chip 
              label={`${practiceState.completedWords}/${practiceState.totalWords} completed`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ height: 8, borderRadius: 4, mb: 3 }}
          />
        </CardContent>
      </Card>

      

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" component="div" gutterBottom color="text.secondary">
              Listen to the word and spell it
            </Typography>
            <Button
              variant="contained"
              startIcon={<VolumeUpIcon />}
              onClick={handleSpeakWord}
              size="large"
              sx={{ mb: 2 }}
            >
              Listen to Word
            </Button>
            
            
            {ttsDownloading && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Downloading voice… {ttsProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={ttsProgress} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              Click the button above to hear the word, then type what you heard
            </Typography>
          </Box>

          {!practiceState.showResult ? (
            <Box>
              <UserInputDisplay 
                userInput={practiceState.userInput}
                disabled={false}
              />
              <VirtualKeyboard
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onEnter={handleSubmit}
                disabled={false}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!practiceState.userInput.trim()}
                fullWidth
                sx={{ mt: 2 }}
              >
                Check Spelling
              </Button>
            </Box>
          ) : (
            <Box>
              <Alert 
                severity={practiceState.isCorrect ? "success" : "error"}
                sx={{ mb: 3 }}
                icon={practiceState.isCorrect ? <CheckIcon /> : <CloseIcon />}
              >
                {practiceState.isCorrect ? (
                  "Correct! Great job!"
                ) : (
                  `Incorrect. The correct spelling is: ${currentWord}`
                )}
              </Alert>
              <VirtualKeyboard
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onEnter={handleNextWord}
                disabled={true}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleNextWord}
                fullWidth
                sx={{ mt: 2 }}
                startIcon={practiceState.isCorrect ? <CheckIcon /> : <CloseIcon />}
              >
                {practiceState.isCorrect 
                  ? (practiceState.currentWordIndex === practiceWords.length - 1 ? "Complete Practice" : "Next Word")
                  : "Continue"
                }
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>🎉 Lesson Complete! 🎉</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Congratulations! You've successfully spelled all the words in this lesson!
          </Typography>
          <Typography variant="body1" gutterBottom>
            You've earned a puzzle piece! Keep practicing to unlock more pieces.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestartLesson} startIcon={<ReplayIcon />}>
            Practice Again
          </Button>
          <Button onClick={handleCompleteLesson} variant="contained">
            Continue to Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LessonPractice;
