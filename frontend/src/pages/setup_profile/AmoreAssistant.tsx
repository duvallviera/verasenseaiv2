'use client'
import { useState } from 'react'
import { Bot, X, MessageCircle, Sparkles, Send, Heart } from 'lucide-react'
import { trackAmoreInteraction, trackEvent } from '@/lib/analytics/track'

interface AmoreAssistantProps {
  context: string
  variant: 'desktop' | 'mobile'
}

export default function AmoreAssistant({ context, variant }: AmoreAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: 'assistant',
      content: "Hi! I'm Amore, your AI dating assistant. I'm here to help you create an amazing profile that attracts your perfect match. Need help with your bio, choosing photos, or understanding what makes a great dating profile?"
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const profileTips = [
    "Write an authentic bio that shows your personality",
    "Choose photos that show different aspects of your life",
    "Be specific about your interests and hobbies",
    "Share what you're looking for in a relationship",
    "Use humor to show your personality"
  ]

  const handleAmoreChat = async (message: string) => {
    if (!message.trim()) return
    
    trackAmoreInteraction('message', { context, messageLength: message.length })
    setIsLoading(true)
    
    const newMessages = [...messages, { role: 'user' as const, content: message }]
    setMessages(newMessages)
    setInputMessage('')
    
    try {
      const response = await fetch('/api/agents/amore/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: context,
          sessionId: 'profile-setup-session'
        })
      })
      
      const result = await response.json()
      const assistantResponse = result.response || getContextualResponse(message)
      
      setMessages(prev => [...prev, 
        { role: 'assistant', content: assistantResponse }
      ])
      
      trackEvent('amore_response_received', { context, responseLength: assistantResponse.length })
    } catch (error) {
      console.error('Amore chat error:', error)
      setMessages(prev => [...prev, 
        { role: 'assistant', content: getContextualResponse(message) }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getContextualResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('bio') || lowerMessage.includes('about')) {
      return "Great question about bios! A compelling bio should be authentic and specific. Share what makes you unique, your passions, and what you're looking for. Avoid generic phrases like 'I love to laugh' - instead, share what actually makes you laugh! Keep it between 50-150 words."
    }
    
    if (lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
      return "Photos are crucial! Your main photo should be a clear, recent headshot with a genuine smile. Include photos that show your hobbies, lifestyle, and personality. Avoid group photos as your main pic, and make sure all photos are recent (within the last year)."
    }
    
    if (lowerMessage.includes('interest') || lowerMessage.includes('hobby')) {
      return "Interests help you connect with compatible matches! Be specific - instead of 'music,' mention your favorite genres or artists. Include both active and relaxing activities. This helps potential matches find common ground and conversation starters."
    }
    
    if (lowerMessage.includes('match') || lowerMessage.includes('relationship')) {
      return "Being clear about your relationship goals helps attract the right people. Whether you're looking for something casual, serious, or marriage-minded, honesty upfront saves everyone time and leads to better connections."
    }
    
    return "I'm here to help you create an amazing profile! Feel free to ask about writing your bio, choosing photos, selecting interests, or anything else about creating an attractive dating profile. What specific area would you like help with?"
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    trackAmoreInteraction(isOpen ? 'close' : 'open', { context, variant })
  }

  const sendQuickTip = (tip: string) => {
    handleAmoreChat(`Tell me more about: ${tip}`)
  }

  if (variant === 'mobile') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-80 h-96' : 'w-14 h-14'}`}>
        {isOpen ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-200 flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Amore AI</span>
              </div>
              <button
                onClick={toggleOpen}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close Amore Assistant"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Mobile Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Input */}
            <div className="p-4 border-t border-purple-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAmoreChat(inputMessage)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => handleAmoreChat(inputMessage)}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={toggleOpen}
            className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
            aria-label="Open Amore Assistant"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </button>
        )}
      </div>
    )
  }

  // Desktop version
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'w-96 h-[500px]' : 'w-16 h-16'}`}>
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-200 flex flex-col h-full">
          {/* Desktop Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Amore AI Assistant</h3>
                <p className="text-sm text-gray-600">Your dating profile expert</p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close Amore Assistant"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Quick Tips */}
          <div className="p-4 border-b border-purple-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Profile Tips:</h4>
            <div className="space-y-1">
              {profileTips.slice(0, 2).map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuickTip(tip)}
                  className="text-xs text-purple-600 hover:text-purple-700 block text-left hover:underline"
                >
                  💡 {tip}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Input */}
          <div className="p-4 border-t border-purple-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAmoreChat(inputMessage)}
                placeholder="Ask me about your profile..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => handleAmoreChat(inputMessage)}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleOpen}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group"
          aria-label="Open Amore Assistant"
        >
          <MessageCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
        </button>
      )}
    </div>
  )
}
