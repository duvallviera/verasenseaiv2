'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Vibrate, 
  Battery, 
  Wifi, 
  Signal, 
  Camera, 
  Fingerprint,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Lightbulb
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface MobileEnhancementSuiteProps {
  currentStep: number
  formData: Record<string, any>
  onOptimizationApplied: (optimization: string) => void
  className?: string
}

interface MobileOptimization {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: 'available' | 'applied' | 'unavailable'
  benefit: string
  action: () => void
}

interface DeviceCapabilities {
  touchSupport: boolean
  orientationSupport: boolean
  vibrationSupport: boolean
  cameraSupport: boolean
  biometricSupport: boolean
  batteryAPI: boolean
  networkInfo: boolean
}

export default function MobileEnhancementSuite({
  currentStep,
  formData,
  onOptimizationApplied,
  className = ''
}: MobileEnhancementSuiteProps) {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    touchSupport: false,
    orientationSupport: false,
    vibrationSupport: false,
    cameraSupport: false,
    biometricSupport: false,
    batteryAPI: false,
    networkInfo: false
  })
  
  const [optimizations, setOptimizations] = useState<MobileOptimization[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([])

  // Detect device capabilities
  useEffect(() => {
    const detectCapabilities = async () => {
      const capabilities: DeviceCapabilities = {
        touchSupport: 'ontouchstart' in window,
        orientationSupport: 'orientation' in window,
        vibrationSupport: 'vibrate' in navigator,
        cameraSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        biometricSupport: !!(window as any).PublicKeyCredential,
        batteryAPI: 'getBattery' in navigator,
        networkInfo: 'connection' in navigator
      }

      setDeviceCapabilities(capabilities)
      generateOptimizations(capabilities)
    }

    detectCapabilities()
  }, [])

  const generateOptimizations = (capabilities: DeviceCapabilities): void => {
    const opts: MobileOptimization[] = []

    // Touch Optimization
    if (capabilities.touchSupport) {
      opts.push({
        id: 'touch-optimization',
        name: 'Touch Optimization',
        description: 'Optimize touch targets and gestures for better mobile interaction',
        icon: Smartphone,
        status: 'available',
        benefit: 'Improved touch accuracy and gesture recognition',
        action: () => applyTouchOptimization()
      })
    }

    // Haptic Feedback
    if (capabilities.vibrationSupport) {
      opts.push({
        id: 'haptic-feedback',
        name: 'Haptic Feedback',
        description: 'Add tactile feedback for form interactions and confirmations',
        icon: Vibrate,
        status: 'available',
        benefit: 'Enhanced user feedback and accessibility',
        action: () => applyHapticFeedback()
      })
    }

    // Camera Enhancement
    if (capabilities.cameraSupport) {
      opts.push({
        id: 'camera-enhancement',
        name: 'Camera Enhancement',
        description: 'Optimize camera access for profile photos and verification',
        icon: Camera,
        status: 'available',
        benefit: 'Seamless photo capture and processing',
        action: () => applyCameraEnhancement()
      })
    }

    // Biometric Integration
    if (capabilities.biometricSupport) {
      opts.push({
        id: 'biometric-integration',
        name: 'Advanced Biometrics',
        description: 'Enhanced biometric authentication with platform-specific optimizations',
        icon: Fingerprint,
        status: 'available',
        benefit: 'Faster and more secure authentication',
        action: () => applyBiometricIntegration()
      })
    }

    // Battery Optimization
    if (capabilities.batteryAPI) {
      opts.push({
        id: 'battery-optimization',
        name: 'Battery Optimization',
        description: 'Reduce power consumption during signup process',
        icon: Battery,
        status: 'available',
        benefit: 'Extended battery life during registration',
        action: () => applyBatteryOptimization()
      })
    }

    // Network Optimization
    if (capabilities.networkInfo) {
      opts.push({
        id: 'network-optimization',
        name: 'Network Optimization',
        description: 'Adapt to network conditions for optimal performance',
        icon: Wifi,
        status: 'available',
        benefit: 'Faster loading on slow connections',
        action: () => applyNetworkOptimization()
      })
    }

    setOptimizations(opts)
  }

  const applyTouchOptimization = () => {
    // Increase touch target sizes
    document.documentElement.style.setProperty('--touch-target-min', '44px')
    
    // Add touch-friendly spacing
    const formElements = document.querySelectorAll('input, button, select')
    formElements.forEach(element => {
      (element as HTMLElement).style.minHeight = '44px'
      ;(element as HTMLElement).style.padding = '12px 16px'
    })

    markOptimizationApplied('touch-optimization')
    trackEvent('mobile_optimization_applied', { type: 'touch', step: currentStep })
  }

  const applyHapticFeedback = () => {
    // Add haptic feedback to form interactions
    const addHapticToElement = (selector: string, pattern: number[]) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        element.addEventListener('click', () => {
          if (navigator.vibrate) {
            navigator.vibrate(pattern)
          }
        })
      })
    }

    addHapticToElement('button[type="submit"]', [100, 50, 100]) // Success pattern
    addHapticToElement('input', [25]) // Light tap for inputs
    addHapticToElement('.error', [200, 100, 200]) // Error pattern

    markOptimizationApplied('haptic-feedback')
    trackEvent('mobile_optimization_applied', { type: 'haptic', step: currentStep })
  }

  const applyCameraEnhancement = () => {
    // Optimize camera settings for profile photos
    const cameraConfig = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
        frameRate: { ideal: 30 }
      }
    }

    // Store optimized camera config globally
    ;(window as any).optimizedCameraConfig = cameraConfig

    markOptimizationApplied('camera-enhancement')
    trackEvent('mobile_optimization_applied', { type: 'camera', step: currentStep })
  }

  const applyBiometricIntegration = () => {
    // Enhanced biometric configuration
    const biometricConfig = {
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'direct'
    }

    ;(window as any).enhancedBiometricConfig = biometricConfig

    markOptimizationApplied('biometric-integration')
    trackEvent('mobile_optimization_applied', { type: 'biometric', step: currentStep })
  }

  const applyBatteryOptimization = () => {
    // Reduce animation frequency on low battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          document.documentElement.classList.add('low-battery-mode')
          
          // Reduce animation duration
          document.documentElement.style.setProperty('--animation-duration', '0.1s')
        }
      })
    }

    markOptimizationApplied('battery-optimization')
    trackEvent('mobile_optimization_applied', { type: 'battery', step: currentStep })
  }

  const applyNetworkOptimization = () => {
    // Adapt to network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Disable heavy animations and reduce image quality
        document.documentElement.classList.add('slow-network-mode')
        document.documentElement.style.setProperty('--image-quality', '0.7')
      }
    }

    markOptimizationApplied('network-optimization')
    trackEvent('mobile_optimization_applied', { type: 'network', step: currentStep })
  }

  const markOptimizationApplied = (optimizationId: string) => {
    setAppliedOptimizations(prev => [...prev, optimizationId])
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === optimizationId 
          ? { ...opt, status: 'applied' as const }
          : opt
      )
    )
    onOptimizationApplied(optimizationId)
  }

  const applyAllOptimizations = () => {
    optimizations
      .filter(opt => opt.status === 'available')
      .forEach(opt => opt.action())
    
    trackEvent('mobile_optimization_bulk_applied', {
      count: optimizations.filter(opt => opt.status === 'available').length,
      step: currentStep
    })
  }

  const getOptimizationStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-green-400'
      case 'available': return 'text-blue-400'
      case 'unavailable': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getOptimizationStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return CheckCircle
      case 'available': return Zap
      case 'unavailable': return AlertCircle
      default: return Eye
    }
  }

  if (optimizations.length === 0) {
    return null
  }

  return (
    <div className={`mobile-enhancement-suite ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-300/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium text-white">Mobile Enhancements</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} ({optimizations.filter(o => o.status === 'available').length} available)
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-white/80">
            {appliedOptimizations.length} of {optimizations.length} optimizations applied
          </div>
          {optimizations.some(opt => opt.status === 'available') && (
            <button
              onClick={applyAllOptimizations}
              className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all duration-300"
            >
              Apply All
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <motion.div
            className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(appliedOptimizations.length / optimizations.length) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* Optimization List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {optimizations.map((optimization, index) => {
                const StatusIcon = getOptimizationStatusIcon(optimization.status)
                
                return (
                  <motion.div
                    key={optimization.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <optimization.icon className="h-4 w-4 text-white/60" />
                        <span className="text-sm font-medium text-white">{optimization.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${getOptimizationStatusColor(optimization.status)}`} />
                        {optimization.status === 'available' && (
                          <button
                            onClick={optimization.action}
                            className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs hover:bg-indigo-500/30 transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-white/60 mb-2">{optimization.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Lightbulb className="h-3 w-3 text-yellow-400" />
                      <span className="text-yellow-300">{optimization.benefit}</span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device Capabilities Summary */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs text-white/60 mb-2">Device Capabilities:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(deviceCapabilities).map(([key, supported]) => (
              <div
                key={key}
                className={`px-2 py-1 rounded text-xs ${
                  supported 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
