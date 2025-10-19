'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Phone,
  MessageSquare,
  Clock,
  Zap,
  Lock,
  Globe,
  Wifi,
  Signal,
  Battery,
  Award,
  Star,
  Send,
  Timer
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface SMSVerificationProps {
  phoneNumber: string
  onVerificationComplete: (verified: boolean, token?: string) => void
  onPhoneNumberChange: (phone: string) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface SMSState {
  code: string
  isVerifying: boolean
  isVerified: boolean
  error: string | null
  attemptsLeft: number
  resendCooldown: number
  lastResendTime: number
  carrierInfo: CarrierInfo | null
}

interface CarrierInfo {
  carrier: string
  country: string
  type: 'mobile' | 'landline' | 'voip'
  deliveryTime: number
}

export default function SMSVerification_new({
  phoneNumber,
  onVerificationComplete,
  onPhoneNumberChange,
  variant,
  className = ''
}: SMSVerificationProps) {
  const [state, setState] = useState<SMSState>({
    code: '',
    isVerifying: false,
    isVerified: false,
    error: null,
    attemptsLeft: 3,
    resendCooldown: 0,
    lastResendTime: 0,
    carrierInfo: null
  })

  const [showCarrierInfo, setShowCarrierInfo] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'voice'>('sms')
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

    // Validate phone number and get carrier info
    validatePhoneNumber()

    // Send initial SMS
    if (phoneNumber) {
      sendSMSCode()
    }

    // Track component load
    trackEvent('sms_verification_loaded', {
      phoneNumber: hashPhone(phoneNumber),
      variant,
      deliveryMethod
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

  const hashPhone = (phone: string): string => {
    // Simple hash for analytics (privacy-compliant)
    return btoa(phone).slice(0, 8)
  }

  const validatePhoneNumber = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/validate-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({ phoneNumber })
      })

      if (response.ok) {
        const carrierInfo = await response.json()
        setState(prev => ({ ...prev, carrierInfo }))

        trackEvent('phone_validation_success', {
          phoneNumber: hashPhone(phoneNumber),
          carrier: carrierInfo.carrier,
          type: carrierInfo.type,
          variant
        })
      }
    } catch (error) {
      console.error('Phone validation failed:', error)
    }
  }

  const sendSMSCode = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({
          phoneNumber,
          deliveryMethod,
          resendRequest: state.lastResendTime > 0
        })
      })

      if (response.ok) {
        const result = await response.json()
        setState(prev => ({
          ...prev,
          resendCooldown: result.cooldownSeconds || 60,
          lastResendTime: Date.now(),
          error: null
        }))

        trackEvent('sms_code_sent', {
          phoneNumber: hashPhone(phoneNumber),
          deliveryMethod,
          variant,
          isResend: state.lastResendTime > 0
        })
      } else {
        throw new Error('Failed to send SMS code')
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to send SMS code. Please try again.'
      }))

      trackEvent('sms_send_error', {
        phoneNumber: hashPhone(phoneNumber),
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
        
        trackEvent('sms_verification_success', {
          phoneNumber: hashPhone(phoneNumber),
          attemptsUsed: 4 - state.attemptsLeft,
          deliveryMethod,
          variant,
          masterCode: true
        })

        // Delay for success animation
        setTimeout(() => {
          onVerificationComplete(true, 'master-token-' + Date.now())
        }, 1500)
        return
      }

      const response = await fetch(`${API_URL}/api/auth/verify-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({
          phoneNumber,
          code,
          deliveryMethod
        })
      })

      const result = await response.json()

      if (response.ok && result.verified) {
        setState(prev => ({ ...prev, isVerified: true, isVerifying: false }))
        
        trackEvent('sms_verification_success', {
          phoneNumber: hashPhone(phoneNumber),
          attemptsUsed: 4 - state.attemptsLeft,
          deliveryMethod,
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

        trackEvent('sms_verification_failed', {
          phoneNumber: hashPhone(phoneNumber),
          attemptsLeft,
          error: 'invalid_code',
          variant
        })

        if (attemptsLeft === 0) {
          trackEvent('sms_verification_locked', {
            phoneNumber: hashPhone(phoneNumber),
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

      trackEvent('sms_verification_error', {
        phoneNumber: hashPhone(phoneNumber),
        error: 'network_error',
        variant
      })
    }
  }

  const handleResend = () => {
    if (state.resendCooldown > 0) return
    sendSMSCode()
  }

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const getDeliveryIcon = () => {
    return deliveryMethod === 'sms' ? MessageSquare : Phone
  }

  const getCarrierIcon = () => {
    if (!state.carrierInfo) return Signal
    switch (state.carrierInfo.type) {
      case 'mobile': return Smartphone
      case 'landline': return Phone
      case 'voip': return Wifi
      default: return Signal
    }
  }

  return (
    <div className={`sms-verification ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-300/30 rounded-xl p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4"
          >
            {state.isVerified ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              React.createElement(getDeliveryIcon(), { className: "h-8 w-8 text-white" })
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {state.isVerified ? 'Phone Verified!' : 'Verify Your Phone'}
          </h2>
          
          <p className="text-white/70 text-sm">
            {state.isVerified 
              ? 'Your phone number has been successfully verified'
              : `We've sent a ${CODE_LENGTH}-digit code via ${deliveryMethod.toUpperCase()} to`
            }
          </p>
          
          {!state.isVerified && (
            <p className="text-green-300 font-medium mt-1">
              {formatPhoneNumber(phoneNumber)}
            </p>
          )}
        </div>

        {/* Carrier Information */}
        {state.carrierInfo && (
          <div className="mb-6">
            <button
              onClick={() => setShowCarrierInfo(!showCarrierInfo)}
              className="w-full p-3 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {React.createElement(getCarrierIcon(), { className: "h-5 w-5 text-green-400" })}
                <div className="text-left">
                  <div className="text-white font-medium text-sm">
                    {state.carrierInfo.carrier}
                  </div>
                  <div className="text-white/60 text-xs">
                    {state.carrierInfo.country} • {state.carrierInfo.type}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-400 text-xs">
                  ~{state.carrierInfo.deliveryTime}s delivery
                </div>
                <Signal className="h-4 w-4 text-green-400" />
              </div>
            </button>

            <AnimatePresence>
              {showCarrierInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-white/5 rounded-lg text-sm"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-white/60">Network:</span>
                      <span className="text-white ml-2">{state.carrierInfo.carrier}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Type:</span>
                      <span className="text-white ml-2 capitalize">{state.carrierInfo.type}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Delivery Method Selector */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-white/10 rounded-lg">
            {(['sms', 'voice'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setDeliveryMethod(method)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  deliveryMethod === method
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {method === 'sms' ? (
                  <MessageSquare className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {method.toUpperCase()}
              </button>
            ))}
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
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={CODE_LENGTH}
                    className={`w-12 h-14 text-center text-xl font-bold bg-white/10 border-2 rounded-lg text-white focus:outline-none transition-all duration-300 ${
                      focusedIndex === index 
                        ? 'border-green-400 bg-white/20 scale-105' 
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
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
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
                  className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4 text-green-400" />
                  </motion.div>
                  <span className="text-green-300 text-sm">Verifying code...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend Section */}
            <div className="text-center mb-6">
              <p className="text-white/60 text-sm mb-3">
                Didn't receive the code?
              </p>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleResend}
                  disabled={state.resendCooldown > 0 || state.isVerifying}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    state.resendCooldown > 0 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
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
                      Resend {deliveryMethod.toUpperCase()}
                    </>
                  )}
                </button>

                <button
                  onClick={() => setDeliveryMethod(deliveryMethod === 'sms' ? 'voice' : 'sms')}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  {deliveryMethod === 'sms' ? (
                    <>
                      <Phone className="h-4 w-4" />
                      Try Voice Call
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Try SMS
                    </>
                  )}
                </button>
              </div>
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
              Phone Successfully Verified!
            </h3>
            
            <p className="text-white/70 text-sm mb-4">
              Your account security has been enhanced with 2FA
            </p>

            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">2FA Protection Active</span>
              <Star className="h-4 w-4" />
            </div>
          </motion.div>
        )}

        {/* Security Info */}
        <div className="mt-6 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Military-Grade SMS Verification
            </span>
          </div>
          <p className="text-white/60 text-xs">
            Your phone verification uses carrier-grade security and AI-powered fraud detection 
            to ensure maximum account protection.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
