'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Github, 
  Download, 
  CheckCircle, 
  X, 
  AlertCircle,
  User,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Image,
  Shield,
  Sparkles
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface SocialProfileImporterProps {
  onImportComplete: (data: ImportedProfileData) => void
  onFieldUpdate: (field: string, value: string) => void
  variant: 'desktop' | 'mobile'
  className?: string
}

interface SocialPlatform {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  available: boolean
  description: string
  dataTypes: string[]
}

interface ImportedProfileData {
  platform: string
  firstName?: string
  lastName?: string
  email?: string
  dateOfBirth?: string
  location?: string
  occupation?: string
  bio?: string
  profileImage?: string
  interests?: string[]
  education?: string
  verified?: boolean
}

interface ImportProgress {
  step: string
  progress: number
  message: string
}

export default function SocialProfileImporter({
  onImportComplete,
  onFieldUpdate,
  variant,
  className = ''
}: SocialProfileImporterProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [importedData, setImportedData] = useState<ImportedProfileData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const platforms: SocialPlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      available: true,
      description: 'Import basic profile info, interests, and photos',
      dataTypes: ['Name', 'Email', 'Birthday', 'Location', 'Interests', 'Profile Photo']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      available: true,
      description: 'Import profile photos and bio information',
      dataTypes: ['Name', 'Bio', 'Profile Photo', 'Recent Photos']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-700 to-blue-800',
      available: true,
      description: 'Import professional information and education',
      dataTypes: ['Name', 'Email', 'Occupation', 'Education', 'Location']
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'from-gray-800 to-black',
      available: true,
      description: 'Import profile and interests from X platform',
      dataTypes: ['Name', 'Bio', 'Location', 'Interests']
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'from-gray-700 to-gray-900',
      available: true,
      description: 'Import developer profile and repositories',
      dataTypes: ['Name', 'Email', 'Bio', 'Location']
    }
  ]

  // Simulate social media import process
  const simulateImport = async (platform: string): Promise<ImportedProfileData> => {
    const steps = [
      { step: 'Connecting', progress: 20, message: `Connecting to ${platform}...` },
      { step: 'Authenticating', progress: 40, message: 'Authenticating your account...' },
      { step: 'Fetching', progress: 60, message: 'Fetching profile data...' },
      { step: 'Processing', progress: 80, message: 'Processing information...' },
      { step: 'Complete', progress: 100, message: 'Import complete!' }
    ]

    for (const step of steps) {
      setImportProgress(step)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Generate mock imported data based on platform
    const mockData: ImportedProfileData = {
      platform,
      ...generateMockData(platform)
    }

    return mockData
  }

  const generateMockData = (platform: string): Partial<ImportedProfileData> => {
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan']
    const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Davis']
    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ']
    const occupations = ['Software Engineer', 'Marketing Manager', 'Graphic Designer', 'Teacher', 'Consultant']
    
    const firstName = names[Math.floor(Math.random() * names.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

    switch (platform) {
      case 'facebook':
        return {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
          dateOfBirth: '1990-05-15',
          location: locations[Math.floor(Math.random() * locations.length)],
          bio: 'Love traveling, photography, and meeting new people! 📸✈️',
          interests: ['Photography', 'Travel', 'Music', 'Cooking', 'Fitness'],
          verified: true
        }

      case 'instagram':
        return {
          firstName,
          lastName,
          bio: '🌟 Living life to the fullest | 📷 Photography enthusiast | ✈️ Travel addict',
          interests: ['Photography', 'Fashion', 'Travel', 'Art', 'Food'],
          verified: false
        }

      case 'linkedin':
        return {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
          location: locations[Math.floor(Math.random() * locations.length)],
          occupation: occupations[Math.floor(Math.random() * occupations.length)],
          education: 'Bachelor of Science in Computer Science',
          bio: 'Passionate professional with 5+ years of experience in technology and innovation.',
          verified: true
        }

      case 'twitter':
        return {
          firstName,
          lastName,
          bio: '🚀 Tech enthusiast | 💡 Innovation lover | 🌍 Making the world better one tweet at a time',
          location: locations[Math.floor(Math.random() * locations.length)],
          interests: ['Technology', 'Innovation', 'Startups', 'AI', 'Social Media'],
          verified: Math.random() > 0.7
        }

      case 'github':
        return {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dev.com`,
          bio: '👨‍💻 Full-stack developer | 🔧 Open source contributor | ☕ Coffee-driven coding',
          location: locations[Math.floor(Math.random() * locations.length)],
          occupation: 'Software Developer',
          verified: true
        }

      default:
        return {
          firstName,
          lastName,
          bio: 'Excited to be here and meet new people!'
        }
    }
  }

  const handlePlatformSelect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    if (platform?.available) {
      setSelectedPlatform(platformId)
      trackEvent('social_import_platform_selected', {
        platform: platformId,
        variant
      })
    }
  }

  const handleImport = async () => {
    if (!selectedPlatform || !privacyConsent) return

    setIsImporting(true)
    
    try {
      const data = await simulateImport(selectedPlatform)
      setImportedData(data)
      setShowPreview(true)
      
      trackEvent('social_import_completed', {
        platform: selectedPlatform,
        dataFields: Object.keys(data).length,
        variant
      })
    } catch (error) {
      console.error('Import failed:', error)
      trackEvent('social_import_failed', {
        platform: selectedPlatform,
        error: error instanceof Error ? error.message : 'Unknown error',
        variant
      })
    } finally {
      setIsImporting(false)
      setImportProgress(null)
    }
  }

  const handleAcceptImport = () => {
    if (importedData) {
      // Update form fields with imported data
      if (importedData.firstName) onFieldUpdate('firstName', importedData.firstName)
      if (importedData.lastName) onFieldUpdate('lastName', importedData.lastName)
      if (importedData.email) onFieldUpdate('email', importedData.email)
      if (importedData.dateOfBirth) onFieldUpdate('dateOfBirth', importedData.dateOfBirth)

      onImportComplete(importedData)
      setShowPreview(false)
      setSelectedPlatform(null)
      setImportedData(null)
      
      trackEvent('social_import_accepted', {
        platform: importedData.platform,
        fieldsImported: Object.keys(importedData).filter(key => importedData[key as keyof ImportedProfileData]).length,
        variant
      })
    }
  }

  const handleRejectImport = () => {
    if (importedData) {
      trackEvent('social_import_rejected', {
        platform: importedData.platform,
        variant
      })
    }
    
    setShowPreview(false)
    setSelectedPlatform(null)
    setImportedData(null)
  }

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`social-profile-importer ${className}`}>
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 bg-purple-400 rounded"></div>
            <span className="text-sm font-medium text-white">Quick Profile Import</span>
            <div className="h-4 w-4 bg-yellow-400 rounded"></div>
          </div>
          <p className="text-sm text-white/80 mb-4">Loading social platforms...</p>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/20">
                <div className="p-2 rounded-lg bg-white/10">
                  <div className="h-5 w-5 bg-white/20 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded mb-1"></div>
                  <div className="h-3 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`social-profile-importer ${className}`}>
      {/* Platform Selection */}
      {!selectedPlatform && !showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-300/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-white">Quick Profile Import</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          
          <p className="text-sm text-white/80 mb-4">
            Import your profile information from social media to speed up registration
          </p>

          <div className="grid grid-cols-1 gap-3 mb-4">
            {platforms.map((platform) => (
              <motion.button
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                disabled={!platform.available}
                whileHover={platform.available ? { scale: 1.02 } : {}}
                whileTap={platform.available ? { scale: 0.98 } : {}}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  platform.available
                    ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 cursor-pointer'
                    : 'bg-gray-500/10 border-gray-500/20 cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${platform.color}`}>
                  <platform.icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{platform.name}</span>
                    {!platform.available && (
                      <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60">{platform.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {platform.dataTypes.slice(0, 3).map((type) => (
                      <span key={type} className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">
                        {type}
                      </span>
                    ))}
                    {platform.dataTypes.length > 3 && (
                      <span className="text-xs text-white/50">
                        +{platform.dataTypes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                {platform.available && (
                  <Download className="h-4 w-4 text-white/60" />
                )}
              </motion.button>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-300/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-300 font-medium mb-1">Privacy & Security</p>
                <p className="text-xs text-blue-200/80">
                  We only import basic profile information. Your social media passwords and private data remain secure.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Import Configuration */}
      {selectedPlatform && !isImporting && !showPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-300/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            {platforms.find(p => p.id === selectedPlatform)?.icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-r ${platforms.find(p => p.id === selectedPlatform)?.color}`}>
                {React.createElement(platforms.find(p => p.id === selectedPlatform)!.icon, { className: "h-4 w-4 text-white" })}
              </div>
            )}
            <span className="text-sm font-medium text-white">
              Import from {platforms.find(p => p.id === selectedPlatform)?.name}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="privacy-consent" className="text-xs text-white/80">
                I consent to importing my profile data from{' '}
                {platforms.find(p => p.id === selectedPlatform)?.name} to pre-fill my 4uLove profile.
                I understand that only basic profile information will be imported and my account credentials remain secure.
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="flex-1 py-3 bg-gray-500/20 text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-500/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!privacyConsent}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Import Profile
            </button>
          </div>
        </motion.div>
      )}

      {/* Import Progress */}
      {isImporting && importProgress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-300/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Download className="h-5 w-5 text-green-400" />
            </motion.div>
            <span className="text-sm font-medium text-white">Importing Profile...</span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/80">{importProgress.message}</span>
              <span className="text-sm text-green-400">{importProgress.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${importProgress.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <p className="text-xs text-white/60 text-center">
            Please wait while we securely import your profile information...
          </p>
        </motion.div>
      )}

      {/* Import Preview */}
      <AnimatePresence>
        {showPreview && importedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-green-500/10 to-purple-500/10 backdrop-blur-sm border border-green-300/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-white">Profile Import Preview</span>
              {importedData.verified && (
                <div className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  <Shield className="h-3 w-3" />
                  Verified Account
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {importedData.firstName && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-white/60" />
                  <div>
                    <div className="text-sm text-white/80">Name</div>
                    <div className="text-sm text-white font-medium">
                      {importedData.firstName} {importedData.lastName}
                    </div>
                  </div>
                </div>
              )}

              {importedData.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-white/60" />
                  <div>
                    <div className="text-sm text-white/80">Email</div>
                    <div className="text-sm text-white font-medium">{importedData.email}</div>
                  </div>
                </div>
              )}

              {importedData.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <div>
                    <div className="text-sm text-white/80">Date of Birth</div>
                    <div className="text-sm text-white font-medium">{importedData.dateOfBirth}</div>
                  </div>
                </div>
              )}

              {importedData.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-white/60" />
                  <div>
                    <div className="text-sm text-white/80">Location</div>
                    <div className="text-sm text-white font-medium">{importedData.location}</div>
                  </div>
                </div>
              )}

              {importedData.occupation && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-white/60" />
                  <div>
                    <div className="text-sm text-white/80">Occupation</div>
                    <div className="text-sm text-white font-medium">{importedData.occupation}</div>
                  </div>
                </div>
              )}

              {importedData.bio && (
                <div className="flex items-start gap-3">
                  <Heart className="h-4 w-4 text-white/60 mt-1" />
                  <div>
                    <div className="text-sm text-white/80">Bio</div>
                    <div className="text-sm text-white font-medium">{importedData.bio}</div>
                  </div>
                </div>
              )}

              {importedData.interests && importedData.interests.length > 0 && (
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-white/60 mt-1" />
                  <div>
                    <div className="text-sm text-white/80">Interests</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {importedData.interests.map((interest) => (
                        <span key={interest} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectImport}
                className="flex-1 py-3 bg-red-500/20 text-red-300 rounded-lg font-medium text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={handleAcceptImport}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Use This Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
