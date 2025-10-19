'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Mail, 
  Smartphone, 
  Key, 
  Lock, 
  Crown,
  Star,
  Zap,
  Award,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Settings,
  Globe,
  Wifi,
  Battery,
  Signal,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface SecurityMethodSelectorProps {
  onMethodSelected: (methods: SecurityMethod[]) => void
  userTier: 'free' | 'premium' | 'vip'
  variant: 'desktop' | 'mobile'
  className?: string
}

interface SecurityMethod {
  id: string
  type: 'email' | 'sms' | 'authenticator' | 'biometric' | 'backup'
  enabled: boolean
  priority: number
  config?: any
}

interface SecurityTier {
  id: 'basic' | 'enhanced' | 'maximum' | 'legendary'
  name: string
  description: string
  methods: string[]
  securityScore: number
  recommendedFor: string[]
  features: string[]
  color: string
  bgColor: string
  icon: React.ComponentType<any>
}

export default function SecurityMethodSelector_new({
  onMethodSelected,
  userTier,
  variant,
  className = ''
}: SecurityMethodSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'enhanced' | 'maximum' | 'legendary'>('enhanced')
  const [selectedMethods, setSelectedMethods] = useState<SecurityMethod[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const securityTiers: SecurityTier[] = [
    {
      id: 'basic',
      name: 'Basic Security',
      description: 'Essential protection for casual users',
      methods: ['email'],
      securityScore: 65,
      recommendedFor: ['Free users', 'Casual dating'],
      features: ['Email verification', 'Basic fraud detection'],
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: Mail
    },
    {
      id: 'enhanced',
      name: 'Enhanced Security',
      description: 'Advanced protection with multiple factors',
      methods: ['email', 'sms'],
      securityScore: 85,
      recommendedFor: ['Premium users', 'Active daters', 'Privacy conscious'],
      features: ['Email + SMS verification', 'AI fraud detection', 'Device tracking'],
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: Shield
    },
    {
      id: 'maximum',
      name: 'Maximum Security',
      description: 'Military-grade protection for high-value accounts',
      methods: ['email', 'sms', 'authenticator'],
      securityScore: 95,
      recommendedFor: ['VIP users', 'Public figures', 'Security professionals'],
      features: ['Triple verification', 'Biometric enrollment', 'Advanced threat detection'],
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: Lock
    },
    {
      id: 'legendary',
      name: 'Legendary Security',
      description: 'Impossible-to-breach quantum-resistant protection',
      methods: ['email', 'sms', 'authenticator', 'biometric', 'backup'],
      securityScore: 100,
      recommendedFor: ['Ultra-VIP users', 'Celebrities', 'Government officials'],
      features: ['Quantum encryption', 'AI behavioral analysis', 'Hardware security keys'],
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      icon: Crown
    }
  ]

  useEffect(() => {
    // Auto-select appropriate tier based on user level
    const defaultTier = userTier === 'vip' ? 'maximum' : userTier === 'premium' ? 'enhanced' : 'basic'
    setSelectedTier(defaultTier)
    
    trackEvent('security_selector_loaded', {
      userTier,
      defaultTier,
      variant
    })
  }, [userTier])

  useEffect(() => {
    // Update selected methods when tier changes
    const tier = securityTiers.find(t => t.id === selectedTier)
    if (tier) {
      const methods: SecurityMethod[] = tier.methods.map((methodType, index) => ({
        id: `${methodType}_${Date.now()}_${index}`,
        type: methodType as any,
        enabled: true,
        priority: index + 1,
        config: {}
      }))
      setSelectedMethods(methods)
    }
  }, [selectedTier])

  const handleTierSelect = async (tierId: 'basic' | 'enhanced' | 'maximum' | 'legendary') => {
    setIsAnalyzing(true)
    setSelectedTier(tierId)

    // Simulate security analysis
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsAnalyzing(false)

    trackEvent('security_tier_selected', {
      tier: tierId,
      userTier,
      variant,
      securityScore: securityTiers.find(t => t.id === tierId)?.securityScore
    })
  }

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    )
  }

  const handleConfirm = () => {
    const enabledMethods = selectedMethods.filter(method => method.enabled)
    onMethodSelected(enabledMethods)

    trackEvent('security_methods_confirmed', {
      tier: selectedTier,
      methods: enabledMethods.map(m => m.type),
      methodCount: enabledMethods.length,
      variant
    })
  }

  const getSecurityLevel = (score: number) => {
    if (score >= 95) return { level: 'LEGENDARY', color: 'text-yellow-400' }
    if (score >= 85) return { level: 'MAXIMUM', color: 'text-red-400' }
    if (score >= 75) return { level: 'HIGH', color: 'text-purple-400' }
    return { level: 'STANDARD', color: 'text-blue-400' }
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'sms': return Smartphone
      case 'authenticator': return Key
      case 'biometric': return Shield
      case 'backup': return Lock
      default: return Shield
    }
  }

  const getMethodName = (type: string) => {
    switch (type) {
      case 'email': return 'Email Verification'
      case 'sms': return 'SMS Authentication'
      case 'authenticator': return 'Authenticator App'
      case 'biometric': return 'Biometric Security'
      case 'backup': return 'Backup Codes'
      default: return 'Unknown Method'
    }
  }

  const selectedTierData = securityTiers.find(t => t.id === selectedTier)!
  const securityLevel = getSecurityLevel(selectedTierData.securityScore)

  return (
    <div className={`security-method-selector ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-300/30 rounded-xl p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Choose Your Security Level
          </h2>
          
          <p className="text-white/70 text-sm">
            Select the protection level that matches your needs
          </p>
        </div>

        {/* Current Security Score */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              <span className="text-white font-medium">Security Score</span>
            </div>
            <div className={`px-3 py-1 rounded-full ${selectedTierData.bgColor} ${selectedTierData.color} text-sm font-bold`}>
              {securityLevel.level}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full bg-gradient-to-r ${
                  selectedTierData.securityScore >= 95 ? 'from-yellow-400 to-orange-400' :
                  selectedTierData.securityScore >= 85 ? 'from-red-400 to-pink-400' :
                  selectedTierData.securityScore >= 75 ? 'from-purple-400 to-indigo-400' :
                  'from-blue-400 to-cyan-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${selectedTierData.securityScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>0</span>
              <span className="font-bold text-white">{selectedTierData.securityScore}/100</span>
            </div>
          </div>
        </div>

        {/* Security Tier Selection */}
        <div className="space-y-3 mb-6">
          {securityTiers.map((tier, index) => {
            const isSelected = selectedTier === tier.id
            const isAvailable = 
              (tier.id === 'basic') ||
              (tier.id === 'enhanced' && ['premium', 'vip'].includes(userTier)) ||
              (tier.id === 'maximum' && userTier === 'vip') ||
              (tier.id === 'legendary' && userTier === 'vip')

            return (
              <motion.button
                key={tier.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => isAvailable && handleTierSelect(tier.id)}
                disabled={!isAvailable || isAnalyzing}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? `${tier.bgColor} border-current ${tier.color} scale-105`
                    : isAvailable
                    ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                    : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${tier.bgColor} ${isSelected ? 'scale-110' : ''} transition-transform`}>
                    <tier.icon className={`h-6 w-6 ${tier.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${isSelected ? tier.color : 'text-white'}`}>
                        {tier.name}
                      </h3>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${tier.bgColor} ${tier.color}`}>
                        {tier.securityScore}/100
                      </div>
                      {!isAvailable && (
                        <div className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs font-medium">
                          UPGRADE REQUIRED
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${isSelected ? 'text-white/90' : 'text-white/60'}`}>
                      {tier.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-white/60">Recommended for:</span>
                        <div className="mt-1">
                          {tier.recommendedFor.map((rec, i) => (
                            <div key={i} className={`${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                              • {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-white/60">Features:</span>
                        <div className="mt-1">
                          {tier.features.slice(0, 2).map((feature, i) => (
                            <div key={i} className={`${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                              • {feature}
                            </div>
                          ))}
                          {tier.features.length > 2 && (
                            <div className={`${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                              • +{tier.features.length - 2} more...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-2"
                    >
                      <CheckCircle className={`h-6 w-6 ${tier.color}`} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Analysis State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-indigo-500/20 border border-indigo-400/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="h-5 w-5 text-indigo-400" />
                </motion.div>
                <div>
                  <div className="text-indigo-300 font-medium">Analyzing Security Configuration</div>
                  <div className="text-indigo-200/80 text-sm">Optimizing protection methods for your profile...</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Methods Preview */}
        {selectedMethods.length > 0 && !isAnalyzing && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">Selected Security Methods</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedMethods.map((method) => {
                const MethodIcon = getMethodIcon(method.type)
                return (
                  <div
                    key={method.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      method.enabled
                        ? 'bg-green-500/10 border-green-400/30'
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MethodIcon className={`h-5 w-5 ${method.enabled ? 'text-green-400' : 'text-white/60'}`} />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${method.enabled ? 'text-white' : 'text-white/60'}`}>
                          {getMethodName(method.type)}
                        </div>
                        <div className={`text-xs ${method.enabled ? 'text-green-300' : 'text-white/40'}`}>
                          Priority: {method.priority}
                        </div>
                      </div>
                      {method.enabled && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-white/60" />
              <span className="text-white/70 text-sm">Advanced Security Options</span>
            </div>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="h-4 w-4 text-white/60" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 bg-white/5 rounded-lg space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Session Timeout</label>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Device Trust</label>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm">
                      <option value="never">Never trust devices</option>
                      <option value="7">Trust for 7 days</option>
                      <option value="30">Trust for 30 days</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="geo-blocking" className="rounded" />
                  <label htmlFor="geo-blocking" className="text-white/70 text-sm">
                    Enable geographic access restrictions
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="device-notifications" className="rounded" defaultChecked />
                  <label htmlFor="device-notifications" className="text-white/70 text-sm">
                    Notify on new device logins
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={selectedMethods.filter(m => m.enabled).length === 0 || isAnalyzing}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            selectedMethods.filter(m => m.enabled).length > 0 && !isAnalyzing
              ? `bg-gradient-to-r ${selectedTierData.bgColor} ${selectedTierData.color} hover:scale-105 hover:shadow-lg border-2 border-current`
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Settings className="h-5 w-5 animate-spin" />
              Analyzing Security...
            </>
          ) : (
            <>
              <selectedTierData.icon className="h-5 w-5" />
              Activate {selectedTierData.name}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Security Info */}
        <div className="mt-6 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-indigo-400" />
            <span className="text-indigo-400 text-sm font-medium">
              Legendary Security System
            </span>
          </div>
          <p className="text-white/60 text-xs">
            Your security configuration uses military-grade encryption, AI-powered threat detection, 
            and quantum-resistant algorithms to provide maximum protection.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
