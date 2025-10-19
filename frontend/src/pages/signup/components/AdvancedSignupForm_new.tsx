'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Lock, Eye, EyeOff, Calendar, Phone, 
  Check, X, AlertCircle, Info, MapPin, ChevronDown, ChevronUp,
  Brain, Sparkles, HelpCircle, Zap, Shield, Target, TrendingUp,
  Activity, Fingerprint, Smartphone, Wifi, Globe, Lightbulb,
  CheckCircle2, XCircle, AlertTriangle, Star, Award,
  Timer, Users, Key, Gauge, Radar, TrendingDown, Heart
} from 'lucide-react'
import SocialProfileImporter from './SocialProfileImporter'
import AIFormAssistant from './AIFormAssistant'
import SecurityScoreDashboard from './SecurityScoreDashboard'
import AdvancedPasswordSecurity from './AdvancedPasswordSecurity'
import SecurityLevelIndicator_new from './SecurityLevelIndicator_new'
import IntelligentCaptcha from './IntelligentCaptcha'
import { trackEvent } from '@/lib/analytics/track'
import { generateDeviceFingerprint, generateFingerprintHash } from '@/lib/utils/deviceFingerprint'
import { getSessionId, getDeviceId, initializeSession, getSessionDuration } from '@/lib/utils/sessionService'

interface FormData {
  firstName: string
  lastName: string
  email: string
  nickname: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  phone: string
  gender: string
  location: string
  agreeToTerms: boolean
  profileImage?: string
  biometricCredentialId?: string
  sms2faEnabled?: boolean
}

interface ValidationError {
  field: string
  message: string
  type: 'error' | 'warning' | 'info'
}

interface FieldValidation {
  isValid: boolean
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
}

interface ImportedProfileData {
  platform: string
  firstName?: string
  lastName?: string
  email?: string
  dateOfBirth?: string
  location?: string
  occupation?: string
  bio?: string
  profileImage?: string
  interests?: string[]
  education?: string
  verified?: boolean
}

