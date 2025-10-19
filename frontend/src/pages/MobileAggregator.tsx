'use client'

/**
 * 📱 MOBILE AGGREGATOR - Clean Version
 * Touch-optimized mobile experience with swipe gestures
 * Only background and aggregator functionality
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  CheckCircle, Shield, Target, Eye, Fingerprint, Award, Smartphone, ChevronRight, 
  Download, Share2, AlertTriangle, Loader2, Camera, Brain, Lock, 
  BarChart3, FileText, Users, Clock, Zap, Star, Settings, Database,
  Activity, Cpu, Network, TrendingUp, Menu, X, ChevronLeft, ChevronDown
} from 'lucide-react'

interface MobileAggregatorData {
  totalScans: number
  successRate: number
  averageProcessingTime: number
  activeUsers: number
  accuracy: number
  todayScans: number
}

interface MobileMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  icon: any
  color: string
}

export default function MobileAggregator() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'metrics' | 'status'>('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  
  const [aggregatorData, setAggregatorData] = useState<MobileAggregatorData>({
    totalScans: 15847,
    successRate: 98.5,
    averageProcessingTime: 2.3,
    activeUsers: 342,
    accuracy: 99.2,
    todayScans: 127
  })
  
  const [mobileMetrics, setMobileMetrics] = useState<MobileMetric[]>([
    { id: 'face-detection', name: 'Face Detection', value: 99.1, unit: '%', trend: 'up', icon: Target, color: 'from-blue-500 to-cyan-600' },
    { id: 'liveness', name: 'Liveness Check', value: 97.8, unit: '%', trend: 'stable', icon: Eye, color: 'from-green-500 to-emerald-600' },
    { id: 'quality', name: 'Image Quality', value: 94.5, unit: '%', trend: 'up', icon: Award, color: 'from-purple-500 to-violet-600' },
    { id: 'matching', name: 'Biometric Match', value: 96.2, unit: '%', trend: 'down', icon: Fingerprint, color: 'from-orange-500 to-red-600' },
    { id: 'security', name: 'Security Score', value: 98.9, unit: '%', trend: 'up', icon: Shield, color: 'from-pink-500 to-rose-600' },
    { id: 'processing', name: 'Process Time', value: 2.1, unit: 's', trend: 'down', icon: Clock, color: 'from-indigo-500 to-purple-600' }
  ])

  useEffect(() => {
    // Simulate mobile data loading
    setTimeout(() => setIsLoading(false), 1000)
    
    // Real-time updates optimized for mobile
    const interval = setInterval(() => {
      setAggregatorData(prev => ({
        ...prev,
        totalScans: prev.totalScans + Math.floor(Math.random() * 3),
        activeUsers: Math.max(300, prev.activeUsers + Math.floor(Math.random() * 4) - 2),
        todayScans: prev.todayScans + Math.floor(Math.random() * 2)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSwipe = useCallback((event: any, info: PanInfo) => {
    const threshold = 50
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && currentTab !== 'overview') {
        // Swipe right - go to previous tab
        const tabs = ['overview', 'metrics', 'status']
        const currentIndex = tabs.indexOf(currentTab)
        setCurrentTab(tabs[currentIndex - 1] as any)
      } else if (info.offset.x < 0 && currentTab !== 'status') {
        // Swipe left - go to next tab
        const tabs = ['overview', 'metrics', 'status']
        const currentIndex = tabs.indexOf(currentTab)
        setCurrentTab(tabs[currentIndex + 1] as any)
      }
    }
  }, [currentTab])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
      default: return <Activity className="w-3 h-3 text-yellow-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-4"
        >
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Mobile Aggregator...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 text-white">
      {/* Mobile Background - Simplified */}
      <div className="absolute inset-0 overflow-hidden sm:block hidden">
        <div className="absolute top-20 left-4 w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-10 blur-xl"></div>
        <div className="absolute bottom-20 right-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-10 blur-xl"></div>
      </div>

      {/* Mobile Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl relative z-20 sticky top-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Mobile Aggregator</h1>
              <p className="text-xs text-white/60">Real-time Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Live</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="px-4 pb-2">
          <div className="flex bg-white/5 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'status', label: 'Status' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  currentTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 z-30 p-4"
          >
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                <span>Start New Scan</span>
              </button>
              <button className="w-full bg-white/10 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button className="w-full bg-white/10 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable Content Container */}
      <motion.div
        className="relative z-10 px-4 py-6 pb-20"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipe}
        dragElastic={0.1}
      >
        <AnimatePresence mode="wait">
          {currentTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Key Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Total Scans</h3>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {(aggregatorData.totalScans / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-white/60">+{aggregatorData.todayScans} today</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Success Rate</h3>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {aggregatorData.successRate}%
                  </div>
                  <div className="text-xs text-green-400">Excellent</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Avg Time</h3>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {aggregatorData.averageProcessingTime}s
                  </div>
                  <div className="text-xs text-white/60">Processing</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Active Users</h3>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {aggregatorData.activeUsers}
                  </div>
                  <div className="text-xs text-white/60">Online now</div>
                </motion.div>
              </div>

              {/* Performance Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-400/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="font-semibold text-green-400">System Performance</div>
                    <div className="text-sm text-white/70">Optimal Operation</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">{aggregatorData.accuracy}%</div>
                <div className="text-sm text-white/80">Overall Accuracy Score</div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              >
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Start New Scan</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white/10 px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    <button className="bg-white/10 px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {currentTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold mb-4">Processing Metrics</h2>
              {mobileMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 ${
                    selectedMetric === metric.id ? 'ring-2 ring-purple-400' : ''
                  }`}
                  onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                        <metric.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{metric.name}</h3>
                        <p className="text-xs text-white/60">Real-time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${
                        selectedMetric === metric.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: metric.unit === '%' ? `${metric.value}%` : '70%' }}
                      transition={{ duration: 1, delay: 0.1 * index }}
                    />
                  </div>

                  <AnimatePresence>
                    {selectedMetric === metric.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <div className="text-sm text-white/80">
                          <p>Last 24h performance data for {metric.name.toLowerCase()}.</p>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="text-white/60">Min</div>
                              <div className="font-semibold">{(metric.value - 2).toFixed(1)}{metric.unit}</div>
                            </div>
                            <div>
                              <div className="text-white/60">Avg</div>
                              <div className="font-semibold">{metric.value}{metric.unit}</div>
                            </div>
                            <div>
                              <div className="text-white/60">Max</div>
                              <div className="font-semibold">{(metric.value + 1).toFixed(1)}{metric.unit}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {currentTab === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold mb-4">System Status</h2>
              
              {/* Service Status */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold mb-4 text-sm">Service Health</h3>
                <div className="space-y-3">
                  {[
                    { name: 'AI Models', status: 'operational', uptime: '99.9%', icon: Brain },
                    { name: 'Database', status: 'operational', uptime: '100%', icon: Database },
                    { name: 'Analytics', status: 'operational', uptime: '99.7%', icon: BarChart3 },
                    { name: 'API Gateway', status: 'operational', uptime: '99.8%', icon: Network }
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <service.icon className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-sm font-medium">{service.name}</div>
                          <div className="text-xs text-white/60 capitalize">{service.status}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-green-400 font-medium">{service.uptime}</div>
                        <div className="w-2 h-2 bg-green-400 rounded-full ml-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Pipeline */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold mb-4 text-sm">Processing Pipeline</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Face Detection', status: 'active', count: 1247, color: 'bg-green-400' },
                    { name: 'Liveness Check', status: 'active', count: 1198, color: 'bg-green-400' },
                    { name: 'Biometric Match', status: 'processing', count: 1156, color: 'bg-yellow-400' },
                    { name: 'Quality Analysis', status: 'active', count: 1089, color: 'bg-green-400' }
                  ].map((stage) => (
                    <div key={stage.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${stage.color} ${
                          stage.status === 'active' ? 'animate-pulse' : ''
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium">{stage.name}</div>
                          <div className="text-xs text-white/60 capitalize">{stage.status}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white/90">{stage.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Resources */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold mb-4 text-sm">System Resources</h3>
                <div className="space-y-4">
                  {[
                    { name: 'CPU Usage', value: 67, color: 'from-blue-500 to-cyan-600' },
                    { name: 'Memory', value: 45, color: 'from-green-500 to-emerald-600' },
                    { name: 'Storage', value: 23, color: 'from-purple-500 to-violet-600' },
                    { name: 'Network', value: 89, color: 'from-orange-500 to-red-600' }
                  ].map((resource) => (
                    <div key={resource.name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">{resource.name}</span>
                        <span className="font-semibold">{resource.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${resource.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${resource.value}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <Smartphone className="w-3 h-3" />
            <span>Swipe left/right to navigate</span>
          </div>
        </div>
      </div>
    </div>
  )
}

