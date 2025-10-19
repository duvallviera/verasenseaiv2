/**
 * 🎯 LOGIN AGGREGATOR - ZERO SHARED CODE
 * 
 * Expert Team:
 * - Solution Architect (30y) - Zero-contamination architecture
 * - Next.js Architect (34y) - Fast routing & performance
 * - Security Engineer (30y) - Secure device detection
 * 
 * This aggregator has ZERO shared code between mobile/desktop.
 * It only detects and routes - no business logic.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { detectDevice } from '@/utils/deviceDetection'

export default function LoginAggregator() {
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const route = async () => {
      try {
        // Enhanced device detection with comprehensive analysis
        const device = await detectDevice({
          respectUrlParam: true,
          useSessionStorage: true,
          checkBiometric: true,
        })
        
        // Priority: URL param > Session > Device detection > Default
        const urlVariant = new URLSearchParams(window.location.search).get('v')
        const targetVariant = urlVariant === 'mobile' || urlVariant === 'desktop' 
          ? urlVariant 
          : device.platform
        
        // Store device preference for consistency
        sessionStorage.setItem('device_variant', targetVariant)
        
        // Log detection result for analytics
        console.log('🎯 Device Detection:', {
          platform: targetVariant,
          os: device.os,
          browser: device.browser,
          biometric: device.biometricAvailable,
          touch: device.touchEnabled,
        })
        
        // Fast redirect (no delay - performance optimized)
        router.replace(`/login/${targetVariant}${window.location.search}`)
        
      } catch (error) {
        console.error('❌ Device detection failed:', error)
        // Graceful fallback to desktop
        router.replace('/login/desktop')
      } finally {
        setIsReady(true)
      }
    }

    route()
  }, [router])

  // Minimal loading UI - optimized for fast perception
  // 🎨 4uLove Visual System - STRICT Implementation
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 relative overflow-hidden">
      {/* 🌌 Floating Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-2xl"></div>
      </div>
      
      <div className="text-center text-white relative z-10">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-base font-medium">Loading...</p>
      </div>
    </div>
  )
}