const AdvancedSignupForm_new: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
    gender: '',
    location: '',
    agreeToTerms: false,
    sms2faEnabled: false
  })

  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isImportSectionMinimized, setIsImportSectionMinimized] = useState(true)
  const [currentField, setCurrentField] = useState('')
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [hasStartedForm, setHasStartedForm] = useState(false)
  
  // Advanced Security Features
  const [securityScore, setSecurityScore] = useState(65)
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [deviceFingerprint, setDeviceFingerprint] = useState<any>(null)
  const [behaviorData, setBehaviorData] = useState<any>({
    mouseMovements: 0,
    keystrokes: 0,
    timeOnPage: 0,
    scrollBehavior: 0,
    clickPatterns: 0,
    suspicionScore: 15
  })
  const [smsVerificationSent, setSmsVerificationSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [showSecurityFeatures, setShowSecurityFeatures] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showFieldHelp, setShowFieldHelp] = useState<Record<string, boolean>>({})
  const [completionProgress, setCompletionProgress] = useState(0)
  const [showProgressIndicator, setShowProgressIndicator] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [availabilityChecking, setAvailabilityChecking] = useState<Record<string, boolean>>({})
  const [availabilityResults, setAvailabilityResults] = useState<Record<string, { available: boolean; message?: string }>>({})
  const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({})

  // Calculate security score based on form completion and device fingerprint
  const calculateSecurityScore = (fingerprint: any, formData: FormData): number => {
    let score = 0
    
    // Base form completion score (40 points)
    const requiredFields = ['firstName', 'lastName', 'email', 'nickname', 'password', 'dateOfBirth', 'gender']
    const completedFields = requiredFields.filter(field => formData[field as keyof FormData])
    score += (completedFields.length / requiredFields.length) * 40
    
    // Password strength (25 points)
    if (formData.password) {
      const hasMinLength = formData.password.length >= 8
      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumbers = /\d/.test(formData.password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
      const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
      score += (strength / 5) * 25
    }
    
    // Phone number (10 points)
    if (formData.phone && formData.phone.length >= 10) {
      score += 10
    }
    
    // SMS 2FA enabled (15 points)
    if (formData.sms2faEnabled) {
      score += 15
    }
    
    // Device fingerprint diversity (10 points)
    if (fingerprint) {
      if (fingerprint.canvas) score += 3
      if (fingerprint.webgl && fingerprint.webgl !== 'WebGL not supported') score += 3
      if (fingerprint.fonts?.length > 10) score += 4
    }
    
    return Math.min(Math.round(score), 100)
  }

  // Reduced motion support
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches : false,
    []
  )

  // Debounced availability checking
  const checkAvailability = async (field: 'email' | 'nickname', value: string) => {
    if (!value || value.length < 3) return
    
    // Temporary: Skip availability checking until backend endpoints are ready
    // The endpoints /api/auth/check-email and /api/auth/check-nickname return 404
    console.log(`Skipping availability check for ${field}: ${value} (endpoints return 404)`)
    return

    // Clear existing timer for this field
    if (debounceTimers[field]) {
      clearTimeout(debounceTimers[field])
    }

    // Set new timer
    const timer = setTimeout(async () => {
      setAvailabilityChecking(prev => ({ ...prev, [field]: true }))
      
      try {
        const { authService } = await import('../../../services/authService')
        let result: { available: boolean; message?: string }
        
        if (field === 'email') {
          result = await authService.checkEmailAvailability(value)
        } else {
          result = await authService.checkNicknameAvailability(value)
        }
        
        setAvailabilityResults(prev => ({ ...prev, [field]: result }))
        
        // Update field validation based on availability
        setFieldValidations(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            isValid: result.available && (prev[field]?.isValid ?? true),
            message: result.available 
              ? (field === 'email' ? 'Email is available' : 'Nickname is available')
              : (result.message || `This ${field} is already taken`),
            type: result.available ? 'success' : 'error'
          }
        }))
        
      } catch (error) {
        console.error(`${field} availability check failed:`, error)
      } finally {
        setAvailabilityChecking(prev => ({ ...prev, [field]: false }))
      }
    }, 800) // 800ms debounce

    setDebounceTimers(prev => ({ ...prev, [field]: timer }))
  }

  // Initialize device fingerprint and session tracking
  useEffect(() => {
    const initializeSecurityFeatures = async () => {
      try {
        // Initialize session tracking
        initializeSession()
        
        // Generate device fingerprint
        const fingerprint = await generateDeviceFingerprint()
        setDeviceFingerprint(fingerprint)
        
        // Calculate initial security score
        const initialScore = calculateSecurityScore(fingerprint, formData)
        setSecurityScore(initialScore)
        
        trackEvent('security_initialization', {
          initialScore,
          hasFingerprint: !!fingerprint,
          sessionId: getSessionId()
        })
      } catch (error) {
        console.error('Failed to initialize security features:', error)
      }
    }
    
    initializeSecurityFeatures()
  }, [])

  // Behavior tracking for CAPTCHA and security
  useEffect(() => {
    let mouseMovements = 0
    let keystrokes = 0
    let scrollBehavior = 0
    let clickPatterns = 0
    const startTime = Date.now()

    const handleMouseMove = () => {
      mouseMovements++
      setBehaviorData((prev: any) => ({ ...prev, mouseMovements }))
    }

    const handleKeyDown = () => {
      keystrokes++
      setBehaviorData((prev: any) => ({ ...prev, keystrokes }))
    }

    const handleScroll = () => {
      scrollBehavior++
      setBehaviorData((prev: any) => ({ ...prev, scrollBehavior }))
    }

    const handleClick = () => {
      clickPatterns++
      setBehaviorData((prev: any) => ({ ...prev, clickPatterns }))
    }

    const updateTimeOnPage = () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000)
      const suspicionScore = Math.max(0, 30 - (mouseMovements * 0.5) - (keystrokes * 0.3) - (timeOnPage * 0.1))
      setBehaviorData((prev: any) => ({ 
        ...prev, 
        timeOnPage,
        suspicionScore
      }))
      
      // Trigger CAPTCHA if suspicious behavior detected
      if (suspicionScore > 20 && timeOnPage > 30) {
        setCaptchaRequired(true)
      }
    }

    // Add event listeners
    if (typeof window !== 'undefined') {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('scroll', handleScroll)
      document.addEventListener('click', handleClick)
    }

    // Update time on page every second
    const timeInterval = setInterval(updateTimeOnPage, 1000)

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('scroll', handleScroll)
        document.removeEventListener('click', handleClick)
      }
      clearInterval(timeInterval)
    }
  }, [])

  // Real-time validation and security score updates
  useEffect(() => {
    const validations: Record<string, FieldValidation> = {}

    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValidEmail = emailRegex.test(formData.email)
      
      if (!isValidEmail) {
        validations.email = {
          isValid: false,
          message: 'Please enter a valid email address',
          type: 'error'
        }
      } else {
        // Check availability if format is valid
        checkAvailability('email', formData.email)
        
        // Use availability result if available, otherwise show format validation
        const availabilityResult = availabilityResults.email
        if (availabilityResult) {
          validations.email = {
            isValid: availabilityResult.available,
            message: availabilityResult.available 
              ? 'Email is available' 
              : (availabilityResult.message || 'This email is already registered'),
            type: availabilityResult.available ? 'success' : 'error'
          }
        } else {
          validations.email = {
            isValid: true,
            message: availabilityChecking.email ? 'Checking availability...' : 'Email format is valid',
            type: availabilityChecking.email ? 'info' : 'success'
          }
        }
      }
    }

    // Nickname validation
    if (formData.nickname) {
      const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/
      const isValidNickname = nicknameRegex.test(formData.nickname)
      
      if (formData.nickname.length < 3) {
        validations.nickname = {
          isValid: false,
          message: 'Nickname must be at least 3 characters',
          type: 'error'
        }
      } else if (formData.nickname.length > 20) {
        validations.nickname = {
          isValid: false,
          message: 'Nickname must be less than 20 characters',
          type: 'error'
        }
      } else if (!isValidNickname) {
        validations.nickname = {
          isValid: false,
          message: 'Only letters, numbers, and underscores allowed',
          type: 'error'
        }
      } else {
        // Check availability if format is valid
        checkAvailability('nickname', formData.nickname)
        
        // Use availability result if available, otherwise show format validation
        const availabilityResult = availabilityResults.nickname
        if (availabilityResult) {
          validations.nickname = {
            isValid: availabilityResult.available,
            message: availabilityResult.available 
              ? 'Nickname is available' 
              : (availabilityResult.message || 'This nickname is already taken'),
            type: availabilityResult.available ? 'success' : 'error'
          }
        } else {
          validations.nickname = {
            isValid: true,
            message: availabilityChecking.nickname ? 'Checking availability...' : 'Nickname format is valid',
            type: availabilityChecking.nickname ? 'info' : 'success'
          }
        }
      }
    }

    // Password validation
    if (formData.password) {
      const hasMinLength = formData.password.length >= 8
      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumbers = /\d/.test(formData.password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)

      const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length

      if (strength < 3) {
        validations.password = {
          isValid: false,
          message: 'Password is too weak',
          type: 'error'
        }
      } else if (strength < 4) {
        validations.password = {
          isValid: true,
          message: 'Password strength: Medium',
          type: 'warning'
        }
      } else {
        validations.password = {
          isValid: true,
          message: 'Password strength: Strong',
          type: 'success'
        }
      }
    }

    // Confirm password validation
    if (formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        validations.confirmPassword = {
          isValid: false,
          message: 'Passwords do not match',
          type: 'error'
        }
      } else {
        validations.confirmPassword = {
          isValid: true,
          message: 'Passwords match',
          type: 'success'
        }
      }
    }

    // Name validations
    if (formData.firstName) {
      if (formData.firstName.length < 2) {
        validations.firstName = {
          isValid: false,
          message: 'First name must be at least 2 characters',
          type: 'error'
        }
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
        validations.firstName = {
          isValid: false,
          message: 'Only letters and spaces allowed',
          type: 'error'
        }
      } else {
        validations.firstName = {
          isValid: true,
          message: 'Valid first name',
          type: 'success'
        }
      }
    }

    if (formData.lastName) {
      if (formData.lastName.length < 2) {
        validations.lastName = {
          isValid: false,
          message: 'Last name must be at least 2 characters',
          type: 'error'
        }
      } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
        validations.lastName = {
          isValid: false,
          message: 'Only letters and spaces allowed',
          type: 'error'
        }
      } else {
        validations.lastName = {
          isValid: true,
          message: 'Valid last name',
          type: 'success'
        }
      }
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 13) {
        validations.dateOfBirth = {
          isValid: false,
          message: 'You must be at least 13 years old',
          type: 'error'
        }
      } else if (age < 18) {
        validations.dateOfBirth = {
          isValid: true,
          message: 'You will be directed to our teen-safe platform',
          type: 'info'
        }
      } else {
        validations.dateOfBirth = {
          isValid: true,
          message: 'Valid age',
          type: 'success'
        }
      }
    }

    setFieldValidations(validations)
    
    // Update security score when form data changes
    const newSecurityScore = calculateSecurityScore(deviceFingerprint, formData)
    setSecurityScore(newSecurityScore)
    
    // Calculate completion progress
    const requiredFields = ['firstName', 'lastName', 'email', 'nickname', 'password', 'confirmPassword', 'dateOfBirth', 'gender']
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData]
      return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
    })
    const progress = Math.round((completedFields.length / requiredFields.length) * 100)
    setCompletionProgress(progress)
    
    // Show progress indicator when user starts filling form
    if (progress > 0 && !showProgressIndicator) {
      setShowProgressIndicator(true)
    }
  }, [formData, deviceFingerprint, showProgressIndicator, availabilityResults, availabilityChecking])

  // Track when user starts filling the form
  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => 
      typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
    ).length
    
    if (filledFields > 0 && !hasStartedForm) {
      setHasStartedForm(true)
      // Hide help after user starts typing
      setTimeout(() => setShowAIHelp(false), 3000)
    }
  }, [formData, hasStartedForm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Mark field as touched
    setTouchedFields(prev => new Set([...Array.from(prev), name]))
    
    // Clear general errors when user starts typing
    if (errors.general) {
      setErrors({})
    }
  }

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set([...Array.from(prev), fieldName]))
  }

  const handleFocus = (fieldName: string) => {
    setCurrentField(fieldName)
  }

  // Handle social profile import
  const handleImportComplete = (data: ImportedProfileData) => {
    console.log('Profile import completed:', data)
    // You could show a success message here
  }

  const handleFieldUpdate = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Mark field as touched when updated via import
    setTouchedFields(prev => new Set([...Array.from(prev), field]))
  }

  // SMS 2FA handlers
  const handleSendSMSVerification = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setErrors((prev: Record<string, string>) => ({ ...prev, phone: 'Please enter a valid phone number' }))
      return
    }

    try {
      // Simulate SMS sending (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSmsVerificationSent(true)
      setFormData(prev => ({ ...prev, sms2faEnabled: true }))
      
      trackEvent('sms_verification_sent', {
        phone: formData.phone.slice(-4), // Only track last 4 digits for privacy
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setErrors((prev: Record<string, string>) => ({ ...prev, phone: 'Failed to send SMS verification' }))
    }
  }

  const handleVerifySMSCode = async () => {
    if (smsCode.length !== 6) {
      setErrors((prev: Record<string, string>) => ({ ...prev, smsCode: 'Please enter the 6-digit code' }))
      return
    }

    try {
      // Simulate SMS verification (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      trackEvent('sms_verification_completed', {
        success: true,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setErrors((prev: Record<string, string>) => ({ ...prev, smsCode: 'Invalid verification code' }))
    }
  }

  // CAPTCHA handlers
  const handleCaptchaComplete = (token: string) => {
    setCaptchaToken(token)
    setCaptchaRequired(false)
    
    trackEvent('captcha_completed', {
      suspicionScore: behaviorData.suspicionScore,
      timeOnPage: behaviorData.timeOnPage,
      timestamp: new Date().toISOString()
    })
  }

  // AI Assistant handlers
  const handleAISuggestion = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Mark field as touched when updated via AI
    setTouchedFields(prev => new Set([...Array.from(prev), field]))
  }

  const handleAIAutoComplete = (suggestions: Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      ...suggestions
    }))
    
    // Mark all AI-completed fields as touched
    const newTouchedFields = Object.keys(suggestions)
    setTouchedFields(prev => new Set([...Array.from(prev), ...newTouchedFields]))
  }

  // Visual help indicator functions
  const toggleFieldHelp = (fieldName: string) => {
    setShowFieldHelp(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  const getFieldHelpContent = (fieldName: string): { title: string; content: string; tips: string[] } => {
    const helpContent = {
      firstName: {
        title: "First Name",
        content: "Enter your first name as it appears on official documents.",
        tips: ["Use your real name for verification", "Avoid nicknames or abbreviations", "This helps build trust with matches"]
      },
      lastName: {
        title: "Last Name", 
        content: "Enter your last name for identity verification.",
        tips: ["Required for account security", "Used for background verification", "Kept private from other users"]
      },
      email: {
        title: "Email Address",
        content: "We'll use this for important account notifications and security alerts.",
        tips: ["Use a valid email you check regularly", "Required for password recovery", "We never share your email"]
      },
      nickname: {
        title: "Nickname",
        content: "This is how other users will see you on the platform.",
        tips: ["3-20 characters only", "Letters, numbers, and underscores allowed", "Choose something memorable"]
      },
      password: {
        title: "Password Security",
        content: "Create a strong password to protect your account.",
        tips: ["At least 8 characters", "Mix of uppercase, lowercase, numbers", "Include special characters for maximum security"]
      },
      phone: {
        title: "Phone Number",
        content: "Enable SMS 2FA for enhanced account security.",
        tips: ["Optional but recommended", "Adds +15 security points", "Used for two-factor authentication"]
      },
      dateOfBirth: {
        title: "Date of Birth",
        content: "We use this to verify your age and provide age-appropriate features.",
        tips: ["Must be 18+ for full access", "Used for age verification only", "Kept private from other users"]
      },
      gender: {
        title: "Gender Identity",
        content: "This helps us provide better matching recommendations.",
        tips: ["Used for matching preferences", "Can be updated later", "Respects all gender identities"]
      }
    }
    return helpContent[fieldName as keyof typeof helpContent] || { title: "", content: "", tips: [] }
  }

  const getProgressColor = (progress: number): string => {
    if (progress < 25) return 'from-red-500 to-orange-500'
    if (progress < 50) return 'from-orange-500 to-yellow-500'
    if (progress < 75) return 'from-yellow-500 to-blue-500'
    return 'from-blue-500 to-green-500'
  }

  const getProgressMessage = (progress: number): string => {
    if (progress < 25) return 'Just getting started! 🚀'
    if (progress < 50) return 'Making good progress! 💪'
    if (progress < 75) return 'Almost there! 🎯'
    if (progress < 100) return 'Final stretch! 🏁'
    return 'Profile complete! ✨'
  }

  const getFieldStatus = (fieldName: string) => {
    const validation = fieldValidations[fieldName]
    const isTouched = touchedFields.has(fieldName)
    
    if (!validation || !isTouched) return null
    return validation
  }

  const getInputClasses = (fieldName: string) => {
    const status = getFieldStatus(fieldName)
    const baseClasses = "w-full px-4 py-3 pl-12 rounded-xl border-2 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
    
    if (!status) {
      return `${baseClasses} border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20`
    }
    
    switch (status.type) {
      case 'error':
        return `${baseClasses} border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20`
      case 'warning':
        return `${baseClasses} border-yellow-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20`
      case 'success':
        return `${baseClasses} border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20`
      case 'info':
        return `${baseClasses} border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20`
      default:
        return `${baseClasses} border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20`
    }
  }

  const getValidationIcon = (fieldName: string) => {
    const status = getFieldStatus(fieldName)
    if (!status) return null

    // Show loading spinner for availability checking
    if ((fieldName === 'email' || fieldName === 'nickname') && availabilityChecking[fieldName]) {
      return <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
    }

    switch (status.type) {
      case 'error':
        return <X className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case 'success':
        return <Check className="h-5 w-5 text-green-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allFields = Object.keys(formData)
    setTouchedFields(new Set(allFields))
    
    // Check if form is valid
    const hasErrors = Object.values(fieldValidations).some(v => !v.isValid)
    const requiredFields = ['firstName', 'lastName', 'email', 'nickname', 'password', 'confirmPassword', 'dateOfBirth', 'gender']
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData])
    
    // Check if availability checking is still in progress
    const isCheckingAvailability = availabilityChecking.email || availabilityChecking.nickname
    
    // Check if email or nickname are not available
    const emailNotAvailable = availabilityResults.email && !availabilityResults.email.available
    const nicknameNotAvailable = availabilityResults.nickname && !availabilityResults.nickname.available
    
    if (hasErrors || missingFields.length > 0 || !formData.agreeToTerms || isCheckingAvailability || emailNotAvailable || nicknameNotAvailable) {
      // Show validation errors
      let errorMessage = 'Please fill in all required fields and fix any validation errors.'
      
      if (isCheckingAvailability) {
        errorMessage = 'Please wait while we check email and nickname availability.'
      } else if (emailNotAvailable) {
        errorMessage = 'The email address is already registered. Please use a different email.'
      } else if (nicknameNotAvailable) {
        errorMessage = 'The nickname is already taken. Please choose a different nickname.'
      } else if (missingFields.length > 0) {
        const fieldNames = missingFields.map(field => {
          switch(field) {
            case 'firstName': return 'First Name'
            case 'lastName': return 'Last Name'
            case 'email': return 'Email'
            case 'nickname': return 'Nickname'
            case 'password': return 'Password'
            case 'confirmPassword': return 'Confirm Password'
            case 'dateOfBirth': return 'Date of Birth'
            case 'gender': return 'Gender'
            default: return field
          }
        })
        errorMessage = `Please fill in the following required fields: ${fieldNames.join(', ')}`
      } else if (!formData.agreeToTerms) {
        errorMessage = 'Please agree to the Terms of Service and Privacy Policy to continue.'
      }
      
      setErrors({
        general: errorMessage
      })
      return
    }

    setIsSubmitting(true)
    setErrors({}) // Clear any previous errors
    
    try {
      // Prepare registration data
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(), // Backend expects single 'name' field
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickname: formData.nickname,
        username: formData.nickname, // Backend expects 'username' field
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone || '',
        location: formData.location || '',
        agreeToTerms: formData.agreeToTerms,
        // Additional fields the backend expects
        deviceInfo: navigator.userAgent,
        deviceId: deviceFingerprint?.deviceId || 'unknown',
        deviceFingerprint: deviceFingerprint?.hash || 'unknown',
        sessionId: getSessionId() || 'unknown',
        referralSource: 'direct',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        language: navigator.language,
        platform: navigator.platform
      }

      console.log('Submitting registration:', registrationData)
      
      // Call the registration API
      const { authService } = await import('../../../services/authService')
      const response = await authService.register(registrationData)
      
      console.log('Registration response:', response)
      
      // Check if registration was successful
      if (!response || !response.success) {
        const errorMessage = response?.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }
      
      // Validate response structure
      if (!response.user || !response.user.id) {
        throw new Error('Invalid response from registration API - missing user data')
      }
      
      // Show success state
      setRegistrationSuccess(true)
      
      // Track successful registration
      if (typeof trackEvent === 'function') {
        trackEvent('signup_success', {
          method: 'email',
          variant: 'advanced_form',
          hasPhone: !!formData.phone,
          sms2faEnabled: formData.sms2faEnabled,
          securityScore: securityScore
        })
      }
      
      // Store additional signup data for profile completion
      if (typeof window !== 'undefined') {
        localStorage.setItem('4ulove_signup_data', JSON.stringify({
          userId: response.user.id,
          email: formData.email,
          phone: formData.phone,
          nickname: formData.nickname,
          signupCompletedAt: new Date().toISOString(),
          nextStep: 'email_verification',
          variant: 'advanced'
        }))
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/email_verification_new?email=${encodeURIComponent(formData.email)}&from=signup`
        }
      }, 2000)
      
    } catch (error: any) {
      console.error('Registration failed:', error)
      console.error('Error response:', error?.response)
      console.error('Error data:', error?.response?.data)
      
      // Handle specific error types
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setErrors({
        general: errorMessage
      })
      
      // Track failed registration
      if (typeof trackEvent === 'function') {
        trackEvent('signup_error', {
          error: errorMessage,
          variant: 'advanced_form'
        })
      }
      
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 flex items-center justify-center p-4 relative">
      {/* Floating Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 max-w-2xl mx-auto"
      >
        {/* Back to Home Button */}
        <motion.button
          onClick={() => window.location.href = '/'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
          <span className="text-sm font-medium">Back to Home</span>
        </motion.button>

        {/* Secure Signup Badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl"
        >
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Secure Signup</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Main Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center py-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Advanced Signup
            </span>
          </h1>
          
          <p className="text-lg text-white/80 mb-2 max-w-lg mx-auto">
            Create your secure 4uLove account with our most advanced registration system
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Military-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-400" />
              <span>AI-Powered Assistance</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Smart Validation</span>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 w-32 h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent rounded-full"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 w-24 h-1 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent rounded-full"></div>
        </motion.div>
        {/* Progress Indicator */}
        <AnimatePresence>
          {showProgressIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <Gauge className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
                    <p className="text-sm text-white/70">{getProgressMessage(completionProgress)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${getProgressColor(completionProgress)} bg-clip-text text-transparent`}>
                    {completionProgress}%
                  </div>
                  <div className="text-xs text-white/60">Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${getProgressColor(completionProgress)} rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                  </motion.div>
                </div>
                
                {/* Progress Milestones */}
                <div className="flex justify-between mt-2 text-xs text-white/50">
                  <span className={completionProgress >= 25 ? 'text-white/80' : ''}>25%</span>
                  <span className={completionProgress >= 50 ? 'text-white/80' : ''}>50%</span>
                  <span className={completionProgress >= 75 ? 'text-white/80' : ''}>75%</span>
                  <span className={completionProgress >= 100 ? 'text-white/80' : ''}>100%</span>
                </div>
              </div>
              
              {/* Achievement Badges */}
              {completionProgress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30"
                >
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-green-400 font-medium">Profile Complete! Ready to create account</span>
                  <Star className="h-5 w-5 text-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Header */}
        <div className="text-center py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h2 className="text-xl font-bold text-white">Quick Setup Options</h2>
          </motion.div>
          <p className="text-white/60 text-sm">Choose how you'd like to create your profile</p>
        </div>

        {/* Quick Profile Import - Minimizable Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl overflow-hidden"
        >
          {/* Header with Minimize/Maximize Button */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsImportSectionMinimized(!isImportSectionMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Quick Profile Import</h3>
                <p className="text-sm text-white/70">Import from social media to speed up registration</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isImportSectionMinimized ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="h-5 w-5 text-white" />
            </motion.div>
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {!isImportSectionMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <SocialProfileImporter
                    onImportComplete={handleImportComplete}
                    onFieldUpdate={handleFieldUpdate}
                    variant="desktop"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimized State Hint */}
          {isImportSectionMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 pb-4"
            >
              <div className="flex items-center justify-center gap-2 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">f</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">ig</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-700 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">in</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-black border-2 border-white/20 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">x</span>
                  </div>
                </div>
                <span className="text-sm text-white/60">Click to expand and import from social media</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* AI Auto-Complete Assistant with Help Indicators */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-blue-300/20 rounded-xl p-6"
        >
          {/* AI Section Header */}
          <div className="text-center mb-4 relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">2</span>
              </div>
              <Brain className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">AI Form Assistant</h3>
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <button
                onClick={() => setShowAIHelp(!showAIHelp)}
                className="ml-2 p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                title="Show AI features"
              >
                <HelpCircle className="h-4 w-4 text-blue-300" />
              </button>
            </div>
            <p className="text-sm text-white/70">Get intelligent help while filling out your registration</p>
          </div>

          {/* Help Features Popup */}
          <AnimatePresence>
            {showAIHelp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex items-center justify-center gap-2 text-blue-300"
                  >
                    <Brain className="h-8 w-8" />
                    <Sparkles className="h-6 w-6" />
                  </motion.div>
                  
                  

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-green-300">
                      <Zap className="h-4 w-4" />
                      <span>Auto-complete fields</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <Brain className="h-4 w-4" />
                      <span>Smart suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <Sparkles className="h-4 w-4" />
                      <span>Profile analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-300">
                      <HelpCircle className="h-4 w-4" />
                      <span>Real-time help</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowAIHelp(false)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-4 w-4 text-white/60" />
                  </button>


                  <p className="text-xs text-white/60 mt-3">
                    Start typing in any field to activate AI assistance
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Assistant Component */}
          <AIFormAssistant
            formData={formData}
            currentField={currentField}
            onSuggestion={handleAISuggestion}
            onAutoComplete={handleAIAutoComplete}
            variant="desktop"
          />

          {/* Status Indicator */}
          {hasStartedForm && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-2 right-2 flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Brain className="h-3 w-3" />
              </motion.div>
              <span>AI Active</span>
            </motion.div>
          )}
        </motion.div>

        {/* Section Separator 2 */}
        <div className="flex items-center justify-center py-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="px-6 flex items-center gap-3 text-white/60 text-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">3</span>
            </div>
            <span className="font-medium">Manual Registration</span>
            <User className="h-4 w-4 text-pink-400" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-white/80">Join 4uLove and find your perfect match</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">First Name*</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('firstName')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                </div>
                
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('firstName')}
                    onBlur={() => handleBlur('firstName')}
                    placeholder="Enter your first name"
                    className={getInputClasses('firstName')}
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {formData.firstName && (
                      <div className="text-xs text-white/50">
                        {formData.firstName.length}/50
                      </div>
                    )}
                    {getValidationIcon('firstName')}
                  </div>
                </div>
                
                {/* Field Help Tooltip */}
                <AnimatePresence>
                  {showFieldHelp.firstName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('firstName').title}</h4>
                          <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('firstName').content}</p>
                          <ul className="space-y-1">
                            {getFieldHelpContent('firstName').tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {getFieldStatus('firstName') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 text-sm flex items-center gap-2 ${
                        getFieldStatus('firstName')?.type === 'error' ? 'text-red-400' :
                        getFieldStatus('firstName')?.type === 'warning' ? 'text-yellow-400' :
                        getFieldStatus('firstName')?.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                    >
                      {getValidationIcon('firstName')}
                      {getFieldStatus('firstName')?.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">Last Name*</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('lastName')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                </div>
                
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={() => handleBlur('lastName')}
                    placeholder="Enter your last name"
                    className={getInputClasses('lastName')}
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {formData.lastName && (
                      <div className="text-xs text-white/50">
                        {formData.lastName.length}/50
                      </div>
                    )}
                    {getValidationIcon('lastName')}
                  </div>
                </div>
                
                {/* Field Help Tooltip */}
                <AnimatePresence>
                  {showFieldHelp.lastName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('lastName').title}</h4>
                          <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('lastName').content}</p>
                          <ul className="space-y-1">
                            {getFieldHelpContent('lastName').tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {getFieldStatus('lastName') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 text-sm flex items-center gap-2 ${
                        getFieldStatus('lastName')?.type === 'error' ? 'text-red-400' :
                        getFieldStatus('lastName')?.type === 'warning' ? 'text-yellow-400' :
                        getFieldStatus('lastName')?.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                    >
                      {getValidationIcon('lastName')}
                      {getFieldStatus('lastName')?.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-white/90">Email Address*</label>
                <button
                  type="button"
                  onClick={() => toggleFieldHelp('email')}
                  className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                  title="Show help"
                >
                  <HelpCircle className="h-3 w-3 text-blue-300" />
                </button>
                <div className="text-xs text-white/50">We'll use this to send you important updates</div>
              </div>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  placeholder="your.email@example.com"
                  className={getInputClasses('email')}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon('email')}
                </div>
              </div>
              
              {/* Field Help Tooltip */}
              <AnimatePresence>
                {showFieldHelp.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('email').title}</h4>
                        <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('email').content}</p>
                        <ul className="space-y-1">
                          {getFieldHelpContent('email').tips.map((tip, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {getFieldStatus('email') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-2 text-sm flex items-center gap-2 ${
                      getFieldStatus('email')?.type === 'error' ? 'text-red-400' :
                      getFieldStatus('email')?.type === 'warning' ? 'text-yellow-400' :
                      getFieldStatus('email')?.type === 'success' ? 'text-green-400' :
                      'text-blue-400'
                    }`}
                  >
                    {getValidationIcon('email')}
                    {getFieldStatus('email')?.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nickname Field */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-white/90">Nickname*</label>
                <button
                  type="button"
                  onClick={() => toggleFieldHelp('nickname')}
                  className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                  title="Show help"
                >
                  <HelpCircle className="h-3 w-3 text-blue-300" />
                </button>
                <div className="text-xs text-white/50">This is how other users will see you</div>
              </div>
              
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('nickname')}
                  onBlur={() => handleBlur('nickname')}
                  placeholder="Choose a unique nickname (3-20 chars)"
                  className={getInputClasses('nickname')}
                  required
                  maxLength={20}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {formData.nickname && (
                    <div className={`text-xs ${
                      formData.nickname.length < 3 ? 'text-red-400' :
                      formData.nickname.length > 15 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {formData.nickname.length}/20
                    </div>
                  )}
                  {getValidationIcon('nickname')}
                </div>
              </div>
              
              {/* Field Help Tooltip */}
              <AnimatePresence>
                {showFieldHelp.nickname && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('nickname').title}</h4>
                        <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('nickname').content}</p>
                        <ul className="space-y-1">
                          {getFieldHelpContent('nickname').tips.map((tip, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {getFieldStatus('nickname') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-2 text-sm flex items-center gap-2 ${
                      getFieldStatus('nickname')?.type === 'error' ? 'text-red-400' :
                      getFieldStatus('nickname')?.type === 'warning' ? 'text-yellow-400' :
                      getFieldStatus('nickname')?.type === 'success' ? 'text-green-400' :
                      'text-blue-400'
                    }`}
                  >
                    {getValidationIcon('nickname')}
                    {getFieldStatus('nickname')?.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Fields */}
            <div className="mb-2">
              <p className="text-white/50 text-xs flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Choose a strong password to protect your account
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">Password*</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('password')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    placeholder="Create a secure password"
                    className={getInputClasses('password')}
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {formData.password && (
                      <div className="flex items-center gap-1">
                        {/* Password strength indicators */}
                        <div className="flex gap-1">
                          {[1,2,3,4].map((level) => {
                            const hasMinLength = formData.password.length >= 8
                            const hasUpperCase = /[A-Z]/.test(formData.password)
                            const hasLowerCase = /[a-z]/.test(formData.password)
                            const hasNumbers = /\d/.test(formData.password)
                            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                            const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
                            return (
                              <div
                                key={level}
                                className={`w-1 h-4 rounded-full ${
                                  strength >= level ? (
                                    strength <= 2 ? 'bg-red-400' :
                                    strength <= 3 ? 'bg-yellow-400' :
                                    strength <= 4 ? 'bg-blue-400' : 'bg-green-400'
                                  ) : 'bg-white/20'
                                }`}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Field Help Tooltip */}
                <AnimatePresence>
                  {showFieldHelp.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('password').title}</h4>
                          <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('password').content}</p>
                          <ul className="space-y-1">
                            {getFieldHelpContent('password').tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {getFieldStatus('password') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 text-sm flex items-center gap-2 ${
                        getFieldStatus('password')?.type === 'error' ? 'text-red-400' :
                        getFieldStatus('password')?.type === 'warning' ? 'text-yellow-400' :
                        getFieldStatus('password')?.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                    >
                      {getValidationIcon('password')}
                      {getFieldStatus('password')?.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">Confirm Password*</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('confirmPassword')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Confirm Password"
                  className={getInputClasses('confirmPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <AnimatePresence>
                  {getFieldStatus('confirmPassword') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 text-sm flex items-center gap-2 ${
                        getFieldStatus('confirmPassword')?.type === 'error' ? 'text-red-400' :
                        getFieldStatus('confirmPassword')?.type === 'warning' ? 'text-yellow-400' :
                        getFieldStatus('confirmPassword')?.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                    >
                      {getValidationIcon('confirmPassword')}
                      {getFieldStatus('confirmPassword')?.message}
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative mt-3">
                <div className="mb-2">
                  <p className="text-white/50 text-xs flex items-center gap-2 mb-2">
                    <Calendar className="h-3 w-3" />
                    Help us provide age-appropriate features and better matches
                  </p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">Date of Birth*</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('dateOfBirth')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('dateOfBirth')}
                  className={getInputClasses('dateOfBirth')}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon('dateOfBirth')}
                </div>
                </div>
                <AnimatePresence>
                  {getFieldStatus('dateOfBirth') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 text-sm flex items-center gap-2 ${
                        getFieldStatus('dateOfBirth')?.type === 'error' ? 'text-red-400' :
                        getFieldStatus('dateOfBirth')?.type === 'warning' ? 'text-yellow-400' :
                        getFieldStatus('dateOfBirth')?.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                    >
                      {getValidationIcon('dateOfBirth')}
                      {getFieldStatus('dateOfBirth')?.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative mt-10">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">Gender*</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('gender')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                  <div className="text-xs text-white/50">This helps us provide better matching recommendations</div>
                </div>
                
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('gender')}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 appearance-none cursor-pointer ${
                      getFieldStatus('gender')?.type === 'error' ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' :
                      getFieldStatus('gender')?.type === 'warning' ? 'border-yellow-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20' :
                      getFieldStatus('gender')?.type === 'success' ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20' :
                      'border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                    }`}
                    required
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff60' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1e1b4b', color: '#e2e8f0' }}>Select Gender</option>
                    <option value="male" style={{ backgroundColor: '#1e1b4b', color: '#e2e8f0' }}>Male</option>
                    <option value="female" style={{ backgroundColor: '#1e1b4b', color: '#e2e8f0' }}>Female</option>
                    <option value="non-binary" style={{ backgroundColor: '#1e1b4b', color: '#e2e8f0' }}>Non-binary</option>
                    <option value="prefer-not-to-say" style={{ backgroundColor: '#1e1b4b', color: '#e2e8f0' }}>Prefer not to say</option>
                  </select>
                  
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon('gender')}
                  </div>
                </div>
                
                {/* Field Help Tooltip */}
                <AnimatePresence>
                  {showFieldHelp.gender && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('gender').title}</h4>
                          <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('gender').content}</p>
                          <ul className="space-y-1">
                            {getFieldHelpContent('gender').tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Phone and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-white/90">Phone Number</label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp('phone')}
                    className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="h-3 w-3 text-blue-300" />
                  </button>
                  <div className="text-xs text-white/50">Enable SMS 2FA for enhanced security</div>
                  <div className="ml-auto flex items-center gap-1 text-xs">
                    <Shield className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 font-medium">+15 Security Points</span>
                  </div>
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+1 (555) 123-4567"
                    className={getInputClasses('phone')}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {formData.phone && formData.phone.length >= 10 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-green-400">Valid</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Field Help Tooltip */}
                <AnimatePresence>
                  {showFieldHelp.phone && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 p-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 backdrop-blur-sm border border-blue-400/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{getFieldHelpContent('phone').title}</h4>
                          <p className="text-xs text-white/70 mb-2">{getFieldHelpContent('phone').content}</p>
                          <ul className="space-y-1">
                            {getFieldHelpContent('phone').tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-white/60">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {errors.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 bg-red-500/10 border border-red-400/30 rounded-lg"
                  >
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="relative mt-14">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('location')}
                  placeholder="Location (Optional)"
                  className={getInputClasses('location')}
                />
              </div>
            </div>

            {/* SMS 2FA Section */}
            {formData.phone && formData.phone.length >= 10 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-300/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">SMS 2FA Security</h3>
                      <p className="text-sm text-white/70">Enable SMS 2FA for enhanced security (+15 security points)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">+15</div>
                    <div className="text-xs text-white/60">Security Points</div>
                  </div>
                </div>

                {!smsVerificationSent ? (
                  <button
                    type="button"
                    onClick={handleSendSMSVerification}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Send SMS Verification Code
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Check className="h-4 w-4" />
                      SMS sent to {formData.phone.slice(-4).padStart(formData.phone.length, '*')}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-green-400/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifySMSCode}
                        disabled={smsCode.length !== 6}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                      >
                        Verify
                      </button>
                    </div>
                    {errors.smsCode && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.smsCode}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Advanced Password Security */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-6"
              >
                <AdvancedPasswordSecurity
                  password={formData.password}
                  onSecurityUpdate={(security) => {
                    console.log('✅ Password security updated:', security)
                    trackEvent('password_security_updated', {
                      score: security.score,
                      strengths: security.strengths,
                      timestamp: new Date().toISOString()
                    })
                  }}
                  variant="desktop"
                />
              </motion.div>
            )}

            {/* Security Level Indicator */}
            <SecurityLevelIndicator_new
              email={formData.email}
              phone={formData.phone}
              variant="desktop"
              className="mb-6"
            />

            {/* AI Security Monitor */}
            {!captchaRequired && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-purple-300/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                      <Shield className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">AI Security Monitor</h3>
                      <p className="text-xs text-white/60">Advanced CAPTCHA will activate if suspicious behavior is detected</p>
                      <div className="text-xs text-white/40 mt-1">
                        Moves: {behaviorData.mouseMovements} | Keys: {behaviorData.keystrokes} | Time: {behaviorData.timeOnPage}s | Score: {Math.round(behaviorData.suspicionScore)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      behaviorData.suspicionScore < 10 ? 'text-green-400' :
                      behaviorData.suspicionScore < 20 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(behaviorData.suspicionScore)}
                    </div>
                    <div className="text-xs text-white/60">Risk Score</div>
                  </div>
                </div>
                
                {behaviorData.suspicionScore > 15 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Elevated security monitoring active</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* CAPTCHA Section */}
            <AnimatePresence>
              {captchaRequired && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-300/30 rounded-xl p-6"
                >
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-6 w-6 text-red-400" />
                      <h3 className="text-lg font-semibold text-white">Security Verification Required</h3>
                    </div>
                    <p className="text-sm text-white/70">Please complete the CAPTCHA to continue</p>
                  </div>
                  
                  <div className="text-center p-8 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-white/60 mb-4">
                      <Activity className="h-12 w-12 mx-auto mb-2" />
                      <p>CAPTCHA Challenge</p>
                    </div>
                    <button
                      onClick={() => handleCaptchaComplete('test-token')}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                    >
                      Complete Security Check
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                required
              />
              <span className="text-sm text-white/80">
                I agree to the{' '}
                <a href="/terms" className="text-purple-400 hover:text-purple-300 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-purple-400 hover:text-purple-300 font-medium">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Success Display */}
            {registrationSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-400/30 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-300 text-sm font-medium">Account created successfully!</p>
                    <p className="text-green-300/80 text-xs mt-1">Redirecting to email verification...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {errors.general && !registrationSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{errors.general}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !formData.agreeToTerms || (captchaRequired && !captchaToken)}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                isSubmitting || !formData.agreeToTerms || (captchaRequired && !captchaToken)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105'
              }`}
              whileHover={!isSubmitting && formData.agreeToTerms && (!captchaRequired || captchaToken) ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && formData.agreeToTerms && (!captchaRequired || captchaToken) ? { scale: 0.98 } : {}}
            >
              {registrationSuccess ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Account Created Successfully!
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  Create Secure Account
                </div>
              )}
            </motion.button>
          </form>
        </div>

        {/* Security Score Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <SecurityScoreDashboard
            formData={formData}
            deviceFingerprint={deviceFingerprint}
            behaviorData={behaviorData}
            variant="desktop"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AdvancedSignupForm_new
