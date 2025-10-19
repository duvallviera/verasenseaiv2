'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface VoiceGuidedSignupProps {
  currentStep: number
  currentField: string
  formData: Record<string, any>
  onVoiceCommand: (command: string, value?: string) => void
  onFieldValue: (field: string, value: string) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface VoiceState {
  isListening: boolean
  isProcessing: boolean
  lastTranscript: string
  confidence: number
  error: string | null
}

const VOICE_COMMANDS = {
  navigation: [
    'next field', 'previous field', 'next step', 'previous step',
    'submit form', 'go back', 'help me', 'repeat instructions'
  ],
  fieldCommands: {
    firstName: ['my first name is', 'first name', 'call me'],
    lastName: ['my last name is', 'last name', 'surname is'],
    email: ['my email is', 'email address', 'at gmail', 'at yahoo'],
    nickname: ['my nickname is', 'call me', 'username'],
    password: ['password is', 'my password', 'set password'],
    dateOfBirth: ['born on', 'birthday is', 'date of birth'],
    gender: ['i am male', 'i am female', 'gender is', 'i identify as']
  }
}

const FIELD_INSTRUCTIONS = {
  firstName: "Please say your first name. For example, say 'My first name is John'",
  lastName: "Please say your last name. For example, say 'My last name is Smith'",
  email: "Please say your email address. For example, say 'My email is john@gmail.com'",
  nickname: "Please say your preferred nickname. For example, say 'My nickname is Johnny'",
  password: "Please say your password. For example, say 'Password is secure123'",
  confirmPassword: "Please repeat your password to confirm it",
  dateOfBirth: "Please say your date of birth. For example, say 'Born on January 15th 1990'",
  gender: "Please say your gender. For example, say 'I am male' or 'I am female'"
}

