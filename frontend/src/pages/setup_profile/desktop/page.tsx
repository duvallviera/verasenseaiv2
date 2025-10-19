"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Heart, 
  MapPin, 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  CheckCircle,
  Star,
  Music,
  Book,
  Utensils,
  Plane,
  Dumbbell,
  Palette,
  Coffee,
  Mountain,
  Gamepad2,
  Film,
  Users,
  Target,
  Brain,
  MessageCircle,
  Settings,
  Eye,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';
import Link from "next/link";
import axios from "axios";
// Using built-in notification system instead of react-toastify
import AmoreAssistant from "../components/AmoreAssistant";
import { trackEvent, trackUserAction } from "@/lib/analytics/track";
import { enqueueEmbedding } from "@/lib/embeddings/queue";

const API_URL = ""; // Next.js proxy to Node Backend (5051) per FINAL ARCHITECTURE

// Enhanced Profile Data Interface with ALL fields
interface ProfileData {
  // Basic Information (Required)
  displayName: string;
  bio: string;
  
  // Enhanced Location Data (Global/Quantum-Level)
  location: { 
    country: string;
    state: string; 
    city: string;
    zipCode: string;
    neighborhood: string;
    coordinates?: { lat: number; lng: number };
    timezone: string;
  };
  
  // Dual DOB System for Age Verification
  dateOfBirth: string; // User-facing DOB
  verificationDOB: string; // Silent storage for verification
  ageVerificationSource: string; // Source of verification
  gender: string; // User gender

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
  
  // Lifestyle Details (from old system)
  favoriteArtist: string;
  favoriteFood: string;
  favoriteSport: string;
  dreamLuxury: string;
  placeLovedMost: string;
  dreamTrip: string;
  lifePhilosophy: string;
  childhoodMemory: string;
  booksGenres: string[];
  sportsInterests: string[];

  // Dating & Relationships
  relationshipGoals: string;
  loveLanguage: string;
  communicationStyle: string;
  conflictResolution: string;
  personalityType: string;
  familyOrientation: string;
  dealBreakers: string[];
  idealDateIdeas: string[];
  valuesImportant: string[];
  lifeGoals: string[];

  // Personality & Character
  personalityTraits: string[];
  strengthsQualities: string[];
  introvertExtrovert: string;
  emotionalIntelligence: string;
  stressManagement: string;
  socialPreferences: string[];
  personalityInsights: string;

  // Social & Digital
  socialMediaUsage: string;
  petPreference: string;
  livingArrangement: string;
  transportationMode: string;
  language: string;

  profilePhotos: File[];
  photoDescriptions: string[];
  phoneNumber: string;
  verificationMethod: string;

  // Privacy & Settings
  profileVisibility: string;
  showLastActive: boolean;
  showDistance: boolean;
  allowMessagesFrom: string;

  // Partner Preferences
  ageRangeMin: number;
  ageRangeMax: number;
  maxDistance: number;
  preferredGenders: string[];
  preferredEthnicities: string[];
  preferredEducation: string[];
  preferredBodyTypes: string[];
  preferredLifestyles: string[];

  // Advanced Features
  weekendActivities: string[];
  careerAmbitions: string;
  financialGoals: string;
  attachmentStyle: string;
  nextTripPlan: string;
}

const STEPS = [
  { id: "basic", title: "Basic Info", icon: User, description: "Tell us about yourself" },
  { id: "interests", title: "Interests & Personality", icon: Heart, description: "Your passions & conversation starters" },
  { id: "demographics", title: "About You", icon: Eye, description: "Physical & background" },
  { id: "lifestyle", title: "Lifestyle", icon: Coffee, description: "How you live" },
  { id: "interests", title: "Interests", icon: Heart, description: "What you love" },
  { id: "dating", title: "Dating Goals", icon: Target, description: "What you seek" },
  { id: "personality", title: "Personality", icon: Star, description: "Who you are" },
  { id: "preferences", title: "Preferences", icon: Users, description: "Your settings" },
] as const;

