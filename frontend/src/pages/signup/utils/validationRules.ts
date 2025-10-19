import { ValidationRule } from '../components/EnhancedFormField'

export const createNameValidationRules = (fieldName: string): ValidationRule[] => [
  {
    test: (value) => value.length >= 2,
    message: `${fieldName} must be at least 2 characters long`,
    type: 'error'
  },
  {
    test: (value) => value.length <= 50,
    message: `${fieldName} must be less than 50 characters`,
    type: 'error'
  },
  {
    test: (value) => /^[a-zA-Z\s'-]+$/.test(value),
    message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    type: 'error'
  },
  {
    test: (value) => !/^\s|\s$/.test(value),
    message: `${fieldName} cannot start or end with spaces`,
    type: 'warning'
  }
]

export const createEmailValidationRules = (): ValidationRule[] => [
  {
    test: (value) => value.length > 0,
    message: 'Email address is required',
    type: 'error'
  },
  {
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
    type: 'error'
  },
  {
    test: (value) => value.length <= 254,
    message: 'Email address is too long',
    type: 'error'
  },
  {
    test: (value) => {
      const localPart = value.split('@')[0]
      return Boolean(localPart && localPart.length <= 64)
    },
    message: 'Email local part is too long',
    type: 'error'
  },
  {
    test: (value) => !/\.\.|^\.|\.$/.test(value.split('@')[0] || ''),
    message: 'Email format is invalid',
    type: 'error'
  },
  {
    test: (value) => {
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
      const domain = value.split('@')[1]
      return !domain || commonDomains.includes(domain.toLowerCase())
    },
    message: 'Consider using a common email provider for better deliverability',
    type: 'info'
  }
]

export const createNicknameValidationRules = (): ValidationRule[] => [
  {
    test: (value) => value.length >= 3,
    message: 'Nickname must be at least 3 characters long',
    type: 'error'
  },
  {
    test: (value) => value.length <= 20,
    message: 'Nickname must be less than 20 characters',
    type: 'error'
  },
  {
    test: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
    message: 'Nickname can only contain letters, numbers, underscores, and hyphens',
    type: 'error'
  },
  {
    test: (value) => !/^[0-9_-]/.test(value),
    message: 'Nickname must start with a letter',
    type: 'error'
  },
  {
    test: (value) => !/_{2,}|--/.test(value),
    message: 'Avoid consecutive underscores or hyphens',
    type: 'warning'
  },
  {
    test: (value) => {
    const inappropriate = ['admin', 'root', 'test', 'user', 'guest', 'null', 'undefined']
    return !inappropriate.includes(value.toLowerCase())
  },
    message: 'This nickname is not available',
    type: 'error'
  }
]

export const createPasswordValidationRules = (): ValidationRule[] => [
  {
    test: (value) => value.length >= 8,
    message: 'Password must be at least 8 characters long',
    type: 'error'
  },
  {
    test: (value) => value.length <= 128,
    message: 'Password is too long (max 128 characters)',
    type: 'error'
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: 'Password should contain at least one uppercase letter',
    type: 'warning'
  },
  {
    test: (value) => /[a-z]/.test(value),
    message: 'Password should contain at least one lowercase letter',
    type: 'warning'
  },
  {
    test: (value) => /\d/.test(value),
    message: 'Password should contain at least one number',
    type: 'warning'
  },
  {
    test: (value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
    message: 'Password should contain at least one special character',
    type: 'info'
  },
  {
    test: (value) => !/(.)\1{2,}/.test(value),
    message: 'Avoid repeating the same character more than twice',
    type: 'warning'
  },
  {
    test: (value) => {
      const common = ['password', '123456', 'qwerty', 'abc123', 'password123']
      return !common.some(common => value.toLowerCase().includes(common))
    },
    message: 'Avoid common password patterns',
    type: 'error'
  }
]

export const createPasswordConfirmValidationRules = (originalPassword: string): ValidationRule[] => [
  {
    test: (value) => value === originalPassword,
    message: 'Passwords do not match',
    type: 'error'
  },
  {
    test: (value) => value.length > 0,
    message: 'Please confirm your password',
    type: 'error'
  }
]

export const createDateOfBirthValidationRules = (): ValidationRule[] => [
  {
    test: (value) => {
      // Accept flexible formats: MM/DD/YYYY, M/D/YYYY, M/DD/YYYY, MM/D/YYYY
      // Also accept partial years that will be auto-completed
      return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)
    },
    message: 'Please use MM/DD/YYYY format (e.g., 01/15/1990, 1/15/90, or 12/5/1995)',
    type: 'error'
  },
  {
    test: (value) => {
      if (!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) return true
      
      let [month, day, yearStr] = value.split('/')
      let year = parseInt(yearStr)
      
      // Auto-complete 2-digit years
      if (yearStr.length === 2) {
        if (year <= 30) {
          year = 2000 + year // 00-30 = 2000-2030
        } else {
          year = 1900 + year // 31-99 = 1931-1999
        }
      } else if (yearStr.length === 3) {
        // Handle 3-digit years
        if (year >= 900) {
          year = 1000 + year // 900-999 = 1900-1999
        } else {
          year = 2000 + year // 000-899 = 2000-2899
        }
      }
      
      const monthNum = parseInt(month)
      const dayNum = parseInt(day)
      
      // Check if month and day are valid ranges
      if (monthNum < 1 || monthNum > 12) return false
      if (dayNum < 1 || dayNum > 31) return false
      
      // Create date and verify it's valid
      const date = new Date(year, monthNum - 1, dayNum)
      return date.getFullYear() === year && 
             date.getMonth() === monthNum - 1 && 
             date.getDate() === dayNum
    },
    message: 'Please enter a valid date (check month and day values)',
    type: 'error'
  },
  {
    test: (value) => {
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return true
      const [month, day, year] = value.split('/').map(Number)
      const birthDate = new Date(year, month - 1, day)
      const today = new Date()
      
      // Set time to start of day for accurate comparison
      today.setHours(23, 59, 59, 999)
      
      return birthDate <= today
    },
    message: 'Birth date cannot be in the future',
    type: 'error'
  },
  {
    test: (value) => {
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return true
      const [month, day, year] = value.split('/').map(Number)
      const birthDate = new Date(year, month - 1, day)
      const today = new Date()
      
      // Calculate age more accurately
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDifference = today.getMonth() - birthDate.getMonth()
      
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age >= 13
    },
    message: 'You must be at least 13 years old to register',
    type: 'error'
  },
  {
    test: (value) => {
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return true
      const [month, day, year] = value.split('/').map(Number)
      
      // Check reasonable year range
      const currentYear = new Date().getFullYear()
      return year >= (currentYear - 120) && year <= currentYear
    },
    message: 'Please enter a valid birth year',
    type: 'error'
  },
  {
    test: (value) => {
      if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return true
      const [month, day, year] = value.split('/').map(Number)
      const birthDate = new Date(year, month - 1, day)
      const today = new Date()
      
      // Calculate age
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDifference = today.getMonth() - birthDate.getMonth()
      
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age >= 18
    },
    message: 'Users under 18 will be directed to our social platform',
    type: 'info'
  }
]

export const createGenderValidationRules = (): ValidationRule[] => [
  {
    test: (value) => value.length > 0,
    message: 'Please select your gender',
    type: 'error'
  },
  {
    test: (value) => ['male', 'female', 'non-binary', 'prefer-not-to-say'].includes(value),
    message: 'Please select a valid gender option',
    type: 'error'
  }
]

// Utility function to get all validation rules for a field
export const getValidationRules = (fieldName: string, additionalData?: any): ValidationRule[] => {
  switch (fieldName) {
    case 'firstName':
      return createNameValidationRules('First name')
    case 'lastName':
      return createNameValidationRules('Last name')
    case 'email':
      return createEmailValidationRules()
    case 'nickname':
      return createNicknameValidationRules()
    case 'password':
      return createPasswordValidationRules()
    case 'confirmPassword':
      return createPasswordConfirmValidationRules(additionalData?.originalPassword || '')
    case 'dateOfBirth':
      return createDateOfBirthValidationRules()
    case 'gender':
      return createGenderValidationRules()
    default:
      return []
  }
}
