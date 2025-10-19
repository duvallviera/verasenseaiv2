'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, TrendingUp, Zap, Target, Award } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface SecurityScoreDashboardProps {
  formData: Record<string, any>
  deviceFingerprint?: any
  behaviorData?: any
  variant: 'desktop' | 'mobile'
  className?: string
}

interface SecurityMetric {
  name: string
  score: number
  maxScore: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  icon: React.ComponentType<any>
  description: string
  improvements: string[]
}

interface ThreatAssessment {
  level: 'low' | 'medium' | 'high' | 'critical'
  score: number
  threats: string[]
  recommendations: string[]
}

export default function SecurityScoreDashboard({
  formData,
  deviceFingerprint,
  behaviorData,
  variant,
  className = ''
}: SecurityScoreDashboardProps) {
  const [overallScore, setOverallScore] = useState(0)
  const [metrics, setMetrics] = useState<SecurityMetric[]>([])
  const [threatAssessment, setThreatAssessment] = useState<ThreatAssessment | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)

  // Calculate password strength score
  const calculatePasswordScore = (password: string): SecurityMetric => {
    if (!password) {
      return {
        name: 'Password Strength',
        score: 0,
        maxScore: 100,
        status: 'poor',
        icon: Lock,
        description: 'No password entered',
        improvements: ['Enter a password to begin security analysis']
      }
    }

    let score = 0
    const improvements = []

    // Length check
    if (password.length >= 12) score += 25
    else if (password.length >= 8) score += 15
    else improvements.push('Use at least 12 characters')

    // Character variety
    if (/[a-z]/.test(password)) score += 15
    else improvements.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 15
    else improvements.push('Include uppercase letters')

    if (/[0-9]/.test(password)) score += 15
    else improvements.push('Include numbers')

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20
    else improvements.push('Include special characters')

    // Common patterns check
    if (!/123|abc|password|qwerty/i.test(password)) score += 10
    else improvements.push('Avoid common patterns')

    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'

    return {
      name: 'Password Strength',
      score,
      maxScore: 100,
      status,
      icon: Lock,
      description: `Password strength: ${score}/100`,
      improvements
    }
  }

  // Calculate email security score
  const calculateEmailScore = (email: string): SecurityMetric => {
    if (!email) {
      return {
        name: 'Email Security',
        score: 0,
        maxScore: 100,
        status: 'poor',
        icon: Shield,
        description: 'No email entered',
        improvements: ['Enter an email address']
      }
    }

    let score = 0
    const improvements = []

    // Basic format check
    if (email.includes('@') && email.includes('.')) score += 30
    else improvements.push('Use valid email format')

    // Domain reputation
    const trustedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
    const domain = email.split('@')[1]?.toLowerCase()
    if (trustedDomains.includes(domain)) score += 25
    else if (domain) score += 15

    // Professional appearance
    if (!/\d{3,}/.test(email)) score += 20
    else improvements.push('Avoid excessive numbers')

    if (!email.includes('_') && !email.includes('.') && !email.includes('+')) score += 15
    else score += 10

    // Length and complexity
    if (email.length >= 10 && email.length <= 30) score += 10
    else improvements.push('Use appropriate email length')

    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'

    return {
      name: 'Email Security',
      score,
      maxScore: 100,
      status,
      icon: Shield,
      description: `Email security: ${score}/100`,
      improvements
    }
  }

  // Calculate device security score
  const calculateDeviceScore = (): SecurityMetric => {
    if (!deviceFingerprint) {
      return {
        name: 'Device Security',
        score: 50,
        maxScore: 100,
        status: 'fair',
        icon: Eye,
        description: 'Device analysis in progress',
        improvements: ['Complete device fingerprinting']
      }
    }

    let score = 0
    const improvements = []

    // Screen resolution (higher = more secure)
    const screenArea = deviceFingerprint.screen?.width * deviceFingerprint.screen?.height || 0
    if (screenArea >= 2073600) score += 20 // 1920x1080+
    else if (screenArea >= 1440000) score += 15 // 1200x1200+
    else score += 10

    // Hardware capabilities
    if (deviceFingerprint.hardware?.hardwareConcurrency >= 8) score += 20
    else if (deviceFingerprint.hardware?.hardwareConcurrency >= 4) score += 15
    else score += 10

    // Browser features
    if (deviceFingerprint.canvas) score += 15
    if (deviceFingerprint.webgl && deviceFingerprint.webgl !== 'WebGL not supported') score += 15
    if (deviceFingerprint.audio && deviceFingerprint.audio !== 'Audio not supported') score += 10

    // Font diversity
    if (deviceFingerprint.fonts?.length >= 20) score += 10
    else if (deviceFingerprint.fonts?.length >= 10) score += 5

    // Timezone consistency
    if (deviceFingerprint.timezone) score += 10

    if (score < 60) improvements.push('Update browser and enable hardware acceleration')
    if (score < 80) improvements.push('Use a more secure device configuration')

    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'

    return {
      name: 'Device Security',
      score,
      maxScore: 100,
      status,
      icon: Eye,
      description: `Device security: ${score}/100`,
      improvements
    }
  }

  // Calculate behavior score
  const calculateBehaviorScore = (): SecurityMetric => {
    if (!behaviorData) {
      return {
        name: 'Behavior Analysis',
        score: 70,
        maxScore: 100,
        status: 'good',
        icon: TrendingUp,
        description: 'Behavior analysis starting',
        improvements: []
      }
    }

    let score = 80 // Start with good baseline
    const improvements = []

    // Form completion time (too fast = suspicious)
    if (behaviorData.formCompletionTime < 30) {
      score -= 30
      improvements.push('Take time to carefully fill out the form')
    } else if (behaviorData.formCompletionTime < 60) {
      score -= 10
    }

    // Validation failures
    if (behaviorData.validationFailures > 5) {
      score -= 20
      improvements.push('Double-check your information before submitting')
    } else if (behaviorData.validationFailures > 2) {
      score -= 10
    }

    // Mouse movement patterns
    if (behaviorData.mouseMovements < 10) {
      score -= 15
      improvements.push('Natural mouse movement detected')
    }

    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'

    return {
      name: 'Behavior Analysis',
      score: Math.max(0, score),
      maxScore: 100,
      status,
      icon: TrendingUp,
      description: `Behavior score: ${Math.max(0, score)}/100`,
      improvements
    }
  }

  // Calculate threat assessment
  const calculateThreatAssessment = (metrics: SecurityMetric[]): ThreatAssessment => {
    const avgScore = metrics.reduce((sum, metric) => sum + (metric.score / metric.maxScore * 100), 0) / metrics.length
    const threats = []
    const recommendations = []

    if (avgScore < 40) {
      threats.push('High risk of account compromise')
      threats.push('Vulnerable to automated attacks')
      recommendations.push('Strengthen all security measures immediately')
      recommendations.push('Consider using a password manager')
      return { level: 'critical', score: avgScore, threats, recommendations }
    } else if (avgScore < 60) {
      threats.push('Moderate security vulnerabilities')
      threats.push('Potential for social engineering attacks')
      recommendations.push('Improve password complexity')
      recommendations.push('Use two-factor authentication when available')
      return { level: 'high', score: avgScore, threats, recommendations }
    } else if (avgScore < 80) {
      threats.push('Minor security gaps identified')
      recommendations.push('Consider additional security measures')
      return { level: 'medium', score: avgScore, threats, recommendations }
    } else {
      recommendations.push('Maintain current security practices')
      recommendations.push('Stay vigilant for new threats')
      return { level: 'low', score: avgScore, threats, recommendations }
    }
  }

  // Update security metrics in real-time
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = [
        calculatePasswordScore(formData.password || ''),
        calculateEmailScore(formData.email || ''),
        calculateDeviceScore(),
        calculateBehaviorScore()
      ]

      setMetrics(newMetrics)
      
      const avgScore = newMetrics.reduce((sum, metric) => sum + (metric.score / metric.maxScore * 100), 0) / newMetrics.length
      setOverallScore(avgScore)
      
      setThreatAssessment(calculateThreatAssessment(newMetrics))

      // Track security score changes (disabled in development)
      if (process.env.NODE_ENV !== 'development') {
        trackEvent('security_score_updated', {
          overallScore: avgScore,
          passwordScore: newMetrics[0].score,
          emailScore: newMetrics[1].score,
          deviceScore: newMetrics[2].score,
          behaviorScore: newMetrics[3].score,
          variant
        })
      }
    }

    updateMetrics()
    
    if (realTimeUpdates) {
      const interval = setInterval(updateMetrics, 2000)
      return () => clearInterval(interval)
    }
  }, [formData, deviceFingerprint, behaviorData, realTimeUpdates, variant])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'good': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'fair': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'poor': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`security-score-dashboard ${className}`}>
      {/* Overall Security Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-300/30 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-white">Security Score</span>
            <motion.div
              animate={{ rotate: realTimeUpdates ? 360 : 0 }}
              transition={{ duration: 2, repeat: realTimeUpdates ? Infinity : 0, ease: "linear" }}
            >
              <Zap className="h-4 w-4 text-yellow-400" />
            </motion.div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-green-300 hover:text-green-200 transition-colors"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={getScoreColor(overallScore)}
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(overallScore / 100) * 251.2} 251.2` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {Math.round(overallScore)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-white/80 mb-2">Overall Security Rating</div>
          {threatAssessment && (
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getThreatLevelColor(threatAssessment.level)}`}>
              <Target className="h-3 w-3" />
              {threatAssessment.level.toUpperCase()} RISK
            </div>
          )}
        </div>
      </motion.div>

      {/* Detailed Metrics */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mb-4"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <metric.icon className="h-4 w-4 text-white/60" />
                    <span className="text-sm font-medium text-white">{metric.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getScoreColor(metric.score).replace('text-', 'bg-')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(metric.score)}`}>
                    {metric.score}/{metric.maxScore}
                  </span>
                </div>
                
                <p className="text-xs text-white/60 mb-2">{metric.description}</p>
                
                {metric.improvements.length > 0 && (
                  <div className="space-y-1">
                    {metric.improvements.map((improvement, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                        <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                        <span>{improvement}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threat Assessment */}
      {threatAssessment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-300/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`h-5 w-5 ${getThreatLevelColor(threatAssessment.level)}`} />
            <span className="text-sm font-medium text-white">Threat Assessment</span>
            <Award className="h-4 w-4 text-purple-400" />
          </div>
          
          {threatAssessment.threats.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-white/60 mb-2">Identified Threats:</div>
              {threatAssessment.threats.map((threat, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-red-300 mb-1">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>{threat}</span>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <div className="text-xs text-white/60 mb-2">Recommendations:</div>
            {threatAssessment.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-green-300 mb-1">
                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Real-time Updates Toggle */}
      <div className="flex items-center justify-center mt-4">
        <button
          onClick={() => setRealTimeUpdates(!realTimeUpdates)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
            realTimeUpdates 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
        >
          <Zap className="h-3 w-3" />
          Real-time Updates {realTimeUpdates ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}
