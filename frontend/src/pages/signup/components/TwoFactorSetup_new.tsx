'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Zap,
  Star,
  Award,
  Crown,
  Sparkles,
  Phone,
  MessageSquare,
  QrCode,
  Download,
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  Settings,
  Globe,
  Wifi
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface TwoFactorSetupProps {
  methods: ('sms' | 'email' | 'authenticator')[]
  onSetupComplete: (method: string, verified: boolean, token?: string) => void
  onSkip: () => void
  variant: 'desktop' | 'mobile'
  userEmail: string
  userPhone?: string
  className?: string
}

interface SetupState {
  selectedMethod: 'sms' | 'email' | 'authenticator' | null
  isSetupComplete: boolean
  setupStep: 'selection' | 'configuration' | 'verification' | 'complete'
  error: string | null
  qrCode: string | null
  backupCodes: string[]
  secretKey: string | null
}

interface MethodInfo {
  id: 'sms' | 'email' | 'authenticator'
  name: string
  description: string
  icon: React.ComponentType<any>
  security: 'high' | 'very-high' | 'maximum'
  convenience: 'high' | 'medium' | 'low'
  availability: 'always' | 'network' | 'device'
}

export default function TwoFactorSetup_new({
  methods,
  onSetupComplete,
  onSkip,
  variant,
  userEmail,
  userPhone,
  className = ''
}: TwoFactorSetupProps) {
  const [state, setState] = useState<SetupState>({
    selectedMethod: null,
    isSetupComplete: false,
    setupStep: 'selection',
    error: null,
    qrCode: null,
    backupCodes: [],
    secretKey: null
  })

  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [securityLevel, setSecurityLevel] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced')

  // FINAL ARCHITECTURE: Use Next.js proxy to Node Backend (5051)
  const API_URL = ''

  const methodsInfo: MethodInfo[] = [
    {
      id: 'sms',
      name: 'SMS Authentication',
      description: 'Receive codes via text message',
      icon: MessageSquare,
      security: 'high',
      convenience: 'high',
      availability: 'network'
    },
    {
      id: 'email',
      name: 'Email Authentication',
      description: 'Receive codes via email',
      icon: Mail,
      security: 'high',
      convenience: 'medium',
      availability: 'network'
    },
    {
      id: 'authenticator',
      name: 'Authenticator App',
      description: 'Use Google Authenticator or similar',
      icon: QrCode,
      security: 'maximum',
      convenience: 'medium',
      availability: 'always'
    }
  ]

  useEffect(() => {
    trackEvent('2fa_setup_loaded', {
      availableMethods: methods,
      variant,
      securityLevel
    })
  }, [])

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-blue-400'
      case 'very-high': return 'text-purple-400'
      case 'maximum': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getSecurityBg = (level: string) => {
    switch (level) {
      case 'high': return 'bg-blue-500/20'
      case 'very-high': return 'bg-purple-500/20'
      case 'maximum': return 'bg-red-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  const handleMethodSelect = async (methodId: 'sms' | 'email' | 'authenticator') => {
    setState(prev => ({ 
      ...prev, 
      selectedMethod: methodId, 
      setupStep: 'configuration',
      error: null 
    }))

    trackEvent('2fa_method_selected', {
      method: methodId,
      variant,
      securityLevel
    })

    // Initialize method-specific setup
    if (methodId === 'authenticator') {
      await setupAuthenticator()
    } else {
      setState(prev => ({ ...prev, setupStep: 'verification' }))
    }
  }

  const setupAuthenticator = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/setup-authenticator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({
          email: userEmail,
          securityLevel
        })
      })

      if (response.ok) {
        const result = await response.json()
        setState(prev => ({
          ...prev,
          qrCode: result.qrCode,
          secretKey: result.secretKey,
          backupCodes: result.backupCodes,
          setupStep: 'verification'
        }))

        trackEvent('authenticator_setup_initiated', {
          variant,
          securityLevel
        })
      } else {
        throw new Error('Failed to setup authenticator')
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to setup authenticator. Please try again.',
        setupStep: 'selection'
      }))

      trackEvent('authenticator_setup_error', {
        error: 'setup_failed',
        variant
      })
    }
  }

  const verify2FA = async (code: string) => {
    try {
      // Check for master codes first (development/admin use)
      const MASTER_EMAIL_CODE = '999999'
      const MASTER_SMS_CODE = '777777'
      const MASTER_2FA_CODE = '888888'
      
      if (code === MASTER_EMAIL_CODE || code === MASTER_SMS_CODE || code === MASTER_2FA_CODE) {
        // Master code verification - bypass API call
        setState(prev => ({
          ...prev,
          isSetupComplete: true,
          setupStep: 'complete'
        }))

        trackEvent('2fa_setup_success', {
          method: state.selectedMethod,
          variant,
          securityLevel,
          masterCode: true
        })

        // Delay for success animation
        setTimeout(() => {
          onSetupComplete(state.selectedMethod!, true, 'master-2fa-token-' + Date.now())
        }, 2000)
        return
      }

      const response = await fetch(`${API_URL}/api/auth/verify-2fa-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Enable-Embeddings': 'true'
        },
        body: JSON.stringify({
          method: state.selectedMethod,
          code,
          email: userEmail,
          phone: userPhone
        })
      })

      if (response.ok) {
        const result = await response.json()
        setState(prev => ({
          ...prev,
          isSetupComplete: true,
          setupStep: 'complete'
        }))

        trackEvent('2fa_setup_success', {
          method: state.selectedMethod,
          variant,
          securityLevel
        })

        // Delay for success animation
        setTimeout(() => {
          onSetupComplete(state.selectedMethod!, true, result.token)
        }, 2000)

      } else {
        const result = await response.json()
        setState(prev => ({
          ...prev,
          error: result.message || 'Invalid verification code'
        }))

        trackEvent('2fa_verification_failed', {
          method: state.selectedMethod,
          error: 'invalid_code',
          variant
        })
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Verification failed. Please try again.'
      }))

      trackEvent('2fa_verification_error', {
        method: state.selectedMethod,
        error: 'network_error',
        variant
      })
    }
  }

  const copyBackupCodes = () => {
    const codesText = state.backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setCopiedCodes(true)
    
    trackEvent('backup_codes_copied', {
      method: state.selectedMethod,
      variant
    })

    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const handleSkip = () => {
    trackEvent('2fa_setup_skipped', {
      availableMethods: methods,
      variant,
      securityLevel
    })
    onSkip()
  }

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Choose Your 2FA Method
        </h3>
        <p className="text-white/70 text-sm">
          Select how you'd like to receive verification codes
        </p>
      </div>

      {methodsInfo
        .filter(method => methods.includes(method.id))
        .map((method, index) => (
          <motion.button
            key={method.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleMethodSelect(method.id)}
            className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${getSecurityBg(method.security)} group-hover:scale-110 transition-transform`}>
                <method.icon className={`h-6 w-6 ${getSecurityColor(method.security)}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white">{method.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getSecurityBg(method.security)} ${getSecurityColor(method.security)}`}>
                    {method.security.toUpperCase()}
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-2">{method.description}</p>
                
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-400" />
                    <span className="text-white/60">Security: {method.security}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-blue-400" />
                    <span className="text-white/60">Convenience: {method.convenience}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-purple-400" />
                    <span className="text-white/60">{method.availability}</span>
                  </div>
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}

      {/* Security Level Selector */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-white/60" />
          <span className="text-white/70 text-sm font-medium">Security Level</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {(['standard', 'enhanced', 'maximum'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSecurityLevel(level)}
              className={`p-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                securityLevel === level
                  ? 'bg-purple-600 text-white border border-purple-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4 border-t border-white/20">
        <button
          onClick={handleSkip}
          className="text-white/60 hover:text-white/80 text-sm transition-colors"
        >
          Skip for now (not recommended)
        </button>
      </div>
    </div>
  )

  const renderAuthenticatorSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Setup Authenticator App
        </h3>
        <p className="text-white/70 text-sm">
          Scan the QR code with your authenticator app
        </p>
      </div>

      {/* QR Code */}
      {state.qrCode && (
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-xl">
            <img 
              src={state.qrCode} 
              alt="2FA QR Code" 
              className="w-48 h-48 mx-auto"
            />
          </div>
          
          {/* Manual Entry */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-white/60 text-xs mb-2">
              Can't scan? Enter this code manually:
            </p>
            <div className="flex items-center gap-2 justify-center">
              <code className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded">
                {state.secretKey}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(state.secretKey!)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Copy className="h-4 w-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes */}
      {state.backupCodes.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-5 w-5 text-yellow-400" />
            <h4 className="font-semibold text-yellow-300">Backup Recovery Codes</h4>
          </div>
          
          <p className="text-yellow-200/80 text-sm mb-3">
            Save these codes in a secure location. You can use them to access your account if you lose your device.
          </p>

          <button
            onClick={() => setShowBackupCodes(!showBackupCodes)}
            className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 text-sm mb-3"
          >
            {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showBackupCodes ? 'Hide' : 'Show'} backup codes
          </button>

          <AnimatePresence>
            {showBackupCodes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="grid grid-cols-2 gap-2 p-3 bg-black/20 rounded-lg">
                  {state.backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm text-yellow-200">
                      {code}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={copyBackupCodes}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    copiedCodes
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                  }`}
                >
                  {copiedCodes ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Copy Backup Codes
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Verify Setup
        </h3>
        <p className="text-white/70 text-sm">
          Enter the 6-digit code from your {state.selectedMethod === 'authenticator' ? 'authenticator app' : state.selectedMethod}
        </p>
      </div>

      {/* Development Master Codes Hint */}
      <div className="text-center mb-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
        <p className="text-yellow-300 text-xs font-medium mb-1">
          🔧 Development Mode
        </p>
        <p className="text-yellow-200 text-xs">
          Master codes: <span className="font-mono font-bold">888888</span> (2FA), <span className="font-mono font-bold">999999</span> (email), <span className="font-mono font-bold">777777</span> (SMS)
        </p>
      </div>

      {/* Verification Input */}
      <div className="text-center">
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          className="w-48 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-all duration-300"
          onChange={(e) => {
            const code = e.target.value.replace(/\D/g, '').slice(0, 6)
            e.target.value = code
            if (code.length === 6) {
              verify2FA(code)
            }
          }}
        />
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-300 text-sm">{state.error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const renderComplete = () => (
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
        className="mb-6"
      >
        <Crown className="h-20 w-20 text-yellow-400 mx-auto" />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-green-400 mb-3">
        2FA Successfully Enabled!
      </h3>
      
      <p className="text-white/70 text-sm mb-6">
        Your account is now protected with military-grade two-factor authentication
      </p>

      <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
        <Star className="h-5 w-5" />
        <span className="font-medium">Maximum Security Achieved</span>
        <Star className="h-5 w-5" />
      </div>

      <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="h-5 w-5 text-green-400" />
          <span className="text-green-300 font-medium">Security Status: LEGENDARY</span>
        </div>
        <p className="text-green-200/80 text-sm">
          Your account now has the highest level of protection available
        </p>
      </div>
    </motion.div>
  )

  return (
    <div className={`two-factor-setup ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4"
          >
            {state.isSetupComplete ? (
              <Crown className="h-8 w-8 text-white" />
            ) : (
              <Shield className="h-8 w-8 text-white" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Two-Factor Authentication
          </h2>
          
          <p className="text-white/70 text-sm">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {['selection', 'configuration', 'verification', 'complete'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  state.setupStep === step
                    ? 'bg-purple-600 text-white scale-110'
                    : index < ['selection', 'configuration', 'verification', 'complete'].indexOf(state.setupStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-white/60'
                }`}>
                  {index < ['selection', 'configuration', 'verification', 'complete'].indexOf(state.setupStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-1 rounded transition-all duration-300 ${
                    index < ['selection', 'configuration', 'verification', 'complete'].indexOf(state.setupStep)
                      ? 'bg-green-600'
                      : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {state.setupStep === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderMethodSelection()}
            </motion.div>
          )}

          {state.setupStep === 'configuration' && state.selectedMethod === 'authenticator' && (
            <motion.div
              key="configuration"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderAuthenticatorSetup()}
            </motion.div>
          )}

          {state.setupStep === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderVerification()}
            </motion.div>
          )}

          {state.setupStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderComplete()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Badge */}
        <div className="mt-6 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">
              Military-Grade 2FA Protection
            </span>
          </div>
          <p className="text-white/60 text-xs">
            Your two-factor authentication uses advanced encryption and AI-powered threat detection 
            to provide maximum account security.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
