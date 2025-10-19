'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Star, Crown, Zap, Lock, Award } from 'lucide-react'

interface SecurityLevelIndicatorProps {
  email: string
  phone: string
  variant: 'desktop' | 'mobile'
  className?: string
}

interface SecurityLevel {
  level: 'basic' | 'enhanced' | 'maximum' | 'legendary'
  score: number
  name: string
  description: string
  color: string
  bgColor: string
  icon: React.ComponentType<any>
  features: string[]
}

export default function SecurityLevelIndicator_new({
  email,
  phone,
  variant,
  className = ''
}: SecurityLevelIndicatorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const getSecurityLevel = (): SecurityLevel => {
    const hasEmail = email.trim().length > 0
    const hasPhone = phone.trim().length > 0
    
    if (hasEmail && hasPhone) {
      return {
        level: 'maximum',
        score: 95,
        name: 'Maximum Security',
        description: 'Military-grade protection with Email + SMS 2FA',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        icon: Crown,
        features: ['Email verification', 'SMS 2FA', 'Advanced fraud detection', 'Biometric enrollment']
      }
    } else if (hasEmail) {
      return {
        level: 'enhanced',
        score: 85,
        name: 'Enhanced Security',
        description: 'Advanced protection with email verification',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        icon: Shield,
        features: ['Email verification', 'AI fraud detection', 'Device tracking']
      }
    } else {
      return {
        level: 'basic',
        score: 65,
        name: 'Basic Security',
        description: 'Essential protection for your account',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        icon: Lock,
        features: ['Password protection', 'Basic validation']
      }
    }
  }

  const securityLevel = getSecurityLevel()
  const isMobile = variant === 'mobile'

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return (
      <div className={`security-level-indicator ${className}`}>
        <div className="p-4 rounded-xl border bg-blue-500/20 border-blue-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <div className="h-5 w-5 bg-blue-400 rounded"></div>
            </div>
            <div className="flex-1">
              <div className="h-4 bg-white/20 rounded mb-1"></div>
              <div className="h-3 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded mb-3"></div>
          <div className="space-y-1">
            <div className="h-3 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`security-level-indicator ${className}`}
    >
      <div className={`p-4 rounded-xl border transition-all duration-300 ${securityLevel.bgColor} border-current ${securityLevel.color}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${securityLevel.bgColor}`}>
            <securityLevel.icon className={`h-5 w-5 ${securityLevel.color}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className={`font-bold ${securityLevel.color}`}>
                {securityLevel.name}
              </h4>
              <div className={`px-2 py-1 rounded text-xs font-medium ${securityLevel.bgColor} ${securityLevel.color}`}>
                {securityLevel.score}/100
              </div>
            </div>
            <p className="text-white/70 text-sm">
              {securityLevel.description}
            </p>
          </div>
        </div>

        {/* Security Score Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Security Score</span>
            <span className="font-bold text-white">{securityLevel.score}/100</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${
                securityLevel.score >= 90 ? 'from-red-400 to-pink-400' :
                securityLevel.score >= 80 ? 'from-purple-400 to-indigo-400' :
                'from-blue-400 to-cyan-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${securityLevel.score}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-1">
          <div className="text-white/60 text-xs font-medium mb-2">
            Security Features:
          </div>
          
          {securityLevel.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 text-xs"
            >
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-white/80">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Upgrade Hint */}
        {securityLevel.level !== 'maximum' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-white/60">
                {!phone ? 'Add phone number for SMS 2FA and maximum security!' : 'Maximum security level achieved!'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Legendary Hint */}
        {securityLevel.level === 'maximum' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2 text-xs">
              <Award className="h-3 w-3 text-yellow-400" />
              <span className="text-yellow-300 font-medium">
                🎉 Legendary security unlocked after signup completion!
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
