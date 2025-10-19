// Advanced validation utilities for signup form

export interface ValidationResult {
  isValid: boolean
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
}

export interface PasswordStrength {
  score: number
  feedback: string[]
  type: 'weak' | 'medium' | 'strong'
}

// Email validation with comprehensive checks
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required', type: 'error' }
  }

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address', type: 'error' }
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
  const domain = email.split('@')[1]?.toLowerCase()
  
  // Check for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, message: 'Invalid email format', type: 'error' }
  }

  // Check for disposable email domains (basic list)
  const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com']
  if (disposableDomains.includes(domain)) {
    return { isValid: false, message: 'Disposable email addresses are not allowed', type: 'error' }
  }

  return { isValid: true, message: 'Email format is valid', type: 'success' }
}

// Nickname validation with availability check simulation
export const validateNickname = async (nickname: string): Promise<ValidationResult> => {
  if (!nickname) {
    return { isValid: false, message: 'Nickname is required', type: 'error' }
  }

  // Length check
  if (nickname.length < 3) {
    return { isValid: false, message: 'Nickname must be at least 3 characters', type: 'error' }
  }

  if (nickname.length > 20) {
    return { isValid: false, message: 'Nickname must be less than 20 characters', type: 'error' }
  }

  // Format check
  const nicknameRegex = /^[a-zA-Z0-9_]+$/
  if (!nicknameRegex.test(nickname)) {
    return { isValid: false, message: 'Only letters, numbers, and underscores allowed', type: 'error' }
  }

  // Check for inappropriate content (basic list)
  const inappropriateWords = ['admin', 'root', 'test', 'user', 'null', 'undefined']
  if (inappropriateWords.some(word => nickname.toLowerCase().includes(word))) {
    return { isValid: false, message: 'This nickname is not allowed', type: 'error' }
  }

  // Simulate availability check (in real app, this would be an API call)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simulate some nicknames being taken
  const takenNicknames = ['john123', 'admin', 'test', 'user123']
  if (takenNicknames.includes(nickname.toLowerCase())) {
    return { isValid: false, message: 'This nickname is already taken', type: 'error' }
  }

  return { isValid: true, message: 'Nickname is available', type: 'success' }
}

// Advanced password strength validation
export const validatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: ['Password is required'], type: 'weak' }
  }

  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Use at least 8 characters')
  }

  if (password.length >= 12) {
    score += 1
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add uppercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Add numbers')
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add special characters')
  }

  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) {
    score += 1
  } else {
    feedback.push('Avoid repeated characters')
  }

  // Common password checks
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon'
  ]
  
  if (!commonPasswords.includes(password.toLowerCase())) {
    score += 1
  } else {
    feedback.push('Avoid common passwords')
  }

  // Determine strength type
  let type: 'weak' | 'medium' | 'strong'
  if (score <= 3) {
    type = 'weak'
  } else if (score <= 6) {
    type = 'medium'
  } else {
    type = 'strong'
  }

  return { score, feedback, type }
}

// Name validation
export const validateName = (name: string, fieldName: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required`, type: 'error' }
  }

  if (name.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters`, type: 'error' }
  }

  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters`, type: 'error' }
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Only letters, spaces, hyphens, and apostrophes allowed', type: 'error' }
  }

  // Check for suspicious patterns
  if (/^\s|\s$/.test(name)) {
    return { isValid: false, message: 'Name cannot start or end with spaces', type: 'error' }
  }

  if (/\s{2,}/.test(name)) {
    return { isValid: false, message: 'Avoid multiple consecutive spaces', type: 'warning' }
  }

  return { isValid: true, message: `Valid ${fieldName.toLowerCase()}`, type: 'success' }
}

// Age validation
export const validateAge = (dateOfBirth: string): ValidationResult => {
  if (!dateOfBirth) {
    return { isValid: false, message: 'Date of birth is required', type: 'error' }
  }

  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date', type: 'error' }
  }

  // Check if date is in the future
  if (birthDate > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future', type: 'error' }
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  // Age restrictions
  if (age < 13) {
    return { isValid: false, message: 'You must be at least 13 years old to register', type: 'error' }
  }

  if (age < 18) {
    return { 
      isValid: true, 
      message: 'You will be directed to our teen-safe platform', 
      type: 'info' 
    }
  }

  if (age > 100) {
    return { isValid: false, message: 'Please enter a valid date of birth', type: 'error' }
  }

  return { isValid: true, message: 'Valid age', type: 'success' }
}

// Phone validation (optional field)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true, message: 'Phone number is optional', type: 'info' }
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Check length (US format)
  if (digitsOnly.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits', type: 'error' }
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Phone number is too long', type: 'error' }
  }

  // Basic format check
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(digitsOnly)) {
    return { isValid: false, message: 'Please enter a valid phone number', type: 'error' }
  }

  return { isValid: true, message: 'Valid phone number', type: 'success' }
}

// Comprehensive form validation
export const validateForm = (formData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Required fields
  const requiredFields = [
    'firstName', 'lastName', 'email', 'nickname', 
    'password', 'confirmPassword', 'dateOfBirth', 'gender'
  ]

  requiredFields.forEach(field => {
    if (!formData[field]) {
      errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`)
    }
  })

  // Password confirmation
  if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match')
  }

  // Terms agreement
  if (!formData.agreeToTerms) {
    errors.push('You must agree to the terms and conditions')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Debounce function for real-time validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
