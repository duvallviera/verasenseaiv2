'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, Shield } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

interface StrengthCheck {
  label: string
  test: (password: string) => boolean
  weight: number
}

export default function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const strengthChecks: StrengthCheck[] = [
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      weight: 25
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd),
      weight: 20
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd),
      weight: 20
    },
    {
      label: 'Contains number',
      test: (pwd) => /\d/.test(pwd),
      weight: 20
    },
    {
      label: 'Contains special character',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      weight: 15
    }
  ]

  const calculateStrength = () => {
    if (!password) return 0
    
    let score = 0
    strengthChecks.forEach(check => {
      if (check.test(password)) {
        score += check.weight
      }
    })
    
    return Math.min(score, 100)
  }

  const getStrengthLevel = (score: number) => {
    if (score >= 80) return { level: 'Very Strong', color: 'green', bgColor: 'bg-green-500' }
    if (score >= 60) return { level: 'Strong', color: 'blue', bgColor: 'bg-blue-500' }
    if (score >= 40) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-500' }
    if (score >= 20) return { level: 'Weak', color: 'orange', bgColor: 'bg-orange-500' }
    return { level: 'Very Weak', color: 'red', bgColor: 'bg-red-500' }
  }

  const strength = calculateStrength()
  const strengthInfo = getStrengthLevel(strength)
  const passedChecks = strengthChecks.filter(check => check.test(password))

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${className}`}
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">Password Strength</span>
          <span className={`text-sm font-semibold text-${strengthInfo.color}-300`}>
            {strengthInfo.level}
          </span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full ${strengthInfo.bgColor} transition-all duration-500`}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
          />
        </div>
        
        <div className="text-xs text-white/60 text-right">
          {strength}% secure
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Shield className="h-4 w-4" />
          <span>Security Requirements</span>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          {strengthChecks.map((check, index) => {
            const isPassed = check.test(password)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                  isPassed ? 'text-green-300' : 'text-white/50'
                }`}
              >
                <motion.div
                  animate={{ 
                    scale: isPassed ? 1 : 0.8,
                    rotate: isPassed ? 0 : 180 
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {isPassed ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 text-red-400" />
                  )}
                </motion.div>
                <span>{check.label}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Security Tips */}
      {strength < 60 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <p className="font-medium mb-1">Security Tip:</p>
              <p>
                {strength < 20 && "Try adding uppercase letters, numbers, and special characters."}
                {strength >= 20 && strength < 40 && "Add more character variety for better security."}
                {strength >= 40 && strength < 60 && "Almost there! Consider adding special characters."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {strength >= 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-green-500/10 border border-green-400/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-300 font-medium">
              Excellent! Your password is very secure.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
