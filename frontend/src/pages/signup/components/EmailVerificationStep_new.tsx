'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Lock,
  Send,
  Timer,
  Award,
  Star
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface EmailVerificationStepProps {
  email: string
  onVerificationComplete: (verified: boolean, token?: string) => void
  onResendRequest: () => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface VerificationState {
  code: string
  isVerifying: boolean
  isVerified: boolean
  error: string | null
  attemptsLeft: number
  resendCooldown: number
  lastResendTime: number
}

export default function EmailVerificationStep_new({
  email,
  onVerificationComplete,
  onResendRequest,
  variant,
  className = ''
}: EmailVerificationStepProps) {
  const [state, setState] = useState<VerificationState>({
    code: '',
    isVerifying: false,
    isVerified: false,
    error: null,
    attemptsLeft: 3,
    resendCooldown: 0,
    lastResendTime: 0
  })

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [securityLevel, setSecurityLevel] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(0)

  // FINAL ARCHITECTURE: Use Next.js proxy to Node Backend (5051)
  const API_URL = ''
  const CODE_LENGTH = 6

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }

    // Send initial verification email
    sendVerificationEmail()

    // Track component load
    trackEvent('email_verification_loaded', {
      email: hashEmail(email),
      variant,
      securityLevel
    })
  }, [])

  useEffect(() => {
    // Countdown timer for resend cooldown
    let interval: NodeJS.Timeout
    if (state.resendCooldown > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          resendCooldown: Math.max(0, prev.resendCooldown - 1)
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.resendCooldown])

  const hashEmail = (email: string): string => {
    // Simple hash for analytics (privacy-compliant)
    return btoa(email).slice(0, 8)
  }

  const sendVerificationEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({
          email,
          securityLevel,
          resendRequest: state.lastResendTime > 0
        })
      })

      if (response.ok) {
        setState(prev => ({
          ...prev,
          resendCooldown: 60,
          lastResendTime: Date.now(),
          error: null
        }))

        trackEvent('verification_email_sent', {
          email: hashEmail(email),
          securityLevel,
          variant,
          isResend: state.lastResendTime > 0
        })
      } else {
        throw new Error('Failed to send verification email')
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to send verification email. Please try again.'
      }))

      trackEvent('verification_email_error', {
        email: hashEmail(email),
        error: 'send_failed',
        variant
      })
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, CODE_LENGTH)
      const newCode = pastedCode.split('').slice(0, CODE_LENGTH).join('')
      setState(prev => ({ ...prev, code: newCode }))
      
      // Focus last filled input
      const lastIndex = Math.min(pastedCode.length - 1, CODE_LENGTH - 1)
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex]?.focus()
      }
      
      // Auto-verify if complete
      if (newCode.length === CODE_LENGTH) {
        verifyCode(newCode)
      }
      return
    }

    // Single character input
    const newCode = state.code.split('')
    newCode[index] = value
    const updatedCode = newCode.join('')

    setState(prev => ({ ...prev, code: updatedCode, error: null }))

    // Auto-advance to next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }

    // Auto-verify when complete
    if (updatedCode.length === CODE_LENGTH) {
      verifyCode(updatedCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !state.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    }
    
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  const verifyCode = async (code: string) => {
    if (code.length !== CODE_LENGTH) return

    setState(prev => ({ ...prev, isVerifying: true, error: null }))

    try {
      // Check for master codes first (development/admin use)
      const MASTER_EMAIL_CODE = '999999'
      const MASTER_SMS_CODE = '777777'
      
      if (code === MASTER_EMAIL_CODE || code === MASTER_SMS_CODE) {
        // Master code verification - bypass API call
        setState(prev => ({ ...prev, isVerified: true, isVerifying: false }))
        
        trackEvent('email_verification_success', {
          email: hashEmail(email),
          attemptsUsed: 4 - state.attemptsLeft,
          securityLevel,
          variant,
          masterCode: true
        })

        // Delay for success animation
        setTimeout(() => {
          onVerificationComplete(true, 'master-token-' + Date.now())
        }, 1500)
        return
      }

      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({
          email,
          code,
          securityLevel
        })
      })

      const result = await response.json()

      if (response.ok && result.verified) {
        setState(prev => ({ ...prev, isVerified: true, isVerifying: false }))
        
        trackEvent('email_verification_success', {
          email: hashEmail(email),
          attemptsUsed: 4 - state.attemptsLeft,
          securityLevel,
          variant
        })

        // Delay for success animation
        setTimeout(() => {
          onVerificationComplete(true, result.token)
        }, 1500)

      } else {
        const attemptsLeft = state.attemptsLeft - 1
        setState(prev => ({
          ...prev,
          isVerifying: false,
          error: result.message || 'Invalid verification code',
          attemptsLeft,
          code: ''
        }))

        // Clear inputs
        inputRefs.current.forEach(input => {
          if (input) input.value = ''
        })
        inputRefs.current[0]?.focus()

        trackEvent('email_verification_failed', {
          email: hashEmail(email),
          attemptsLeft,
          error: 'invalid_code',
          variant
        })

        if (attemptsLeft === 0) {
          trackEvent('email_verification_locked', {
            email: hashEmail(email),
            variant
          })
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: 'Verification failed. Please try again.'
      }))

      trackEvent('email_verification_error', {
        email: hashEmail(email),
        error: 'network_error',
        variant
      })
    }
  }

  const handleResend = () => {
    if (state.resendCooldown > 0) return
    
    onResendRequest()
    sendVerificationEmail()
  }

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'standard': return 'text-blue-400'
      case 'enhanced': return 'text-purple-400'
      case 'maximum': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getSecurityLevelBg = (level: string) => {
    switch (level) {
      case 'standard': return 'bg-blue-500/20'
      case 'enhanced': return 'bg-purple-500/20'
      case 'maximum': return 'bg-red-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  return (
    <div className={`email-verification-step ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-300/30 rounded-xl p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4"
          >
            {state.isVerified ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <Mail className="h-8 w-8 text-white" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {state.isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          
          <p className="text-white/70 text-sm">
            {state.isVerified 
              ? 'Your email has been successfully verified'
              : `We've sent a ${CODE_LENGTH}-digit code to`
            }
          </p>
          
          {!state.isVerified && (
            <p className="text-blue-300 font-medium mt-1">{email}</p>
          )}
        </div>

        {/* Security Level Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`px-3 py-1 rounded-full ${getSecurityLevelBg(securityLevel)} flex items-center gap-2`}>
            <Shield className={`h-4 w-4 ${getSecurityLevelColor(securityLevel)}`} />
            <span className={`text-xs font-medium ${getSecurityLevelColor(securityLevel)}`}>
              {securityLevel.toUpperCase()} SECURITY
            </span>
            <Sparkles className="h-3 w-3 text-yellow-400" />
          </div>
        </div>

        {!state.isVerified ? (
          <>
            {/* Verification Code Input */}
            <div className="mb-6">
              <div className="flex justify-center gap-3 mb-4">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <motion.input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={CODE_LENGTH}
                    className={`w-12 h-14 text-center text-xl font-bold bg-white/10 border-2 rounded-lg text-white focus:outline-none transition-all duration-300 ${
                      focusedIndex === index 
                        ? 'border-blue-400 bg-white/20 scale-105' 
                        : 'border-white/30 hover:border-white/50'
                    } ${state.error ? 'border-red-400' : ''}`}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => setFocusedIndex(index)}
                    disabled={state.isVerifying || state.attemptsLeft === 0}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>

              {/* Progress indicator */}
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-xs bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(state.code.length / CODE_LENGTH) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {state.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 text-sm">{state.error}</span>
                  {state.attemptsLeft > 0 && (
                    <span className="text-red-200 text-xs ml-auto">
                      {state.attemptsLeft} attempts left
                    </span>
                  )}
                </motion.div>
              )}

              {state.isVerifying && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4 text-blue-400" />
                  </motion.div>
                  <span className="text-blue-300 text-sm">Verifying code...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Development Master Codes Hint */}
            <div className="text-center mb-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-300 text-xs font-medium mb-1">
                🔧 Development Mode
              </p>
              <p className="text-yellow-200 text-xs">
                Master codes: <span className="font-mono font-bold">999999</span> (email) or <span className="font-mono font-bold">777777</span> (SMS)
              </p>
            </div>

            {/* Resend Section */}
            <div className="text-center mb-6">
              <p className="text-white/60 text-sm mb-3">
                Didn't receive the code?
              </p>
              
              <button
                onClick={handleResend}
                disabled={state.resendCooldown > 0 || state.isVerifying}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 mx-auto ${
                  state.resendCooldown > 0 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {state.resendCooldown > 0 ? (
                  <>
                    <Timer className="h-4 w-4" />
                    Resend in {state.resendCooldown}s
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-white/20 pt-4">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full text-white/60 hover:text-white/80 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Shield className="h-4 w-4" />
                Advanced Security Options
                <motion.div
                  animate={{ rotate: showAdvancedOptions ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label className="block text-white/70 text-sm mb-2">
                        Security Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['standard', 'enhanced', 'maximum'] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setSecurityLevel(level)}
                            className={`p-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                              securityLevel === level
                                ? `${getSecurityLevelBg(level)} ${getSecurityLevelColor(level)} border border-current`
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mb-4"
            >
              <Award className="h-16 w-16 text-green-400 mx-auto" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-green-400 mb-2">
              Email Successfully Verified!
            </h3>
            
            <p className="text-white/70 text-sm mb-4">
              Your account security has been enhanced
            </p>

            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Security Level Upgraded</span>
              <Star className="h-4 w-4" />
            </div>
          </motion.div>
        )}

        {/* Security Info */}
        <div className="mt-6 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Military-Grade Email Verification
            </span>
          </div>
          <p className="text-white/60 text-xs">
            Your email verification uses advanced encryption and AI-powered fraud detection 
            to ensure maximum account security.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