export default function VoiceGuidedSignup({
  currentStep,
  currentField,
  formData,
  onVoiceCommand,
  onFieldValue,
  variant,
  className = ''
}: VoiceGuidedSignupProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    lastTranscript: '',
    confidence: 0,
    error: null
  })
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false)
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true)
  const [showMicrophoneModal, setShowMicrophoneModal] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    checkVoiceAvailability()
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (isVoiceEnabled && currentField) {
      speakFieldInstructions(currentField)
    }
  }, [currentField, isVoiceEnabled])

  const checkVoiceAvailability = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSpeechAvailable(true)
      synthRef.current = speechSynthesis
      
      trackEvent('voice_capability_detected', {
        page: 'signup',
        variant,
        platform: navigator.platform
      })
    } else {
      setIsSpeechAvailable(false)
      console.log('❌ Speech recognition not available')
    }
  }

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately after permission
      return true
    } catch (error) {
      console.error('❌ Microphone permission denied:', error)
      setVoiceState(prev => ({ ...prev, error: 'Microphone access denied' }))
      return false
    }
  }

  const startVoiceRecognition = async () => {
    if (!isSpeechAvailable) return

    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) {
      setShowMicrophoneModal(true)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 3

    setVoiceState(prev => ({ ...prev, isListening: true, error: null }))
    recognitionRef.current = recognition

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started for signup')
      speak('Voice guidance activated. I\'m listening for your input.')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript
          setVoiceState(prev => ({ 
            ...prev, 
            lastTranscript: transcript,
            confidence: confidence || 0
          }))
          
          processVoiceInput(transcript.toLowerCase().trim(), confidence || 0)
        } else {
          interimTranscript += transcript
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('❌ Voice recognition error:', event.error)
      setVoiceState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: getVoiceErrorMessage(event.error)
      }))
    }

    recognition.onend = () => {
      setVoiceState(prev => ({ ...prev, isListening: false }))
    }

    try {
      recognition.start()
      trackEvent('voice_recognition_started', {
        page: 'signup',
        variant,
        currentField,
        currentStep
      })
    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error)
      setVoiceState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: 'Failed to start voice recognition'
      }))
    }
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setVoiceState(prev => ({ ...prev, isListening: false }))
      speak('Voice guidance paused.')
    }
  }

  const processVoiceInput = (transcript: string, confidence: number) => {
    console.log('🎤 Processing voice input:', transcript, 'Confidence:', confidence)
    
    setVoiceState(prev => ({ ...prev, isProcessing: true }))

    // Check for navigation commands first
    if (VOICE_COMMANDS.navigation.some(cmd => transcript.includes(cmd))) {
      handleNavigationCommand(transcript)
      setVoiceState(prev => ({ ...prev, isProcessing: false }))
      return
    }

    // Process field-specific input
    const fieldValue = extractFieldValue(transcript, currentField)
    if (fieldValue) {
      onFieldValue(currentField, fieldValue)
      speak(`Got it! ${currentField} set to ${fieldValue}`)
      
      trackEvent('voice_field_completed', {
        field: currentField,
        confidence,
        transcript: transcript.substring(0, 50), // Truncated for privacy
        page: 'signup',
        variant
      })
    } else {
      speak(`I didn't understand that. ${FIELD_INSTRUCTIONS[currentField as keyof typeof FIELD_INSTRUCTIONS]}`)
    }

    setVoiceState(prev => ({ ...prev, isProcessing: false }))
  }

  const handleNavigationCommand = (transcript: string) => {
    if (transcript.includes('next field') || transcript.includes('next step')) {
      onVoiceCommand('next')
      speak('Moving to next field')
    } else if (transcript.includes('previous field') || transcript.includes('go back')) {
      onVoiceCommand('previous')
      speak('Going back to previous field')
    } else if (transcript.includes('submit form')) {
      onVoiceCommand('submit')
      speak('Submitting form')
    } else if (transcript.includes('help me') || transcript.includes('repeat instructions')) {
      speakFieldInstructions(currentField)
    }
  }

  const extractFieldValue = (transcript: string, field: string): string | null => {
    const fieldCommands = VOICE_COMMANDS.fieldCommands[field as keyof typeof VOICE_COMMANDS.fieldCommands]
    if (!fieldCommands) return null

    for (const command of fieldCommands) {
      if (transcript.includes(command)) {
        const value = transcript.split(command)[1]?.trim()
        if (value) {
          return cleanFieldValue(value, field)
        }
      }
    }

    // Special handling for different field types
    switch (field) {
      case 'email':
        const emailMatch = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)
        return emailMatch ? emailMatch[0] : null
      
      case 'dateOfBirth':
        return parseDateFromSpeech(transcript)
      
      case 'gender':
        if (transcript.includes('male') && !transcript.includes('female')) return 'male'
        if (transcript.includes('female')) return 'female'
        if (transcript.includes('non-binary') || transcript.includes('non binary')) return 'non-binary'
        return null
      
      default:
        // For name fields, try to extract after common phrases
        const namePatterns = ['my name is', 'call me', 'i am']
        for (const pattern of namePatterns) {
          if (transcript.includes(pattern)) {
            const name = transcript.split(pattern)[1]?.trim()
            if (name) return cleanFieldValue(name, field)
          }
        }
        return null
    }
  }

  const cleanFieldValue = (value: string, field: string): string => {
    // Remove common speech artifacts
    let cleaned = value
      .replace(/\b(um|uh|er|ah)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Field-specific cleaning
    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'nickname':
        return cleaned.split(' ')[0] // Take first word for names
      
      case 'email':
        return cleaned.replace(/\s/g, '') // Remove all spaces from email
      
      default:
        return cleaned
    }
  }

  const parseDateFromSpeech = (transcript: string): string | null => {
    // Simple date parsing - can be enhanced
    const datePatterns = [
      /(\w+)\s+(\d{1,2})\s*,?\s*(\d{4})/g, // "January 15, 1990"
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,     // "01/15/1990"
      /(\d{1,2})\s+(\d{1,2})\s+(\d{4})/g   // "1 15 1990"
    ]

    for (const pattern of datePatterns) {
      const match = pattern.exec(transcript)
      if (match) {
        // Convert to MM/DD/YYYY format
        return formatDateForForm(match)
      }
    }
    
    return null
  }

  const formatDateForForm = (match: RegExpExecArray): string => {
    // This is a simplified implementation
    // In production, you'd want more robust date parsing
    if (match.length >= 4) {
      const [, month, day, year] = match
      return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`
    }
    return ''
  }

  const speak = (text: string) => {
    if (!audioFeedbackEnabled || !synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8

    synthRef.current.speak(utterance)
  }

  const speakFieldInstructions = (field: string) => {
    const instruction = FIELD_INSTRUCTIONS[field as keyof typeof FIELD_INSTRUCTIONS]
    if (instruction) {
      speak(instruction)
    }
  }

  const getVoiceErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try speaking again.'
      case 'audio-capture':
        return 'Microphone not accessible. Please check your microphone settings.'
      case 'not-allowed':
        return 'Microphone access denied. Please enable microphone permissions.'
      case 'network':
        return 'Network error occurred. Please check your connection.'
      default:
        return 'Voice recognition error. Please try again.'
    }
  }

  // Always show the component, but indicate if speech is not available
  if (!isSpeechAvailable) {
    return (
      <div className={`${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-300/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MicOff className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-white">Voice Guidance</span>
            <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">Not Available</span>
          </div>
          <p className="text-sm text-white/60">
            Voice guidance requires a modern browser with speech recognition support. 
            The form will work normally without voice features.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Voice Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={isVoiceEnabled ? 
                (voiceState.isListening ? stopVoiceRecognition : startVoiceRecognition) :
                () => setIsVoiceEnabled(true)
              }
              className={`p-3 rounded-xl transition-all duration-300 ${
                voiceState.isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {voiceState.isListening ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </motion.button>

            <div>
              <p className="text-white font-medium text-sm">
                {voiceState.isListening ? 'Listening...' : 
                 voiceState.isProcessing ? 'Processing...' :
                 isVoiceEnabled ? 'Voice Ready' : 'Voice Guidance'}
              </p>
              {voiceState.lastTranscript && (
                <p className="text-white/60 text-xs">
                  "{voiceState.lastTranscript}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              {audioFeedbackEnabled ? (
                <Volume2 className="h-4 w-4 text-white" />
              ) : (
                <VolumeX className="h-4 w-4 text-white" />
              )}
            </button>

            <button
              onClick={() => speakFieldInstructions(currentField)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Voice Activity Indicator */}
        {voiceState.isListening && (
          <div className="mt-3 flex items-center gap-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-green-400 rounded-full"
                  animate={{ 
                    height: [4, 16, 4],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
            <span className="text-green-300 text-xs ml-2">
              Confidence: {Math.round(voiceState.confidence * 100)}%
            </span>
          </div>
        )}

        {/* Error Display */}
        {voiceState.error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-2 bg-red-500/20 border border-red-400/30 rounded-lg"
          >
            <p className="text-red-300 text-xs">{voiceState.error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Voice Commands Help */}
      {isVoiceEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-xs"
        >
          <p className="text-blue-300 font-medium mb-2">Voice Commands:</p>
          <div className="grid grid-cols-2 gap-2 text-blue-200">
            <div>"Next field" - Move forward</div>
            <div>"Go back" - Previous field</div>
            <div>"Help me" - Repeat instructions</div>
            <div>"Submit form" - Complete signup</div>
          </div>
        </motion.div>
      )}

      {/* Microphone Permission Modal */}
      <AnimatePresence>
        {showMicrophoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <Mic className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Microphone Access Needed
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  To use voice guidance, please allow microphone access in your browser settings and try again.
                </p>
                <button
                  onClick={() => setShowMicrophoneModal(false)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
