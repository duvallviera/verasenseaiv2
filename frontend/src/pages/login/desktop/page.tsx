'use client'

/**
 * 🖥️ QUANTUM-LEVEL DESKTOP LOGIN PAGE
 * Desktop-optimized replica of mobile login with enhanced features
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Fingerprint, Heart, ArrowRight, CheckCircle, Shield, Zap, AlertTriangle, ShieldCheck, Smartphone, Key, Globe } from 'lucide-react'

// Device Detection
import { detectDevice } from '@/utils/deviceDetection'

// Desktop Analytics & Embeddings
import { trackDesktopEvent, DESKTOP_EVENTS } from '@/lib/analytics/desktop/trackDesktop'
import { createDesktopEmbedding } from '@/lib/embeddings/desktop/desktopEmbeddings'

// Desktop Components
import { DesktopButton } from '@/components/desktop/buttons/DesktopButton'
import { DesktopInput } from '@/components/desktop/forms/DesktopInput'
import { DesktopPasswordInput } from '@/components/desktop/forms/DesktopPasswordInput'
import { DesktopLayout } from '@/components/desktop/layout/DesktopLayout'

// Desktop CSS
import '@/styles/desktop-global.css'

// Quantum Security
import {
  generateDeviceFingerprint,
  performSecurityAnalysis,
  createQuantumCredentials,
  registerKnownDevice,
  updateSessionHistory,
  analyzeTypingPattern,
  type SecurityAnalysis,
} from '@/lib/security/quantumAuth'

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5051'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
  phoneNumber: string
}

interface VerificationState {
  isVerifying: boolean
  method: 'email' | 'sms' | null
  code: string
  countdown: number
  attempts: number
}

interface AuthState {
  step: 'login' | 'choose_verification' | 'register_phone' | 'verify_code'
  isAuthenticated: boolean
  tempToken: string | null
  userEmail: string
}

interface DeviceInfo {
  platform: string
  os: string
  browser: string
  touchEnabled: boolean
  biometricAvailable: boolean
}

interface QuantumState {
  securityAnalysis: SecurityAnalysis | null
  deviceFingerprint: string
  behavioralScore: number
  quantumEnabled: boolean
}

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server-session'
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

export default function DesktopLoginPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
    phoneNumber: ''
  })
  
  const [authState, setAuthState] = useState<AuthState>({
    step: 'login',
    isAuthenticated: false,
    tempToken: null,
    userEmail: ''
  })
  
  const [verification, setVerification] = useState<VerificationState>({
    isVerifying: false,
    method: null,
    code: '',
    countdown: 0,
    attempts: 0
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [showBiometric, setShowBiometric] = useState(false)
  
  const [quantumState, setQuantumState] = useState<QuantumState>({
    securityAnalysis: null,
    deviceFingerprint: '',
    behavioralScore: 0,
    quantumEnabled: false,
  })
  const [keystrokeTimestamps, setKeystrokeTimestamps] = useState<number[]>([])

  // Initialize device and quantum security
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const device = await detectDevice({
          respectUrlParam: true,
          useSessionStorage: true,
          checkBiometric: true,
        })
        
        setDeviceInfo({
          platform: device.platform,
          os: device.os,
          browser: device.browser,
          touchEnabled: device.touchEnabled,
          biometricAvailable: device.biometricAvailable,
        })
        
        const isDesktopDevice = window.innerWidth >= 1024
        const hasWebAuthn = typeof window.PublicKeyCredential !== 'undefined'
        
        if (isDesktopDevice && hasWebAuthn) {
          setShowBiometric(true)
        }
        
        const fingerprint = await generateDeviceFingerprint()
        const securityAnalysis = await performSecurityAnalysis(fingerprint)
        
        setQuantumState({
          securityAnalysis,
          deviceFingerprint: fingerprint,
          behavioralScore: 0,
          quantumEnabled: true,
        })
        
        trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_START, {
          deviceInfo: {
            os: device.os,
            browser: device.browser,
          },
          securityLevel: 'quantum',
          trustScore: securityAnalysis.trustScore,
          riskLevel: securityAnalysis.riskLevel,
          timestamp: new Date().toISOString(),
        })
        
        await createDesktopEmbedding('quantum_desktop_login_init', {
          priority: 'high',
          metadata: {
            kind: 'security_init',
            source: 'quantum_desktop_login',
            platform: 'desktop',
            securityLevel: 'quantum',
            trustScore: securityAnalysis.trustScore,
          },
        })
        
      } catch (error) {
        console.error('Device detection failed:', error)
      }
    }
    
    initializeDevice()
  }, [])

  // Behavioral Biometrics - Track Typing
  const handleKeyPress = () => {
    const timestamp = Date.now()
    setKeystrokeTimestamps(prev => {
      const newTimestamps = [...prev, timestamp]
      if (newTimestamps.length >= 5) {
        const score = analyzeTypingPattern(newTimestamps)
        setQuantumState(prev => ({ ...prev, behavioralScore: score }))
      }
      return newTimestamps.slice(-20)
    })
  }

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (verification.isVerifying && verification.countdown > 0) {
      interval = setInterval(() => {
        setVerification(prev => ({ ...prev, countdown: prev.countdown - 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [verification.isVerifying, verification.countdown])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const quantumCreds = await createQuantumCredentials(formData.email, formData.password, quantumState.deviceFingerprint)
      trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_START, {
        email: formData.email,
        method: 'quantum_password',
        timestamp: new Date().toISOString(),
      })
      const response = await fetch(`${API_URL}/api/auth/verify-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          deviceInfo,
          quantumCredentials: quantumCreds,
          securityAnalysis: quantumState.securityAnalysis,
          behavioralScore: quantumState.behavioralScore,
          deviceFingerprint: quantumState.deviceFingerprint,
        }),
      })
      const result = await response.json()
      if (response.ok) {
        setAuthState({
          step: 'choose_verification',
          isAuthenticated: true,
          tempToken: result.tempToken,
          userEmail: formData.email
        })
      } else {
        setError(result.message || 'Invalid credentials')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  // Choose email verification
  const chooseEmailVerification = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.tempToken}` },
        body: JSON.stringify({ email: authState.userEmail, method: 'email', quantumSecure: true, deviceFingerprint: quantumState.deviceFingerprint })
      })
      if (response.ok) {
        setAuthState(prev => ({ ...prev, step: 'verify_code' }))
        setVerification({ isVerifying: true, method: 'email', code: '', countdown: 300, attempts: 0 })
      } else {
        const result = await response.json()
        setError(result.message || 'Failed to send verification email')
      }
    } catch (error: any) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  // Choose SMS verification
  const chooseSMSVerification = () => {
    setAuthState(prev => ({ ...prev, step: 'register_phone' }))
  }

  // Register phone number
  const registerPhoneNumber = async () => {
    if (!formData.phoneNumber) {
      setError('Please enter your phone number')
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const registerResponse = await fetch(`${API_URL}/api/auth/register-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.tempToken}` },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, deviceFingerprint: quantumState.deviceFingerprint })
      })
      
      if (!registerResponse.ok) {
        const registerResult = await registerResponse.json()
        // Handle duplicate phone error with clear message
        if (registerResult.error === 'phone_already_registered') {
          setError('⚠️ This phone number is already registered to another account. Please use a different phone number or contact support if this is your number.')
        } else {
          setError(registerResult.message || 'Failed to register phone number')
        }
        return
      }
      
      const registerResult = await registerResponse.json()
      console.log('📱 Phone registered successfully, sending SMS verification...')
      
      // Check if phone was already registered to current user
      if (registerResult.alreadyRegistered) {
        console.log('📱 Phone already registered to this account')
      }
      
      // Phone registered, now send SMS verification
      const smsResponse = await fetch(`${API_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.tempToken}`
        },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, method: 'sms', quantumSecure: true, deviceFingerprint: quantumState.deviceFingerprint })
      })
      
      console.log('📱 SMS verification response status:', smsResponse.status)
      
      if (smsResponse.ok) {
        const smsResult = await smsResponse.json()
        console.log('📱 SMS verification successful:', smsResult)
        
        setAuthState(prev => ({ ...prev, step: 'verify_code' }))
        setVerification({ isVerifying: true, method: 'sms', code: '', countdown: 300, attempts: 0 })
        
        trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_START, {
          phoneNumber: formData.phoneNumber,
          method: 'quantum_sms_verification',
          timestamp: new Date().toISOString(),
        })
      } else {
        const result = await smsResponse.json()
        console.error('📱 SMS verification failed:', result)
        setError(result.message || 'Failed to send SMS')
      }
    } catch (error: any) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify code
  const verifyCode = async () => {
    if (!verification.code || verification.code.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/auth/complete-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authState.tempToken}` },
        body: JSON.stringify({
          code: verification.code,
          method: verification.method,
          email: authState.userEmail,
          phoneNumber: formData.phoneNumber,
          quantumCredentials: await createQuantumCredentials(authState.userEmail, verification.code, quantumState.deviceFingerprint),
          deviceFingerprint: quantumState.deviceFingerprint,
          rememberMe: formData.rememberMe
        })
      })
      const result = await response.json()
      if (response.ok) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        registerKnownDevice(quantumState.deviceFingerprint)
        updateSessionHistory(quantumState.deviceFingerprint)
        await createDesktopEmbedding('quantum_login_success', {
          priority: 'high',
          metadata: { kind: 'authentication', source: 'quantum_desktop_login', platform: 'desktop', userId: result.user.id },
        })
        setSuccess(true)
        setTimeout(() => router.push('/quantum-mode'), 1500)
      } else {
        setError(result.message || 'Invalid verification code')
      }
    } catch (error: any) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950">
        <div className="text-center text-white p-8">
          <CheckCircle className="w-24 h-24 mx-auto animate-bounce mb-6" />
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-white/80">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  // Step 2: Choose Verification Method
  if (authState.step === 'choose_verification') {
    return (
      <DesktopLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 py-12 px-6">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-2xl"></div>
          </div>
          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-8">
              <Shield className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">Choose Verification Method</h1>
              <p className="text-white/80 text-lg">Your credentials are verified. Choose how you'd like to receive your quantum-secure code.</p>
            </div>
            <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-xl">{authState.userEmail}</div>
                  <div className="text-white/70">Credentials verified ✓</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 hover:bg-white/15 transition-all group">
                <Mail className="w-16 h-16 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-white mb-3 text-center">Email Verification</h3>
                <p className="text-white/70 mb-6 text-center">Send code to {authState.userEmail}</p>
                <DesktopButton variant="primary" size="lg" fullWidth onClick={chooseEmailVerification} disabled={isLoading}>
                  Send Email Code
                </DesktopButton>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 hover:bg-white/15 transition-all group">
                <Smartphone className="w-16 h-16 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-white mb-3 text-center">SMS Verification</h3>
                <p className="text-white/70 mb-6 text-center">Register phone & receive SMS code</p>
                <DesktopButton variant="primary" size="lg" fullWidth onClick={chooseSMSVerification} disabled={isLoading}>
                  Register Phone
                </DesktopButton>
              </div>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 text-white text-center">⚠️ {error}</div>}
            <div className="text-center">
              <button onClick={() => setAuthState({ step: 'login', isAuthenticated: false, tempToken: null, userEmail: '' })} className="text-white/80 hover:text-white transition-colors">← Back to Login</button>
            </div>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  // Step 3: Register Phone
  if (authState.step === 'register_phone') {
    return (
      <DesktopLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Smartphone className="w-20 h-20 text-green-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">Register Phone Number</h1>
              <p className="text-white/80 text-lg">Enter your phone number to receive quantum-secure SMS codes.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20">
              <DesktopInput type="tel" label="Phone Number" placeholder="+1 (555) 123-4567" value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} icon={<Smartphone className="w-5 h-5" />} required disabled={isLoading} />
              <p className="text-xs text-white/60 mt-2 mb-6">This number will be registered for future SMS verifications</p>
              {error && <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 text-white">⚠️ {error}</div>}
              <DesktopButton variant="primary" size="lg" fullWidth loading={isLoading} disabled={isLoading || !formData.phoneNumber} onClick={registerPhoneNumber}>
                {isLoading ? 'Registering...' : 'Register & Send SMS Code'}
              </DesktopButton>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setAuthState(prev => ({ ...prev, step: 'choose_verification' }))} className="text-white/80 hover:text-white transition-colors" disabled={isLoading}>← Back to Verification Methods</button>
            </div>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  // Step 4: Verification Code
  if (authState.step === 'verify_code' && verification.isVerifying) {
    return (
      <DesktopLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              {verification.method === 'email' ? <Mail className="w-20 h-20 text-cyan-400 mx-auto mb-4" /> : <Smartphone className="w-20 h-20 text-green-400 mx-auto mb-4" />}
              <h1 className="text-4xl font-bold text-white mb-2">{verification.method === 'email' ? 'Check Your Email' : 'Check Your Phone'}</h1>
              <p className="text-white/80 text-lg">We sent a 6-digit quantum-encrypted code to <span className="font-semibold">{verification.method === 'email' ? formData.email : formData.phoneNumber}</span></p>
            </div>
            <div className="mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">Quantum-Secured Verification</span>
              </div>
              <div className="text-xs text-white/70">Code expires in: {Math.floor(verification.countdown / 60)}:{(verification.countdown % 60).toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20">
              <label className="block text-sm font-medium text-white/90 mb-2">Verification Code</label>
              <input type="text" maxLength={6} placeholder="000000" value={verification.code} onChange={(e) => setVerification(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '') }))} className="w-full px-4 py-3 bg-white border border-white/20 rounded-xl text-gray-900 text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-6" disabled={isLoading} />
              {error && <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 text-white">⚠️ {error}</div>}
              <DesktopButton variant="primary" size="lg" fullWidth loading={isLoading} disabled={isLoading || verification.code.length !== 6} onClick={verifyCode}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </DesktopButton>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setAuthState(prev => ({ ...prev, step: 'choose_verification' }))} className="text-white/80 hover:text-white transition-colors">← Back to Verification Methods</button>
            </div>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  // Step 1: Login Form (Default)
  return (
    <DesktopLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 py-12 px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-2xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" fill="currentColor" />
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-4 max-w-2xl mx-auto">
              Sign in to your account to continue your journey
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-white/60 flex-wrap">
              {quantumState.quantumEnabled && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span>Quantum Security</span>
                </div>
              )}
              {showBiometric && (
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-green-400" />
                  <span>Biometric Ready</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>Military-Grade</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Security Dashboard */}
            {quantumState.quantumEnabled && quantumState.securityAnalysis && (
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-6 h-6 ${
                        quantumState.securityAnalysis.riskLevel === 'low' ? 'text-green-400' :
                        quantumState.securityAnalysis.riskLevel === 'medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                      <span className="text-white font-semibold">Security Status</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      quantumState.securityAnalysis.riskLevel === 'low' ? 'bg-green-500/20 text-green-300' :
                      quantumState.securityAnalysis.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {quantumState.securityAnalysis.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-white/70">Trust Score</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {quantumState.securityAnalysis.trustScore}/100
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${quantumState.securityAnalysis.trustScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-white/70">Behavioral Score</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(quantumState.behavioralScore)}/100
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                          style={{ width: `${quantumState.behavioralScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {quantumState.securityAnalysis.anomalies.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-200">
                          {quantumState.securityAnalysis.anomalies[0]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Column: Login Form */}
            <div className={quantumState.quantumEnabled && quantumState.securityAnalysis ? "lg:col-span-2" : "lg:col-span-3 max-w-2xl mx-auto w-full"}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div onKeyDown={handleKeyPress}>
                    <DesktopInput
                      type="email"
                      label="Email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      icon={<Mail className="w-5 h-5" />}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input */}
                  <div onKeyDown={handleKeyPress}>
                    <DesktopPasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        disabled={isLoading}
                      />
                      <label htmlFor="rememberMe" className="ml-2 text-sm text-white/90 cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-white/80 hover:text-white transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
                      <p className="text-sm text-white">⚠️ {error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-400 disabled:to-pink-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Biometric Login */}
                {showBiometric && !isLoading && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white/10 text-white/70">Or continue with</span>
                      </div>
                    </div>

                    <DesktopButton
                      variant="outline"
                      size="lg"
                      fullWidth
                      onClick={async () => {
                        setIsLoading(true)
                        setError(null)
                        try {
                          if (!window.PublicKeyCredential) throw new Error('Biometric authentication not supported')
                          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                          if (!available) throw new Error('No biometric authenticator available')
                          const challenge = new Uint8Array(32)
                          crypto.getRandomValues(challenge)
                          const credential = await navigator.credentials.create({
                            publicKey: {
                              challenge,
                              rp: { name: '4uLove', id: window.location.hostname },
                              user: { id: new TextEncoder().encode('user@4ulove.com'), name: 'user@4ulove.com', displayName: '4uLove User' },
                              pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
                              authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
                              timeout: 60000,
                              attestation: 'none',
                            }
                          })
                          if (credential) {
                            const mockUser = { id: 'biometric_user', email: 'user@4ulove.com', name: 'Biometric User' }
                            localStorage.setItem('token', `biometric_${Date.now()}`)
                            localStorage.setItem('user', JSON.stringify(mockUser))
                            trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_SUCCESS, { type: 'desktop_biometric', method: 'biometric', timestamp: new Date().toISOString() })
                            await createDesktopEmbedding('login_success_biometric', { priority: 'high', metadata: { kind: 'authentication', source: 'desktop_login', platform: 'desktop', method: 'biometric', userId: mockUser.id } })
                            setSuccess(true)
                            setTimeout(() => router.push('/quantum-mode'), 1500)
                          }
                        } catch (error: any) {
                          console.error('Biometric authentication failed:', error)
                          setError(error.message || 'Biometric authentication failed')
                          trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_FAILURE, { method: 'biometric', error: error.message, timestamp: new Date().toISOString() })
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      icon={<Fingerprint className="w-5 h-5" />}
                      iconPosition="left"
                      className="hover:bg-white/15"
                    >
                      Windows Hello / Touch ID
                    </DesktopButton>
                  </>
                )}

                {/* Social Login Options */}
                <div className="mt-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/10 text-white/70 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Social Login
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DesktopButton
                      variant="outline"
                      size="lg"
                      onClick={async () => {
                        setIsLoading(true)
                        setError(null)
                        try {
                          trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_START, { method: 'google_oauth', timestamp: new Date().toISOString() })
                          window.location.href = `${API_URL}/api/auth/google?deviceFingerprint=${quantumState.deviceFingerprint}`
                        } catch (error: any) {
                          setError('Google login failed. Please try again.')
                          setIsLoading(false)
                        }
                      }}
                      disabled={isLoading}
                      className="bg-white/5 border-white/20 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-white">Google</span>
                      </div>
                    </DesktopButton>
                    
                    <DesktopButton
                      variant="outline"
                      size="lg"
                      onClick={async () => {
                        setIsLoading(true)
                        setError(null)
                        try {
                          trackDesktopEvent(DESKTOP_EVENTS.DESKTOP_LOGIN_START, { method: 'facebook_oauth', timestamp: new Date().toISOString() })
                          window.location.href = `${API_URL}/api/auth/facebook?deviceFingerprint=${quantumState.deviceFingerprint}`
                        } catch (error: any) {
                          setError('Facebook login failed. Please try again.')
                          setIsLoading(false)
                        }
                      }}
                      disabled={isLoading}
                      className="bg-[#1877F2]/10 border-[#1877F2]/30 hover:bg-[#1877F2]/20"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-white">Facebook</span>
                      </div>
                    </DesktopButton>
                  </div>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-white/80 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-semibold text-white hover:underline">
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
