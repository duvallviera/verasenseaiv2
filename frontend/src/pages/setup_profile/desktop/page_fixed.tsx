"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, User, MapPin, Calendar, Camera, Briefcase, 
  GraduationCap, Coffee, Music, Book, Dumbbell, Plane,
  Star, ArrowRight, ArrowLeft, Check, Upload, X, Plus,
  Eye, Users, Target, Sparkles, ChevronDown, Info,
  AlertCircle, CheckCircle, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AmoreAssistant from '../components/AmoreAssistant';
import { trackEvent, trackFieldInteraction, trackFormSubmission } from '@/lib/analytics/track';
import { enqueueEmbedding } from '@/lib/embeddings/queue';

const API_URL = 'http://127.0.0.1:8000';

// Enhanced Profile Data Interface with ALL fields
interface ProfileData {
  // Basic Information (Required)
  displayName: string;
  bio: string;
  location: { city: string; state: string; country: string; };
  
  // Demographics & Physical
  height: string;
  bodyType: string;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  
  // Lifestyle & Background
  occupation: string;
  education: string;
  income: string;
  religion: string;
  politicalViews: string;
  smokingStatus: string;
  drinkingStatus: string;
  hasChildren: string;
  wantsChildren: string;
  
  // Comprehensive Interests (Enhanced)
  interests: string[];
  hobbies: string[];
  musicGenres: string[];
  movieGenres: string[];
  cuisinePreferences: string[];
  travelStyle: string[];
  fitnessActivities: string[];
  booksGenres: string[];
  sportsInterests: string[];
  
  // Dating & Relationship
  relationshipGoals: string;
  dealBreakers: string[];
  idealDateIdeas: string[];
  communicationStyle: string;
  loveLanguage: string;
  
  // Personality & Psychology
  personalityType: string;
  attachmentStyle: string;
  valuesImportant: string[];
  lifeGoals: string[];
  
  // Social & Digital
  socialMediaUsage: string;
  petPreference: string;
  livingArrangement: string;
  transportationMode: string;
  
  // Photos & Verification
  profilePhotos: File[];
  photoDescriptions: string[];
  phoneNumber: string;
  verificationMethod: string;
  
  // Privacy & Preferences
  profileVisibility: string;
  showLastActive: boolean;
  showDistance: boolean;
  allowMessagesFrom: string;
  
  // Advanced Features
  weekendActivities: string[];
  careerAmbitions: string;
  familyOrientation: string;
  conflictResolution: string;
  financialGoals: string;
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: User, description: 'Tell us about yourself' },
  { id: 'photos', title: 'Photos', icon: Camera, description: 'Show your best self' },
  { id: 'demographics', title: 'About You', icon: Eye, description: 'Physical & background' },
  { id: 'lifestyle', title: 'Lifestyle', icon: Coffee, description: 'How you live' },
  { id: 'interests', title: 'Interests', icon: Heart, description: 'What you love' },
  { id: 'dating', title: 'Dating Goals', icon: Target, description: 'What you seek' },
  { id: 'personality', title: 'Personality', icon: Star, description: 'Who you are' },
  { id: 'preferences', title: 'Preferences', icon: Users, description: 'Your settings' }
];

