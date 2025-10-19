'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Zap,
  Lock,
  Unlock,
  Database,
  TrendingUp,
  Award,
  Target,
  Clock,
  Globe,
  Cpu
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface AdvancedPasswordSecurityProps {
  password: string
  onSecurityUpdate: (security: PasswordSecurity) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface PasswordSecurity {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
  breachStatus: 'checking' | 'safe' | 'breached' | 'error'
  breachCount: number
  entropy: number
  crackTime: string
  recommendations: string[]
  strengths: string[]
  vulnerabilities: string[]
  aiAnalysis: string
}

interface PasswordAnalysis {
  length: number
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSpecialChars: boolean
  hasCommonPatterns: boolean
  hasPersonalInfo: boolean
  entropy: number
  uniqueness: number
}

export default function AdvancedPasswordSecurity({
  password,
  onSecurityUpdate,
  variant,
  className = ''
}: AdvancedPasswordSecurityProps) {
  const [security, setSecurity] = useState<PasswordSecurity | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(true)

  useEffect(() => {
    if (password && password.length > 0) {
      if (realTimeAnalysis) {
        analyzePassword(password)
      }
    } else {
      setSecurity(null)
    }
  }, [password, realTimeAnalysis])

  const analyzePassword = async (pwd: string) => {
    setIsAnalyzing(true)
    
    try {
      const analysis = performPasswordAnalysis(pwd)
      const breachResult = await checkPasswordBreaches(pwd)
      const securityResult = calculatePasswordSecurity(analysis, breachResult)
      
      setSecurity(securityResult)
      onSecurityUpdate(securityResult)
      
      trackEvent('password_security_analyzed', {
        score: securityResult.score,
        level: securityResult.level,
        breachStatus: securityResult.breachStatus,
        variant
      })
      
    } catch (error) {
      console.error('Password analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performPasswordAnalysis = (pwd: string): PasswordAnalysis => {
    const analysis: PasswordAnalysis = {
      length: pwd.length,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      hasCommonPatterns: /123|abc|password|qwerty|admin|login/i.test(pwd),
      hasPersonalInfo: false, // Would check against user's personal info
      entropy: calculateEntropy(pwd),
      uniqueness: calculateUniqueness(pwd)
    }
    
    return analysis
  }

  const calculateEntropy = (pwd: string): number => {
    const charset = getCharsetSize(pwd)
    return Math.log2(Math.pow(charset, pwd.length))
  }

  const getCharsetSize = (pwd: string): number => {
    let size = 0
    if (/[a-z]/.test(pwd)) size += 26
    if (/[A-Z]/.test(pwd)) size += 26
    if (/\d/.test(pwd)) size += 10
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) size += 32
    return size || 1
  }

  const calculateUniqueness = (pwd: string): number => {
    const uniqueChars = new Set(pwd).size
    return (uniqueChars / pwd.length) * 100
  }

  const checkPasswordBreaches = async (pwd: string): Promise<{ isBreached: boolean, count: number }> => {
    // Simulate API call to breach database (like HaveIBeenPwned)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock breach check - in production, use SHA-1 hash with k-anonymity
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty', 
      'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
    ]
    
    const isBreached = commonPasswords.includes(pwd.toLowerCase())
    const count = isBreached ? Math.floor(Math.random() * 10000000) + 100000 : 0
    
    return { isBreached, count }
  }

  const calculatePasswordSecurity = (
    analysis: PasswordAnalysis, 
    breachResult: { isBreached: boolean, count: number }
  ): PasswordSecurity => {
    let score = 0
    const recommendations: string[] = []
    const strengths: string[] = []
    const vulnerabilities: string[] = []

    // Length scoring
    if (analysis.length >= 12) {
      score += 25
      strengths.push('Excellent length (12+ characters)')
    } else if (analysis.length >= 8) {
      score += 15
      strengths.push('Good length (8+ characters)')
    } else {
      vulnerabilities.push('Too short - use at least 8 characters')
      recommendations.push('Increase password length to at least 12 characters')
    }

    // Character variety scoring
    if (analysis.hasUppercase) {
      score += 10
      strengths.push('Contains uppercase letters')
    } else {
      vulnerabilities.push('Missing uppercase letters')
      recommendations.push('Add uppercase letters (A-Z)')
    }

    if (analysis.hasLowercase) {
      score += 10
      strengths.push('Contains lowercase letters')
    } else {
      vulnerabilities.push('Missing lowercase letters')
      recommendations.push('Add lowercase letters (a-z)')
    }

    if (analysis.hasNumbers) {
      score += 10
      strengths.push('Contains numbers')
    } else {
      vulnerabilities.push('Missing numbers')
      recommendations.push('Add numbers (0-9)')
    }

    if (analysis.hasSpecialChars) {
      score += 15
      strengths.push('Contains special characters')
    } else {
      vulnerabilities.push('Missing special characters')
      recommendations.push('Add special characters (!@#$%^&*)')
    }

    // Pattern analysis
    if (!analysis.hasCommonPatterns) {
      score += 10
      strengths.push('No common patterns detected')
    } else {
      vulnerabilities.push('Contains common patterns')
      recommendations.push('Avoid common patterns like "123" or "abc"')
    }

    // Entropy bonus
    if (analysis.entropy >= 60) {
      score += 10
      strengths.push('High entropy (randomness)')
    } else if (analysis.entropy >= 40) {
      score += 5
      strengths.push('Good entropy')
    } else {
      vulnerabilities.push('Low entropy - too predictable')
      recommendations.push('Use more random character combinations')
    }

    // Uniqueness bonus
    if (analysis.uniqueness >= 80) {
      score += 5
      strengths.push('High character diversity')
    }

    // Breach penalty
    if (breachResult.isBreached) {
      score = Math.max(0, score - 30)
      vulnerabilities.push(`Found in ${breachResult.count.toLocaleString()} data breaches`)
      recommendations.push('This password has been compromised - choose a different one')
    } else {
      strengths.push('Not found in known data breaches')
    }

    // Calculate crack time
    const crackTime = calculateCrackTime(analysis.entropy)
    
    // Determine level
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
    if (score >= 85) level = 'excellent'
    else if (score >= 70) level = 'strong'
    else if (score >= 55) level = 'good'
    else if (score >= 40) level = 'fair'
    else level = 'weak'

    // AI analysis
    const aiAnalysis = generateAIAnalysis(analysis, score, level, breachResult.isBreached)

    return {
      score: Math.min(100, score),
      level,
      breachStatus: breachResult.isBreached ? 'breached' : 'safe',
      breachCount: breachResult.count,
      entropy: analysis.entropy,
      crackTime,
      recommendations,
      strengths,
      vulnerabilities,
      aiAnalysis
    }
  }

  const calculateCrackTime = (entropy: number): string => {
    // Assuming 1 billion guesses per second
    const guessesPerSecond = 1e9
    const totalCombinations = Math.pow(2, entropy)
    const secondsToCrack = totalCombinations / (2 * guessesPerSecond)

    if (secondsToCrack < 1) return 'Instantly'
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`
    return 'Centuries'
  }

  const generateAIAnalysis = (
    analysis: PasswordAnalysis, 
    score: number, 
    level: string, 
    isBreached: boolean
  ): string => {
    if (isBreached) {
      return 'AI detected this password in data breaches. Immediate replacement required for account security.'
    }
    
    if (score >= 85) {
      return 'AI analysis: Excellent password security. This password provides maximum protection against attacks.'
    } else if (score >= 70) {
      return 'AI analysis: Strong password with good security characteristics. Minor improvements possible.'
    } else if (score >= 55) {
      return 'AI analysis: Decent password but could be strengthened with additional complexity.'
    } else if (score >= 40) {
      return 'AI analysis: Fair password security. Significant improvements recommended for better protection.'
    } else {
      return 'AI analysis: Weak password security. This password is vulnerable to attacks and should be strengthened.'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-400'
      case 'strong': return 'text-blue-400'
      case 'good': return 'text-cyan-400'
      case 'fair': return 'text-yellow-400'
      case 'weak': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-400'
      case 'strong': return 'bg-blue-400'
      case 'good': return 'bg-cyan-400'
      case 'fair': return 'bg-yellow-400'
      case 'weak': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  if (!password) {
    return null
  }

  return (
    <div className={`advanced-password-security ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-300/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium text-white">Advanced Password Security</span>
            {isAnalyzing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-yellow-400" />
              </motion.div>
            ) : (
              <Award className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-white/60" />
              ) : (
                <Eye className="h-4 w-4 text-white/60" />
              )}
            </button>
            <button
              onClick={() => setRealTimeAnalysis(!realTimeAnalysis)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                realTimeAnalysis 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              Real-time {realTimeAnalysis ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Password Display */}
        {showPassword && (
          <div className="mb-4 p-3 bg-black/20 rounded-lg font-mono text-sm text-white break-all">
            {password}
          </div>
        )}

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-sm text-white/80">Analyzing password security...</span>
            </div>
          </div>
        ) : security && (
          <div className="space-y-4">
            {/* Security Score */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/10"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      className={getLevelColor(security.level)}
                      initial={{ strokeDasharray: "0 175.9" }}
                      animate={{ strokeDasharray: `${(security.score / 100) * 175.9} 175.9` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${getLevelColor(security.level)}`}>
                      {security.score}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className={`text-lg font-semibold ${getLevelColor(security.level)}`}>
                    {security.level.toUpperCase()}
                  </div>
                  <div className="text-sm text-white/60">Security Level</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {security.breachStatus === 'safe' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${
                    security.breachStatus === 'safe' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {security.breachStatus === 'safe' ? 'No Breaches' : 'Breached'}
                  </span>
                </div>
                {security.breachCount > 0 && (
                  <div className="text-xs text-red-300">
                    {security.breachCount.toLocaleString()} times
                  </div>
                )}
              </div>
            </div>

            {/* Security Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-white">Entropy</span>
                </div>
                <div className="text-lg font-semibold text-cyan-400">
                  {security.entropy.toFixed(1)} bits
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-white">Crack Time</span>
                </div>
                <div className="text-lg font-semibold text-purple-400">
                  {security.crackTime}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-300/20">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-white">AI Security Analysis</span>
              </div>
              <p className="text-sm text-white/80">{security.aiAnalysis}</p>
            </div>

            {/* Strengths */}
            {security.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h4>
                <div className="space-y-1">
                  {security.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-300">
                      <Target className="h-3 w-3 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {security.vulnerabilities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Vulnerabilities
                </h4>
                <div className="space-y-1">
                  {security.vulnerabilities.map((vulnerability, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-300">
                      <XCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{vulnerability}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {security.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recommendations
                </h4>
                <div className="space-y-1">
                  {security.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-yellow-300">
                      <Target className="h-3 w-3 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Analysis Button */}
            {!realTimeAnalysis && (
              <button
                onClick={() => analyzePassword(password)}
                disabled={isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Password Security'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
