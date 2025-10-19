'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, Eye, EyeOff, Check, X } from 'lucide-react'
import { formatDateInput, smartFormatDateInput, validateDateString } from '../utils/dateFormatter'

export interface ValidationRule {
  test: (value: string) => boolean
  message: string
  type: 'error' | 'warning' | 'info'
}

interface ValidationState {
  isValid: boolean
  errors: string[]
  warnings: string[]
  infos: string[]
}

interface EnhancedFormFieldProps {
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'date'
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  options?: Array<{ value: string; label: string }>
  validationRules?: ValidationRule[]
  helperText?: string
  maxLength?: number
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'numeric' | 'tel' | 'url'
  pattern?: string
  showPasswordToggle?: boolean
  realTimeValidation?: boolean
  className?: string
}

export default function EnhancedFormField({
  label,
  type,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  icon,
  options = [],
  validationRules = [],
  helperText,
  maxLength,
  autoComplete,
  inputMode,
  pattern,
  showPasswordToggle = false,
  realTimeValidation = true,
  className = ''
}: EnhancedFormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    infos: []
  })
  
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Handle input changes - let parent handle date formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Always pass through to parent onChange - don't interfere with existing logic
    onChange(e)
  }

  useEffect(() => {
    if (realTimeValidation && value) {
      validateField(value)
    } else if (!value) {
      setValidationState({
        isValid: true,
        errors: [],
        warnings: [],
        infos: []
      })
    }
  }, [value, validationRules, realTimeValidation])

  const validateField = (fieldValue: string) => {
    const errors: string[] = []
    const warnings: string[] = []
    const infos: string[] = []

    validationRules.forEach(rule => {
      if (!rule.test(fieldValue)) {
        switch (rule.type) {
          case 'error':
            errors.push(rule.message)
            break
          case 'warning':
            warnings.push(rule.message)
            break
          case 'info':
            infos.push(rule.message)
            break
        }
      }
    })

    setValidationState({
      isValid: errors.length === 0,
      errors,
      warnings,
      infos
    })
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsFocused(true)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
    if (value) validateField(value)
  }

  const getFieldState = () => {
    if (validationState.errors.length > 0) return 'error'
    if (validationState.warnings.length > 0) return 'warning'
    if (value && validationState.isValid) return 'success'
    return 'default'
  }

  const getFieldClasses = () => {
    const baseClasses = "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
    const state = getFieldState()
    
    switch (state) {
      case 'error':
        return `${baseClasses} bg-red-50 border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500`
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-300 text-yellow-900 focus:ring-yellow-500 focus:border-yellow-500`
      case 'success':
        return `${baseClasses} bg-green-50 border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500`
      default:
        return `${baseClasses} bg-white/90 backdrop-blur-sm border-white/30 text-gray-900 focus:ring-purple-500 focus:border-purple-500`
    }
  }

  const getIconColor = () => {
    const state = getFieldState()
    switch (state) {
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      case 'success': return 'text-green-500'
      default: return 'text-white/60'
    }
  }

  const renderValidationIcon = () => {
    const state = getFieldState()
    if (state === 'success') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <Check className="h-5 w-5 text-green-500" />
        </motion.div>
      )
    }
    if (state === 'error') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
        </motion.div>
      )
    }
    if (state === 'warning') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <Info className="h-5 w-5 text-yellow-500" />
        </motion.div>
      )
    }
    return null
  }

  const renderPasswordToggle = () => {
    if (type === 'password' && showPasswordToggle) {
      return (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )
    }
    return null
  }

  const renderInput = () => {
    const inputClasses = getFieldClasses()
    const rightPadding = (type === 'password' && showPasswordToggle) || getFieldState() !== 'default' ? 'pr-12' : 'pr-4'
    
    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={`${inputClasses} ${rightPadding}`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        pattern={pattern}
        className={`${inputClasses} ${rightPadding}`}
      />
    )
  }

  const renderValidationMessages = () => {
    const allMessages = [
      ...validationState.errors.map((msg: string) => ({ type: 'error' as const, message: msg })),
      ...validationState.warnings.map((msg: string) => ({ type: 'warning' as const, message: msg })),
      ...validationState.infos.map((msg: string) => ({ type: 'info' as const, message: msg }))
    ]

    if (allMessages.length === 0 && !helperText) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-2 space-y-1"
        >
          {helperText && !isFocused && allMessages.length === 0 && (
            <p className="text-sm text-white/60 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {helperText}
            </p>
          )}
          
          {allMessages.map((msg, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm flex items-center gap-2 ${
                msg.type === 'error' ? 'text-red-300' :
                msg.type === 'warning' ? 'text-yellow-300' :
                'text-blue-300'
              }`}
            >
              {msg.type === 'error' && <X className="h-4 w-4" />}
              {msg.type === 'warning' && <Info className="h-4 w-4" />}
              {msg.type === 'info' && <Info className="h-4 w-4" />}
              {msg.message}
            </motion.p>
          ))}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <motion.label
        className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${
          isFocused ? 'text-white' : 'text-white/80'
        }`}
        animate={{ color: isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.8)' }}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </motion.label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${getIconColor()}`}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        {renderInput()}

        {/* Validation Icon */}
        {renderValidationIcon()}

        {/* Password Toggle */}
        {renderPasswordToggle()}

        {/* Focus Ring Animation */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-xl border-2 border-purple-400 pointer-events-none"
              style={{ 
                boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.1)' 
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Validation Messages */}
      {renderValidationMessages()}

      {/* Character Count */}
      {maxLength && value && (
        <div className="text-right">
          <span className={`text-xs ${
            value.length > maxLength * 0.9 ? 'text-yellow-300' :
            value.length === maxLength ? 'text-red-300' :
            'text-white/60'
          }`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}