export default function SetupProfileDesktop() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '', bio: '', location: { city: '', state: '', country: 'United States' },
    height: '', bodyType: '', ethnicity: '', eyeColor: '', hairColor: '',
    occupation: '', education: '', income: '', religion: '', politicalViews: '',
    smokingStatus: '', drinkingStatus: '', hasChildren: '', wantsChildren: '',
    interests: [], hobbies: [], musicGenres: [], movieGenres: [], cuisinePreferences: [],
    travelStyle: [], fitnessActivities: [], booksGenres: [], sportsInterests: [],
    relationshipGoals: '', dealBreakers: [], idealDateIdeas: [], communicationStyle: '',
    loveLanguage: '', personalityType: '', attachmentStyle: '', valuesImportant: [],
    lifeGoals: [], socialMediaUsage: '', petPreference: '', livingArrangement: '',
    transportationMode: '', profilePhotos: [], photoDescriptions: [], phoneNumber: '',
    verificationMethod: '', profileVisibility: 'public', showLastActive: true,
    showDistance: true, allowMessagesFrom: 'everyone', weekendActivities: [],
    careerAmbitions: '', familyOrientation: '', conflictResolution: '', financialGoals: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validationHelp, setValidationHelp] = useState<Record<string, string>>({});
  const router = useRouter();

  // Reduced motion support
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' ? 
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches : false,
    []
  );

  // Auto-save with embeddings
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profileData.displayName || profileData.bio) {
        localStorage.setItem('profile_setup_draft', JSON.stringify(profileData));
        trackEvent('profile_draft_saved', { step: currentStep, dataFields: Object.keys(profileData).length });
        
        // Queue embeddings for personalization
        if (profileData.bio) {
          enqueueEmbedding({
            kind: 'profile',
            payload: { bioLength: profileData.bio.length, step: currentStep },
            sessionId: 'profile-setup'
          });
        }
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [profileData, currentStep]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Clear error and show help
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show validation help
    setValidationHelp(prev => ({ ...prev, [field]: getFieldHelp(field, value) }));
    
    // Track interaction
    trackFieldInteraction(field, 'change', { step: currentStep, hasValue: !!value });
  }, [currentStep, errors]);

  const getFieldHelp = (field: string, value: any): string => {
    switch (field) {
      case 'bio':
        const length = value?.length || 0;
        if (length < 50) return `Add ${50 - length} more characters for a compelling bio`;
        if (length > 500) return `Consider shortening by ${length - 500} characters`;
        return 'Great! Your bio looks engaging';
      case 'displayName':
        return value?.length > 2 ? 'Perfect display name!' : 'Use your real first name or nickname';
      default:
        return '';
    }
  };

  const validateStep = useCallback((stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (stepIndex) {
      case 0: // Basic Info
        if (!profileData.displayName.trim()) newErrors.displayName = 'Display name is required';
        if (!profileData.bio.trim()) newErrors.bio = 'Bio is required';
        if (profileData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters';
        if (!profileData.location.city.trim()) newErrors.city = 'City is required';
        break;
      case 1: // Photos
        if (profileData.profilePhotos.length < 2) newErrors.photos = 'At least 2 photos are required';
        if (profileData.profilePhotos.length > 6) newErrors.photos = 'Maximum 6 photos allowed';
        break;
      case 2: // Demographics
        if (!profileData.height) newErrors.height = 'Height is required';
        if (!profileData.ethnicity) newErrors.ethnicity = 'Ethnicity is required';
        break;
      case 3: // Lifestyle
        if (!profileData.occupation) newErrors.occupation = 'Occupation is required';
        if (!profileData.education) newErrors.education = 'Education is required';
        break;
      case 4: // Interests
        if (profileData.interests.length < 3) newErrors.interests = 'Select at least 3 interests';
        if (profileData.hobbies.length < 2) newErrors.hobbies = 'Select at least 2 hobbies';
        break;
      case 5: // Dating
        if (!profileData.relationshipGoals) newErrors.relationshipGoals = 'Relationship goals required';
        if (!profileData.loveLanguage) newErrors.loveLanguage = 'Love language required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        trackEvent('step_completed', { 
          step: currentStep, 
          stepName: STEPS[currentStep].id,
          completionPercentage: ((currentStep + 1) / STEPS.length) * 100
        });
      }
    } else {
      toast.error('Please complete all required fields');
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      trackEvent('step_back', { step: currentStep, stepName: STEPS[currentStep].id });
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate all steps
      let allValid = true;
      for (let i = 0; i < STEPS.length; i++) {
        if (!validateStep(i)) {
          allValid = false;
          break;
        }
      }
      
      if (!allValid) {
        toast.error('Please complete all required fields');
        return;
      }

      // Prepare comprehensive data for backend
      const formData = new FormData();
      
      // Add all profile data
      Object.entries(profileData).forEach(([key, value]) => {
        if (key === 'profilePhotos') {
          value.forEach((file: File, index: number) => {
            formData.append(`photo_${index}`, file);
          });
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await axios.post(`${API_URL}/api/profile/setup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Enable-Embeddings': 'true',
        },
        timeout: 30000,
      });

      if (response.data.success) {
        // Queue comprehensive embeddings
        await enqueueEmbedding({
          kind: 'profile',
          payload: {
            interests: profileData.interests,
            lifestyle: { occupation: profileData.occupation, education: profileData.education },
            personality: { type: profileData.personalityType, attachment: profileData.attachmentStyle }
          },
          sessionId: 'profile-setup-complete',
          userId: response.data.userId
        });

        localStorage.removeItem('profile_setup_draft');
        toast.success('Profile created successfully!');
        
        trackFormSubmission('profile_setup', true, [], {
          totalFields: Object.keys(profileData).length,
          completionTime: Date.now()
        });

        setTimeout(() => {
          router.push('/profile/verification_processing');
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create profile. Please try again.';
      toast.error(errorMessage);
      trackFormSubmission('profile_setup', false, [errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <step.icon className="h-16 w-16 text-purple-600 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h3>
          <p className="text-gray-600">{step.description}</p>
          <div className="mt-4 text-sm text-gray-500">
            Step content implementation in progress...
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 p-6 relative overflow-hidden">
        {/* Background decorations - EXACT per master spec */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-2xl"></div>
          </div>
        )}

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header with enhanced typography */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">Profile Wizard</h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Create your comprehensive dating profile with our intelligent wizard that learns your preferences
            </p>
          </motion.div>

          {/* Enhanced Progress Steps with Glass Morphism */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCurrent ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110 shadow-lg' : 
                        isCompleted ? 'bg-green-500 shadow-md' : 'bg-white/20'}
                    `}>
                      {isCompleted ? (
                        <Check className="h-7 w-7 text-white" />
                      ) : (
                        <Icon className={`h-7 w-7 ${isCurrent ? 'text-white' : 'text-white/60'}`} />
                      )}
                      {isCurrent && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30 animate-pulse"></div>
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-16 h-2 mx-3 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
              <p className="text-white/80 mb-2">{STEPS[currentStep].description}</p>
              <div className="text-sm text-white/60">
                Step {currentStep + 1} of {STEPS.length} • {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
              </div>
            </div>
          </div>

          {/* Step Content with enhanced validation */}
          <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-8 mb-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${currentStep === 0 
                  ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                  : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105 backdrop-blur-sm'
                }
              `}
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="text-center text-white/60 text-sm">
              {completedSteps.size} of {STEPS.length} steps completed
            </div>

            {currentStep === STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
                Complete Profile
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Next Step
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Amore Assistant */}
      <AmoreAssistant context="setup_profile_desktop" variant="desktop" />
    </>
  );
}
