'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, User, Mail, Lock, Calendar } from 'lucide-react'

interface FormProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  completedFields?: Record<string, boolean>
  className?: string
}

const stepIcons = [
  { icon: User, label: 'Personal' },
  { icon: Mail, label: 'Contact' },
  { icon: Lock, label: 'Security' },
  { icon: Calendar, label: 'Details' }
]

export default function FormProgressIndicator({ 
  currentStep, 
  totalSteps, 
  completedFields = {},
  className = '' 
}: FormProgressIndicatorProps) {
  
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'upcoming'
  }

  const getStepProgress = (stepIndex: number) => {
    if (stepIndex < currentStep) return 100
    if (stepIndex === currentStep) {
      // Calculate progress based on completed fields for current step
      const stepFields = getFieldsForStep(stepIndex)
      const completedCount = stepFields.filter(field => completedFields[field]).length
      return stepFields.length > 0 ? (completedCount / stepFields.length) * 100 : 0
    }
    return 0
  }

  const getFieldsForStep = (stepIndex: number): string[] => {
    switch (stepIndex) {
      case 1: return ['firstName', 'lastName', 'nickname']
      case 2: return ['email']
      case 3: return ['password', 'confirmPassword']
      case 4: return ['dateOfBirth', 'gender', 'agreeToTerms']
      default: return []
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
        
        {/* Progress percentage */}
        <div className="text-right mt-1">
          <span className="text-xs text-white/60">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {stepIcons.map((step, index) => {
          const stepNumber = index + 1
          const status = getStepStatus(stepNumber)
          const progress = getStepProgress(stepNumber)
          const IconComponent = step.icon

          return (
            <div key={stepNumber} className="flex flex-col items-center">
              {/* Step Circle */}
              <motion.div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : status === 'current'
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'bg-white/20 border-white/40 text-white/60'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {status === 'completed' ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <IconComponent className="h-5 w-5" />
                )}
                
                {/* Progress ring for current step */}
                {status === 'current' && progress > 0 && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="2"
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 18 - (progress / 100) * 2 * Math.PI * 18 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                )}
              </motion.div>

              {/* Step Label */}
              <motion.span 
                className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  status === 'completed' || status === 'current'
                    ? 'text-white' 
                    : 'text-white/60'
                }`}
                animate={{ 
                  scale: status === 'current' ? 1.05 : 1,
                  fontWeight: status === 'current' ? 600 : 500
                }}
              >
                {step.label}
              </motion.span>

              {/* Step Number */}
              <span className="text-xs text-white/40 mt-1">
                {stepNumber}/{totalSteps}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current Step Description */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-4"
      >
        <p className="text-sm text-white/80">
          {getCurrentStepDescription(currentStep)}
        </p>
      </motion.div>
    </div>
  )
}

function getCurrentStepDescription(step: number): string {
  switch (step) {
    case 1:
      return "Let's start with your basic information"
    case 2:
      return "We'll need your email for account verification"
    case 3:
      return "Create a secure password to protect your account"
    case 4:
      return "Just a few more details to complete your profile"
    default:
      return "Complete your signup process"
  }
}
