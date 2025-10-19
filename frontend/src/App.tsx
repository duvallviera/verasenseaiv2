import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { AgenticProvider } from './context/AgenticContext';
import { AgenticInsightsProvider } from './context/AgenticInsightsContext';
import { theme } from './designSystem/theme';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupProfile from './pages/SetupProfile';
import SessionPage from './pages/SessionPage';
import ReportPage from './pages/ReportPage';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CameraTest from './pages/CameraTest';
import CameraLandmarksPage from './pages/CameraLandmarksTest';
import OverlayTest from '../camera-landmarks-test/overlay-test';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AgenticProvider>
          <AgenticInsightsProvider>
            <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/setup_profile" element={<SetupProfile />} />
              <Route path="/camera-test" element={<CameraTest />} />
              <Route path="/camera-landmarks-test" element={<CameraLandmarksPage />} />
              <Route path="/overlay-test" element={<OverlayTest />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/session/:mode" 
                element={
                  <ProtectedRoute>
                    <SessionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/:sessionId" 
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Router>
          </AgenticInsightsProvider>
        </AgenticProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
