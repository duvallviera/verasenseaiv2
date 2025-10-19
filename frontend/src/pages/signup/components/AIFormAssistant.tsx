'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Zap, Target, TrendingUp, CheckCircle, AlertCircle, Lightbulb, X, HelpCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface AIFormAssistantProps {
  formData: Record<string, any>
  currentField: string
  onSuggestion: (field: string, value: string) => void
  onAutoComplete: (suggestions: Record<string, string>) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface AISuggestion {
  field: string
  value: string
  confidence: number
  reason: string
  type: 'completion' | 'improvement' | 'correction'
}

interface ProfileAnalysis {
  completeness: number
  attractiveness: number
  authenticity: number
  recommendations: string[]
}

export default function AIFormAssistant({
  formData,
  currentField,
  onSuggestion,
  onAutoComplete,
  variant,
  className = ''
}: AIFormAssistantProps) {
  const [isActive, setIsActive] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const analysisRef = useRef<HTMLDivElement>(null)

  // AI-powered field analysis
  const analyzeField = async (field: string, value: string): Promise<AISuggestion[]> => {
    const suggestions: AISuggestion[] = []

    switch (field) {
      case 'firstName':
        if (value && value.length < 2) {
          suggestions.push({
            field,
            value: value.charAt(0).toUpperCase() + value.slice(1),
            confidence: 0.9,
            reason: 'Names should be capitalized',
            type: 'correction'
          })
        }
        break

      case 'email':
        if (value && !value.includes('@')) {
          const commonDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com']
          suggestions.push({
            field,
            value: value + '@gmail.com',
            confidence: 0.7,
            reason: 'Complete email with common domain',
            type: 'completion'
          })
        }
        break

      case 'nickname':
        if (formData.firstName && !value) {
          const nickname = generateNickname(formData.firstName)
          suggestions.push({
            field,
            value: nickname,
            confidence: 0.8,
            reason: 'AI-generated nickname based on your name',
            type: 'completion'
          })
        }
        break

      case 'password':
        if (value && value.length < 12) {
          suggestions.push({
            field,
            value: generateStrongPassword(value),
            confidence: 0.9,
            reason: 'Enhanced password for better security',
            type: 'improvement'
          })
        }
        break
    }

    return suggestions
  }

  // Generate AI nickname suggestions
  const generateNickname = (firstName: string): string => {
    const nicknames = [
      firstName + Math.floor(Math.random() * 100),
      firstName.slice(0, 3) + '_' + ['star', 'heart', 'dream', 'soul'][Math.floor(Math.random() * 4)],
      firstName.toLowerCase() + ['2024', '_love', '_4u'][Math.floor(Math.random() * 3)]
    ]
    return nicknames[Math.floor(Math.random() * nicknames.length)]
  }

  // Generate stronger password
  const generateStrongPassword = (base: string): string => {
    const symbols = '!@#$%^&*'
    const numbers = '0123456789'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    let enhanced = base
    if (!/[A-Z]/.test(enhanced)) enhanced += uppercase[Math.floor(Math.random() * uppercase.length)]
    if (!/[0-9]/.test(enhanced)) enhanced += numbers[Math.floor(Math.random() * numbers.length)]
    if (!/[!@#$%^&*]/.test(enhanced)) enhanced += symbols[Math.floor(Math.random() * symbols.length)]
    
    return enhanced
  }

  // Comprehensive profile analysis
  const analyzeProfile = async (): Promise<ProfileAnalysis> => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const fields = ['firstName', 'lastName', 'email', 'nickname', 'password', 'dateOfBirth', 'gender']
    const completedFields = fields.filter(field => formData[field])
    const completeness = (completedFields.length / fields.length) * 100

    const attractiveness = calculateAttractiveness()
    const authenticity = calculateAuthenticity()
    const recommendations = generateRecommendations()

    setIsAnalyzing(false)
    
    return {
      completeness,
      attractiveness,
      authenticity,
      recommendations
    }
  }

  const calculateAttractiveness = (): number => {
    let score = 40 // Base score
    
    // Name completeness and quality (25 points)
    if (formData.firstName && formData.lastName) {
      score += 15
      // Bonus for proper capitalization
      if (formData.firstName[0] === formData.firstName[0].toUpperCase() && 
          formData.lastName[0] === formData.lastName[0].toUpperCase()) {
        score += 5
      }
      // Bonus for reasonable length names
      if (formData.firstName.length >= 2 && formData.firstName.length <= 15 &&
          formData.lastName.length >= 2 && formData.lastName.length <= 15) {
        score += 5
      }
    }
    
    // Nickname creativity and appropriateness (15 points)
    if (formData.nickname) {
      if (formData.nickname.length >= 3 && formData.nickname.length <= 15) score += 8
      // Bonus for creative nicknames (not just firstName + numbers)
      if (!formData.nickname.match(/^[a-zA-Z]+\d+$/)) score += 4
      // Bonus for unique character combinations
      if (formData.nickname.includes('_') || formData.nickname.match(/[A-Z][a-z]/)) score += 3
    }
    
    // Email professionalism (10 points)
    if (formData.email) {
      const emailParts = formData.email.split('@')
      if (emailParts.length === 2) {
        const [localPart, domain] = emailParts
        // Professional email patterns
        if (!localPart.match(/\d{3,}/) && !localPart.includes('xxx')) score += 5
        // Common professional domains
        if (['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(domain.toLowerCase())) score += 3
        // Bonus for name-based emails
        if (formData.firstName && localPart.toLowerCase().includes(formData.firstName.toLowerCase())) score += 2
      }
    }
    
    // Profile completeness bonus (10 points)
    const fields = ['firstName', 'lastName', 'email', 'nickname', 'dateOfBirth', 'gender']
    const completedFields = fields.filter(field => formData[field]).length
    score += Math.round((completedFields / fields.length) * 10)
    
    return Math.min(score, 100)
  }

  const calculateAuthenticity = (): number => {
    let score = 50 // Base score
    
    // Name authenticity (30 points)
    if (formData.firstName) {
      // Real name patterns (supports international names)
      if (/^[A-Za-z\u00C0-\u017F\u0100-\u024F\s'-]+$/.test(formData.firstName)) score += 10
      // Reasonable length
      if (formData.firstName.length >= 2 && formData.firstName.length <= 20) score += 5
      // Not obviously fake
      if (!['test', 'user', 'admin', 'fake'].includes(formData.firstName.toLowerCase())) score += 5
    }
    
    if (formData.lastName) {
      if (/^[A-Za-z\u00C0-\u017F\u0100-\u024F\s'-]+$/.test(formData.lastName)) score += 10
      if (formData.lastName.length >= 2 && formData.lastName.length <= 25) score += 5
      if (!['test', 'user', 'admin', 'fake'].includes(formData.lastName.toLowerCase())) score += 5
    }
    
    // Email authenticity (20 points)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(formData.email)) score += 10
      // Not obviously fake
      if (!formData.email.includes('fake') && !formData.email.includes('test')) score += 5
      // Reasonable local part length
      const localPart = formData.email.split('@')[0]
      if (localPart && localPart.length >= 3 && localPart.length <= 30) score += 5
    }
    
    // Age authenticity (15 points)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      if (age >= 18 && age <= 80) score += 10
      if (age >= 21 && age <= 65) score += 5 // Sweet spot for dating
    }
    
    // Consistency check (15 points)
    if (formData.firstName && formData.email) {
      const emailLocal = formData.email.split('@')[0].toLowerCase()
      if (emailLocal.includes(formData.firstName.toLowerCase())) score += 8
    }
    if (formData.nickname && formData.firstName) {
      // Nickname relates to real name
      if (formData.nickname.toLowerCase().includes(formData.firstName.toLowerCase().slice(0, 3))) score += 7
    }
    
    return Math.min(score, 100)
  }

  const generateRecommendations = (): string[] => {
    const recommendations = []
    
    // Profile completeness recommendations
    if (!formData.firstName) {
      recommendations.push('💡 Add your first name to build trust and authenticity')
    } else if (formData.firstName.length < 2) {
      recommendations.push('📝 Use your full first name for better credibility')
    }
    
    if (!formData.lastName) {
      recommendations.push('🔒 Add your last name for verification (kept private from other users)')
    }
    
    // Nickname optimization
    if (!formData.nickname) {
      recommendations.push('✨ Create a unique nickname that represents your personality')
    } else if (formData.nickname.match(/^[a-zA-Z]+\d+$/)) {
      recommendations.push('🎨 Consider a more creative nickname than just name + numbers')
    } else if (formData.nickname.length < 3) {
      recommendations.push('📏 Make your nickname at least 3 characters long')
    }
    
    // Email recommendations
    if (!formData.email) {
      recommendations.push('📧 Add your email for account security and notifications')
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      recommendations.push('⚠️ Please check your email format (example@domain.com)')
    } else if (formData.email.includes('test') || formData.email.includes('fake')) {
      recommendations.push('🎯 Use your real email address for the best experience')
    }
    
    // Password security
    if (formData.password) {
      const hasUpper = /[A-Z]/.test(formData.password)
      const hasLower = /[a-z]/.test(formData.password)
      const hasNumber = /\d/.test(formData.password)
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
      
      if (formData.password.length < 8) {
        recommendations.push('🔐 Use at least 8 characters for your password')
      } else if (!hasUpper || !hasLower || !hasNumber) {
        recommendations.push('💪 Strengthen your password with uppercase, lowercase, and numbers')
      } else if (!hasSpecial && formData.password.length < 12) {
        recommendations.push('🛡️ Add special characters or make it longer for maximum security')
      }
    }
    
    // Age verification
    if (!formData.dateOfBirth) {
      recommendations.push('🎂 Add your date of birth for age verification')
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        recommendations.push('🔞 You must be 18+ to use 4uLove')
      } else if (age > 80) {
        recommendations.push('📅 Please verify your birth date is correct')
      }
    }
    
    // Gender selection
    if (!formData.gender) {
      recommendations.push('👤 Select your gender identity for better matching')
    }
    
    // Advanced recommendations based on completeness
    const completedFields = Object.values(formData).filter(Boolean).length
    if (completedFields >= 6) {
      recommendations.push('🚀 Great job! Your profile is looking complete and attractive')
      if (!formData.phone) {
        recommendations.push('📱 Consider adding your phone for SMS 2FA (+15 security points)')
      }
    }
    
    return recommendations.slice(0, 5) // Limit to top 5 recommendations
  }

  // Real-time field monitoring
  useEffect(() => {
    const analyzeCurrentField = async () => {
      if (currentField && formData[currentField]) {
        const fieldSuggestions = await analyzeField(currentField, formData[currentField])
        setSuggestions(fieldSuggestions)
        
        if (fieldSuggestions.length > 0) {
          setIsActive(true)
          trackEvent('ai_suggestion_generated', {
            field: currentField,
            suggestionCount: fieldSuggestions.length,
            variant
          })
        }
      }
    }

    analyzeCurrentField()
  }, [currentField, formData, variant])

  // Auto-analyze profile when form is substantially complete
  useEffect(() => {
    const completedFields = Object.values(formData).filter(Boolean).length
    if (completedFields >= 4 && !analysis) {
      analyzeProfile().then(setAnalysis)
    }
  }, [formData, analysis])

  const handleSuggestionAccept = (suggestion: AISuggestion) => {
    onSuggestion(suggestion.field, suggestion.value)
    setSuggestions(prev => prev.filter(s => s !== suggestion))
    
    trackEvent('ai_suggestion_accepted', {
      field: suggestion.field,
      type: suggestion.type,
      confidence: suggestion.confidence,
      variant
    })
  }

  const handleSuggestionDismiss = (suggestion: AISuggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion))
    
    trackEvent('ai_suggestion_dismissed', {
      field: suggestion.field,
      type: suggestion.type,
      variant
    })
  }

  const handleAutoComplete = () => {
    const autoSuggestions: Record<string, string> = {}
    
    if (!formData.nickname && formData.firstName) {
      autoSuggestions.nickname = generateNickname(formData.firstName)
    }
    
    onAutoComplete(autoSuggestions)
    
    trackEvent('ai_auto_complete_used', {
      fieldsCompleted: Object.keys(autoSuggestions).length,
      variant
    })
  }

  return (
    <div className={`ai-form-assistant ${className}`}>
      {/* AI Suggestions Panel */}
      <AnimatePresence>
        {isActive && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-300/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-white">AI Assistant</span>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
            
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {suggestion.type === 'completion' && <Target className="h-4 w-4 text-green-400" />}
                      {suggestion.type === 'improvement' && <TrendingUp className="h-4 w-4 text-blue-400" />}
                      {suggestion.type === 'correction' && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                      <span className="text-sm font-medium text-white capitalize">{suggestion.type}</span>
                      <span className="text-xs text-white/60">({Math.round(suggestion.confidence * 100)}% confident)</span>
                    </div>
                    <p className="text-sm text-white/80">{suggestion.reason}</p>
                    <code className="text-xs bg-black/20 px-2 py-1 rounded text-green-300 mt-1 inline-block">
                      {suggestion.value}
                    </code>
                  </div>
                  
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleSuggestionAccept(suggestion)}
                      className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSuggestionDismiss(suggestion)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Analysis Dashboard */}
      {analysis && (
        <motion.div
          ref={analysisRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-white">AI Profile Analysis</span>
            </div>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
            >
              {showInsights ? 'Hide' : 'Show'} Insights
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(analysis.completeness)}%</div>
              <div className="text-xs text-white/60">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(analysis.attractiveness)}%</div>
              <div className="text-xs text-white/60">Attractive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{Math.round(analysis.authenticity)}%</div>
              <div className="text-xs text-white/60">Authentic</div>
            </div>
          </div>

          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-white/80">
                    <Lightbulb className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Auto-Complete Button with Help */}
      <div className="flex gap-2 items-center">
        <motion.button
          onClick={handleAutoComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Auto-Complete
          <Sparkles className="h-4 w-4" />
        </motion.button>
        
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="p-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl transition-colors"
          title="Show AI Auto-Complete features"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
      
      <button
        onClick={() => setShowInsights(!showInsights)}
        className="p-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl transition-colors"
        title="Show AI Auto-Complete features"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {/* AI Auto-Complete Help Popup */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 backdrop-blur-sm border border-indigo-400/30 rounded-lg p-4 relative"
          >
            <button
              onClick={() => setShowInsights(false)}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
            
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
                className="flex items-center justify-center gap-2 text-indigo-300"
              >
                <Brain className="h-8 w-8" />
                <Sparkles className="h-6 w-6" />
              </motion.div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">AI Auto-Complete Features:</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-green-300">
                    <Target className="h-4 w-4" />
                    <span>Smart completions</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-300">
                    <TrendingUp className="h-4 w-4" />
                    <span>Profile improvements</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300">
                    <Zap className="h-4 w-4" />
                    <span>Instant suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Brain className="h-4 w-4" />
                    <span>AI-powered analysis</span>
                  </div>
                </div>

                <p className="text-xs text-white/60 mt-3">
                Start typing in any field to activate AI assistance
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-4 text-white/60"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-5 w-5" />
          </motion.div>
          <span className="text-sm">AI analyzing your profile...</span>
        </motion.div>
      )}
    </div>
  )
}
