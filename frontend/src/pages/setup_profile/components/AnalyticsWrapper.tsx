'use client'
import { useEffect } from 'react'
import { trackPageView, trackEvent } from '@/lib/analytics/track'

interface AnalyticsWrapperProps {
  children: React.ReactNode
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  useEffect(() => {
    // Track comprehensive page impression
    trackPageView('setup_profile', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer: document.referrer,
      pageType: 'profile_setup'
    })

    // Track session start
    trackEvent('profile_setup_session_start', {
      sessionId: sessionStorage.getItem('4ulove_session_id'),
      timestamp: new Date().toISOString(),
      deviceType: window.innerWidth >= 768 ? 'desktop' : 'mobile'
    })

    // Track page visibility changes for engagement
    const handleVisibilityChange = () => {
      trackEvent('page_visibility_change', {
        visibilityState: document.visibilityState,
        timestamp: new Date().toISOString()
      })
    }

    // Track scroll depth for engagement metrics
    let maxScrollDepth = 0
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent
        if (scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          trackEvent('scroll_depth', {
            depth: scrollPercent,
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    // Track time spent on page
    const startTime = Date.now()
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime
      trackEvent('profile_setup_time_spent', {
        timeSpentMs: timeSpent,
        timeSpentMinutes: Math.round(timeSpent / 60000),
        timestamp: new Date().toISOString()
      })
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Track session end
      trackEvent('profile_setup_session_end', {
        sessionDuration: Date.now() - startTime,
        maxScrollDepth,
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  return <>{children}</>
}
