'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AnalyticsWrapper from './components/AnalyticsWrapper'
import { trackPageView, initializeAnalytics } from '@/lib/analytics/track'

export default function SetupProfileAggregator() {
  const [variant, setVariant] = useState<'desktop' | 'mobile'>('desktop')
  const router = useRouter()

  useEffect(() => {
    // Initialize analytics
    initializeAnalytics()
    
    // Track page view with comprehensive data
    trackPageView('setup_profile-aggregator', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer: document.referrer,
      pageType: 'profile_setup_aggregator'
    })

    // Detect device and route to appropriate variant
    const isMobile = window.innerWidth < 768
    const urlVariant = new URLSearchParams(window.location.search).get('v')
    
    if (urlVariant === 'desktop' || urlVariant === 'mobile') {
      setVariant(urlVariant)
    } else {
      setVariant(isMobile ? 'mobile' : 'desktop')
    }
    
    // Redirect to variant with analytics tracking
    const targetPath = `${window.location.pathname}/${variant}${window.location.search}`
    router.push(targetPath)
    
  }, [router])

  return (
    <AnalyticsWrapper>
      <div className="bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background decorations - EXACT POSITIONING per master spec */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-2xl"></div>
        </div>
        
        <div className="text-white text-center relative z-10">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Loading Profile Setup</h2>
          <p className="text-xl text-white/90 leading-relaxed">Preparing your personalized dating experience...</p>
          <div className="mt-4 text-sm font-semibold text-white/80 uppercase tracking-wide">
            Redirecting to {variant} version
          </div>
        </div>
      </div>
    </AnalyticsWrapper>
  )
}
