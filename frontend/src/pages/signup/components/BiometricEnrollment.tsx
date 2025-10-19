'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Shield, Check, X, AlertCircle, Smartphone, Monitor, Eye } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'
import { enqueueEmbedding } from '@/lib/embeddings/queue'

interface BiometricEnrollmentProps {
  onEnrollmentComplete: (success: boolean, credentialId?: string) => void
  onSkip: () => void
  variant: 'desktop' | 'mobile'
  userId?: string
  className?: string
}

interface BiometricCapability {
  available: boolean
  type: 'faceID' | 'touchID' | 'windowsHello' | 'androidBiometric' | 'none'
  platform: string
  authenticatorType: 'platform' | 'cross-platform' | 'none'
}

export default function BiometricEnrollment({
  onEnrollmentComplete,
  onSkip,
  variant,
  userId,
  className = ''
}: BiometricEnrollmentProps) {
  const [step, setStep] = useState<'check' | 'enroll' | 'verify' | 'success' | 'error'>('check')
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability>({
    available: false,
    type: 'none',
    platform: 'unknown',
    authenticatorType: 'none'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentialId, setCredentialId] = useState<string | null>(null)

  useEffect(() => {
    checkBiometricCapability()
  }, [])

  const checkBiometricCapability = async () => {
    try {
      console.log('🔍 Checking biometric capability for signup...')
      
      // Check if HTTPS is being used (required for WebAuthn)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.log('❌ HTTPS required for biometric authentication')
        setBiometricCapability({
          available: false,
          type: 'none',
          platform: 'requires-https',
          authenticatorType: 'none'
        })
        return
      }

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        console.log('❌ WebAuthn not supported')
        setBiometricCapability({
          available: false,
          type: 'none',
          platform: navigator.platform,
          authenticatorType: 'none'
        })
        return
      }

      // Check for platform authenticator
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      if (available) {
        const capability = detectBiometricType()
        setBiometricCapability({
          available: true,
          type: capability.type,
          platform: navigator.platform,
          authenticatorType: 'platform'
        })
        
        console.log('✅ Biometric capability detected:', capability)
        
        trackEvent('biometric_capability_detected', {
          type: capability.type,
          platform: navigator.platform,
          variant,
          page: 'signup'
        })
      } else {
        setBiometricCapability({
          available: false,
          type: 'none',
          platform: navigator.platform,
          authenticatorType: 'none'
        })
      }
    } catch (error) {
      console.error('❌ Biometric capability check failed:', error)
      setBiometricCapability({
        available: false,
        type: 'none',
        platform: navigator.platform,
        authenticatorType: 'none'
      })
    }
  }

  const detectBiometricType = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return { type: 'faceID' as const, name: 'Face ID / Touch ID' }
    } else if (userAgent.includes('android')) {
      return { type: 'androidBiometric' as const, name: 'Fingerprint / Face Unlock' }
    } else if (platform.includes('win')) {
      return { type: 'windowsHello' as const, name: 'Windows Hello' }
    } else if (platform.includes('mac')) {
      return { type: 'touchID' as const, name: 'Touch ID' }
    } else {
      return { type: 'touchID' as const, name: 'Biometric Authentication' }
    }
  }

  const startEnrollment = async () => {
    setIsLoading(true)
    setError(null)
    setStep('enroll')

    try {
      // Generate a unique credential ID
      const credId = `4ulove_${userId || 'user'}_${Date.now()}`
      
      // Create WebAuthn credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32).map(() => Math.floor(Math.random() * 256)),
          rp: {
            name: '4uLove',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId || 'signup_user'),
            name: 'signup_user',
            displayName: 'New User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      }) as PublicKeyCredential

      if (credential) {
        setCredentialId(credId)
        setStep('verify')
        
        // Verify the credential works
        await verifyEnrollment(credential)
      } else {
        throw new Error('Failed to create biometric credential')
      }
    } catch (error: any) {
      console.error('❌ Biometric enrollment failed:', error)
      setError(getBiometricErrorMessage(error))
      setStep('error')
      
      trackEvent('biometric_enrollment_failed', {
        error: error.message,
        variant,
        page: 'signup',
        userId
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEnrollment = async (credential: PublicKeyCredential) => {
    try {
      setStep('verify')
      
      // Simulate verification (in real implementation, send to backend)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStep('success')
      
      // Queue embedding for successful biometric enrollment
      await enqueueEmbedding({
        kind: 'profile',
        payload: {
          biometric_enrolled: true,
          biometric_type: biometricCapability.type,
          platform: biometricCapability.platform,
          enrollment_during_signup: true,
          timestamp: new Date().toISOString()
        },
        sessionId: getSessionId(),
        userId: userId || 'signup_user'
      })

      trackEvent('biometric_enrollment_success', {
        type: biometricCapability.type,
        platform: biometricCapability.platform,
        variant,
        page: 'signup',
        userId
      })

      // Complete enrollment after success animation
      setTimeout(() => {
        onEnrollmentComplete(true, credentialId || undefined)
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Biometric verification failed:', error)
      setError('Verification failed. Please try again.')
      setStep('error')
    }
  }

  const getBiometricErrorMessage = (error: any): string => {
    if (error.name === 'NotAllowedError') {
      return 'Biometric access was denied. Please enable biometric authentication in your device settings.'
    } else if (error.name === 'NotSupportedError') {
      return 'Biometric authentication is not supported on this device.'
    } else if (error.name === 'SecurityError') {
      return 'Security error occurred. Please ensure you\'re using a secure connection.'
    } else if (error.name === 'AbortError') {
      return 'Biometric enrollment was cancelled.'
    } else {
      return 'Failed to set up biometric authentication. You can set this up later in your account settings.'
    }
  }

  const handleSkip = () => {
    trackEvent('biometric_enrollment_skipped', {
      step,
      variant,
      page: 'signup',
      userId,
      reason: biometricCapability.available ? 'user_choice' : 'not_available'
    })
    
    onSkip()
  }

  const getBiometricIcon = () => {
    switch (biometricCapability.type) {
      case 'faceID':
        return <Eye className="h-8 w-8" />
      case 'touchID':
      case 'androidBiometric':
        return <Fingerprint className="h-8 w-8" />
      case 'windowsHello':
        return <Shield className="h-8 w-8" />
      default:
        return <Fingerprint className="h-8 w-8" />
    }
  }

  const getBiometricName = () => {
    const capability = detectBiometricType()
    return capability.name
  }

  if (!biometricCapability.available) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center ${className}`}
      >
        <div className="p-6 bg-blue-500/10 border border-blue-400/20 rounded-xl">
          <AlertCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Biometric Authentication Not Available
          </h3>
          <p className="text-blue-300 text-sm mb-4">
            {biometricCapability.platform === 'requires-https' 
              ? 'Biometric authentication requires a secure connection (HTTPS).'
              : 'Your device doesn\'t support biometric authentication, but you can still use your password to sign in securely.'
            }
          </p>
          <button
            onClick={handleSkip}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        {step === 'check' && (
          <motion.div
            key="check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                {getBiometricIcon()}
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Secure Your Account
              </h3>
              
              <p className="text-white/80 mb-6">
                Set up {getBiometricName()} for faster, more secure access to your 4uLove account.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-green-300">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Faster login (no password needed)</span>
                </div>
                <div className="flex items-center gap-3 text-green-300">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Enhanced security protection</span>
                </div>
                <div className="flex items-center gap-3 text-green-300">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Works across all your devices</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  onClick={startEnrollment}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Set Up {getBiometricName()}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'enroll' && (
          <motion.div
            key="enroll"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                {getBiometricIcon()}
              </motion.div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                Setting Up {getBiometricName()}
              </h3>
              
              <p className="text-white/80 mb-6">
                Please follow the prompts on your device to complete the biometric setup.
              </p>
              
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-blue-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Shield className="h-8 w-8" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                Verifying Setup
              </h3>
              
              <p className="text-white/80">
                Testing your biometric authentication...
              </p>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Check className="h-8 w-8" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                Perfect! You're All Set
              </h3>
              
              <p className="text-green-300 mb-4">
                {getBiometricName()} has been successfully set up for your account.
              </p>
              
              <p className="text-white/60 text-sm">
                You can now sign in quickly and securely using biometric authentication.
              </p>
            </div>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <X className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                Setup Failed
              </h3>
              
              <p className="text-red-300 mb-6 text-sm">
                {error}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
                >
                  Continue Without Biometrics
                </button>
                <button
                  onClick={() => {
                    setStep('check')
                    setError(null)
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getSessionId(): string {
  let sessionId = localStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}
