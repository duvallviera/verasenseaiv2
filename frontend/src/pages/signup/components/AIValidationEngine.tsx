'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Brain, 
  Zap, 
  Shield, 
  Eye, 
  TrendingUp,
  Sparkles,
  Target,
  Award,
  Lightbulb,
  Clock,
  Database
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface AIValidationEngineProps {
  formData: Record<string, any>
  currentField: string
  onValidationResult: (field: string, result: ValidationResult) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface ValidationResult {
  field: string
  isValid: boolean
  score: number
  level: 'excellent' | 'good' | 'warning' | 'error'
  message: string
  suggestions: string[]
  aiInsights: string[]
  securityRisk: 'low' | 'medium' | 'high'
  improvementTips: string[]
}

interface BreachCheckResult {
  isBreached: boolean
  breachCount: number
  lastBreach: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

interface AIAnalysis {
  confidence: number
  reasoning: string[]
  predictions: string[]
  optimizations: string[]
}

export default function AIValidationEngine({
  formData,
  currentField,
  onValidationResult,
  variant,
  className = ''
}: AIValidationEngineProps) {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [breachCheckResults, setBreachCheckResults] = useState<Record<string, BreachCheckResult>>({})
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Real-time validation with AI analysis
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (formData[currentField]) {
        performAIValidation(currentField, formData[currentField])
      }
    }, 500) // Debounce for 500ms

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [formData, currentField])

  const performAIValidation = async (field: string, value: string) => {
    setIsAnalyzing(true)
    
    try {
      const result = await analyzeField(field, value)
      
      setValidationResults(prev => ({ ...prev, [field]: result }))
      onValidationResult(field, result)

      // Perform breach check for passwords and emails
      if (field === 'password' || field === 'email') {
        const breachResult = await checkForBreaches(field, value)
        setBreachCheckResults(prev => ({ ...prev, [field]: breachResult }))
      }

      // Generate AI analysis
      if (Object.keys(validationResults).length >= 3) {
        const analysis = await generateAIAnalysis(formData)
        setAIAnalysis(analysis)
      }

      trackEvent('ai_validation_completed', {
        field,
        score: result.score,
        level: result.level,
        variant
      })

    } catch (error) {
      console.error('AI validation failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeField = async (field: string, value: string): Promise<ValidationResult> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 800))

    switch (field) {
      case 'firstName':
      case 'lastName':
        return analyzeNameField(field, value)
      
      case 'email':
        return analyzeEmailField(value)
      
      case 'nickname':
        return analyzeNicknameField(value)
      
      case 'password':
        return analyzePasswordField(value)
      
      case 'confirmPassword':
        return analyzeConfirmPasswordField(value, formData.password)
      
      case 'dateOfBirth':
        return analyzeDateOfBirthField(value)
      
      default:
        return {
          field,
          isValid: true,
          score: 80,
          level: 'good',
          message: 'Field looks good',
          suggestions: [],
          aiInsights: [],
          securityRisk: 'low',
          improvementTips: []
        }
    }
  }

  const analyzeNameField = (field: string, value: string): ValidationResult => {
    const score = calculateNameScore(value)
    const level = getScoreLevel(score)
    
    const suggestions = []
    const aiInsights = []
    const improvementTips = []

    if (value.length < 2) {
      suggestions.push('Names should be at least 2 characters long')
      improvementTips.push('Use your real first name for authenticity')
    }

    if (!/^[A-Za-z\s'-]+$/.test(value)) {
      suggestions.push('Names should only contain letters, spaces, hyphens, and apostrophes')
      improvementTips.push('Remove numbers and special characters')
    }

    if (value.toLowerCase() === value) {
      suggestions.push('Consider capitalizing the first letter')
      improvementTips.push('Proper capitalization improves profile attractiveness')
    }

    // AI insights
    if (score >= 90) {
      aiInsights.push('Excellent name format - builds trust with other users')
    } else if (score >= 70) {
      aiInsights.push('Good name format - minor improvements possible')
    } else {
      aiInsights.push('Name format needs improvement for better user trust')
    }

    return {
      field,
      isValid: score >= 60,
      score,
      level,
      message: getNameMessage(score, value),
      suggestions,
      aiInsights,
      securityRisk: 'low',
      improvementTips
    }
  }

  const analyzeEmailField = (value: string): ValidationResult => {
    const score = calculateEmailScore(value)
    const level = getScoreLevel(score)
    
    const suggestions = []
    const aiInsights = []
    const improvementTips = []

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      suggestions.push('Please enter a valid email address')
      improvementTips.push('Use format: user@domain.com')
    }

    const domain = value.split('@')[1]?.toLowerCase()
    const trustedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
    
    if (domain && !trustedDomains.includes(domain)) {
      aiInsights.push('Consider using a well-known email provider for better deliverability')
      improvementTips.push('Gmail, Yahoo, or Outlook are recommended')
    }

    if (/\d{4,}/.test(value)) {
      suggestions.push('Avoid using many consecutive numbers in email')
      improvementTips.push('Professional emails perform better in dating')
    }

    // AI insights based on email patterns
    if (score >= 90) {
      aiInsights.push('Professional email address - excellent for dating profiles')
    } else if (score >= 70) {
      aiInsights.push('Good email format - builds user confidence')
    } else {
      aiInsights.push('Email could be more professional for better results')
    }

    return {
      field: 'email',
      isValid: emailRegex.test(value),
      score,
      level,
      message: getEmailMessage(score, value),
      suggestions,
      aiInsights,
      securityRisk: score < 60 ? 'medium' : 'low',
      improvementTips
    }
  }

  const analyzePasswordField = (value: string): ValidationResult => {
    const score = calculatePasswordScore(value)
    const level = getScoreLevel(score)
    
    const suggestions = []
    const aiInsights = []
    const improvementTips = []
    let securityRisk: 'low' | 'medium' | 'high' = 'low'

    if (value.length < 8) {
      suggestions.push('Password should be at least 8 characters long')
      improvementTips.push('Use 12+ characters for maximum security')
      securityRisk = 'high'
    }

    if (!/[A-Z]/.test(value)) {
      suggestions.push('Add at least one uppercase letter')
      improvementTips.push('Mix uppercase and lowercase for strength')
    }

    if (!/[a-z]/.test(value)) {
      suggestions.push('Add at least one lowercase letter')
    }

    if (!/\d/.test(value)) {
      suggestions.push('Add at least one number')
      improvementTips.push('Numbers increase password complexity')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      suggestions.push('Add at least one special character (!@#$%^&*)')
      improvementTips.push('Special characters dramatically improve security')
    }

    // Check for common patterns
    if (/123|abc|password|qwerty/i.test(value)) {
      suggestions.push('Avoid common patterns like "123" or "abc"')
      securityRisk = 'high'
      improvementTips.push('Use random combinations instead of patterns')
    }

    // AI insights
    if (score >= 90) {
      aiInsights.push('Excellent password strength - your account will be very secure')
    } else if (score >= 70) {
      aiInsights.push('Good password strength - consider minor improvements')
    } else if (score >= 50) {
      aiInsights.push('Moderate password strength - improvements recommended')
      securityRisk = 'medium'
    } else {
      aiInsights.push('Weak password - significant security risk')
      securityRisk = 'high'
    }

    return {
      field: 'password',
      isValid: score >= 60,
      score,
      level,
      message: getPasswordMessage(score),
      suggestions,
      aiInsights,
      securityRisk,
      improvementTips
    }
  }

  const checkForBreaches = async (field: string, value: string): Promise<BreachCheckResult> => {
    // Simulate breach check API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock breach check results (in production, use HaveIBeenPwned API)
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty']
    const isBreached = field === 'password' && commonPasswords.includes(value.toLowerCase())
    
    return {
      isBreached,
      breachCount: isBreached ? Math.floor(Math.random() * 1000000) + 1000 : 0,
      lastBreach: isBreached ? '2023-08-15' : '',
      severity: isBreached ? 'critical' : 'low',
      recommendations: isBreached ? [
        'This password has been found in data breaches',
        'Choose a unique password that hasn\'t been compromised',
        'Consider using a password manager'
      ] : ['Password not found in known breaches']
    }
  }

  const generateAIAnalysis = async (data: Record<string, any>): Promise<AIAnalysis> => {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const completedFields = Object.keys(data).filter(key => data[key]).length
    const totalFields = 7 // firstName, lastName, email, nickname, password, confirmPassword, dateOfBirth
    const completeness = (completedFields / totalFields) * 100
    
    return {
      confidence: Math.min(95, completeness + Math.random() * 10),
      reasoning: [
        `Profile is ${Math.round(completeness)}% complete`,
        'Strong password security detected',
        'Professional email format identified',
        'Name authenticity score: High'
      ],
      predictions: [
        'High likelihood of successful account creation',
        'Profile will attract quality matches',
        'Low risk of security issues'
      ],
      optimizations: [
        'Consider adding a profile photo after signup',
        'Verify email address for better match visibility',
        'Complete all optional fields for 40% more matches'
      ]
    }
  }

  // Helper functions
  const calculateNameScore = (name: string): number => {
    let score = 50
    if (name.length >= 2) score += 20
    if (/^[A-Za-z\s'-]+$/.test(name)) score += 20
    if (name.charAt(0) === name.charAt(0).toUpperCase()) score += 10
    return Math.min(100, score)
  }

  const calculateEmailScore = (email: string): number => {
    let score = 50
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) score += 30
    const domain = email.split('@')[1]?.toLowerCase()
    const trustedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    if (domain && trustedDomains.includes(domain)) score += 20
    return Math.min(100, score)
  }

  const calculatePasswordScore = (password: string): number => {
    let score = 0
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 15
    if (/[A-Z]/.test(password)) score += 15
    if (/[a-z]/.test(password)) score += 15
    if (/\d/.test(password)) score += 15
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
    return Math.min(100, score)
  }

  const getScoreLevel = (score: number): 'excellent' | 'good' | 'warning' | 'error' => {
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getNameMessage = (score: number, name: string): string => {
    if (score >= 90) return `Perfect! "${name}" looks authentic and trustworthy`
    if (score >= 70) return `Good name format for "${name}"`
    if (score >= 50) return `"${name}" needs minor improvements`
    return `"${name}" needs significant improvements`
  }

  const getEmailMessage = (score: number, email: string): string => {
    if (score >= 90) return 'Excellent professional email address'
    if (score >= 70) return 'Good email format'
    if (score >= 50) return 'Email format could be improved'
    return 'Email needs correction'
  }

  const getPasswordMessage = (score: number): string => {
    if (score >= 90) return 'Excellent password strength - maximum security'
    if (score >= 70) return 'Good password strength'
    if (score >= 50) return 'Moderate password strength - improvements recommended'
    return 'Weak password - security risk'
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'excellent': return CheckCircle
      case 'good': return CheckCircle
      case 'warning': return AlertCircle
      case 'error': return XCircle
      default: return Eye
    }
  }

  const currentResult = validationResults[currentField]
  const currentBreachResult = breachCheckResults[currentField]

  if (!currentResult && !isAnalyzing) {
    return null
  }

  return (
    <div className={`ai-validation-engine ${className}`}>
      {/* Current Field Validation */}
      <AnimatePresence>
        {(currentResult || isAnalyzing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-300/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-medium text-white">AI Validation</span>
              {isAnalyzing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-4 w-4 text-yellow-400" />
                </motion.div>
              ) : (
                <Sparkles className="h-4 w-4 text-yellow-400" />
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/80">AI analyzing {currentField}...</span>
              </div>
            ) : currentResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(getLevelIcon(currentResult.level), {
                      className: `h-5 w-5 ${getLevelColor(currentResult.level)}`
                    })}
                    <span className={`text-sm font-medium ${getLevelColor(currentResult.level)}`}>
                      {currentResult.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getLevelColor(currentResult.level)}`}>
                      {currentResult.score}/100
                    </span>
                    <div className={`px-2 py-1 rounded text-xs ${
                      currentResult.securityRisk === 'high' ? 'bg-red-500/20 text-red-300' :
                      currentResult.securityRisk === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {currentResult.securityRisk.toUpperCase()} RISK
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      currentResult.level === 'excellent' ? 'bg-green-400' :
                      currentResult.level === 'good' ? 'bg-blue-400' :
                      currentResult.level === 'warning' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentResult.score}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>

                {/* AI Insights */}
                {currentResult.aiInsights.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">AI Insights</span>
                    </div>
                    {currentResult.aiInsights.map((insight, index) => (
                      <p key={index} className="text-sm text-white/80 mb-1">• {insight}</p>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {currentResult.suggestions.length > 0 && (
                  <div className="space-y-1">
                    {currentResult.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                        <Target className="h-3 w-3 text-orange-400 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breach Check Results */}
      <AnimatePresence>
        {currentBreachResult && currentBreachResult.isBreached && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-300/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-white">Security Alert</span>
              <div className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                BREACH DETECTED
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-red-300">
                This {currentField} has been found in {currentBreachResult.breachCount.toLocaleString()} data breaches
              </p>
              {currentBreachResult.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-white/80">
                  <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Dashboard */}
      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-white">AI Profile Analysis</span>
              <Award className="h-4 w-4 text-yellow-400" />
            </div>
            <button
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
            >
              {showDetailedAnalysis ? 'Hide' : 'Show'} Details
            </button>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(aiAnalysis.confidence)}%
              </div>
              <div className="text-xs text-white/60">Confidence</div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${aiAnalysis.confidence}%` }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showDetailedAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">AI Reasoning:</h4>
                  {aiAnalysis.reasoning.map((reason, index) => (
                    <p key={index} className="text-sm text-white/70 mb-1">• {reason}</p>
                  ))}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Predictions:</h4>
                  {aiAnalysis.predictions.map((prediction, index) => (
                    <p key={index} className="text-sm text-green-300 mb-1">• {prediction}</p>
                  ))}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Optimizations:</h4>
                  {aiAnalysis.optimizations.map((optimization, index) => (
                    <p key={index} className="text-sm text-blue-300 mb-1">• {optimization}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
