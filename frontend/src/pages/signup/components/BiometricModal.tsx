'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Shield, Check, X, AlertCircle, Smartphone, Monitor, Eye, Heart, Lock } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'
import { enqueueEmbedding } from '@/lib/embeddings/queue'

interface BiometricModalProps {
  isOpen: boolean
  onClose: () => void
  onEnroll: (success: boolean, credentialId?: string) => void
  onSkip: (reason: 'no' | 'not_now' | 'maybe_later') => void
  variant: 'desktop' | 'mobile'
  userName: string
  userEmail: string
}

interface BiometricCapability {
  available: boolean
  type: 'faceID' | 'touchID' | 'windowsHello' | 'androidBiometric' | 'none'
  platform: string
  authenticatorType: 'platform' | 'cross-platform' | 'none'
}

export default function BiometricModal({
  isOpen,
  onClose,
  onEnroll,
  onSkip,
  variant,
  userName,
  userEmail
}: BiometricModalProps) {
  const [step, setStep] = useState<'intro' | 'enrolling' | 'success' | 'error'>('intro')
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
    if (isOpen) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden'
      checkBiometricCapability()
      trackEvent('biometric_modal_shown', {
        variant,
        userName,
        page: 'post_signup'
      })
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, variant, userName])

  const checkBiometricCapability = async () => {
    try {
      console.log('🔍 Checking biometric capability for post-signup modal...')
      
      if (!window.PublicKeyCredential) {
        setBiometricCapability({
          available: false,
          type: 'none',
          platform: 'Browser not supported',
          authenticatorType: 'none'
        })
        return
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      let type: BiometricCapability['type'] = 'none'
      let platform = 'Unknown'
      
      if (available) {
        const userAgent = navigator.userAgent.toLowerCase()
        
        if (userAgent.includes('mac') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
          type = userAgent.includes('iphone') || userAgent.includes('ipad') ? 'faceID' : 'touchID'
          platform = 'Apple'
        } else if (userAgent.includes('windows')) {
          type = 'windowsHello'
          platform = 'Windows'
        } else if (userAgent.includes('android')) {
          type = 'androidBiometric'
          platform = 'Android'
        }
      }

      setBiometricCapability({
        available,
        type,
        platform,
        authenticatorType: available ? 'platform' : 'none'
      })

    } catch (error) {
      console.error('❌ Error checking biometric capability:', error)
      setBiometricCapability({
        available: false,
        type: 'none',
        platform: 'Error',
        authenticatorType: 'none'
      })
    }
  }

  const handleEnrollment = async () => {
    setIsLoading(true)
    setError(null)
    setStep('enrolling')

    try {
      trackEvent('biometric_enrollment_started', {
        variant,
        biometricType: biometricCapability.type,
        platform: biometricCapability.platform
      })

      // Generate credential creation options
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: "4uLove",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userEmail),
            name: userEmail,
            displayName: userName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: "direct"
        }
      }

      const credential = await navigator.credentials.create(credentialCreationOptions) as PublicKeyCredential

      if (credential) {
        const credId = Array.from(new Uint8Array(credential.rawId))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        setCredentialId(credId)
        setStep('success')

        // Queue embedding for successful biometric enrollment
        await enqueueEmbedding({
          kind: 'profile',
          payload: {
            biometric_enrollment: true,
            biometric_type: biometricCapability.type,
            platform: biometricCapability.platform,
            enrollment_context: 'post_signup_modal',
            user_email: userEmail,
            timestamp: new Date().toISOString()
          },
          sessionId: `biometric_${Date.now()}`
        })

        trackEvent('biometric_enrollment_success', {
          variant,
          biometricType: biometricCapability.type,
          platform: biometricCapability.platform,
          credentialId: credId.slice(0, 8)
        })

        setTimeout(() => {
          onEnroll(true, credId)
          onClose()
        }, 2000)

      } else {
        throw new Error('Failed to create credential')
      }

    } catch (error: any) {
      console.error('❌ Biometric enrollment failed:', error)
      setError(error.message || 'Biometric enrollment failed')
      setStep('error')

      trackEvent('biometric_enrollment_failed', {
        variant,
        error: error.message,
        biometricType: biometricCapability.type
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = (reason: 'no' | 'not_now' | 'maybe_later') => {
    trackEvent('biometric_enrollment_skipped', {
      variant,
      reason,
      biometricType: biometricCapability.type
    })

    onSkip(reason)
    onClose()
  }

  const getBiometricIcon = () => {
    switch (biometricCapability.type) {
      case 'faceID':
        return <Eye className="h-12 w-12 text-blue-400" />
      case 'touchID':
        return <Fingerprint className="h-12 w-12 text-blue-400" />
      case 'windowsHello':
        return <Shield className="h-12 w-12 text-blue-400" />
      case 'androidBiometric':
        return <Fingerprint className="h-12 w-12 text-blue-400" />
      default:
        return <Lock className="h-12 w-12 text-blue-400" />
    }
  }

  const getBiometricName = () => {
    switch (biometricCapability.type) {
      case 'faceID':
        return 'Face ID'
      case 'touchID':
        return 'Touch ID'
      case 'windowsHello':
        return 'Windows Hello'
      case 'androidBiometric':
        return 'Biometric Authentication'
      default:
        return 'Biometric Security'
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={(e) => e.target === e.currentTarget && handleSkip('not_now')}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-md w-full ${
            variant === 'mobile' ? 'mx-4' : 'mx-auto'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              {step === 'success' ? (
                <Check className="h-8 w-8 text-white" />
              ) : step === 'error' ? (
                <X className="h-8 w-8 text-white" />
              ) : (
                getBiometricIcon()
              )}
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 'success' ? '🎉 Welcome to 4uLove!' : 
               step === 'error' ? 'Setup Failed' :
               step === 'enrolling' ? 'Setting Up...' :
               '🔒 Secure Your Account'}
            </h2>

            <p className="text-white/80 text-sm">
              {step === 'success' ? 
                `${getBiometricName()} is now active for faster, secure logins!` :
               step === 'error' ? 
                'Don\'t worry, you can set this up later in your settings.' :
               step === 'enrolling' ? 
                `Please complete the ${getBiometricName()} setup on your device...` :
                `Hi ${userName}! Want to set up ${getBiometricName()} for faster logins?`}
            </p>
          </div>

          {/* Content */}
          {step === 'intro' && (
            <div className="space-y-4">
              {biometricCapability.available ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {getBiometricIcon()}
                    <div>
                      <h3 className="text-white font-semibold">{getBiometricName()} Available</h3>
                      <p className="text-white/70 text-xs">{biometricCapability.platform} Platform</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm">
                    Skip passwords and login instantly with your {getBiometricName().toLowerCase()}!
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                    <h3 className="text-white font-semibold">Biometric Not Available</h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    Your device doesn't support biometric authentication or it's not enabled.
                  </p>
                </div>
              )}

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span>Faster login experience</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span>Enhanced account security</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <span>No more forgotten passwords</span>
                </div>
              </div>
            </div>
          )}

          {step === 'enrolling' && (
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
              />
              <p className="text-white/80 text-sm">
                Follow the prompts on your device to complete the setup...
              </p>
            </div>
          )}

          {step === 'error' && error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-green-300 text-sm">
                You're all set! Redirecting to your dashboard...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {step === 'intro' && (
            <div className="flex flex-col gap-3 mt-6">
              {biometricCapability.available && (
                <motion.button
                  onClick={handleEnrollment}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Setting Up...' : 'Set Up Now'}
                </motion.button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSkip('not_now')}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Not Now
                </button>
                <button
                  onClick={() => handleSkip('maybe_later')}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <button
                onClick={() => handleSkip('no')}
                className="text-white/60 text-sm hover:text-white/80 transition-colors"
              >
                No Thanks
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('intro')}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => handleSkip('maybe_later')}
                className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Render modal in a portal to ensure it appears above all other content
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}
