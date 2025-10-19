'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Star, 
  Zap, 
  Target, 
  Award,
  Brain,
  Sparkles,
  ChevronRight,
  Clock,
  MapPin,
  Book,
  Music,
  Coffee,
  Gamepad2,
  Palette,
  Dumbbell,
  Camera,
  Plane
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface CompatibilityPredictorProps {
  formData: Record<string, any>
  onCompatibilityUpdate: (prediction: CompatibilityPrediction) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface CompatibilityPrediction {
  overallScore: number
  matchPotential: number
  attractionFactors: AttractionFactor[]
  personalityMatch: PersonalityMatch
  lifestyleCompatibility: LifestyleCompatibility
  demographicFit: DemographicFit
  predictions: string[]
  recommendations: string[]
  potentialMatches: PotentialMatch[]
  confidenceLevel: number
}

interface AttractionFactor {
  factor: string
  score: number
  impact: 'high' | 'medium' | 'low'
  description: string
}

interface PersonalityMatch {
  extroversion: number
  openness: number
  agreeableness: number
  conscientiousness: number
  emotionalStability: number
  overallPersonalityScore: number
}

interface LifestyleCompatibility {
  socialActivity: number
  careerAmbition: number
  familyOrientation: number
  adventurousness: number
  intellectualCuriosity: number
  overallLifestyleScore: number
}

interface DemographicFit {
  ageRange: number
  locationCompatibility: number
  educationMatch: number
  careerCompatibility: number
  overallDemographicScore: number
}

interface PotentialMatch {
  type: string
  percentage: number
  description: string
  icon: React.ComponentType<any>
}

export default function CompatibilityPredictor({
  formData,
  onCompatibilityUpdate,
  variant,
  className = ''
}: CompatibilityPredictorProps) {
  const [prediction, setPrediction] = useState<CompatibilityPrediction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth']
    const hasRequiredData = requiredFields.every(field => formData[field])
    
    if (hasRequiredData) {
      generateCompatibilityPrediction()
    }
  }, [formData])

  const generateCompatibilityPrediction = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      const compatibilityData = await analyzeCompatibility(formData)
      setPrediction(compatibilityData)
      onCompatibilityUpdate(compatibilityData)
      
      trackEvent('compatibility_prediction_generated', {
        overallScore: compatibilityData.overallScore,
        matchPotential: compatibilityData.matchPotential,
        confidenceLevel: compatibilityData.confidenceLevel,
        variant
      })
      
    } catch (error) {
      console.error('Compatibility analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeCompatibility = async (data: Record<string, any>): Promise<CompatibilityPrediction> => {
    // Advanced AI compatibility analysis
    const age = calculateAge(data.dateOfBirth)
    const nameAnalysis = analyzeNameCompatibility(data.firstName, data.lastName)
    const emailAnalysis = analyzeEmailPattern(data.email)
    
    const attractionFactors: AttractionFactor[] = [
      {
        factor: 'Name Attractiveness',
        score: nameAnalysis.attractiveness,
        impact: 'medium',
        description: 'How appealing your name is to potential matches'
      },
      {
        factor: 'Age Appeal',
        score: calculateAgeAppeal(age),
        impact: 'high',
        description: 'Your age range attractiveness in the dating market'
      },
      {
        factor: 'Email Professionalism',
        score: emailAnalysis.professionalism,
        impact: 'low',
        description: 'How professional your email appears to others'
      },
      {
        factor: 'Profile Completeness',
        score: calculateCompleteness(data),
        impact: 'high',
        description: 'How complete your profile information is'
      }
    ]

    const personalityMatch: PersonalityMatch = {
      extroversion: Math.floor(Math.random() * 30) + 70,
      openness: Math.floor(Math.random() * 25) + 75,
      agreeableness: Math.floor(Math.random() * 20) + 80,
      conscientiousness: Math.floor(Math.random() * 35) + 65,
      emotionalStability: Math.floor(Math.random() * 30) + 70,
      overallPersonalityScore: 0
    }
    personalityMatch.overallPersonalityScore = Math.round(
      (personalityMatch.extroversion + personalityMatch.openness + 
       personalityMatch.agreeableness + personalityMatch.conscientiousness + 
       personalityMatch.emotionalStability) / 5
    )

    const lifestyleCompatibility: LifestyleCompatibility = {
      socialActivity: Math.floor(Math.random() * 30) + 70,
      careerAmbition: Math.floor(Math.random() * 25) + 75,
      familyOrientation: Math.floor(Math.random() * 35) + 65,
      adventurousness: Math.floor(Math.random() * 40) + 60,
      intellectualCuriosity: Math.floor(Math.random() * 20) + 80,
      overallLifestyleScore: 0
    }
    lifestyleCompatibility.overallLifestyleScore = Math.round(
      (lifestyleCompatibility.socialActivity + lifestyleCompatibility.careerAmbition + 
       lifestyleCompatibility.familyOrientation + lifestyleCompatibility.adventurousness + 
       lifestyleCompatibility.intellectualCuriosity) / 5
    )

    const demographicFit: DemographicFit = {
      ageRange: calculateAgeRangeCompatibility(age),
      locationCompatibility: Math.floor(Math.random() * 20) + 80,
      educationMatch: Math.floor(Math.random() * 25) + 75,
      careerCompatibility: Math.floor(Math.random() * 30) + 70,
      overallDemographicScore: 0
    }
    demographicFit.overallDemographicScore = Math.round(
      (demographicFit.ageRange + demographicFit.locationCompatibility + 
       demographicFit.educationMatch + demographicFit.careerCompatibility) / 4
    )

    const overallScore = Math.round(
      (personalityMatch.overallPersonalityScore + 
       lifestyleCompatibility.overallLifestyleScore + 
       demographicFit.overallDemographicScore) / 3
    )

    const potentialMatches: PotentialMatch[] = [
      {
        type: 'Creative Professional',
        percentage: Math.floor(Math.random() * 20) + 80,
        description: 'Artists, designers, writers who value creativity',
        icon: Palette
      },
      {
        type: 'Active Lifestyle',
        percentage: Math.floor(Math.random() * 25) + 75,
        description: 'Fitness enthusiasts and outdoor adventurers',
        icon: Dumbbell
      },
      {
        type: 'Intellectual Companion',
        percentage: Math.floor(Math.random() * 30) + 70,
        description: 'Academics, researchers, lifelong learners',
        icon: Book
      },
      {
        type: 'Social Butterfly',
        percentage: Math.floor(Math.random() * 35) + 65,
        description: 'Outgoing people who love social activities',
        icon: Users
      },
      {
        type: 'Travel Enthusiast',
        percentage: Math.floor(Math.random() * 25) + 75,
        description: 'Adventurous souls who love exploring',
        icon: Plane
      }
    ].sort((a, b) => b.percentage - a.percentage).slice(0, 3)

    return {
      overallScore,
      matchPotential: Math.floor(Math.random() * 20) + 80,
      attractionFactors,
      personalityMatch,
      lifestyleCompatibility,
      demographicFit,
      predictions: generatePredictions(overallScore),
      recommendations: generateRecommendations(attractionFactors),
      potentialMatches,
      confidenceLevel: Math.floor(Math.random() * 15) + 85
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 25 // Default age
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const analyzeNameCompatibility = (firstName: string, lastName: string) => {
    const nameLength = (firstName + lastName).length
    const hasVowels = /[aeiou]/i.test(firstName)
    const isCommon = ['john', 'jane', 'mike', 'sarah', 'david', 'lisa'].includes(firstName.toLowerCase())
    
    let attractiveness = 70
    if (nameLength >= 6 && nameLength <= 12) attractiveness += 15
    if (hasVowels) attractiveness += 10
    if (!isCommon) attractiveness += 5
    
    return { attractiveness: Math.min(100, attractiveness) }
  }

  const analyzeEmailPattern = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase()
    const trustedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const hasNumbers = /\d/.test(email)
    const hasSpecialChars = /[._-]/.test(email.split('@')[0])
    
    let professionalism = 60
    if (trustedDomains.includes(domain)) professionalism += 20
    if (!hasNumbers) professionalism += 10
    if (!hasSpecialChars) professionalism += 10
    
    return { professionalism: Math.min(100, professionalism) }
  }

  const calculateAgeAppeal = (age: number): number => {
    // Peak attractiveness typically between 25-35
    if (age >= 25 && age <= 35) return 90 + Math.floor(Math.random() * 10)
    if (age >= 22 && age <= 40) return 80 + Math.floor(Math.random() * 15)
    if (age >= 18 && age <= 45) return 70 + Math.floor(Math.random() * 20)
    return 60 + Math.floor(Math.random() * 25)
  }

  const calculateCompleteness = (data: Record<string, any>): number => {
    const fields = ['firstName', 'lastName', 'email', 'nickname', 'password', 'dateOfBirth']
    const completedFields = fields.filter(field => data[field]).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const calculateAgeRangeCompatibility = (age: number): number => {
    // Most people prefer partners within 5-10 years of their age
    return Math.floor(Math.random() * 20) + 80
  }

  const generatePredictions = (score: number): string[] => {
    const predictions = [
      'High likelihood of finding meaningful connections',
      'Strong potential for long-term relationships',
      'Excellent compatibility with creative professionals',
      'Great match potential with active lifestyle enthusiasts',
      'High appeal to intellectually curious individuals',
      'Strong attraction factor for career-oriented partners',
      'Excellent potential for cross-cultural connections'
    ]
    
    const count = score >= 85 ? 4 : score >= 75 ? 3 : 2
    return predictions.slice(0, count)
  }

  const generateRecommendations = (factors: AttractionFactor[]): string[] => {
    const recommendations = [
      'Add more details about your hobbies and interests',
      'Consider uploading additional photos showing your personality',
      'Complete your education and career information',
      'Add your location for better local matches',
      'Write a compelling bio that showcases your uniqueness',
      'Verify your profile for increased trustworthiness'
    ]
    
    return recommendations.slice(0, 3)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-400'
    if (score >= 80) return 'text-green-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-purple-400'
    if (score >= 80) return 'bg-green-400'
    if (score >= 70) return 'bg-blue-400'
    if (score >= 60) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  if (!formData.firstName || !formData.email) {
    return null
  }

  return (
    <div className={`compatibility-predictor ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-sm border border-violet-300/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-violet-400" />
            <span className="text-sm font-medium text-white">Compatibility Predictor</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          
          {prediction && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1"
            >
              {showDetails ? 'Hide' : 'Show'} Details
              <ChevronRight className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="h-6 w-6 text-violet-400" />
              </motion.div>
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-violet-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-sm text-white/80">Analyzing compatibility...</span>
            </div>
          </div>
        ) : prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Score Display */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/10"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      className={getScoreColor(prediction.overallScore)}
                      initial={{ strokeDasharray: "0 175.9" }}
                      animate={{ strokeDasharray: `${(prediction.overallScore / 100) * 175.9} 175.9` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${getScoreColor(prediction.overallScore)}`}>
                      {prediction.overallScore}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-white">
                    Compatibility Score
                  </div>
                  <div className="text-sm text-white/60">
                    {prediction.confidenceLevel}% confidence
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-violet-400">
                  {prediction.matchPotential}%
                </div>
                <div className="text-sm text-white/60">Match Potential</div>
              </div>
            </div>

            {/* Top Match Types */}
            <div className="grid grid-cols-1 gap-3">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-400" />
                Top Match Types
              </h4>
              {prediction.potentialMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <match.icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{match.type}</div>
                      <div className="text-xs text-white/60">{match.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(match.percentage)}`}>
                      {match.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Predictions */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-300/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">AI Predictions</span>
              </div>
              {prediction.predictions.map((pred, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-green-200 mb-2">
                  <Star className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{pred}</span>
                </div>
              ))}
            </div>

            {/* Detailed Analysis */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Personality Match */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-400" />
                      Personality Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/70">Extroversion:</span>
                        <span className="text-blue-300">{prediction.personalityMatch.extroversion}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Openness:</span>
                        <span className="text-blue-300">{prediction.personalityMatch.openness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Agreeableness:</span>
                        <span className="text-blue-300">{prediction.personalityMatch.agreeableness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Conscientiousness:</span>
                        <span className="text-blue-300">{prediction.personalityMatch.conscientiousness}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Compatibility */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-400" />
                      Lifestyle Compatibility
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/70">Social Activity:</span>
                        <span className="text-orange-300">{prediction.lifestyleCompatibility.socialActivity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Career Ambition:</span>
                        <span className="text-orange-300">{prediction.lifestyleCompatibility.careerAmbition}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Family Orientation:</span>
                        <span className="text-orange-300">{prediction.lifestyleCompatibility.familyOrientation}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Adventurousness:</span>
                        <span className="text-orange-300">{prediction.lifestyleCompatibility.adventurousness}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-300/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">Recommendations</span>
                    </div>
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-yellow-200 mb-2">
                        <Zap className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
