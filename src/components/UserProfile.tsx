import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { indexedDBService, User, Lesson, LessonProgress } from '../services/IndexedDBService';
import PuzzleCanvas from './PuzzleCanvas';
import PuzzleModal from './PuzzleModal';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [openDialog, setOpenDialog] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonWords, setNewLessonWords] = useState('');
  const [loading, setLoading] = useState(true);
  const [puzzleModalOpen, setPuzzleModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const loadUserData = useCallback(async () => {
    if (!userId) return;

    try {
      const [userData, userLessons] = await Promise.all([
        indexedDBService.getUserById(userId),
        indexedDBService.getLessonsByUserId(userId),
      ]);

      if (!userData) {
        navigate('/');
        return;
      }

      setUser(userData);
      // Sort lessons by creation date (most recent first)
      const sortedLessons = userLessons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLessons(sortedLessons);

      // Load progress for each lesson
      const progressMap = new Map<string, LessonProgress>();
      for (const lesson of userLessons) {
        const progress = await indexedDBService.getLessonProgress(lesson.id, userId);
        if (progress) {
          progressMap.set(lesson.id, progress);
        }
      }
      setLessonProgress(progressMap);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId, loadUserData]);

  // Handle automatic puzzle modal opening when lesson is completed for the 6th time
  useEffect(() => {
    const state = location.state as any;
    if (state?.isPuzzleUnlocked && state?.lessonCompleted && lessons.length > 0) {
      const completedLesson = lessons.find(lesson => lesson.id === state.lessonCompleted);
      if (completedLesson) {
        setSelectedLesson(completedLesson);
        setPuzzleModalOpen(true);
        
        // Clear the state to prevent reopening on subsequent visits
        navigate(`/user/${userId}`, { replace: true });
      }
    }
  }, [location.state, lessons, userId, navigate]);

  const handleCreateLesson = async () => {
    if (!newLessonName.trim() || !newLessonWords.trim() || !userId) return;

    const words = newLessonWords
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    if (words.length === 0) return;

    try {
      const newLesson = await indexedDBService.createLesson(userId, newLessonName.trim(), words);
      setLessons(prev => {
        const updated = [...prev, newLesson];
        // Sort by creation date (most recent first)
        return updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      setNewLessonName('');
      setNewLessonWords('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handlePracticeLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}/practice/${userId}`);
  };

  const handlePuzzleClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setPuzzleModalOpen(true);
  };

  const handleClosePuzzleModal = () => {
    setPuzzleModalOpen(false);
    setSelectedLesson(null);
  };


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', pt: 2 }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', pt: 2 }}>
        <Typography variant="h4">User not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to User Selection
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose a lesson to practice your spelling words!
          </Typography>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Your Lessons
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Lesson
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {lessons.map((lesson, index) => {
            const progress = lessonProgress.get(lesson.id);
            const completedPieces = progress ? Math.min(progress.successfulCompletions, 6) : 0;
            const isComplete = completedPieces >= 6;
            // Calculate image order: lessons are sorted by creation date (most recent first)
            // So we need to reverse the index to get chronological order
            const imageOrder = lessons.length - index;

            return (
              <Card key={lesson.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                    {/* Left: Lesson details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" noWrap>
                          {lesson.name}
                        </Typography>
                        {isComplete && (
                          <Chip 
                            icon={<CheckCircleIcon />} 
                            label="Complete" 
                            color="success" 
                            size="small" 
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {lesson.words.length} words • {completedPieces}/6 pieces earned
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(completedPieces / 6) * 100}
                        sx={{ height: 6, borderRadius: 3, mb: 2 }}
                      />
                      <Typography variant="body2" sx={{ mb: 2 }} noWrap>
                        Words: {lesson.words.join(', ')}
                      </Typography>
                      <CardActions sx={{ p: 0 }}>
                        <Button
                          variant="contained"
                          startIcon={<PlayIcon />}
                          onClick={() => handlePracticeLesson(lesson.id)}
                        >
                          Practice Lesson
                        </Button>
                      </CardActions>
                    </Box>

                    {/* Right: Puzzle preview */}
                    <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: { xs: 200, sm: 260 }, pl: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                        Puzzle Progress
                      </Typography>
                      <PuzzleCanvas 
                        earnedPieces={completedPieces}
                        totalPieces={6}
                        isComplete={isComplete}
                        imageId={lesson.id}
                        imageOrder={imageOrder}
                        onClick={() => handlePuzzleClick(lesson)}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {lessons.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No lessons yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first lesson to start learning!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Add Your First Lesson
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Create Lesson Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Lesson</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lesson Name"
            fullWidth
            variant="outlined"
            value={newLessonName}
            onChange={(e) => setNewLessonName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Words (separated by commas)"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newLessonWords}
            onChange={(e) => setNewLessonWords(e.target.value)}
            placeholder="cat, dog, bird, fish, tree, house"
            helperText="Enter each word separated by a comma"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateLesson} 
            variant="contained"
            disabled={!newLessonName.trim() || !newLessonWords.trim()}
          >
            Create Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Puzzle Modal */}
      {selectedLesson && (
        <PuzzleModal
          open={puzzleModalOpen}
          onClose={handleClosePuzzleModal}
          earnedPieces={Math.min(lessonProgress.get(selectedLesson.id)?.successfulCompletions || 0, 6)}
          totalPieces={6}
          isComplete={(lessonProgress.get(selectedLesson.id)?.successfulCompletions || 0) >= 6}
          imageId={selectedLesson.id}
          imageOrder={lessons.length - lessons.findIndex(lesson => lesson.id === selectedLesson.id)}
          lessonName={selectedLesson.name}
        />
      )}
    </Container>
  );
};

export default UserProfile;
