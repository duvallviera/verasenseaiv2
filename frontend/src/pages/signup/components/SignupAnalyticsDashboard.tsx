'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Award,
  Zap,
  Eye,
  Heart,
  Shield,
  Brain,
  Smartphone,
  Monitor,
  Globe,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface SignupAnalyticsDashboardProps {
  variant: 'desktop' | 'mobile'
  className?: string
}

interface ComponentMetrics {
  name: string
  icon: React.ComponentType<any>
  usageCount: number
  engagementRate: number
  conversionImpact: number
  averageTime: number
  successRate: number
  userSatisfaction: number
}

interface PerformanceMetrics {
  totalSignups: number
  conversionRate: number
  averageCompletionTime: number
  dropOffRate: number
  featureAdoptionRate: number
  userSatisfactionScore: number
}

interface RealTimeStats {
  activeUsers: number
  signupsToday: number
  conversionRateToday: number
  topPerformingComponent: string
  averageSessionTime: number
}

export default function SignupAnalyticsDashboard({
  variant,
  className = ''
}: SignupAnalyticsDashboardProps) {
  const [componentMetrics, setComponentMetrics] = useState<ComponentMetrics[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h')

  useEffect(() => {
    loadAnalyticsData()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    
    try {
      // Simulate loading analytics data
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const components: ComponentMetrics[] = [
        {
          name: 'AIPhotoAnalyzer',
          icon: Brain,
          usageCount: Math.floor(Math.random() * 1000) + 500,
          engagementRate: Math.floor(Math.random() * 20) + 80,
          conversionImpact: Math.floor(Math.random() * 15) + 85,
          averageTime: Math.floor(Math.random() * 60) + 120,
          successRate: Math.floor(Math.random() * 10) + 90,
          userSatisfaction: Math.floor(Math.random() * 15) + 85
        },
        {
          name: 'CompatibilityPredictor',
          icon: Heart,
          usageCount: Math.floor(Math.random() * 800) + 400,
          engagementRate: Math.floor(Math.random() * 25) + 75,
          conversionImpact: Math.floor(Math.random() * 20) + 80,
          averageTime: Math.floor(Math.random() * 90) + 180,
          successRate: Math.floor(Math.random() * 12) + 88,
          userSatisfaction: Math.floor(Math.random() * 18) + 82
        },
        {
          name: 'AIValidationEngine',
          icon: Shield,
          usageCount: Math.floor(Math.random() * 1200) + 800,
          engagementRate: Math.floor(Math.random() * 15) + 85,
          conversionImpact: Math.floor(Math.random() * 10) + 90,
          averageTime: Math.floor(Math.random() * 30) + 60,
          successRate: Math.floor(Math.random() * 8) + 92,
          userSatisfaction: Math.floor(Math.random() * 12) + 88
        },
        {
          name: 'VoiceGuidedSignup',
          icon: Smartphone,
          usageCount: Math.floor(Math.random() * 600) + 300,
          engagementRate: Math.floor(Math.random() * 30) + 70,
          conversionImpact: Math.floor(Math.random() * 25) + 75,
          averageTime: Math.floor(Math.random() * 120) + 240,
          successRate: Math.floor(Math.random() * 15) + 85,
          userSatisfaction: Math.floor(Math.random() * 20) + 80
        },
        {
          name: 'SocialProfileImporter',
          icon: Globe,
          usageCount: Math.floor(Math.random() * 900) + 600,
          engagementRate: Math.floor(Math.random() * 18) + 82,
          conversionImpact: Math.floor(Math.random() * 12) + 88,
          averageTime: Math.floor(Math.random() * 45) + 90,
          successRate: Math.floor(Math.random() * 10) + 90,
          userSatisfaction: Math.floor(Math.random() * 15) + 85
        }
      ]

      const performance: PerformanceMetrics = {
        totalSignups: Math.floor(Math.random() * 5000) + 10000,
        conversionRate: Math.floor(Math.random() * 20) + 80,
        averageCompletionTime: Math.floor(Math.random() * 120) + 180,
        dropOffRate: Math.floor(Math.random() * 10) + 5,
        featureAdoptionRate: Math.floor(Math.random() * 15) + 85,
        userSatisfactionScore: Math.floor(Math.random() * 10) + 90
      }

      const realTime: RealTimeStats = {
        activeUsers: Math.floor(Math.random() * 500) + 200,
        signupsToday: Math.floor(Math.random() * 200) + 100,
        conversionRateToday: Math.floor(Math.random() * 25) + 75,
        topPerformingComponent: components[Math.floor(Math.random() * components.length)].name,
        averageSessionTime: Math.floor(Math.random() * 180) + 300
      }

      setComponentMetrics(components)
      setPerformanceMetrics(performance)
      setRealTimeStats(realTime)
      
      trackEvent('analytics_dashboard_loaded', {
        variant,
        timeframe: selectedTimeframe,
        componentsTracked: components.length
      })
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    const data = {
      componentMetrics,
      performanceMetrics,
      realTimeStats,
      exportedAt: new Date().toISOString(),
      timeframe: selectedTimeframe
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `signup-analytics-${selectedTimeframe}-${Date.now()}.json`
    a.click()
    
    trackEvent('analytics_data_exported', { variant, timeframe: selectedTimeframe })
  }

  const getMetricColor = (value: number, threshold: number = 80) => {
    if (value >= threshold + 15) return 'text-green-400'
    if (value >= threshold + 5) return 'text-blue-400'
    if (value >= threshold) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getMetricBgColor = (value: number, threshold: number = 80) => {
    if (value >= threshold + 15) return 'bg-green-400'
    if (value >= threshold + 5) return 'bg-blue-400'
    if (value >= threshold) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  return (
    <div className={`signup-analytics-dashboard ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800/50 to-gray-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-white">Signup Analytics</span>
            <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
              LIVE
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as '24h' | '7d' | '30d')}
              className="px-2 py-1 bg-slate-700 text-white rounded text-xs border border-slate-600"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
            
            <button
              onClick={loadAnalyticsData}
              disabled={isLoading}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={exportData}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <Download className="h-4 w-4 text-slate-400" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-300 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <BarChart3 className="h-6 w-6 text-slate-400" />
              </motion.div>
              <span className="text-sm text-white/80">Loading analytics...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Real-Time Stats */}
            {realTimeStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-green-400">
                    {realTimeStats.activeUsers}
                  </div>
                  <div className="text-xs text-slate-300">Active Users</div>
                </div>
                
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">
                    {realTimeStats.signupsToday}
                  </div>
                  <div className="text-xs text-slate-300">Signups Today</div>
                </div>
                
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">
                    {realTimeStats.conversionRateToday}%
                  </div>
                  <div className="text-xs text-slate-300">Conversion Rate</div>
                </div>
                
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-yellow-400">
                    {Math.floor(realTimeStats.averageSessionTime / 60)}m
                  </div>
                  <div className="text-xs text-slate-300">Avg Session</div>
                </div>
                
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs font-bold text-orange-400 truncate">
                    {realTimeStats.topPerformingComponent}
                  </div>
                  <div className="text-xs text-slate-300">Top Component</div>
                </div>
              </div>
            )}

            {/* Performance Overview */}
            {performanceMetrics && (
              <div className="p-4 bg-slate-700/20 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Performance Overview
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Signups:</span>
                    <span className="text-green-400 font-medium">
                      {performanceMetrics.totalSignups.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Conversion Rate:</span>
                    <span className={`font-medium ${getMetricColor(performanceMetrics.conversionRate)}`}>
                      {performanceMetrics.conversionRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Avg Completion:</span>
                    <span className="text-blue-400 font-medium">
                      {Math.floor(performanceMetrics.averageCompletionTime / 60)}m {performanceMetrics.averageCompletionTime % 60}s
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Drop-off Rate:</span>
                    <span className={`font-medium ${performanceMetrics.dropOffRate <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                      {performanceMetrics.dropOffRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Feature Adoption:</span>
                    <span className={`font-medium ${getMetricColor(performanceMetrics.featureAdoptionRate)}`}>
                      {performanceMetrics.featureAdoptionRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Satisfaction:</span>
                    <span className={`font-medium ${getMetricColor(performanceMetrics.userSatisfactionScore, 85)}`}>
                      {performanceMetrics.userSatisfactionScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Component Metrics */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-400" />
                    Component Performance
                  </h4>
                  
                  {componentMetrics.map((component, index) => (
                    <motion.div
                      key={component.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-slate-700/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <component.icon className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-white">{component.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300">
                            {component.usageCount.toLocaleString()} uses
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getMetricBgColor(component.successRate, 85)}`} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="text-center">
                          <div className={`font-bold ${getMetricColor(component.engagementRate)}`}>
                            {component.engagementRate}%
                          </div>
                          <div className="text-slate-400">Engagement</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`font-bold ${getMetricColor(component.conversionImpact)}`}>
                            +{component.conversionImpact}%
                          </div>
                          <div className="text-slate-400">Conversion</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold text-blue-400">
                            {Math.floor(component.averageTime / 60)}m
                          </div>
                          <div className="text-slate-400">Avg Time</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`font-bold ${getMetricColor(component.userSatisfaction, 85)}`}>
                            {component.userSatisfaction}%
                          </div>
                          <div className="text-slate-400">Satisfaction</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary Stats */}
            <div className="pt-3 border-t border-slate-600/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Eye className="h-4 w-4" />
                  <span>Tracking {componentMetrics.length} legendary components</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
