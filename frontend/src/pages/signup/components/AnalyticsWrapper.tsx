'use client'

import { useEffect, ReactNode } from 'react'
import { trackEvent, EVENTS } from '@/lib/analytics/track'
import { enqueueEmbedding } from '@/lib/embeddings/queue'

interface AnalyticsWrapperProps {
  children: ReactNode
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  useEffect(() => {
    // Track page view impression
    trackEvent(EVENTS.VIEW_IMPRESSION, {
      page: 'signup',
      variant: window.innerWidth >= 768 ? 'desktop' : 'mobile',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    })

    // Queue embedding for page visit
    enqueueEmbedding({
      kind: 'interaction',
      payload: {
        page_visit: 'signup',
        device_type: window.innerWidth >= 768 ? 'desktop' : 'mobile',
        timestamp: new Date().toISOString()
      },
      sessionId: getSessionId()
    })

    // Track time on page
    const startTime = Date.now()
    
    return () => {
      const timeSpent = Date.now() - startTime
      trackEvent('page_exit', {
        page: 'signup',
        timeSpent,
        variant: window.innerWidth >= 768 ? 'desktop' : 'mobile'
      })
    }
  }, [])

  return <>{children}</>
}

function getSessionId(): string {
  let sessionId = localStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}
