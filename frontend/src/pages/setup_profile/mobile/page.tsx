"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, User, MapPin, Calendar, Camera, Briefcase, 
  GraduationCap, Coffee, Music, Book, Dumbbell, Plane,
  Star, ArrowRight, ArrowLeft, Check, Upload, X, Plus,
  Eye, Users, Target, Sparkles, ChevronDown, Info,
  AlertCircle, CheckCircle, HelpCircle, Menu
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
// Using built-in notification system instead of react-toastify
import AmoreAssistant from '../components/AmoreAssistant';
import { trackEvent, trackFieldInteraction, trackFormSubmission } from '@/lib/analytics/track';
import { enqueueEmbedding } from '@/lib/embeddings/queue';

const API_URL = 'http://localhost:5000'; // Node backend for profile data (changed from 8000)

// Same comprehensive ProfileData interface as desktop
interface ProfileData {
  displayName: string;
  bio: string;
  location: { 
    country: string;
    state: string; 
    city: string;
    zipCode: string;
    neighborhood: string;
    coordinates?: { lat: number; lng: number };
    timezone: string;
  };
  dateOfBirth: string;
  verificationDOB: string;
  ageVerificationSource: string;
  gender: string;
  height: string;
  bodyType: string;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  occupation: string;
  education: string;
  income: string;
  religion: string;
  politicalViews: string;
  smokingStatus: string;
  drinkingStatus: string;
  hasChildren: string;
  wantsChildren: string;
  livingSituation: string;
  interests: string[];
  hobbies: string[];
  musicGenres: string[];
  favoriteArtist: string;
  favoriteFood: string;
  favoriteSport: string;
  dreamLuxury: string;
  placeLovedMost: string;
  dreamTrip: string;
  lifePhilosophy: string;
  childhoodMemory: string;
  movieGenres: string[];
  cuisinePreferences: string[];
  travelStyle: string[];
  fitnessActivities: string[];
  booksGenres: string[];
  sportsInterests: string[];
  relationshipGoals: string;
  dealBreakers: string[];
  idealDateIdeas: string[];
  communicationStyle: string;
  loveLanguage: string;
  personalityType: string;
  attachmentStyle: string;
  valuesImportant: string[];
  lifeGoals: string[];
  personalityTraits: string[];
  strengthsQualities: string[];
  introvertExtrovert: string;
  emotionalIntelligence: string;
  stressManagement: string;
  socialPreferences: string[];
  personalityInsights: string;
  socialMediaUsage: string;
  petPreference: string;
  livingArrangement: string;
  transportationMode: string;
  language: string;
  profilePhotos: File[];
  photoDescriptions: string[];
  phoneNumber: string;
  verificationMethod: string;
  profileVisibility: string;
  showLastActive: boolean;
  showDistance: boolean;
  allowMessagesFrom: string;
  weekendActivities: string[];
  careerAmbitions: string;
  familyOrientation: string;
  conflictResolution: string;
  financialGoals: string;
  nextTripPlan: string;
  ageRangeMin: number;
  ageRangeMax: number;
  maxDistance: number;
  preferredGenders: string[];
  preferredEducation: string[];
  preferredBodyTypes: string[];
  preferredEthnicities: string[];
  preferredLifestyles: string[];
}

const MOBILE_STEPS = [
  { id: 'basic', title: 'About You', icon: User, fields: ['displayName', 'bio', 'location'] },
  { id: 'interests_personality', title: 'Interests & Personality', icon: Heart, fields: ['musicGenres', 'hobbies', 'favoriteFood'] },
  { id: 'physical', title: 'Physical', icon: Eye, fields: ['height', 'bodyType', 'ethnicity'] },
  { id: 'lifestyle', title: 'Lifestyle', icon: Coffee, fields: ['occupation', 'education', 'smokingStatus'] },
  { id: 'interests', title: 'Interests', icon: Heart, fields: ['interests', 'hobbies', 'musicGenres'] },
  { id: 'dating', title: 'Dating', icon: Target, fields: ['relationshipGoals', 'loveLanguage'] },
  { id: 'personality', title: 'Personality', icon: Star, fields: ['personalityType', 'valuesImportant'] },
  { id: 'final', title: 'Finish', icon: Check, fields: ['phoneNumber', 'profileVisibility'] }
];