export default function SetupProfileDesktop() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    bio: "",
    location: { 
      country: "United States", 
      state: "", 
      city: "", 
      zipCode: "", 
      neighborhood: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    dateOfBirth: "",
    verificationDOB: "",
    ageVerificationSource: "user_input",
    gender: "",
    
    // Lifestyle Details
    favoriteArtist: "",
    favoriteFood: "",
    favoriteSport: "",
    dreamLuxury: "",
    placeLovedMost: "",
    dreamTrip: "",
    nextTripPlan: "",
    lifePhilosophy: "",
    childhoodMemory: "",
    
    height: "",
    bodyType: "",
    ethnicity: "",
    eyeColor: "",
    hairColor: "",
    occupation: "",
    education: "",
    income: "",
    religion: "",
    politicalViews: "",
    smokingStatus: "",
    drinkingStatus: "",
    hasChildren: "",
    wantsChildren: "",
    interests: [],
    hobbies: [],
    musicGenres: [],
    movieGenres: [],
    cuisinePreferences: [],
    travelStyle: [],
    booksGenres: [],
    sportsInterests: [],
    relationshipGoals: "",
    dealBreakers: [],
    idealDateIdeas: [],
    valuesImportant: [],
    lifeGoals: [],

    // Personality & Character
    personalityTraits: [],
    strengthsQualities: [],
    introvertExtrovert: "",
    emotionalIntelligence: "",
    stressManagement: "",
    socialPreferences: [],
    personalityInsights: "",
    language: "",

    // Social & Digital
    socialMediaUsage: "",
    petPreference: "",
    livingArrangement: "",
    transportationMode: "",
    profilePhotos: [],
    photoDescriptions: [],
    phoneNumber: "",
    verificationMethod: "",
    profileVisibility: "public",
    showLastActive: true,
    showDistance: true,
    allowMessagesFrom: "everyone",
    
    // Partner Preferences
    ageRangeMin: 18,
    ageRangeMax: 35,
    maxDistance: 25,
    preferredGenders: [],
    preferredEthnicities: [],
    preferredEducation: [],
    preferredBodyTypes: [],
    preferredLifestyles: [],
    weekendActivities: [],
    careerAmbitions: "",
    financialGoals: "",
    attachmentStyle: "",
    fitnessActivities: [],
    loveLanguage: "",
    communicationStyle: "",
    personalityType: "",
    conflictResolution: "",
    familyOrientation: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validationHelp, setValidationHelp] = useState<Record<string, string>>({});
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
    setTimeout(() => setNotification(null), 5000);
  };

  // Reduced motion support
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  // Load signup data and initialize profile
  useEffect(() => {
    const signupData = localStorage.getItem('4ulove_signup_data');
    const token = localStorage.getItem('token');
    
    console.log('🔍 Initializing profile setup...');
    console.log('📦 Signup data exists:', !!signupData);
    console.log('🔑 Token exists:', !!token);
    
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        console.log('✅ Loaded signup data:', data);
        
        setProfileData(prev => ({
          ...prev,
          displayName: data.firstName || data.nickname || prev.displayName,
          phoneNumber: data.phone || prev.phoneNumber,
          // Pre-populate from signup if available
          dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
        }));
        
        trackEvent('profile_setup_initialized', {
          hasSignupData: true,
          variant: data.variant || 'unknown',
          userId: data.userId
        });
      } catch (error) {
        console.error('❌ Failed to load signup data:', error);
      }
    } else {
      console.warn('⚠️ No signup data found - user must fill form from scratch');
    }
  }, []);

  // Load desktop draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('profile_setup_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setProfileData(prev => ({ ...prev, ...draft }));
        showNotification('info', 'Restored your draft');
      } catch (error) {
        console.error('Failed to restore draft:', error);
      }
    }
  }, []);

  // Auto-save with embeddings
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profileData.displayName || profileData.bio) {
        localStorage.setItem("profile_setup_draft", JSON.stringify(profileData));
        trackEvent("profile_draft_saved", {
          step: currentStep,
          dataFields: Object.keys(profileData).length,
        });

        if (profileData.bio) {
          enqueueEmbedding({
            type: "preference",
            data: { bioLength: profileData.bio.length, step: currentStep },
            userId: "temp-user",
            sessionId: "profile-setup",
          });
        }
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [profileData, currentStep]);

  const handleInputChange = useCallback(
    (field: keyof ProfileData, value: any) => {
      setProfileData((prev) => ({ ...prev, [field]: value }));

      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }));
      }

      setValidationHelp((prev) => ({ ...prev, [field as string]: getFieldHelp(field as string, value) }));

      trackUserAction('field_interaction', { field: field as string, action: 'change', step: currentStep, hasValue: !!value });
    },
    [currentStep, errors]
  );

  const getFieldHelp = (field: string, value: any): string => {
    switch (field) {
      case "bio": {
        const length = value?.length || 0;
        if (length < 50) return `Add ${50 - length} more characters for a compelling bio`;
        if (length > 500) return `Consider shortening by ${length - 500} characters`;
        return "Great! Your bio looks engaging";
      }
      case "displayName":
        return value?.length > 2 ? "Perfect display name!" : "Use your real first name or nickname";
      default:
        return "";
    }
  };

  const validateStep = useCallback(
    (stepIndex: number): boolean => {
      const newErrors: Record<string, string> = {};

      switch (stepIndex) {
        case 0: // Basic Info
          if (!profileData.displayName.trim()) {
            newErrors.displayName = "Display name is required";
          }
          if (!profileData.gender || profileData.gender === '') {
            newErrors.gender = "Gender is required";
          }
          if (!profileData.dateOfBirth || profileData.dateOfBirth === '') {
            newErrors.dateOfBirth = "Date of birth is required";
          }
          if (!profileData.bio.trim()) {
            newErrors.bio = "Bio is required (minimum 50 characters)";
          } else if (profileData.bio.length < 50) {
            newErrors.bio = `Bio needs ${50 - profileData.bio.length} more characters (minimum 50)`;
          }
          if (!profileData.location.city.trim()) {
            newErrors.city = "City is required";
          }
          break;
        case 1: // Interests & Personality
          if (!profileData.hobbies || profileData.hobbies.length < 2) {
            newErrors.hobbies = "Select at least 2 hobbies";
          }
          if (!profileData.musicGenres || profileData.musicGenres.length < 1) {
            newErrors.musicGenres = "Select at least 1 music genre";
          }
          break;
        case 2: // About You - Demographics & Physical
          if (!profileData.height || profileData.height === '') newErrors.height = "Height is required";
          if (!profileData.ethnicity || profileData.ethnicity === '') newErrors.ethnicity = "Ethnicity is required";
          if (!profileData.bodyType || profileData.bodyType === '') newErrors.bodyType = "Body type is required";
          if (!profileData.eyeColor || profileData.eyeColor === '') newErrors.eyeColor = "Eye color is required";
          break;
        case 3: // Lifestyle - How you live
          if (!profileData.occupation || profileData.occupation === '') newErrors.occupation = "Occupation is required";
          if (!profileData.education || profileData.education === '') newErrors.education = "Education is required";
          if (!profileData.livingArrangement || profileData.livingArrangement === '') newErrors.livingArrangement = "Living arrangement is required";
          break;
        case 4: // Interests - What you love
          if (profileData.interests.length < 3) newErrors.interests = "Select at least 3 interests";
          if (profileData.movieGenres.length < 1) newErrors.movieGenres = "Select at least 1 movie genre";
          if (profileData.cuisinePreferences.length < 1) newErrors.cuisinePreferences = "Select at least 1 cuisine preference";
          break;
        case 5: // Dating Goals - What you seek
          if (!profileData.relationshipGoals || profileData.relationshipGoals === '') newErrors.relationshipGoals = "Relationship goals required";
          if (!profileData.loveLanguage || profileData.loveLanguage === '') newErrors.loveLanguage = "Love language required";
          if (!profileData.communicationStyle || profileData.communicationStyle === '') newErrors.communicationStyle = "Communication style required";
          if (profileData.dealBreakers.length < 1) newErrors.dealBreakers = "Select at least 1 deal breaker";
          break;
        case 6: // Personality - Who you are
          if (profileData.personalityTraits.length < 3) newErrors.personalityTraits = "Select at least 3 personality traits";
          if (profileData.strengthsQualities.length < 2) newErrors.strengthsQualities = "Select at least 2 strengths/qualities";
          if (!profileData.introvertExtrovert || profileData.introvertExtrovert === '') newErrors.introvertExtrovert = "Please select your social energy preference";
          break;
        case 7: // Preferences - Your settings
          if (!profileData.ageRangeMin || !profileData.ageRangeMax) newErrors.ageRange = "Age range is required";
          if (!profileData.maxDistance || profileData.maxDistance === 0) newErrors.maxDistance = "Maximum distance is required";
          if (!profileData.profileVisibility || profileData.profileVisibility === '') newErrors.profileVisibility = "Profile visibility setting is required";
          break;
        default:
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [profileData]
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      // avoid spread on Set to bypass downlevelIteration requirement
      setCompletedSteps((prev) => new Set(Array.from(prev).concat(currentStep)));

      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        trackEvent("step_completed", {
          step: currentStep,
          stepName: STEPS[currentStep].id,
          completionPercentage: ((currentStep + 1) / STEPS.length) * 100,
        });
      }
    } else {
      // Show specific validation errors instead of generic message
      const stepName = STEPS[currentStep]?.title || 'this step';
      const errorFields = Object.keys(errors).filter(key => errors[key]);
      
      if (errorFields.length > 0) {
        showNotification("error", `Please fix the highlighted fields in ${stepName}`);
      } else {
        showNotification("error", `Please complete all required fields in ${stepName}`);
      }
      
      // Scroll to first error field
      const firstErrorField = document.querySelector('.border-red-500, [data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, validateStep, errors]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      trackEvent("step_back", { step: currentStep, stepName: STEPS[currentStep].id });
    }
  }, [currentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    const existingDraft = localStorage.getItem('profile_setup_draft');
    
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
      console.log('✅ User confirmed profile replacement for:', currentUserEmail);
      trackEvent('profile_replacement_confirmed', {
        userEmail: currentUserEmail,
        hadExistingProfile: !!existingProfileStr,
        hadExistingDraft: !!existingDraft
      });
    } else if ((existingProfileStr || existingDraft) && !isSameUser) {
      // Different user - clear old data silently
      console.log('🔄 New user detected, clearing previous user data');
      localStorage.removeItem('user_profile_data');
      localStorage.removeItem('profile_setup_draft');
    }

    setLoading(true);

    try {
      console.log('🚀 Starting profile submission...');
      
      // Count filled fields for progress tracking
      console.log('📊 Profile data filled fields:', Object.keys(profileData).filter(key => {
        const value = profileData[key as keyof ProfileData];
        return value !== '' && value !== null && value !== undefined && 
               (!Array.isArray(value) || value.length > 0);
      }).length);

      // Validate all steps
      let allValid = true;
      let firstInvalidStep = -1;
      for (let i = 0; i < STEPS.length; i++) {
        if (!validateStep(i)) {
          allValid = false;
          if (firstInvalidStep === -1) {
            firstInvalidStep = i;
          }
        }
      }

      if (!allValid) {
        const stepName = STEPS[firstInvalidStep]?.title || 'Unknown';
        showNotification("error", `Please complete required fields in: ${stepName} (Step ${firstInvalidStep + 1})`);
        setCurrentStep(firstInvalidStep); // Navigate to first invalid step
        setLoading(false);
        return;
      }

      // Normalize enum values to lowercase (backend expects lowercase)
      const normalizeValue = (value: any): any => {
        if (typeof value === 'string') {
          return value.toLowerCase();
        }
        if (Array.isArray(value)) {
          return value.map(v => typeof v === 'string' ? v.toLowerCase() : v);
        }
        return value;
      };

      // Normalize gender to backend enum: man, woman, non-binary, other
      const normalizeGender = (gender: string): string => {
        if (!gender) {
          console.error('❌ Gender is empty or undefined!', { gender, profileData: profileData.gender });
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
        console.log('🔧 Gender normalization:', { input: gender, output: normalized });
        return normalized;
      };

      // Send as JSON (no photos uploaded at this step)
      const profilePayload = {
        ...profileData,
        // 🔒 RELATIONAL INTEGRITY: Include signup email for verification
        email: signupData?.email || '',
        // 🔧 NORMALIZE GENDER: Convert frontend values to backend enum
        gender: normalizeGender(profileData.gender),
        // Normalize enum fields to lowercase for backend validation
        bodyType: normalizeValue(profileData.bodyType),
        politicalViews: normalizeValue(profileData.politicalViews),
        smokingStatus: normalizeValue(profileData.smokingStatus),
        drinkingStatus: normalizeValue(profileData.drinkingStatus),
        preferredGenders: normalizeValue(profileData.preferredGenders),
        // Height conversion: if value looks like feet (< 10), convert to cm
        height: profileData.height && Number(profileData.height) < 10 
          ? Math.round(Number(profileData.height) * 30.48) // feet to cm
          : profileData.height,
        // Exclude photos since they're uploaded separately in quantum_face
        profilePhotos: undefined,
        photoDescriptions: undefined,
      };

      console.log('📤 Submitting profile data:', {
        fieldCount: Object.keys(profilePayload).filter(k => profilePayload[k as keyof typeof profilePayload] !== undefined).length,
        displayName: profilePayload.displayName,
        bio: profilePayload.bio?.substring(0, 50) + '...',
        dateOfBirth: profilePayload.dateOfBirth,
        height: profilePayload.height,
        bodyType: profilePayload.bodyType
      });

      // 🔍 DEBUG: Log payload before sending
      console.log('📤 Sending profile payload:', {
        gender: profilePayload.gender,
        displayName: profilePayload.displayName,
        email: profilePayload.email,
        fullPayload: profilePayload
      });

      const response = await axios.post(`${API_URL}/api/profile/setup`, profilePayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "X-Enable-Embeddings": "true",
        },
        timeout: 30000,
      });

      if (response.data?.success) {
        // Queue comprehensive embeddings
        enqueueEmbedding({
          type: "preference",
          data: {
            interests: profileData.interests,
            lifestyle: { occupation: profileData.occupation, education: profileData.education },
            personality: { type: profileData.personalityType, attachment: profileData.attachmentStyle },
          },
          sessionId: "profile-setup-complete",
          userId: response.data.userId,
        });

        localStorage.removeItem("profile_setup_draft");
        localStorage.removeItem("4ulove_signup_data"); // Clear signup data after profile completion
        showNotification("success", "Profile created successfully!");

        // Track form submission success
        trackUserAction('form_submission', { form_type: 'profile_setup', success: true, errors: [] });
        trackEvent("profile_setup_completed", {
          totalFields: Object.keys(profileData).length,
          completionTime: Date.now(),
        });

        setTimeout(() => {
          // Redirect to Quantum Face authentication
          router.push("/quantum_face");
        }, 1200);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || "Failed to create profile. Please try again.";
      showNotification("error", errorMessage);
      trackUserAction('form_submission', { form_type: 'profile_setup', success: false, errors: [errorMessage] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 p-6 relative overflow-hidden">
        {/* Background decorations - EXACT per master spec */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-2xl" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-2xl" />
          </div>
        )}

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
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

          {/* Progress */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 scale-110 shadow-lg"
                          : isCompleted
                          ? "bg-green-500 shadow-md"
                          : "bg-white/20"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-7 w-7 text-white" />
                      ) : (
                        <Icon className={`h-7 w-7 ${isCurrent ? "text-white" : "text-white/60"}`} />
                      )}
                      {isCurrent && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30 animate-pulse" />
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-16 h-2 mx-3 rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-green-500" : "bg-white/20"
                        }`}
                      />
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

          {/* Step Content */}
          <div className="bg-white backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-8 mb-8 min-h-[500px]">
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

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 0
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : "bg-white/20 text-white hover:bg-white/30 hover:scale-105 backdrop-blur-sm"
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">
                {completedSteps.size} of {STEPS.length} steps completed
              </div>
              <div className="text-white/40 text-xs">
                {Object.keys(profileData).filter(key => {
                  const value = profileData[key as keyof ProfileData];
                  return value !== "" && value !== null && value !== undefined && 
                         (!Array.isArray(value) || value.length > 0);
                }).length} fields filled
              </div>
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

      {/* Custom Notification System */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
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

      {/* Amore Assistant */}
      <AmoreAssistant context="setup_profile_desktop" variant="desktop" />
    </>
  );

  function renderStepContent() {
    const step = STEPS[currentStep];

    switch (currentStep) {
      case 0: // Basic Info
        return renderBasicInfoStep();
      case 1: // Interests & Personality (replaces Photos since we have face recognition)
        return renderInterestsPersonalityStep();
      case 2: // About You - Demographics & Physical
        return renderAboutYouStep();
      case 3: // Lifestyle - How you live
        return renderLifestyleStep();
      case 4: // Interests - What you love
        return renderInterestsStep();
      case 5: // Dating Goals - What you seek
        return renderDatingGoalsStep();
      case 6: // Personality - Who you are
        return renderPersonalityStep();
      case 7: // Preferences
        return renderPreferencesStep();
      default:
        return renderPlaceholderStep(step);
    }
  }

  function renderBasicInfoStep() {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <User className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Tell us about yourself</h3>
          <p className="text-gray-600">Help others get to know the real you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div className={errors.displayName ? 'border-2 border-red-300 rounded-lg p-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              placeholder="How should others see your name?"
              required
            />
            {errors.displayName && <div className="text-red-600 text-sm mt-1">{errors.displayName}</div>}
          </div>

          {/* Enhanced Global Location (Quantum-Level) - Properly Organized */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Location * <span className="text-xs text-purple-600">(Global/Hyper-Local for Better Matches)</span>
            </label>
            
            {/* Row 1: Country (Full Width) */}
            <div className="mb-3">
              <select
                value={profileData.location.country}
                onChange={(e) => setProfileData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, country: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
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
            </div>

            {/* Row 2: State/Province and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={profileData.location.state}
                onChange={(e) => setProfileData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, state: e.target.value }
                }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="🏛️ State/Province"
                required
              />
              <div className={errors.city ? 'border-2 border-red-300 rounded-lg' : ''}>
                <input
                  type="text"
                  value={profileData.location.city}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 w-full"
                  style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                  placeholder="🏙️ City"
                  required
                />
                {errors.city && <div className="text-red-600 text-sm mt-1 px-2">{errors.city}</div>}
              </div>
            </div>

            {/* Row 3: ZIP Code and Neighborhood */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={profileData.location.zipCode}
                onChange={(e) => setProfileData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, zipCode: e.target.value }
                }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="📮 ZIP/Postal Code"
              />
              <input
                type="text"
                value={profileData.location.neighborhood}
                onChange={(e) => setProfileData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, neighborhood: e.target.value }
                }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="🏘️ Neighborhood (Optional)"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>🎯 Hyper-local data helps AMORE find your perfect matches nearby</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setProfileData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            coordinates: {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude
                            }
                          }
                        }));
                        // Show success feedback
                        const btn = document.getElementById('geo-btn');
                        if (btn) {
                          btn.textContent = '✅ Location Captured';
                          btn.className = btn.className.replace('text-purple-600', 'text-green-600');
                        }
                      },
                      (error) => {
                        console.log('Geolocation error:', error);
                      }
                    );
                  }
                }}
                id="geo-btn"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                📍 Auto-detect precise location
              </button>
            </div>
          </div>

          {/* Email (Read-Only - Relational Integrity Check) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email * <span className="text-xs text-green-600">(Verified from Signup ✓)</span>
            </label>
            <input
              type="email"
              value={signupData?.email || ''}
              disabled
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              placeholder="Your verified email"
            />
            <p className="text-xs text-gray-500 mt-1">
              ℹ️ Email cannot be changed here for security. This matches your signup email.
            </p>
          </div>

          {/* Gender */}
          <div className={errors.gender ? 'border-2 border-red-300 rounded-lg p-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={profileData.gender}
              onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <div className="text-red-600 text-sm mt-1">{errors.gender}</div>}
          </div>

          {/* Date of Birth (Dual System) */}
          <div className={errors.dateOfBirth ? 'border-2 border-red-300 rounded-lg p-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  verificationDOB: dob, // Silent dual storage
                  ageVerificationSource: "user_input"
                }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              required
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            {errors.dateOfBirth && <div className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</div>}
            <div className="text-xs text-gray-500 mt-1">
              🔒 Secure age verification for authentic connections
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <select
              value={profileData.height}
              onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            >
              <option value="">Select height</option>
              <option value="147">4&apos;10&quot; (147 cm)</option>
              <option value="150">4&apos;11&quot; (150 cm)</option>
              <option value="152">5&apos;0&quot; (152 cm)</option>
              <option value="155">5&apos;1&quot; (155 cm)</option>
              <option value="157">5&apos;2&quot; (157 cm)</option>
              <option value="160">5&apos;3&quot; (160 cm)</option>
              <option value="163">5&apos;4&quot; (163 cm)</option>
              <option value="165">5&apos;5&quot; (165 cm)</option>
              <option value="168">5&apos;6&quot; (168 cm)</option>
              <option value="170">5&apos;7&quot; (170 cm)</option>
              <option value="173">5&apos;8&quot; (173 cm)</option>
              <option value="175">5&apos;9&quot; (175 cm)</option>
              <option value="178">5&apos;10&quot; (178 cm)</option>
              <option value="180">5&apos;11&quot; (180 cm)</option>
              <option value="183">6&apos;0&quot; (183 cm)</option>
              <option value="185">6&apos;1&quot; (185 cm)</option>
              <option value="188">6&apos;2&quot; (188 cm)</option>
              <option value="191">6&apos;3&quot; (191 cm)</option>
              <option value="193">6&apos;4&quot; (193 cm)</option>
              <option value="196">6&apos;5&quot; (196 cm)</option>
              <option value="198">6&apos;6&quot; (198 cm)</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupation
            </label>
            <input
              type="text"
              value={profileData.occupation}
              onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              placeholder="What do you do for work?"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education
            </label>
            <select
              value={profileData.education}
              onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

          {/* Body Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Type
            </label>
            <select
              value={profileData.bodyType}
              onChange={(e) => setProfileData(prev => ({ ...prev, bodyType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
        </div>

        {/* Enhanced Bio for AI Analysis */}
        <div className={`md:col-span-2 ${errors.bio ? 'border-2 border-red-300 rounded-lg p-2' : ''}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Me * <span className="text-xs text-purple-600">(AI-Powered Personality Analysis)</span>
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
            style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            rows={6}
            placeholder="Tell others about yourself, your interests, what you're looking for, your values, lifestyle, dreams... The more detail, the better AMORE can find your perfect match!"
            required
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{profileData.bio.length}/1000 characters</span>
            <span className="text-purple-600">🤖 AMORE analyzes your words for deeper compatibility</span>
          </div>
          {errors.bio && <div className="text-red-600 text-sm mt-1">{errors.bio}</div>}
        </div>

        {/* Quantum Data Collection Notice */}
        <div className="md:col-span-2 bg-gradient-to-r from-purple-50/30 to-blue-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">AMORE AI Matching Engine</span>
          </div>
          <p className="text-xs text-gray-600">
            Your data powers our quantum-level matching algorithm. Every detail helps AMORE understand your unique personality, 
            lifestyle, and compatibility patterns to find your perfect match. All data is encrypted and used solely for matching optimization.
          </p>
        </div>
      </div>
    );
  }

  function renderInterestsPersonalityStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Interests & Personality</h3>
          <p className="text-gray-600">Tell us what makes you unique - your passions, hobbies, and conversation starters</p>
        </div>

        {/* Music & Entertainment */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.musicGenres ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎵 Music & Entertainment
            {errors.musicGenres && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.musicGenres && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.musicGenres}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                🎵 Favorite Music Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Reggae', 'Folk', 'Indie', 'Metal'].map((genre) => {
                  const isSelected = profileData.musicGenres?.includes(genre) || false;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => {
                        const genres = profileData.musicGenres || [];
                        if (isSelected) {
                          setProfileData(prev => ({ 
                            ...prev, 
                            musicGenres: genres.filter(g => g !== genre)
                          }));
                        } else {
                          setProfileData(prev => ({ 
                            ...prev, 
                            musicGenres: [...genres, genre]
                          }));
                        }
                      }}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Artist/Band
              </label>
              <input
                type="text"
                value={profileData.favoriteArtist || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, favoriteArtist: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="Who's your favorite artist?"
              />
            </div>
          </div>
        </div>

        {/* Hobbies & Activities */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.hobbies ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎯 Hobbies & Activities
            {errors.hobbies && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.hobbies && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.hobbies}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {[
              'Reading', 'Writing', 'Photography', 'Painting', 'Drawing', 'Cooking', 'Baking', 'Gardening',
              'Hiking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Dancing', 'Singing', 'Playing Music',
              'Gaming', 'Board Games', 'Chess', 'Puzzles', 'Crafting', 'Knitting', 'Woodworking', 'DIY',
              'Traveling', 'Learning Languages', 'Meditation', 'Volunteering', 'Collecting', 'Astronomy',
              'Fitness', 'Martial Arts', 'Rock Climbing', 'Surfing', 'Skiing', 'Camping'
            ].map((hobby) => {
              const isSelected = profileData.hobbies?.includes(hobby) || false;
              return (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => {
                    const hobbies = profileData.hobbies || [];
                    if (isSelected) {
                      setProfileData(prev => ({ 
                        ...prev, 
                        hobbies: hobbies.filter(h => h !== hobby)
                      }));
                    } else {
                      setProfileData(prev => ({ 
                        ...prev, 
                        hobbies: [...hobbies, hobby]
                      }));
                    }
                  }}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {hobby}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lifestyle & Preferences */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🌟 Lifestyle & Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Cuisine
              </label>
              <select
                value={profileData.favoriteFood || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, favoriteFood: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Sport
              </label>
              <input
                type="text"
                value={profileData.favoriteSport || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, favoriteSport: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="What sport do you love?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dream Luxury
              </label>
              <select
                value={profileData.dreamLuxury || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, dreamLuxury: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place You Love Most
              </label>
              <input
                type="text"
                value={profileData.placeLovedMost || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, placeLovedMost: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="Your favorite place in the world"
              />
            </div>
          </div>
        </div>

        {/* Travel & Dreams */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            ✈️ Travel & Dreams
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dream Trip Destination
              </label>
              <input
                type="text"
                value={profileData.dreamTrip || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, dreamTrip: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="Where would you love to travel?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Trip Plan
              </label>
              <input
                type="text"
                value={profileData.nextTripPlan || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, nextTripPlan: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="Where are you planning to go next?"
              />
            </div>
          </div>
        </div>

        {/* Conversation Starters */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💬 Great Conversation Topics
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Life Philosophy
              </label>
              <textarea
                value={profileData.lifePhilosophy || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, lifePhilosophy: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                rows={3}
                placeholder="What's your philosophy on life? What drives you?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Best Childhood Memory
              </label>
              <textarea
                value={profileData.childhoodMemory || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, childhoodMemory: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                rows={3}
                placeholder="Share a favorite memory from your childhood"
              />
            </div>
          </div>
        </div>

        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Personality Analysis</span>
          </div>
          <p className="text-xs text-gray-600">
            These interests and personality traits help AMORE understand your conversation style, shared interests potential, 
            and lifestyle compatibility for quantum-level matching precision.
          </p>
        </div>
      </div>
    );
  }

  function renderAboutYouStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Eye className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">About You</h3>
          <p className="text-gray-600">Physical attributes and background information for better matching</p>
        </div>

        {/* Physical Attributes */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            👤 Physical Attributes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Height - Already in Basic Info, but validation here */}
            <div className={errors.height ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height *
              </label>
              <select
                value={profileData.height}
                onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
              >
                <option value="">Select height</option>
                <option value="147">4&apos;10&quot; (147 cm)</option>
                <option value="150">4&apos;11&quot; (150 cm)</option>
                <option value="152">5&apos;0&quot; (152 cm)</option>
                <option value="155">5&apos;1&quot; (155 cm)</option>
                <option value="157">5&apos;2&quot; (157 cm)</option>
                <option value="160">5&apos;3&quot; (160 cm)</option>
                <option value="163">5&apos;4&quot; (163 cm)</option>
                <option value="165">5&apos;5&quot; (165 cm)</option>
                <option value="168">5&apos;6&quot; (168 cm)</option>
                <option value="170">5&apos;7&quot; (170 cm)</option>
                <option value="173">5&apos;8&quot; (173 cm)</option>
                <option value="175">5&apos;9&quot; (175 cm)</option>
                <option value="178">5&apos;10&quot; (178 cm)</option>
                <option value="180">5&apos;11&quot; (180 cm)</option>
                <option value="183">6&apos;0&quot; (183 cm)</option>
                <option value="185">6&apos;1&quot; (185 cm)</option>
                <option value="188">6&apos;2&quot; (188 cm)</option>
                <option value="191">6&apos;3&quot; (191 cm)</option>
                <option value="193">6&apos;4&quot; (193 cm)</option>
                <option value="196">6&apos;5&quot; (196 cm)</option>
                <option value="198">6&apos;6&quot; (198 cm)</option>
              </select>
              {errors.height && <div className="text-red-600 text-sm mt-1">{errors.height}</div>}
            </div>

            {/* Body Type */}
            <div className={errors.bodyType ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Type *
              </label>
              <select
                value={profileData.bodyType}
                onChange={(e) => setProfileData(prev => ({ ...prev, bodyType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
              >
                <option value="">Select body type</option>
                <option value="Slim">Slim</option>
                <option value="Athletic">Athletic</option>
                <option value="Average">Average</option>
                <option value="Curvy">Curvy</option>
                <option value="Full-figured">Full-figured</option>
                <option value="Muscular">Muscular</option>
                <option value="Petite">Petite</option>
                <option value="Plus-size">Plus-size</option>
                <option value="Other">Other</option>
              </select>
              {errors.bodyType && <div className="text-red-600 text-sm mt-1">{errors.bodyType}</div>}
            </div>

            {/* Eye Color */}
            <div className={errors.eyeColor ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eye Color *
              </label>
              <select
                value={profileData.eyeColor}
                onChange={(e) => setProfileData(prev => ({ ...prev, eyeColor: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
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
              {errors.eyeColor && <div className="text-red-600 text-sm mt-1">{errors.eyeColor}</div>}
            </div>

            {/* Hair Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hair Color
              </label>
              <select
                value={profileData.hairColor}
                onChange={(e) => setProfileData(prev => ({ ...prev, hairColor: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

            {/* Ethnicity */}
            <div className={errors.ethnicity ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ethnicity *
              </label>
              <select
                value={profileData.ethnicity}
                onChange={(e) => setProfileData(prev => ({ ...prev, ethnicity: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
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
              {errors.ethnicity && <div className="text-red-600 text-sm mt-1">{errors.ethnicity}</div>}
            </div>
          </div>
        </div>

        {/* Background & Lifestyle */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎓 Background & Lifestyle
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Religion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Religion
              </label>
              <select
                value={profileData.religion}
                onChange={(e) => setProfileData(prev => ({ ...prev, religion: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Political Views
              </label>
              <select
                value={profileData.politicalViews}
                onChange={(e) => setProfileData(prev => ({ ...prev, politicalViews: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Smoking Status
              </label>
              <select
                value={profileData.smokingStatus}
                onChange={(e) => setProfileData(prev => ({ ...prev, smokingStatus: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drinking Status
              </label>
              <select
                value={profileData.drinkingStatus}
                onChange={(e) => setProfileData(prev => ({ ...prev, drinkingStatus: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              >
                <option value="">Select drinking status</option>
                <option value="Never">Never</option>
                <option value="Rarely">Rarely</option>
                <option value="Socially">Socially</option>
                <option value="Regularly">Regularly</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Children Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have children?
              </label>
              <select
                value={profileData.hasChildren}
                onChange={(e) => setProfileData(prev => ({ ...prev, hasChildren: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              >
                <option value="">Select option</option>
                <option value="No">No</option>
                <option value="Yes, living with me">Yes, living with me</option>
                <option value="Yes, not living with me">Yes, not living with me</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Want Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you want children?
              </label>
              <select
                value={profileData.wantsChildren}
                onChange={(e) => setProfileData(prev => ({ ...prev, wantsChildren: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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
        </div>

        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Compatibility Analysis</span>
          </div>
          <p className="text-xs text-gray-600">
            Physical attributes and background information help AMORE find matches with compatible lifestyles, 
            values, and physical preferences for deeper compatibility beyond surface-level attraction.
          </p>
        </div>
      </div>
    );
  }

  function renderLifestyleStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Coffee className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Lifestyle</h3>
          <p className="text-gray-600">Tell us how you live your daily life for better lifestyle matching</p>
        </div>

        {/* Career & Education */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💼 Career & Education
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Occupation */}
            <div className={errors.occupation ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation *
              </label>
              <input
                type="text"
                value={profileData.occupation}
                onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                placeholder="What do you do for work?"
                required
              />
              {errors.occupation && <div className="text-red-600 text-sm mt-1">{errors.occupation}</div>}
            </div>

            {/* Education */}
            <div className={errors.education ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education *
              </label>
              <select
                value={profileData.education}
                onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
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
              {errors.education && <div className="text-red-600 text-sm mt-1">{errors.education}</div>}
            </div>

            {/* Income Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Income Range (Optional)
              </label>
              <select
                value={profileData.income}
                onChange={(e) => setProfileData(prev => ({ ...prev, income: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

            {/* Career Ambitions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Ambitions
              </label>
              <textarea
                value={profileData.careerAmbitions}
                onChange={(e) => setProfileData(prev => ({ ...prev, careerAmbitions: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                rows={3}
                placeholder="What are your career goals and ambitions?"
              />
            </div>
          </div>
        </div>

        {/* Living Situation */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🏠 Living Situation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Living Arrangement */}
            <div className={errors.livingArrangement ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Living Arrangement *
              </label>
              <select
                value={profileData.livingArrangement}
                onChange={(e) => setProfileData(prev => ({ ...prev, livingArrangement: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                required
              >
                <option value="">Select living arrangement</option>
                <option value="Live alone">Live alone</option>
                <option value="Live with roommates">Live with roommates</option>
                <option value="Live with family">Live with family</option>
                <option value="Live with partner">Live with partner</option>
                <option value="Live with children">Live with children</option>
                <option value="Other">Other</option>
              </select>
              {errors.livingArrangement && <div className="text-red-600 text-sm mt-1">{errors.livingArrangement}</div>}
            </div>

            {/* Transportation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation
              </label>
              <select
                value={profileData.transportationMode}
                onChange={(e) => setProfileData(prev => ({ ...prev, transportationMode: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

            {/* Pet Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Preference
              </label>
              <select
                value={profileData.petPreference}
                onChange={(e) => setProfileData(prev => ({ ...prev, petPreference: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

            {/* Social Media Usage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Usage
              </label>
              <select
                value={profileData.socialMediaUsage}
                onChange={(e) => setProfileData(prev => ({ ...prev, socialMediaUsage: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
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

        {/* Weekend & Free Time */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎉 Weekend & Free Time
          </h4>
          <div className="space-y-4">
            {/* Weekend Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typical Weekend Activities
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Staying home', 'Going out with friends', 'Outdoor activities', 'Sports',
                  'Shopping', 'Movies/Theater', 'Restaurants', 'Bars/Clubs',
                  'Museums/Culture', 'Reading', 'Cooking', 'Traveling',
                  'Family time', 'Volunteering', 'Fitness/Gym', 'Hobbies',
                  'Netflix/TV', 'Gaming', 'Nature/Hiking', 'Beach/Pool'
                ].map((activity) => {
                  const isSelected = profileData.weekendActivities?.includes(activity) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {activity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Financial Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Goals & Priorities
              </label>
              <textarea
                value={profileData.financialGoals}
                onChange={(e) => setProfileData(prev => ({ ...prev, financialGoals: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                rows={3}
                placeholder="What are your financial goals? (e.g., saving for a house, travel, retirement, etc.)"
              />
            </div>
          </div>
        </div>

        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Lifestyle Compatibility</span>
          </div>
          <p className="text-xs text-gray-600">
            Your lifestyle information helps AMORE match you with people who share similar daily routines, 
            career ambitions, living situations, and weekend preferences for long-term compatibility.
          </p>
        </div>
      </div>
    );
  }

  function renderInterestsStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">What You Love</h3>
          <p className="text-gray-600">Select your interests and passions to find people who share your enthusiasm</p>
        </div>

        {/* Core Interests */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.interests ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            ❤️ Core Interests
            {errors.interests && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.interests && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.interests}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Art & Design', 'Music', 'Photography', 'Writing', 'Reading', 'Movies & TV',
              'Theater', 'Dancing', 'Singing', 'Comedy', 'Fashion', 'Beauty',
              'Travel', 'Adventure', 'Hiking', 'Camping', 'Beach', 'Mountains',
              'Sports', 'Fitness', 'Yoga', 'Running', 'Cycling', 'Swimming',
              'Cooking', 'Baking', 'Wine Tasting', 'Coffee', 'Food & Dining', 'Nutrition',
              'Technology', 'Gaming', 'Science', 'History', 'Politics', 'Philosophy',
              'Spirituality', 'Meditation', 'Volunteering', 'Environment', 'Animals', 'Pets',
              'Business', 'Entrepreneurship', 'Investing', 'Real Estate', 'Cars', 'Motorcycles',
              'Gardening', 'DIY Projects', 'Crafting', 'Collecting', 'Antiques', 'Vintage'
            ].map((interest) => {
              const isSelected = profileData.interests?.includes(interest) || false;
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => {
                    const interests = profileData.interests || [];
                    if (isSelected) {
                      setProfileData(prev => ({ ...prev, interests: interests.filter(i => i !== interest) }));
                    } else {
                      setProfileData(prev => ({ ...prev, interests: [...interests, interest] }));
                    }
                  }}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Movies & Entertainment */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.movieGenres ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎬 Movies & TV Shows
            {errors.movieGenres && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.movieGenres && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.movieGenres}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Action', 'Adventure', 'Comedy', 'Drama', 'Romance', 'Thriller',
              'Horror', 'Sci-Fi', 'Fantasy', 'Mystery', 'Crime', 'Documentary',
              'Animation', 'Musical', 'Western', 'War', 'Biography', 'History',
              'Reality TV', 'Talk Shows', 'News', 'Sports', 'Cooking Shows', 'Travel Shows'
            ].map((genre) => {
              const isSelected = profileData.movieGenres?.includes(genre) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Food & Cuisine */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.cuisinePreferences ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🍽️ Food & Cuisine Preferences
            {errors.cuisinePreferences && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.cuisinePreferences && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.cuisinePreferences}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian',
              'Mediterranean', 'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese',
              'American', 'BBQ', 'Seafood', 'Steakhouse', 'Pizza', 'Sushi',
              'Vegetarian', 'Vegan', 'Organic', 'Farm-to-Table', 'Fast Food', 'Street Food',
              'Fine Dining', 'Casual Dining', 'Food Trucks', 'Brunch', 'Desserts', 'Ice Cream'
            ].map((cuisine) => {
              const isSelected = profileData.cuisinePreferences?.includes(cuisine) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {cuisine}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel & Adventure */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            ✈️ Travel & Adventure Style
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Beach Vacations', 'City Breaks', 'Mountain Retreats', 'Road Trips', 'Backpacking', 'Luxury Travel',
              'Cultural Tours', 'Adventure Sports', 'Camping', 'Cruises', 'Solo Travel', 'Group Travel',
              'International Travel', 'Domestic Travel', 'Weekend Getaways', 'Extended Vacations'
            ].map((style) => {
              const isSelected = profileData.travelStyle?.includes(style) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fitness & Activities */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💪 Fitness & Physical Activities
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Gym Workouts', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Pilates',
              'CrossFit', 'Martial Arts', 'Boxing', 'Dancing', 'Rock Climbing', 'Hiking',
              'Tennis', 'Basketball', 'Soccer', 'Golf', 'Skiing', 'Snowboarding',
              'Surfing', 'Skateboarding', 'Volleyball', 'Baseball', 'Football', 'Hockey'
            ].map((activity) => {
              const isSelected = profileData.fitnessActivities?.includes(activity) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {activity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Books & Literature */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            📚 Books & Literature
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Fiction', 'Non-Fiction', 'Romance', 'Mystery', 'Thriller', 'Sci-Fi',
              'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Psychology',
              'Philosophy', 'Poetry', 'Comics', 'Graphic Novels', 'Young Adult', 'Classic Literature',
              'Audiobooks', 'E-books', 'Physical Books', 'Book Clubs', 'Literary Magazines', 'Writing'
            ].map((genre) => {
              const isSelected = profileData.booksGenres?.includes(genre) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Interest Matching</span>
          </div>
          <p className="text-xs text-gray-600">
            Your interests help AMORE find people who share your passions and can engage in meaningful conversations 
            about the things you love. Shared interests are the foundation of lasting connections.
          </p>
        </div>
      </div>
    );
  }

  function renderDatingGoalsStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Target className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Dating Goals</h3>
          <p className="text-gray-600">Tell us what you're seeking in relationships and connections</p>
        </div>

        {/* Relationship Goals */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.relationshipGoals ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💕 What Are You Looking For?
            {errors.relationshipGoals && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.relationshipGoals && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.relationshipGoals}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship Goals *
              </label>
              <select
                value={profileData.relationshipGoals}
                onChange={(e) => setProfileData(prev => ({ ...prev, relationshipGoals: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                required
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Orientation
              </label>
              <select
                value={profileData.familyOrientation}
                onChange={(e) => setProfileData(prev => ({ ...prev, familyOrientation: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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
        </div>

        {/* Communication & Connection */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💬 Communication & Connection
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Love Language */}
            <div className={errors.loveLanguage ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Love Language *
              </label>
              <select
                value={profileData.loveLanguage}
                onChange={(e) => setProfileData(prev => ({ ...prev, loveLanguage: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select your love language</option>
                <option value="Words of Affirmation">Words of Affirmation</option>
                <option value="Quality Time">Quality Time</option>
                <option value="Physical Touch">Physical Touch</option>
                <option value="Acts of Service">Acts of Service</option>
                <option value="Receiving Gifts">Receiving Gifts</option>
              </select>
              {errors.loveLanguage && <div className="text-red-600 text-sm mt-1">{errors.loveLanguage}</div>}
            </div>

            {/* Communication Style */}
            <div className={errors.communicationStyle ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Style *
              </label>
              <select
                value={profileData.communicationStyle}
                onChange={(e) => setProfileData(prev => ({ ...prev, communicationStyle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select your style</option>
                <option value="Direct and honest">Direct and honest</option>
                <option value="Gentle and understanding">Gentle and understanding</option>
                <option value="Playful and humorous">Playful and humorous</option>
                <option value="Deep and meaningful">Deep and meaningful</option>
                <option value="Casual and easygoing">Casual and easygoing</option>
                <option value="Thoughtful and considerate">Thoughtful and considerate</option>
              </select>
              {errors.communicationStyle && <div className="text-red-600 text-sm mt-1">{errors.communicationStyle}</div>}
            </div>

            {/* Conflict Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conflict Resolution Style
              </label>
              <select
                value={profileData.conflictResolution}
                onChange={(e) => setProfileData(prev => ({ ...prev, conflictResolution: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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

            {/* Personality Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality Type (Optional)
              </label>
              <select
                value={profileData.personalityType}
                onChange={(e) => setProfileData(prev => ({ ...prev, personalityType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Select if known</option>
                <option value="INTJ">INTJ - The Architect</option>
                <option value="INTP">INTP - The Thinker</option>
                <option value="ENTJ">ENTJ - The Commander</option>
                <option value="ENTP">ENTP - The Debater</option>
                <option value="INFJ">INFJ - The Advocate</option>
                <option value="INFP">INFP - The Mediator</option>
                <option value="ENFJ">ENFJ - The Protagonist</option>
                <option value="ENFP">ENFP - The Campaigner</option>
                <option value="ISTJ">ISTJ - The Logistician</option>
                <option value="ISFJ">ISFJ - The Protector</option>
                <option value="ESTJ">ESTJ - The Executive</option>
                <option value="ESFJ">ESFJ - The Consul</option>
                <option value="ISTP">ISTP - The Virtuoso</option>
                <option value="ISFP">ISFP - The Adventurer</option>
                <option value="ESTP">ESTP - The Entrepreneur</option>
                <option value="ESFP">ESFP - The Entertainer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deal Breakers */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.dealBreakers ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🚫 Deal Breakers
            {errors.dealBreakers && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.dealBreakers && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.dealBreakers}
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">Select things that would be absolute deal breakers for you:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Smoking', 'Heavy drinking', 'Drug use', 'Dishonesty', 'Cheating history',
              'Bad hygiene', 'Rudeness', 'Extreme political views', 'Religious incompatibility',
              'Wants kids (if you don\'t)', 'Doesn\'t want kids (if you do)', 'Pet allergies',
              'Financial irresponsibility', 'Lack of ambition', 'Poor communication',
              'Anger issues', 'Jealousy/possessiveness', 'Different life goals',
              'Long distance', 'Age gap too large', 'Different values'
            ].map((dealBreaker) => {
              const isSelected = profileData.dealBreakers?.includes(dealBreaker) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {dealBreaker}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ideal Date Ideas */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💡 Ideal Date Ideas
          </h4>
          <p className="text-sm text-gray-600 mb-4">What would make for perfect dates in your opinion?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Coffee date', 'Dinner date', 'Lunch date', 'Drinks', 'Movies', 'Theater',
              'Concert', 'Museum', 'Art gallery', 'Walk in park', 'Hiking', 'Beach',
              'Cooking together', 'Game night', 'Mini golf', 'Bowling', 'Dancing',
              'Wine tasting', 'Food festival', 'Farmers market', 'Bookstore',
              'Picnic', 'Road trip', 'Adventure activity', 'Sports event', 'Festival',
              'Volunteer together', 'Class/workshop', 'Escape room', 'Karaoke',
              'Photography walk', 'Stargazing'
            ].map((dateIdea) => {
              const isSelected = profileData.idealDateIdeas?.includes(dateIdea) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {dateIdea}
                </button>
              );
            })}
          </div>
        </div>

        {/* Values & Life Goals */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎯 Values & Life Goals
          </h4>
          <div className="space-y-4">
            {/* Important Values */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What Values Are Most Important to You?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Honesty', 'Loyalty', 'Kindness', 'Respect', 'Trust', 'Communication',
                  'Family', 'Friendship', 'Career success', 'Financial stability',
                  'Adventure', 'Creativity', 'Health', 'Spirituality', 'Education',
                  'Environmental consciousness', 'Social justice', 'Personal growth'
                ].map((value) => {
                  const isSelected = profileData.valuesImportant?.includes(value) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Life Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major Life Goals
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Get married', 'Have children', 'Buy a house', 'Travel the world',
                  'Career advancement', 'Start a business', 'Get advanced degree',
                  'Live abroad', 'Learn new skills', 'Achieve financial freedom',
                  'Make a difference', 'Stay healthy & fit'
                ].map((goal) => {
                  const isSelected = profileData.lifeGoals?.includes(goal) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Relationship Compatibility</span>
          </div>
          <p className="text-xs text-gray-600">
            Your dating goals and relationship preferences help AMORE find people who want the same things you do, 
            share your values, and are compatible for long-term happiness together.
          </p>
        </div>
      </div>
    );
  }

  function renderPersonalityStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <User className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Who You Are</h3>
          <p className="text-gray-600">Share your personality traits and what makes you uniquely you</p>
        </div>

        {/* Core Personality Traits */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.personalityTraits ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            ✨ Core Personality Traits
            {errors.personalityTraits && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.personalityTraits && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.personalityTraits}
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">Select the traits that best describe your personality:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Adventurous', 'Ambitious', 'Artistic', 'Calm', 'Caring', 'Charismatic',
              'Compassionate', 'Confident', 'Creative', 'Curious', 'Determined', 'Empathetic',
              'Energetic', 'Enthusiastic', 'Funny', 'Generous', 'Gentle', 'Honest',
              'Humble', 'Independent', 'Intelligent', 'Intuitive', 'Kind', 'Loyal',
              'Optimistic', 'Organized', 'Passionate', 'Patient', 'Playful', 'Reliable',
              'Romantic', 'Sensitive', 'Spontaneous', 'Supportive', 'Thoughtful', 'Witty'
            ].map((trait) => {
              const isSelected = profileData.personalityTraits?.includes(trait) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {trait}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strengths & Qualities */}
        <div className={`bg-white border rounded-xl p-6 shadow-sm ${
          errors.strengthsQualities ? 'border-red-400 bg-red-50/50' : 'border-purple-200/50'
        }`}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💪 Your Strengths & Qualities
            {errors.strengthsQualities && <span className="text-red-500 text-sm ml-2">*</span>}
          </h4>
          {errors.strengthsQualities && (
            <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 rounded p-2">
              {errors.strengthsQualities}
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">What are your greatest strengths and positive qualities?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Great listener', 'Problem solver', 'Team player', 'Natural leader', 'Good communicator',
              'Emotionally supportive', 'Motivating others', 'Making people laugh', 'Staying calm under pressure',
              'Being organized', 'Creative thinking', 'Analytical mind', 'Attention to detail',
              'Building relationships', 'Adapting to change', 'Learning quickly', 'Being dependable',
              'Showing empathy', 'Taking initiative', 'Being authentic', 'Staying positive',
              'Conflict resolution', 'Time management', 'Being spontaneous'
            ].map((quality) => {
              const isSelected = profileData.strengthsQualities?.includes(quality) || false;
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isSelected ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                  {quality}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Energy & Preferences */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🌟 Social Energy & Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Introvert/Extrovert */}
            <div className={errors.introvertExtrovert ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Energy Preference *
              </label>
              <select
                value={profileData.introvertExtrovert}
                onChange={(e) => setProfileData(prev => ({ ...prev, introvertExtrovert: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select your preference</option>
                <option value="Introvert">Introvert - I recharge with alone time</option>
                <option value="Extrovert">Extrovert - I gain energy from being around people</option>
                <option value="Ambivert">Ambivert - I'm balanced between both</option>
                <option value="Social introvert">Social introvert - I enjoy small groups but need alone time</option>
                <option value="Outgoing introvert">Outgoing introvert - I can be social but prefer meaningful connections</option>
              </select>
              {errors.introvertExtrovert && <div className="text-red-600 text-sm mt-1">{errors.introvertExtrovert}</div>}
            </div>

            {/* Emotional Intelligence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotional Intelligence Style
              </label>
              <select
                value={profileData.emotionalIntelligence}
                onChange={(e) => setProfileData(prev => ({ ...prev, emotionalIntelligence: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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

            {/* Stress Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How You Handle Stress
              </label>
              <select
                value={profileData.stressManagement}
                onChange={(e) => setProfileData(prev => ({ ...prev, stressManagement: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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

            {/* Social Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Preferences
              </label>
              <div className="space-y-2">
                {[
                  'Small intimate gatherings', 'Large social events', 'One-on-one conversations',
                  'Group activities', 'Quiet environments', 'Lively atmospheres',
                  'Deep meaningful talks', 'Light casual chat', 'Meeting new people',
                  'Spending time with close friends'
                ].map((preference) => {
                  const isSelected = profileData.socialPreferences?.includes(preference) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {preference}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Insights */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💭 Personal Insights
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What Makes You Unique? (Optional)
              </label>
              <textarea
                value={profileData.personalityInsights}
                onChange={(e) => setProfileData(prev => ({ ...prev, personalityInsights: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                rows={4}
                placeholder="Share something unique about your personality, perspective, or what makes you who you are..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {profileData.personalityInsights?.length || 0}/500 characters
              </div>
            </div>
          </div>
        </div>

        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Personality Analysis</span>
          </div>
          <p className="text-xs text-gray-600">
            Your personality profile helps AMORE understand your character, communication style, and social preferences 
            to find people who complement your personality and share compatible traits for meaningful connections.
          </p>
        </div>
      </div>
    );
  }

  function renderPreferencesStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Settings className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Preferences</h3>
          <p className="text-gray-600">Set your partner preferences and privacy settings for optimal matching</p>
        </div>

        {/* Phone Number */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📱 Contact Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">We'll never share your number publicly</p>
          </div>
        </div>

        {/* Basic Partner Preferences */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            💕 Partner Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age Range */}
            <div className={errors.ageRange ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range *
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={profileData.ageRangeMin}
                    onChange={(e) => setProfileData(prev => ({ ...prev, ageRangeMin: parseInt(e.target.value) || 18 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Min"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={profileData.ageRangeMax}
                    onChange={(e) => setProfileData(prev => ({ ...prev, ageRangeMax: parseInt(e.target.value) || 35 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Max"
                  />
                </div>
              </div>
              {errors.ageRange && <div className="text-red-600 text-sm mt-1">{errors.ageRange}</div>}
            </div>

            {/* Maximum Distance */}
            <div className={errors.maxDistance ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Distance *
              </label>
              <select
                value={profileData.maxDistance}
                onChange={(e) => setProfileData(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="250">Within 250 miles</option>
                <option value="500">Within 500 miles</option>
                <option value="1000">Anywhere</option>
              </select>
              {errors.maxDistance && <div className="text-red-600 text-sm mt-1">{errors.maxDistance}</div>}
            </div>

            {/* Preferred Genders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interested In
              </label>
              <div className="space-y-2">
                {['Men', 'Women', 'Non-binary', 'Everyone'].map((gender) => {
                  const isSelected = profileData.preferredGenders?.includes(gender) || false;
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
                      className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left ${
                        isSelected ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-4 h-4 mr-2" />}
                      {gender}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Education Level
              </label>
              <div className="space-y-2">
                {[
                  'High School', 'Some College', 'Associate Degree', 'Bachelor\'s Degree',
                  'Master\'s Degree', 'Doctorate/PhD', 'Professional Degree', 'Trade School'
                ].map((education) => {
                  const isSelected = profileData.preferredEducation?.includes(education) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {education}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Physical & Lifestyle Preferences */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🎯 Physical & Lifestyle Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Body Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Body Types (Optional)
              </label>
              <div className="space-y-2">
                {[
                  'Slim', 'Athletic', 'Average', 'Curvy', 'Full-figured', 
                  'Muscular', 'Petite', 'Plus-size', 'Any body type'
                ].map((bodyType) => {
                  const isSelected = profileData.preferredBodyTypes?.includes(bodyType) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {bodyType}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Ethnicities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Ethnicities (Optional)
              </label>
              <div className="space-y-2">
                {[
                  'Asian', 'Black/African American', 'Hispanic/Latino', 'White/Caucasian',
                  'Middle Eastern', 'Native American', 'Pacific Islander', 'Mixed/Multiracial',
                  'Any ethnicity'
                ].map((ethnicity) => {
                  const isSelected = profileData.preferredEthnicities?.includes(ethnicity) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {ethnicity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lifestyle Preferences */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Lifestyle Traits
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Non-smoker', 'Social drinker', 'Non-drinker', 'Fitness enthusiast',
                  'Loves travel', 'Homebody', 'Career-focused', 'Family-oriented',
                  'Adventurous', 'Intellectual', 'Creative', 'Spiritual',
                  'Environmentally conscious', 'Pet lover', 'Foodie', 'Music lover'
                ].map((lifestyle) => {
                  const isSelected = profileData.preferredLifestyles?.includes(lifestyle) || false;
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
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="inline-block w-3 h-3 mr-1" />}
                      {lifestyle}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Visibility Settings */}
        <div className="bg-white border border-purple-200/50 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🔒 Privacy & Visibility Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Visibility */}
            <div className={errors.profileVisibility ? 'border border-red-300 rounded-lg p-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility *
              </label>
              <select
                value={profileData.profileVisibility}
                onChange={(e) => setProfileData(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select visibility</option>
                <option value="public">Public - Everyone can see my profile</option>
                <option value="members-only">Members Only - Only verified members can see my profile</option>
                <option value="premium-only">Premium Only - Only premium members can see my profile</option>
                <option value="private">Private - Only people I like can see my profile</option>
              </select>
              {errors.profileVisibility && <div className="text-red-600 text-sm mt-1">{errors.profileVisibility}</div>}
            </div>

            {/* Who Can Message You */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who Can Message You
              </label>
              <select
                value={profileData.allowMessagesFrom}
                onChange={(e) => setProfileData(prev => ({ ...prev, allowMessagesFrom: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="everyone">Everyone</option>
                <option value="matches-only">Matches Only</option>
                <option value="premium-members">Premium Members Only</option>
                <option value="verified-only">Verified Members Only</option>
              </select>
            </div>

            {/* Show Last Active */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.showLastActive}
                  onChange={(e) => setProfileData(prev => ({ ...prev, showLastActive: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Show when I was last active</span>
              </label>
            </div>

            {/* Show Distance */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.showDistance}
                  onChange={(e) => setProfileData(prev => ({ ...prev, showDistance: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Show my distance to other users</span>
              </label>
            </div>
          </div>
        </div>

        {/* Premium Features Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-pink-50/30 border border-purple-200/30 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            ⭐ Premium Matching Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-yellow-300">
              <h5 className="font-semibold text-purple-700 mb-2">🥈 Platinum Tier ($59.99/month)</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Personal matchmaking team</li>
                <li>• Phone/Zoom consultations</li>
                <li>• Video interviews from office</li>
                <li>• Personalized matching assistance</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-300">
              <h5 className="font-semibold text-purple-700 mb-2">💎 Real Members Club ($999.99/month)</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ultra-exclusive tier with profile privacy</li>
                <li>• Dedicated team for blind dates</li>
                <li>• In-person meetings anywhere in US</li>
                <li>• Full concierge dating service</li>
              </ul>
            </div>
          </div>
        </div>

        {/* AMORE AI Analysis Notice */}
        <div className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-200/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">🤖 AMORE Smart Matching</span>
          </div>
          <p className="text-xs text-gray-600">
            Your preferences help AMORE filter and prioritize potential matches based on your specific criteria, 
            while our AI analyzes compatibility beyond surface-level preferences for deeper connections.
          </p>
        </div>

        {/* Profile Complete Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-green-800 mb-2">🎉 Profile Complete!</h4>
              <p className="text-sm text-gray-700">
                You've completed all profile sections! AMORE AI will now find your perfect matches based on your comprehensive profile. Click "Complete Profile" to finish and start meeting amazing people!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPlaceholderStep(step: any) {
    const Icon = step.icon;
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h3>
          <p className="text-gray-600">{step.description}</p>
          <div className="mt-4 text-sm text-gray-500">Step content implementation in progress...</div>
        </div>
      </div>
    );
  }
}
