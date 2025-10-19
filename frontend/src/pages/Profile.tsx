import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Avatar, Button, 
  TextField, Grid, Divider, IconButton, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tab, Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonIcon from '@mui/icons-material/Person';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AgenticInsightsDashboard from '../components/analytics/AgenticInsightsDashboard';
import ProfileStatistics from '../components/analytics/ProfileStatistics';
import { useAgenticInsights } from '../context/AgenticInsightsContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(15, 16, 30, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '& input': {
      color: theme.palette.common.white,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
}));

const NavigationButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: 8,
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  fontWeight: 500,
}));

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { attachmentStyle } = useAgenticInsights();
  const [editing, setEditing] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  
  // Determine initial tab from URL parameters
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    return tabParam ? parseInt(tabParam, 10) : 0;
  });
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Investigator',
    company: 'Truth Seekers Inc.',
    bio: 'Experienced investigator specializing in behavioral analysis and deception detection. Over 10 years of experience in the field.',
    skills: ['Behavioral Analysis', 'Interview Techniques', 'Deception Detection', 'Body Language Reading'],
    profilePicture: '/placeholder-avatar.jpg',
  });
  
  // Get user profile data on load and handle URL parameters
  useEffect(() => {
    // Handle URL parameters for tab selection
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(parseInt(tabParam, 10));
    }
    
    // In a real app, you would fetch the user profile data here
    if (user) {
      // Mock data - replace with actual API call
      setProfile({
        ...profile,
        email: user.email || profile.email,
      });
    }
  }, [user, location.search]);
  
  const handleEditToggle = () => {
    if (editing) {
      // Save changes when toggling off edit mode
      // In a real app, you would save to the backend here
      console.log('Saving profile changes:', profile);
    }
    setEditing(!editing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };
  
  const handlePhotoChange = () => {
    // Close the dialog and update profile picture
    // In a real app, you would upload the photo and get a URL back
    setPhotoDialogOpen(false);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4,
      background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    }}>
      <Container maxWidth="lg">
        {/* Top navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <NavigationButton
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={navigateToDashboard}
          >
            Back to Dashboard
          </NavigationButton>
          
          <NavigationButton
            variant="outlined"
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={navigateToSettings}
          >
            Settings
          </NavigationButton>
        </Box>

        <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 2 }}>
          My Profile
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            mb: 3, 
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
            '& .Mui-selected': { color: 'white' },
            '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
          }}
        >
          <Tab icon={<PersonIcon />} label="Personal Info" />
          <Tab icon={<PsychologyIcon />} label="Psychological Profile" />
        </Tabs>

        {activeTab === 0 ? (
          <Grid container spacing={3}>
            {/* Profile Information Section */}
            <Grid item xs={12} md={4}>
              <GlassPaper>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <ProfileAvatar src={profile.profilePicture} alt={`${profile.firstName} ${profile.lastName}`}>
                      {!profile.profilePicture && `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`}
                    </ProfileAvatar>
                    
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                      onClick={() => setPhotoDialogOpen(true)}
                    >
                      <CameraAltIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h5" sx={{ mt: 2, color: 'white' }}>
                    {profile.firstName} {profile.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {profile.role} at {profile.company}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={editing ? <SaveIcon /> : <EditIcon />}
                    onClick={handleEditToggle}
                    sx={{ mt: 2 }}
                  >
                    {editing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </Box>
              </GlassPaper>
              
              <GlassPaper>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Skills & Expertise
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {profile.skills.map((skill, index) => (
                    <Chip 
                      key={index}
                      label={skill}
                      sx={{ 
                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(99, 102, 241, 0.3)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </GlassPaper>
            </Grid>
            
            {/* Profile Details Section */}
            <Grid item xs={12} md={8}>
              <GlassPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Personal Information
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="First Name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Last Name"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      disabled={true} // Email should not be editable
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Role"
                      name="role"
                      value={profile.role}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Company"
                      name="company"
                      value={profile.company}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      disabled={!editing}
                    />
                  </Grid>
                </Grid>
              </GlassPaper>
              
              <GlassPaper>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Bio
                </Typography>
                <StyledTextField
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  disabled={!editing}
                />
              </GlassPaper>
              
              <GlassPaper>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Account Security
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ mr: 2 }}
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                  >
                    Enable Two-Factor Authentication
                  </Button>
                </Box>
              </GlassPaper>
            </Grid>
          </Grid>
        ) : (
          // Psychological Profile Tab
          <Box>
            {/* Statistics overview first */}
            <Box sx={{ mb: 4 }}>
              <ProfileStatistics userId={user?.id} />
            </Box>
            
            {/* Detailed agentic insights dashboard */}
            <Typography variant="h5" sx={{ mt: 4, mb: 3, display: 'flex', alignItems: 'center' }}>
              <EqualizerIcon sx={{ mr: 1 }} />
              Detailed Analysis
            </Typography>
            <AgenticInsightsDashboard />
          </Box>
        )}

        {/* Bottom navigation buttons - fixed to bottom */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4, 
          pt: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <NavigationButton
            variant="contained"
            color="primary"
            startIcon={<DashboardIcon />}
            onClick={navigateToDashboard}
          >
            Return to Dashboard
          </NavigationButton>
          
          <NavigationButton
            variant="outlined"
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={navigateToSettings}
          >
            Go to Settings
          </NavigationButton>
        </Box>
      </Container>
      
      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a new profile picture. The ideal size is 200x200 pixels.
          </Typography>
          
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Choose File
            <input
              type="file"
              hidden
              accept="image/*"
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePhotoChange} variant="contained" color="primary">Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