export default function SetupProfileMobile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '', bio: '', 
    location: { 
      country: 'United States', 
      state: '', 
      city: '', 
      zipCode: '', 
      neighborhood: '',
      timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/New_York'
    },
    dateOfBirth: '',
    verificationDOB: '',
    ageVerificationSource: 'user_input',
    gender: '',
    height: '', bodyType: '', ethnicity: '', eyeColor: '', hairColor: '',
    occupation: '', education: '', income: '', religion: '', politicalViews: '',
    smokingStatus: '', drinkingStatus: '', hasChildren: '', wantsChildren: '', livingSituation: '',
    interests: [], hobbies: [], musicGenres: [], favoriteArtist: '', 
    favoriteFood: '', favoriteSport: '', dreamLuxury: '', placeLovedMost: '', 
    dreamTrip: '', lifePhilosophy: '', childhoodMemory: '',
    movieGenres: [], cuisinePreferences: [],
    travelStyle: [], fitnessActivities: [], booksGenres: [], sportsInterests: [],
    relationshipGoals: '', dealBreakers: [], idealDateIdeas: [], communicationStyle: '',
    loveLanguage: '', personalityType: '', attachmentStyle: '', valuesImportant: [],
    lifeGoals: [], personalityTraits: [], strengthsQualities: [], introvertExtrovert: '',
    emotionalIntelligence: '', stressManagement: '', socialPreferences: [], personalityInsights: '',
    socialMediaUsage: '', petPreference: '', livingArrangement: '',
    transportationMode: '', language: '', profilePhotos: [], photoDescriptions: [], phoneNumber: '',
    verificationMethod: '', profileVisibility: 'public', showLastActive: true,
    showDistance: true, allowMessagesFrom: 'everyone', weekendActivities: [],
    careerAmbitions: '', familyOrientation: '', conflictResolution: '', financialGoals: '',
    nextTripPlan: '', ageRangeMin: 18, ageRangeMax: 35, maxDistance: 25, preferredGenders: [],
    preferredEducation: [], preferredBodyTypes: [], preferredEthnicities: [], preferredLifestyles: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [signupData, setSignupData] = useState<any>(null);
  const router = useRouter();

  // Load signup data on mount
  useEffect(() => {
    const stored = localStorage.getItem('4ulove_signup_data');
    if (stored) {
      try {
        setSignupData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse signup data:', e);
      }
    }
  }, []);

  // Simple notification system
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Mobile-specific optimizations
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' ? 
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches : false,
    []
  );

  // Load signup data and initialize profile
  useEffect(() => {
    const signupData = localStorage.getItem('4ulove_signup_data');
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        setProfileData(prev => ({
          ...prev,
          displayName: data.firstName || data.nickname || prev.displayName,
          // Pre-populate other fields as available
        }));
        
        trackEvent('mobile_profile_setup_initialized', {
          hasSignupData: true,
          variant: data.variant || 'unknown'
        });
      } catch (error) {
        console.error('Failed to load signup data:', error);
      }
    }
  }, []);

  // Mobile auto-save with shorter interval
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profileData.displayName || profileData.bio) {
        localStorage.setItem('profile_setup_mobile_draft', JSON.stringify(profileData));
        trackEvent('mobile_profile_draft_saved', { 
          step: currentStep, 
          stepName: MOBILE_STEPS[currentStep].id,
          fieldsCompleted: Object.values(profileData).filter(v => v && v.length > 0).length
        });
      }
    }, 1500); // Shorter interval for mobile
    return () => clearTimeout(timeoutId);
  }, [profileData, currentStep]);

  // Load mobile draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('profile_setup_mobile_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setProfileData(prev => ({ ...prev, ...draft }));
        showNotification('info', 'Restored your mobile draft');
      } catch (error) {
        console.error('Failed to restore mobile draft:', error);
      }
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    trackFieldInteraction(field, 'change', { 
      step: currentStep, 
      stepName: MOBILE_STEPS[currentStep].id,
      isMobile: true,
      hasValue: !!value 
    });
  }, [currentStep, errors]);

  const validateMobileStep = useCallback((stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    const step = MOBILE_STEPS[stepIndex];
    
    switch (step.id) {
      case 'basic': // Step 1: About You
        if (!profileData.displayName.trim()) {
          newErrors.displayName = 'Display name is required';
        }
        if (!profileData.gender || profileData.gender === '') {
          newErrors.gender = 'Gender is required';
        }
        if (!profileData.dateOfBirth || profileData.dateOfBirth === '') {
          newErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!profileData.bio.trim()) {
          newErrors.bio = 'Bio is required (minimum 50 characters)';
        } else if (profileData.bio.length < 50) {
          newErrors.bio = `Bio needs ${50 - profileData.bio.length} more characters (minimum 50)`;
        }
        if (!profileData.location.city.trim()) {
          newErrors.city = 'City is required';
        }
        if (!profileData.location.state.trim()) {
          newErrors.state = 'State is required';
        }
        break;
        
      case 'photos': // Step 2: Your Photos
        if (profileData.profilePhotos.length < 2) {
          newErrors.photos = 'Upload at least 2 photos';
        }
        break;
        
      case 'physical': // Step 3: Physical
        if (!profileData.height || profileData.height === '') newErrors.height = 'Height is required';
        if (!profileData.bodyType || profileData.bodyType === '') newErrors.bodyType = 'Body type is required';
        if (!profileData.ethnicity || profileData.ethnicity === '') newErrors.ethnicity = 'Ethnicity is required';
        if (!profileData.eyeColor || profileData.eyeColor === '') newErrors.eyeColor = 'Eye color is required';
        if (!profileData.smokingStatus || profileData.smokingStatus === '') newErrors.smokingStatus = 'Smoking status is required';
        if (!profileData.drinkingStatus || profileData.drinkingStatus === '') newErrors.drinkingStatus = 'Drinking status is required';
        if (!profileData.hasChildren || profileData.hasChildren === '') newErrors.hasChildren = 'Please specify if you have children';
        if (!profileData.wantsChildren || profileData.wantsChildren === '') newErrors.wantsChildren = 'Please specify if you want children';
        break;
        
      case 'lifestyle': // Step 4: Lifestyle
        if (!profileData.occupation || profileData.occupation === '') newErrors.occupation = 'Occupation is required';
        if (!profileData.education || profileData.education === '') newErrors.education = 'Education is required';
        if (!profileData.livingArrangement || profileData.livingArrangement === '') newErrors.livingArrangement = 'Living arrangement is required';
        break;
        
      case 'interests': // Step 5: Interests
        if (!profileData.hobbies || profileData.hobbies.length < 2) {
          newErrors.hobbies = 'Select at least 2 hobbies';
        }
        if (!profileData.musicGenres || profileData.musicGenres.length < 1) {
          newErrors.musicGenres = 'Select at least 1 music genre';
        }
        if (profileData.movieGenres.length < 1) {
          newErrors.movieGenres = 'Select at least 1 movie genre';
        }
        if (profileData.cuisinePreferences.length < 1) {
          newErrors.cuisinePreferences = 'Select at least 1 cuisine preference';
        }
        break;
        
      case 'dating': // Step 6: Dating Goals
        if (!profileData.relationshipGoals || profileData.relationshipGoals === '') {
          newErrors.relationshipGoals = 'Relationship goals required';
        }
        if (!profileData.loveLanguage || profileData.loveLanguage === '') {
          newErrors.loveLanguage = 'Love language required';
        }
        if (!profileData.communicationStyle || profileData.communicationStyle === '') {
          newErrors.communicationStyle = 'Communication style required';
        }
        if (profileData.dealBreakers.length < 1) {
          newErrors.dealBreakers = 'Select at least 1 deal breaker';
        }
        break;
        
      case 'personality': // Step 7: Personality
        if (profileData.personalityTraits.length < 3) {
          newErrors.personalityTraits = 'Select at least 3 personality traits';
        }
        if (profileData.strengthsQualities.length < 2) {
          newErrors.strengthsQualities = 'Select at least 2 strengths/qualities';
        }
        if (!profileData.introvertExtrovert) {
          newErrors.introvertExtrovert = 'Please select your social energy preference';
        }
        break;
        
      case 'final': // Step 8: Preferences
        if (!profileData.ageRangeMin || !profileData.ageRangeMax) {
          newErrors.ageRange = 'Age range is required';
        }
        if (profileData.ageRangeMin >= profileData.ageRangeMax) {
          newErrors.ageRange = 'Minimum age must be less than maximum age';
        }
        if (!profileData.maxDistance) {
          newErrors.maxDistance = 'Maximum distance is required';
        }
        if (!profileData.profileVisibility) {
          newErrors.profileVisibility = 'Profile visibility setting is required';
        }
        if (profileData.preferredGenders.length < 1) {
          newErrors.preferredGenders = 'Select at least 1 gender preference';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData]);

  const nextStep = useCallback(() => {
    if (validateMobileStep(currentStep)) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
      if (currentStep < MOBILE_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        trackEvent('mobile_step_completed', { 
          step: currentStep, 
          stepName: MOBILE_STEPS[currentStep].id,
          completionPercentage: ((currentStep + 1) / MOBILE_STEPS.length) * 100
        });
        // Scroll to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Show specific validation errors instead of generic message
      const stepName = MOBILE_STEPS[currentStep]?.title || 'this step';
      const errorFields = Object.keys(errors).filter(key => errors[key]);
      
      if (errorFields.length > 0) {
        showNotification('error', `Please fix the highlighted fields in ${stepName}`);
      } else {
        showNotification('error', `Please complete all required fields in ${stepName}`);
      }
      
      // Scroll to first error field
      const firstErrorField = document.querySelector('.border-red-500, [data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, validateMobileStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      trackEvent('mobile_step_back', { step: currentStep, stepName: MOBILE_STEPS[currentStep].id });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleMobileSubmit = async () => {
    // 🛡️ CHECK FOR EXISTING PROFILE - USER-SPECIFIC (Duplicate Protection)
    // Get current user's email from authenticated user object (always current)
    let currentUserEmail = signupData?.email || '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUserEmail = user.email || currentUserEmail;
      }
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
    const existingProfileStr = localStorage.getItem('user_profile_data');
    const existingDraft = localStorage.getItem('profile_setup_mobile_draft');
    
    // Check if existing data belongs to the SAME user
    let isSameUser = false;
    if (existingProfileStr) {
      try {
        const existingProfile = JSON.parse(existingProfileStr);
        isSameUser = existingProfile.email === currentUserEmail;
      } catch (e) {
        console.error('Failed to parse existing profile:', e);
      }
    }
    
    if (existingDraft && !isSameUser) {
      try {
        const draftProfile = JSON.parse(existingDraft);
        isSameUser = draftProfile.email === currentUserEmail;
      } catch (e) {
        console.error('Failed to parse draft profile:', e);
      }
    }
    
    // Only warn if the SAME user is overwriting their own profile
    if (isSameUser && (existingProfileStr || existingDraft)) {
      const confirmed = window.confirm(
        '⚠️ Profile Data Already Exists!\n\n' +
        `You (${currentUserEmail}) have existing profile data that will be REPLACED.\n\n` +
        '📋 What happens next:\n' +
        '• Your old profile data will be OVERWRITTEN\n' +
        '• All previous settings will be LOST\n' +
        '• This action CANNOT be undone\n\n' +
        'Do you want to CONTINUE and replace your existing profile?'
      );
      
      if (!confirmed) {
        showNotification('info', 'Profile update cancelled. Your existing data is safe.');
        return; // User cancelled, don't proceed
      }
      
      // User confirmed, log the action
      console.log('✅ User confirmed profile replacement (mobile):', currentUserEmail);
      trackEvent('profile_replacement_confirmed', {
        isMobile: true,
        userEmail: currentUserEmail,
        hadExistingProfile: !!existingProfileStr,
        hadExistingDraft: !!existingDraft
      });
    } else if ((existingProfileStr || existingDraft) && !isSameUser) {
      // Different user - clear old data silently
      console.log('🔄 New user detected (mobile), clearing previous user data');
      localStorage.removeItem('user_profile_data');
      localStorage.removeItem('profile_setup_mobile_draft');
    }

    setLoading(true);
    try {
      // Validate all steps
      let allValid = true;
      let firstInvalidStep = 0;
      for (let i = 0; i < MOBILE_STEPS.length - 1; i++) {
        if (!validateMobileStep(i)) {
          allValid = false;
          if (firstInvalidStep === 0) {
            firstInvalidStep = i;
          }
        }
      }
      
      if (!allValid) {
        const stepName = MOBILE_STEPS[firstInvalidStep]?.title || 'Unknown';
        showNotification('error', `Please complete required fields in: ${stepName}`);
        setCurrentStep(firstInvalidStep);
        setLoading(false);
        return;
      }

      // Normalization functions
      const normalizeValue = (value: any): any => {
        if (typeof value === 'string') {
          return value.toLowerCase().replace(/ /g, '-');
        }
        if (Array.isArray(value)) {
          return value.map(v => typeof v === 'string' ? v.toLowerCase() : v);
        }
        return value;
      };

      const normalizeGender = (gender: string): string => {
        if (!gender) {
          console.error('❌ Gender is empty or undefined!', { gender });
          return '';
        }
        const genderMap: Record<string, string> = {
          'Male': 'man',
          'Female': 'woman',
          'Non-binary': 'non-binary',
          'Other': 'other',
          'Prefer not to say': 'other'
        };
        const normalized = genderMap[gender] || gender.toLowerCase();
        console.log('🔧 Gender normalization (mobile):', { input: gender, output: normalized });
        return normalized;
      };

      const normalizeSmokingStatus = (status: string): string => {
        if (!status) return '';
        const statusMap: Record<string, string> = {
          'Never': 'never',
          'Occasionally': 'occasionally',
          'Socially': 'occasionally',
          'Regularly': 'regularly',
          'Trying to quit': 'trying-to-quit',
          'Prefer not to say': 'prefer-not-to-say'
        };
        const normalized = statusMap[status] || status.toLowerCase().replace(/ /g, '-');
        console.log('🔧 Smoking status normalization (mobile):', { input: status, output: normalized });
        return normalized;
      };

      const normalizeDrinkingStatus = (status: string): string => {
        if (!status) return '';
        const statusMap: Record<string, string> = {
          'Never': 'never',
          'Rarely': 'occasionally',
          'Occasionally': 'occasionally',
          'Socially': 'socially',
          'Regularly': 'regularly',
          'Prefer not to say': 'prefer-not-to-say'
        };
        const normalized = statusMap[status] || status.toLowerCase().replace(/ /g, '-');
        console.log('🔧 Drinking status normalization (mobile):', { input: status, output: normalized });
        return normalized;
      };

      // Create payload with normalized values
      const profilePayload = {
        ...profileData,
        email: signupData?.email || currentUserEmail || '',
        gender: normalizeGender(profileData.gender),
        smokingStatus: normalizeSmokingStatus(profileData.smokingStatus),
        drinkingStatus: normalizeDrinkingStatus(profileData.drinkingStatus),
        bodyType: normalizeValue(profileData.bodyType),
        politicalViews: normalizeValue(profileData.politicalViews),
        profilePhotos: undefined,
        photoDescriptions: undefined,
      };

      console.log('📤 Sending mobile profile payload:', {
        gender: profilePayload.gender,
        smokingStatus: profilePayload.smokingStatus,
        drinkingStatus: profilePayload.drinkingStatus,
        displayName: profilePayload.displayName,
        email: profilePayload.email
      });

      const response = await axios.post(`${API_URL}/api/profile/setup`, profilePayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Enable-Embeddings': 'true',
        },
        timeout: 30000,
      });

      if (response.data.success) {
        // Queue mobile-specific embeddings
        await enqueueEmbedding({
          type: 'preference',
          data: {
            isMobile: true,
            interests: profileData.interests,
            hobbies: profileData.hobbies,
            musicGenres: profileData.musicGenres,
            lifestyle: { occupation: profileData.occupation, education: profileData.education },
            completionMethod: 'mobile_wizard'
          },
          userId: response.data.userId || 'temp-user',
          sessionId: 'mobile-profile-setup'
        });

        localStorage.removeItem('profile_setup_mobile_draft');
        localStorage.removeItem('4ulove_signup_data');
        showNotification('success', 'Profile created! 🎉');
        
        trackFormSubmission('mobile_profile_setup', { success: true });
        trackEvent('mobile_profile_completed', {
          totalSteps: MOBILE_STEPS.length,
          deviceType: 'mobile',
          completionTime: Date.now()
        });

        setTimeout(() => {
          router.push('/quantum_face');
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to create profile';
      console.error('❌ Mobile profile creation error:', error.response?.data);
      showNotification('error', errorMessage);
      trackFormSubmission('mobile_profile_setup', { success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 relative overflow-hidden">
        {/* Mobile background - performance optimized */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-5 w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute bottom-10 left-5 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-xl"></div>
        </div>

        {/* Mobile Header */}
        <div className="relative z-10 p-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Profile Setup</h1>
                <p className="text-xs text-white/80">Step {currentStep + 1} of {MOBILE_STEPS.length}</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Mobile Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                {MOBILE_STEPS[currentStep].title}
              </span>
              <span className="text-sm text-white/60">
                {Math.round(((currentStep + 1) / MOBILE_STEPS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / MOBILE_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Mobile Step Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {MOBILE_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCurrent ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110' : 
                    isCompleted ? 'bg-green-500' : 'bg-white/20'}
                `}>
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Icon className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-white/60'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Step Content */}
        <div className="px-4 pb-24">
          <div className="bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderMobileStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Sticky Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white backdrop-blur-md border-t border-white/20 p-4 z-20">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 min-h-[48px]
                ${currentStep === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                }
              `}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="text-center px-4">
              <div className="text-xs text-gray-500">
                {completedSteps.size} of {MOBILE_STEPS.length} done
              </div>
            </div>

            {currentStep === MOBILE_STEPS.length - 1 ? (
              <button
                onClick={handleMobileSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 min-h-[48px]"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Complete</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 min-h-[48px]"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Notification System */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Amore Assistant */}
      <AmoreAssistant context="setup_profile_mobile" variant="mobile" />
    </>
  );

  function renderMobileStepContent() {
    const step = MOBILE_STEPS[currentStep];
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">
            <step.icon className="h-12 w-12 text-purple-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{step.title}</h2>
          <p className="text-gray-600 text-sm">Complete the fields below to continue</p>
        </div>

        {/* Mobile-optimized form fields based on step */}
        <div className="space-y-4">
          {step.id === 'basic' && (
            <>
              {/* Display Name */}
              <div className={errors.displayName ? 'border-2 border-red-300 rounded-xl p-2' : ''}>
                <label className="block text-sm font-bold text-gray-800 mb-2">Display Name *</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How should others see your name?"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
                {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
              </div>

              {/* Enhanced Location (Global/Hyper-Local) - Matching Desktop */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Location * <span className="text-xs text-purple-600">(Global/Hyper-Local for Better Matches)</span>
                </label>
                
                {/* Country Dropdown */}
                <select
                  value={profileData.location.country}
                  onChange={(e) => handleInputChange('location', {...profileData.location, country: e.target.value})}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base mb-3"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">🌍 Select Country</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="France">🇫🇷 France</option>
                  <option value="Spain">🇪🇸 Spain</option>
                  <option value="Italy">🇮🇹 Italy</option>
                  <option value="Netherlands">🇳🇱 Netherlands</option>
                  <option value="Sweden">🇸🇪 Sweden</option>
                  <option value="Norway">🇳🇴 Norway</option>
                  <option value="Denmark">🇩🇰 Denmark</option>
                  <option value="Brazil">🇧🇷 Brazil</option>
                  <option value="Mexico">🇲🇽 Mexico</option>
                  <option value="Japan">🇯🇵 Japan</option>
                  <option value="South Korea">🇰🇷 South Korea</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="India">🇮🇳 India</option>
                  <option value="Other">🌐 Other</option>
                </select>

                {/* State and City */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className={errors.state ? 'border-2 border-red-300 rounded-xl' : ''}>
                    <input
                      type="text"
                      value={profileData.location.state}
                      onChange={(e) => handleInputChange('location', {...profileData.location, state: e.target.value})}
                      placeholder="🏛️ State/Province"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1 px-2">{errors.state}</p>}
                  </div>
                  <div className={errors.city ? 'border-2 border-red-300 rounded-xl' : ''}>
                    <input
                      type="text"
                      value={profileData.location.city}
                      onChange={(e) => handleInputChange('location', {...profileData.location, city: e.target.value})}
                      placeholder="🏙️ City"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1 px-2">{errors.city}</p>}
                  </div>
                </div>

                {/* ZIP and Neighborhood */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={profileData.location.zipCode}
                    onChange={(e) => handleInputChange('location', {...profileData.location, zipCode: e.target.value})}
                    placeholder="📮 ZIP/Postal Code"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  />
                  <input
                    type="text"
                    value={profileData.location.neighborhood}
                    onChange={(e) => handleInputChange('location', {...profileData.location, neighborhood: e.target.value})}
                    placeholder="🏘️ Neighborhood (Optional)"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  />
                </div>

                {/* Location Helper Text */}
                <p className="text-xs text-gray-500">🎯 Hyper-local data helps AMORE find your perfect matches nearby</p>
              </div>

              {/* Email (Read-Only - Relational Integrity Check) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email * <span className="text-xs text-green-600">(Verified from Signup ✓)</span>
                </label>
                <input
                  type="email"
                  value={signupData?.email || ''}
                  disabled
                  readOnly
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                  style={{ minHeight: '48px' }}
                  placeholder="Your verified email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Email cannot be changed here for security. This matches your signup email.
                </p>
              </div>

              {/* Gender */}
              <div className={errors.gender ? 'border-2 border-red-300 rounded-xl p-2' : ''}>
                <label className="block text-sm font-bold text-gray-800 mb-2">Gender *</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>

              {/* Date of Birth (Age Verification) */}
              <div className={errors.dateOfBirth ? 'border-2 border-red-300 rounded-xl p-2' : ''}>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Date of Birth * <span className="text-xs text-purple-600">(Age Verification)</span>
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    setProfileData(prev => ({ 
                      ...prev, 
                      dateOfBirth: dob,
                      verificationDOB: dob,
                      ageVerificationSource: 'user_input'
                    }));
                  }}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                <p className="text-xs text-gray-500 mt-1">🔒 Secure age verification for authentic connections</p>
              </div>

              {/* Height - Copied from Desktop */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Height</label>
                <select
                  value={profileData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select height</option>
                  <option value="147">4'10" (147 cm)</option>
                  <option value="150">4'11" (150 cm)</option>
                  <option value="152">5'0" (152 cm)</option>
                  <option value="155">5'1" (155 cm)</option>
                  <option value="157">5'2" (157 cm)</option>
                  <option value="160">5'3" (160 cm)</option>
                  <option value="163">5'4" (163 cm)</option>
                  <option value="165">5'5" (165 cm)</option>
                  <option value="168">5'6" (168 cm)</option>
                  <option value="170">5'7" (170 cm)</option>
                  <option value="173">5'8" (173 cm)</option>
                  <option value="175">5'9" (175 cm)</option>
                  <option value="178">5'10" (178 cm)</option>
                  <option value="180">5'11" (180 cm)</option>
                  <option value="183">6'0" (183 cm)</option>
                  <option value="185">6'1" (185 cm)</option>
                  <option value="188">6'2" (188 cm)</option>
                  <option value="191">6'3" (191 cm)</option>
                  <option value="193">6'4" (193 cm)</option>
                  <option value="196">6'5" (196 cm)</option>
                  <option value="198">6'6" (198 cm)</option>
                </select>
              </div>

              {/* Occupation - Copied from Desktop */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Occupation</label>
                <input
                  type="text"
                  value={profileData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="What do you do for work?"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              {/* Education - Copied from Desktop */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Education</label>
                <select
                  value={profileData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Some College">Some College</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Trade School">Trade School</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Body Type - Copied from Desktop */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Body Type</label>
                <select
                  value={profileData.bodyType}
                  onChange={(e) => handleInputChange('bodyType', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select body type</option>
                  <option value="Slim">Slim</option>
                  <option value="Athletic">Athletic</option>
                  <option value="Average">Average</option>
                  <option value="Curvy">Curvy</option>
                  <option value="Full-figured">Full-figured</option>
                  <option value="Muscular">Muscular</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Enhanced Bio (AI-Powered) */}
              <div className={errors.bio ? 'border-2 border-red-300 rounded-xl p-2' : ''}>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  About Me * <span className="text-xs text-purple-600">(AI-Powered Personality Analysis)</span>
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell others about yourself, your interests, what you're looking for, your values, lifestyle, dreams... The more detail, the better AMORE can find your perfect match!"
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base resize-none"
                  style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                  <p className="text-gray-400 text-xs ml-auto">{profileData.bio.length}/1000 characters</p>
                </div>
                <p className="text-xs text-purple-600 mt-1">🤖 AMORE analyzes your words for deeper compatibility</p>
              </div>
            </>
          )}

          {step.id === 'interests_personality' && (
            <>
              {/* Music & Entertainment */}
              <div className={`border-2 rounded-xl p-4 ${
                errors.musicGenres ? 'border-red-400 bg-red-50/30' : 'border-purple-200/50 bg-white/50'
              }`}>
                <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                  🎵 Music & Entertainment
                  {errors.musicGenres && <span className="text-red-500 text-sm ml-2">*</span>}
                </h4>
                {errors.musicGenres && (
                  <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded-lg p-3">
                    {errors.musicGenres}
                  </div>
                )}
                <label className="block text-sm font-bold text-gray-800 mb-3">🎵 Favorite Music Genres</label>
                <div className="flex flex-wrap gap-2">
                  {['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Reggae', 'Folk', 'Indie', 'Metal'].map((genre) => {
                    const isSelected = profileData.musicGenres?.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => {
                          const genres = profileData.musicGenres || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, musicGenres: genres.filter(g => g !== genre) }));
                          } else {
                            setProfileData(prev => ({ ...prev, musicGenres: [...genres, genre] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Favorite Artist/Band</label>
                <input
                  type="text"
                  value={profileData.favoriteArtist || ''}
                  onChange={(e) => handleInputChange('favoriteArtist', e.target.value)}
                  placeholder="Who's your favorite artist?"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              {/* Hobbies & Activities */}
              <div className={`border-2 rounded-xl p-4 ${
                errors.hobbies ? 'border-red-400 bg-red-50/30' : 'border-purple-200/50 bg-white/50'
              }`}>
                <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                  🎯 Hobbies & Activities
                  {errors.hobbies && <span className="text-red-500 text-sm ml-2">*</span>}
                </h4>
                {errors.hobbies && (
                  <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded-lg p-3">
                    {errors.hobbies}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {['Reading', 'Writing', 'Photography', 'Painting', 'Drawing', 'Cooking', 'Baking', 'Gardening', 'Hiking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Dancing', 'Singing', 'Playing Music', 'Gaming', 'Board Games', 'Chess', 'Puzzles', 'Crafting', 'Knitting', 'Woodworking', 'DIY', 'Traveling', 'Learning Languages', 'Meditation', 'Volunteering', 'Collecting', 'Astronomy', 'Fitness', 'Martial Arts', 'Rock Climbing', 'Surfing', 'Skiing', 'Camping'].map((hobby) => {
                    const isSelected = profileData.hobbies?.includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => {
                          const hobbies = profileData.hobbies || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, hobbies: hobbies.filter(h => h !== hobby) }));
                          } else {
                            setProfileData(prev => ({ ...prev, hobbies: [...hobbies, hobby] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {hobby}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle & Preferences */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Favorite Cuisine</label>
                <select
                  value={profileData.favoriteFood || ''}
                  onChange={(e) => handleInputChange('favoriteFood', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select favorite cuisine</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Asian">Asian</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="American">American</option>
                  <option value="French">French</option>
                  <option value="Indian">Indian</option>
                  <option value="Thai">Thai</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Greek">Greek</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Favorite Sport</label>
                <input
                  type="text"
                  value={profileData.favoriteSport || ''}
                  onChange={(e) => handleInputChange('favoriteSport', e.target.value)}
                  placeholder="What sport do you love?"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Dream Luxury</label>
                <select
                  value={profileData.dreamLuxury || ''}
                  onChange={(e) => handleInputChange('dreamLuxury', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">What's your dream luxury?</option>
                  <option value="car">Dream Car</option>
                  <option value="house">Dream House</option>
                  <option value="jet">Private Jet</option>
                  <option value="beach home">Beach Home</option>
                  <option value="yacht">Yacht</option>
                  <option value="travel">World Travel</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Place You Love Most</label>
                <input
                  type="text"
                  value={profileData.placeLovedMost || ''}
                  onChange={(e) => handleInputChange('placeLovedMost', e.target.value)}
                  placeholder="Your favorite place in the world"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              {/* Travel & Dreams */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Dream Trip Destination</label>
                <input
                  type="text"
                  value={profileData.dreamTrip || ''}
                  onChange={(e) => handleInputChange('dreamTrip', e.target.value)}
                  placeholder="Where would you love to travel?"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Next Trip Plan</label>
                <input
                  type="text"
                  value={profileData.nextTripPlan || ''}
                  onChange={(e) => handleInputChange('nextTripPlan', e.target.value)}
                  placeholder="Where are you planning to go next?"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              {/* Conversation Starters */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Life Philosophy</label>
                <textarea
                  value={profileData.lifePhilosophy || ''}
                  onChange={(e) => handleInputChange('lifePhilosophy', e.target.value)}
                  placeholder="What's your philosophy on life? What drives you?"
                  rows={3}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base resize-none"
                  style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Best Childhood Memory</label>
                <textarea
                  value={profileData.childhoodMemory || ''}
                  onChange={(e) => handleInputChange('childhoodMemory', e.target.value)}
                  placeholder="Share a favorite memory from your childhood"
                  rows={3}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base resize-none"
                  style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              {/* AMORE AI Analysis Notice */}
              <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-200/40 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1"></div>
                  <div>
                    <p className="text-sm font-bold text-purple-800 mb-1">🤖 AMORE Personality Analysis</p>
                    <p className="text-xs text-gray-600">
                      These interests and personality traits help AMORE understand your conversation style, shared interests potential, and lifestyle compatibility for quantum-level matching precision.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: PHYSICAL */}
          {step.id === 'physical' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Height *</label>
                <select
                  value={profileData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select height...</option>
                  <option value="147">4'10" (147 cm)</option>
                  <option value="150">4'11" (150 cm)</option>
                  <option value="152">5'0" (152 cm)</option>
                  <option value="155">5'1" (155 cm)</option>
                  <option value="157">5'2" (157 cm)</option>
                  <option value="160">5'3" (160 cm)</option>
                  <option value="163">5'4" (163 cm)</option>
                  <option value="165">5'5" (165 cm)</option>
                  <option value="168">5'6" (168 cm)</option>
                  <option value="170">5'7" (170 cm)</option>
                  <option value="173">5'8" (173 cm)</option>
                  <option value="175">5'9" (175 cm)</option>
                  <option value="178">5'10" (178 cm)</option>
                  <option value="180">5'11" (180 cm)</option>
                  <option value="183">6'0" (183 cm)</option>
                  <option value="185">6'1" (185 cm)</option>
                  <option value="188">6'2" (188 cm)</option>
                  <option value="191">6'3" (191 cm)</option>
                  <option value="193">6'4" (193 cm)</option>
                  <option value="196">6'5" (196 cm)</option>
                  <option value="198">6'6" (198 cm)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Body Type *</label>
                <div className="flex flex-wrap gap-2">
                  {['Slim', 'Athletic', 'Average', 'Curvy', 'Full-figured', 'Muscular', 'Petite', 'Plus-size', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('bodyType', type)}
                      className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                        profileData.bodyType === type
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      {profileData.bodyType === type && <Check className="inline-block w-4 h-4 mr-1" />}
                      {type}
                    </button>
                  ))}
                </div>
                {errors.bodyType && <p className="text-red-500 text-sm mt-1">{errors.bodyType}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Eye Color *</label>
                <select
                  value={profileData.eyeColor}
                  onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select eye color</option>
                  <option value="Brown">Brown</option>
                  <option value="Blue">Blue</option>
                  <option value="Green">Green</option>
                  <option value="Hazel">Hazel</option>
                  <option value="Gray">Gray</option>
                  <option value="Amber">Amber</option>
                  <option value="Other">Other</option>
                </select>
                {errors.eyeColor && <p className="text-red-500 text-sm mt-1">{errors.eyeColor}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Ethnicity *</label>
                <select
                  value={profileData.ethnicity}
                  onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select ethnicity</option>
                  <option value="Asian">Asian</option>
                  <option value="Black/African American">Black/African American</option>
                  <option value="Hispanic/Latino">Hispanic/Latino</option>
                  <option value="White/Caucasian">White/Caucasian</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="Native American">Native American</option>
                  <option value="Pacific Islander">Pacific Islander</option>
                  <option value="Mixed/Multiracial">Mixed/Multiracial</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.ethnicity && <p className="text-red-500 text-sm mt-1">{errors.ethnicity}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Hair Color</label>
                <select
                  value={profileData.hairColor}
                  onChange={(e) => handleInputChange('hairColor', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="">Select hair color</option>
                  <option value="Black">Black</option>
                  <option value="Brown">Brown</option>
                  <option value="Blonde">Blonde</option>
                  <option value="Red">Red</option>
                  <option value="Auburn">Auburn</option>
                  <option value="Gray">Gray</option>
                  <option value="White">White</option>
                  <option value="Bald">Bald</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Background & Lifestyle Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Background & Lifestyle</h3>

                <div className="space-y-4">
                  {/* Religion */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Religion</label>
                    <select
                      value={profileData.religion}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select religion</option>
                      <option value="Christian">Christian</option>
                      <option value="Catholic">Catholic</option>
                      <option value="Jewish">Jewish</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Atheist">Atheist</option>
                      <option value="Agnostic">Agnostic</option>
                      <option value="Spiritual">Spiritual</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Political Views */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Political Views</label>
                    <select
                      value={profileData.politicalViews}
                      onChange={(e) => handleInputChange('politicalViews', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select political views</option>
                      <option value="Liberal">Liberal</option>
                      <option value="Conservative">Conservative</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Independent">Independent</option>
                      <option value="Libertarian">Libertarian</option>
                      <option value="Progressive">Progressive</option>
                      <option value="Not political">Not political</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Smoking Status */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Smoking Status</label>
                    <select
                      value={profileData.smokingStatus}
                      onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select smoking status</option>
                      <option value="Never">Never</option>
                      <option value="Occasionally">Occasionally</option>
                      <option value="Socially">Socially</option>
                      <option value="Regularly">Regularly</option>
                      <option value="Trying to quit">Trying to quit</option>
                    </select>
                  </div>

                  {/* Drinking Status */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Drinking Status</label>
                    <select
                      value={profileData.drinkingStatus}
                      onChange={(e) => handleInputChange('drinkingStatus', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select drinking status</option>
                      <option value="Never">Never</option>
                      <option value="Rarely">Rarely</option>
                      <option value="Socially">Socially</option>
                      <option value="Regularly">Regularly</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Has Children */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Do you have children?</label>
                    <select
                      value={profileData.hasChildren}
                      onChange={(e) => handleInputChange('hasChildren', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select option</option>
                      <option value="No">No</option>
                      <option value="Yes, living with me">Yes, living with me</option>
                      <option value="Yes, not living with me">Yes, not living with me</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Wants Children */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Do you want children?</label>
                    <select
                      value={profileData.wantsChildren}
                      onChange={(e) => handleInputChange('wantsChildren', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Maybe">Maybe</option>
                      <option value="Open to it">Open to it</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* AMORE Compatibility Analysis Notice */}
                <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-200/40 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1"></div>
                    <div>
                      <p className="text-sm font-bold text-purple-800 mb-1">🤖 AMORE Compatibility Analysis</p>
                      <p className="text-xs text-gray-600">
                        Physical attributes and background information help AMORE find matches with compatible lifestyles, values, and physical preferences for deeper compatibility beyond surface-level attraction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 4: LIFESTYLE */}
          {step.id === 'lifestyle' && (
            <>
              {/* Career & Education Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💼 Career & Education</h3>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Occupation *</label>
                  <input
                    type="text"
                    value={profileData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="What do you do?"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Education *</label>
                  <select
                    value={profileData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  >
                    <option value="">Select education level</option>
                    <option value="High School">High School</option>
                    <option value="Some College">Some College</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate/PhD">Doctorate/PhD</option>
                    <option value="Professional Degree">Professional Degree</option>
                    <option value="Trade School">Trade School</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Income Range (Optional)</label>
                  <select
                    value={profileData.income}
                    onChange={(e) => handleInputChange('income', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Under $25,000">Under $25,000</option>
                    <option value="$25,000 - $35,000">$25,000 - $35,000</option>
                    <option value="$35,000 - $50,000">$35,000 - $50,000</option>
                    <option value="$50,000 - $75,000">$50,000 - $75,000</option>
                    <option value="$75,000 - $100,000">$75,000 - $100,000</option>
                    <option value="$100,000 - $150,000">$100,000 - $150,000</option>
                    <option value="$150,000 - $250,000">$150,000 - $250,000</option>
                    <option value="Over $250,000">Over $250,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Career Ambitions</label>
                  <textarea
                    value={profileData.careerAmbitions || ''}
                    onChange={(e) => handleInputChange('careerAmbitions', e.target.value)}
                    placeholder="Share your career goals and aspirations..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base resize-none"
                    style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  />
                </div>
              </div>

              {/* Living Situation Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏠 Living Situation</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Living Arrangement *</label>
                    <select
                      value={profileData.livingArrangement}
                      onChange={(e) => handleInputChange('livingArrangement', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select living arrangement</option>
                      <option value="Live alone">Live alone</option>
                      <option value="Live with roommates">Live with roommates</option>
                      <option value="Live with family">Live with family</option>
                      <option value="Live with partner">Live with partner</option>
                      <option value="Live with children">Live with children</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.livingArrangement && <p className="text-red-500 text-sm mt-1">{errors.livingArrangement}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Transportation</label>
                    <select
                      value={profileData.transportationMode}
                      onChange={(e) => handleInputChange('transportationMode', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select transportation</option>
                      <option value="Own car">Own car</option>
                      <option value="Public transportation">Public transportation</option>
                      <option value="Bike">Bike</option>
                      <option value="Walk">Walk</option>
                      <option value="Rideshare/Taxi">Rideshare/Taxi</option>
                      <option value="Multiple options">Multiple options</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Pet Preference</label>
                    <select
                      value={profileData.petPreference}
                      onChange={(e) => handleInputChange('petPreference', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select pet preference</option>
                      <option value="Love pets, have some">Love pets, have some</option>
                      <option value="Love pets, don't have any">Love pets, don't have any</option>
                      <option value="Like pets">Like pets</option>
                      <option value="Allergic to pets">Allergic to pets</option>
                      <option value="Don't like pets">Don't like pets</option>
                      <option value="No preference">No preference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Social Media Usage</label>
                    <select
                      value={profileData.socialMediaUsage}
                      onChange={(e) => handleInputChange('socialMediaUsage', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select usage level</option>
                      <option value="Very active">Very active</option>
                      <option value="Moderately active">Moderately active</option>
                      <option value="Rarely use">Rarely use</option>
                      <option value="Don't use social media">Don't use social media</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Weekend & Free Time Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎉 Weekend & Free Time</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Typical Weekend Activities</label>
                    <div className="flex flex-wrap gap-2">
                      {['Staying home', 'Going out with friends', 'Outdoor activities', 'Sports', 'Shopping', 'Movies/Theater', 'Restaurants', 'Bars/Clubs', 'Museums/Culture', 'Reading', 'Cooking', 'Traveling', 'Family time', 'Volunteering', 'Fitness/Gym', 'Hobbies', 'Netflix/TV', 'Gaming', 'Nature/Hiking', 'Beach/Pool'].map((activity) => {
                        const isSelected = profileData.weekendActivities?.includes(activity);
                        return (
                          <button
                            key={activity}
                            type="button"
                            onClick={() => {
                              const activities = profileData.weekendActivities || [];
                              if (isSelected) {
                                setProfileData(prev => ({ ...prev, weekendActivities: activities.filter(a => a !== activity) }));
                              } else {
                                setProfileData(prev => ({ ...prev, weekendActivities: [...activities, activity] }));
                              }
                            }}
                            className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                              isSelected
                                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                            }`}
                            style={{ minHeight: '48px' }}
                          >
                            {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                            {activity}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Financial Goals & Priorities</label>
                    <textarea
                      value={profileData.financialGoals || ''}
                      onChange={(e) => handleInputChange('financialGoals', e.target.value)}
                      placeholder="Share your financial goals and what matters to you financially..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base resize-none"
                      style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    />
                    <p className="text-gray-400 text-xs mt-1 text-right">{(profileData.financialGoals || '').length}/500</p>
                  </div>
                </div>

                {/* AMORE Lifestyle Compatibility Notice */}
                <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-200/40 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1"></div>
                    <div>
                      <p className="text-sm font-bold text-purple-800 mb-1">🤖 AMORE Lifestyle Compatibility</p>
                      <p className="text-xs text-gray-600">
                        Your lifestyle information helps AMORE match you with people who share similar daily routines, career ambitions, living situations, and weekend preferences for long-term compatibility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 5: INTERESTS */}
          {step.id === 'interests' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">❤️ Core Interests</label>
                <div className="flex flex-wrap gap-2">
                  {['Art & Design', 'Music', 'Photography', 'Writing', 'Reading', 'Movies & TV', 'Theater', 'Dancing', 'Singing', 'Comedy', 'Fashion', 'Beauty', 'Travel', 'Adventure', 'Hiking', 'Camping', 'Beach', 'Mountains', 'Sports', 'Fitness', 'Yoga', 'Running', 'Cycling', 'Swimming', 'Cooking', 'Baking', 'Wine Tasting', 'Coffee', 'Food & Dining', 'Nutrition', 'Technology', 'Gaming', 'Science', 'History', 'Politics', 'Philosophy', 'Spirituality', 'Meditation', 'Volunteering', 'Environment', 'Animals', 'Pets', 'Business', 'Entrepreneurship', 'Investing', 'Real Estate', 'Cars', 'Motorcycles', 'Gardening', 'DIY Projects', 'Crafting', 'Collecting', 'Antiques', 'Vintage'].map((hobby) => {
                    const isSelected = profileData.hobbies?.includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => {
                          const hobbies = profileData.hobbies || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, hobbies: hobbies.filter(h => h !== hobby) }));
                          } else {
                            setProfileData(prev => ({ ...prev, hobbies: [...hobbies, hobby] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {hobby}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">🎬 Movies & TV Shows</label>
                <div className="flex flex-wrap gap-2">
                  {['Action', 'Adventure', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Horror', 'Sci-Fi', 'Fantasy', 'Mystery', 'Crime', 'Documentary', 'Animation', 'Musical', 'Western', 'War', 'Biography', 'History', 'Reality TV', 'Talk Shows', 'News', 'Sports', 'Cooking Shows', 'Travel Shows'].map((genre) => {
                    const isSelected = profileData.movieGenres?.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => {
                          const genres = profileData.movieGenres || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, movieGenres: genres.filter(g => g !== genre) }));
                          } else {
                            setProfileData(prev => ({ ...prev, movieGenres: [...genres, genre] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">🍽️ Food & Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {['Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'Mediterranean', 'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'American', 'BBQ', 'Seafood', 'Steakhouse', 'Pizza', 'Sushi', 'Vegetarian', 'Vegan', 'Organic', 'Farm-to-Table', 'Fast Food', 'Street Food', 'Fine Dining', 'Casual Dining', 'Food Trucks', 'Brunch', 'Desserts', 'Ice Cream'].map((cuisine) => {
                    const isSelected = profileData.cuisinePreferences?.includes(cuisine);
                    return (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => {
                          const cuisines = profileData.cuisinePreferences || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, cuisinePreferences: cuisines.filter(c => c !== cuisine) }));
                          } else {
                            setProfileData(prev => ({ ...prev, cuisinePreferences: [...cuisines, cuisine] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {cuisine}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">✈️ Travel & Adventure Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Beach vacations', 'City exploration', 'Mountain retreats', 'Road trips', 'Backpacking', 'Luxury travel', 'Budget travel', 'Cultural tours', 'Adventure sports', 'Camping', 'Cruises', 'Solo travel', 'Group travel', 'International travel', 'Domestic travel', 'Weekend getaways'].map((style) => {
                    const isSelected = profileData.travelStyle?.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          const styles = profileData.travelStyle || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, travelStyle: styles.filter(s => s !== style) }));
                          } else {
                            setProfileData(prev => ({ ...prev, travelStyle: [...styles, style] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">💪 Fitness & Physical Activities</label>
                <div className="flex flex-wrap gap-2">
                  {['Gym/Weightlifting', 'Running', 'Yoga', 'Swimming', 'Cycling', 'Pilates', 'CrossFit', 'Martial Arts', 'Boxing', 'Dancing', 'Rock Climbing', 'Hiking', 'Tennis', 'Basketball', 'Soccer', 'Golf', 'Skiing', 'Snowboarding', 'Surfing', 'Skateboarding', 'Volleyball', 'Baseball', 'Football', 'Hockey'].map((activity) => {
                    const isSelected = profileData.fitnessActivities?.includes(activity);
                    return (
                      <button
                        key={activity}
                        type="button"
                        onClick={() => {
                          const activities = profileData.fitnessActivities || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, fitnessActivities: activities.filter(a => a !== activity) }));
                          } else {
                            setProfileData(prev => ({ ...prev, fitnessActivities: [...activities, activity] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {activity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">📚 Books & Literature</label>
                <div className="flex flex-wrap gap-2">
                  {['Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Psychology', 'Philosophy', 'Poetry', 'Comics', 'Graphic Novels', 'Young Adult', 'Classic Literature', 'Audiobooks', 'E-books', 'Physical Books', 'Book Clubs', 'Literary Magazines', 'Writing'].map((genre) => {
                    const isSelected = profileData.booksGenres?.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => {
                          const genres = profileData.booksGenres || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, booksGenres: genres.filter(g => g !== genre) }));
                          } else {
                            setProfileData(prev => ({ ...prev, booksGenres: [...genres, genre] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AMORE Interest Matching Notice */}
              <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-200/40 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1"></div>
                  <div>
                    <p className="text-sm font-bold text-purple-800 mb-1">🤖 AMORE Interest Matching</p>
                    <p className="text-xs text-gray-600">
                      Your interests help AMORE find people who share your passions and can engage in meaningful conversations about the things you love. Shared interests are the foundation of lasting connections.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 6: DATING */}
          {step.id === 'dating' && (
            <>
              {/* What Are You Looking For Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💕 What Are You Looking For?</h3>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Relationship Goals *</label>
                  <select
                    value={profileData.relationshipGoals}
                    onChange={(e) => handleInputChange('relationshipGoals', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  >
                    <option value="">Select your goal</option>
                    <option value="Marriage">Marriage</option>
                    <option value="Long-term relationship">Long-term relationship</option>
                    <option value="Short-term relationship">Short-term relationship</option>
                    <option value="Dating to see what happens">Dating to see what happens</option>
                    <option value="Friendship">Friendship</option>
                    <option value="Casual dating">Casual dating</option>
                    <option value="Something serious">Something serious</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                  {errors.relationshipGoals && <p className="text-red-500 text-sm mt-1">{errors.relationshipGoals}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Family Orientation</label>
                  <select
                    value={profileData.familyOrientation || ''}
                    onChange={(e) => handleInputChange('familyOrientation', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                    style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  >
                    <option value="">Select orientation</option>
                    <option value="Family is everything">Family is everything</option>
                    <option value="Family is important">Family is important</option>
                    <option value="Family is somewhat important">Family is somewhat important</option>
                    <option value="Family is not a priority">Family is not a priority</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Communication & Connection Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💬 Communication & Connection</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Love Language *</label>
                    <select
                      value={profileData.loveLanguage}
                      onChange={(e) => handleInputChange('loveLanguage', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select your love language</option>
                      <option value="Words of Affirmation">Words of Affirmation</option>
                      <option value="Quality Time">Quality Time</option>
                      <option value="Physical Touch">Physical Touch</option>
                      <option value="Acts of Service">Acts of Service</option>
                      <option value="Receiving Gifts">Receiving Gifts</option>
                    </select>
                    {errors.loveLanguage && <p className="text-red-500 text-sm mt-1">{errors.loveLanguage}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Communication Style *</label>
                    <select
                      value={profileData.communicationStyle}
                      onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select your style</option>
                      <option value="Direct and honest">Direct and honest</option>
                      <option value="Gentle and understanding">Gentle and understanding</option>
                      <option value="Playful and humorous">Playful and humorous</option>
                      <option value="Deep and meaningful">Deep and meaningful</option>
                      <option value="Casual and easygoing">Casual and easygoing</option>
                      <option value="Thoughtful and considerate">Thoughtful and considerate</option>
                    </select>
                    {errors.communicationStyle && <p className="text-red-500 text-sm mt-1">{errors.communicationStyle}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Conflict Resolution Style</label>
                    <select
                      value={profileData.conflictResolution || ''}
                      onChange={(e) => handleInputChange('conflictResolution', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select your approach</option>
                      <option value="Talk it out immediately">Talk it out immediately</option>
                      <option value="Take time to cool down first">Take time to cool down first</option>
                      <option value="Find compromise">Find compromise</option>
                      <option value="Avoid confrontation">Avoid confrontation</option>
                      <option value="Seek to understand first">Seek to understand first</option>
                      <option value="Focus on solutions">Focus on solutions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Personality Type (Optional)</label>
                    <select
                      value={profileData.personalityType || ''}
                      onChange={(e) => handleInputChange('personalityType', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select if known</option>
                      <option value="INTJ - The Architect">INTJ - The Architect</option>
                      <option value="INTP - The Thinker">INTP - The Thinker</option>
                      <option value="ENTJ - The Commander">ENTJ - The Commander</option>
                      <option value="ENTP - The Debater">ENTP - The Debater</option>
                      <option value="INFJ - The Advocate">INFJ - The Advocate</option>
                      <option value="INFP - The Mediator">INFP - The Mediator</option>
                      <option value="ENFJ - The Protagonist">ENFJ - The Protagonist</option>
                      <option value="ENFP - The Campaigner">ENFP - The Campaigner</option>
                      <option value="ISTJ - The Logistician">ISTJ - The Logistician</option>
                      <option value="ISFJ - The Protector">ISFJ - The Protector</option>
                      <option value="ESTJ - The Executive">ESTJ - The Executive</option>
                      <option value="ESFJ - The Consul">ESFJ - The Consul</option>
                      <option value="ISTP - The Virtuoso">ISTP - The Virtuoso</option>
                      <option value="ISFP - The Adventurer">ISFP - The Adventurer</option>
                      <option value="ESTP - The Entrepreneur">ESTP - The Entrepreneur</option>
                      <option value="ESFP - The Entertainer">ESFP - The Entertainer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Deal Breakers Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🚫 Deal Breakers</h3>
                <p className="text-sm text-gray-600 mb-3">Select things that would be absolute deal breakers for you:</p>
                
                <div className="flex flex-wrap gap-2">
                  {['Smoking', 'Heavy drinking', 'Drug use', 'Dishonesty', 'Cheating history', 'Bad hygiene', 'Rudeness', 'Extreme political views', 'Religious incompatibility', 'Wants kids (if you don\'t)', 'Doesn\'t want kids (if you do)', 'Pet allergies', 'Financial irresponsibility', 'Lack of ambition', 'Poor communication', 'Anger issues', 'Jealousy/possessiveness', 'Different life goals', 'Long distance', 'Age gap too large', 'Different values'].map((dealBreaker) => {
                    const isSelected = profileData.dealBreakers?.includes(dealBreaker);
                    return (
                      <button
                        key={dealBreaker}
                        type="button"
                        onClick={() => {
                          const dealBreakers = profileData.dealBreakers || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, dealBreakers: dealBreakers.filter(d => d !== dealBreaker) }));
                          } else {
                            setProfileData(prev => ({ ...prev, dealBreakers: [...dealBreakers, dealBreaker] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {dealBreaker}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ideal Date Ideas Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Ideal Date Ideas</h3>
                <p className="text-sm text-gray-600 mb-3">What would make for perfect dates in your opinion?</p>
                
                <div className="flex flex-wrap gap-2">
                  {['Coffee date', 'Dinner date', 'Lunch date', 'Drinks', 'Movies', 'Theater', 'Concert', 'Museum', 'Art gallery', 'Walk in park', 'Hiking', 'Beach', 'Cooking together', 'Game night', 'Mini golf', 'Bowling', 'Dancing', 'Wine tasting', 'Food festival', 'Farmers market', 'Bookstore', 'Picnic', 'Road trip', 'Adventure activity', 'Sports event', 'Festival', 'Volunteer together', 'Class/workshop', 'Escape room', 'Karaoke', 'Photography walk', 'Stargazing'].map((dateIdea) => {
                    const isSelected = profileData.idealDateIdeas?.includes(dateIdea);
                    return (
                      <button
                        key={dateIdea}
                        type="button"
                        onClick={() => {
                          const dateIdeas = profileData.idealDateIdeas || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, idealDateIdeas: dateIdeas.filter(d => d !== dateIdea) }));
                          } else {
                            setProfileData(prev => ({ ...prev, idealDateIdeas: [...dateIdeas, dateIdea] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {dateIdea}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Values & Life Goals Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Values & Life Goals</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">What Values Are Most Important to You?</label>
                    <div className="flex flex-wrap gap-2">
                      {['Honesty', 'Loyalty', 'Kindness', 'Respect', 'Trust', 'Communication', 'Family', 'Friendship', 'Career success', 'Financial stability', 'Adventure', 'Creativity', 'Health', 'Spirituality', 'Education', 'Environmental consciousness', 'Social justice', 'Personal growth'].map((value) => {
                        const isSelected = profileData.valuesImportant?.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              const values = profileData.valuesImportant || [];
                              if (isSelected) {
                                setProfileData(prev => ({ ...prev, valuesImportant: values.filter(v => v !== value) }));
                              } else {
                                setProfileData(prev => ({ ...prev, valuesImportant: [...values, value] }));
                              }
                            }}
                            className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                              isSelected
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                            }`}
                            style={{ minHeight: '48px' }}
                          >
                            {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Major Life Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {['Get married', 'Have children', 'Buy a house', 'Travel the world', 'Career advancement', 'Start a business', 'Get advanced degree', 'Live abroad', 'Learn new skills', 'Achieve financial freedom', 'Make a difference', 'Stay healthy & fit'].map((goal) => {
                    const isSelected = profileData.lifeGoals?.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => {
                          const goals = profileData.lifeGoals || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, lifeGoals: goals.filter(g => g !== goal) }));
                          } else {
                            setProfileData(prev => ({ ...prev, lifeGoals: [...goals, goal] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {goal}
                      </button>
                    );
                  })}
                    </div>
                  </div>
                </div>
              </div>

              {/* AMORE Relationship Compatibility Notice */}
              <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-200/40 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1"></div>
                  <div>
                    <p className="text-sm font-bold text-purple-800 mb-1">🤖 AMORE Relationship Compatibility</p>
                    <p className="text-xs text-gray-600">
                      Your dating goals and relationship preferences help AMORE find people who want the same things you do, share your values, and are compatible for long-term happiness together.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 7: PERSONALITY */}
          {step.id === 'personality' && (
            <>
              {/* Core Personality Traits Section */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">✨ Personality Traits</label>
                <p className="text-sm text-gray-600 mb-3">Select traits that best describe you:</p>
                <div className="flex flex-wrap gap-2">
                  {['Adventurous', 'Ambitious', 'Artistic', 'Calm', 'Caring', 'Charismatic', 'Compassionate', 'Confident', 'Creative', 'Curious', 'Determined', 'Empathetic', 'Energetic', 'Enthusiastic', 'Funny', 'Generous', 'Gentle', 'Honest', 'Humble', 'Independent', 'Intelligent', 'Intuitive', 'Kind', 'Loyal', 'Optimistic', 'Organized', 'Passionate', 'Patient', 'Playful', 'Reliable', 'Romantic', 'Sensitive', 'Spontaneous', 'Supportive', 'Thoughtful', 'Witty'].map((trait) => {
                    const isSelected = profileData.personalityTraits?.includes(trait);
                    return (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => {
                          const traits = profileData.personalityTraits || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, personalityTraits: traits.filter(t => t !== trait) }));
                          } else {
                            setProfileData(prev => ({ ...prev, personalityTraits: [...traits, trait] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {trait}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">💪 Strengths & Qualities</label>
                <p className="text-sm text-gray-600 mb-3">What are your greatest strengths?</p>
                <div className="flex flex-wrap gap-2">
                  {['Great listener', 'Problem solver', 'Team player', 'Natural leader', 'Good communicator', 'Emotionally supportive', 'Motivating others', 'Making people laugh', 'Staying calm under pressure', 'Being organized', 'Creative thinking', 'Analytical mind', 'Attention to detail', 'Building relationships', 'Adapting to change', 'Learning quickly', 'Being dependable', 'Showing empathy', 'Taking initiative', 'Being authentic', 'Staying positive', 'Conflict resolution', 'Time management', 'Being spontaneous'].map((quality) => {
                    const isSelected = profileData.strengthsQualities?.includes(quality);
                    return (
                      <button
                        key={quality}
                        type="button"
                        onClick={() => {
                          const qualities = profileData.strengthsQualities || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, strengthsQualities: qualities.filter(q => q !== quality) }));
                          } else {
                            setProfileData(prev => ({ ...prev, strengthsQualities: [...qualities, quality] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {quality}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social Energy & Preferences Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🌟 Social Energy & Preferences</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Social Energy Preference *</label>
                    <select
                      value={profileData.introvertExtrovert}
                      onChange={(e) => handleInputChange('introvertExtrovert', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select your preference</option>
                      <option value="Introvert">Introvert - I recharge with alone time</option>
                      <option value="Extrovert">Extrovert - I gain energy from being around people</option>
                      <option value="Ambivert">Ambivert - I'm balanced between both</option>
                      <option value="Social introvert">Social introvert - I enjoy small groups but need alone time</option>
                      <option value="Outgoing introvert">Outgoing introvert - I can be social but prefer meaningful connections</option>
                    </select>
                    {errors.introvertExtrovert && <p className="text-red-500 text-sm mt-1">{errors.introvertExtrovert}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Emotional Intelligence Style</label>
                    <select
                      value={profileData.emotionalIntelligence}
                      onChange={(e) => handleInputChange('emotionalIntelligence', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select your style</option>
                      <option value="Highly empathetic">Highly empathetic - I easily understand others' emotions</option>
                      <option value="Good at reading people">Good at reading people - I pick up on social cues well</option>
                      <option value="Emotionally aware">Emotionally aware - I understand my own emotions well</option>
                      <option value="Balanced approach">Balanced approach - I'm reasonably good with emotions</option>
                      <option value="Still learning">Still learning - I'm working on emotional skills</option>
                      <option value="More logical">More logical - I tend to approach things rationally</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">How You Handle Stress</label>
                    <select
                      value={profileData.stressManagement}
                      onChange={(e) => handleInputChange('stressManagement', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                      style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                    >
                      <option value="">Select your approach</option>
                      <option value="Stay calm and focused">Stay calm and focused</option>
                      <option value="Talk it out with others">Talk it out with others</option>
                      <option value="Take time alone to process">Take time alone to process</option>
                      <option value="Stay active and busy">Stay active and busy</option>
                      <option value="Use humor to cope">Use humor to cope</option>
                      <option value="Seek solutions immediately">Seek solutions immediately</option>
                      <option value="Practice mindfulness">Practice mindfulness</option>
                      <option value="Need support from others">Need support from others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Social Preferences</label>
                    <div className="flex flex-wrap gap-2">
                  {['Small intimate gatherings', 'Large social events', 'One-on-one conversations', 'Group activities', 'Quiet environments', 'Lively atmospheres', 'Deep meaningful talks', 'Light casual chat', 'Meeting new people', 'Spending time with close friends'].map((preference) => {
                    const isSelected = profileData.socialPreferences?.includes(preference);
                    return (
                      <button
                        key={preference}
                        type="button"
                        onClick={() => {
                          const preferences = profileData.socialPreferences || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, socialPreferences: preferences.filter(p => p !== preference) }));
                          } else {
                            setProfileData(prev => ({ ...prev, socialPreferences: [...preferences, preference] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {preference}
                      </button>
                    );
                  })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Insights Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💭 Personal Insights</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">What Makes You Unique? (Optional)</label>
                  <textarea
                    value={profileData.personalityInsights || ''}
                    onChange={(e) => handleInputChange('personalityInsights', e.target.value)}
                    placeholder="Share something unique about your personality, perspective, or what makes you who you are..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base resize-none"
                    style={{ backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  />
                  <p className="text-gray-400 text-xs mt-1 text-right">{(profileData.personalityInsights || '').length}/500</p>
                </div>
              </div>

              {/* AMORE Personality Analysis Notice */}
              <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-200/40 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-1"></div>
                  <div>
                    <p className="text-sm font-bold text-purple-800 mb-1">🤖 AMORE Personality Analysis</p>
                    <p className="text-xs text-gray-600">
                      Your personality profile helps AMORE understand your character, communication style, and social preferences to find people who complement your personality and share compatible traits for meaningful connections.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 8: FINAL - PREFERENCES */}
          {step.id === 'final' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Profile Visibility</label>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: '🌍 Public', desc: 'Everyone can see your profile' },
                    { value: 'matches', label: '💕 Matches Only', desc: 'Only your matches can see details' },
                    { value: 'private', label: '🔒 Private', desc: 'You control who sees you' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('profileVisibility', option.value)}
                      className={`w-full px-5 py-4 rounded-xl text-left transition-all duration-200 active:scale-95 ${
                        profileData.profileVisibility === option.value
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md border-2 border-purple-600'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className={`text-xs mt-1 ${profileData.profileVisibility === option.value ? 'text-white/90' : 'text-gray-500'}`}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Age Range Preference</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Minimum Age: {profileData.ageRangeMin}</label>
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={profileData.ageRangeMin}
                      onChange={(e) => handleInputChange('ageRangeMin', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Maximum Age: {profileData.ageRangeMax}</label>
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={profileData.ageRangeMax}
                      onChange={(e) => handleInputChange('ageRangeMax', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Maximum Distance: {profileData.maxDistance} miles</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={profileData.maxDistance}
                  onChange={(e) => handleInputChange('maxDistance', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Interested In</label>
                <div className="space-y-2">
                  {['Men', 'Women', 'Non-binary', 'Everyone'].map((gender) => {
                    const isSelected = profileData.preferredGenders?.includes(gender);
                    return (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => {
                          const genders = profileData.preferredGenders || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, preferredGenders: genders.filter(g => g !== gender) }));
                          } else {
                            setProfileData(prev => ({ ...prev, preferredGenders: [...genders, gender] }));
                          }
                        }}
                        className={`w-full px-5 py-4 rounded-xl font-medium text-left transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-2" />}
                        {gender}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Preferred Education Level</label>
                <div className="flex flex-wrap gap-2">
                  {['High School', 'Some College', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'Doctorate/PhD', 'Professional Degree', 'Trade School'].map((education) => {
                    const isSelected = profileData.preferredEducation?.includes(education);
                    return (
                      <button
                        key={education}
                        type="button"
                        onClick={() => {
                          const educations = profileData.preferredEducation || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, preferredEducation: educations.filter(e => e !== education) }));
                          } else {
                            setProfileData(prev => ({ ...prev, preferredEducation: [...educations, education] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {education}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Preferred Body Types</label>
                <div className="flex flex-wrap gap-2">
                  {['Slim', 'Athletic', 'Average', 'Curvy', 'Full-figured', 'Muscular', 'Petite', 'Plus-size', 'Any body type'].map((bodyType) => {
                    const isSelected = profileData.preferredBodyTypes?.includes(bodyType);
                    return (
                      <button
                        key={bodyType}
                        type="button"
                        onClick={() => {
                          const bodyTypes = profileData.preferredBodyTypes || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, preferredBodyTypes: bodyTypes.filter(b => b !== bodyType) }));
                          } else {
                            setProfileData(prev => ({ ...prev, preferredBodyTypes: [...bodyTypes, bodyType] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {bodyType}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Preferred Ethnicities</label>
                <div className="flex flex-wrap gap-2">
                  {['Asian', 'Black/African American', 'Hispanic/Latino', 'White/Caucasian', 'Middle Eastern', 'Native American', 'Pacific Islander', 'Mixed/Multiracial', 'Any ethnicity'].map((ethnicity) => {
                    const isSelected = profileData.preferredEthnicities?.includes(ethnicity);
                    return (
                      <button
                        key={ethnicity}
                        type="button"
                        onClick={() => {
                          const ethnicities = profileData.preferredEthnicities || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, preferredEthnicities: ethnicities.filter(e => e !== ethnicity) }));
                          } else {
                            setProfileData(prev => ({ ...prev, preferredEthnicities: [...ethnicities, ethnicity] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {ethnicity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Preferred Lifestyle Traits</label>
                <div className="flex flex-wrap gap-2">
                  {['Non-smoker', 'Social drinker', 'Non-drinker', 'Fitness enthusiast', 'Loves travel', 'Homebody', 'Career-focused', 'Family-oriented', 'Adventurous', 'Intellectual', 'Creative', 'Spiritual', 'Environmentally conscious', 'Pet lover', 'Foodie', 'Music lover'].map((lifestyle) => {
                    const isSelected = profileData.preferredLifestyles?.includes(lifestyle);
                    return (
                      <button
                        key={lifestyle}
                        type="button"
                        onClick={() => {
                          const lifestyles = profileData.preferredLifestyles || [];
                          if (isSelected) {
                            setProfileData(prev => ({ ...prev, preferredLifestyles: lifestyles.filter(l => l !== lifestyle) }));
                          } else {
                            setProfileData(prev => ({ ...prev, preferredLifestyles: [...lifestyles, lifestyle] }));
                          }
                        }}
                        className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        {isSelected && <Check className="inline-block w-4 h-4 mr-1" />}
                        {lifestyle}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Privacy Settings</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-xl cursor-pointer">
                    <div>
                      <div className="font-medium text-gray-800">Show Last Active</div>
                      <div className="text-xs text-gray-500">Let others see when you were last online</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.showLastActive}
                      onChange={(e) => handleInputChange('showLastActive', e.target.checked)}
                      className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-xl cursor-pointer">
                    <div>
                      <div className="font-medium text-gray-800">Show Distance</div>
                      <div className="text-xs text-gray-500">Display how far away you are from matches</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.showDistance}
                      onChange={(e) => handleInputChange('showDistance', e.target.checked)}
                      className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Who Can Message You</label>
                <select
                  value={profileData.allowMessagesFrom}
                  onChange={(e) => handleInputChange('allowMessagesFrom', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-base"
                  style={{ minHeight: '48px', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                >
                  <option value="everyone">Everyone</option>
                  <option value="matches">Matches only</option>
                  <option value="premium">Premium Members Only</option>
                  <option value="verified">Verified Members Only</option>
                </select>
              </div>

              <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-200/40 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-purple-800 mb-1">🎉 Profile Complete!</p>
                    <p className="text-xs text-gray-600">
                      You've completed all profile sections! AMORE AI will now find your perfect matches based on your comprehensive profile.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}
