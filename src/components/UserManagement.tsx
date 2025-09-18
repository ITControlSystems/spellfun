import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, Person as PersonIcon } from '@mui/icons-material';
import { indexedDBService, User } from '../services/IndexedDBService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await indexedDBService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    try {
      const newUser = await indexedDBService.createUser(newUserName.trim());
      setUsers(prev => [...prev, newUser]);
      setNewUserName('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', pt: 2 }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ pt: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white' }}>
          SpellFun
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose a user to start learning spelling words!
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3 
      }}>
        {users.map((user) => (
          <Card 
            key={user.id}
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 3,
              }
            }}
            onClick={() => handleUserClick(user.id)}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" component="h2">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}

        <Card 
          sx={{ 
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'primary.main',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: 3,
            }
          }}
          onClick={() => setOpenDialog(true)}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'grey.300' }}>
              <AddIcon fontSize="large" color="action" />
            </Avatar>
            <Typography variant="h6" component="h2" color="primary">
              Add New User
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User Name"
            fullWidth
            variant="outlined"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateUser();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained"
            disabled={!newUserName.trim()}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
