'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Heart, Star, Zap, Volume2, RotateCcw, Check, X, Eye, EyeOff } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface IntelligentCaptchaProps {
  onVerificationComplete: (success: boolean, token: string) => void
  behaviorData?: any
  variant: 'desktop' | 'mobile'
  difficulty?: 'easy' | 'medium' | 'hard'
  className?: string
}

type CaptchaType = 'invisible' | 'gaming' | 'image' | 'audio' | 'math' | 'pattern'

interface CaptchaChallenge {
  type: CaptchaType
  question: string
  options?: string[]
  correctAnswer: string | number
  audioUrl?: string
  images?: string[]
  pattern?: any[] | any
}

interface BehaviorMetrics {
  mouseMovements: number
  keystrokes: number
  timeOnPage: number
  scrollBehavior: number
  clickPatterns: number
  suspicionScore: number
}

export default function IntelligentCaptcha({
  onVerificationComplete,
  behaviorData = {},
  variant,
  difficulty = 'medium',
  className = ''
}: IntelligentCaptchaProps) {
  const [currentChallenge, setCurrentChallenge] = useState<CaptchaChallenge | null>(null)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showChallenge, setShowChallenge] = useState(false)
  const [captchaType, setCaptchaType] = useState<CaptchaType>('invisible')
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [behaviorMetrics, setBehaviorMetrics] = useState<BehaviorMetrics>({
    mouseMovements: 0,
    keystrokes: 0,
    timeOnPage: 0,
    scrollBehavior: 0,
    clickPatterns: 0,
    suspicionScore: 0
  })

  const audioRef = useRef<HTMLAudioElement>(null)
  const startTimeRef = useRef<number>(Date.now())
  const mouseMovementsRef = useRef<number>(0)
  const keystrokesRef = useRef<number>(0)

  useEffect(() => {
    initializeBehaviorTracking()
    determineCaptchaRequirement()
    
    return () => {
      document.removeEventListener('mousemove', trackMouseMovement)
      document.removeEventListener('keydown', trackKeystrokes)
    }
  }, [])

  useEffect(() => {
    if (behaviorData) {
      const suspicionScore = calculateSuspicionScore(behaviorData)
      setBehaviorMetrics(prev => ({ ...prev, suspicionScore }))
    }
  }, [behaviorData])

  const initializeBehaviorTracking = () => {
    document.addEventListener('mousemove', trackMouseMovement)
    document.addEventListener('keydown', trackKeystrokes)
    
    // Track time on page
    const interval = setInterval(() => {
      const timeOnPage = (Date.now() - startTimeRef.current) / 1000
      setBehaviorMetrics(prev => ({ ...prev, timeOnPage }))
    }, 1000)

    return () => clearInterval(interval)
  }

  const trackMouseMovement = () => {
    mouseMovementsRef.current += 1
    setBehaviorMetrics(prev => ({ ...prev, mouseMovements: mouseMovementsRef.current }))
  }

  const trackKeystrokes = () => {
    keystrokesRef.current += 1
    setBehaviorMetrics(prev => ({ ...prev, keystrokes: keystrokesRef.current }))
  }

  const calculateSuspicionScore = (behavior: any): number => {
    let score = 0
    
    // Fast completion (suspicious)
    if (behavior.formCompletionTime && behavior.formCompletionTime < 30) {
      score += 30
    }
    
    // Too few mouse movements
    if (behaviorMetrics.mouseMovements < 10) {
      score += 25
    }
    
    // Unusual typing patterns
    if (behavior.typingSpeed && behavior.typingSpeed > 200) {
      score += 20
    }
    
    // VPN/Proxy detection (from device fingerprint)
    if (behavior.deviceFingerprint?.networkType === 'vpn') {
      score += 15
    }
    
    // Multiple failed validations
    if (behavior.validationFailures && behavior.validationFailures > 3) {
      score += 10
    }
    
    return Math.min(score, 100)
  }

  const determineCaptchaRequirement = () => {
    const suspicionScore = calculateSuspicionScore(behaviorData)
    
    if (suspicionScore < 20) {
      // Low suspicion - invisible CAPTCHA
      setCaptchaType('invisible')
      performInvisibleVerification()
    } else if (suspicionScore < 40) {
      // Medium suspicion - gaming challenge
      setCaptchaType('gaming')
      setShowChallenge(true)
      generateGamingChallenge()
    } else if (suspicionScore < 60) {
      // High suspicion - pattern or math
      setCaptchaType(Math.random() > 0.5 ? 'pattern' : 'math')
      setShowChallenge(true)
      generateChallenge()
    } else {
      // Very high suspicion - multiple challenges
      setCaptchaType('image')
      setShowChallenge(true)
      generateImageChallenge()
    }

    trackEvent('captcha_type_determined', {
      type: captchaType,
      suspicionScore,
      variant,
      page: 'signup'
    })
  }

  const performInvisibleVerification = async () => {
    setIsVerifying(true)
    
    // Analyze behavior patterns for invisible verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const isHuman = behaviorMetrics.mouseMovements > 5 && 
                   behaviorMetrics.timeOnPage > 10 &&
                   behaviorMetrics.suspicionScore < 30
    
    if (isHuman) {
      const token = generateVerificationToken()
      onVerificationComplete(true, token)
      
      trackEvent('invisible_captcha_success', {
        behaviorMetrics,
        variant,
        page: 'signup'
      })
    } else {
      // Fall back to visible challenge
      setCaptchaType('gaming')
      setShowChallenge(true)
      generateGamingChallenge()
    }
    
    setIsVerifying(false)
  }

  const generateGamingChallenge = () => {
    const challenges = [
      {
        type: 'gaming' as CaptchaType,
        question: 'Drag the heart to the pink area to continue',
        correctAnswer: 'heart_dropped',
        pattern: { targetColor: 'pink', shape: 'heart' }
      },
      {
        type: 'gaming' as CaptchaType,
        question: 'Click on all the stars to continue',
        correctAnswer: 'all_stars_clicked',
        pattern: { targets: ['star1', 'star2', 'star3'] }
      },
      {
        type: 'gaming' as CaptchaType,
        question: 'Match the colors by clicking the hearts in order: Red, Blue, Pink',
        correctAnswer: 'red,blue,pink',
        pattern: { sequence: ['red', 'blue', 'pink'] }
      }
    ]
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]
    setCurrentChallenge(challenge)
  }

  const generateImageChallenge = () => {
    const challenges = [
      {
        type: 'image' as CaptchaType,
        question: 'Select all images with genuine smiles',
        options: ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'],
        correctAnswer: 'image1,image3,image5',
        images: [
          '/captcha/smile1.jpg', '/captcha/smile2.jpg', '/captcha/smile3.jpg',
          '/captcha/smile4.jpg', '/captcha/smile5.jpg', '/captcha/smile6.jpg'
        ]
      },
      {
        type: 'image' as CaptchaType,
        question: 'Select all images with couples',
        options: ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'],
        correctAnswer: 'image2,image4,image6',
        images: [
          '/captcha/couple1.jpg', '/captcha/couple2.jpg', '/captcha/couple3.jpg',
          '/captcha/couple4.jpg', '/captcha/couple5.jpg', '/captcha/couple6.jpg'
        ]
      }
    ]
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]
    setCurrentChallenge(challenge)
  }

  const generateChallenge = () => {
    if (captchaType === 'math') {
      generateMathChallenge()
    } else if (captchaType === 'pattern') {
      generatePatternChallenge()
    } else if (captchaType === 'audio') {
      generateAudioChallenge()
    }
  }

  const generateMathChallenge = () => {
    const operations = ['+', '-', '×']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let num1, num2, answer
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = num1 + num2
        break
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 - num2
        break
      case '×':
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 * num2
        break
      default:
        num1 = 5
        num2 = 3
        answer = 8
    }
    
    setCurrentChallenge({
      type: 'math',
      question: `What is ${num1} ${operation} ${num2}?`,
      correctAnswer: answer
    })
  }

  const generatePatternChallenge = () => {
    const patterns = [
      {
        sequence: ['❤️', '⭐', '❤️', '⭐', '❤️', '?'],
        answer: '⭐',
        question: 'Complete the pattern'
      },
      {
        sequence: ['💜', '💙', '💚', '💛', '?'],
        answer: '🧡',
        question: 'What comes next in the color sequence?'
      },
      {
        sequence: ['1', '3', '5', '7', '?'],
        answer: '9',
        question: 'Complete the number sequence'
      }
    ]
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    setCurrentChallenge({
      type: 'pattern',
      question: pattern.question,
      correctAnswer: pattern.answer,
      pattern: pattern.sequence
    })
  }

  const generateAudioChallenge = () => {
    const words = ['love', 'heart', 'connect', 'match', 'date']
    const word = words[Math.floor(Math.random() * words.length)]
    
    setCurrentChallenge({
      type: 'audio',
      question: 'Type the word you hear',
      correctAnswer: word,
      audioUrl: `/captcha/audio/${word}.mp3`
    })
  }

  const handleAnswerSubmit = async () => {
    if (!currentChallenge) return
    
    setIsVerifying(true)
    setAttempts(prev => prev + 1)
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const isCorrect = checkAnswer(userAnswer, currentChallenge.correctAnswer)
    
    if (isCorrect) {
      const token = generateVerificationToken()
      onVerificationComplete(true, token)
      
      trackEvent('captcha_verification_success', {
        type: captchaType,
        attempts,
        variant,
        page: 'signup'
      })
    } else {
      if (attempts >= 3) {
        // Too many failed attempts - increase difficulty
        setCaptchaType('image')
        generateImageChallenge()
        setAttempts(0)
      } else {
        // Generate new challenge of same type
        generateChallenge()
      }
      
      trackEvent('captcha_verification_failed', {
        type: captchaType,
        attempts,
        variant,
        page: 'signup'
      })
    }
    
    setUserAnswer('')
    setIsVerifying(false)
  }

  const checkAnswer = (userAnswer: string, correctAnswer: string | number): boolean => {
    if (typeof correctAnswer === 'number') {
      return parseInt(userAnswer) === correctAnswer
    }
    
    return userAnswer.toLowerCase().trim() === correctAnswer.toString().toLowerCase()
  }

  const generateVerificationToken = (): string => {
    return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const playAudio = () => {
    if (audioRef.current && currentChallenge?.audioUrl) {
      setIsAudioPlaying(true)
      audioRef.current.play()
      audioRef.current.onended = () => setIsAudioPlaying(false)
    }
  }

  if (captchaType === 'invisible' && !showChallenge) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-center ${className}`}
      >
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-blue-300">
            <Shield className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Verifying you're human...</span>
          </div>
        )}
      </motion.div>
    )
  }

  if (!showChallenge || !currentChallenge) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Security Verification</h3>
        </div>

        <p className="text-white/80 mb-6">{currentChallenge.question}</p>

        {/* Gaming Challenge */}
        {captchaType === 'gaming' && (
          <GamingChallenge
            challenge={currentChallenge}
            onComplete={(success) => {
              if (success) {
                const token = generateVerificationToken()
                
                trackEvent('gaming_captcha_success', {
                  variant,
                  attempts,
                  page: 'signup'
                })
                
                // Reset states and complete
                setShowChallenge(false)
                setCurrentChallenge(null)
                onVerificationComplete(true, token)
              } else {
                setAttempts(prev => prev + 1)
                if (attempts >= 2) {
                  setCaptchaType('math')
                  generateMathChallenge()
                } else {
                  generateGamingChallenge()
                }
              }
            }}
          />
        )}

        {/* Math Challenge */}
        {captchaType === 'math' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-4 p-4 bg-white/20 rounded-lg inline-block">
                {currentChallenge.question}
              </div>
            </div>
            
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-center text-lg"
              placeholder="Enter your answer"
              onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
            />
          </div>
        )}

        {/* Pattern Challenge */}
        {captchaType === 'pattern' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-2xl mb-4">
              {currentChallenge.pattern?.map((item: any, index: number) => (
                <div key={index} className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-lg">
                  {item}
                </div>
              ))}
            </div>
            
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-center"
              placeholder="Enter the missing item"
              onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
            />
          </div>
        )}

        {/* Audio Challenge */}
        {captchaType === 'audio' && (
          <div className="space-y-4">
            <div className="text-center">
              <button
                onClick={playAudio}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                disabled={isAudioPlaying}
              >
                <Volume2 className="h-6 w-6 text-white" />
              </button>
              <p className="text-white/60 text-sm mt-2">Click to play audio</p>
            </div>
            
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-center"
              placeholder="Type what you hear"
              onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
            />
            
            {currentChallenge.audioUrl && (
              <audio ref={audioRef} src={currentChallenge.audioUrl} />
            )}
          </div>
        )}

        {/* Image Challenge */}
        {captchaType === 'image' && (
          <ImageCaptchaGrid
            challenge={currentChallenge}
            onComplete={(success) => {
              if (success) {
                const token = generateVerificationToken()
                onVerificationComplete(true, token)
              }
            }}
          />
        )}

        {/* Action Buttons */}
        {(captchaType === 'math' || captchaType === 'pattern' || captchaType === 'audio') && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => generateChallenge()}
              className="flex-1 px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Challenge
            </button>
            
            <button
              onClick={handleAnswerSubmit}
              disabled={!userAnswer || isVerifying}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Verify
            </button>
          </div>
        )}

        {/* Attempt Counter */}
        {attempts > 0 && (
          <div className="mt-4 text-center">
            <p className="text-yellow-300 text-sm">
              Attempt {attempts}/3
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Gaming Challenge Component
function GamingChallenge({ challenge, onComplete }: { challenge: CaptchaChallenge, onComplete: (success: boolean) => void }) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [clickedStars, setClickedStars] = useState<string[]>([])
  const [colorSequence, setColorSequence] = useState<string[]>([])

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item)
    setDraggedItem(item)
  }

  const handleDrop = (target: string, e: React.DragEvent) => {
    e.preventDefault()
    const draggedData = e.dataTransfer.getData('text/plain')
    
    if (draggedData === 'heart' && target === 'pink-zone' && !isCompleted) {
      setCompletedTasks(prev => [...prev, 'heart_dropped'])
      setIsCompleted(true)
      
      // Add visual feedback and delay before completing
      setTimeout(() => {
        onComplete(true)
      }, 500)
    }
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Click handlers for different challenge types
  const handleHeartClick = () => {
    if (!isCompleted) {
      setIsCompleted(true)
      setTimeout(() => {
        onComplete(true)
      }, 500)
    }
  }

  const handleStarClick = (starId: string) => {
    if (!clickedStars.includes(starId)) {
      const newClickedStars = [...clickedStars, starId]
      setClickedStars(newClickedStars)
      
      if (newClickedStars.length === 3) {
        setIsCompleted(true)
        setTimeout(() => {
          onComplete(true)
        }, 500)
      }
    }
  }

  const handleColorClick = (color: string) => {
    const newSequence = [...colorSequence, color]
    setColorSequence(newSequence)
    
    const targetSequence = ['red', 'blue', 'pink']
    if (newSequence.length === 3) {
      const isCorrect = newSequence.every((color, index) => color === targetSequence[index])
      if (isCorrect) {
        setIsCompleted(true)
        setTimeout(() => {
          onComplete(true)
        }, 500)
      } else {
        // Reset if wrong sequence
        setTimeout(() => {
          setColorSequence([])
        }, 1000)
      }
    }
  }

  // Render different challenge types
  if (challenge.pattern?.targetColor === 'pink') {
    // Heart drag/click challenge
    return (
      <div className="text-center space-y-4">
        <p className="text-white/80 text-sm mb-4">Drag the heart to the pink area or click it</p>
        <div className="flex justify-center gap-4 mb-6">
          <motion.div
            draggable
            onDragStart={(e: any) => handleDragStart(e, 'heart')}
            onDragEnd={handleDragEnd}
            onClick={handleHeartClick}
            className={`w-16 h-16 ${isCompleted ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 hover:scale-105`}
            whileTap={{ scale: 0.95 }}
            animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
          >
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        <div
          className={`w-32 h-32 ${isCompleted ? 'bg-green-500/30 border-green-400' : 'bg-pink-500/30 border-pink-400'} border-2 border-dashed rounded-xl mx-auto flex items-center justify-center transition-colors duration-300`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop('pink-zone', e)}
        >
          <span className={`${isCompleted ? 'text-green-300' : 'text-pink-300'} text-sm`}>
            {isCompleted ? '✓ Success!' : 'Drop here'}
          </span>
        </div>
      </div>
    )
  }

  if (challenge.pattern?.targets) {
    // Stars clicking challenge
    return (
      <div className="text-center space-y-4">
        <p className="text-white/80 text-sm mb-4">Click on all the stars ({clickedStars.length}/3)</p>
        <div className="flex justify-center gap-4">
          {['star1', 'star2', 'star3'].map((starId) => (
            <motion.div
              key={starId}
              onClick={() => handleStarClick(starId)}
              className={`w-16 h-16 ${clickedStars.includes(starId) ? 'bg-yellow-500' : 'bg-gray-500'} rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300`}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <Star className="h-8 w-8 text-white" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (challenge.pattern?.sequence) {
    // Color sequence challenge
    const colors = [
      { name: 'red', bg: 'bg-red-500', text: 'Red' },
      { name: 'blue', bg: 'bg-blue-500', text: 'Blue' },
      { name: 'pink', bg: 'bg-pink-500', text: 'Pink' }
    ]

    return (
      <div className="text-center space-y-4">
        <p className="text-white/80 text-sm mb-4">
          Click colors in order: Red, Blue, Pink ({colorSequence.length}/3)
        </p>
        <div className="flex justify-center gap-4 mb-4">
          {colors.map((color) => (
            <motion.div
              key={color.name}
              onClick={() => handleColorClick(color.name)}
              className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center cursor-pointer transition-all duration-300`}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white text-xs font-bold">{color.text}</span>
            </motion.div>
          ))}
        </div>
        <div className="text-sm text-white/60">
          Sequence: {colorSequence.join(' → ')}
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="text-center space-y-4">
      <p className="text-white/80 text-sm">Click the button to continue</p>
      <motion.button
        onClick={() => onComplete(true)}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        Continue
      </motion.button>
    </div>
  )
}

// Image CAPTCHA Grid Component
function ImageCaptchaGrid({ challenge, onComplete }: { challenge: CaptchaChallenge, onComplete: (success: boolean) => void }) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSubmit = () => {
    const correct = selectedImages.sort().join(',') === challenge.correctAnswer
    onComplete(correct)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {challenge.images?.map((image, index) => {
          const imageId = `image${index + 1}`
          const isSelected = selectedImages.includes(imageId)
          
          return (
            <motion.div
              key={imageId}
              onClick={() => toggleImageSelection(imageId)}
              className={`relative aspect-square bg-gray-300 rounded-lg cursor-pointer overflow-hidden ${
                isSelected ? 'ring-2 ring-purple-500' : ''
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <span className="text-gray-600 text-xs">Image {index + 1}</span>
              </div>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={selectedImages.length === 0}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verify Selection
      </button>
    </div>
  )
}
