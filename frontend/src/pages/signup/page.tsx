'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AnalyticsWrapper from './components/AnalyticsWrapper'

export default function SignupAggregator() {
  const [variant, setVariant] = useState<'desktop' | 'mobile'>('desktop')
  const router = useRouter()

  useEffect(() => {
    // Detect device and route to appropriate variant
    const isMobile = window.innerWidth < 768
    const urlVariant = new URLSearchParams(window.location.search).get('v')
    
    if (urlVariant === 'desktop' || urlVariant === 'mobile') {
      setVariant(urlVariant)
    } else {
      setVariant(isMobile ? 'mobile' : 'desktop')
    }
    
    // Redirect to variant
    router.push(`${window.location.pathname}/${variant}${window.location.search}`)
  }, [router])

  return (
    <AnalyticsWrapper>
      <div className="bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p>Loading Create Account...</p>
        </div>
      </div>
    </AnalyticsWrapper>
  )
}
