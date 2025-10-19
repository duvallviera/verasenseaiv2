/**
 * Date formatting utilities for signup forms
 */

/**
 * Formats date input as user types to MM/DD/YYYY format
 * @param value - The current input value
 * @returns Formatted date string
 */
export const formatDateInput = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')
  
  // Don't format if empty
  if (!digits) return ''
  
  // Format based on length
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  } else if (digits.length <= 6) {
    // Handle partial year (MM/DD/YY or MM/DD/YYY)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  } else {
    // Limit to 8 digits (MMDDYYYY)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }
}

/**
 * Smart year completion - converts 2-digit years to 4-digit years
 * @param yearStr - 2, 3, or 4 digit year string
 * @returns 4-digit year
 */
export const completeYear = (yearStr: string): string => {
  const year = parseInt(yearStr)
  
  if (yearStr.length === 4) {
    return yearStr // Already 4 digits
  } else if (yearStr.length === 2) {
    // Convert 2-digit year to 4-digit
    // Assume years 00-30 are 2000-2030, 31-99 are 1931-1999
    if (year <= 30) {
      return `20${yearStr}`
    } else {
      return `19${yearStr}`
    }
  } else if (yearStr.length === 3) {
    // 3-digit year - assume it's 19XX or 20XX
    if (year >= 900) {
      return `1${yearStr}` // 1900-1999
    } else {
      return `2${yearStr.padStart(3, '0')}` // 2000-2099
    }
  }
  
  return yearStr
}

/**
 * Enhanced date formatter that handles partial input and completes years
 * @param value - The current input value
 * @returns Formatted and completed date string
 */
export const smartFormatDateInput = (value: string): string => {
  // First apply basic formatting
  const formatted = formatDateInput(value)
  
  // If we have a complete date pattern, try to complete the year
  const parts = formatted.split('/')
  if (parts.length === 3 && parts[2].length >= 2 && parts[2].length < 4) {
    const completedYear = completeYear(parts[2])
    return `${parts[0]}/${parts[1]}/${completedYear}`
  }
  
  return formatted
}

/**
 * Validates if a date string is in correct format and is a valid date
 * @param dateString - Date string to validate
 * @returns Object with validation result and parsed date
 */
export const validateDateString = (dateString: string): {
  isValid: boolean
  date?: Date
  error?: string
} => {
  // Check format
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    return {
      isValid: false,
      error: 'Please use MM/DD/YYYY format'
    }
  }
  
  const [month, day, year] = dateString.split('/').map(Number)
  
  // Check ranges
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: 'Month must be between 1 and 12'
    }
  }
  
  if (day < 1 || day > 31) {
    return {
      isValid: false,
      error: 'Day must be between 1 and 31'
    }
  }
  
  const currentYear = new Date().getFullYear()
  if (year < (currentYear - 120) || year > currentYear) {
    return {
      isValid: false,
      error: 'Please enter a valid birth year'
    }
  }
  
  // Create date and check if it's valid
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    return {
      isValid: false,
      error: 'This date does not exist (e.g., February 30th)'
    }
  }
  
  // Check if date is not in the future
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (date > today) {
    return {
      isValid: false,
      error: 'Birth date cannot be in the future'
    }
  }
  
  return {
    isValid: true,
    date
  }
}

/**
 * Calculates age from a date string
 * @param dateString - Date string in MM/DD/YYYY format
 * @returns Age in years
 */
export const calculateAge = (dateString: string): number => {
  const validation = validateDateString(dateString)
  if (!validation.isValid || !validation.date) {
    return 0
  }
  
  const birthDate = validation.date
  const today = new Date()
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Formats a date for display (adds leading zeros)
 * @param dateString - Date string that might not have leading zeros
 * @returns Formatted date string with leading zeros
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    return dateString
  }
  
  const [month, day, year] = dateString.split('/')
  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`
}

/**
 * Provides helpful date format examples
 * @returns Array of example date formats
 */
export const getDateFormatExamples = (): string[] => {
  return [
    '01/15/1990',
    '1/15/1990',
    '12/31/1985',
    '3/5/1995'
  ]
}

/**
 * Gets the maximum date (today) for date input
 * @returns Today's date in YYYY-MM-DD format for HTML date input
 */
export const getMaxDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Gets the minimum reasonable date (120 years ago)
 * @returns Minimum date in YYYY-MM-DD format
 */
export const getMinDate = (): string => {
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 120)
  return minDate.toISOString().split('T')[0]
}
