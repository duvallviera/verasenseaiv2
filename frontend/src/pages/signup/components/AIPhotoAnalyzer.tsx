'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  Zap, 
  Star, 
  Award, 
  Eye, 
  Heart, 
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Target,
  Brain,
  Cpu,
  Image as ImageIcon,
  Scan,
  Palette
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface AIPhotoAnalyzerProps {
  onPhotoAnalyzed: (analysis: PhotoAnalysis) => void
  onPhotoSelected: (file: File, preview: string) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface PhotoAnalysis {
  attractivenessScore: number
  authenticityScore: number
  qualityScore: number
  emotionAnalysis: EmotionAnalysis
  faceAnalysis: FaceAnalysis
  backgroundAnalysis: BackgroundAnalysis
  recommendations: string[]
  warnings: string[]
  aiInsights: string[]
  overallRating: 'poor' | 'fair' | 'good' | 'excellent' | 'perfect'
  matchPotential: number
}

interface EmotionAnalysis {
  happiness: number
  confidence: number
  approachability: number
  trustworthiness: number
  dominantEmotion: string
}

interface FaceAnalysis {
  faceCount: number
  mainFaceClarity: number
  eyeContact: number
  smile: number
  lighting: number
  angle: number
}

interface BackgroundAnalysis {
  setting: string
  professionalism: number
  distraction: number
  colorHarmony: number
  composition: number
}

export default function AIPhotoAnalyzer({
  onPhotoAnalyzed,
  onPhotoSelected,
  variant,
  className = ''
}: AIPhotoAnalyzerProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const preview = URL.createObjectURL(file)
    setSelectedPhoto(preview)
    onPhotoSelected(file, preview)
    
    // Start AI analysis
    await analyzePhoto(file)
  }

  const analyzePhoto = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Load image for analysis
      const imageAnalysis = await performImageAnalysis(file)
      
      setAnalysis(imageAnalysis)
      onPhotoAnalyzed(imageAnalysis)
      
      trackEvent('ai_photo_analyzed', {
        attractivenessScore: imageAnalysis.attractivenessScore,
        authenticityScore: imageAnalysis.authenticityScore,
        qualityScore: imageAnalysis.qualityScore,
        overallRating: imageAnalysis.overallRating,
        variant
      })
      
    } catch (error) {
      console.error('Photo analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performImageAnalysis = async (file: File): Promise<PhotoAnalysis> => {
    // Simulate advanced AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        // Simulate AI analysis results
        const analysis: PhotoAnalysis = {
          attractivenessScore: Math.floor(Math.random() * 30) + 70, // 70-100
          authenticityScore: Math.floor(Math.random() * 20) + 80, // 80-100
          qualityScore: Math.floor(Math.random() * 25) + 75, // 75-100
          emotionAnalysis: {
            happiness: Math.floor(Math.random() * 30) + 70,
            confidence: Math.floor(Math.random() * 25) + 75,
            approachability: Math.floor(Math.random() * 35) + 65,
            trustworthiness: Math.floor(Math.random() * 20) + 80,
            dominantEmotion: ['happy', 'confident', 'friendly', 'approachable'][Math.floor(Math.random() * 4)]
          },
          faceAnalysis: {
            faceCount: 1,
            mainFaceClarity: Math.floor(Math.random() * 20) + 80,
            eyeContact: Math.floor(Math.random() * 30) + 70,
            smile: Math.floor(Math.random() * 40) + 60,
            lighting: Math.floor(Math.random() * 25) + 75,
            angle: Math.floor(Math.random() * 20) + 80
          },
          backgroundAnalysis: {
            setting: ['professional', 'casual', 'outdoor', 'indoor'][Math.floor(Math.random() * 4)],
            professionalism: Math.floor(Math.random() * 30) + 70,
            distraction: Math.floor(Math.random() * 40) + 20, // Lower is better
            colorHarmony: Math.floor(Math.random() * 25) + 75,
            composition: Math.floor(Math.random() * 30) + 70
          },
          recommendations: generateRecommendations(),
          warnings: generateWarnings(),
          aiInsights: generateAIInsights(),
          overallRating: 'excellent',
          matchPotential: Math.floor(Math.random() * 20) + 80
        }
        
        // Determine overall rating
        const avgScore = (analysis.attractivenessScore + analysis.authenticityScore + analysis.qualityScore) / 3
        if (avgScore >= 95) analysis.overallRating = 'perfect'
        else if (avgScore >= 85) analysis.overallRating = 'excellent'
        else if (avgScore >= 75) analysis.overallRating = 'good'
        else if (avgScore >= 65) analysis.overallRating = 'fair'
        else analysis.overallRating = 'poor'
        
        resolve(analysis)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const generateRecommendations = (): string[] => {
    const recommendations = [
      'Try smiling more naturally for better approachability',
      'Ensure good lighting on your face for clarity',
      'Consider a less cluttered background',
      'Make direct eye contact with the camera',
      'Use a higher resolution image for better quality',
      'Try a slight angle instead of straight-on pose',
      'Wear colors that complement your skin tone',
      'Ensure your face takes up 60-70% of the frame'
    ]
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2)
  }

  const generateWarnings = (): string[] => {
    const warnings = [
      'Multiple faces detected - use a solo photo',
      'Low image quality detected',
      'Face is too small in frame',
      'Poor lighting conditions',
      'Blurry or out of focus',
      'Sunglasses hiding eyes'
    ]
    
    return Math.random() > 0.7 ? warnings.slice(0, 1) : []
  }

  const generateAIInsights = (): string[] => {
    return [
      'Your photo shows high authenticity - great for building trust',
      'Excellent facial clarity will attract quality matches',
      'Your expression conveys confidence and approachability',
      'Professional background enhances overall impression'
    ]
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'perfect': return 'text-purple-400'
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'fair': return 'text-yellow-400'
      case 'poor': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'perfect': return Award
      case 'excellent': return Star
      case 'good': return CheckCircle
      case 'fair': return AlertTriangle
      case 'poor': return XCircle
      default: return Eye
    }
  }

  return (
    <div className={`ai-photo-analyzer ${className}`}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 backdrop-blur-sm border border-pink-300/30 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-pink-400" />
          <span className="text-sm font-medium text-white">AI Photo Analyzer</span>
          <Sparkles className="h-4 w-4 text-yellow-400" />
        </div>

        {/* Photo Upload Area */}
        {!selectedPhoto ? (
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-pink-400 bg-pink-500/10' 
                : 'border-white/30 hover:border-pink-400/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-pink-500/20 rounded-full">
                <Upload className="h-8 w-8 text-pink-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Upload Your Profile Photo
                </h3>
                <p className="text-sm text-white/70 mb-4">
                  Our AI will analyze your photo for maximum attractiveness and authenticity
                </p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Choose Photo
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo Preview */}
            <div className="relative">
              <img
                src={selectedPhoto}
                alt="Profile preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setSelectedPhoto(null)
                  setAnalysis(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Analysis Results */}
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="h-6 w-6 text-pink-400" />
                  </motion.div>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-pink-400 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-white/80">AI analyzing your photo...</span>
                </div>
              </div>
            ) : analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Overall Rating */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {React.createElement(getRatingIcon(analysis.overallRating), {
                      className: `h-6 w-6 ${getRatingColor(analysis.overallRating)}`
                    })}
                    <div>
                      <div className={`text-lg font-semibold ${getRatingColor(analysis.overallRating)}`}>
                        {analysis.overallRating.toUpperCase()} PHOTO
                      </div>
                      <div className="text-sm text-white/60">Overall AI Rating</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-400">
                      {analysis.matchPotential}%
                    </div>
                    <div className="text-xs text-white/60">Match Potential</div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-green-400">
                      {analysis.attractivenessScore}
                    </div>
                    <div className="text-xs text-white/60">Attractiveness</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">
                      {analysis.authenticityScore}
                    </div>
                    <div className="text-xs text-white/60">Authenticity</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">
                      {analysis.qualityScore}
                    </div>
                    <div className="text-xs text-white/60">Quality</div>
                  </div>
                </div>

                {/* Emotion Analysis */}
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-300/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Emotion Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Happiness:</span>
                      <span className="text-blue-300">{analysis.emotionAnalysis.happiness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Confidence:</span>
                      <span className="text-blue-300">{analysis.emotionAnalysis.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Approachable:</span>
                      <span className="text-blue-300">{analysis.emotionAnalysis.approachability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Trustworthy:</span>
                      <span className="text-blue-300">{analysis.emotionAnalysis.trustworthiness}%</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                {analysis.aiInsights.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-300/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">AI Insights</span>
                    </div>
                    {analysis.aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-purple-200 mb-2">
                        <Sparkles className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-300/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">Recommendations</span>
                    </div>
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-yellow-200 mb-2">
                        <TrendingUp className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {analysis.warnings.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-300/20">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-white">Warnings</span>
                    </div>
                    {analysis.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-red-200 mb-2">
                        <XCircle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Try Another Photo
                  </button>
                  <button
                    onClick={() => analyzePhoto(fileInputRef.current?.files?.[0]!)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Scan className="h-4 w-4" />
                    Re-analyze
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
