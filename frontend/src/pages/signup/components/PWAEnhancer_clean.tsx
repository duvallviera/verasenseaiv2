'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface PWAEnhancerProps {
  variant: 'desktop' | 'mobile'
  className?: string
}

interface PWACapabilities {
  isInstallable: boolean
  isOfflineCapable: boolean
  hasNotifications: boolean
  hasWebShare: boolean
  hasGeolocation: boolean
}

export default function PWAEnhancer_clean({
  variant,
  className = ''
}: PWAEnhancerProps) {
  const [isClient, setIsClient] = useState(false)
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isOfflineCapable: false,
    hasNotifications: false,
    hasWebShare: false,
    hasGeolocation: false
  })
  
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
      
      const caps: PWACapabilities = {
        isInstallable: 'serviceWorker' in navigator,
        isOfflineCapable: 'serviceWorker' in navigator && 'caches' in window,
        hasNotifications: 'Notification' in window,
        hasWebShare: 'share' in navigator,
        hasGeolocation: 'geolocation' in navigator
      }
      
      setCapabilities(caps)
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone
      setIsInstalled(isStandalone)
      
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const getCapabilityScore = (): number => {
    const capabilityCount = Object.values(capabilities).filter(Boolean).length
    return (capabilityCount / Object.keys(capabilities).length) * 100
  }

  const capabilityScore = getCapabilityScore()

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return (
      <div className={`pwa-enhancer ${className}`}>
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <div className="h-5 w-5 bg-purple-400 rounded"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">PWA Features</h3>
              <p className="text-xs text-white/60">Loading app capabilities...</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-500/10">
                <div className="h-3 w-3 bg-gray-400 rounded"></div>
                <div className="h-3 bg-gray-400 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`pwa-enhancer ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-300/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-white">PWA Status</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                <CheckCircle className="h-3 w-3" />
                Installed
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                <Download className="h-3 w-3" />
                Web App
              </div>
            )}
          </div>
        </div>

        {/* Capability Score */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-white/10"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className="text-emerald-400"
                initial={{ strokeDasharray: "0 125.6" }}
                animate={{ strokeDasharray: `${(capabilityScore / 100) * 125.6} 125.6` }}
                transition={{ duration: 1.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-400">
                {Math.round(capabilityScore)}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-white mb-1">PWA Capabilities</div>
            <div className="text-xs text-white/60">
              {Object.values(capabilities).filter(Boolean).length} of {Object.keys(capabilities).length} features available
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-white">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(capabilities).map(([key, available]) => (
            <div
              key={key}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                available ? 'bg-green-500/10 text-green-300' : 'bg-gray-500/10 text-gray-400'
              }`}
            >
              {available ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              <span className="text-xs">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>

        {/* Offline Message */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-yellow-500/10 border border-yellow-300/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <WifiOff className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Offline Mode</span>
            </div>
            <p className="text-xs text-yellow-200">
              You're currently offline. Some features may be limited, but you can still complete signup!
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
